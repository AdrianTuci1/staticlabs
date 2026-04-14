import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { clsx } from 'clsx';
import {
    Activity,
    Box,
    Code2,
    Database,
    FolderKanban,
    Globe,
    LayoutDashboard,
    Pencil,
    RefreshCw,
    Play,
    Sparkles
} from 'lucide-react';
import { useStore } from './MockStoreProvider';
import { FeatureMindMapStore } from './FeatureMindMapStore';
import './DetachedMindMap.css';

const NODE_LAYOUT = {
    source: { width: 272, anchor: 'right' },
    action: { width: 220, anchor: 'center' },
    category: { width: 260, anchor: 'left' },
    group: { width: 250, anchor: 'left' },
    card: { width: 268, anchor: 'left' },
    idea: { width: 220, anchor: 'left' }
};

const SOURCE_ICON_BY_TYPE = {
    db: Database,
    database: Database,
    warehouse: Database,
    sql: Database,
    api: Globe,
    http: Globe,
    crm: Globe,
    ga4: Globe,
    facebook_ads: Globe,
    shopify: Globe,
    tiktok_ads: Globe,
    stripe: Globe,
    hubspot: Globe,
    stream: Activity,
    kafka: Activity,
    events: Activity
};

const COLUMN_STATUS_TEXT_TONES = {
    ok: 'text-accent',
    active: 'text-accent',
    warning: 'text-warning',
    error: 'text-danger'
};

const CARD_SURFACE_CLASS = 'node-surface';
const CARD_ICON_SURFACE_CLASS = 'node-icon-container';

const getNodeFrame = (node) => {
    const config = NODE_LAYOUT[node?.type] || NODE_LAYOUT.idea;

    if (config.anchor === 'right') {
        return {
            left: node.x - config.width,
            right: node.x,
            centerY: node.y,
            width: config.width
        };
    }

    if (config.anchor === 'left') {
        return {
            left: node.x,
            right: node.x + config.width,
            centerY: node.y,
            width: config.width
        };
    }

    return {
        left: node.x - (config.width / 2),
        right: node.x + (config.width / 2),
        centerY: node.y,
        width: config.width
    };
};

const getPortPosition = (node, side) => {
    const frame = getNodeFrame(node);

    return {
        x: side === 'left' ? frame.left : frame.right,
        y: frame.centerY
    };
};

const buildEdgePath = (store, edge) => {
    const sourceNode = store.ui.positionedNodeMap.get(edge.sourceId) || store.data.nodeMap.get(edge.sourceId);
    const targetNode = store.ui.positionedNodeMap.get(edge.targetId) || store.data.nodeMap.get(edge.targetId);
    const source = sourceNode ? getPortPosition(sourceNode, 'right') : edge.source;
    const target = targetNode ? getPortPosition(targetNode, 'left') : edge.target;
    const controlOffset = Math.max(56, Math.abs(target.x - source.x) * 0.32);

    return `M ${source.x} ${source.y}
        C ${source.x + controlOffset} ${source.y},
          ${target.x - controlOffset} ${target.y},
          ${target.x} ${target.y}`;
};

const buildPreviewEdgePath = (sourceNode, ghostNode) => {
    const source = getPortPosition(sourceNode, 'right');
    const target = getPortPosition(ghostNode, 'left');
    const controlOffset = Math.max(56, Math.abs(target.x - source.x) * 0.32);

    return `M ${source.x} ${source.y}
        C ${source.x + controlOffset} ${source.y},
          ${target.x - controlOffset} ${target.y},
          ${target.x} ${target.y}`;
};

const NodePorts = ({ showInput = true, showOutput = true }) => (
    <>
        {showInput && (
            <div className="port-input">
                <div className="port-dot">
                    <div className="port-inner" />
                </div>
            </div>
        )}
        {showOutput && (
            <div className="port-output">
                <div className="port-dot port-dot--output">
                    <div className="port-inner port-inner--output" />
                </div>
            </div>
        )}
    </>
);

const renderSourceIcon = (iconType, className) => {
    const sourceType = String(iconType || '').toLowerCase();

    if (SOURCE_ICON_BY_TYPE[sourceType] === Database) {
        return <Database size={19} className={className} />;
    }

    if (SOURCE_ICON_BY_TYPE[sourceType] === Globe) {
        return <Globe size={19} className={className} />;
    }

    if (SOURCE_ICON_BY_TYPE[sourceType] === Activity) {
        return <Activity size={19} className={className} />;
    }

    return <Box size={19} className={className} />;
};

