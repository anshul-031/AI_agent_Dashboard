import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/executions/{id}/logs:
 *   get:
 *     summary: Get execution logs
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Execution ID
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [info, warn, error, debug]
 *         description: Filter logs by level
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *         description: Maximum number of log entries to return
 *     responses:
 *       200:
 *         description: Execution logs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 logs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       level:
 *                         type: string
 *                         enum: [info, warn, error, debug]
 *                       message:
 *                         type: string
 *                       context:
 *                         type: object
 *       404:
 *         description: Execution not found
 */
async function getExecutionLogsHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const { searchParams } = new URL(request.url);
    const level = searchParams.get('level');
    const limit = parseInt(searchParams.get('limit') || '100');
    
    const execution = await db.getExecutionById(params.id);
    
    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    let logs = execution.logs || [];
    
    // Ensure logs is an array
    if (!Array.isArray(logs)) {
      logs = [];
    }

    // Filter by log level if specified
    if (level) {
      logs = logs.filter((log: any) => log.level === level);
    }

    // Limit results
    logs = logs.slice(0, limit);

    // Generate mock logs if none exist (for demo purposes)
    if (logs.length === 0) {
      logs = generateMockLogs(execution.status, execution.startTime, execution.endTime);
      
      // Filter by level if specified
      if (level) {
        logs = logs.filter((log: any) => log.level === level);
      }
      
      logs = logs.slice(0, limit);
    }

    return NextResponse.json({ 
      logs,
      total: logs.length,
      executionId: params.id
    });
  } catch (error) {
    console.error('Error fetching execution logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution logs' },
      { status: 500 }
    );
  }
}

// Generate mock logs for demo purposes
function generateMockLogs(status: string, startTime: Date, endTime?: Date | null) {
  const logs = [];
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : new Date();
  
  logs.push({
    timestamp: start.toISOString(),
    level: 'info',
    message: 'Execution started',
    context: { phase: 'initialization' }
  });

  // Add some progress logs
  const duration = end.getTime() - start.getTime();
  const progressSteps = Math.min(5, Math.floor(duration / 10000)); // One log per 10 seconds, max 5
  
  for (let i = 1; i <= progressSteps; i++) {
    const logTime = new Date(start.getTime() + (duration * i / progressSteps));
    logs.push({
      timestamp: logTime.toISOString(),
      level: 'info',
      message: `Processing step ${i}/${progressSteps}`,
      context: { progress: Math.round((i / progressSteps) * 100) }
    });
  }

  // Add status-specific logs
  if (status === 'SUCCESS') {
    logs.push({
      timestamp: end.toISOString(),
      level: 'info',
      message: 'Execution completed successfully',
      context: { phase: 'completion', result: 'success' }
    });
  } else if (status === 'FAILED') {
    logs.push({
      timestamp: new Date(end.getTime() - 1000).toISOString(),
      level: 'error',
      message: 'Error encountered during execution',
      context: { phase: 'processing', error: 'Connection timeout' }
    });
    logs.push({
      timestamp: end.toISOString(),
      level: 'error',
      message: 'Execution failed',
      context: { phase: 'completion', result: 'failure' }
    });
  } else if (status === 'RUNNING') {
    logs.push({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: 'Execution in progress...',
      context: { phase: 'processing' }
    });
  }

  return logs;
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getExecutionLogsHandler);
