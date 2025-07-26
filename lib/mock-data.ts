import { Agent, Execution, Flowchart } from '@/types/agent'

export const mockAgents: Agent[] = [
  {
    id: '1',
    name: 'Customer Support Bot',
    description: 'Automated customer service agent that handles common inquiries and escalates complex issues',
    status: 'Idle',
    category: 'Customer Service',
    enabled: true,
    createdAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    lastActive: '2024-01-20T14:30:00Z',
    lastExecution: '2024-01-20T14:30:00Z',
    executionCount: 247,
    configuration: {
      language: 'english',
      escalationThreshold: 3,
      responseTimeout: 30
    }
  },
  {
    id: '2',
    name: 'Data Analysis Pipeline',
    description: 'Processes and analyzes large datasets to generate insights and reports',
    status: 'Running',
    category: 'Data Processing',
    enabled: true,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-10T10:00:00Z',
    lastActive: '2024-01-20T16:00:00Z',
    lastExecution: '2024-01-20T16:00:00Z',
    executionCount: 89,
    configuration: {
      batchSize: 1000,
      outputFormat: 'json',
      retryAttempts: 3
    }
  },
  {
    id: '3',
    name: 'Content Moderator',
    description: 'Reviews and moderates user-generated content for policy violations',
    status: 'Idle',
    category: 'Automation',
    enabled: true,
    createdAt: '2024-01-08T12:00:00Z',
    updatedAt: '2024-01-08T12:00:00Z',
    lastActive: '2024-01-20T12:00:00Z',
    lastExecution: '2024-01-20T12:00:00Z',
    executionCount: 1342,
    configuration: {
      strictness: 'medium',
      categories: ['spam', 'inappropriate', 'violent'],
      autoAction: true
    }
  },
  {
    id: '4',
    name: 'Sales Lead Qualifier',
    description: 'Evaluates and scores incoming sales leads based on predefined criteria',
    status: 'Error',
    category: 'Analytics',
    enabled: true,
    createdAt: '2024-01-05T09:00:00Z',
    updatedAt: '2024-01-05T09:00:00Z',
    lastActive: '2024-01-19T11:00:00Z',
    lastExecution: '2024-01-19T11:00:00Z',
    executionCount: 156,
    configuration: {
      scoringModel: 'v2.1',
      minimumScore: 75,
      integrations: ['salesforce', 'hubspot']
    }
  },
  {
    id: '5',
    name: 'Inventory Manager',
    description: 'Monitors stock levels and automatically reorders products when thresholds are met',
    status: 'Idle',
    category: 'Automation',
    enabled: false,
    createdAt: '2024-01-03T14:00:00Z',
    updatedAt: '2024-01-03T14:00:00Z',
    lastActive: '2024-01-18T09:00:00Z',
    lastExecution: '2024-01-18T09:00:00Z',
    executionCount: 67,
    configuration: {
      reorderThreshold: 50,
      preferredSuppliers: ['supplier1', 'supplier2'],
      maxOrderValue: 10000
    }
  },
  {
    id: '6',
    name: 'Email Campaign Optimizer',
    description: 'Optimizes email marketing campaigns based on engagement metrics and A/B testing',
    status: 'Idle',
    category: 'Analytics',
    enabled: true,
    createdAt: '2024-01-01T16:00:00Z',
    updatedAt: '2024-01-01T16:00:00Z',
    lastActive: '2024-01-20T08:00:00Z',
    lastExecution: '2024-01-20T08:00:00Z',
    executionCount: 298,
    configuration: {
      testDuration: 24,
      significanceLevel: 0.95,
      metrics: ['open_rate', 'click_rate', 'conversion_rate']
    }
  }
]

