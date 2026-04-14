import { makeAutoObservable, runInAction } from 'mobx';
import { mockData } from './mockData';

class MockUIStore {
    scale = 1;
    pan = { x: 0, y: 0 };
    selectedItems = new Set();
    activeMindMapStore = null;

    constructor() {
        makeAutoObservable(this);
    }
    
    setViewport(x, y, scale) {
        this.pan.x = x;
        this.pan.y = y;
        this.scale = scale;
    }

    focusOnNodes(nodes = [], customOffset = null) {
        if (nodes.length === 0) return;

        const getBBox = (node) => {
            if (node.type === 'source') {
                return { minX: node.x - (node.width || 272), maxX: node.x };
            } else if (node.type === 'action') {
                const w = node.width || 220;
                return { minX: node.x - w / 2, maxX: node.x + w / 2 };
            } else {
                return { minX: node.x, maxX: node.x + (node.width || 240) };
            }
        };

        const bboxes = nodes.map(getBBox);
        const minX = Math.min(...bboxes.map(b => b.minX));
        const maxX = Math.max(...bboxes.map(b => b.maxX));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxY = Math.max(...nodes.map(n => n.y + (n.height || 60)));

        const centerX = (minX + maxX) / 2;
        const centerY = (minY + maxY) / 2;

        const leadOffset = customOffset !== null ? customOffset : (this.isDiscovering ? 400 : 0); 
        
        // We calculate targetPanX to lead the frontier. 
        // We also ensure that during discovery, we don't look too far left.
        let targetPanX = -(centerX + leadOffset) * this.scale;
        const targetPanY = -centerY * this.scale;

        // Monotonic check: only skip if we are in discovery and no custom offset is provided
        if (this.pan.x !== 0 && this.isDiscovering && customOffset === null) {
            targetPanX = Math.min(this.pan.x, targetPanX);
        }

        this.pan.x = targetPanX;
        this.pan.y = targetPanY;
        
        if (maxX - minX > 1100) {
            this.scale = 0.85;
        } else {
            this.scale = 0.95;
        }
    }

    toggleSelection(id) {
        if (this.selectedItems.has(id)) {
            this.selectedItems.delete(id);
        } else {
            this.selectedItems.add(id);
        }
    }

    toggleGroup() {}
    toggleRecommendation() {}
    setActiveMindMapStore(store) { this.activeMindMapStore = store; }
    clearActiveMindMapStore() { this.activeMindMapStore = null; }
    isRecommendationAccepted() { return false; }
    isInsightDockEditing() { return false; }
    toggleInsightDockEditing() {}
    isInsightVisible() { return true; }
    isInsightCreating() { return false; }
}

class MockDataStore {
    connector = [];
    actionType = [];
    adjustedData = [];
    group = [];
    insight = [];
    mindmapManifest = mockData.mindmapManifest;
    mindmapYaml = mockData.mindmapYaml;
    sourceMetadata = mockData.sourceMetadata;
    origin = [];
    isDiscovering = false;

    constructor() {
        makeAutoObservable(this);
    }

    async startDiscoverySequence(uiStore, onComplete) {
        if (this.isDiscovering) return;
        this.isDiscovering = true;

        // Reset
        runInAction(() => {
            this.connector = [];
            this.actionType = [];
            this.adjustedData = [];
            this.group = [];
            this.insight = [];
            
            // Mathematically centered for Source Nodes at start
            // Box [-597, -325] -> Center -461. scale 0.95 -> pan 438
            uiStore.pan.x = 438; 
            uiStore.pan.y = 0;
            uiStore.scale = 0.95;
        });

        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        // 1. Reveal Both Sources
        runInAction(() => {
            this.connector = [...mockData.connector];
        });

        await delay(50);
        if (uiStore.activeMindMapStore) {
            // Step 1: Just focus on Sources
            uiStore.focusOnNodes(uiStore.activeMindMapStore.data.layout.nodes, 0); 
        }
        await delay(1600);

        // 2. Reveal Actions/Categories for both
        runInAction(() => {
            this.actionType = [...mockData.actionType];
            this.adjustedData = [...mockData.adjustedData];
        });
        
        await delay(50);
        if (uiStore.activeMindMapStore) {
            // Step 2: Focus on Sources + Categories, keeping sources well in view
            uiStore.focusOnNodes(uiStore.activeMindMapStore.data.layout.nodes, -80); 
        }
        await delay(1600);

        // 3. Reveal Groups
        runInAction(() => {
            this.group = [...mockData.group];
        });
        
        await delay(50);
        if (uiStore.activeMindMapStore) {
            // Step 3: Focus on Categories + Groups, leaning towards categories
            const contextNodes = uiStore.activeMindMapStore.data.layout.nodes.filter(
                n => n.type === 'gold' || n.type === 'group'
            );
            uiStore.focusOnNodes(contextNodes, 0); 
        }
        await delay(1600);

        // 4. Reveal Insights one by one
        for (let i = 0; i < mockData.insight.length; i++) {
            runInAction(() => {
                this.insight.push(mockData.insight[i]);
            });
            await delay(50);
            if (uiStore.activeMindMapStore) {
                // Step 4: Focus on Groups + Insights, ensuring groups stay visible
                const contextNodes = uiStore.activeMindMapStore.data.layout.nodes.filter(
                    n => n.type === 'group' || n.type === 'card'
                );
                uiStore.focusOnNodes(contextNodes, 80);
            }
            await delay(1000);
        }

        // Final Focus: Groups and Insights ONLY
        if (uiStore.activeMindMapStore) {
            const finalNodes = uiStore.activeMindMapStore.data.layout.nodes.filter(
                n => n.type === 'group' || n.type === 'card'
            );
            uiStore.focusOnNodes(finalNodes, 0); // Center on these two columns exactly
        }

        this.isDiscovering = false;
        onComplete?.();
    }
}

class MockEditorStore {
    isOpen = false;
    constructor() { makeAutoObservable(this); }
    openCode() {}
    openInspector() {}
}

class MockWorkspaceStore {
    ui = new MockUIStore();
    data = new MockDataStore();
    editor = new MockEditorStore();
    
    constructor() {
        makeAutoObservable(this);
    }

    get externalUI() { return this.ui; }
    get externalDataStore() { return this.data; }

    startDiscovery(onComplete) {
        this.data.startDiscoverySequence(this.ui, onComplete);
    }
}

const mockWorkspaceStore = new MockWorkspaceStore();

export const useStore = () => {
    return {
        workspaceStore: mockWorkspaceStore
    };
};
