import { NextRequest, NextResponse } from 'next/server';
import { withSecurity } from '@/lib/middleware';

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout user and clear authentication token
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logout successful
 */
async function logoutHandler(request: NextRequest): Promise<NextResponse> {
  const response = NextResponse.json({ message: 'Logout successful' });
  
  // Clear the auth cookie
  response.cookies.set('auth-token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0 // Expire immediately
  });

  return response;
}

export const POST = withSecurity(logoutHandler);
