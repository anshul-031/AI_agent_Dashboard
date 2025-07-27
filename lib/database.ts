import { prisma } from './prisma';
import { Agent, Execution, Flowchart } from '@/types/agent';
import { AgentStatus } from '@prisma/client';
import { AGENT_STATUS } from '@/lib/constants';

type ExecutionStatus = 'SUCCESS' | 'FAILED' | 'RUNNING';

export class DatabaseService {
  private flowchartService: any = null;

  constructor() {
    // Don't initialize anything during construction to avoid build-time issues
  }

  private async getFlowchartService() {
    if (!this.flowchartService && typeof window === 'undefined') {
      const { FlowchartService } = await import('./mongodb');
      this.flowchartService = new FlowchartService();
    }
    return this.flowchartService;
  }

  async initialize() {
    // Only initialize on server side
    if (typeof window === 'undefined') {
      await this.getFlowchartService();
    }
  }

  async cleanup() {
    if (typeof window === 'undefined') {
      const { mongodb } = await import('./mongodb');
      await mongodb.disconnect();
    }
    await prisma.$disconnect();
  }

  // Agent operations (PostgreSQL)
  async createAgent(data: {
    name: string;
    description: string;
    status: AgentStatus;
    category: string;
    configuration?: any;
    enabled?: boolean;
    createdById?: string;
  }) {
    return await prisma.agent.create({
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        category: data.category,
        configuration: data.configuration,
        enabled: data.enabled !== undefined ? data.enabled : true,
        createdById: data.createdById,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        executions: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
    });
  }

  async getAgents(filters?: {
    status?: AgentStatus;
    category?: string;
    search?: string;
    createdBy?: string;
    enabled?: boolean;
  }, page: number = 1, limit: number = 10) {
    const where: any = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.createdBy) {
      // Check if it's a user ID (UUID format) or a name
      if (filters.createdBy.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        where.createdById = filters.createdBy;
      } else {
        // Filter by creator name
        where.createdBy = {
          name: { contains: filters.createdBy, mode: 'insensitive' }
        };
      }
    }

    if (filters?.enabled !== undefined) {
      where.enabled = filters.enabled;
    }

    const skip = (page - 1) * limit;

    const [agents, total] = await Promise.all([
      prisma.agent.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          executions: {
            orderBy: { startTime: 'desc' },
            take: 1,
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.agent.count({ where }),
    ]);

    return {
      agents,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getAgentById(id: string) {
    return await prisma.agent.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        executions: {
          orderBy: { startTime: 'desc' },
        },
      },
    });
  }

  async updateAgent(id: string, data: any) {
    return await prisma.agent.update({
      where: { id },
      data,
    });
  }

  async deleteAgent(id: string) {
    // Delete associated flowchart from MongoDB
    const flowchartService = await this.getFlowchartService();
    if (flowchartService) {
      const flowchart = await flowchartService.getFlowchartByAgentId(id);
      if (flowchart) {
        await flowchartService.deleteFlowchart(flowchart.id);
      }
    }

    // Delete agent and related executions from PostgreSQL (cascade will handle executions)
    return await prisma.agent.delete({
      where: { id },
    });
  }

  // Execution operations (PostgreSQL)
  async createExecution(data: {
    agentId: string;
    status: ExecutionStatus;
    result?: string;
    error?: string;
    logs?: any;
    triggeredById?: string;
  }) {
    const execution = await prisma.execution.create({
      data,
      include: {
        agent: {
          select: {
            name: true,
            category: true,
          },
        },
      },
    });

    // Update agent's execution count and last execution time
    await prisma.agent.update({
      where: { id: data.agentId },
      data: {
        executionCount: { increment: 1 },
        lastExecution: new Date(),
      },
    });

    return execution;
  }

  async updateExecution(id: string, data: {
    status?: ExecutionStatus;
    endTime?: Date;
    result?: string;
    error?: string;
    logs?: any;
  }) {
    return await prisma.execution.update({
      where: { id },
      data,
    });
  }

  async getExecutions(filters?: {
    agentId?: string;
    status?: ExecutionStatus;
    startTime?: { gte?: Date; lte?: Date };
    endTime?: { gte?: Date; lte?: Date };
  }, page: number = 1, limit: number = 50) {
    const where: any = {};

    if (filters?.agentId) {
      where.agentId = filters.agentId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.startTime) {
      where.startTime = filters.startTime;
    }

    if (filters?.endTime) {
      where.endTime = filters.endTime;
    }

    const skip = (page - 1) * limit;

    const [executions, total] = await Promise.all([
      prisma.execution.findMany({
        where,
        include: {
          agent: {
            select: {
              name: true,
              category: true,
            },
          },
        },
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      }),
      prisma.execution.count({ where }),
    ]);

    return {
      executions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getExecutionById(id: string) {
    return await prisma.execution.findUnique({
      where: { id },
      include: {
        agent: true,
      },
    });
  }

  // Flowchart operations (MongoDB)
  async createFlowchart(data: {
    agentId: string;
    version: string;
    nodes: any[];
    connections: any[];
    layout: any;
    metadata: {
      title: string;
      description: string;
      layoutVersion: string;
    };
  }) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.createFlowchart(data);
  }

  async getFlowchartByAgentId(agentId: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.getFlowchartByAgentId(agentId);
  }

  async updateFlowchart(id: string, updates: Partial<Flowchart>, userId?: string, action?: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.updateFlowchart(id, updates, userId, action);
  }

  async deleteFlowchart(id: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.deleteFlowchart(id);
  }

  async validateFlowchart(flowchart: Partial<Flowchart>) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.validateFlowchart(flowchart);
  }

  async exportFlowchart(id: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.exportFlowchart(id);
  }

  async duplicateFlowchart(id: string, newAgentId: string, userId?: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.duplicateFlowchart(id, newAgentId, userId);
  }

  // Combined operations
  async getAgentWithFlowchart(agentId: string) {
    const [agent, flowchart] = await Promise.all([
      this.getAgentById(agentId),
      this.getFlowchartByAgentId(agentId),
    ]);

    return {
      agent,
      flowchart,
    };
  }

  async getDashboardStats() {
    const [totalAgents, idleAgents, totalExecutions, recentExecutions] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { status: 'Idle' } }),
      prisma.execution.count(),
      prisma.execution.count({
        where: {
          startTime: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      }),
    ]);

    const successRate = totalExecutions > 0 
      ? await prisma.execution.count({ where: { status: 'SUCCESS' } }) / totalExecutions * 100
      : 0;

    return {
      totalAgents,
      idleAgents,
      totalExecutions,
      recentExecutions,
      successRate: Math.round(successRate * 100) / 100,
    };
  }
}

// Create a singleton instance - but don't initialize anything until needed
let dbInstance: DatabaseService | null = null;

export function getDatabase(): DatabaseService {
  if (!dbInstance) {
    dbInstance = new DatabaseService();
  }
  return dbInstance;
}

export const db = getDatabase();
