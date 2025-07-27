
import { renderHook, waitFor } from '@testing-library/react';
import { useAgents, useExecutions, useDashboardStats, useAgentWithFlowchart, useAgentExecutions, useExecutionLogs } from '../use-database';

// Mock localStorage
const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => {
      store = {};
    },
    removeItem: (key: string) => {
      delete store[key];
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

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

global.fetch = jest.fn();

describe('use-database utilities', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getAuthToken', () => {
    it('should return null if no token is present', () => {
      expect(getAuthToken()).toBeNull();
    });

    it('should return the token if it is present', () => {
      localStorage.setItem('auth-token', 'test-token');
      expect(getAuthToken()).toBe('test-token');
    });
  });

  describe('getAuthHeaders', () => {
    it('should return headers without Authorization if no token is present', () => {
      const headers = getAuthHeaders();
      expect(headers).toEqual({ 'Content-Type': 'application/json' });
    });

    it('should return headers with Authorization if token is present', () => {
      localStorage.setItem('auth-token', 'test-token');
      const headers = getAuthHeaders();
      expect(headers).toEqual({
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      });
    });
  });
});


global.fetch = jest.fn();

describe('useAgents', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch agents and return data', async () => {
    const mockAgents = [{ id: '1', name: 'Test Agent' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agents: mockAgents }),
    });

    const { result } = renderHook(() => useAgents());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.agents).toEqual(mockAgents);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle fetch error', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Failed to fetch'));

    const { result } = renderHook(() => useAgents());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.loading).toBe(false);
  });
});

describe('useExecutions', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch executions and return data', async () => {
    const mockExecutions = [{ id: '1', status: 'completed' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ executions: mockExecutions }),
    });

    const { result } = renderHook(() => useExecutions('agent1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.executions).toEqual(mockExecutions);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useDashboardStats', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch dashboard stats and return data', async () => {
    const mockStats = { totalAgents: 10, totalExecutions: 100 };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ stats: mockStats }),
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.stats).toEqual(mockStats);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useAgentWithFlowchart', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch agent and flowchart data', async () => {
    const mockAgent = { id: '1', name: 'Test Agent' };
    const mockFlowchart = { id: 'fc1', data: {} };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ agent: mockAgent }),
    }).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flowchart: mockFlowchart }),
    });

    const { result } = renderHook(() => useAgentWithFlowchart('1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.agent).toEqual(mockAgent);
    expect(result.current.flowchart).toEqual(mockFlowchart);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useAgentExecutions', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch agent executions with filters', async () => {
    const mockData = { executions: [], total: 0, page: 1, limit: 10, totalPages: 0 };
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => (mockData),
    });

    const { result } = renderHook(() => useAgentExecutions('1', { status: 'completed' }));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.executions).toEqual(mockData.executions);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});

describe('useExecutionLogs', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it('should fetch execution logs', async () => {
    const mockLogs = [{ id: 'log1', message: 'Log message' }];
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ logs: mockLogs }),
    });

    const { result } = renderHook(() => useExecutionLogs('exec1'));

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.logs).toEqual(mockLogs);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
