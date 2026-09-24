"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AgentStats {
  balance: number;
  total_networks: number;
  total_earnings: number;
}

interface AgentContextType {
  agentName: string;
  stats: AgentStats | null;
  fetchStats: () => Promise<void>;
  isDataLoaded: boolean;
}

const AgentContext = createContext<AgentContextType>({
  agentName: '',
  stats: null,
  fetchStats: async () => {},
  isDataLoaded: false,
});

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [agentName, setAgentName] = useState('');
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);

  const fetchStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
      if (!token) return;

      const res = await fetch('/api/agent/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsDataLoaded(true);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('agent_user');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          setAgentName(user.name);
        } catch (e) {}
      }
    }
  }, []);

  return (
    <AgentContext.Provider value={{ agentName, stats, fetchStats, isDataLoaded }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => useContext(AgentContext);
