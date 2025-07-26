import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';
import { validateRequestData, validationPatterns } from '@/lib/auth';

type AgentStatus = 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'PAUSED';

/**
 * @swagger
 * /api/agents/{id}:
 *   get:
 *     summary: Get agent by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agent:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 */
async function getAgentHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const agent = await db.getAgentById(params.id);
    
    if (!agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error fetching agent:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agent' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agents/{id}:
 *   put:
 *     summary: Update agent by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [ACTIVE, INACTIVE, RUNNING, PAUSED]
 *               category:
 *                 type: string
 *               configuration:
 *                 type: object
 *               enabled:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Agent updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 agent:
 *                   $ref: '#/components/schemas/Agent'
 *       404:
 *         description: Agent not found
 */
async function updateAgentHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    // Validate request data (optional fields for update)
    const validation = validateRequestData(body, {
      name: {
        type: 'string',
        minLength: 1,
        maxLength: 100,
        pattern: validationPatterns.agentName
      },
      description: {
        type: 'string',
        minLength: 1,
        maxLength: 500
      },
      category: {
        type: 'string',
        minLength: 1,
        maxLength: 50
      },
      status: {
        type: 'string',
        enum: ['ACTIVE', 'INACTIVE', 'RUNNING', 'PAUSED']
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

    // Check if agent exists
    const existingAgent = await db.getAgentById(params.id);
    if (!existingAgent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Update with user tracking
    const updateData = {
      ...body,
      updatedById: request.user?.id,
      lastActive: new Date(),
    };
    
    const agent = await db.updateAgent(params.id, updateData);
    
    return NextResponse.json({ agent });
  } catch (error) {
    console.error('Error updating agent:', error);
    return NextResponse.json(
      { error: 'Failed to update agent' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agents/{id}:
 *   delete:
 *     summary: Delete agent by ID
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent ID
 *     responses:
 *       200:
 *         description: Agent deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Agent deleted successfully"
 *       404:
 *         description: Agent not found
 *       403:
 *         description: Insufficient permissions
 */
async function deleteAgentHandler(
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

    await db.deleteAgent(params.id);
    
    return NextResponse.json({ 
      message: 'Agent deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting agent:', error);
    return NextResponse.json(
      { error: 'Failed to delete agent' },
      { status: 500 }
    );
  }
}

// Apply middleware with appropriate permissions
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getAgentHandler);

export const PUT = composeMiddleware(
  withSecurity,
  withRateLimit(50),
  withAuth('operator')
)(updateAgentHandler);

export const DELETE = composeMiddleware(
  withSecurity,
  withRateLimit(20),
  withAuth('admin') // Only admins can delete agents
)(deleteAgentHandler);
