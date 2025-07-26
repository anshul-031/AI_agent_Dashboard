import { useState, useEffect } from 'react';

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

        const response = await fetch(`/api/agents?${params}`);
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

        const response = await fetch(`/api/executions?${params}`);
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
        const response = await fetch('/api/dashboard/stats');
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
          fetch(`/api/agents/${agentId}`),
          fetch(`/api/agents/${agentId}/flowchart`)
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
