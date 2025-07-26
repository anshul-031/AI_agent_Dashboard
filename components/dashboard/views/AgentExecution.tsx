'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  RefreshCw,
  CalendarIcon
} from 'lucide-react'
import { useAgentExecutions, useExecutionLogs } from '@/hooks/use-database'
import { Execution } from '@/types/agent'
import { ScrollArea } from '@/components/ui/scroll-area'
import { DateTimePicker } from '@/components/ui/date-picker'

interface AgentExecutionProps {
  agentId: string | null
  onViewFlowchart: (agentId: string) => void
  onBack?: () => void
}

export function AgentExecution({ agentId, onViewFlowchart, onBack }: AgentExecutionProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedExecution, setSelectedExecution] = useState<string | null>(null)
  const [startTimeFrom, setStartTimeFrom] = useState<Date | undefined>()
  const [startTimeTo, setStartTimeTo] = useState<Date | undefined>()
  const [isRunning, setIsRunning] = useState(false)
  
  // Utility function to get auth headers
  const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth-token') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  };
  
  // Function to generate random status
  const getRandomStatus = (): 'success' | 'failed' | 'running' | 'pending' => {
    const statuses: ('success' | 'failed' | 'running' | 'pending')[] = ['success', 'failed', 'running', 'pending']
    const randomIndex = Math.floor(Math.random() * statuses.length)
    return statuses[randomIndex]
  }
  
  // Fetch executions using the new API hook
  const { 
    executions, 
    agent, 
    loading: executionsLoading, 
    error: executionsError,
    refetch: refetchExecutions
  } = useAgentExecutions(agentId || '', {
    status: statusFilter === 'all' ? undefined : statusFilter,
    startTimeFrom: startTimeFrom?.toISOString(),
    startTimeTo: startTimeTo?.toISOString(),
    limit: 50
  })
  
  // Fetch logs for selected execution
  const { 
    logs, 
    loading: logsLoading 
  } = useExecutionLogs(selectedExecution || '', {
    limit: 100
  })

  const executionStats = useMemo(() => {
    if (!executions.length) return { total: 0, success: 0, failed: 0, running: 0, pending: 0 }
    
    // Helper function to normalize status for comparison
    const normalizeStatus = (status: string) => status.toLowerCase()
    
    return {
      total: executions.length,
      success: executions.filter(e => normalizeStatus(e.status) === 'success').length,
      failed: executions.filter(e => normalizeStatus(e.status) === 'failed').length,
      running: executions.filter(e => normalizeStatus(e.status) === 'running').length,
      pending: executions.filter(e => normalizeStatus(e.status) === 'pending').length
    }
  }, [executions])

  const getStatusIcon = (status: Execution['status']) => {
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
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
    const normalizedStatus = status?.toLowerCase()
    switch (normalizedStatus) {
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

  if (!agentId) {
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

  if (executionsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <RefreshCw className="mx-auto h-12 w-12 text-muted-foreground animate-spin" />
          <h3 className="mt-2 text-sm font-semibold">Loading executions...</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Fetching execution history for the agent
          </p>
        </div>
      </div>
    )
  }

  if (executionsError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-500" />
          <h3 className="mt-2 text-sm font-semibold">Failed to load executions</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {executionsError}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-4"
            onClick={() => refetchExecutions()}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => onBack ? onBack() : window.history.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">{agent?.name || 'Unknown Agent'}</h2>
            <p className="text-muted-foreground">
              {agent ? `Category: ${agent.category}` : 'Loading agent details...'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => agent && onViewFlowchart(agent.id)}>
            <GitBranch className="mr-2 h-4 w-4" />
            View Flowchart
          </Button>
          <Button 
            variant="outline"
            onClick={() => {
              // Export execution logs as JSON
              const data = JSON.stringify(executions, null, 2);
              const blob = new Blob([data], { type: 'application/json' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `agent-${agentId}-executions.json`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);
            }}
          >
            <Download className="mr-2 h-4 w-4" />
            Export Logs
          </Button>
          <Button 
            onClick={async () => {
              if (!agentId) return;
              
              setIsRunning(true);
              try {
                // Generate random status instead of always 'pending'
                const randomStatus = getRandomStatus();
                
                // Create a new execution
                const response = await fetch('/api/executions', {
                  method: 'POST',
                  headers: getAuthHeaders(),
                  body: JSON.stringify({
                    agentId: agentId,
                    status: randomStatus.toUpperCase()
                  })
                });
                
                if (response.ok) {
                  // Refresh the execution data to show the new execution
                  refetchExecutions();
                } else {
                  throw new Error('Failed to start execution');
                }
              } catch (error) {
                console.error('Error starting agent:', error);
                alert('Failed to start agent execution. Please try again.');
              } finally {
                setIsRunning(false);
              }
            }}
            disabled={isRunning || !agentId}
          >
            {isRunning ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            {isRunning ? 'Starting...' : 'Run Agent'}
          </Button>
        </div>
      </div>

      {/* Agent Info and Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>Agent Information</span>
              </CardTitle>
              <CardDescription>
                {agent ? `Category: ${agent.category}` : 'Loading agent details...'}
              </CardDescription>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" disabled>
                <Pause className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" disabled>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Execution Stats */}
      <div className="space-y-4">
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-l-4 border-l-gray-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Executions</CardTitle>
              <Clock className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{executionStats.total}</div>
              <p className="text-xs text-gray-500 mt-1">
                All time executions
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Successful</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{executionStats.success}</div>
              <p className="text-xs text-green-600 mt-1">
                {executionStats.total > 0 
                  ? `${Math.round((executionStats.success / executionStats.total) * 100)}% success rate`
                  : 'No executions yet'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-red-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-700">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{executionStats.failed}</div>
              <p className="text-xs text-red-600 mt-1">
                {executionStats.total > 0 
                  ? `${Math.round((executionStats.failed / executionStats.total) * 100)}% failure rate`
                  : 'No failures'
                }
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Running/Pending</CardTitle>
              <RefreshCw className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {executionStats.running + executionStats.pending}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                {executionStats.running} running, {executionStats.pending} pending
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Distribution Bar */}
        {executionStats.total > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Execution Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                {executionStats.success > 0 && (
                  <div 
                    className="bg-green-500 h-full"
                    style={{ width: `${(executionStats.success / executionStats.total) * 100}%` }}
                    title={`${executionStats.success} successful (${Math.round((executionStats.success / executionStats.total) * 100)}%)`}
                  />
                )}
                {executionStats.failed > 0 && (
                  <div 
                    className="bg-red-500 h-full"
                    style={{ width: `${(executionStats.failed / executionStats.total) * 100}%` }}
                    title={`${executionStats.failed} failed (${Math.round((executionStats.failed / executionStats.total) * 100)}%)`}
                  />
                )}
                {executionStats.running > 0 && (
                  <div 
                    className="bg-blue-500 h-full"
                    style={{ width: `${(executionStats.running / executionStats.total) * 100}%` }}
                    title={`${executionStats.running} running (${Math.round((executionStats.running / executionStats.total) * 100)}%)`}
                  />
                )}
                {executionStats.pending > 0 && (
                  <div 
                    className="bg-yellow-500 h-full"
                    style={{ width: `${(executionStats.pending / executionStats.total) * 100}%` }}
                    title={`${executionStats.pending} pending (${Math.round((executionStats.pending / executionStats.total) * 100)}%)`}
                  />
                )}
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  Success ({executionStats.success})
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-1"></div>
                  Failed ({executionStats.failed})
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-1"></div>
                  Running ({executionStats.running})
                </span>
                <span className="flex items-center">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1"></div>
                  Pending ({executionStats.pending})
                </span>
              </div>
            </CardContent>
          </Card>
        )}
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
            <div className="flex items-center space-x-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
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
              
              <div className="flex items-center space-x-4">
                <Label htmlFor="start-from" className="text-sm">From:</Label>
                <DateTimePicker
                  date={startTimeFrom}
                  onDateChange={setStartTimeFrom}
                  placeholder="Select start date"
                  className="w-auto"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <Label htmlFor="start-to" className="text-sm">To:</Label>
                <DateTimePicker
                  date={startTimeTo}
                  onDateChange={setStartTimeTo}
                  placeholder="Select end date"
                  className="w-auto"
                />
              </div>
              
              {(startTimeFrom || startTimeTo) && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setStartTimeFrom(undefined)
                    setStartTimeTo(undefined)
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </div>
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
                {executions.length > 0 ? (
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="text-center space-y-4 max-w-md">
                      {/* Illustration */}
                      <div className="mx-auto w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-200 to-indigo-200 rounded-full flex items-center justify-center">
                          <Clock className="w-8 h-8 text-blue-600" />
                        </div>
                      </div>
                      
                      {/* Text */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">No Execution History</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          This agent hasn&apos;t been executed yet. Click &quot;Run Agent&quot; to start your first execution.
                        </p>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        onClick={async () => {
                          if (!agentId) return;
                          
                          setIsRunning(true);
                          try {
                            // Generate random status instead of always 'pending'
                            const randomStatus = getRandomStatus();
                            
                            const response = await fetch('/api/executions', {
                              method: 'POST',
                              headers: getAuthHeaders(),
                              body: JSON.stringify({
                                agentId: agentId,
                                status: randomStatus.toUpperCase()
                              })
                            });
                            
                            if (response.ok) {
                              refetchExecutions();
                            } else {
                              throw new Error('Failed to start execution');
                            }
                          } catch (error) {
                            console.error('Error starting agent:', error);
                            alert('Failed to start agent execution. Please try again.');
                          } finally {
                            setIsRunning(false);
                          }
                        }}
                        disabled={isRunning || !agentId}
                        className="mt-4"
                      >
                        {isRunning ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Run Agent Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
            <TabsContent value="details" className="space-y-4">
              <ScrollArea className="h-96">
                {executions.length > 0 ? (
                  <div className="space-y-4">
                    {executions.map((execution) => (
                    <Card key={execution.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center space-x-2">
                            {getStatusIcon(execution.status)}
                            <span>Execution #{execution.id}</span>
                          </CardTitle>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedExecution(execution.id)}
                            >
                              View Logs
                            </Button>
                            <Badge variant={getStatusVariant(execution.status)}>
                              {execution.status}
                            </Badge>
                          </div>
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
                              {execution.logs.slice(-3).map((log: any, index: number) => (
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
                ) : (
                  <div className="flex flex-col items-center justify-center h-full py-12">
                    <div className="text-center space-y-4 max-w-md">
                      {/* Illustration */}
                      <div className="mx-auto w-32 h-32 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full flex items-center justify-center">
                          <AlertCircle className="w-8 h-8 text-purple-600" />
                        </div>
                      </div>
                      
                      {/* Text */}
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">No Detailed Executions</h3>
                        <p className="text-sm text-gray-600 mt-2">
                          No execution records found. Start by running the agent to see detailed execution information.
                        </p>
                      </div>
                      
                      {/* Action Button */}
                      <Button 
                        onClick={async () => {
                          if (!agentId) return;
                          
                          setIsRunning(true);
                          try {
                            // Generate random status instead of always 'pending'
                            const randomStatus = getRandomStatus();
                            
                            const response = await fetch('/api/executions', {
                              method: 'POST',
                              headers: getAuthHeaders(),
                              body: JSON.stringify({
                                agentId: agentId,
                                status: randomStatus.toUpperCase()
                              })
                            });
                            
                            if (response.ok) {
                              refetchExecutions();
                            } else {
                              throw new Error('Failed to start execution');
                            }
                          } catch (error) {
                            console.error('Error starting agent:', error);
                            alert('Failed to start agent execution. Please try again.');
                          } finally {
                            setIsRunning(false);
                          }
                        }}
                        disabled={isRunning || !agentId}
                        className="mt-4"
                        variant="outline"
                      >
                        {isRunning ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            Starting...
                          </>
                        ) : (
                          <>
                            <Play className="mr-2 h-4 w-4" />
                            Run Agent Now
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Execution Logs Modal */}
      <Dialog open={!!selectedExecution} onOpenChange={() => setSelectedExecution(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>Execution Logs</DialogTitle>
            <DialogDescription>
              Detailed logs for execution #{selectedExecution?.slice(-8)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[60vh] w-full rounded-md border p-4">
            {logsLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-6 w-6 animate-spin" />
                <span className="ml-2">Loading logs...</span>
              </div>
            ) : logs.length > 0 ? (
              <div className="space-y-2 font-mono text-sm">
                {logs.map((log: any, index: number) => (
                  <div key={index} className="flex items-start space-x-2 py-1">
                    <span className="text-muted-foreground text-xs shrink-0 w-20">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className={`
                      text-xs px-2 py-1 rounded shrink-0 w-16 text-center
                      ${log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warn' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'}
                    `}>
                      {log.level.toUpperCase()}
                    </span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No logs available for this execution
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}