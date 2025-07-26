import { prisma } from './prisma';
import { Agent, Execution, Flowchart } from '@/types/agent';

type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'PAUSED';
type ExecutionStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING';

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
  }) {
    return await prisma.agent.create({
      data,
    });
  }

  async getAgents(filters?: {
    status?: AgentStatus;
    category?: string;
    search?: string;
  }) {
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

    return await prisma.agent.findMany({
      where,
      include: {
        executions: {
          orderBy: { startTime: 'desc' },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAgentById(id: string) {
    return await prisma.agent.findUnique({
      where: { id },
      include: {
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
  }) {
    const execution = await prisma.execution.create({
      data,
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

  async getExecutions(agentId?: string, limit: number = 50) {
    const where = agentId ? { agentId } : {};

    return await prisma.execution.findMany({
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
      take: limit,
    });
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
    metadata: {
      title: string;
      description: string;
      layout: string;
    };
  }) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.createFlowchart(data);
  }

  async getFlowchartByAgentId(agentId: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.getFlowchartByAgentId(agentId);
  }

  async updateFlowchart(id: string, updates: Partial<Flowchart>) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.updateFlowchart(id, updates);
  }

  async deleteFlowchart(id: string) {
    const flowchartService = await this.getFlowchartService();
    return await flowchartService.deleteFlowchart(id);
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
    const [totalAgents, activeAgents, totalExecutions, recentExecutions] = await Promise.all([
      prisma.agent.count(),
      prisma.agent.count({ where: { status: 'ACTIVE' } }),
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
      activeAgents,
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
