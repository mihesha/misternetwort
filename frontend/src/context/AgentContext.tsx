"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface AgentStats {
  balance: number;
  total_networks: number;
  pending_networks?: number;
  total_earnings: number;
  referral_code?: string;
  agent_name?: string;
}

interface AgentContextType {
  agentName: string;
  stats: AgentStats | null;
  fetchStats: () => Promise<void>;
  isDataLoaded: boolean;
  referralCode: string;
  referralUrl: string;
}

const AgentContext = createContext<AgentContextType>({
  agentName: '',
  stats: null,
  fetchStats: async () => {},
  isDataLoaded: false,
  referralCode: '',
  referralUrl: '',
});

export const AgentProvider = ({ children }: { children: React.ReactNode }) => {
  const [agentName, setAgentName] = useState('');
  const [stats, setStats] = useState<AgentStats | null>(null);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralUrl, setReferralUrl] = useState('');

  const fetchStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('agent_auth_token') : null;
      if (!token) return;

      const res = await fetch('/api/agent/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        if (data.referral_code) {
          setReferralCode(data.referral_code);
          const origin = typeof window !== 'undefined' ? window.location.origin : '';
          setReferralUrl(`${origin}/join?ref=${data.referral_code}`);
        }
        if (data.agent_name) {
          setAgentName(data.agent_name);
        }
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
          if (user.name) setAgentName(user.name);
          if (user.referral_code) {
            setReferralCode(user.referral_code);
            setReferralUrl(`${window.location.origin}/join?ref=${user.referral_code}`);
          }
        } catch (e) {}
      }
    }
  }, []);

  return (
    <AgentContext.Provider value={{ agentName, stats, fetchStats, isDataLoaded, referralCode, referralUrl }}>
      {children}
    </AgentContext.Provider>
  );
};

export const useAgentContext = () => useContext(AgentContext);
