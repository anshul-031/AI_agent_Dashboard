import { NextRequest, NextResponse } from 'next/server';
import { swaggerSpec } from '@/lib/swagger';

/**
 * @swagger
 * /api/docs:
 *   get:
 *     summary: Get live API documentation in OpenAPI 3.0 specification format
 *     description: Returns the complete OpenAPI spec with auto-updated endpoint documentation, schemas, and examples
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
  const response = NextResponse.json(swaggerSpec);
  
  // Add CORS headers for documentation access
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  
  return response;
}