const getNodeStateClasses = (viewModel, isDiscovering) => clsx(
    'mindmap-node',
    isDiscovering && 'mindmap-node--discovering',
    viewModel.isDimmed ? 'mindmap-node--dimmed' : 'mindmap-node--active',
    viewModel.isTraceActive && !viewModel.isDimmed && 'mindmap-node--trace-active'
);

const ContextMenu = ({ store }) => {
    const activeMenu = store.ui.activeMenu;

    if (!activeMenu) {
        return null;
    }

    return (
        <div
            data-mindmap-interactive="true"
            className="mindmap-context-menu"
            style={store.ui.getViewportStyle(activeMenu.x, activeMenu.y, activeMenu.transform)}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
        >
            {activeMenu.actions.map((action) => {
                const Icon = action.icon;

                return (
                    <button
                        key={action.id}
                        type="button"
                        className="context-menu-item"
                        onClick={(event) => {
                            event.stopPropagation();
                            store.ui.clearActiveMenu();
                            action.onSelect();
                        }}
                    >
                        {Icon && <Icon size={13} className="context-menu-icon" />}
                        <span>{action.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

const EmptyState = () => (
    <div className="mindmap-empty-state">
        <div className="empty-state-card">
            <div className="empty-state-icon-box">
                <Database size={32} className="text-sky-200" style={{ opacity: 0.6 }} />
            </div>
            <h3 className="empty-state-title">No Data Discovered Yet</h3>
            <p className="empty-state-text">
                Connect a source and the map will populate as layers become available.
            </p>
        </div>
    </div>
);

const PendingPreview = ({ store }) => {
    const preview = store.ui.pendingPreview;

    if (!preview) {
        return null;
    }

    return (
        <div
            className="mindmap-pending-preview"
            style={{ left: preview.ghostNode.x, top: preview.ghostNode.y }}
        >
            <div className="preview-surface">
                <NodePorts showInput={true} showOutput={true} />
                <div className="flex items-start gap-3">
                    <div className="node-icon-container" style={{ borderColor: 'rgba(110, 231, 183, 0.3)', background: '#1E2A24' }}>
                        <Sparkles size={17} className="text-emerald-200" />
                    </div>
                    <div className="node-content">
                        <div className="node-title">{preview.ghostNode.label}</div>
                        <div className="node-subtitle" style={{ color: 'rgba(209, 250, 229, 0.8)' }}>
                            Preparing virtual flow...
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const INSIGHT_NODE_WIDTH = 236;

const InsightDock = observer(({ store }) => {
    const insightNodes = store.data.layout.nodes
        .filter((node) => node.type === 'card')
        .map((node) => store.ui.positionedNodeMap.get(node.id) || node);

    if (insightNodes.length === 0) {
        return null;
    }

    const minY = Math.min(...insightNodes.map((node) => node.y));
    const insightColumnCenterX = (
        insightNodes.reduce((total, node) => total + node.x + (INSIGHT_NODE_WIDTH / 2), 0) / insightNodes.length
    );
    const isEditing = store.ui.isInsightDockEditing;

    return (
        <div
            data-mindmap-interactive="true"
            className="insight-dock-container"
            style={{ left: insightColumnCenterX, top: minY - 128 }}
            onMouseDown={(event) => event.stopPropagation()}
            onClick={(event) => event.stopPropagation()}
        >
            <button
                type="button"
                className={clsx(
                    'insight-dock-btn',
                    isEditing && 'insight-dock-btn--active'
                )}
                onClick={(event) => {
                    event.stopPropagation();
                    store.ui.toggleInsightDockEditing();
                }}
                aria-label="Manage insight groups"
                title="Manage insight groups"
                aria-expanded={isEditing}
            >
                <Pencil size={14} />
            </button>
        </div>
    );
});

const SourceNode = ({ store, viewModel }) => {
    const { node, sourceLoadState, hasIncoming, hasOutgoing } = viewModel;
    const isPendingPreview = store.ui.pendingPreviewSourceId === node.id;

    return (
        <div
            data-mindmap-interactive="true"
            className={clsx(
                'node--source',
                getNodeStateClasses(viewModel, store.data.isDiscovering)
            )}
            style={{ left: node.x, top: node.y }}
            onMouseEnter={() => store.ui.setHoveredNodeId(node.id)}
            onMouseLeave={store.ui.clearHoveredNode}
        >
            <div className="relative">
                <div
                    ref={(element) => store.ui.measureNode(node.id, element)}
                    className={CARD_SURFACE_CLASS}
                    onClick={() => store.handleNodeClick(node)}
                    onContextMenu={(event) => store.openNodeMenu(event, node)}
                >
                    <NodePorts showInput={hasIncoming} showOutput={hasOutgoing || isPendingPreview} />
                    <div className="flex items-start gap-3">
                        <div className={CARD_ICON_SURFACE_CLASS}>
                            {renderSourceIcon(node.iconType, 'text-sky-200')}
                        </div>
                        <div className="node-content">
                            <div className="node-title">{node.label}</div>
                            <div className="node-subtitle">{String(node.iconType || '').toUpperCase()}</div>
                        </div>
                    </div>
                </div>

                {!sourceLoadState?.isLoaded && !isPendingPreview && (
                    <button
                        type="button"
                        className="source-play-btn"
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            store.handlePendingLayerAction(event, node);
                        }}
                        aria-label={sourceLoadState.buttonLabel}
                        title={sourceLoadState.buttonLabel}
                    >
                        <Play size={18} fill="currentColor" />
                    </button>
                )}
            </div>
        </div>
    );
};

const ActionNode = ({ store, viewModel }) => {
    const { node, hasIncoming, hasOutgoing } = viewModel;

    return (
        <div
            data-mindmap-interactive="true"
            className={clsx(
                'node--action',
                getNodeStateClasses(viewModel, store.data.isDiscovering)
            )}
            style={{ left: node.x, top: node.y }}
            onClick={() => store.handleNodeClick(node)}
            onContextMenu={(event) => store.openNodeMenu(event, node)}
            onMouseEnter={() => store.ui.setHoveredNodeId(node.id)}
            onMouseLeave={store.ui.clearHoveredNode}
        >
            <div
                ref={(element) => store.ui.measureNode(node.id, element)}
                className={CARD_SURFACE_CLASS}
            >
                <NodePorts showInput={hasIncoming} showOutput={hasOutgoing} />
                <div className="flex items-center gap-3">
                    <div className={CARD_ICON_SURFACE_CLASS}>
                        <Code2 size={18} className="text-sky-200" />
                    </div>
                    <div className="node-content">
                        <div className="node-title">{node.label}</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const GoldNode = ({ store, viewModel }) => {
    const { node, description, childIds, isClickableCategory, hasIncoming, hasOutgoing } = viewModel;
    const columns = node.data?.columns || [];

    return (
        <div
            data-mindmap-interactive="true"
            className={clsx(
                'node--category',
                isClickableCategory && !store.data.isDiscovering && 'cursor-pointer',
                getNodeStateClasses(viewModel, store.data.isDiscovering)
            )}
            style={{ left: node.x, top: node.y }}
            onClick={() => (isClickableCategory ? store.toggleGroup(childIds) : store.handleNodeClick(node))}
            onContextMenu={(event) => store.openNodeMenu(event, node)}
            onMouseEnter={() => store.ui.setHoveredNodeId(node.id)}
            onMouseLeave={store.ui.clearHoveredNode}
        >
            <div className={CARD_SURFACE_CLASS} ref={(element) => store.ui.measureNode(node.id, element)}>
                <NodePorts showInput={hasIncoming} showOutput={hasOutgoing} />
                <div className="flex items-start gap-3">
                    <div className={CARD_ICON_SURFACE_CLASS}>
                        <Sparkles size={17} className="text-fuchsia-200" />
                    </div>
                    <div className="node-content">
                        <div className="node-title">{node.label}</div>
                        {description && (
                            <div className="node-description">
                                {description}
                            </div>
                        )}
                        {columns.length > 0 && (
                            <div className="node-fields">
                                {columns.map((column, index) => (
                                    <React.Fragment key={`${node.id}-${column.id || column.name}-${index}`}>
                                        <span className={COLUMN_STATUS_TEXT_TONES[column.status] || COLUMN_STATUS_TEXT_TONES.ok}>
                                            {column.title || column.name}
                                        </span>
                                        {index < columns.length - 1 && <span className="field-separator">, </span>}
                                    </React.Fragment>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const GroupNode = ({ store, viewModel }) => {
    const { node, hasIncoming, hasOutgoing } = viewModel;

    return (
        <div
            data-mindmap-interactive="true"
            className={clsx('node--group', getNodeStateClasses(viewModel, store.data.isDiscovering))}
            style={{ left: node.x, top: node.y }}
            onClick={() => store.handleNodeClick(node)}
            onContextMenu={(event) => store.openNodeMenu(event, node)}
            onMouseEnter={() => store.ui.setHoveredNodeId(node.id)}
            onMouseLeave={store.ui.clearHoveredNode}
        >
            <div
                ref={(element) => store.ui.measureNode(node.id, element)}
                className={CARD_SURFACE_CLASS}
            >
                <NodePorts showInput={hasIncoming} showOutput={hasOutgoing} />
                <div className="flex items-center gap-3">
                    <div className={CARD_ICON_SURFACE_CLASS}>
                        <FolderKanban size={17} className="text-emerald-200" />
                    </div>
                    <div className="node-content">
                        <div className="node-title">{node.label}</div>
                        <div className="node-subtitle">
                            {node.data?.activationMode || node.data?.activation_mode || ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InsightNode = observer(({ store, viewModel }) => {
    const { node, hasIncoming, hasOutgoing } = viewModel;
    const isVisible = store.ui.isInsightVisible(node.id);
    const RecommendationIcon = viewModel.isRecommended ? Sparkles : null;
    const isPendingCreation = viewModel.isPendingCreation;
    const isCreating = store.ui.isInsightCreating(node.id);

    return (
        <div
            data-mindmap-interactive="true"
            className={clsx(
                'node--card',
                getNodeStateClasses(viewModel, store.data.isDiscovering),
                !isVisible && 'node--card-hidden'
            )}
            style={{ left: node.x, top: node.y }}
            onClick={() => store.handleNodeClick(node)}
            onContextMenu={(event) => store.openNodeMenu(event, node)}
            onMouseEnter={() => store.ui.setHoveredNodeId(node.id)}
            onMouseLeave={store.ui.clearHoveredNode}
        >
            <div
                ref={(element) => store.ui.measureNode(node.id, element)}
                className={clsx(
                    CARD_SURFACE_CLASS,
                    !isVisible && 'node-surface--card-hidden',
                    isPendingCreation && 'node-surface--pending'
                )}
            >
                <NodePorts showInput={hasIncoming} showOutput={hasOutgoing} />
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        CARD_ICON_SURFACE_CLASS,
                        isPendingCreation && 'icon-box--pending'
                    )}>
                        <LayoutDashboard size={17} className={clsx(!isPendingCreation && 'text-sky-200')} style={isPendingCreation ? { color: '#6F7C88' } : {}} />
                    </div>
                    <div className="node-content self-center">
                        <div className={clsx(
                            'node-title',
                            isPendingCreation && 'node-title--pending'
                        )} style={{ whiteSpace: 'normal' }}>
                            {node.label}
                        </div>
                        {isPendingCreation && (
                            <div className="pending-indicator">
                                <div className="pending-indicator-bar-1" />
                                <div className="pending-indicator-bar-2" />
                            </div>
                        )}
                    </div>
                </div>

                {RecommendationIcon && (
                    <div
                        className="recommendation-mark"
                        title="AI recommendation"
                    >
                        <RecommendationIcon size={17} />
                    </div>
                )}

                {isPendingCreation && (
                    <button
                        type="button"
                        className={clsx(
                            'create-insight-btn',
                            isCreating && 'create-insight-btn--creating'
                        )}
                        style={{ left: RecommendationIcon ? 'calc(100% + 64px)' : 'calc(100% + 16px)' }}
                        onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            store.createRecommendedInsight(node.id);
                        }}
                        aria-label="Create insight"
                        title="Create insight"
                    >
                        {isCreating ? (
                            <RefreshCw size={17} className="animate-spin" />
                        ) : (
                            <Play size={17} fill="currentColor" />
                        )}
                    </button>
                )}

            </div>
        </div>
    );
});

const FieldNode = ({ store, viewModel }) => {
    const { node, isSelected, hasIncoming, hasOutgoing } = viewModel;

    return (
        <div
            data-mindmap-interactive="true"
            className={clsx('node--field', getNodeStateClasses(viewModel, store.data.isDiscovering))}
            style={{ left: node.x, top: node.y }}
            onClick={() => store.toggleSelection(node.id)}
            onContextMenu={(event) => store.openNodeMenu(event, node)}
            onMouseEnter={() => store.ui.setHoveredNodeId(node.id)}
            onMouseLeave={store.ui.clearHoveredNode}
        >
            <div className={clsx(
                CARD_SURFACE_CLASS,
                isSelected && 'node-surface--selected'
            )}
            ref={(element) => store.ui.measureNode(node.id, element)}
            >
                <NodePorts showInput={hasIncoming} showOutput={hasOutgoing} />
                <div className="flex items-center gap-3">
                    <div className={clsx(
                        'selection-dot',
                        isSelected && 'selection-dot--selected'
                    )} />
                    <div className="node-content">
                        <div className={clsx(
                            'node-title',
                            isSelected ? 'node-title--selected' : 'node-title--unselected'
                        )}>
                            {node.label}
                        </div>
                        {node.data?.type && (
                            <div className="node-subtitle" style={{ color: '#8C98A4' }}>{node.data.type}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MindMapNode = ({ store, viewModel }) => {
    switch (viewModel.node.type) {
        case 'source':
            return <SourceNode store={store} viewModel={viewModel} />;
        case 'action':
            return <ActionNode store={store} viewModel={viewModel} />;
        case 'category':
            return <GoldNode store={store} viewModel={viewModel} />;
        case 'group':
            return <GroupNode store={store} viewModel={viewModel} />;
        case 'card':
            return <InsightNode store={store} viewModel={viewModel} />;
        default:
            return <FieldNode store={store} viewModel={viewModel} />;
    }
};

const FeatureMindMap = observer(({ onNodeClick, showCosts = false }) => {
    const { workspaceStore } = useStore();
    const [mindMapStore] = useState(() => new FeatureMindMapStore(workspaceStore, onNodeClick));
    const isEditorOpen = workspaceStore.editor.isOpen;
    const insightDockSignature = mindMapStore.data.layout.nodes
        .filter((node) => node.type === 'card')
        .map((node) => node.id)
        .join('|');
    void showCosts;

    useEffect(() => {
        mindMapStore.setOnNodeClick(onNodeClick);
    }, [mindMapStore, onNodeClick]);

    useEffect(() => {
        workspaceStore.ui.setActiveMindMapStore(mindMapStore);

        return () => {
            workspaceStore.ui.clearActiveMindMapStore(mindMapStore);
        };
    }, [mindMapStore, workspaceStore]);

    useEffect(() => {
        const handlePointerDown = (event) => mindMapStore.ui.handleWindowPointerDown(event);
        const handleKeyDown = (event) => mindMapStore.ui.handleWindowKeyDown(event);

        window.addEventListener('mousedown', handlePointerDown);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('mousedown', handlePointerDown);
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [mindMapStore]);

    useEffect(() => {
        if (isEditorOpen) {
            mindMapStore.ui.clearActiveMenu();
        }
    }, [isEditorOpen, mindMapStore]);

    useEffect(() => {
        const insightIds = mindMapStore.data.layout.nodes
            .filter((node) => node.type === 'card')
            .map((node) => node.id);

        mindMapStore.ui.syncInsightDock(insightIds);
    }, [mindMapStore, insightDockSignature]);

    return (
        <div className="mindmap-viewport">
            <div
                className="mindmap-canvas"
                style={{ transform: `translate(${mindMapStore.ui.pan.x}px, ${mindMapStore.ui.pan.y}px) scale(${mindMapStore.ui.scale})` }}
            >
                <div className="mindmap-origin">
                    <svg className="mindmap-svg-layer">
                        {mindMapStore.ui.edgeViewModels.map(({ edge, isTrace, isDimmed }) => (
                            <path
                                key={edge.id}
                                d={buildEdgePath(mindMapStore, edge)}
                                fill="none"
                                className={clsx(
                                    'mindmap-edge',
                                    isTrace ? 'mindmap-edge--trace' : 'mindmap-edge--default',
                                    isDimmed && 'mindmap-edge--dimmed'
                                )}
                            />
                        ))}

                        {mindMapStore.ui.pendingPreview && (
                            <path
                                d={buildPreviewEdgePath(mindMapStore.ui.pendingPreview.sourceNode, mindMapStore.ui.pendingPreview.ghostNode)}
                                fill="none"
                                className="mindmap-edge--preview"
                            />
                        )}
                    </svg>

                    {mindMapStore.ui.nodeViewModels.map((viewModel) => (
                        <MindMapNode key={viewModel.node.id} store={mindMapStore} viewModel={viewModel} />
                    ))}

                    <PendingPreview store={mindMapStore} />
                    <InsightDock store={mindMapStore} />
                </div>
            </div>

            <ContextMenu store={mindMapStore} />

            {mindMapStore.data.layout.nodes.length === 0 && <EmptyState />}
        </div>
    );
});

export default FeatureMindMap;
