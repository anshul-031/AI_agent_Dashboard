'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { 
  Search, 
  Filter, 
  Plus, 
  Bot, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Pause,
  Play,
  MoreHorizontal,
  RefreshCw,
  Power,
  PowerOff
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { CreateAgentModal } from '../CreateAgentModal'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/hooks/use-toast'
import { 
  AGENT_STATUS, 
  AGENT_STATUS_OPTIONS, 
  AGENT_CATEGORIES,
  type AgentStatus 
} from '@/lib/constants'

interface Agent {
  id: string
  name: string
  description: string
  status: AgentStatus
  category: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  lastActive: string
  lastExecution: string | null
  executionCount: number
  configuration: any
  createdBy?: {
    id: string
    name: string
    email: string
  }
}

interface AgentOverviewProps {
  onAgentSelect: (agentId: string) => void
}

export function AgentOverview({ onAgentSelect }: AgentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [createdByFilter, setCreatedByFilter] = useState<string>('all')
  const [enabledFilter, setEnabledFilter] = useState<string>('all')
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [agentToDelete, setAgentToDelete] = useState<{ id: string; name: string } | null>(null)
  const { token, user } = useAuth()
  const { toast } = useToast()

  const fetchAgents = useCallback(async (filters?: {
    search?: string;
    status?: string;
    category?: string;
    createdBy?: string;
    enabled?: string;
  }) => {
    if (!token) return
    
    try {
      setLoading(true)
      
      // Build query parameters
      const params = new URLSearchParams()
      if (filters?.search) params.append('search', filters.search)
      if (filters?.status && filters.status !== 'all') params.append('status', filters.status)
      if (filters?.category && filters.category !== 'all') params.append('category', filters.category)
      if (filters?.createdBy && filters.createdBy !== 'all') params.append('createdBy', filters.createdBy)
      if (filters?.enabled && filters.enabled !== 'all') params.append('enabled', filters.enabled)
      
      const url = `/api/agents${params.toString() ? `?${params.toString()}` : ''}`
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Failed to fetch agents')
      }

      const data = await response.json()
      setAgents(data.agents || [])
    } catch (error) {
      console.error('Fetch agents error:', error)
      toast({
        title: "Failed to load agents",
        description: "Unable to fetch agents. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }, [token, toast])

  const deleteAgent = useCallback(async (agentId: string, agentName: string) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to delete an agent",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle specific error cases
        if (response.status === 403) {
          throw new Error('You do not have permission to delete agents. Admin role required.')
        } else if (response.status === 404) {
          throw new Error('Agent not found or has already been deleted.')
        } else {
          throw new Error(errorData.error || 'Failed to delete agent')
        }
      }

      toast({
        title: "Agent deleted successfully",
        description: `${agentName} has been removed from your agents.`
      })

      // Refresh the agents list
      fetchAgents({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        createdBy: createdByFilter,
        enabled: enabledFilter
      })

      // Close dialog and reset state
      setDeleteDialogOpen(false)
      setAgentToDelete(null)

    } catch (error) {
      console.error('Delete agent error:', error)
      toast({
        title: "Failed to delete agent",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }, [token, toast, fetchAgents, searchTerm, statusFilter, categoryFilter, createdByFilter, enabledFilter])

  const toggleAgentEnabled = useCallback(async (agentId: string, agentName: string, currentEnabled: boolean) => {
    if (!token) {
      toast({
        title: "Authentication required",
        description: "Please log in to modify an agent",
        variant: "destructive"
      })
      return
    }

    try {
      const response = await fetch(`/api/agents/${agentId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !currentEnabled
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        
        // Handle specific error cases
        if (response.status === 403) {
          throw new Error('You do not have permission to modify agents. Operator role required.')
        } else if (response.status === 404) {
          throw new Error('Agent not found.')
        } else {
          throw new Error(errorData.error || 'Failed to update agent')
        }
      }

      const newStatus = !currentEnabled ? 'enabled' : 'disabled'
      toast({
        title: `Agent ${newStatus} successfully`,
        description: `${agentName} has been ${newStatus}.`
      })

      // Refresh the agents list
      fetchAgents({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        createdBy: createdByFilter,
        enabled: enabledFilter
      })

    } catch (error) {
      console.error('Toggle agent error:', error)
      toast({
        title: "Failed to update agent",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      })
    }
  }, [token, toast, fetchAgents, searchTerm, statusFilter, categoryFilter, createdByFilter, enabledFilter])

  const handleDeleteClick = (agentId: string, agentName: string) => {
    setAgentToDelete({ id: agentId, name: agentName })
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = () => {
    if (agentToDelete) {
      deleteAgent(agentToDelete.id, agentToDelete.name)
    }
  }

  useEffect(() => {
    if (token) {
      fetchAgents()
    }
  }, [token, fetchAgents])

  // Real-time search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchAgents({
        search: searchTerm,
        status: statusFilter,
        category: categoryFilter,
        createdBy: createdByFilter,
        enabled: enabledFilter
      })
    }, 300) // 300ms debounce

    return () => clearTimeout(timeoutId)
  }, [searchTerm, statusFilter, categoryFilter, createdByFilter, enabledFilter, fetchAgents])

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
  }

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value)
  }

  const handleCreatedByFilterChange = (value: string) => {
    setCreatedByFilter(value)
  }

  const handleEnabledFilterChange = (value: string) => {
    setEnabledFilter(value)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case AGENT_STATUS.RUNNING:
        return <Play className="h-4 w-4 text-blue-500" />
      case AGENT_STATUS.IDLE:
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case AGENT_STATUS.ERROR:
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: Agent['status']) => {
    switch (status) {
      case AGENT_STATUS.RUNNING:
        return 'default'
      case AGENT_STATUS.IDLE:
        return 'secondary'
      case AGENT_STATUS.ERROR:
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const agentStats = useMemo(() => {
    return {
      total: agents.length,
      running: agents.filter(a => a.status === AGENT_STATUS.RUNNING).length,
      idle: agents.filter(a => a.status === AGENT_STATUS.IDLE).length,
      error: agents.filter(a => a.status === AGENT_STATUS.ERROR).length,
      enabled: agents.filter(a => a.enabled).length,
      disabled: agents.filter(a => !a.enabled).length
    }
  }, [agents])

  return (
    <TooltipProvider>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agent Overview</h2>
          <p className="text-muted-foreground">
            Manage and monitor your AI agents
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchAgents({
              search: searchTerm,
              status: statusFilter,
              category: categoryFilter,
              createdBy: createdByFilter,
              enabled: enabledFilter
            })}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Agent
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.total}</div>
            <p className="text-xs text-muted-foreground">
              All registered agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enabled</CardTitle>
            <Power className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.enabled}</div>
            <p className="text-xs text-muted-foreground">
              Active agents
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Idle</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.idle}</div>
            <p className="text-xs text-muted-foreground">
              Ready for execution
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Running</CardTitle>
            <Play className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.running}</div>
            <p className="text-xs text-muted-foreground">
              Currently executing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.error}</div>
            <p className="text-xs text-muted-foreground">
              Failed agents
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Agents</CardTitle>
          <CardDescription>
            Search and filter your AI agents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              {loading && (
                <RefreshCw className="absolute right-3 top-3 h-4 w-4 text-muted-foreground animate-spin" />
              )}
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10 pr-10"
                disabled={loading}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                {AGENT_STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={handleCategoryFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {AGENT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={createdByFilter} onValueChange={handleCreatedByFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by creator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Creators</SelectItem>
                {Array.from(new Set(agents.map(agent => agent.createdBy?.name).filter(Boolean)))
                  .map((creatorName) => (
                    <SelectItem key={creatorName} value={creatorName || ''}>
                      {creatorName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Select value={enabledFilter} onValueChange={handleEnabledFilterChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All States</SelectItem>
                <SelectItem value="true">Enabled Only</SelectItem>
                <SelectItem value="false">Disabled Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {agents.map((agent) => (
              <Card 
                key={agent.id} 
                className={`cursor-pointer transition-shadow ${
                  agent.enabled 
                    ? 'hover:shadow-md' 
                    : 'opacity-60 hover:shadow-sm'
                }`}
                onClick={() => onAgentSelect(agent.id)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(agent.status)}
                      <CardTitle className="text-lg">{agent.name}</CardTitle>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>Edit Agent</DropdownMenuItem>
                        <DropdownMenuItem>Duplicate</DropdownMenuItem>
                        {(user?.role === 'admin' || user?.role === 'operator') && (
                          <DropdownMenuItem 
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAgentEnabled(agent.id, agent.name, agent.enabled)
                            }}
                          >
                            {agent.enabled ? (
                              <>
                                <PowerOff className="mr-2 h-4 w-4" />
                                Disable Agent
                              </>
                            ) : (
                              <>
                                <Power className="mr-2 h-4 w-4" />
                                Enable Agent
                              </>
                            )}
                          </DropdownMenuItem>
                        )}
                        {user?.role === 'admin' && (
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteClick(agent.id, agent.name)
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant={getStatusVariant(agent.status)}>
                        {agent.status}
                      </Badge>
                      <Badge variant="outline">{agent.category}</Badge>
                      <Badge variant={agent.enabled ? "secondary" : "destructive"}>
                        {agent.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                    {(user?.role === 'admin' || user?.role === 'operator') && (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleAgentEnabled(agent.id, agent.name, agent.enabled)
                            }}
                            className="h-6 w-6 p-0"
                          >
                            {agent.enabled ? (
                              <PowerOff className="h-3 w-3 text-orange-500" />
                            ) : (
                              <Power className="h-3 w-3 text-green-500" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{agent.enabled ? 'Disable agent' : 'Enable agent'}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {agent.description}
                  </p>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created by:</span>
                      <span className="font-medium">
                        {agent.createdBy?.name || 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium cursor-help">
                            {new Date(agent.createdAt).toLocaleDateString()}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Created: {agent.createdAt}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Last active:</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-medium cursor-help">
                            {new Date(agent.lastActive).toLocaleDateString()}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Last active: {agent.lastActive}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium">
                        {agent.enabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-muted-foreground">
                        Last run: {agent.lastExecution ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className="font-medium cursor-help">
                                {new Date(agent.lastExecution).toLocaleDateString()}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Last execution: {agent.lastExecution}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          <span className="font-medium">Never</span>
                        )}
                      </span>
                      <span className="font-medium">
                        {agent.executionCount} runs
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {agents.length === 0 && !loading && (
            <div className="text-center py-8">
              <Bot className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-sm font-semibold">No agents found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CreateAgentModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onAgentCreated={() => fetchAgents({
          search: searchTerm,
          status: statusFilter,
          category: categoryFilter,
          createdBy: createdByFilter,
          enabled: enabledFilter
        })}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &ldquo;{agentToDelete?.name}&rdquo;? This action cannot be undone.
              All associated executions and flowcharts will also be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAgentToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </TooltipProvider>
  )
}