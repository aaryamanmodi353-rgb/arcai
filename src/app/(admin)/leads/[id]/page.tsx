'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Icon } from '@/components/Icon';
import { useRouter } from 'next/navigation';
const priorityStyle = (tone: string) => tone === 'hot' ? 'bg-[#e8a33b]/15 text-[#f5bf68] border-[#e8a33b]/25' : tone === 'warm' ? 'bg-[#89a7d4]/12 text-[#b9cdf0] border-[#89a7d4]/25' : 'bg-white/5 text-[#99a1ad] border-white/10';

const Concern = ({ level, text, resolved }: { level: string; text: string; resolved?: boolean }) => (
  <div className="flex items-start gap-2">
    <span className={`mt-0.5 rounded px-1.5 py-0.5 text-[15px] font-bold tracking-wider ${resolved ? 'bg-green-500/20 text-green-400' : level.toUpperCase() === 'HIGH' ? 'bg-red-500/20 text-red-400' : level.toUpperCase() === 'MEDIUM' ? 'bg-orange-500/20 text-orange-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
      {resolved ? 'RESOLVED' : level.toUpperCase()}
    </span>
    <p className={`text-[15px] leading-5 ${resolved ? 'text-[#76808d] line-through' : 'text-[#bcc2ca]'}`}>{text}</p>
  </div>
);

export default function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  const router = useRouter();

  const [lead, setLead] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs
  const [activeTab, setActiveTab] = useState('analysis');
  
  // Call Prep
  const [prep, setPrep] = useState<any>(null);
  const [preparing, setPreparing] = useState(false);
  const [calling, setCalling] = useState(false);
  
  // Debrief
  const [notes, setNotes] = useState('');
  const [submittingDebrief, setSubmittingDebrief] = useState(false);

  // Chat
  const [chat, setChat] = useState('');
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [matches, setMatches] = useState<any[] | null>(null);
  const [matching, setMatching] = useState(false);

  const [inventory, setInventory] = useState<any[]>([]);

  const fetchLead = async () => {
    try {
      const [res, invRes] = await Promise.all([
        fetch(`/api/leads/${id}`),
        fetch('/api/inventory')
      ]);
      
      if (invRes.ok) {
        const invData = await invRes.json();
        setInventory(invData.properties || []);
      }
      
      if (res.ok) {
        const data = await res.json();
        setLead(data);
        setMessages(data.chatHistory || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLead();
  }, [id]);

  const generatePrep = async () => { 
    if (prep) { setPrep(null); return; }
    setPreparing(true);
    try {
      const res = await fetch(`/api/leads/${id}/prep`);
      if (res.ok) {
        setPrep(await res.json());
      }
    } catch (e) {
      console.error(e);
    } finally {
      setPreparing(false);
    }
  };

  const handleDebriefSubmit = async () => {
    if (!notes.trim()) return;
    setSubmittingDebrief(true);
    try {
      const res = await fetch(`/api/leads/${id}/debrief`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callNotes: notes })
      });
      if (res.ok) {
        setNotes('');
        await fetchLead(); 
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingDebrief(false);
    }
  };

  const send = async (text = chat) => {
    if (!text.trim() || chatLoading) return;
    const question = text;
    setChat('');
    setMessages(prev => [...prev, { role: 'user', content: question }]);
    setChatLoading(true);

    try {
      const res = await fetch(`/api/leads/${id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatLoading(false);
    }
  };

  const generateMatches = async () => {
    setMatching(true);
    try {
      const res = await fetch(`/api/leads/${id}/matches`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setMatches(data.matches);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatching(false);
    }
  };

  const [showAIModal, setShowAIModal] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');

  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeReason, setCloseReason] = useState('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const handleStartCall = () => {
    setShowAIModal(true);
    setAiInstructions('');
  };

  const submitAIInstructions = async () => {
    if (aiInstructions && aiInstructions.trim()) {
      const notes = `Dispatched AI Agent to call customer. Remarks/Instructions: "${aiInstructions}"`;
      try {
        await fetch(`/api/leads/${id}/debrief`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ notes })
        });
        await fetchLead();
      } catch (e) {
        console.error(e);
      }
      setShowAIModal(false);
    }
  };

  const submitCloseRequest = async () => {
    if (closeReason && closeReason.trim()) {
      try {
        await fetch(`/api/leads/${id}/close`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reason: closeReason })
        });
        setShowCloseModal(false);
        setShowSuccessToast(true);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      } catch (e) {
        console.error(e);
        setShowCloseModal(false);
      }
    }
  };

  const submitApproveRequest = async () => {
    try {
      await fetch(`/api/leads/${id}/approve`, {
        method: 'POST',
      });
      setShowSuccessToast(true);
      setTimeout(() => {
        router.push('/');
      }, 2000);
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) return <main className="flex-1 overflow-auto px-5 py-10 text-center text-[#8c94a0]">Loading lead data...</main>;
  if (!lead) return <main className="flex-1 overflow-auto px-5 py-10 text-center text-[#8c94a0]">Lead not found.</main>;
  let displayMessage = lead.message;
  if (displayMessage?.startsWith('[GLOBAL_PROPERTY]')) {
    try {
      const g = JSON.parse(displayMessage.replace('[GLOBAL_PROPERTY]', ''));
      displayMessage = `Customer applied for property: ${g.property_name || g.name || 'Unknown Property'} from the inventory.`;
    } catch(e) {}
  }

  return (
    <main className="flex-1 overflow-auto px-5 pb-10 pt-6 lg:px-9">
      <div className="mx-auto max-w-[1420px]">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/">
              <button className="eyebrow mb-3 text-[#858e9b]">← LEAD DIRECTORY / {lead.name.toUpperCase()}</button>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl tracking-[-.04em] text-white">{lead.name}</h1>
              {lead.status === 'withdrawn' && (
                <span className="inline-flex items-center rounded bg-red-500/10 px-2 py-0.5 text-xs font-semibold text-red-400 border border-red-500/20">Withdrawn</span>
              )}
              {lead.status === 'approved' && (
                <span className="inline-flex items-center rounded bg-[#75c994]/10 px-2 py-0.5 text-xs font-semibold text-[#75c994] border border-[#75c994]/20">Deal Won / Approved</span>
              )}
              <span className={`priority ${priorityStyle(lead.priority.tier)}`}>
                {lead.priority.tier.toUpperCase()} <b>{lead.priority.score}</b>
              </span>
            </div>
            <p className="mt-1 text-[16px] text-[#8c94a0]">
              {lead.location} <span className="mx-1">•</span> {lead.budget} <span className="mx-1">•</span> {lead.requirement}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            {lead.status !== 'closed' && lead.status !== 'approved' && lead.status !== 'withdrawn' && (
              <>
                <button onClick={() => setShowCloseModal(true)} className="button-secondary whitespace-nowrap border border-red-500/20 text-red-400 hover:bg-red-500/10">
                  <Icon name="close" size={16}/> Close Request
                </button>
                <button onClick={submitApproveRequest} className="button-secondary whitespace-nowrap border border-[#75c994]/20 text-[#75c994] hover:bg-[#75c994]/10">
                  <Icon name="check" size={16}/> Approve Deal
                </button>
              </>
            )}
            <button onClick={handleStartCall} className="button-primary whitespace-nowrap">
              <Icon name="phone" size={16}/> Instruct AI Agent
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <section className="space-y-4">
            {lead.analysis.next_action && (
              <div className="next-action">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-[#e8a33b]/15 p-2 text-[#f3ba5d]"><Icon name="sparkle" size={17}/></span>
                  <div>
                    <p className="eyebrow text-[#f0ba62]">Recommended next action</p>
                    <h2>{lead.analysis.next_action}</h2>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mb-2 mt-2 flex gap-6 border-b border-white/[.05]">
              {['analysis', 'debrief'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`relative pb-3 text-[15px] font-semibold uppercase tracking-[0.1em] transition-colors ${
                    activeTab === tab ? 'text-[#f1bb63]' : 'text-[#7e8794] hover:text-[#bcc2ca]'
                  }`}
                >
                  {tab === 'analysis' && 'Lead Profile'}
                  {tab === 'debrief' && 'Internal Notes'}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#f1bb63] shadow-[0_0_8px_#f1bb6344]" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'analysis' && (
            <div className="panel p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="section-title"><h2>Lead Profile</h2></div>
                <span className="text-[14px] text-[#76808d]">Updated {new Date(lead.updatedAt).toLocaleTimeString()}</span>
              </div>
              
              <p className="mt-4 text-[16px] leading-6 text-[#bcc2ca]">{lead.analysis.summary}</p>
              
              <div className="mt-5 border-t border-white/[.07] pt-4">
                <p className="eyebrow">Key requirements</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lead.analysis.key_requirements.map((x: string) => <span className="tag" key={x}>{x}</span>)}
                </div>
              </div>
              
              {lead.analysis.objections && lead.analysis.objections.length > 0 && (
                <div className="mt-5 border-t border-white/[.07] pt-4">
                  <p className="eyebrow">Objections & concerns</p>
                  <div className="mt-3 space-y-2">
                    {lead.analysis.objections.map((obj: any, i: number) => (
                      <Concern key={i} level={obj.severity} text={obj.concern} resolved={obj.resolved} />
                    ))}
                  </div>
                </div>
              )}
              
              <div className="mt-5 border-t border-white/[.07] pt-4">
                <p className="eyebrow">Raw Customer Message</p>
                <p className="mt-2 text-[16px] leading-6 text-[#76808d] italic">"{displayMessage}"</p>
              </div>
            </div>
            )}
            


            {activeTab === 'debrief' && (
            <div className="panel p-5 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between">
                <div className="section-title"><h2>Internal Notes</h2></div>
              </div>
              
              <div className="mt-4">
                <textarea 
                  value={notes} 
                  onChange={e=>setNotes(e.target.value)} 
                  className="field mt-2 h-20 w-full resize-none p-3" 
                  placeholder="Capture rough notes. AI will update the lead's score, needs, and objections."
                  disabled={submittingDebrief}
                />
                <button onClick={handleDebriefSubmit} disabled={!notes || submittingDebrief} className="button-secondary mt-3 text-[14px]">
                  {submittingDebrief ? <><span className="button-spinner"/> Analysing...</> : <><Icon name="sparkle" size={14}/> Analyse debrief</>}
                </button>
              </div>
              
              {lead.debriefHistory && lead.debriefHistory.length > 0 && (
                <div className="mt-6 border-t border-white/[.07] pt-5">
                  <p className="eyebrow mb-4">Debrief history</p>
                  <div className="space-y-4">
                    {lead.debriefHistory.slice().reverse().map((dh: any, i: number) => (
                      <div className="timeline" key={i}>
                        <span/>
                        <p className="text-[#c4c9d0]">{dh.notes}</p>
                        <div className="mt-1 text-[12px] text-[#76808d]">
                          {new Date(dh.timestamp).toLocaleString()}
                        </div>
                        {dh.what_changed && dh.what_changed.length > 0 && (
                          <div className="mt-2 p-2.5 rounded bg-white/[.02] border border-white/[.05]">
                            <strong className="text-[12px] text-[#e8ad52]">Updates:</strong>
                            <ul className="pl-3 mt-1 space-y-0.5">
                              {dh.what_changed.map((change: string, idx: number) => (
                                <li key={idx} className="text-[12px] text-[#969fab]">{change}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            )}
          </section>
          
          <aside className="copilot">
            <div className="copilot-head">
              <div>
                <p className="eyebrow text-[#e9b65e]">Contextual intelligence</p>
                <h2><span className="ai-dot"/> Sales copilot</h2>
              </div>
            </div>
            
            <div className="copilot-context">
              <span>Context loaded</span>
              <p>Inquiry · analysis · debriefs</p>
            </div>
            
            <div className="chat-scroll">
              {messages.length === 0 && (
                <div className="text-center text-[#75808e] text-[14px] mt-10">
                  Hi, I'm your copilot. Ask me anything about {lead.name.split(' ')[0]}.
                </div>
              )}
              
              {messages.map((msg, i) => {
                const roleClass = msg.role === 'user' ? 'user' : 'ai';
                
                if (msg.role === 'assistant' && msg.content.includes('<draft>')) {
                  const parts = msg.content.split(/<\/?draft>/g);
                  return (
                    <div className={`message ai`} key={i}>
                      {parts[0] && <p className="mb-2">{parts[0]}</p>}
                      <div className="draft">
                        <div>
                          <span>DRAFT MESSAGE</span>
                          <button onClick={() => { 
                            navigator.clipboard?.writeText(parts[1]); 
                            setCopied(true); 
                            setTimeout(() => setCopied(false), 1600);
                          }}>
                            <Icon name="copy" size={14}/>{copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <p>{parts[1]}</p>
                      </div>
                      {parts[2] && <p className="mt-2">{parts[2]}</p>}
                    </div>
                  );
                }
                
                return (
                  <div className={`message ${roleClass}`} key={i}>{msg.content}</div>
                );
              })}
              
              {chatLoading && (
                <div className="message ai">
                  <span className="button-spinner !border-[#cbd1d8] !border-r-transparent inline-block mr-2" /> Thinking...
                </div>
              )}
            </div>
            
            <div className="px-4 pb-3">
              <div className="flex flex-wrap gap-1.5">
                {['Draft WhatsApp in English', 'Draft in Hindi', 'Draft in Marathi'].map(x => (
                  <button onClick={() => send(x)} className="quick" key={x}>{x}</button>
                ))}
              </div>
              <div className="chat-input">
                <input 
                  value={chat} 
                  onChange={e => setChat(e.target.value)} 
                  onKeyDown={e => e.key === 'Enter' && send()} 
                  placeholder={`Ask about ${lead.name.split(' ')[0]}...`}
                  disabled={chatLoading}
                />
                <button onClick={() => send()} disabled={chatLoading}><Icon name="send" size={16}/></button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showAIModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0d12]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0e1118] border border-white/10 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-white font-display">Instruct AI Agent</h3>
              <button onClick={() => setShowAIModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <p className="text-[#a8b0bb] text-sm mb-5">
              Provide instructions for the AI Agent to relay to the customer. For example, inform them about sold out properties or new recommendations.
            </p>
            
            <textarea
              className="field w-full h-32 p-4 mb-5 resize-none bg-black/20 text-white placeholder:text-[#59616d]"
              placeholder="e.g. 'The Oasis Sea View property you requested is sold out. I have emailed you some alternative 3BHKs in Bandra.'"
              value={aiInstructions}
              onChange={e => setAiInstructions(e.target.value)}
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowAIModal(false)}
                className="button-secondary px-5 py-2.5"
              >
                Cancel
              </button>
              <button 
                onClick={submitAIInstructions}
                className="button-primary px-5 py-2.5"
                disabled={!aiInstructions.trim()}
              >
                Dispatch AI Agent
              </button>
            </div>
          </div>
        </div>
      )}

      {showCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0d12]/80 backdrop-blur-sm p-4">
          <div className="bg-[#0e1118] border border-red-500/20 rounded-xl shadow-2xl p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl text-red-400 font-display">Close Request</h3>
              <button onClick={() => setShowCloseModal(false)} className="text-gray-400 hover:text-white transition-colors">
                <Icon name="close" size={20} />
              </button>
            </div>
            
            <p className="text-[#a8b0bb] text-sm mb-5">
              Are you sure you want to close this request? Please provide a reason to the customer.
            </p>
            
            <textarea
              className="field w-full h-32 p-4 mb-5 resize-none bg-black/20 text-white placeholder:text-[#59616d] border-red-500/10 focus:border-red-500/30"
              placeholder="e.g. 'Property is no longer available' or 'No response after 3 follow-ups.'"
              value={closeReason}
              onChange={e => setCloseReason(e.target.value)}
              autoFocus
            />
            
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowCloseModal(false)}
                className="button-secondary px-5 py-2.5"
              >
                Cancel
              </button>
              <button 
                onClick={submitCloseRequest}
                className="button-primary !bg-red-500/20 !text-red-400 !border-red-500/30 px-5 py-2.5 hover:!bg-red-500/30"
                disabled={!closeReason.trim()}
              >
                Confirm & Close Request
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-3 rounded-full border border-[#75c994]/20 bg-[#0e1118]/90 backdrop-blur-md px-6 py-3 shadow-[0_0_30px_rgba(117,201,148,0.15)]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#75c994]/20 text-[#75c994]">
              <Icon name="check" size={12} />
            </span>
            <p className="font-medium text-white">Request successfully closed</p>
          </div>
        </div>
      )}
    </main>
  );
}
