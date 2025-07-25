'use client'

import { useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Download, 
  Edit,
  Zap,
  GitBranch,
  Square,
  Circle,
  Diamond,
  Play,
  Pause
} from 'lucide-react'
import { mockAgents, mockFlowcharts } from '@/lib/mock-data'
import { FlowchartNode, FlowchartConnection } from '@/types/agent'

interface AgentFlowchartProps {
  agentId: string | null
}

export function AgentFlowchart({ agentId }: AgentFlowchartProps) {
  const [editMode, setEditMode] = useState(false)
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null)
  
  const agent = agentId ? mockAgents.find(a => a.id === agentId) : null
  const flowchart = agentId ? mockFlowcharts.find(f => f.agentId === agentId) : null

  const getNodeIcon = (type: FlowchartNode['type']) => {
    switch (type) {
      case 'start':
        return <Play className="h-4 w-4 text-green-600" />
      case 'end':
        return <Pause className="h-4 w-4 text-red-600" />
      case 'process':
        return <Square className="h-4 w-4 text-blue-600" />
      case 'decision':
        return <Diamond className="h-4 w-4 text-yellow-600" />
      default:
        return <Circle className="h-4 w-4 text-gray-600" />
    }
  }

  const getNodeColor = (type: FlowchartNode['type']) => {
    switch (type) {
      case 'start':
        return 'bg-green-50 border-green-200 text-green-900'
      case 'end':
        return 'bg-red-50 border-red-200 text-red-900'
      case 'process':
        return 'bg-blue-50 border-blue-200 text-blue-900'
      case 'decision':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900'
    }
  }

  const handleNodeClick = useCallback((node: FlowchartNode) => {
    if (editMode) {
      setSelectedNode(node)
    }
  }, [editMode])

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <GitBranch className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No agent selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please select an agent to view its flowchart
          </p>
        </div>
      </div>
    )
  }

  if (!flowchart) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <div>
              <h2 className="text-3xl font-bold tracking-tight">{agent.name} Flowchart</h2>
              <p className="text-muted-foreground">Visual workflow representation</p>
            </div>
          </div>
        </div>
        
        <Card>
          <CardContent className="flex items-center justify-center h-96">
            <div className="text-center">
              <GitBranch className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No flowchart available</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This agent doesn't have a flowchart configured yet
              </p>
              <Button className="mt-4">
                <Edit className="mr-2 h-4 w-4" />
                Create Flowchart
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{agent.name} Flowchart</h2>
            <p className="text-muted-foreground">Visual workflow representation</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {editMode ? 'Exit Edit' : 'Edit Mode'}
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Flowchart Info */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <GitBranch className="h-5 w-5" />
                <span>Workflow Configuration</span>
              </CardTitle>
              <CardDescription>
                Version: {flowchart.version} • Last modified: {new Date(flowchart.lastModified).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Badge variant="outline">{flowchart.nodes.length} nodes</Badge>
              <Badge variant="outline">{flowchart.connections.length} connections</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Flowchart Canvas */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Workflow Diagram</CardTitle>
            <CardDescription>
              {editMode ? 'Click on nodes to edit their properties' : 'Visual representation of the agent workflow'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative bg-muted/30 rounded-lg p-8 min-h-[500px] overflow-hidden">
              {/* SVG for connections */}
              <svg 
                className="absolute inset-0 w-full h-full pointer-events-none"
                style={{ zIndex: 1 }}
              >
                {flowchart.connections.map((connection, index) => {
                  const fromNode = flowchart.nodes.find(n => n.id === connection.from)
                  const toNode = flowchart.nodes.find(n => n.id === connection.to)
                  
                  if (!fromNode || !toNode) return null
                  
                  const x1 = fromNode.position.x + 80
                  const y1 = fromNode.position.y + 40
                  const x2 = toNode.position.x + 80
                  const y2 = toNode.position.y + 40
                  
                  return (
                    <g key={index}>
                      <line
                        x1={x1}
                        y1={y1}
                        x2={x2}
                        y2={y2}
                        stroke="hsl(var(--muted-foreground))"
                        strokeWidth="2"
                        markerEnd="url(#arrowhead)"
                      />
                      {connection.label && (
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 - 10}
                          textAnchor="middle"
                          className="fill-muted-foreground text-xs"
                        >
                          {connection.label}
                        </text>
                      )}
                    </g>
                  )
                })}
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="hsl(var(--muted-foreground))"
                    />
                  </marker>
                </defs>
              </svg>
              
              {/* Nodes */}
              {flowchart.nodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute border-2 rounded-lg p-3 cursor-pointer transition-all ${getNodeColor(node.type)} ${
                    selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                  } ${editMode ? 'hover:shadow-md' : ''}`}
                  style={{
                    left: node.position.x,
                    top: node.position.y,
                    zIndex: 2,
                    minWidth: '160px'
                  }}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    {getNodeIcon(node.type)}
                    <span className="font-medium text-sm">{node.type.toUpperCase()}</span>
                  </div>
                  <div className="text-sm font-medium">{node.title}</div>
                  {node.description && (
                    <div className="text-xs text-muted-foreground mt-1">
                      {node.description}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Node Properties Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Node Properties</CardTitle>
            <CardDescription>
              {selectedNode ? `Edit ${selectedNode.title}` : 'Select a node to view properties'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getNodeIcon(selectedNode.type)}
                    <Badge variant="outline">{selectedNode.type}</Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Title</label>
                  <p className="text-sm mt-1">{selectedNode.title}</p>
                </div>
                
                {selectedNode.description && (
                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedNode.description}
                    </p>
                  </div>
                )}
                
                {selectedNode.config && (
                  <div>
                    <label className="text-sm font-medium">Configuration</label>
                    <div className="bg-muted p-2 rounded text-xs font-mono mt-1">
                      {JSON.stringify(selectedNode.config, null, 2)}
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <p className="text-sm text-muted-foreground mt-1">
                    X: {selectedNode.position.x}, Y: {selectedNode.position.y}
                  </p>
                </div>
                
                {editMode && (
                  <div className="pt-4 border-t">
                    <Button size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Node
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <GitBranch className="mx-auto h-8 w-8 mb-2" />
                <p className="text-sm">Click on a node to view its properties</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Node Legend */}
      <Card>
        <CardHeader>
          <CardTitle>Node Types</CardTitle>
          <CardDescription>Understanding the different node types in the workflow</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-green-50 border border-green-200 flex items-center justify-center">
                <Play className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Start</div>
                <div className="text-xs text-muted-foreground">Entry point</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-blue-50 border border-blue-200 flex items-center justify-center">
                <Square className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Process</div>
                <div className="text-xs text-muted-foreground">Action step</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-yellow-50 border border-yellow-200 flex items-center justify-center">
                <Diamond className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <div className="font-medium text-sm">Decision</div>
                <div className="text-xs text-muted-foreground">Conditional logic</div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-red-50 border border-red-200 flex items-center justify-center">
                <Pause className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <div className="font-medium text-sm">End</div>
                <div className="text-xs text-muted-foreground">Exit point</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}