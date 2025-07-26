import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { validateAgentData } from '@/lib/utils';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';
import { validateRequestData, validationPatterns } from '@/lib/auth';
import { AGENT_STATUS, AGENT_STATUS_OPTIONS, type AgentStatus } from '@/lib/constants';

/**
 * @swagger
 * /api/agents:
 *   get:
 *     summary: Get all agents with filtering options
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Running, Idle, Error]
 *         description: Filter by agent status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by agent category
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Case-insensitive search in name and description
 *       - in: query
 *         name: createdBy
 *         schema:
 *           type: string
 *         description: Filter by creator user ID
 *       - in: query
 *         name: enabled
 *         schema:
 *           type: boolean
 *         description: Filter by enabled status
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 *                 total:
 *                   type: number
 *                 page:
 *                   type: number
 *                 limit:
 *                   type: number
 */
async function getAgentsHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') as AgentStatus | null;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const createdBy = searchParams.get('createdBy');
    const enabled = searchParams.get('enabled') === 'true' ? true : 
                   searchParams.get('enabled') === 'false' ? false : undefined;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const filters: any = {};
    if (status) filters.status = status;
    if (category) filters.category = category;
    if (search) filters.search = search;
    if (createdBy) filters.createdBy = createdBy;
    if (enabled !== undefined) filters.enabled = enabled;

    const result = await db.getAgents(filters, page, limit);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agents:
 *   post:
 *     summary: Create a new agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - category
 *               - status
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Data Processing Agent"
 *               description:
 *                 type: string
 *                 example: "Processes and analyzes incoming data streams"
 *               category:
 *                 type: string
 *                 example: "Data Processing"
 *               status:
 *                 type: string
 *                 enum: [Running, Idle, Error]
 *                 example: "Running"
 *               configuration:
 *                 type: object
 *                 example: {"inputSource": "api", "outputFormat": "json"}
 *               enabled:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Agent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agent:
 *                   $ref: '#/components/schemas/Agent'
 */
async function createAgentHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    // Validate request data
    const validation = validateRequestData(body, {
      name: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: validationPatterns.agentName
      },
      description: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 500
      },
      category: {
        required: true,
        type: 'string',
        minLength: 1,
        maxLength: 50
      },
      status: {
        required: true,
        type: 'string',
        enum: AGENT_STATUS_OPTIONS.map(opt => opt.value)
      },
      enabled: {
        type: 'boolean'
      }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const agent = await db.createAgent({
      name: body.name,
      description: body.description,
      status: body.status,
      category: body.category,
      configuration: body.configuration,
      enabled: body.enabled !== undefined ? body.enabled : true,
      createdById: request.user?.id
    });

    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    console.error('Error creating agent:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getAgentsHandler);

export const POST = composeMiddleware(
  withSecurity,
  withRateLimit(20),
  withAuth('operator')
)(createAgentHandler);
