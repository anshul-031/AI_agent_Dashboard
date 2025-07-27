# Agent Flowchart View - Enhanced Save Feature

This document outlines the implementation of the enhanced Agent Flowchart View with comprehensive save functionality that preserves node types, positions, values, chronology, and layout.

## Features Implemented

### 1. Enhanced Schema Design

#### Node Types Supported
- **Start**: Entry points for workflow execution
- **Process**: Action steps in the workflow  
- **Decision**: Conditional logic nodes
- **End**: Exit points for workflow completion

#### Enhanced Node Schema
```typescript
interface FlowchartNode {
  id: string
  type: 'start' | 'end' | 'process' | 'decision'
  title: string
  description?: string
  position: {
    x: number
    y: number
    z?: number // Z-index for layering
  }
  size?: {
    width: number
    height: number
  }
  config?: Record<string, any>
  chronology: {
    order: number // Execution order in the workflow
    createdAt: string
    updatedAt: string
  }
}
```

#### Enhanced Connection Schema
```typescript
interface FlowchartConnection {
  id: string
  from: string
  to: string
  label?: string
  condition?: string
  path?: {
    type: 'straight' | 'curved' | 'stepped'
    points?: Array<{ x: number; y: number }> // Custom path points
  }
  chronology: {
    order: number // Connection order for execution flow
    createdAt: string
    updatedAt: string
  }
}
```

#### Layout Preservation
```typescript
interface FlowchartLayout {
  canvasSize: {
    width: number
    height: number
  }
  zoom: number
  pan: {
    x: number
    y: number
  }
  gridSize: number
  snapToGrid: boolean
}
```

### 2. Chronology and Change Tracking

The system maintains comprehensive change history:

```typescript
interface FlowchartChronology {
  createdAt: string
  lastModified: string
  version: string
  changeLog?: Array<{
    timestamp: string
    userId?: string
    action: string
    details: string
  }>
}
```

### 3. Enhanced Save Functionality

#### Auto-save Features
- **Real-time validation**: Validates flowchart structure before saving
- **Auto-save on changes**: Automatically saves after 2 seconds of inactivity in edit mode
- **Change detection**: Tracks unsaved changes and displays status
- **Visual feedback**: Shows save status, validation errors, and last saved time

#### Manual Save Operations
- **Save Changes**: Manual save with validation
- **Export**: Download flowchart as JSON with full schema
- **Duplicate**: Copy flowchart to another agent
- **Validate**: Check flowchart structure and show errors

### 4. Visual Enhancements

#### Canvas Features
- **Zoom controls**: Zoom in/out with percentage display
- **Grid toggle**: Show/hide alignment grid
- **Pan support**: Move canvas view
- **Z-index layering**: Proper node stacking order
- **Path types**: Straight, curved, and custom connection paths

#### Node Display
- **Execution order badges**: Show chronological order in edit mode
- **Size preservation**: Maintain custom node dimensions
- **Enhanced properties panel**: Display chronology, position, size, and configuration

### 5. API Endpoints

#### Core Endpoints
- `GET /api/agents/{id}/flowchart` - Retrieve flowchart
- `POST /api/agents/{id}/flowchart` - Create new flowchart
- `PUT /api/agents/{id}/flowchart` - Update existing flowchart
- `DELETE /api/agents/{id}/flowchart` - Delete flowchart

#### Enhanced Endpoints
- `GET /api/agents/{id}/flowchart/export` - Export flowchart with metadata
- `POST /api/agents/{id}/flowchart/duplicate` - Duplicate to another agent
- `POST /api/agents/{id}/flowchart/validate` - Validate flowchart structure

### 6. Database Schema

The flowchart data is stored in MongoDB with the following key features:

#### Storage Strategy
- **PostgreSQL**: Agent metadata and relational data
- **MongoDB**: Flowchart documents with complex nested structures
- **Hybrid approach**: Leverages strengths of both databases

#### Data Validation
- **Schema validation**: Ensures data integrity before save
- **Reference checking**: Validates node connections
- **Structure validation**: Checks for required start/end nodes

