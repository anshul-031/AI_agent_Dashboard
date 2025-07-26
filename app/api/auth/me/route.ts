import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth';
import { withSecurity } from '@/lib/middleware';

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current user information
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Authentication required
 */
async function meHandler(request: NextRequest): Promise<NextResponse> {
  const user = authenticateRequest(request);
  
  if (!user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
    }
  });
}

export const GET = withSecurity(meHandler);
