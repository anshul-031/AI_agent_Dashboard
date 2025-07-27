# API Documentation Features

This document describes the comprehensive API documentation system implemented for the AI Agent Dashboard.

## Features

### 🚀 Interactive Swagger UI
- **Live Documentation Interface**: Access interactive API docs at `/docs`
- **Real-time Testing**: Test API endpoints directly from the browser
- **Auto-refresh**: Documentation updates automatically every 30 seconds
- **Manual Refresh**: Force refresh documentation with a single click
- **Custom Styling**: Tailored UI that matches the dashboard design

### 📡 Auto-updating Documentation
- **Live Synchronization**: API docs automatically reflect code changes
- **Real-time Status**: Visual indicators show documentation freshness
- **Background Updates**: Auto-refresh runs seamlessly in the background
- **Error Handling**: Graceful fallback when documentation updates fail

### 📋 One-liner API Descriptions
Each API endpoint includes comprehensive descriptions:

#### Authentication Endpoints
- `POST /api/auth/login` - Authenticate user credentials and return JWT access token
- `POST /api/auth/logout` - Terminate user session and invalidate authentication token
- `GET /api/auth/me` - Retrieve current authenticated user profile and permissions

#### Agent Management
- `GET /api/agents` - Retrieve all AI agents with advanced filtering and search capabilities
- `POST /api/agents` - Create and configure a new AI agent with custom settings
- `GET /api/agents/[id]` - Get detailed information for a specific agent
- `PUT /api/agents/[id]` - Update agent configuration and settings
- `DELETE /api/agents/[id]` - Remove agent and associated data

#### Execution Monitoring
- `GET /api/executions` - Retrieve agent execution history with comprehensive filtering options
- `POST /api/executions` - Trigger a new agent execution with optional parameters and configurations
- `GET /api/executions/[id]` - Get detailed execution information including logs and results
- `GET /api/executions/[id]/logs` - Retrieve complete execution logs with filtering and pagination

#### Dashboard Analytics
- `GET /api/dashboard/stats` - Get comprehensive dashboard analytics and performance metrics

#### Flowchart Management
- `GET /api/agents/[id]/flowchart` - Retrieve agent workflow visualization and structure
- `POST /api/agents/[id]/flowchart` - Create or update agent flowchart configuration
- `POST /api/agents/[id]/flowchart/validate` - Validate flowchart structure and connections
- `POST /api/agents/[id]/flowchart/duplicate` - Create a copy of existing flowchart
- `GET /api/agents/[id]/flowchart/export` - Export flowchart in various formats

#### Documentation
- `GET /api/docs` - Get live API documentation in OpenAPI 3.0 specification format
- `GET /api/docs/postman` - Generate and download live Postman collection from OpenAPI specification

### 📦 Live Postman Collection Generation
- **Dynamic Generation**: Postman collection created in real-time from OpenAPI spec
- **Complete Coverage**: Includes all endpoints with proper authentication
- **Example Data**: Pre-populated with realistic example requests
- **Variable Support**: Uses Postman variables for base URL and JWT tokens
- **Organized Structure**: Endpoints grouped by tags for better navigation

#### Collection Features:
- **Authentication**: Bearer token authentication pre-configured
- **Variables**: `{{baseUrl}}` and `{{jwt_token}}` variables for easy environment switching
- **Request Bodies**: Auto-generated example JSON payloads
- **Query Parameters**: All optional and required parameters included
- **Headers**: Proper Content-Type and authentication headers

### 🔧 How to Use

#### Accessing Documentation
1. **Via Header Navigation**: Click "API Docs" button in the dashboard header
2. **Direct URL**: Navigate to `/docs` in your browser
3. **External Link**: Documentation opens in a new tab for convenience

#### Using Auto-refresh
1. **Enable**: Click the "Auto-refresh OFF" button to enable
2. **Visual Indicator**: Green indicator shows auto-refresh is active
3. **Interval**: Updates every 30 seconds automatically
4. **Manual Override**: Use "Refresh" button for immediate updates

#### Downloading Postman Collection
1. **From Docs Page**: Click "Download Postman Collection" button
2. **Direct Download**: Visit `/api/docs/postman` for direct download
3. **Import to Postman**: Import the downloaded JSON file into Postman
4. **Configure Variables**: Set `baseUrl` and `jwt_token` variables in Postman

#### Testing APIs
1. **Authorization**: Use the "Authorize" button in Swagger UI
2. **JWT Token**: Enter your authentication token
3. **Try It Out**: Click "Try it out" on any endpoint
4. **Execute**: Fill parameters and click "Execute" to test

### 📊 Quick Stats
- **Total Endpoints**: 18+ documented API endpoints
- **Categories**: 6 main categories (Auth, Agents, Executions, Dashboard, Flowcharts, Docs)
- **Response Formats**: All endpoints return JSON with proper schema definitions
- **Authentication**: Bearer token security for protected endpoints
- **Error Handling**: Comprehensive error responses with helpful messages

### 🔗 Quick Links
- [Interactive API Documentation](/docs)
- [Raw OpenAPI Spec](/api/docs)
- [Download Postman Collection](/api/docs/postman)

### 🛠️ Technical Implementation
- **OpenAPI 3.0**: Industry-standard specification format
- **Swagger UI React**: Modern, responsive documentation interface
- **Dynamic Generation**: Real-time collection and spec generation
- **Custom Styling**: Tailwind CSS integration for consistent design
- **TypeScript**: Full type safety for all components and APIs

The documentation system provides a complete, professional-grade API experience that automatically stays current with your codebase changes.