### 7. Payload Format

The saved payload preserves all aspects of the flowchart:

```json
{
  "id": "flow-1",
  "agentId": "agent-123",
  "version": "1.2.0",
  "nodes": [
    {
      "id": "start-1",
      "type": "start",
      "title": "Process Start",
      "position": { "x": 50, "y": 50, "z": 1 },
      "size": { "width": 160, "height": 80 },
      "chronology": {
        "order": 1,
        "createdAt": "2024-01-15T09:00:00Z",
        "updatedAt": "2024-01-15T09:00:00Z"
      }
    }
  ],
  "connections": [
    {
      "id": "conn-1",
      "from": "start-1",
      "to": "process-1",
      "path": { "type": "straight" },
      "chronology": {
        "order": 1,
        "createdAt": "2024-01-15T09:01:00Z",
        "updatedAt": "2024-01-15T09:01:00Z"
      }
    }
  ],
  "layout": {
    "canvasSize": { "width": 1200, "height": 800 },
    "zoom": 1,
    "pan": { "x": 0, "y": 0 },
    "gridSize": 20,
    "snapToGrid": true
  },
  "metadata": {
    "title": "Workflow",
    "description": "Process workflow",
    "layoutVersion": "v2.0",
    "tags": ["workflow", "automation"]
  },
  "chronology": {
    "createdAt": "2024-01-15T09:00:00Z",
    "lastModified": "2024-01-15T10:30:00Z",
    "version": "1.2.0",
    "changeLog": [
      {
        "timestamp": "2024-01-15T10:30:00Z",
        "action": "manual_save",
        "details": "User saved flowchart manually"
      }
    ]
  }
}
```

### 8. Utility Functions

A comprehensive set of utility functions is provided in `lib/flowchart-utils.ts`:

- `createNode()` - Create new nodes with proper schema
- `createConnection()` - Create connections with chronology
- `addNodeToFlowchart()` - Add nodes while maintaining order
- `updateNodeInFlowchart()` - Update nodes with change tracking
- `validateFlowchartStructure()` - Comprehensive validation
- `exportFlowchartData()` - Format for export
- `duplicateFlowchartData()` - Clone flowcharts

### 9. User Experience Features

#### Visual Feedback
- **Save status indicators**: Real-time save state display
- **Validation errors**: Clear error messages with specific issues
- **Change history**: Timeline of all modifications
- **Loading states**: Visual feedback during operations

#### Edit Mode Enhancements
- **Node selection**: Click to select and view properties
- **Property inspection**: Detailed node information panel
- **Execution order**: Visual indication of workflow sequence
- **Grid alignment**: Optional grid for precise positioning

### 10. Data Integrity

#### Validation Rules
- Must have at least one start node
- Must have at least one end node
- All connections must reference existing nodes
- No self-referencing connections allowed
- All nodes must have valid positions and titles

#### Change Tracking
- Every modification is logged with timestamp
- User attribution for changes when available
- Version control with incremental updates
- Change log limited to last 50 entries for performance

## Implementation Status

✅ **Completed Features:**
- Enhanced schema with chronology tracking
- MongoDB service with validation
- API endpoints for all operations
- React component with save functionality
- Auto-save and manual save operations
- Export and duplicate functionality
- Visual enhancements and user feedback
- Comprehensive utility functions

🔄 **Future Enhancements:**
- Drag-and-drop node positioning
- Visual flowchart editor
- Real-time collaborative editing
- Image export (PNG/SVG)
- Flowchart templates
- Undo/redo functionality

## Usage Example

```typescript
import { createNode, addNodeToFlowchart } from '@/lib/flowchart-utils'

// Create a new process node
const processNode = createNode(
  'process',
  'Data Processing',
  { x: 100, y: 200 },
  {
    description: 'Process incoming data',
    config: { timeout: 30000 }
  }
)

// Add to flowchart with automatic ordering
const updatedFlowchart = addNodeToFlowchart(currentFlowchart, processNode)
```

This implementation provides a robust foundation for flowchart management with complete state preservation, comprehensive change tracking, and an intuitive user experience.
