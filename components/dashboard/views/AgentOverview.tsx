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
  RefreshCw
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CreateAgentModal } from '../CreateAgentModal'
import { useAuth } from '@/components/providers/AuthProvider'
import { useToast } from '@/hooks/use-toast'

interface Agent {
  id: string
  name: string
  description: string
  status: 'ACTIVE' | 'INACTIVE' | 'RUNNING' | 'PAUSED'
  category: string
  enabled: boolean
  createdAt: string
  updatedAt: string
  lastActive: string
  lastExecution: string | null
  executionCount: number
  configuration: any
}

interface AgentOverviewProps {
  onAgentSelect: (agentId: string) => void
}

export function AgentOverview({ onAgentSelect }: AgentOverviewProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const { token } = useAuth()
  const { toast } = useToast()

  const fetchAgents = useCallback(async () => {
    if (!token) return
    
    try {
      setLoading(true)
      const response = await fetch('/api/agents', {
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

  useEffect(() => {
    if (token) {
      fetchAgents()
    }
  }, [token, fetchAgents])

  const filteredAgents = useMemo(() => {
    return agents.filter(agent => {
      const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           agent.description.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === 'all' || agent.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || agent.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [agents, searchTerm, statusFilter, categoryFilter])

  const getStatusIcon = (status: Agent['status']) => {
    switch (status) {
      case 'ACTIVE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'INACTIVE':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'RUNNING':
        return <Play className="h-4 w-4 text-blue-500" />
      case 'PAUSED':
        return <Pause className="h-4 w-4 text-yellow-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusVariant = (status: Agent['status']) => {
    switch (status) {
      case 'ACTIVE':
        return 'default'
      case 'INACTIVE':
        return 'destructive'
      case 'RUNNING':
        return 'default'
      case 'PAUSED':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const agentStats = useMemo(() => {
    return {
      total: agents.length,
      active: agents.filter(a => a.status === 'ACTIVE').length,
      running: agents.filter(a => a.status === 'RUNNING').length,
      inactive: agents.filter(a => a.status === 'INACTIVE').length
    }
  }, [agents])

  return (
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
            onClick={() => fetchAgents()}
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.active}</div>
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
            <CardTitle className="text-sm font-medium">Inactive</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{agentStats.inactive}</div>
            <p className="text-xs text-muted-foreground">
              Not operational
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
              <Input
                placeholder="Search agents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Data Processing">Data Processing</SelectItem>
                <SelectItem value="Customer Service">Customer Service</SelectItem>
                <SelectItem value="Analytics">Analytics</SelectItem>
                <SelectItem value="Automation">Automation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Agent Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredAgents.map((agent) => (
              <Card 
                key={agent.id} 
                className="cursor-pointer hover:shadow-md transition-shadow"
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
                        <DropdownMenuItem className="text-destructive">
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusVariant(agent.status)}>
                      {agent.status}
                    </Badge>
                    <Badge variant="outline">{agent.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    {agent.description}
                  </p>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      Last run: {agent.lastExecution 
                        ? new Date(agent.lastExecution).toLocaleDateString()
                        : 'Never'
                      }
                    </span>
                    <span className="font-medium">
                      {agent.executionCount} runs
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredAgents.length === 0 && (
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
        onAgentCreated={fetchAgents}
      />
    </div>
  )
}