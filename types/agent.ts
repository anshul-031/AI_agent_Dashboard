import { type AgentStatus } from '@/lib/constants';

export interface Agent {
  id: string
  name: string
  description: string
  status: AgentStatus
  category: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  lastActive: string
  lastExecution: string | null
  executionCount: number
  configuration?: Record<string, any>
  createdById?: string
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

export interface Execution {
  id: string
  agentId: string
  status: 'success' | 'failed' | 'running' | 'pending'
  startTime: string
  endTime?: string
  result?: string
  error?: string
  logs?: ExecutionLog[]
}

export interface ExecutionLog {
  timestamp: string
  level: 'info' | 'warn' | 'error'
  message: string
}

export interface FlowchartNode {
  id: string
  type: 'start' | 'end' | 'process' | 'decision'
  title: string
  description?: string
  position: {
    x: number
    y: number
  }
  config?: Record<string, any>
}

export interface FlowchartConnection {
  id: string
  from: string
  to: string
  label?: string
  condition?: string
}

export interface Flowchart {
  id: string
  agentId: string
  version: string
  nodes: FlowchartNode[]
  connections: FlowchartConnection[]
  metadata: {
    title: string
    description: string
    layout: string
  }
  lastModified: string
}