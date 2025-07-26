import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, hasPermission, AuthUser } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: AuthUser;
}

// Authentication middleware
export function withAuth(requiredRole: 'viewer' | 'operator' | 'admin' = 'viewer') {
  return function(handler: (request: AuthenticatedRequest, ...args: any[]) => Promise<NextResponse>) {
    return async function(request: AuthenticatedRequest, ...args: any[]): Promise<NextResponse> {
      // Authenticate the request
      const user = authenticateRequest(request);
      
      if (!user) {
        return NextResponse.json(
          { 
            error: 'Authentication required',
            message: 'Please provide a valid JWT token in the Authorization header' 
          },
          { status: 401 }
        );
      }

      // Check permissions
      if (!hasPermission(user.role, requiredRole)) {
        return NextResponse.json(
          { 
            error: 'Insufficient permissions',
            message: `This action requires ${requiredRole} role or higher` 
          },
          { status: 403 }
        );
      }

      // Add user to request
      request.user = user;

      try {
        return await handler(request, ...args);
      } catch (error) {
        console.error('Handler error:', error);
        return NextResponse.json(
          { error: 'Internal server error' },
          { status: 500 }
        );
      }
    };
  };
}

// Rate limiting middleware (simplified - in production use Redis)
const requestCounts = new Map<string, { count: number; resetTime: number }>();

export function withRateLimit(maxRequests: number = 100, windowMs: number = 15 * 60 * 1000) {
  return function(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async function(request: NextRequest, ...args: any[]): Promise<NextResponse> {
      const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
      const now = Date.now();
      
      const clientData = requestCounts.get(clientIP);
      
      if (!clientData || now > clientData.resetTime) {
        requestCounts.set(clientIP, { count: 1, resetTime: now + windowMs });
      } else {
        clientData.count++;
        if (clientData.count > maxRequests) {
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded',
              message: 'Too many requests. Please try again later.',
              retryAfter: Math.ceil((clientData.resetTime - now) / 1000)
            },
            { status: 429 }
          );
        }
      }

      // Clean up old entries periodically
      if (Math.random() < 0.01) { // 1% chance
        requestCounts.forEach((data, ip) => {
          if (now > data.resetTime) {
            requestCounts.delete(ip);
          }
        });
      }

      return handler(request, ...args);
    };
  };
}

// Input validation middleware
export function withValidation(schema: Record<string, any>) {
  return function(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async function(request: NextRequest, ...args: any[]): Promise<NextResponse> {
      try {
        const body = await request.json();
        
        const errors: string[] = [];
        
        for (const [field, rules] of Object.entries(schema)) {
          const value = body[field];
          
          if (rules.required && (!value || value === '')) {
            errors.push(`${field} is required`);
            continue;
          }
          
          if (value && rules.type && typeof value !== rules.type) {
            errors.push(`${field} must be of type ${rules.type}`);
          }
          
          if (value && rules.pattern && !rules.pattern.test(value)) {
            errors.push(`${field} format is invalid`);
          }
          
          if (value && rules.minLength && value.length < rules.minLength) {
            errors.push(`${field} must be at least ${rules.minLength} characters`);
          }
          
          if (value && rules.maxLength && value.length > rules.maxLength) {
            errors.push(`${field} must not exceed ${rules.maxLength} characters`);
          }
          
          if (value && rules.enum && !rules.enum.includes(value)) {
            errors.push(`${field} must be one of: ${rules.enum.join(', ')}`);
          }
        }
        
        if (errors.length > 0) {
          return NextResponse.json(
            { 
              error: 'Validation failed',
              details: errors 
            },
            { status: 400 }
          );
        }
        
        // Create a new request with the validated body
        const newRequest = new Request(request.url, {
          method: request.method,
          headers: request.headers,
          body: JSON.stringify(body),
        }) as NextRequest;
        
        // Copy additional properties
        Object.setPrototypeOf(newRequest, NextRequest.prototype);
        
        return handler(newRequest, ...args);
      } catch (error) {
        return NextResponse.json(
          { error: 'Invalid JSON in request body' },
          { status: 400 }
        );
      }
    };
  };
}

// Security headers middleware
export function withSecurity(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
  return async function(request: NextRequest, ...args: any[]): Promise<NextResponse> {
    const response = await handler(request, ...args);
    
    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    
    // Remove sensitive headers
    response.headers.delete('Server');
    response.headers.delete('X-Powered-By');
    
    return response;
  };
}

// CORS middleware
export function withCORS(allowedOrigins: string[] = ['http://localhost:3000']) {
  return function(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return async function(request: NextRequest, ...args: any[]): Promise<NextResponse> {
      const origin = request.headers.get('origin');
      
      // Handle preflight requests
      if (request.method === 'OPTIONS') {
        const response = new NextResponse(null, { status: 200 });
        
        if (origin && allowedOrigins.includes(origin)) {
          response.headers.set('Access-Control-Allow-Origin', origin);
        }
        
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400');
        
        return response;
      }
      
      const response = await handler(request, ...args);
      
      // Add CORS headers to response
      if (origin && allowedOrigins.includes(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin);
      }
      
      response.headers.set('Access-Control-Allow-Credentials', 'true');
      
      return response;
    };
  };
}

// Middleware function type
export type MiddlewareFunction = (
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>
) => (request: NextRequest, ...args: any[]) => Promise<NextResponse>;

// Combine multiple middlewares
export function composeMiddleware(...middlewares: MiddlewareFunction[]) {
  return function(handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>) {
    return middlewares.reduceRight((acc, middleware) => middleware(acc), handler);
  };
}
