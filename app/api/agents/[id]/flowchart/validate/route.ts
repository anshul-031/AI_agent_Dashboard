import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/agents/{id}/flowchart/validate:
 *   post:
 *     summary: Validate agent flowchart
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
 *               nodes:
 *                 type: array
 *               connections:
 *                 type: array
 *     responses:
 *       200:
 *         description: Validation result
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *       400:
 *         description: Invalid request data
 */
async function validateFlowchartHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    if (!body.nodes && !body.connections) {
      return NextResponse.json(
        { error: 'Nodes or connections data required for validation' },
        { status: 400 }
      );
    }

    const validation = await db.validateFlowchart(body);
    
    return NextResponse.json(validation);
  } catch (error) {
    console.error('Error validating flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to validate flowchart' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const POST = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(validateFlowchartHandler);
