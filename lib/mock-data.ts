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
    status: 'SUCCESS',
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
    status: 'SUCCESS',
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
    status: 'FAILED',
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
    status: 'RUNNING',
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
    status: 'SUCCESS',
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
    status: 'SUCCESS',
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
    status: 'RUNNING',
    startTime: '2024-01-20T17:00:00Z',
    logs: [
      {
        timestamp: '2024-01-20T17:00:00Z',
        level: 'info',
        message: 'Lead qualification job queued for execution'
      }
    ]
  },
  // Additional executions for Agent 1 (Customer Support Bot)
  {
    id: 'exec-1-004',
    agentId: '1',
    status: 'SUCCESS',
    startTime: '2024-01-19T09:15:00Z',
    endTime: '2024-01-19T09:18:30Z',
    result: 'Processed 28 customer inquiries, escalated 2 to human agents',
    logs: [
      {
        timestamp: '2024-01-19T09:15:05Z',
        level: 'info',
        message: 'Started processing morning inquiry batch'
      },
      {
        timestamp: '2024-01-19T09:17:15Z',
        level: 'info',
        message: 'Resolved billing inquiry #BL-45612'
      },
      {
        timestamp: '2024-01-19T09:18:25Z',
        level: 'info',
        message: 'Batch processing completed successfully'
      }
    ]
  },
  {
    id: 'exec-1-005',
    agentId: '1',
    status: 'FAILED',
    startTime: '2024-01-18T16:45:00Z',
    endTime: '2024-01-18T16:46:15Z',
    error: 'API rate limit exceeded for external service',
    logs: [
      {
        timestamp: '2024-01-18T16:45:05Z',
        level: 'info',
        message: 'Starting customer inquiry processing'
      },
      {
        timestamp: '2024-01-18T16:46:10Z',
        level: 'error',
        message: 'Rate limit exceeded for payment service API - 429 Too Many Requests'
      }
    ]
  },
  // Additional executions for Agent 2 (Data Analysis Pipeline)
  {
    id: 'exec-2-003',
    agentId: '2',
    status: 'FAILED',
    startTime: '2024-01-19T10:00:00Z',
    endTime: '2024-01-19T10:15:45Z',
    error: 'Insufficient memory to process large dataset',
    logs: [
      {
        timestamp: '2024-01-19T10:00:05Z',
        level: 'info',
        message: 'Starting analysis of customer behavior dataset'
      },
      {
        timestamp: '2024-01-19T10:12:30Z',
        level: 'warn',
        message: 'Memory usage approaching 95% threshold'
      },
      {
        timestamp: '2024-01-19T10:15:40Z',
        level: 'error',
        message: 'OutOfMemoryError: Unable to process dataset of size 2.3GB'
      }
    ]
  },
  {
    id: 'exec-2-004',
    agentId: '2',
    status: 'SUCCESS',
    startTime: '2024-01-18T08:30:00Z',
    endTime: '2024-01-18T09:45:20Z',
    result: 'Analyzed user engagement patterns - generated recommendations for 5 product categories',
    logs: [
      {
        timestamp: '2024-01-18T08:30:05Z',
        level: 'info',
        message: 'Loading user engagement dataset (850MB)'
      },
      {
        timestamp: '2024-01-18T08:45:30Z',
        level: 'info',
        message: 'Preprocessing completed - 1.2M records processed'
      },
      {
        timestamp: '2024-01-18T09:30:15Z',
        level: 'info',
        message: 'Pattern recognition completed - 15 significant patterns identified'
      },
      {
        timestamp: '2024-01-18T09:45:15Z',
        level: 'info',
        message: 'Report generated with actionable recommendations'
      }
    ]
  },
  // Additional executions for Agent 3 (Content Moderator)
  {
    id: 'exec-3-002',
    agentId: '3',
    status: 'SUCCESS',
    startTime: '2024-01-19T14:30:00Z',
    endTime: '2024-01-19T14:33:45Z',
    result: 'Moderated 89 content items, flagged 12 for human review',
    logs: [
      {
        timestamp: '2024-01-19T14:30:05Z',
        level: 'info',
        message: 'Starting content moderation for forum posts'
      },
      {
        timestamp: '2024-01-19T14:31:20Z',
        level: 'warn',
        message: 'Flagged post #FP-34567 for potential spam content'
      },
      {
        timestamp: '2024-01-19T14:32:45Z',
        level: 'warn',
        message: 'Flagged image #IMG-78901 for inappropriate content'
      },
      {
        timestamp: '2024-01-19T14:33:40Z',
        level: 'info',
        message: 'Moderation batch completed successfully'
      }
    ]
  },
  {
    id: 'exec-3-003',
    agentId: '3',
    status: 'RUNNING',
    startTime: '2024-01-20T18:00:00Z',
    logs: [
      {
        timestamp: '2024-01-20T18:00:05Z',
        level: 'info',
        message: 'Starting evening content moderation batch'
      },
      {
        timestamp: '2024-01-20T18:05:30Z',
        level: 'info',
        message: 'Processing user-generated content from last 4 hours'
      },
      {
        timestamp: '2024-01-20T18:10:45Z',
        level: 'info',
        message: 'Phase 1/3 completed - text content analysis done'
      }
    ]
  },
  // Additional executions for Agent 4 (Sales Lead Qualifier)
  {
    id: 'exec-4-002',
    agentId: '4',
    status: 'FAILED',
    startTime: '2024-01-19T11:00:00Z',
    endTime: '2024-01-19T11:02:30Z',
    error: 'CRM integration failure - authentication expired',
    logs: [
      {
        timestamp: '2024-01-19T11:00:05Z',
        level: 'info',
        message: 'Starting lead qualification for 25 new prospects'
      },
      {
        timestamp: '2024-01-19T11:02:25Z',
        level: 'error',
        message: 'CRM authentication failed - token expired, unable to sync lead data'
      }
    ]
  },
  {
    id: 'exec-4-003',
    agentId: '4',
    status: 'SUCCESS',
    startTime: '2024-01-18T15:30:00Z',
    endTime: '2024-01-18T15:35:20Z',
    result: 'Qualified 18 leads, identified 6 high-priority prospects for immediate follow-up',
    logs: [
      {
        timestamp: '2024-01-18T15:30:05Z',
        level: 'info',
        message: 'Loading lead data from CRM integration'
      },
      {
        timestamp: '2024-01-18T15:32:15Z',
        level: 'info',
        message: 'Applying qualification scoring model v2.1'
      },
      {
        timestamp: '2024-01-18T15:34:30Z',
        level: 'info',
        message: 'High-value lead detected: TechCorp Industries (Score: 92/100)'
      },
      {
        timestamp: '2024-01-18T15:35:15Z',
        level: 'info',
        message: 'Lead qualification completed - results synced to CRM'
      }
    ]
  },
  // Executions for Agent 5 (Inventory Manager)
  {
    id: 'exec-5-001',
    agentId: '5',
    status: 'SUCCESS',
    startTime: '2024-01-17T07:00:00Z',
    endTime: '2024-01-17T07:12:45Z',
    result: 'Monitored 450 SKUs, triggered 8 automatic reorders, flagged 3 supplier issues',
    logs: [
      {
        timestamp: '2024-01-17T07:00:05Z',
        level: 'info',
        message: 'Starting daily inventory monitoring cycle'
      },
      {
        timestamp: '2024-01-17T07:05:30Z',
        level: 'info',
        message: 'Low stock alert: Product SKU-12345 (15 units remaining)'
      },
      {
        timestamp: '2024-01-17T07:08:15Z',
        level: 'warn',
        message: 'Supplier timeout for Product SKU-67890 - escalating to procurement'
      },
      {
        timestamp: '2024-01-17T07:12:40Z',
        level: 'info',
        message: 'Inventory monitoring completed - 8 reorders initiated'
      }
    ]
  },
  {
    id: 'exec-5-002',
    agentId: '5',
    status: 'FAILED',
    startTime: '2024-01-16T07:00:00Z',
    endTime: '2024-01-16T07:05:30Z',
    error: 'ERP system unavailable - unable to fetch current inventory levels',
    logs: [
      {
        timestamp: '2024-01-16T07:00:05Z',
        level: 'info',
        message: 'Attempting to connect to ERP system for inventory data'
      },
      {
        timestamp: '2024-01-16T07:03:20Z',
        level: 'warn',
        message: 'ERP connection timeout - retrying with backup endpoint'
      },
      {
        timestamp: '2024-01-16T07:05:25Z',
        level: 'error',
        message: 'All ERP endpoints unavailable - inventory monitoring failed'
      }
    ]
  },
  // Executions for Agent 6 (Email Campaign Optimizer)
  {
    id: 'exec-6-001',
    agentId: '6',
    status: 'SUCCESS',
    startTime: '2024-01-19T13:00:00Z',
    endTime: '2024-01-19T13:25:15Z',
    result: 'Optimized 3 email campaigns, improved open rates by 12%, increased CTR by 8%',
    logs: [
      {
        timestamp: '2024-01-19T13:00:05Z',
        level: 'info',
        message: 'Starting email campaign optimization analysis'
      },
      {
        timestamp: '2024-01-19T13:10:30Z',
        level: 'info',
        message: 'A/B test results analyzed for subject line variants'
      },
      {
        timestamp: '2024-01-19T13:20:45Z',
        level: 'info',
        message: 'Optimal send time identified: Tuesday 10:30 AM'
      },
      {
        timestamp: '2024-01-19T13:25:10Z',
        level: 'info',
        message: 'Campaign optimizations applied and scheduled'
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
        position: { x: 50, y: 50, z: 1 },
        size: { width: 160, height: 80 },
        config: {
          channels: ['email', 'chat', 'phone']
        },
        chronology: {
          order: 1,
          createdAt: '2024-01-15T09:00:00Z',
          updatedAt: '2024-01-15T09:00:00Z'
        }
      },
      {
        id: 'process-1',
        type: 'process',
        title: 'Parse Intent',
        description: 'Analyze inquiry to determine customer intent',
        position: { x: 300, y: 50, z: 2 },
        size: { width: 160, height: 80 },
        config: {
          nlpModel: 'bert-base-uncased',
          confidence_threshold: 0.8
        },
        chronology: {
          order: 2,
          createdAt: '2024-01-15T09:01:00Z',
          updatedAt: '2024-01-15T09:01:00Z'
        }
      },
      {
        id: 'decision-1',
        type: 'decision',
        title: 'Can Auto-Resolve?',
        description: 'Check if inquiry can be handled automatically',
        position: { x: 550, y: 50, z: 3 },
        size: { width: 160, height: 80 },
        config: {
          criteria: ['faq_match', 'simple_query', 'account_lookup']
        },
        chronology: {
          order: 3,
          createdAt: '2024-01-15T09:02:00Z',
          updatedAt: '2024-01-15T09:02:00Z'
        }
      },
      {
        id: 'process-2',
        type: 'process',
        title: 'Generate Response',
        description: 'Create automated response',
        position: { x: 300, y: 200, z: 4 },
        size: { width: 160, height: 80 },
        config: {
          template_engine: 'mustache',
          personalization: true
        },
        chronology: {
          order: 4,
          createdAt: '2024-01-15T09:03:00Z',
          updatedAt: '2024-01-15T09:03:00Z'
        }
      },
      {
        id: 'process-3',
        type: 'process',
        title: 'Escalate to Human',
        description: 'Route to appropriate human agent',
        position: { x: 800, y: 50, z: 5 },
        size: { width: 160, height: 80 },
        config: {
          routing_rules: 'skill_based',
          priority_levels: ['high', 'medium', 'low']
        },
        chronology: {
          order: 5,
          createdAt: '2024-01-15T09:04:00Z',
          updatedAt: '2024-01-15T09:04:00Z'
        }
      },
      {
        id: 'end-1',
        type: 'end',
        title: 'Response Sent',
        description: 'Customer receives response',
        position: { x: 550, y: 200, z: 6 },
        size: { width: 160, height: 80 },
        chronology: {
          order: 6,
          createdAt: '2024-01-15T09:05:00Z',
          updatedAt: '2024-01-15T09:05:00Z'
        }
      }
    ],
    connections: [
      {
        id: 'conn-1',
        from: 'start-1',
        to: 'process-1',
        label: 'New inquiry',
        path: { type: 'straight' },
        chronology: {
          order: 1,
          createdAt: '2024-01-15T09:06:00Z',
          updatedAt: '2024-01-15T09:06:00Z'
        }
      },
      {
        id: 'conn-2',
        from: 'process-1',
        to: 'decision-1',
        label: 'Intent parsed',
        path: { type: 'straight' },
        chronology: {
          order: 2,
          createdAt: '2024-01-15T09:07:00Z',
          updatedAt: '2024-01-15T09:07:00Z'
        }
      },
      {
        id: 'conn-3',
        from: 'decision-1',
        to: 'process-2',
        label: 'Yes',
        condition: 'confidence > 0.8',
        path: { type: 'curved' },
        chronology: {
          order: 3,
          createdAt: '2024-01-15T09:08:00Z',
          updatedAt: '2024-01-15T09:08:00Z'
        }
      },
      {
        id: 'conn-4',
        from: 'decision-1',
        to: 'process-3',
        label: 'No',
        condition: 'confidence <= 0.8',
        path: { type: 'straight' },
        chronology: {
          order: 4,
          createdAt: '2024-01-15T09:09:00Z',
          updatedAt: '2024-01-15T09:09:00Z'
        }
      },
      {
        id: 'conn-5',
        from: 'process-2',
        to: 'end-1',
        label: 'Auto-response',
        path: { type: 'straight' },
        chronology: {
          order: 5,
          createdAt: '2024-01-15T09:10:00Z',
          updatedAt: '2024-01-15T09:10:00Z'
        }
      },
      {
        id: 'conn-6',
        from: 'process-3',
        to: 'end-1',
        label: 'Escalated',
        path: { type: 'curved' },
        chronology: {
          order: 6,
          createdAt: '2024-01-15T09:11:00Z',
          updatedAt: '2024-01-15T09:11:00Z'
        }
      }
    ],
    layout: {
      canvasSize: { width: 1200, height: 600 },
      zoom: 1,
      pan: { x: 0, y: 0 },
      gridSize: 20,
      snapToGrid: true
    },
    metadata: {
      title: 'Customer Support Workflow',
      description: 'Automated customer inquiry processing with human escalation',
      layoutVersion: 'v2.0',
      tags: ['customer-support', 'automation', 'escalation']
    },
    chronology: {
      createdAt: '2024-01-15T09:00:00Z',
      lastModified: '2024-01-15T10:30:00Z',
      version: '1.2.0',
      changeLog: [
        {
          timestamp: '2024-01-15T09:00:00Z',
          action: 'created',
          details: 'Initial flowchart creation'
        },
        {
          timestamp: '2024-01-15T10:30:00Z',
          action: 'layout_updated',
          details: 'Adjusted node positions for better visualization'
        }
      ]
    }
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
        position: { x: 50, y: 50, z: 1 },
        size: { width: 160, height: 80 },
        config: {
          input_formats: ['csv', 'json', 'parquet'],
          max_size: '1GB'
        },
        chronology: {
          order: 1,
          createdAt: '2024-01-10T08:00:00Z',
          updatedAt: '2024-01-10T08:00:00Z'
        }
      },
      {
        id: 'process-4',
        type: 'process',
        title: 'Data Validation',
        description: 'Validate data quality and format',
        position: { x: 300, y: 50, z: 2 },
        size: { width: 160, height: 80 },
        config: {
          schema_validation: true,
          null_threshold: 0.1,
          duplicate_check: true
        },
        chronology: {
          order: 2,
          createdAt: '2024-01-10T08:01:00Z',
          updatedAt: '2024-01-10T08:01:00Z'
        }
      },
      {
        id: 'decision-2',
        type: 'decision',
        title: 'Data Quality OK?',
        description: 'Check if data meets quality standards',
        position: { x: 550, y: 50, z: 3 },
        size: { width: 160, height: 80 },
        chronology: {
          order: 3,
          createdAt: '2024-01-10T08:02:00Z',
          updatedAt: '2024-01-10T08:02:00Z'
        }
      },
      {
        id: 'process-5',
        type: 'process',
        title: 'Data Preprocessing',
        description: 'Clean and prepare data for analysis',
        position: { x: 300, y: 200, z: 4 },
        size: { width: 160, height: 80 },
        config: {
          missing_value_strategy: 'interpolation',
          outlier_detection: 'iqr',
          normalization: 'z-score'
        },
        chronology: {
          order: 4,
          createdAt: '2024-01-10T08:03:00Z',
          updatedAt: '2024-01-10T08:03:00Z'
        }
      },
      {
        id: 'process-6',
        type: 'process',
        title: 'Statistical Analysis',
        description: 'Perform statistical computations',
        position: { x: 550, y: 200, z: 5 },
        size: { width: 160, height: 80 },
        config: {
          methods: ['correlation', 'regression', 'clustering'],
          significance_level: 0.05
        },
        chronology: {
          order: 5,
          createdAt: '2024-01-10T08:04:00Z',
          updatedAt: '2024-01-10T08:04:00Z'
        }
      },
      {
        id: 'process-7',
        type: 'process',
        title: 'Generate Report',
        description: 'Create analysis report and visualizations',
        position: { x: 800, y: 200, z: 6 },
        size: { width: 160, height: 80 },
        config: {
          report_format: 'html',
          include_charts: true,
          export_data: true
        },
        chronology: {
          order: 6,
          createdAt: '2024-01-10T08:05:00Z',
          updatedAt: '2024-01-10T08:05:00Z'
        }
      },
      {
        id: 'end-2',
        type: 'end',
        title: 'Analysis Complete',
        description: 'Results delivered',
        position: { x: 800, y: 50, z: 7 },
        size: { width: 160, height: 80 },
        chronology: {
          order: 7,
          createdAt: '2024-01-10T08:06:00Z',
          updatedAt: '2024-01-10T08:06:00Z'
        }
      }
    ],
    connections: [
      {
        id: 'conn-7',
        from: 'start-2',
        to: 'process-4',
        label: 'Dataset received',
        path: { type: 'straight' },
        chronology: {
          order: 1,
          createdAt: '2024-01-10T08:07:00Z',
          updatedAt: '2024-01-10T08:07:00Z'
        }
      },
      {
        id: 'conn-8',
        from: 'process-4',
        to: 'decision-2',
        label: 'Validation complete',
        path: { type: 'straight' },
        chronology: {
          order: 2,
          createdAt: '2024-01-10T08:08:00Z',
          updatedAt: '2024-01-10T08:08:00Z'
        }
      },
      {
        id: 'conn-9',
        from: 'decision-2',
        to: 'process-5',
        label: 'Valid',
        condition: 'quality_score > 0.8',
        path: { type: 'curved' },
        chronology: {
          order: 3,
          createdAt: '2024-01-10T08:09:00Z',
          updatedAt: '2024-01-10T08:09:00Z'
        }
      },
      {
        id: 'conn-10',
        from: 'decision-2',
        to: 'end-2',
        label: 'Invalid',
        condition: 'quality_score <= 0.8',
        path: { type: 'straight' },
        chronology: {
          order: 4,
          createdAt: '2024-01-10T08:10:00Z',
          updatedAt: '2024-01-10T08:10:00Z'
        }
      },
      {
        id: 'conn-11',
        from: 'process-5',
        to: 'process-6',
        label: 'Data prepared',
        path: { type: 'straight' },
        chronology: {
          order: 5,
          createdAt: '2024-01-10T08:11:00Z',
          updatedAt: '2024-01-10T08:11:00Z'
        }
      },
      {
        id: 'conn-12',
        from: 'process-6',
        to: 'process-7',
        label: 'Analysis done',
        path: { type: 'straight' },
        chronology: {
          order: 6,
          createdAt: '2024-01-10T08:12:00Z',
          updatedAt: '2024-01-10T08:12:00Z'
        }
      },
      {
        id: 'conn-13',
        from: 'process-7',
        to: 'end-2',
        label: 'Report generated',
        path: { type: 'curved' },
        chronology: {
          order: 7,
          createdAt: '2024-01-10T08:13:00Z',
          updatedAt: '2024-01-10T08:13:00Z'
        }
      }
    ],
    layout: {
      canvasSize: { width: 1200, height: 600 },
      zoom: 0.9,
      pan: { x: 20, y: 10 },
      gridSize: 25,
      snapToGrid: true
    },
    metadata: {
      title: 'Data Analysis Pipeline',
      description: 'End-to-end data processing and analysis workflow',
      layoutVersion: 'v2.0',
      tags: ['data-analysis', 'statistics', 'automation']
    },
    chronology: {
      createdAt: '2024-01-10T08:00:00Z',
      lastModified: '2024-01-12T14:45:00Z',
      version: '2.1.0',
      changeLog: [
        {
          timestamp: '2024-01-10T08:00:00Z',
          action: 'created',
          details: 'Initial data analysis flowchart creation'
        },
        {
          timestamp: '2024-01-12T14:45:00Z',
          action: 'layout_updated',
          details: 'Optimized workflow for better processing'
        }
      ]
    }
  }
]