import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'AI Agent Dashboard API',
      version: '1.0.0',
      description: 'RESTful API for managing AI agents, executions, and workflows',
      contact: {
        name: 'API Support',
        email: 'support@company.com',
      },
    },
    servers: [
      {
        url: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxxx123456789',
            },
            email: {
              type: 'string',
              format: 'email',
              example: 'admin@company.com',
            },
            name: {
              type: 'string',
              example: 'John Doe',
            },
            role: {
              type: 'string',
              enum: ['admin', 'operator', 'viewer'],
              example: 'admin',
            },
            avatar: {
              type: 'string',
              format: 'uri',
              example: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin@company.com',
            },
          },
        },
        Agent: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxxx123456789',
            },
            name: {
              type: 'string',
              example: 'Data Processing Agent',
            },
            description: {
              type: 'string',
              example: 'Processes and analyzes incoming data streams',
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'RUNNING', 'PAUSED'],
              example: 'ACTIVE',
            },
            category: {
              type: 'string',
              example: 'Data Processing',
            },
            enabled: {
              type: 'boolean',
              example: true,
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00Z',
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00Z',
            },
            lastActive: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00Z',
            },
            lastExecution: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2024-01-01T12:00:00Z',
            },
            executionCount: {
              type: 'integer',
              example: 42,
            },
            configuration: {
              type: 'object',
              example: {
                inputSource: 'api',
                outputFormat: 'json',
                processingRules: ['validate', 'transform', 'store'],
              },
            },
            createdBy: {
              allOf: [
                { $ref: '#/components/schemas/User' },
              ],
              nullable: true,
            },
            updatedBy: {
              allOf: [
                { $ref: '#/components/schemas/User' },
              ],
              nullable: true,
            },
          },
        },
        Execution: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxxx123456789',
            },
            agentId: {
              type: 'string',
              example: 'clxxx123456789',
            },
            status: {
              type: 'string',
              enum: ['SUCCESS', 'FAILED', 'RUNNING'],
              example: 'SUCCESS',
            },
            startTime: {
              type: 'string',
              format: 'date-time',
              example: '2024-01-01T12:00:00Z',
            },
            endTime: {
              type: 'string',
              format: 'date-time',
              nullable: true,
              example: '2024-01-01T12:05:00Z',
            },
            result: {
              type: 'string',
              nullable: true,
              example: 'Processed 1,250 records successfully',
            },
            error: {
              type: 'string',
              nullable: true,
              example: 'Connection timeout after 30 seconds',
            },
            logs: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  timestamp: {
                    type: 'string',
                    format: 'date-time',
                  },
                  level: {
                    type: 'string',
                    enum: ['info', 'warn', 'error', 'debug'],
                  },
                  message: {
                    type: 'string',
                  },
                  context: {
                    type: 'object',
                  },
                },
              },
            },
            agent: {
              type: 'object',
              properties: {
                name: {
                  type: 'string',
                },
                category: {
                  type: 'string',
                },
              },
            },
            triggeredBy: {
              allOf: [
                { $ref: '#/components/schemas/User' },
              ],
              nullable: true,
            },
          },
        },
        Flowchart: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              example: 'clxxx123456789',
            },
            agentId: {
              type: 'string',
              example: 'clxxx123456789',
            },
            version: {
              type: 'string',
              example: '1.0.0',
            },
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  type: {
                    type: 'string',
                    enum: ['start', 'end', 'process', 'decision'],
                  },
                  title: {
                    type: 'string',
                  },
                  description: {
                    type: 'string',
                  },
                  position: {
                    type: 'object',
                    properties: {
                      x: {
                        type: 'number',
                      },
                      y: {
                        type: 'number',
                      },
                    },
                  },
                },
              },
            },
            connections: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: {
                    type: 'string',
                  },
                  from: {
                    type: 'string',
                  },
                  to: {
                    type: 'string',
                  },
                  label: {
                    type: 'string',
                  },
                },
              },
            },
            metadata: {
              type: 'object',
              properties: {
                title: {
                  type: 'string',
                },
                description: {
                  type: 'string',
                },
                layout: {
                  type: 'string',
                },
              },
            },
            lastModified: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Authentication required',
            },
            message: {
              type: 'string',
              example: 'Please provide a valid JWT token',
            },
            details: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    './app/api/**/*.ts', // Path to the API docs
  ],
};

export const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
