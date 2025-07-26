// Agent Status Enum Values (matches Prisma schema)
export const AGENT_STATUS = {
  RUNNING: 'Running',
  IDLE: 'Idle', 
  ERROR: 'Error'
} as const;

// Import the actual Prisma enum type
export type AgentStatus = 'Running' | 'Idle' | 'Error';

// Agent Status Options for UI
export const AGENT_STATUS_OPTIONS = [
  { value: 'Running' as const, label: 'Running' },
  { value: 'Idle' as const, label: 'Idle' },
  { value: 'Error' as const, label: 'Error' }
];

// Execution Status Enum Values
export const EXECUTION_STATUS = {
  SUCCESS: 'SUCCESS',
  FAILED: 'FAILED', 
  RUNNING: 'RUNNING',
  PENDING: 'PENDING'
} as const;

export type ExecutionStatus = typeof EXECUTION_STATUS[keyof typeof EXECUTION_STATUS];

// Agent Categories
export const AGENT_CATEGORIES = [
  'Data Processing',
  'Communication', 
  'Analytics',
  'Automation',
  'Monitoring',
  'Testing',
  'Customer Service',
  'Other'
];

// Default values
export const DEFAULT_AGENT_STATUS: AgentStatus = 'Idle';
export const DEFAULT_AGENT_ENABLED = true;
