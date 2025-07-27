import { FlowchartNode, FlowchartConnection, Flowchart, FlowchartLayout } from '@/types/agent'

// Utility functions for flowchart operations

export function createNode(
  type: FlowchartNode['type'],
  title: string,
  position: { x: number; y: number; z?: number },
  options: Partial<Omit<FlowchartNode, 'id' | 'type' | 'title' | 'position' | 'chronology'>> = {}
): FlowchartNode {
  const now = new Date().toISOString()
  
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    title,
    position: {
      x: position.x,
      y: position.y,
      z: position.z || 1
    },
    size: options.size || { width: 160, height: 80 },
    description: options.description,
    config: options.config,
    chronology: {
      order: 0, // Will be set when added to flowchart
      createdAt: now,
      updatedAt: now
    }
  }
}

export function createConnection(
  from: string,
  to: string,
  options: Partial<Omit<FlowchartConnection, 'id' | 'from' | 'to' | 'chronology'>> = {}
): FlowchartConnection {
  const now = new Date().toISOString()
  
  return {
    id: `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    from,
    to,
    label: options.label,
    condition: options.condition,
    path: options.path || { type: 'straight' },
    chronology: {
      order: 0, // Will be set when added to flowchart
      createdAt: now,
      updatedAt: now
    }
  }
}

export function createFlowchart(
  agentId: string,
  title: string,
  options: Partial<Omit<Flowchart, 'id' | 'agentId' | 'chronology'>> = {}
): Omit<Flowchart, 'id' | 'chronology'> {
  const now = new Date().toISOString()
  
  return {
    agentId,
    version: options.version || '1.0.0',
    nodes: options.nodes || [],
    connections: options.connections || [],
    layout: options.layout || {
      canvasSize: { width: 1200, height: 800 },
      zoom: 1,
      pan: { x: 0, y: 0 },
      gridSize: 20,
      snapToGrid: true
    },
    metadata: options.metadata || {
      title,
      description: `Flowchart for ${title}`,
      layoutVersion: 'v2.0',
      tags: []
    }
  }
}

export function addNodeToFlowchart(flowchart: Flowchart, node: FlowchartNode): Flowchart {
  // Determine the next order
  const maxOrder = Math.max(0, ...flowchart.nodes.map(n => n.chronology?.order || 0))
  
  const nodeWithOrder = {
    ...node,
    chronology: {
      ...node.chronology,
      order: maxOrder + 1
    }
  }

  return {
    ...flowchart,
    nodes: [...flowchart.nodes, nodeWithOrder],
    chronology: {
      ...flowchart.chronology,
      lastModified: new Date().toISOString(),
      changeLog: [
        ...(flowchart.chronology?.changeLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'node_added',
          details: `Added ${node.type} node: ${node.title}`
        }
      ].slice(-50)
    }
  }
}

export function addConnectionToFlowchart(flowchart: Flowchart, connection: FlowchartConnection): Flowchart {
  // Determine the next order
  const maxOrder = Math.max(0, ...flowchart.connections.map(c => c.chronology?.order || 0))
  
  const connectionWithOrder = {
    ...connection,
    chronology: {
      ...connection.chronology,
      order: maxOrder + 1
    }
  }

  return {
    ...flowchart,
    connections: [...flowchart.connections, connectionWithOrder],
    chronology: {
      ...flowchart.chronology,
      lastModified: new Date().toISOString(),
      changeLog: [
        ...(flowchart.chronology?.changeLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'connection_added',
          details: `Added connection from ${connection.from} to ${connection.to}`
        }
      ].slice(-50)
    }
  }
}

export function updateNodeInFlowchart(
  flowchart: Flowchart, 
  nodeId: string, 
  updates: Partial<FlowchartNode>
): Flowchart {
  const nodes = flowchart.nodes.map(node => {
    if (node.id === nodeId) {
      return {
        ...node,
        ...updates,
        chronology: {
          ...node.chronology,
          updatedAt: new Date().toISOString()
        }
      }
    }
    return node
  })

  return {
    ...flowchart,
    nodes,
    chronology: {
      ...flowchart.chronology,
      lastModified: new Date().toISOString(),
      changeLog: [
        ...(flowchart.chronology?.changeLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'node_updated',
          details: `Updated node: ${nodeId}`
        }
      ].slice(-50)
    }
  }
}

export function removeNodeFromFlowchart(flowchart: Flowchart, nodeId: string): Flowchart {
  const nodes = flowchart.nodes.filter(node => node.id !== nodeId)
  const connections = flowchart.connections.filter(
    conn => conn.from !== nodeId && conn.to !== nodeId
  )

  return {
    ...flowchart,
    nodes,
    connections,
    chronology: {
      ...flowchart.chronology,
      lastModified: new Date().toISOString(),
      changeLog: [
        ...(flowchart.chronology?.changeLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'node_removed',
          details: `Removed node: ${nodeId}`
        }
      ].slice(-50)
    }
  }
}

export function updateFlowchartLayout(
  flowchart: Flowchart, 
  layoutUpdates: Partial<FlowchartLayout>
): Flowchart {
  return {
    ...flowchart,
    layout: {
      ...flowchart.layout,
      ...layoutUpdates
    },
    chronology: {
      ...flowchart.chronology,
      lastModified: new Date().toISOString(),
      changeLog: [
        ...(flowchart.chronology?.changeLog || []),
        {
          timestamp: new Date().toISOString(),
          action: 'layout_updated',
          details: `Layout updated: ${Object.keys(layoutUpdates).join(', ')}`
        }
      ].slice(-50)
    }
  }
}

export function validateFlowchartStructure(flowchart: Partial<Flowchart>): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // Check for required nodes
  if (!flowchart.nodes || flowchart.nodes.length === 0) {
    errors.push('Flowchart must have at least one node')
  } else {
    const startNodes = flowchart.nodes.filter(n => n.type === 'start')
    const endNodes = flowchart.nodes.filter(n => n.type === 'end')
    
    if (startNodes.length === 0) {
      errors.push('Flowchart must have at least one start node')
    }
    if (endNodes.length === 0) {
      errors.push('Flowchart must have at least one end node')
    }

    // Check for disconnected nodes
    const nodeIds = new Set(flowchart.nodes.map(n => n.id))
    const connectedNodes = new Set<string>()
    
    if (flowchart.connections) {
      flowchart.connections.forEach(conn => {
        connectedNodes.add(conn.from)
        connectedNodes.add(conn.to)
      })
    }

    const disconnectedNodes = flowchart.nodes.filter(
      node => node.type !== 'start' && node.type !== 'end' && !connectedNodes.has(node.id)
    )
    
    if (disconnectedNodes.length > 0) {
      errors.push(`Found ${disconnectedNodes.length} disconnected node(s): ${disconnectedNodes.map(n => n.title).join(', ')}`)
    }

    // Validate node positions
    flowchart.nodes.forEach((node, index) => {
      if (!node.position || typeof node.position.x !== 'number' || typeof node.position.y !== 'number') {
        errors.push(`Node ${index + 1} (${node.title}) has invalid position coordinates`)
      }
      if (!node.title || node.title.trim() === '') {
        errors.push(`Node ${index + 1} must have a title`)
      }
    })
  }

  // Validate connections
  if (flowchart.connections && flowchart.connections.length > 0) {
    const nodeIds = new Set(flowchart.nodes?.map(n => n.id) || [])
    
    flowchart.connections.forEach((conn, index) => {
      if (!nodeIds.has(conn.from)) {
        errors.push(`Connection ${index + 1} references non-existent 'from' node: ${conn.from}`)
      }
      if (!nodeIds.has(conn.to)) {
        errors.push(`Connection ${index + 1} references non-existent 'to' node: ${conn.to}`)
      }
      if (conn.from === conn.to) {
        errors.push(`Connection ${index + 1} creates a self-loop, which is not allowed`)
      }
    })
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

export function exportFlowchartData(flowchart: Flowchart) {
  return {
    flowchart,
    exportData: {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      format: 'json',
      schema: 'flowchart-v2.0'
    }
  }
}

export function duplicateFlowchartData(
  flowchart: Flowchart, 
  newAgentId: string, 
  newTitle?: string
): Omit<Flowchart, 'id'> {
  const now = new Date().toISOString()
  
  return {
    ...flowchart,
    agentId: newAgentId,
    metadata: {
      ...flowchart.metadata,
      title: newTitle || `${flowchart.metadata.title} (Copy)`
    },
    chronology: {
      createdAt: now,
      lastModified: now,
      version: '1.0.0',
      changeLog: [{
        timestamp: now,
        action: 'duplicated',
        details: `Duplicated from flowchart ${flowchart.id}`
      }]
    }
  }
}
