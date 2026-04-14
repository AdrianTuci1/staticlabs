export const mockData = {
    connector: [
        { id: 'src-1', name: 'PostgreSQL DB', type: 'db' },
        { id: 'src-2', name: 'Stripe Events', type: 'stripe' }
    ],
    actionType: [
        { id: 'action-1', connector_id: 'src-1', name: 'Standardize Fields' },
        { id: 'action-2', connector_id: 'src-2', name: 'Event Mapping' }
    ],
    adjustedData: [
        {
            id: 'category-1',
            origin_id: 'src-1',
            action_type_id: 'action-1',
            name: 'Core Users',
            title: 'Core Users',
            columns: [
                { id: 'col-1', name: 'user_id', type: 'string', status: 'ok' },
                { id: 'col-2', name: 'email', type: 'string', status: 'ok' }
            ]
        },
        {
            id: 'category-2',
            origin_id: 'src-2',
            action_type_id: 'action-2',
            name: 'Payments Derived',
            title: 'Payments Derived',
            columns: [
                { id: 'col-4', name: 'payment_id', type: 'string', status: 'ok' },
                { id: 'col-5', name: 'amount_usd', type: 'float', status: 'warning' }
            ]
        }
    ],
    group: [
        { id: 'grp-1', title: 'User Analytics', name: 'User Analytics', activationMode: 'automatic' },
        { id: 'grp-2', title: 'Revenue Tracking', name: 'Revenue Tracking', activationMode: 'manual' }
    ],
    insight: [
        {
            id: 'ins-1',
            title: 'Active Users',
            name: 'Active Users',
            group_id: 'grp-1',
            adjusted_data_columns: ['user_id', 'email'],
            lineage: { source_keys: ['category-1'] }
        },
        {
            id: 'ins-2',
            title: 'User Retention',
            name: 'User Retention',
            group_id: 'grp-1',
            adjusted_data_columns: ['created_at'],
            lineage: { source_keys: ['category-1'] }
        },
        {
            id: 'ins-3',
            title: 'MRR Growth',
            name: 'MRR Growth',
            group_id: 'grp-2',
            adjusted_data_columns: ['amount_usd'],
            lineage: { source_keys: ['category-2'] }
        },
        {
            id: 'ins-4',
            title: 'Churn Rate',
            name: 'Churn Rate',
            group_id: 'grp-2',
            adjusted_data_columns: ['status'],
            lineage: { source_keys: ['category-2'] }
        },
        {
            id: 'ins-5',
            title: 'DAU/MAU Ratio',
            name: 'DAU/MAU Ratio',
            group_id: 'grp-1',
            adjusted_data_columns: ['user_id'],
            lineage: { source_keys: ['category-1'] }
        },
        {
            id: 'ins-6',
            title: 'Revenue Velocity',
            name: 'Revenue Velocity',
            group_id: 'grp-2',
            adjusted_data_columns: ['amount_usd'],
            lineage: { source_keys: ['category-2'] }
        }
    ],
    mindmapManifest: {
        layers: {
            sources: [],
            groups: [],
            insights: [],
            transformations: {},
            gold: {}
        }
    },
    mindmapYaml: '',
    sourceMetadata: []
};
