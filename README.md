# AI Agent Dashboard API

A comprehensive RESTful API for managing AI agents, execution histories, and workflow configurations with JWT-based authentication and role-based access control.

## 🚀 Features

### Core Functionality
- **Agent Management**: Create, read, update, and delete AI agents with detailed tracking
- **Execution Management**: Monitor and manage agent execution histories with comprehensive logging
- **Workflow Configuration**: Design and manage agent flowcharts with visual workflow representation
- **Dashboard Analytics**: Real-time statistics and insights into agent performance

### Security & Authentication
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: Three-tier permission system (Admin, Operator, Viewer)
- **Input Validation**: Comprehensive validation to prevent security vulnerabilities
- **Rate Limiting**: Built-in protection against abuse and DDoS attacks
- **Security Headers**: Standard security headers for protection against common attacks

### API Features
- **RESTful Design**: Clean, intuitive API following REST principles
- **Real-time Filtering**: Advanced filtering capabilities for all endpoints
- **Pagination**: Efficient pagination for large datasets
- **Error Handling**: Consistent error responses with detailed messages
- **API Documentation**: Auto-generated Swagger/OpenAPI documentation
- **Postman Collection**: Ready-to-use collection for API testing

## 📋 Requirements Met

✅ **Agent Overview View**
- Create, retrieve, update, delete agents with full attribute support
- Real-time case-insensitive search by name
- Filter by agent status, category, creator, and enabled state
- User tracking (created by, updated by, timestamps)

✅ **Agent Execution View** 
- Comprehensive execution history with detailed metadata
- Filter by timestamps (start/end time ranges)
- Mock log generation for demonstration
- Status tracking (Success/Failure/Running/Pending)

✅ **Agent Flowchart View**
- Save flowcharts with node positions and connections
- Preserve chronology and workflow structure
- Support for Start, Process, Decision, and End nodes
- Versioning and metadata management

✅ **Security Implementation**
- JWT-based authentication for all endpoints
- Input validation preventing vulnerabilities
- Role-based permissions (Admin > Operator > Viewer)
- Rate limiting and security headers

## 🏗️ Architecture

### Technology Stack
- **Framework**: Next.js 13+ with App Router
- **Language**: TypeScript for type safety
- **Database**: Hybrid PostgreSQL + MongoDB
  - PostgreSQL: Structured data (agents, executions, users)
  - MongoDB: Document storage (flowcharts, configurations)
- **ORM**: Prisma for PostgreSQL operations
- **Authentication**: JWT with bcrypt password hashing
- **Validation**: Custom validation with security patterns

### Database Schema

#### PostgreSQL (Structured Data)
```sql
-- Users table
Users (id, email, name, role, passwordHash, createdAt, updatedAt)

-- Agents table  
Agents (id, name, description, status, category, enabled, createdById, updatedById, createdAt, updatedAt, lastActive, executionCount, configuration)

-- Executions table
Executions (id, agentId, status, startTime, endTime, result, error, logs, triggeredById)
```

#### MongoDB (Document Storage)
```javascript
// Flowcharts collection
{
  id: String,
  agentId: String,
  version: String,
  nodes: [NodeObject],
  connections: [ConnectionObject], 
  metadata: MetadataObject,
  lastModified: Date
}
```

## 🚦 API Endpoints

### Authentication
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| POST | `/api/auth/login` | User authentication | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |
| POST | `/api/auth/logout` | User logout | Authenticated |

### Agents
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/agents` | List agents with filtering | Viewer+ |
| POST | `/api/agents` | Create new agent | Operator+ |
| GET | `/api/agents/{id}` | Get agent details | Viewer+ |
| PUT | `/api/agents/{id}` | Update agent | Operator+ |
| DELETE | `/api/agents/{id}` | Delete agent | Admin |

### Executions  
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/executions` | List executions with filtering | Viewer+ |
| POST | `/api/executions` | Create execution | Operator+ |
| GET | `/api/executions/{id}` | Get execution details | Viewer+ |
| PUT | `/api/executions/{id}` | Update execution | Operator+ |
| GET | `/api/executions/{id}/logs` | Get execution logs | Viewer+ |

### Flowcharts
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/agents/{id}/flowchart` | Get agent flowchart | Viewer+ |
| POST | `/api/agents/{id}/flowchart` | Create flowchart | Operator+ |
| PUT | `/api/agents/{id}/flowchart` | Update flowchart | Operator+ |
| DELETE | `/api/agents/{id}/flowchart` | Delete flowchart | Admin |

### Dashboard
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/dashboard/stats` | Get dashboard statistics | Viewer+ |

### Documentation
| Method | Endpoint | Description | Permission |
|--------|----------|-------------|------------|
| GET | `/api/docs` | Get OpenAPI specification | Public |

