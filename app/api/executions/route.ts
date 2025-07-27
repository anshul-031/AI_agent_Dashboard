import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';
import { validateRequestData } from '@/lib/auth';

type ExecutionStatus = 'SUCCESS' | 'FAILED' | 'RUNNING';

/**
 * @swagger
 * /api/executions:
 *   get:
 *     summary: Get executions with filtering options
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: agentId
 *         schema:
 *           type: string
 *         description: Filter by agent ID
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [SUCCESS, FAILED, RUNNING]
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
 *         description: List of executions
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
 */
async function getExecutionsHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status') as ExecutionStatus | null;
    const startTimeFrom = searchParams.get('startTimeFrom');
    const startTimeTo = searchParams.get('startTimeTo');
    const endTimeFrom = searchParams.get('endTimeFrom');
    const endTimeTo = searchParams.get('endTimeTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: any = {};
    if (agentId) filters.agentId = agentId;
    if (status) filters.status = status;
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
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching executions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch executions' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/executions:
 *   post:
 *     summary: Create a new execution
 *     tags: [Executions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - agentId
 *             properties:
 *               agentId:
 *                 type: string
 *                 example: "clxxx123456789"
 *               status:
 *                 type: string
 *                 enum: [SUCCESS, FAILED, RUNNING]
 *                 example: "RUNNING"
 *               result:
 *                 type: string
 *                 example: "Process completed successfully"
 *               error:
 *                 type: string
 *                 example: "Connection timeout"
 *               logs:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                     level:
 *                       type: string
 *                       enum: [info, warn, error, debug]
 *                     message:
 *                       type: string
 *     responses:
 *       201:
 *         description: Execution created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 execution:
 *                   $ref: '#/components/schemas/Execution'
 */
async function createExecutionHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    console.log('Received execution request body:', body);
    
    // Validate request data
    const validation = validateRequestData(body, {
      agentId: {
        required: true,
        type: 'string',
        minLength: 1
      },
      status: {
        type: 'string',
        enum: ['SUCCESS', 'FAILED', 'RUNNING']
      }
    });

    if (!validation.isValid) {
      console.log('Validation failed:', validation.errors);
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    console.log('Creating execution with agentId:', body.agentId);
    console.log('User from request:', request.user);

    // Verify agent exists
    const agent = await db.getAgentById(body.agentId);
    console.log('Agent found:', agent ? `${agent.name} (${agent.id})` : 'null');
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const executionData = {
      agentId: body.agentId,
      status: body.status as ExecutionStatus || 'RUNNING',
      result: body.result,
      error: body.error,
      logs: body.logs,
      ...(request.user?.id ? { triggeredById: request.user.id } : {}),
    };
    console.log('Execution data to create:', executionData);

    const execution = await db.createExecution(executionData);

    return NextResponse.json({ execution }, { status: 201 });
  } catch (error) {
    console.error('Error creating execution:', error);
    return NextResponse.json(
      { error: 'Failed to create execution' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getExecutionsHandler);

export const POST = composeMiddleware(
  withSecurity,
  withRateLimit(50),
  withAuth('operator')
)(createExecutionHandler);
