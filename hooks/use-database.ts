import { useState, useEffect } from 'react';

// Utility function to get auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth-token');
  }
  return null;
};

// Utility function to create authenticated fetch options
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// Custom hook for fetching agents
export function useAgents(filters?: {
  status?: string;
  category?: string;
  search?: string;
}) {
  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.category) params.append('category', filters.category);
        if (filters?.search) params.append('search', filters.search);

        const response = await fetch(`/api/agents?${params}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch agents');
        }
        
        const data = await response.json();
        setAgents(data.agents);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchAgents();
  }, [filters?.status, filters?.category, filters?.search]);

  return { agents, loading, error, refetch: () => window.location.reload() };
}

// Custom hook for fetching executions
export function useExecutions(agentId?: string, limit: number = 50) {
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExecutions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (agentId) params.append('agentId', agentId);
        params.append('limit', limit.toString());

        const response = await fetch(`/api/executions?${params}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch executions');
        }
        
        const data = await response.json();
        setExecutions(data.executions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchExecutions();
  }, [agentId, limit]);

  return { executions, loading, error };
}

// Custom hook for fetching dashboard stats
export function useDashboardStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/stats', {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard stats');
        }
        
        const data = await response.json();
        setStats(data.stats);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
}

// Custom hook for fetching agent with flowchart
export function useAgentWithFlowchart(agentId: string) {
  const [agent, setAgent] = useState(null);
  const [flowchart, setFlowchart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgentData = async () => {
      try {
        setLoading(true);
        
        // Fetch agent and flowchart in parallel
        const [agentResponse, flowchartResponse] = await Promise.all([
          fetch(`/api/agents/${agentId}`, { headers: getAuthHeaders() }),
          fetch(`/api/agents/${agentId}/flowchart`, { headers: getAuthHeaders() })
        ]);

        if (!agentResponse.ok) {
          throw new Error('Failed to fetch agent');
        }

        const agentData = await agentResponse.json();
        setAgent(agentData.agent);

        // Flowchart might not exist, so don't throw error
        if (flowchartResponse.ok) {
          const flowchartData = await flowchartResponse.json();
          setFlowchart(flowchartData.flowchart);
        } else {
          setFlowchart(null);
        }

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgentData();
    }
  }, [agentId]);

  return { agent, flowchart, loading, error };
}

// Custom hook for fetching agent executions with advanced filtering
export function useAgentExecutions(agentId: string, filters?: {
  status?: string;
  startTimeFrom?: string;
  startTimeTo?: string;
  endTimeFrom?: string;
  endTimeTo?: string;
  page?: number;
  limit?: number;
}) {
  const [data, setData] = useState<{
    executions: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    agent?: {
      id: string;
      name: string;
      category: string;
    };
  }>({
    executions: [],
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchAgentExecutions = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (filters?.status) params.append('status', filters.status);
        if (filters?.startTimeFrom) params.append('startTimeFrom', filters.startTimeFrom);
        if (filters?.startTimeTo) params.append('startTimeTo', filters.startTimeTo);
        if (filters?.endTimeFrom) params.append('endTimeFrom', filters.endTimeFrom);
        if (filters?.endTimeTo) params.append('endTimeTo', filters.endTimeTo);
        if (filters?.page) params.append('page', filters.page.toString());
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`/api/agents/${agentId}/executions?${params}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch agent executions');
        }
        
        const responseData = await response.json();
        setData(responseData);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (agentId) {
      fetchAgentExecutions();
    }
  }, [agentId, filters?.status, filters?.startTimeFrom, filters?.startTimeTo, filters?.endTimeFrom, filters?.endTimeTo, filters?.page, filters?.limit, refreshTrigger]);

  return { 
    executions: data.executions, 
    total: data.total,
    page: data.page,
    limit: data.limit,
    totalPages: data.totalPages,
    agent: data.agent,
    loading, 
    error,
    refetch: () => {
      // Trigger a re-fetch by incrementing the refresh trigger
      setRefreshTrigger(prev => prev + 1);
    }
  };
}

// Custom hook for fetching execution logs
export function useExecutionLogs(executionId: string, filters?: {
  level?: string;
  limit?: number;
}) {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        
        if (filters?.level) params.append('level', filters.level);
        if (filters?.limit) params.append('limit', filters.limit.toString());

        const response = await fetch(`/api/executions/${executionId}/logs?${params}`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error('Failed to fetch execution logs');
        }
        
        const data = await response.json();
        setLogs(data.logs);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    if (executionId) {
      fetchLogs();
    }
  }, [executionId, filters?.level, filters?.limit]);

  return { logs, loading, error };
}