## 🔧 Setup Instructions

### Prerequisites
- Node.js 18+
- PostgreSQL database
- MongoDB database
- npm or yarn

### Environment Configuration
Create a `.env.local` file:

```bash
# PostgreSQL Configuration
DATABASE_URL="postgresql://username:password@host:port/database"

# MongoDB Configuration  
MONGODB_URI="mongodb://username:password@host:port/database"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRES_IN="24h"
```

### Installation & Setup

1. **Clone and Install Dependencies**
```bash
git clone <repository-url>
cd ai-agent-dashboard
npm install
```

2. **Setup Databases**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to PostgreSQL
npm run db:push

# Seed with sample data
npm run db:seed
```

3. **Development Server**
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full access to all operations including deletion
- **Operator**: Can create, read, and update agents/executions
- **Viewer**: Read-only access to all data

### Default Users
| Email | Password | Role |
|-------|----------|------|
| admin@company.com | password | Admin |
| operator@company.com | password | Operator |
| viewer@company.com | password | Viewer |

### JWT Token Usage
Include the JWT token in requests:

**Header:**
```
Authorization: Bearer <jwt_token>
```

**Cookie (automatically set after login):**
```
auth-token: <jwt_token>
```

## 📖 API Documentation

### Swagger/OpenAPI
- **Interactive Documentation**: Available at `/api/docs`
- **Auto-updating**: Documentation updates automatically with code changes
- **Schema Validation**: Complete request/response schemas

### Postman Collection
Import the included `postman_collection.json` file:

1. Open Postman
2. Click "Import"
3. Select `postman_collection.json`
4. Collection includes:
   - Pre-configured requests for all endpoints
   - Automatic JWT token handling
   - Example payloads
   - Test scripts

## 🔍 Filtering & Search Capabilities

### Agent Filtering
```http
GET /api/agents?status=ACTIVE&category=Data%20Processing&search=processing&enabled=true&page=1&limit=10
```

Parameters:
- `status`: Filter by agent status (ACTIVE, INACTIVE, RUNNING, PAUSED)
- `category`: Filter by agent category
- `search`: Case-insensitive search in name and description
- `enabled`: Filter by enabled status (true/false)
- `createdBy`: Filter by creator user ID
- `page`: Page number for pagination
- `limit`: Results per page

### Execution Filtering
```http
GET /api/executions?agentId=123&status=SUCCESS&startTimeFrom=2024-01-01T00:00:00Z&startTimeTo=2024-12-31T23:59:59Z
```

Parameters:
- `agentId`: Filter by specific agent
- `status`: Filter by execution status
- `startTimeFrom`/`startTimeTo`: Filter by start time range
- `endTimeFrom`/`endTimeTo`: Filter by end time range
- `page`: Page number for pagination
- `limit`: Results per page

## 🛡️ Security Features

### Input Validation
- **XSS Prevention**: Input sanitization
- **SQL Injection**: Parameterized queries via Prisma
- **Schema Validation**: Strict input validation
- **Length Limits**: Prevent overflow attacks

### Rate Limiting
- **Authentication endpoints**: 5 requests per 15 minutes
- **General endpoints**: 100 requests per 15 minutes
- **Creation endpoints**: 20-50 requests per 15 minutes

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`

## 📊 Response Formats

### Success Response
```json
{
  "agents": [...],
  "total": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3
}
```

### Error Response
```json
{
  "error": "Validation failed",
  "message": "Invalid request data",
  "details": [
    "Agent name is required",
    "Status must be one of: ACTIVE, INACTIVE, RUNNING, PAUSED"
  ]
}
```

## 🚀 Production Considerations

### Environment Variables
- Change JWT_SECRET to a secure random string
- Use production database URLs
- Enable HTTPS in production
- Configure proper CORS origins

### Performance
- Database connection pooling enabled
- Efficient pagination implementation
- Indexed database queries
- Response caching where appropriate

### Monitoring
- Comprehensive error logging
- Database query optimization
- Performance monitoring endpoints
- Health check capabilities

## 🧪 Testing the API

### Using Postman
1. Import the provided collection
2. Set the `base_url` variable to your server URL
3. Run the "Login" request to get authentication
4. JWT token will be automatically stored and used
5. Execute other requests to test functionality

### Manual Testing
```bash
# Login to get JWT token
curl -X POST http://localhost:3000/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"admin@company.com","password":"password"}'

# Use token for authenticated requests
curl -X GET http://localhost:3000/api/agents \\
  -H "Authorization: Bearer <jwt_token>"
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the API documentation at `/api/docs`
- Review the Postman collection for example usage

---

**Built with ❤️ using Next.js, TypeScript, Prisma, and MongoDB**