export const mockExecutions: Execution[] = [
  {
    id: 'exec-1-001',
    agentId: '1',
    status: 'success',
    startTime: '2024-01-20T14:30:00Z',
    endTime: '2024-01-20T14:32:15Z',
    result: 'Processed 45 customer inquiries, escalated 3 to human agents',
    logs: [
      {
        timestamp: '2024-01-20T14:30:05Z',
        level: 'info',
        message: 'Started processing customer inquiries queue'
      },
      {
        timestamp: '2024-01-20T14:31:20Z',
        level: 'info',
        message: 'Processed inquiry #12345 - routing issue resolved'
      },
      {
        timestamp: '2024-01-20T14:32:10Z',
        level: 'warn',
        message: 'Escalating complex technical inquiry #12367 to human agent'
      }
    ]
  },
  {
    id: 'exec-1-002',
    agentId: '1',
    status: 'success',
    startTime: '2024-01-20T13:30:00Z',
    endTime: '2024-01-20T13:31:45Z',
    result: 'Processed 32 customer inquiries, escalated 1 to human agents',
    logs: [
      {
        timestamp: '2024-01-20T13:30:05Z',
        level: 'info',
        message: 'Started processing customer inquiries queue'
      },
      {
        timestamp: '2024-01-20T13:31:40Z',
        level: 'info',
        message: 'Successfully resolved all standard inquiries'
      }
    ]
  },
  {
    id: 'exec-1-003',
    agentId: '1',
    status: 'failed',
    startTime: '2024-01-20T12:30:00Z',
    endTime: '2024-01-20T12:31:20Z',
    error: 'Connection timeout to customer database',
    logs: [
      {
        timestamp: '2024-01-20T12:30:05Z',
        level: 'info',
        message: 'Started processing customer inquiries queue'
      },
      {
        timestamp: '2024-01-20T12:31:15Z',
        level: 'error',
        message: 'Failed to connect to customer database after 3 retries'
      }
    ]
  },
  {
    id: 'exec-2-001',
    agentId: '2',
    status: 'running',
    startTime: '2024-01-20T16:00:00Z',
    logs: [
      {
        timestamp: '2024-01-20T16:00:05Z',
        level: 'info',
        message: 'Starting data analysis pipeline for dataset batch #2024-01-20-001'
      },
      {
        timestamp: '2024-01-20T16:05:30Z',
        level: 'info',
        message: 'Preprocessing completed - 15,000 records processed'
      },
      {
        timestamp: '2024-01-20T16:10:45Z',
        level: 'info',
        message: 'Analysis phase 1/3 completed - feature extraction done'
      }
    ]
  },
  {
    id: 'exec-2-002',
    agentId: '2',
    status: 'success',
    startTime: '2024-01-20T14:00:00Z',
    endTime: '2024-01-20T15:45:30Z',
    result: 'Generated insights report for Q4 sales data - identified 3 key trends',
    logs: [
      {
        timestamp: '2024-01-20T14:00:05Z',
        level: 'info',
        message: 'Starting analysis of Q4 sales data'
      },
      {
        timestamp: '2024-01-20T15:30:00Z',
        level: 'info',
        message: 'Pattern analysis completed - generating report'
      },
      {
        timestamp: '2024-01-20T15:45:25Z',
        level: 'info',
        message: 'Report generated successfully and saved to output directory'
      }
    ]
  },
  {
    id: 'exec-3-001',
    agentId: '3',
    status: 'success',
    startTime: '2024-01-20T12:00:00Z',
    endTime: '2024-01-20T12:05:20Z',
    result: 'Moderated 127 content items, flagged 8 for review',
    logs: [
      {
        timestamp: '2024-01-20T12:00:05Z',
        level: 'info',
        message: 'Starting content moderation batch process'
      },
      {
        timestamp: '2024-01-20T12:03:15Z',
        level: 'warn',
        message: 'Flagged potentially inappropriate content item #CN-789123'
      },
      {
        timestamp: '2024-01-20T12:05:15Z',
        level: 'info',
        message: 'Batch moderation completed successfully'
      }
    ]
  },
  {
    id: 'exec-4-001',
    agentId: '4',
    status: 'pending',
    startTime: '2024-01-20T17:00:00Z',
    logs: [
      {
        timestamp: '2024-01-20T17:00:00Z',
        level: 'info',
        message: 'Lead qualification job queued for execution'
      }
    ]
  }
]

