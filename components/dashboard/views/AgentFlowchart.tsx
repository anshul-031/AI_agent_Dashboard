'use client'

import { useState, useCallback, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  Pause,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  History,
  ZoomIn,
  ZoomOut,
  Grid
} from 'lucide-react'
import { mockAgents, mockFlowcharts } from '@/lib/mock-data'
import { FlowchartNode, FlowchartConnection, Flowchart } from '@/types/agent'

interface AgentFlowchartProps {
  agentId: string | null
}

interface SaveState {
  isLoading: boolean
  lastSaved?: string
  hasUnsavedChanges: boolean
}

export function AgentFlowchart({ agentId }: AgentFlowchartProps) {
  const [editMode, setEditMode] = useState(false)
  const [selectedNode, setSelectedNode] = useState<FlowchartNode | null>(null)
  const [saveState, setSaveState] = useState<SaveState>({
    isLoading: false,
    hasUnsavedChanges: false
  })
  const [flowchartData, setFlowchartData] = useState<Flowchart | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showGrid, setShowGrid] = useState(true)
  
  const agent = agentId ? mockAgents.find(a => a.id === agentId) : null
  const flowchart = agentId ? mockFlowcharts.find(f => f.agentId === agentId) : null

  // Initialize flowchart data
  useEffect(() => {
    if (flowchart) {
      setFlowchartData(flowchart)
      if (flowchart.layout) {
        setZoom(flowchart.layout.zoom || 1)
        setPan(flowchart.layout.pan || { x: 0, y: 0 })
        setShowGrid(flowchart.layout.snapToGrid !== false)
      }
    }
  }, [flowchart])

  // Save flowchart data
  const saveFlowchart = useCallback(async () => {
    if (!agentId || !flowchartData) return

    setSaveState(prev => ({ ...prev, isLoading: true }))

    try {
      // Prepare the payload with enhanced schema
      const payload = {
        ...flowchartData,
        layout: {
          ...flowchartData.layout,
          zoom,
          pan,
          snapToGrid: showGrid
        },
        chronology: {
          ...flowchartData.chronology,
          lastModified: new Date().toISOString(),
          changeLog: [
            ...(flowchartData.chronology?.changeLog || []),
            {
              timestamp: new Date().toISOString(),
              action: 'manual_save',
              details: 'User saved flowchart manually'
            }
          ].slice(-50) // Keep last 50 changes
        }
      }

      // Here you would call the API
      const response = await fetch(`/api/agents/${agentId}/flowchart`, {
        method: flowchartData ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSaveState({
          isLoading: false,
          lastSaved: new Date().toISOString(),
          hasUnsavedChanges: false
        })
        setValidationErrors([])
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save flowchart')
      }
    } catch (error) {
      console.error('Save error:', error)
      setSaveState(prev => ({ ...prev, isLoading: false }))
      // You could show an error toast here
    }
  }, [agentId, flowchartData, zoom, pan, showGrid])

  // Validate flowchart
  const validateFlowchart = useCallback(async () => {
    if (!agentId || !flowchartData) return

    try {
      const response = await fetch(`/api/agents/${agentId}/flowchart/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nodes: flowchartData.nodes,
          connections: flowchartData.connections
        })
      })

      const result = await response.json()
      setValidationErrors(result.errors || [])
      return result.valid
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }, [agentId, flowchartData])

  // Export flowchart
  const exportFlowchart = useCallback(async () => {
    if (!agentId) return

    try {
      const response = await fetch(`/api/agents/${agentId}/flowchart/export?format=json`)
      const data = await response.json()
      
      // Create download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${agent?.name.replace(/\s+/g, '_')}_flowchart.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export error:', error)
    }
  }, [agentId, agent])

  // Duplicate flowchart
  const duplicateFlowchart = useCallback(async (targetAgentId: string) => {
    if (!agentId) return

    try {
      const response = await fetch(`/api/agents/${agentId}/flowchart/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetAgentId })
      })

      if (response.ok) {
        // Show success message
        console.log('Flowchart duplicated successfully')
      }
    } catch (error) {
      console.error('Duplicate error:', error)
    }
  }, [agentId])

  // Auto-save on changes
  useEffect(() => {
    if (editMode && flowchartData) {
      setSaveState(prev => ({ ...prev, hasUnsavedChanges: true }))
      
      // Auto-save after 2 seconds of inactivity
      const timeout = setTimeout(saveFlowchart, 2000)
      return () => clearTimeout(timeout)
    }
  }, [flowchartData, editMode, saveFlowchart])

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
                This agent doesn&apos;t have a flowchart configured yet
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
          {/* Validation status */}
          {validationErrors.length > 0 && (
            <Badge variant="destructive" className="flex items-center space-x-1">
              <AlertCircle className="h-3 w-3" />
              <span>{validationErrors.length} error{validationErrors.length > 1 ? 's' : ''}</span>
            </Badge>
          )}
          
          {/* Save status */}
          {saveState.lastSaved && (
            <Badge variant="outline" className="flex items-center space-x-1">
              <CheckCircle className="h-3 w-3 text-green-600" />
              <span>Saved {new Date(saveState.lastSaved).toLocaleTimeString()}</span>
            </Badge>
          )}
          
          {saveState.hasUnsavedChanges && (
            <Badge variant="secondary">Unsaved changes</Badge>
          )}

          {/* Zoom controls */}
          <div className="flex items-center space-x-1 border rounded p-1">
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-xs px-2 min-w-[3rem] text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(Math.min(3, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>

          {/* Grid toggle */}
          <Button 
            variant={showGrid ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
          >
            <Grid className="mr-2 h-4 w-4" />
            Grid
          </Button>

          {/* Validation button */}
          <Button variant="outline" size="sm" onClick={validateFlowchart}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Validate
          </Button>
          
          <Button 
            variant={editMode ? "default" : "outline"}
            onClick={() => setEditMode(!editMode)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {editMode ? 'Exit Edit' : 'Edit Mode'}
          </Button>
          
          <Button variant="outline" onClick={exportFlowchart}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          
          <Button variant="outline" onClick={() => duplicateFlowchart('target-agent-id')}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </Button>
          
          <Button 
            onClick={saveFlowchart} 
            disabled={saveState.isLoading || !saveState.hasUnsavedChanges}
          >
            {saveState.isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </div>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div>
              <strong>Flowchart Validation Errors:</strong>
              <ul className="mt-2 space-y-1">
                {validationErrors.map((error, index) => (
                  <li key={index} className="text-sm">• {error}</li>
                ))}
              </ul>
            </div>
          </AlertDescription>
        </Alert>
      )}

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
                Version: {flowchart.version} • Last modified: {new Date(flowchart.chronology?.lastModified || '').toLocaleDateString()}
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
              {/* Grid background */}
              {showGrid && (
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      radial-gradient(circle, #6b7280 1px, transparent 1px)
                    `,
                    backgroundSize: `${(flowchart?.layout?.gridSize || 20) * zoom}px ${(flowchart?.layout?.gridSize || 20) * zoom}px`,
                    backgroundPosition: `${pan.x}px ${pan.y}px`
                  }}
                />
              )}

              {/* Canvas transformation container */}
              <div 
                className="relative w-full h-full"
                style={{
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  transformOrigin: 'top left'
                }}
              >
                {/* SVG for connections */}
                <svg 
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  {flowchart.connections.map((connection, index) => {
                    const fromNode = flowchart.nodes.find(n => n.id === connection.from)
                    const toNode = flowchart.nodes.find(n => n.id === connection.to)
                    
                    if (!fromNode || !toNode) return null
                    
                    const x1 = fromNode.position.x + (fromNode.size?.width || 160) / 2
                    const y1 = fromNode.position.y + (fromNode.size?.height || 80) / 2
                    const x2 = toNode.position.x + (toNode.size?.width || 160) / 2
                    const y2 = toNode.position.y + (toNode.size?.height || 80) / 2

                    // Different path types
                    let pathElement
                    if (connection.path?.type === 'curved') {
                      const midX = (x1 + x2) / 2
                      const midY = (y1 + y2) / 2
                      const controlX = midX + (y2 - y1) * 0.2 // Perpendicular offset
                      const controlY = midY - (x2 - x1) * 0.2
                      
                      pathElement = (
                        <path
                          d={`M ${x1} ${y1} Q ${controlX} ${controlY} ${x2} ${y2}`}
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth="2"
                          fill="none"
                          markerEnd="url(#arrowhead)"
                        />
                      )
                    } else {
                      pathElement = (
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke="hsl(var(--muted-foreground))"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
                      )
                    }
                    
                    return (
                      <g key={index}>
                        {pathElement}
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
                {flowchart.nodes
                  .sort((a, b) => (a.position.z || 0) - (b.position.z || 0)) // Sort by z-index
                  .map((node) => (
                  <div
                    key={node.id}
                    className={`absolute border-2 rounded-lg p-3 cursor-pointer transition-all ${getNodeColor(node.type)} ${
                      selectedNode?.id === node.id ? 'ring-2 ring-primary' : ''
                    } ${editMode ? 'hover:shadow-md' : ''}`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      zIndex: (node.position.z || 0) + 2,
                      width: node.size?.width || 160,
                      height: node.size?.height || 80
                    }}
                    onClick={() => handleNodeClick(node)}
                  >
                    <div className="flex items-center space-x-2 mb-1">
                      {getNodeIcon(node.type)}
                      <span className="font-medium text-sm">{node.type.toUpperCase()}</span>
                      {editMode && (
                        <Badge variant="outline" className="text-xs">
                          #{node.chronology?.order || 0}
                        </Badge>
                      )}
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

                <div>
                  <label className="text-sm font-medium">Execution Order</label>
                  <p className="text-sm mt-1">#{selectedNode.chronology?.order || 0}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Position</label>
                  <div className="text-sm text-muted-foreground mt-1 space-y-1">
                    <p>X: {selectedNode.position.x}, Y: {selectedNode.position.y}</p>
                    {selectedNode.position.z !== undefined && (
                      <p>Z-Index: {selectedNode.position.z}</p>
                    )}
                  </div>
                </div>

                {selectedNode.size && (
                  <div>
                    <label className="text-sm font-medium">Size</label>
                    <p className="text-sm text-muted-foreground mt-1">
                      {selectedNode.size.width} × {selectedNode.size.height}
                    </p>
                  </div>
                )}

                {selectedNode.chronology && (
                  <div>
                    <label className="text-sm font-medium">Timeline</label>
                    <div className="text-sm text-muted-foreground mt-1 space-y-1">
                      <p>Created: {new Date(selectedNode.chronology.createdAt).toLocaleString()}</p>
                      <p>Updated: {new Date(selectedNode.chronology.updatedAt).toLocaleString()}</p>
                    </div>
                  </div>
                )}
                
                {selectedNode.config && (
                  <div>
                    <label className="text-sm font-medium">Configuration</label>
                    <div className="bg-muted p-2 rounded text-xs font-mono mt-1 max-h-32 overflow-y-auto">
                      {JSON.stringify(selectedNode.config, null, 2)}
                    </div>
                  </div>
                )}
                
                {editMode && (
                  <div className="pt-4 border-t space-y-2">
                    <Button size="sm" className="w-full">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Node
                    </Button>
                    <Button size="sm" variant="outline" className="w-full">
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate Node
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

      {/* Change History */}
      {flowchart.chronology?.changeLog && flowchart.chronology.changeLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <History className="h-5 w-5" />
              <span>Change History</span>
            </CardTitle>
            <CardDescription>Recent modifications to this flowchart</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {flowchart.chronology.changeLog.slice(-10).reverse().map((change, index) => (
                <div key={index} className="flex items-start space-x-3 p-2 rounded bg-muted/50">
                  <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium">{change.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(change.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">{change.details}</p>
                    {change.userId && (
                      <p className="text-xs text-muted-foreground">By: {change.userId}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

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