// Server-only utilities for database operations
// This file should only be imported in API routes or server components

import { mongodb } from './mongodb';

// MongoDB connection helper - server-side only
export async function withMongoDB<T>(
  operation: () => Promise<T>
): Promise<T> {
  try {
    await mongodb.connect();
    return await operation();
  } finally {
    // Keep connection alive for subsequent requests
    // Connection will be managed by the singleton
  }
}

// Server-side error logging
export function logServerError(error: unknown, context: string): void {
  console.error(`[${context}] Server error:`, error);
}

// Validate environment variables
export function validateServerEnvironment(): void {
  const requiredEnvVars = ['DATABASE_URL', 'MONGODB_URI'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}
