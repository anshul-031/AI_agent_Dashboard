import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Database utility functions
export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString();
}

export function formatDuration(startTime: Date | string, endTime?: Date | string): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = endTime ? (typeof endTime === 'string' ? new Date(endTime) : endTime) : new Date();
  
  const diff = end.getTime() - start.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`;
  } else {
    return `${seconds}s`;
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'success':
      return 'text-green-600 bg-green-100';
    case 'running':
      return 'text-blue-600 bg-blue-100';
    case 'failed':
    case 'error':
      return 'text-red-600 bg-red-100';
    case 'inactive':
    case 'paused':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-gray-600 bg-gray-100';
  }
}

export function getStatusIcon(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'success':
      return '✓';
    case 'running':
      return '▶';
    case 'failed':
    case 'error':
      return '✗';
    case 'inactive':
    case 'paused':
      return '⏸';
    default:
      return '•';
  }
}

// Error handling utilities
export function handleDatabaseError(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unknown database error occurred';
}

// Validation utilities
export function validateAgentData(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    errors.push('Agent name is required');
  }
  
  if (!data.description || typeof data.description !== 'string') {
    errors.push('Agent description is required');
  }
  
  if (!data.category || typeof data.category !== 'string') {
    errors.push('Agent category is required');
  }
  
  const validStatuses = ['ACTIVE', 'INACTIVE', 'RUNNING', 'PAUSED'];
  if (!data.status || !validStatuses.includes(data.status)) {
    errors.push('Valid agent status is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}
