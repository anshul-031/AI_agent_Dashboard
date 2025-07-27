import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/agents/{id}/flowchart/duplicate:
 *   post:
 *     summary: Duplicate agent flowchart
 *     tags: [Flowcharts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Source Agent ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - targetAgentId
 *             properties:
 *               targetAgentId:
 *                 type: string
 *                 description: Target agent ID to duplicate flowchart to
 *     responses:
 *       201:
 *         description: Flowchart duplicated successfully
 *       404:
 *         description: Source flowchart or target agent not found
 *       409:
 *         description: Target agent already has a flowchart
 */
async function duplicateFlowchartHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    const { targetAgentId } = body;
    
    if (!targetAgentId) {
      return NextResponse.json(
        { error: 'Target agent ID is required' },
        { status: 400 }
      );
    }

    // Check if source flowchart exists
    const sourceFlowchart = await db.getFlowchartByAgentId(params.id);
    if (!sourceFlowchart) {
      return NextResponse.json(
        { error: 'Source flowchart not found' },
        { status: 404 }
      );
    }

    // Check if target agent exists
    const targetAgent = await db.getAgentById(targetAgentId);
    if (!targetAgent) {
      return NextResponse.json(
        { error: 'Target agent not found' },
        { status: 404 }
      );
    }

    // Check if target agent already has a flowchart
    const existingFlowchart = await db.getFlowchartByAgentId(targetAgentId);
    if (existingFlowchart) {
      return NextResponse.json(
        { error: 'Target agent already has a flowchart' },
        { status: 409 }
      );
    }

    const duplicatedFlowchart = await db.duplicateFlowchart(
      sourceFlowchart.id,
      targetAgentId,
      request.user?.id
    );

    if (!duplicatedFlowchart) {
      return NextResponse.json(
        { error: 'Failed to duplicate flowchart' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      flowchart: duplicatedFlowchart,
      message: 'Flowchart duplicated successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to duplicate flowchart' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const POST = composeMiddleware(
  withSecurity,
  withRateLimit(20),
  withAuth('operator')
)(duplicateFlowchartHandler);
