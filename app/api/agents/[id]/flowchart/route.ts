import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';
import { validateRequestData } from '@/lib/auth';

/**
 * @swagger
 * /api/agents/{id}/flowchart:
 *   get:
 *     summary: Get agent flowchart
 *     tags: [Flowcharts]
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
 *         description: Agent flowchart
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flowchart:
 *                   $ref: '#/components/schemas/Flowchart'
 *       404:
 *         description: Agent or flowchart not found
 */
async function getFlowchartHandler(
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
    
    const flowchart = await db.getFlowchartByAgentId(params.id);
    
    if (!flowchart) {
      return NextResponse.json(
        { error: 'Flowchart not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ flowchart });
  } catch (error) {
    console.error('Error fetching flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flowchart' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agents/{id}/flowchart:
 *   post:
 *     summary: Create agent flowchart
 *     tags: [Flowcharts]
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
 *             required:
 *               - version
 *               - nodes
 *               - connections
 *               - metadata
 *             properties:
 *               version:
 *                 type: string
 *                 example: "1.0.0"
 *               nodes:
 *                 type: array
 *                 items:
 *                   type: object
 *               connections:
 *                 type: array
 *                 items:
 *                   type: object
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Flowchart created successfully
 *       404:
 *         description: Agent not found
 */
async function createFlowchartHandler(
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

    const body = await request.json();
    
    // Check if flowchart already exists
    const existingFlowchart = await db.getFlowchartByAgentId(params.id);
    if (existingFlowchart) {
      return NextResponse.json(
        { error: 'Flowchart already exists for this agent. Use PUT to update.' },
        { status: 409 }
      );
    }

    // Validate flowchart data
    const validation = await db.validateFlowchart(body);
    if (!validation.valid) {
      return NextResponse.json(
        { error: 'Invalid flowchart data', details: validation.errors },
        { status: 400 }
      );
    }

    // Set defaults for enhanced schema
    const flowchartData = {
      agentId: params.id,
      version: body.version || '1.0.0',
      nodes: body.nodes || [],
      connections: body.connections || [],
      layout: body.layout || {
        canvasSize: { width: 1200, height: 800 },
        zoom: 1,
        pan: { x: 0, y: 0 },
        gridSize: 20,
        snapToGrid: true
      },
      metadata: body.metadata || {
        title: `${agent.name} Flowchart`,
        description: 'Agent execution flowchart',
        layoutVersion: 'v2.0',
        tags: []
      }
    };

    const flowchart = await db.createFlowchart(flowchartData);

    return NextResponse.json({ flowchart }, { status: 201 });
  } catch (error) {
    console.error('Error creating flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to create flowchart' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agents/{id}/flowchart:
 *   put:
 *     summary: Update agent flowchart
 *     tags: [Flowcharts]
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
 *               version:
 *                 type: string
 *               nodes:
 *                 type: array
 *               connections:
 *                 type: array
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Flowchart updated successfully
 *       404:
 *         description: Agent or flowchart not found
 */
async function updateFlowchartHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    const userId = request.user?.id;
    
    const flowchart = await db.getFlowchartByAgentId(params.id);
    if (!flowchart) {
      return NextResponse.json(
        { error: 'Flowchart not found' },
        { status: 404 }
      );
    }

    // Validate flowchart data if provided
    if (body.nodes || body.connections) {
      const validation = await db.validateFlowchart({
        nodes: body.nodes || flowchart.nodes,
        connections: body.connections || flowchart.connections
      });
      
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid flowchart data', details: validation.errors },
          { status: 400 }
        );
      }
    }

    // Determine the action for audit log
    let action = 'updated';
    if (body.nodes && body.nodes.length !== flowchart.nodes.length) {
      action = body.nodes.length > flowchart.nodes.length ? 'nodes_added' : 'nodes_removed';
    } else if (body.connections && body.connections.length !== flowchart.connections.length) {
      action = body.connections.length > flowchart.connections.length ? 'connections_added' : 'connections_removed';
    } else if (body.layout) {
      action = 'layout_updated';
    }

    const updated = await db.updateFlowchart(flowchart.id, body, userId, action);
    
    if (!updated) {
      return NextResponse.json(
        { error: 'Failed to update flowchart' },
        { status: 500 }
      );
    }

    const updatedFlowchart = await db.getFlowchartByAgentId(params.id);
    return NextResponse.json({ 
      flowchart: updatedFlowchart,
      message: 'Flowchart saved successfully'
    });
  } catch (error) {
    console.error('Error updating flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to update flowchart' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/agents/{id}/flowchart:
 *   delete:
 *     summary: Delete agent flowchart
 *     tags: [Flowcharts]
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
 *         description: Flowchart deleted successfully
 *       404:
 *         description: Flowchart not found
 */
async function deleteFlowchartHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const existingFlowchart = await db.getFlowchartByAgentId(params.id);
    if (!existingFlowchart) {
      return NextResponse.json(
        { error: 'Flowchart not found' },
        { status: 404 }
      );
    }

    await db.deleteFlowchart(existingFlowchart.id);

    return NextResponse.json({ 
      message: 'Flowchart deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to delete flowchart' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getFlowchartHandler);

export const POST = composeMiddleware(
  withSecurity,
  withRateLimit(50),
  withAuth('operator')
)(createFlowchartHandler);

export const PUT = composeMiddleware(
  withSecurity,
  withRateLimit(50),
  withAuth('operator')
)(updateFlowchartHandler);

export const DELETE = composeMiddleware(
  withSecurity,
  withRateLimit(20),
  withAuth('admin')
)(deleteFlowchartHandler);
