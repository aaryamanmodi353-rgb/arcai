'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import { formatDistanceToNow } from 'date-fns';

const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
const priorityStyle = (tone: string) => tone === 'hot' ? 'border-[#e8a33b] text-[#f5bf68]' : tone === 'warm' ? 'border-[#89a7d4] text-[#b9cdf0]' : 'border-white/20 text-[#99a1ad]';

import { AdminLoadingScreen } from '@/components/AdminLoadingScreen';

export default function Dashboard() {
  const router = useRouter();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Hot' | 'At risk'>('All');

  useEffect(() => {
    if (!sessionStorage.getItem('hasSeenAdminLoader')) {
      setShowLoader(true);
    }

    fetch('/api/leads')
      .then(res => res.json())
      .then(data => {
        setLeads(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const pipelineLeads = useMemo(() => leads.filter(l => l.status !== 'closed' && l.status !== 'approved'), [leads]);
  const activeCount = pipelineLeads.filter(l => l.status !== 'withdrawn').length;

  const filtered = useMemo(() => pipelineLeads.filter(lead => {
    if (lead.status === 'withdrawn' && filter !== 'All') return false;
    return (filter === 'All' || (filter === 'Hot' && lead.priority.tier === 'hot') || (filter === 'At risk' && lead.priority.atRisk)) 
      && lead.name.toLowerCase().includes(query.toLowerCase());
  }), [filter, query, pipelineLeads]);

  const hotCount = pipelineLeads.filter(l => l.status !== 'withdrawn' && l.priority.tier === 'hot').length;
  const riskCount = pipelineLeads.filter(l => l.status !== 'withdrawn' && l.priority.atRisk).length;
  const approvedCount = leads.filter(l => l.status === 'approved').length;

  const handleLoaderComplete = () => {
    sessionStorage.setItem('hasSeenAdminLoader', 'true');
    setShowLoader(false);
  };

  if (showLoader) {
    return <AdminLoadingScreen onComplete={handleLoaderComplete} />;
  }

  return (
    <main className="flex-1 overflow-auto px-5 pb-10 pt-6 lg:px-9">
      <div className="mb-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
        <div>
          <p className="eyebrow mb-2 text-[#e8a33b]">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <div className="flex items-baseline gap-4">
            <h1 className="font-display text-4xl text-white">Your Deal Room</h1>
            <p className="text-sm text-[#8c94a0]">
              {loading ? '— Loading leads...' : `— ${activeCount} leads in your pipeline.`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Icon name="search" size={16} />
            <input value={query} onChange={e => setQuery(e.target.value)} className="field w-64 pl-9 bg-[#11151c]/60 backdrop-blur-md" placeholder="Search high-value inventory..." />
          </div>
          <button className="button-secondary bg-[#11151c]/60 backdrop-blur-md"><Icon name="filter" size={15}/> Filters</button>
        </div>
      </div>

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <div className="metric-card relative">
          <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-[#f3bd65]"></div>
          <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">PRIORITY PIPELINE</p>
          <strong className="text-[#f3bd65]">{activeCount} Active</strong>
          <span>leads in total</span>
        </div>
        <div className="metric-card">
          <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">HOT TO CALL</p>
          <strong>{hotCount.toString().padStart(2, '0')}</strong>
          <span>requires immediate recovery</span>
        </div>
        <div className="metric-card relative">
          <div className="absolute top-4 right-4 h-1.5 w-1.5 rounded-full bg-[#75c994]"></div>
          <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">MOMENTUM / DEALS WON</p>
          <strong className="text-[#75c994]">{approvedCount}</strong>
          <span>deals successfully approved</span>
        </div>
      </section>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex gap-2">
          {(['All', 'Hot', 'At risk'] as const).map(item => (
            <button onClick={() => setFilter(item)} className={`pill flex items-center gap-2 ${filter === item ? 'pill-active' : ''}`} key={item}>
              {item}
              {item === 'Hot' && <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${filter === item ? 'bg-[#f3bd65] text-[#1a1307]' : 'bg-[#f3bd65]/20 text-[#f3bd65]'}`}>{hotCount}</span>}
              {item === 'At risk' && <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${filter === item ? 'bg-[#8a94a1] text-[#1a1307]' : 'bg-[#8a94a1]/20 text-[#8a94a1]'}`}>{riskCount}</span>}
            </button>
          ))}
        </div>
        <span className="eyebrow hidden sm:flex items-center gap-1.5 text-[#f3bd65]">
          <Icon name="sparkles" size={12}/> SORTED BY AI PRIORITY
        </span>
      </div>

      <section className="flex flex-col gap-3">
        <div className="grid grid-cols-[1.35fr_.75fr_1.8fr_.85fr_.2fr] gap-4 px-5 pb-1 text-[10px] font-semibold uppercase tracking-[.16em] text-[#69717e]">
          <span>Lead</span><span>Priority</span><span>AI readout</span><span>Last contact</span><span/>
        </div>
        
        {loading ? (
           <div className="p-8 text-center text-sm text-[#69717e]">Loading...</div>
        ) : filtered.length === 0 ? (
           <div className="p-8 text-center text-sm text-[#69717e]">No leads found.</div>
        ) : (
          filtered.map((lead, i) => (
            <button onClick={() => router.push(`/admin/leads/${lead._id}`)} key={lead._id} className="lead-row group grid w-full grid-cols-[1.35fr_.75fr_1.8fr_.85fr_.2fr] items-center gap-4 px-5 py-5 text-left" style={{ animationDelay: `${i * 55}ms` }}>
              <div className="flex items-center gap-3">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-display text-lg text-[#edf0f3]">{lead.name}</h3>
                    {lead.status === 'withdrawn' && (
                      <span className="inline-flex items-center rounded bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">Withdrawn</span>
                    )}
                  </div>
                  <p className="text-xs text-[#7f8997]">{lead.location} <span className="mx-1 text-[#535b66]">•</span>{lead.budget}</p>
                </div>
              </div>
              <div>
                <span className={`priority font-bold tracking-wider ${priorityStyle(lead.priority.tier)}`}>
                  {lead.priority.tier.toUpperCase()} {lead.priority.score}
                </span>
                {lead.priority.atRisk && (
                  <span className="mt-2 flex w-fit items-center gap-1 text-[11px] text-[#ef9894]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#ec7773]"/> At risk
                  </span>
                )}
              </div>
              <div>
                <p className="line-clamp-2 max-w-xl text-[13px] leading-5 text-[#c6ced8]">{lead.analysis.summary}</p>
                <span className="mt-2 inline-flex rounded-full border border-white/5 bg-white/[.03] px-2.5 py-1 text-[10px] font-medium text-[#77818e] capitalize">
                  {lead.analysis.intent.replace(/_/g, ' ')}
                </span>
              </div>
              <span className="text-xs text-[#77818e]">
                {formatDistanceToNow(new Date(lead.updatedAt), { addSuffix: true })}
              </span>
              <span className="justify-self-end text-[#5e6773] transition group-hover:translate-x-1 group-hover:text-[#f0b85d]">
                <Icon name="chevron" size={17}/>
              </span>
            </button>
          ))
        )}
      </section>
    </main>
  );
}
