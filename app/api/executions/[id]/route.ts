import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/executions/{id}:
 *   get:
 *     summary: Get execution details by ID
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
 *     responses:
 *       200:
 *         description: Execution details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 execution:
 *                   $ref: '#/components/schemas/Execution'
 *       404:
 *         description: Execution not found
 */
async function getExecutionHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const execution = await db.getExecutionById(params.id);
    
    if (!execution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Error fetching execution:', error);
    return NextResponse.json(
      { error: 'Failed to fetch execution' },
      { status: 500 }
    );
  }
}

/**
 * @swagger
 * /api/executions/{id}:
 *   put:
 *     summary: Update execution status and results
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [SUCCESS, FAILED, RUNNING]
 *               result:
 *                 type: string
 *               error:
 *                 type: string
 *               logs:
 *                 type: array
 *                 items:
 *                   type: object
 *     responses:
 *       200:
 *         description: Execution updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 execution:
 *                   $ref: '#/components/schemas/Execution'
 *       404:
 *         description: Execution not found
 */
async function updateExecutionHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const body = await request.json();
    
    // Check if execution exists
    const existingExecution = await db.getExecutionById(params.id);
    if (!existingExecution) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (body.status !== undefined) {
      updateData.status = body.status;
      // Auto-set end time if execution is completed
      if (['SUCCESS', 'FAILED'].includes(body.status) && !existingExecution.endTime) {
        updateData.endTime = new Date();
      }
    }
    if (body.result !== undefined) updateData.result = body.result;
    if (body.error !== undefined) updateData.error = body.error;
    if (body.logs !== undefined) updateData.logs = body.logs;

    const execution = await db.updateExecution(params.id, updateData);
    
    return NextResponse.json({ execution });
  } catch (error) {
    console.error('Error updating execution:', error);
    return NextResponse.json(
      { error: 'Failed to update execution' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getExecutionHandler);

export const PUT = composeMiddleware(
  withSecurity,
  withRateLimit(50),
  withAuth('operator')
)(updateExecutionHandler);
