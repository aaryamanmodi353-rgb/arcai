'use client';
import { useState, useEffect, useMemo } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

export default function AnalyticsDashboard() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      });
  }, []);

  // Compute metrics
  const stats = useMemo(() => {
    if (!leads.length) return { totalValue: 0, conversionRate: 0, avgMatchScore: 0, statusData: [], timelineData: [] };

    let totalValue = 0;
    let closedCount = 0;
    let totalScore = 0;
    let scoredLeads = 0;

    const statusCounts: Record<string, number> = {
      new: 0,
      contacted: 0,
      qualified: 0,
      viewing: 0,
      negotiation: 0,
      closed: 0,
      approved: 0,
      withdrawn: 0
    };

    leads.forEach(lead => {
      // Add to portfolio value based on budget (average of range or max)
      if (lead.budget) {
        const numbers = lead.budget.match(/\d+/g);
        if (numbers) {
          const val = Math.max(...numbers.map(Number));
          totalValue += val;
        }
      }

      // Track status
      if (statusCounts[lead.status] !== undefined) {
        statusCounts[lead.status]++;
      } else {
        statusCounts[lead.status] = 1;
      }

      if (lead.status === 'closed' || lead.status === 'approved') closedCount++;

      // AI Match Accuracy
      if (lead.analysis?.scores?.match > 0) {
        totalScore += lead.analysis.scores.match;
        scoredLeads++;
      }
    });

    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    return {
      totalValue,
      conversionRate: (closedCount / leads.length) * 100,
      avgMatchScore: scoredLeads > 0 ? (totalScore / scoredLeads) : 0,
      statusData,
      // Mock timeline data for the chart based on current volume
      timelineData: [
        { name: 'Week 1', leads: Math.max(1, Math.floor(leads.length * 0.2)) },
        { name: 'Week 2', leads: Math.max(1, Math.floor(leads.length * 0.4)) },
        { name: 'Week 3', leads: Math.max(1, Math.floor(leads.length * 0.7)) },
        { name: 'Week 4', leads: leads.length }
      ]
    };
  }, [leads]);

  if (loading) {
    return <div className="p-12 text-[#a8b0bb] text-center">Loading analytics data...</div>;
  }

  const COLORS = ['#e8a33b', '#75c994', '#9d82f3', '#4f9b77', '#c79042', '#30425c', '#5b4130', '#31363e'];

  return (
    <main className="flex-1 overflow-auto px-5 pb-10 pt-6 lg:px-9">
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow mb-2 text-[#e8a33b]">Performance Overview</p>
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-4xl text-white">Analytics Dashboard</h1>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="metric-card bg-[#0a0d12]/50">
          <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">TOTAL PORTFOLIO VALUE</p>
          <strong className="text-[#f3bd65]">${(stats.totalValue).toLocaleString()}M+</strong>
          <span>Calculated from active lead budgets</span>
        </div>
        <div className="metric-card bg-[#0a0d12]/50">
          <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">CONVERSION RATE</p>
          <strong className="text-white">{stats.conversionRate.toFixed(1)}%</strong>
          <span>Leads successfully closed</span>
        </div>
        <div className="metric-card bg-[#0a0d12]/50">
          <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">AVG AI MATCH ACCURACY</p>
          <strong className="text-[#75c994]">{stats.avgMatchScore.toFixed(0)} / 100</strong>
          <span>Based on automated qualification</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="panel p-6 bg-[#0a0d12]/50">
          <h2 className="font-display text-xl text-white mb-6">Pipeline Growth</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stats.timelineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis dataKey="name" stroke="#8c94a0" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#8c94a0" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0a0d12', border: '1px solid #ffffff10', borderRadius: '8px' }}
                  itemStyle={{ color: '#e8a33b' }}
                />
                <Line type="monotone" dataKey="leads" stroke="#e8a33b" strokeWidth={3} dot={{ fill: '#0a0d12', stroke: '#e8a33b', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel p-6 bg-[#0a0d12]/50">
          <h2 className="font-display text-xl text-white mb-6">Lead Distribution by Status</h2>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.statusData.filter(d => d.value > 0)}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {stats.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#0a0d12', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </main>
  );
}
