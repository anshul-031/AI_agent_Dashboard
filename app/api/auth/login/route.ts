import { NextRequest, NextResponse } from 'next/server';
import { 
  findUserByEmail, 
  comparePassword, 
  generateToken, 
  validateRequestData,
  validationPatterns,
  sanitizeInput
} from '@/lib/auth';
import { withRateLimit, withSecurity, composeMiddleware } from '@/lib/middleware';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and return JWT token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@company.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   description: JWT token for authentication
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Invalid credentials
 *       429:
 *         description: Too many requests
 */
async function loginHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    
    // Validate request data
    const validation = validateRequestData(body, {
      email: {
        required: true,
        type: 'string',
        pattern: validationPatterns.email
      },
      password: {
        required: true,
        type: 'string',
        minLength: 1
      }
    });

    if (!validation.isValid) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const email = sanitizeInput(body.email.toLowerCase());
    const password = body.password;

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    };
    
    const token = generateToken(tokenPayload);

    // Return user data and token
    const responseData = {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`
      },
      token
    };

    const response = NextResponse.json(responseData);
    
    // Set secure cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 // 24 hours
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Apply middleware
export const POST = composeMiddleware(
  withSecurity,
  withRateLimit(5, 15 * 60 * 1000) // 5 requests per 15 minutes for login
)(loginHandler);
