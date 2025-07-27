import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { withAuth, withSecurity, withRateLimit, composeMiddleware, AuthenticatedRequest } from '@/lib/middleware';

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get comprehensive dashboard analytics and performance metrics
 *     description: Retrieves real-time statistics including agent counts, execution rates, success metrics, and performance data
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalAgents:
 *                       type: number
 *                       example: 15
 *                     activeAgents:
 *                       type: number
 *                       example: 12
 *                     totalExecutions:
 *                       type: number
 *                       example: 1250
 *                     recentExecutions:
 *                       type: number
 *                       example: 45
 *                     successRate:
 *                       type: number
 *                       example: 95.5
 *                     avgExecutionTime:
 *                       type: number
 *                       example: 120.5
 *                     agentsByCategory:
 *                       type: object
 *                       example:
 *                         "Data Processing": 5
 *                         "Communication": 3
 *                         "Analytics": 2
 *                     executionTrend:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           count:
 *                             type: number
 */
async function getDashboardStatsHandler(request: AuthenticatedRequest): Promise<NextResponse> {
  try {
    await db.initialize();
    
    const stats = await db.getDashboardStats();
    
    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const GET = composeMiddleware(
  withSecurity,
  withRateLimit(100),
  withAuth('viewer')
)(getDashboardStatsHandler);
