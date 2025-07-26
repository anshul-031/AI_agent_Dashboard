import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'admin' | 'operator' | 'viewer';
  name: string;
}

export interface AuthUser extends JWTPayload {
  id: string;
}

// Generate JWT token
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions);
}

// Verify JWT token
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Compare password
export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Extract token from request
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Also check for token in cookies
  const token = request.cookies.get('auth-token')?.value;
  return token || null;
}

// Authenticate request and return user
export function authenticateRequest(request: NextRequest): AuthUser | null {
  const token = getTokenFromRequest(request);
  if (!token) {
    return null;
  }

  const payload = verifyToken(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    name: payload.name,
  };
}

// Mock user database (replace with real database in production)
export const mockUsers = [
  {
    id: '1',
    email: 'admin@company.com',
    name: 'Admin User',
    role: 'admin' as const,
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKvY8WkPXvMyQai', // password: 'password'
  },
  {
    id: '2',
    email: 'operator@company.com',
    name: 'Operator User',
    role: 'operator' as const,
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKvY8WkPXvMyQai', // password: 'password'
  },
  {
    id: '3',
    email: 'viewer@company.com',
    name: 'Viewer User',
    role: 'viewer' as const,
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKvY8WkPXvMyQai', // password: 'password'
  }
];

// Find user by email
export function findUserByEmail(email: string) {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase());
}

// Find user by ID
export function findUserById(id: string) {
  return mockUsers.find(user => user.id === id);
}

// Validate user permissions
export function hasPermission(userRole: string, requiredRole: string): boolean {
  const roleHierarchy = {
    'viewer': 1,
    'operator': 2,
    'admin': 3,
    'VIEWER': 1,
    'OPERATOR': 2,
    'ADMIN': 3
  };

  const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
  const requiredLevel = roleHierarchy[requiredRole as keyof typeof roleHierarchy] || 0;

  return userLevel >= requiredLevel;
}

// Rate limiting configuration
export const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
};

// Input validation patterns
export const validationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  password: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  agentName: /^[a-zA-Z0-9\s\-_]{1,100}$/,
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
};

// Sanitize input to prevent XSS
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 1000); // Limit length
}

// Validate request data
export function validateRequestData(data: any, schema: Record<string, any>): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const [field, rules] of Object.entries(schema)) {
    const value = data[field];

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

  return {
    isValid: errors.length === 0,
    errors
  };
}