export const mockFlowcharts: Flowchart[] = [
  {
    id: 'flow-1',
    agentId: '1',
    version: '1.2.0',
    nodes: [
      {
        id: 'start-1',
        type: 'start',
        title: 'Incoming Inquiry',
        description: 'Customer submits support ticket',
        position: { x: 50, y: 50 },
        config: {
          channels: ['email', 'chat', 'phone']
        }
      },
      {
        id: 'process-1',
        type: 'process',
        title: 'Parse Intent',
        description: 'Analyze inquiry to determine customer intent',
        position: { x: 300, y: 50 },
        config: {
          nlpModel: 'bert-base-uncased',
          confidence_threshold: 0.8
        }
      },
      {
        id: 'decision-1',
        type: 'decision',
        title: 'Can Auto-Resolve?',
        description: 'Check if inquiry can be handled automatically',
        position: { x: 550, y: 50 },
        config: {
          criteria: ['faq_match', 'simple_query', 'account_lookup']
        }
      },
      {
        id: 'process-2',
        type: 'process',
        title: 'Generate Response',
        description: 'Create automated response',
        position: { x: 300, y: 200 },
        config: {
          template_engine: 'mustache',
          personalization: true
        }
      },
      {
        id: 'process-3',
        type: 'process',
        title: 'Escalate to Human',
        description: 'Route to appropriate human agent',
        position: { x: 800, y: 50 },
        config: {
          routing_rules: 'skill_based',
          priority_levels: ['high', 'medium', 'low']
        }
      },
      {
        id: 'end-1',
        type: 'end',
        title: 'Response Sent',
        description: 'Customer receives response',
        position: { x: 550, y: 200 }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        from: 'start-1',
        to: 'process-1',
        label: 'New inquiry'
      },
      {
        id: 'conn-2',
        from: 'process-1',
        to: 'decision-1',
        label: 'Intent parsed'
      },
      {
        id: 'conn-3',
        from: 'decision-1',
        to: 'process-2',
        label: 'Yes',
        condition: 'confidence > 0.8'
      },
      {
        id: 'conn-4',
        from: 'decision-1',
        to: 'process-3',
        label: 'No',
        condition: 'confidence <= 0.8'
      },
      {
        id: 'conn-5',
        from: 'process-2',
        to: 'end-1',
        label: 'Auto-response'
      },
      {
        id: 'conn-6',
        from: 'process-3',
        to: 'end-1',
        label: 'Escalated'
      }
    ],
    metadata: {
      title: 'Customer Support Workflow',
      description: 'Automated customer inquiry processing with human escalation',
      layout: 'flowchart-v1'
    },
    lastModified: '2024-01-15T10:30:00Z'
  },
  {
    id: 'flow-2',
    agentId: '2',
    version: '2.1.0',
    nodes: [
      {
        id: 'start-2',
        type: 'start',
        title: 'Data Input',
        description: 'Receive dataset for analysis',
        position: { x: 50, y: 50 },
        config: {
          input_formats: ['csv', 'json', 'parquet'],
          max_size: '1GB'
        }
      },
      {
        id: 'process-4',
        type: 'process',
        title: 'Data Validation',
        description: 'Validate data quality and format',
        position: { x: 300, y: 50 },
        config: {
          schema_validation: true,
          null_threshold: 0.1,
          duplicate_check: true
        }
      },
      {
        id: 'decision-2',
        type: 'decision',
        title: 'Data Quality OK?',
        description: 'Check if data meets quality standards',
        position: { x: 550, y: 50 }
      },
      {
        id: 'process-5',
        type: 'process',
        title: 'Data Preprocessing',
        description: 'Clean and prepare data for analysis',
        position: { x: 300, y: 200 },
        config: {
          missing_value_strategy: 'interpolation',
          outlier_detection: 'iqr',
          normalization: 'z-score'
        }
      },
      {
        id: 'process-6',
        type: 'process',
        title: 'Statistical Analysis',
        description: 'Perform statistical computations',
        position: { x: 550, y: 200 },
        config: {
          methods: ['correlation', 'regression', 'clustering'],
          significance_level: 0.05
        }
      },
      {
        id: 'process-7',
        type: 'process',
        title: 'Generate Report',
        description: 'Create analysis report and visualizations',
        position: { x: 800, y: 200 },
        config: {
          report_format: 'html',
          include_charts: true,
          export_data: true
        }
      },
      {
        id: 'end-2',
        type: 'end',
        title: 'Analysis Complete',
        description: 'Results delivered',
        position: { x: 800, y: 50 }
      }
    ],
    connections: [
      {
        id: 'conn-7',
        from: 'start-2',
        to: 'process-4',
        label: 'Dataset received'
      },
      {
        id: 'conn-8',
        from: 'process-4',
        to: 'decision-2',
        label: 'Validation complete'
      },
      {
        id: 'conn-9',
        from: 'decision-2',
        to: 'process-5',
        label: 'Valid',
        condition: 'quality_score > 0.8'
      },
      {
        id: 'conn-10',
        from: 'decision-2',
        to: 'end-2',
        label: 'Invalid',
        condition: 'quality_score <= 0.8'
      },
      {
        id: 'conn-11',
        from: 'process-5',
        to: 'process-6',
        label: 'Data prepared'
      },
      {
        id: 'conn-12',
        from: 'process-6',
        to: 'process-7',
        label: 'Analysis done'
      },
      {
        id: 'conn-13',
        from: 'process-7',
        to: 'end-2',
        label: 'Report generated'
      }
    ],
    metadata: {
      title: 'Data Analysis Pipeline',
      description: 'End-to-end data processing and analysis workflow',
      layout: 'flowchart-v1'
    },
    lastModified: '2024-01-12T14:45:00Z'
  }
]