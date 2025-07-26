import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/agents/{id}/executions:
 *   get:
 *     summary: Get execution records for a specific agent with filtering options
 *     tags: [Agents, Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [success, failed, running, pending]
 *         description: Filter by execution status
 *       - in: query
 *         name: startTimeFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter executions starting from this timestamp (ISO format)
 *       - in: query
 *         name: startTimeTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter executions starting up to this timestamp (ISO format)
 *       - in: query
 *         name: endTimeFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter executions ending from this timestamp (ISO format)
 *       - in: query
 *         name: endTimeTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Filter executions ending up to this timestamp (ISO format)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of results per page
 *     responses:
 *       200:
 *         description: List of execution records for the agent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 executions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Execution'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 agent:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     category:
 *                       type: string
 *       404:
 *         description: Agent not found
 */
async function getAgentExecutionsHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    // Check if agent exists
    const agent = await db.getAgentById(params.id);
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const startTimeFrom = searchParams.get('startTimeFrom');
    const startTimeTo = searchParams.get('startTimeTo');
    const endTimeFrom = searchParams.get('endTimeFrom');
    const endTimeTo = searchParams.get('endTimeTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    // Build filters
    const filters: any = { agentId: params.id };
    
    if (status) {
      // Map frontend status to backend status
      const statusMap: { [key: string]: string } = {
        'success': 'SUCCESS',
        'failed': 'FAILED',
        'running': 'RUNNING',
        'pending': 'PENDING'
      };
      filters.status = statusMap[status] || status.toUpperCase();
    }
    
    if (startTimeFrom || startTimeTo) {
      filters.startTime = {};
      if (startTimeFrom) filters.startTime.gte = new Date(startTimeFrom);
      if (startTimeTo) filters.startTime.lte = new Date(startTimeTo);
    }
    
    if (endTimeFrom || endTimeTo) {
      filters.endTime = {};
      if (endTimeFrom) filters.endTime.gte = new Date(endTimeFrom);
      if (endTimeTo) filters.endTime.lte = new Date(endTimeTo);
    }

    const result = await db.getExecutions(filters, page, limit);
    
    return NextResponse.json({
      ...result,
      agent: {
        id: agent.id,
        name: agent.name,
        category: agent.category
      }
    });
  } catch (error) {
    console.error('Error fetching agent executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent executions' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getAgentExecutionsHandler);
