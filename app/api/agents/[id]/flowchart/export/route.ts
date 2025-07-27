import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/agents/{id}/flowchart/export:
 *   get:
 *     summary: Export agent flowchart
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
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, png, svg]
 *         description: Export format
 *     responses:
 *       200:
 *         description: Flowchart exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 flowchart:
 *                   $ref: '#/components/schemas/Flowchart'
 *                 exportData:
 *                   type: object
 *       404:
 *         description: Flowchart not found
 */
async function exportFlowchartHandler(
  request: AuthenticatedRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    
    const flowchart = await db.getFlowchartByAgentId(params.id);
    if (!flowchart) {
      return NextResponse.json(
        { error: 'Flowchart not found' },
        { status: 404 }
      );
    }

    const exportResult = await db.exportFlowchart(flowchart.id);
    if (!exportResult) {
      return NextResponse.json(
        { error: 'Failed to export flowchart' },
        { status: 500 }
      );
    }

    // Set appropriate headers for download
    const headers = new Headers();
    
    switch (format) {
      case 'json':
        headers.set('Content-Type', 'application/json');
        headers.set('Content-Disposition', `attachment; filename="${flowchart.metadata.title.replace(/\s+/g, '_')}_flowchart.json"`);
        break;
      case 'png':
      case 'svg':
        // For image formats, we would need to implement server-side rendering
        return NextResponse.json(
          { error: 'Image export formats not yet implemented' },
          { status: 501 }
        );
      default:
        return NextResponse.json(
          { error: 'Unsupported export format' },
          { status: 400 }
        );
    }

    return NextResponse.json(exportResult, { headers });
  } catch (error) {
    console.error('Error exporting flowchart:', error);
    return NextResponse.json(
      { error: 'Failed to export flowchart' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(50),
  withAuth('viewer')
)(exportFlowchartHandler);
