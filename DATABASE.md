# AI Agent Dashboard - Database Architecture

This project uses a hybrid database architecture combining PostgreSQL and MongoDB to optimize for different data types and use cases.

## Architecture Overview

### PostgreSQL (Relational Data)
- **Agent metadata**: Basic agent information, status, categories
- **Execution history**: Start/end times, success/failure status, performance metrics
- **User data**: Authentication and user management
- **Relationships**: Agent → Executions mapping

**Why PostgreSQL?**
- Strong schema enforcement for structured data
- ACID transactions for data consistency
- Efficient querying and filtering capabilities
- Great for analytics and reporting

### MongoDB (Document Storage)
- **Flowchart configurations**: Complex nested JSON structures
- **Node definitions**: Dynamic node types and properties
- **Connection mappings**: Visual layout and relationships
- **Metadata**: Visual positioning and layout information

**Why MongoDB?**
- Schema flexibility for dynamic flowchart structures
- Efficient storage of nested JSON documents
- Easy querying of complex document structures
- Optimal for rapid read/write of large JSON objects

## Database Setup

### Prerequisites
- PostgreSQL 12+ running locally or remotely
- MongoDB 4.4+ running locally or remotely
- Node.js 16+ with npm

### Environment Configuration

1. Copy the environment template:
```bash
cp .env.example .env.local
```

2. Update `.env.local` with your database URLs:
```bash
# PostgreSQL Configuration
DATABASE_URL="postgresql://username:password@localhost:5432/ai_agent_dashboard"

# MongoDB Configuration  
MONGODB_URI="mongodb://localhost:27017/ai_agent_flowcharts"

# Application Configuration
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### Database Initialization

1. Initialize the database setup:
```bash
npm run db:init
```

2. Push the schema to PostgreSQL:
```bash
npm run db:push
```

3. Seed with sample data:
```bash
npm run db:seed
```

4. (Optional) Open Prisma Studio to view data:
```bash
npm run db:studio
```

## Available Scripts

- `npm run db:init` - Initialize database setup
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:pull` - Pull schema from database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:reset` - Reset database (⚠️ destructive)

## Data Models

### PostgreSQL Models

#### Agent
```typescript
interface Agent {
  id: string
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'PAUSED'
  category: string
  createdAt: Date
  lastExecution?: Date
  executionCount: number
  configuration?: JSON
}
```

#### Execution
```typescript
interface Execution {
  id: string
  agentId: string
  status: 'SUCCESS' | 'FAILED' | 'RUNNING' | 'PENDING'
  startTime: Date
  endTime?: Date
  result?: string
  error?: string
  logs?: JSON
}
```

### MongoDB Models

#### Flowchart
```typescript
interface Flowchart {
  id: string
  agentId: string
  version: string
  nodes: FlowchartNode[]
  connections: FlowchartConnection[]
  metadata: {
    title: string
    description: string
    layout: string
  }
  lastModified: string
}
```

## API Endpoints

### Agents (PostgreSQL)
- `GET /api/agents` - List agents with filters
- `POST /api/agents` - Create new agent
- `GET /api/agents/[id]` - Get agent details
- `PUT /api/agents/[id]` - Update agent
- `DELETE /api/agents/[id]` - Delete agent

### Executions (PostgreSQL)
- `GET /api/executions` - List executions
- `POST /api/executions` - Create execution
- `GET /api/executions/[id]` - Get execution details
- `PUT /api/executions/[id]` - Update execution

### Flowcharts (MongoDB)
- `GET /api/agents/[id]/flowchart` - Get agent flowchart
- `POST /api/agents/[id]/flowchart` - Create flowchart
- `PUT /api/agents/[id]/flowchart` - Update flowchart
- `DELETE /api/agents/[id]/flowchart` - Delete flowchart

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## Connection Management

The application uses singleton patterns for database connections:

- **Prisma Client**: Auto-managed connection pooling
- **MongoDB**: Singleton connection with reconnection logic

Both connections are initialized automatically when API routes are accessed.

## Performance Considerations

1. **PostgreSQL Indexing**: The schema includes indexes on frequently queried fields
2. **MongoDB Collections**: Optimized for document-level operations
3. **Connection Pooling**: Both databases use connection pooling for efficiency
4. **Lazy Loading**: Database connections are established on-demand

## Migration Strategy

For schema changes:

1. **PostgreSQL**: Use Prisma migrations
```bash
npx prisma migrate dev --name your_migration_name
```

2. **MongoDB**: No migrations needed - schema is flexible
   - Document structure changes are handled at application level
   - Backwards compatibility maintained through versioning

## Monitoring and Debugging

1. **Prisma Studio**: Visual database browser
```bash
npm run db:studio
```

2. **Logs**: Database operations are logged to console
3. **Error Handling**: Comprehensive error handling in API routes

## Production Considerations

1. **Environment Variables**: Ensure all production URLs are set
2. **Connection Limits**: Configure appropriate connection pool sizes
3. **Indexes**: Add production-specific indexes based on query patterns
4. **Backups**: Set up regular backups for both databases
5. **Monitoring**: Implement database monitoring and alerting

## Troubleshooting

### Common Issues

1. **Connection Refused**: Check if databases are running
2. **Schema Mismatch**: Run `npm run db:push` to sync schema
3. **Seed Failures**: Ensure databases are empty before seeding
4. **Type Errors**: Run `npm run db:generate` to update Prisma client

### Reset Everything
```bash
npm run db:reset
npm run db:push
npm run db:seed
```

For more help, check the logs or open an issue in the repository.
