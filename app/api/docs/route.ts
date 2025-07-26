import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get API documentation in OpenAPI format
 *     tags: [Documentation]
 *     responses:
 *       200:
 *         description: OpenAPI specification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return NextResponse.json(swaggerSpec);
}
