'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  RotateCcw, 
  GitBranch,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  RefreshCw
} from 'lucide-react'
import { mockAgents, mockExecutions } from '@/lib/mock-data'
import { Execution } from '@/types/agent'
import { ScrollArea } from '@/components/ui/scroll-area'

interface AgentExecutionProps {
  agentId: string | null
  onViewFlowchart: (agentId: string) => void
}

export function AgentExecution({ agentId, onViewFlowchart }: AgentExecutionProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  const agent = agentId ? mockAgents.find(a => a.id === agentId) : null
  const executions = useMemo(() => {
    if (!agentId) return []
    const agentExecutions = mockExecutions.filter(e => e.agentId === agentId)
    if (statusFilter === 'all') return agentExecutions
    return agentExecutions.filter(e => e.status === statusFilter)
  }, [agentId, statusFilter])

  const executionStats = useMemo(() => {
    if (!agentId) return { total: 0, success: 0, failed: 0, running: 0 }
    const agentExecutions = mockExecutions.filter(e => e.agentId === agentId)
    return {
      total: agentExecutions.length,
      success: agentExecutions.filter(e => e.status === 'success').length,
      failed: agentExecutions.filter(e => e.status === 'failed').length,
      running: agentExecutions.filter(e => e.status === 'running').length
    }
  }, [agentId])

  const getStatusIcon = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: Execution['status']) => {
    switch (status) {
      case 'success':
        return 'default'
      case 'failed':
        return 'destructive'
      case 'running':
        return 'default'
      case 'pending':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`
    return `${seconds}s`
  }

  if (!agent) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold">No agent selected</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please select an agent from the overview to view execution history
          </p>
        </div>
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
            <h2 className="text-3xl font-bold tracking-tight">{agent.name}</h2>
            <p className="text-muted-foreground">{agent.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => onViewFlowchart(agent.id)}>
            <GitBranch className="mr-2 h-4 w-4" />
            View Flowchart
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <Button>
            <Play className="mr-2 h-4 w-4" />
            Run Agent
          </Button>
        </div>
      </div>

      {/* Agent Status and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Agent Status</span>
                <Badge variant={getStatusVariant(agent.status as any)}>
                  {agent.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Category: {agent.category} • Created: {new Date(agent.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Pause className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Execution Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionStats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionStats.failed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executionStats.running}</div>
          </CardContent>
        </Card>
      </div>

      {/* Execution History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>
                Recent execution logs and details
              </CardDescription>
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="list" className="w-full">
            <TabsList>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="details">Detailed View</TabsTrigger>
            </TabsList>
            <TabsContent value="list" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-2">
                  {executions.map((execution) => (
                    <Card key={execution.id} className="p-4 hover:shadow-sm transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(execution.status)}
                          <div>
                            <p className="font-medium">Execution #{execution.id}</p>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(execution.startTime).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={getStatusVariant(execution.status)}>
                            {execution.status}
                          </Badge>
                          {execution.endTime && (
                            <p className="text-sm text-muted-foreground mt-1">
                              Duration: {formatDuration(
                                new Date(execution.endTime).getTime() - 
                                new Date(execution.startTime).getTime()
                              )}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            <TabsContent value="details" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {executions.map((execution) => (
                    <Card key={execution.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            {getStatusIcon(execution.status)}
                            <span>Execution #{execution.id}</span>
                          </CardTitle>
                          <Badge variant={getStatusVariant(execution.status)}>
                            {execution.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h4 className="font-medium mb-2">Timeline</h4>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(execution.startTime).toLocaleString()}
                            </p>
                            {execution.endTime && (
                              <p className="text-sm text-muted-foreground">
                                Ended: {new Date(execution.endTime).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Results</h4>
                            {execution.result && (
                              <p className="text-sm">{execution.result}</p>
                            )}
                            {execution.error && (
                              <p className="text-sm text-red-600">{execution.error}</p>
                            )}
                          </div>
                        </div>
                        {execution.logs && execution.logs.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Recent Logs</h4>
                            <div className="bg-muted p-3 rounded-md text-sm font-mono">
                              {execution.logs.slice(-3).map((log, index) => (
                                <div key={index} className="mb-1">
                                  <span className="text-muted-foreground">
                                    {new Date(log.timestamp).toLocaleTimeString()}
                                  </span>
                                  {' '}
                                  <span className={
                                    log.level === 'error' ? 'text-red-600' :
                                    log.level === 'warn' ? 'text-yellow-600' :
                                    'text-foreground'
                                  }>
                                    {log.message}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}