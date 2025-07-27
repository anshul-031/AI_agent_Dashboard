import { type AgentStatus } from '@/lib/constants';
import { type ExecutionStatus } from '@/lib/constants';

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
  status: ExecutionStatus
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
    z?: number // Z-index for layering
  }
  size?: {
    width: number
    height: number
  }
  config?: Record<string, any>
  chronology: {
    order: number // Execution order in the workflow
    createdAt: string
    updatedAt: string
  }
}

export interface FlowchartConnection {
  id: string
  from: string
  to: string
  label?: string
  condition?: string
  path?: {
    type: 'straight' | 'curved' | 'stepped'
    points?: Array<{ x: number; y: number }> // Custom path points
  }
  chronology: {
    order: number // Connection order for execution flow
    createdAt: string
    updatedAt: string
  }
}

export interface FlowchartLayout {
  canvasSize: {
    width: number
    height: number
  }
  zoom: number
  pan: {
    x: number
    y: number
  }
  gridSize: number
  snapToGrid: boolean
}

export interface Flowchart {
  id: string
  agentId: string
  version: string
  nodes: FlowchartNode[]
  connections: FlowchartConnection[]
  layout: FlowchartLayout
  metadata: {
    title: string
    description: string
    layoutVersion: string
    tags?: string[]
  }
  chronology: {
    createdAt: string
    lastModified: string
    version: string
    changeLog?: Array<{
      timestamp: string
      userId?: string
      action: string
      details: string
    }>
  }
}