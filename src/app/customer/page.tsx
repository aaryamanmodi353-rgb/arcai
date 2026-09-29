'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
function ImageGallery({ images, name, compact = false }: { images: string[], name: string, compact?: boolean }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!images || images.length === 0) return null;
  
  return (
    <div className={`flex flex-col gap-2 ${compact ? 'w-full md:w-64 shrink-0' : 'w-full mb-6'}`}>
      <div className={`w-full rounded-lg overflow-hidden border border-white/10 ${compact ? 'h-48' : 'h-48 md:h-64'}`}>
        <img src={images[activeIdx]} alt={name} className="w-full h-full object-cover transition-opacity duration-300" />
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {images.map((img, idx) => (
          <button 
            key={idx} 
            onClick={() => setActiveIdx(idx)}
            className={`h-12 flex-1 rounded-md overflow-hidden border-2 transition-all shrink-0 ${activeIdx === idx ? 'border-[#f1ba61]' : 'border-transparent opacity-50 hover:opacity-100'}`}
          >
            <img src={img} alt={`${name} ${idx}`} className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'explore' | 'applied' | 'matches' | 'list'>('explore');
  const [applying, setApplying] = useState<string | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);
  const [showUrgentModal, setShowUrgentModal] = useState<string | null>(null);
  
  // Listing Property State
  const [listForm, setListForm] = useState({
    propertyName: '',
    location: '',
    configuration: '',
    expectedPrice: '',
    additionalDetails: ''
  });
  const [isListing, setIsListing] = useState(false);
  
  const [applications, setApplications] = useState<any[]>([]);
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null);

  // AI Matchmaker state
  const [matchForm, setMatchForm] = useState({
    location: '',
    configuration: '',
    budget: '',
    additionalDetails: ''
  });
  const [isMatching, setIsMatching] = useState(false);
  const [matches, setMatches] = useState<any>(null);

  // Copilot state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Inventory State
  const [inventory, setInventory] = useState<any[]>([]);
  const prevApps = useRef<any[]>([]);

  useEffect(() => {
    fetchApplications();
    fetchInventory();
    const interval = setInterval(fetchApplications, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchInventory = async () => {
    const res = await fetch('/api/inventory');
    if (res.ok) {
      const data = await res.json();
      setInventory(data.properties || []);
    }
  };

  const fetchApplications = async () => {
    const res = await fetch('/api/customer/applications');
    if (res.ok) {
      const data = await res.json();
      const newApps = data.leads;
      
      // Compare and notify if a request was newly closed or approved
      const oldClosed = new Set(prevApps.current.filter((a: any) => a.status === 'closed').map((a: any) => a._id));
      const oldApproved = new Set(prevApps.current.filter((a: any) => a.status === 'approved').map((a: any) => a._id));
      
      newApps.forEach((app: any) => {
        if (app.status === 'closed' && !oldClosed.has(app._id) && prevApps.current.length > 0) {
           showToast(`Admin updated your request: ${app.closeReason || 'Closed'}`, 'error');
           setActiveTab('applied');
        } else if (app.status === 'approved' && !oldApproved.has(app._id) && prevApps.current.length > 0) {
           showToast(`Congratulations! Your deal for ${app.requirement.replace('Buying: ', '')} has been Approved!`, 'success');
           setActiveTab('applied');
        }
      });
      
      prevApps.current = newApps;
      setApplications(newApps);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleApply = async (property: any) => {
    const pId = property.id || property.property_id;
    const pName = property.name || property.property_name;
    setApplying(pId);
    
    const res = await fetch('/api/customer/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        propertyId: pId, 
        propertyName: pName, 
        type: 'buy',
        fullDetails: {
          ...property,
          name: pName,
          id: pId
        }
      })
    });
    setApplying(null);
    if (res.ok) {
      showToast(`Successfully applied for ${pName}!`);
      fetchApplications();
    } else {
      showToast('Failed to submit application. Please try again.', 'error');
    }
  };

  const handleRemove = async (leadId: string) => {
    setRemoving(leadId);
    const res = await fetch(`/api/customer/apply?id=${leadId}`, { method: 'DELETE' });
    setRemoving(null);
    if (res.ok) {
      showToast('Application withdrawn successfully.');
      fetchApplications();
    } else {
      showToast('Failed to withdraw application.', 'error');
    }
  };

  const handleUrgentConfirm = async () => {
    if (showUrgentModal) {
      try {
        await fetch('/api/customer/urgent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId: showUrgentModal })
        });
        setShowUrgentModal(null);
        showToast('Urgent request sent. An admin will contact you shortly.', 'success');
        fetchApplications();
      } catch (e) {
        console.error(e);
        showToast('Failed to send urgent request.', 'error');
      }
    }
  };

  const handleListProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsListing(true);
    
    const formattedDescription = `
Property Name: ${listForm.propertyName}
Location: ${listForm.location}
Configuration: ${listForm.configuration}
Expected Price: ${listForm.expectedPrice}
Details: ${listForm.additionalDetails}
    `.trim();

    const res = await fetch('/api/customer/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'sell', description: formattedDescription })
    });
    setIsListing(false);
    if (res.ok) {
      setListForm({
        propertyName: '',
        location: '',
        configuration: '',
        expectedPrice: '',
        additionalDetails: ''
      });
      showToast('Your property details have been submitted! Our team will contact you to list it.');
      fetchApplications();
      setActiveTab('applied'); // Redirect to applications to show their new listing lead
    } else {
      showToast('Failed to submit property details. Please try again.', 'error');
    }
  };

  const handleFindMatches = async () => {
    const query = `
Location: ${matchForm.location}
Configuration: ${matchForm.configuration}
Budget: ${matchForm.budget}
Details: ${matchForm.additionalDetails}
    `.trim();

    // Check if empty
    if (!matchForm.location && !matchForm.configuration && !matchForm.budget && !matchForm.additionalDetails) return;

    setIsMatching(true);
    const res = await fetch('/api/customer/matches', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });
    const data = await res.json();
    setIsMatching(false);
    if (res.ok) {
      setMatches(data);
    } else {
      showToast('Failed to find matches.', 'error');
    }
  };

  const appliedPropertyNames = applications
    .filter(lead => lead.requirement.startsWith('Buying: '))
    .map(lead => lead.requirement.replace('Buying: ', ''));

  const availableInventory = inventory.filter(prop => !appliedPropertyNames.includes(prop.name));
  const listedPropertiesCount = applications.filter(lead => lead.requirement === 'Selling Property').length;
  const appliedBuyingLeads = applications.filter(lead => lead.requirement.startsWith('Buying: ') && lead.status !== 'withdrawn');

  return (
    <div className="flex min-h-screen w-full relative">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5 ${
          toast.type === 'success' ? 'bg-[#75c994]/20 border-[#75c994]/30 text-[#dcf4e6]' : 'bg-red-500/20 border-red-500/30 text-red-200'
        }`}>
          <Icon name={toast.type === 'success' ? 'sparkle' : 'close'} size={20} />
          <p className="font-medium text-sm">{toast.message}</p>
        </div>
      )}

      <aside className="sidebar h-screen sticky top-0 border-r border-white/10 w-[260px] p-6 flex flex-col bg-[#0a0d12]/80 backdrop-blur-xl">
        <div className="brand flex items-center gap-3 text-3xl font-cursive text-white mb-12">
          <span className="grid place-items-center w-8 h-8 border border-[#c79042] text-[#f4bd6a] text-lg font-serif italic rounded-sm">Æ</span> Arc
        </div>
        <nav className="flex flex-col gap-2">
          <button 
            className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all text-left ${activeTab === 'explore' ? 'bg-[#e8a33b]/10 text-[#f1ba61] border border-[#e8a33b]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            onClick={() => setActiveTab('explore')}
          >
            <Icon name="dashboard" size={20} /> <span className="text-lg font-cursive whitespace-nowrap">Explore Inventory</span>
          </button>
          <button 
            className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all text-left ${activeTab === 'applied' ? 'bg-[#e8a33b]/10 text-[#f1ba61] border border-[#e8a33b]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            onClick={() => setActiveTab('applied')}
          >
            <Icon name="check" size={20} /> 
            <span className="text-lg font-cursive flex-1 whitespace-nowrap">Applications</span>
            {appliedBuyingLeads.length > 0 && (
              <span className="bg-[#e8a33b] text-black text-xs font-bold px-2 py-0.5 rounded-full">{appliedBuyingLeads.length}</span>
            )}
          </button>
          <button 
            className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all text-left ${activeTab === 'list' ? 'bg-[#e8a33b]/10 text-[#f1ba61] border border-[#e8a33b]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            onClick={() => setActiveTab('list')}
          >
            <Icon name="plus" size={20} /> <span className="text-lg font-cursive whitespace-nowrap">List Property</span>
          </button>
          <button 
            className={`flex items-center gap-3 w-full p-3 rounded-lg font-medium transition-all text-left ${activeTab === 'matches' ? 'bg-[#e8a33b]/10 text-[#f1ba61] border border-[#e8a33b]/20' : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'}`}
            onClick={() => setActiveTab('matches')}
          >
            <Icon name="sparkle" size={20} /> <span className="text-lg font-cursive whitespace-nowrap">AI Matchmaker</span>
          </button>
        </nav>
        <div className="mt-auto pt-4 border-t border-white/10">
          <button onClick={handleLogout} className="flex items-center gap-3 text-[#e3a03b] hover:text-[#f4ba6e] transition-colors w-full p-2 font-medium">
            <Icon name="close" size={18} /> Logout
          </button>
        </div>
      </aside>

      <main className="content flex-1 p-12 overflow-y-auto">
        <header className="mb-12">
          <p className="eyebrow mb-2 text-[#e3a03b] tracking-widest text-sm uppercase">Customer Portal</p>
          <h1 className="text-4xl font-display text-white">
            {activeTab === 'explore' && 'Find Your Next Home'}
            {activeTab === 'applied' && 'Your Applications'}
            {activeTab === 'list' && 'List Your Property'}
            {activeTab === 'matches' && 'AI Property Matchmaker'}
          </h1>
        </header>

        {activeTab === 'explore' && (
          <>
            <section>
              <h2 className="text-2xl font-oswald text-white uppercase tracking-wider mb-6">Available Inventory</h2>
              <div className="grid gap-6 lg:grid-cols-2">
                {availableInventory.map((property, idx) => (
                  <div key={property._id || property.id || idx} className="panel p-6 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex flex-col">
                    {property.images && (
                      <ImageGallery images={property.images} name={property.name} />
                    )}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl text-white font-serif">{property.name}</h3>
                        <p className="text-[#a8b0bb]">{property.location} • {property.bhk}</p>
                      </div>
                      <span className="text-[#f1ba61] font-oswald text-xl tracking-wider">{property.price}</span>
                    </div>
                    
                    <p className="text-[#7f8995] text-sm mb-6 flex-1">{property.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {property.features.map((f: string) => (
                        <span key={f} className="text-xs text-[#a8b0bb] bg-black/30 px-2 py-1 rounded border border-white/5">
                          {f}
                        </span>
                      ))}
                    </div>

                    <button 
                      onClick={() => handleApply(property)}
                      disabled={applying === (property._id || property.id)}
                      className="button-secondary w-full border border-[#e8a33b]/30 text-[#e8a33b] hover:bg-[#e8a33b]/10"
                    >
                      {applying === property.id ? 'Applying...' : 'Apply for Property'}
                    </button>
                  </div>
                ))}
                
                {availableInventory.length === 0 && (
                  <div className="col-span-2 panel p-12 text-center text-[#7f8995] border-dashed border-2 border-white/10 rounded-2xl bg-white/5">
                    <p>You have applied for all available properties!</p>
                  </div>
                )}
              </div>
            </section>
          </>
        )}

        {activeTab === 'applied' && (
          <section>
            {appliedBuyingLeads.length === 0 ? (
              <div className="panel p-16 text-center text-[#7f8995] border-dashed border-2 border-white/10 rounded-2xl bg-white/5">
                <div className="p-4 bg-[#75c994]/10 rounded-full mb-6 text-[#75c994] mx-auto w-max">
                  <Icon name="check" size={32} />
                </div>
                <h3 className="text-2xl text-white font-medium mb-2">No Applications Yet</h3>
                <p className="text-base">Head over to the Explore tab to find properties you love.</p>
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {appliedBuyingLeads.map(lead => {
                  let propName = lead.requirement.replace('Buying: ', '');
                  let propDetails = inventory.find(p => p.name === propName);
                  let isGlobal = false;
                  
                  if (lead.message && lead.message.startsWith('[GLOBAL_PROPERTY]')) {
                    const isFromInventory = inventory.some(p => p.name === propName);
                    if (!isFromInventory) isGlobal = true;
                    try {
                      const g = JSON.parse(lead.message.replace('[GLOBAL_PROPERTY]', ''));
                      propName = g.property_name || propName;
                      propDetails = {
                        id: g.property_id || g.id,
                        name: g.property_name || g.name,
                        location: g.location,
                        bhk: g.bhk,
                        price: g.price,
                        description: g.sales_pitch || g.description,
                        images: g.images,
                        features: []
                      } as any;
                    } catch(e) {}
                  }
                  
                  return (
                    <div key={lead._id} className="panel p-6 border border-[#75c994]/20 rounded-xl bg-[#75c994]/5 flex flex-col">
                      {propDetails?.images && (
                        <ImageGallery images={propDetails.images} name={propName} />
                      )}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl text-white font-serif">{propName}</h3>
                          <p className="text-[#a8b0bb]">{propDetails?.location || 'Location Pending'} • {propDetails?.bhk || 'TBD'}</p>
                        </div>
                        {lead.status === 'closed' ? (
                          <span className="text-red-400 font-oswald text-sm tracking-wider px-3 py-1 bg-red-500/10 rounded border border-red-500/20">Closed</span>
                        ) : lead.status === 'withdrawn' ? (
                          <span className="text-[#8c94a0] font-oswald text-sm tracking-wider px-3 py-1 bg-[#8c94a0]/10 rounded border border-[#8c94a0]/20">Withdrawn</span>
                        ) : lead.status === 'approved' ? (
                          <span className="text-[#75c994] font-oswald text-sm tracking-wider px-3 py-1 bg-[#75c994]/10 rounded border border-[#75c994]/20">Deal Approved</span>
                        ) : (
                          <span className="text-[#e8a33b] font-oswald text-sm tracking-wider px-3 py-1 bg-[#e8a33b]/10 rounded border border-[#e8a33b]/20">Under Review</span>
                        )}
                      </div>
                      
                      {isGlobal && (
                        <div className="mb-4 inline-block px-2 py-1 bg-[#3b82f6]/20 text-[#3b82f6] text-xs font-bold rounded border border-[#3b82f6]/30">
                          Global AI Match
                        </div>
                      )}
                      
                      <p className="text-[#7f8995] text-sm flex-1 mb-6">{propDetails?.description || 'Application submitted successfully.'}</p>
                      
                      <div className="mb-6 p-4 rounded-xl bg-black/30 border border-white/5">
                        <h4 className="text-sm font-medium text-white mb-4 flex items-center gap-2">
                          <Icon name="sparkles" size={14} /> Updates & Status
                        </h4>
                        
                        <div className="flex flex-col gap-4 relative before:absolute before:inset-y-1.5 before:left-[7px] before:w-px before:bg-white/10">
                          <div className="flex gap-3 items-start relative">
                            <span className="w-3.5 h-3.5 mt-1 rounded-full bg-[#75c994] border-2 border-[#161b22] shrink-0 z-10"></span>
                            <div className="flex flex-col">
                              <span className="text-[10px] uppercase tracking-wider text-[#a8b0bb]">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'Recently'}</span>
                              <p className="text-sm text-white/80 mt-0.5">Application submitted and under review.</p>
                            </div>
                          </div>

                          {lead.priority?.tier === 'hot' && (
                            <div className="flex gap-3 items-start relative">
                              <span className="w-3.5 h-3.5 mt-1 rounded-full bg-[#f1ba61] border-2 border-[#161b22] shrink-0 z-10"></span>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-[#f1ba61]">Priority Elevated</span>
                                <p className="text-sm text-white/80 mt-0.5">Urgent attention requested. Admin has been notified.</p>
                              </div>
                            </div>
                          )}

                          {lead.status === 'closed' && (
                            <div className="flex gap-3 items-start relative">
                              <span className="w-3.5 h-3.5 mt-1 rounded-full bg-red-400 border-2 border-[#161b22] shrink-0 z-10"></span>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-red-400">Request Closed</span>
                                <p className="text-sm text-red-200 mt-0.5">{lead.closeReason || 'Closed by Admin'}</p>
                              </div>
                            </div>
                          )}

                          {lead.status === 'withdrawn' && (
                            <div className="flex gap-3 items-start relative">
                              <span className="w-3.5 h-3.5 mt-1 rounded-full bg-[#8c94a0] border-2 border-[#161b22] shrink-0 z-10"></span>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-[#8c94a0]">Application Withdrawn</span>
                                <p className="text-sm text-[#8c94a0] mt-0.5">You have successfully withdrawn this application.</p>
                              </div>
                            </div>
                          )}

                          {lead.status === 'approved' && (
                            <div className="flex gap-3 items-start relative">
                              <span className="w-3.5 h-3.5 mt-1 rounded-full bg-[#75c994] border-2 border-[#161b22] shadow-[0_0_10px_#75c994] shrink-0 z-10"></span>
                              <div className="flex flex-col">
                                <span className="text-[10px] uppercase tracking-wider text-[#75c994] font-bold">Deal Made / Approved</span>
                                <p className="text-sm text-white/90 mt-0.5 font-medium">Congratulations! The admin has approved your deal for this property.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-3">
                        {lead.status !== 'closed' && lead.status !== 'withdrawn' && lead.status !== 'approved' && (
                          <>
                            <button 
                              onClick={() => setShowUrgentModal(lead._id)}
                              className="button-primary flex-1"
                            >
                              <Icon name="sparkle" size={16} /> Urgent Attention
                            </button>
                            <button 
                              onClick={() => handleRemove(lead._id)}
                              disabled={removing === lead._id}
                              className="button-secondary flex-1 border border-red-500/30 text-red-400 hover:bg-red-500/10"
                            >
                              {removing === lead._id ? 'Withdrawing...' : 'Withdraw'}
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {activeTab === 'list' && (
          <section className="max-w-2xl mx-auto mt-8">
            <div className="panel p-8 border border-white/10 rounded-xl bg-white/5">
              <h2 className="text-xl text-white font-serif mb-2 text-center">Sell with Arc</h2>
              <p className="text-[#7f8995] text-sm mb-8 text-center">Provide the details of the property you wish to list on our premium network. One of our advisory partners will reach out to schedule an appraisal.</p>
              
              <form onSubmit={handleListProperty} className="flex flex-col gap-5">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Property Name / Building</label>
                  <input 
                    type="text" 
                    className="field w-full bg-black/20" 
                    placeholder="e.g. Oasis Sea View Apartments"
                    value={listForm.propertyName}
                    onChange={e => setListForm({...listForm, propertyName: e.target.value})}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Location</label>
                    <input 
                      type="text" 
                      className="field w-full bg-black/20" 
                      placeholder="e.g. Bandra West, Mumbai"
                      value={listForm.location}
                      onChange={e => setListForm({...listForm, location: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Configuration</label>
                    <input 
                      type="text" 
                      className="field w-full bg-black/20" 
                      placeholder="e.g. 3 BHK"
                      value={listForm.configuration}
                      onChange={e => setListForm({...listForm, configuration: e.target.value})}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Expected Price</label>
                  <input 
                    type="text" 
                    className="field w-full bg-black/20" 
                    placeholder="e.g. ₹ 4.5 Cr"
                    value={listForm.expectedPrice}
                    onChange={e => setListForm({...listForm, expectedPrice: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Additional Details</label>
                  <textarea
                    className="field w-full bg-black/20 h-32 resize-none p-4"
                    placeholder="Highlight key features like sea-facing, high floor, amenities..."
                    value={listForm.additionalDetails}
                    onChange={e => setListForm({...listForm, additionalDetails: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  type="submit" 
                  className="button-primary w-full py-4 mt-2"
                  disabled={isListing}
                >
                  {isListing ? 'Submitting...' : 'Submit Listing Request'}
                </button>
              </form>
            </div>
          </section>
        )}

        {activeTab === 'matches' && (
          <>
            <section className="max-w-2xl mx-auto mt-8">
            <div className="panel p-8 border border-[#3b82f6]/20 rounded-xl bg-[#3b82f6]/5 mb-8">
              <h2 className="text-xl text-white font-serif mb-2 text-center">What are you looking for?</h2>
              <p className="text-[#7f8995] text-sm mb-8 text-center">Describe your dream home, budget, and preferred locations, and our AI will find the best matches from our premium inventory.</p>
              
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Preferred Location</label>
                    <input 
                      type="text" 
                      className="field w-full bg-black/20" 
                      placeholder="e.g. Bandra West, Mumbai"
                      value={matchForm.location}
                      onChange={e => setMatchForm({...matchForm, location: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Configuration</label>
                    <input 
                      type="text" 
                      className="field w-full bg-black/20" 
                      placeholder="e.g. 3 BHK"
                      value={matchForm.configuration}
                      onChange={e => setMatchForm({...matchForm, configuration: e.target.value})}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Maximum Budget</label>
                  <input 
                    type="text" 
                    className="field w-full bg-black/20" 
                    placeholder="e.g. ₹ 5 Cr"
                    value={matchForm.budget}
                    onChange={e => setMatchForm({...matchForm, budget: e.target.value})}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Additional Preferences</label>
                  <textarea
                    className="field w-full bg-black/20 h-24 resize-none p-4"
                    placeholder="E.g. I want a sea view, high floor, and premium amenities..."
                    value={matchForm.additionalDetails}
                    onChange={e => setMatchForm({...matchForm, additionalDetails: e.target.value})}
                  ></textarea>
                </div>

                <button 
                  onClick={handleFindMatches}
                  disabled={isMatching || (!matchForm.location && !matchForm.configuration && !matchForm.budget && !matchForm.additionalDetails)}
                  className="button-primary bg-[#3b82f6] hover:bg-[#2563eb] border-transparent text-white w-full py-4 mt-2"
                >
                  {isMatching ? 'Searching...' : 'Find Matches'}
                </button>
              </div>
            </div>
          </section>

          {matches && (
            <section className="mt-8 w-full">
              <div className="mb-6">
                <div className="flex justify-between items-end mb-4">
                  <h3 className="text-xl text-white font-oswald tracking-wide uppercase">Top Recommended Matches</h3>
                  <div className="text-sm text-[#7f8995]">
                    Analyzed by <strong className="text-white">Arc AI</strong>
                  </div>
                </div>

                <div className="grid gap-6 2xl:grid-cols-2">
                  {matches.matches.map((m: any) => {
                    // Fallback to local inventory if generated data is missing some fields
                    const localProperty = inventory.find(p => p.id === m.property_id);
                    const images = m.images || localProperty?.images;
                    const name = m.property_name || localProperty?.name;
                    const location = m.location || localProperty?.location;
                    const bhk = m.bhk || localProperty?.bhk;
                    const price = m.price || localProperty?.price;

                    return (
                      <div key={m.property_id} className="panel p-6 bg-white/5 border border-white/10 rounded-xl flex flex-col xl:flex-row gap-6 items-start">
                        {images && (
                          <ImageGallery images={images} name={name} compact={true} />
                        )}
                        <div className="flex-1 flex flex-col w-full">
                          <div className="flex justify-between items-start mb-2 gap-4">
                            <h4 className="text-xl text-white font-serif leading-tight">{name}</h4>
                          <div className={`px-3 py-1 rounded border text-sm font-bold ${
                            m.match_score >= 80 ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                            m.match_score >= 60 ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' :
                            'bg-red-500/20 text-red-400 border-red-500/30'
                          }`}>
                            {m.match_score}% Match
                          </div>
                        </div>
                        <p className="text-[#a8b0bb] text-sm mb-4">{location} • {bhk} • {price}</p>
                        <p className="text-[#f1ba61] font-medium text-sm mb-4 italic">"{m.sales_pitch}"</p>
                        
                        <div className="space-y-2 text-sm">
                          <div className="flex gap-2">
                            <Icon name="check" size={16} className="text-green-400 shrink-0" />
                            <span className="text-gray-300"><strong>Pros:</strong> {m.pros.join(', ')}</span>
                          </div>
                          {m.cons.length > 0 && (
                            <div className="flex gap-2">
                              <Icon name="close" size={16} className="text-red-400 shrink-0" />
                              <span className="text-gray-300"><strong>Cons:</strong> {m.cons.join(', ')}</span>
                            </div>
                          )}
                        </div>
                        
                        <button 
                          onClick={() => handleApply(m)}
                          disabled={applying === m.property_id}
                          className="button-secondary w-full border border-[#e8a33b]/30 text-[#e8a33b] hover:bg-[#e8a33b]/10 mt-6"
                        >
                          {applying === m.property_id ? 'Applying...' : 'Apply for Property'}
                        </button>
                      </div>
                    </div>
                  );
                })}
                </div>
              </div>
            </section>
          )}
          </>
        )}
      </main>

      {/* ARC Concierge Copilot */}
      <aside 
        className="copilot hidden lg:flex flex-col sticky top-0 h-screen w-[380px] shrink-0 border-l border-white/10 bg-[#0a0d12]/80 backdrop-blur-xl"
        style={{ borderTop: 0, borderBottom: 0, borderRight: 0, borderRadius: 0, minHeight: '100vh' }}
      >
        <div className="copilot-head">
          <div>
            <p className="eyebrow text-[#e9b65e]">Personal Assistant</p>
            <h2><span className="ai-dot"/> ARC Copilot</h2>
          </div>
        </div>
        
        <div className="copilot-context">
          <span>Online</span>
          <p>Property finding & inquiries</p>
        </div>
        
        <div className="chat-scroll flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {chatMessages.length === 0 && (
            <div className="text-center text-[#75808e] text-[14px] mt-10">
              Hello! I am your AI Concierge. How can I assist you with your luxury property search today?
            </div>
          )}
          
          {chatMessages.map((msg, i) => (
            <div key={i} className={`message ${msg.role === 'user' ? 'user' : 'ai'}`}>
              {msg.content}
            </div>
          ))}
          {isTyping && (
             <div className="message ai flex gap-1 items-center h-8">
               <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></span>
               <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{animationDelay: "150ms"}}></span>
               <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" style={{animationDelay: "300ms"}}></span>
             </div>
          )}
        </div>
        
        <div className="p-4 border-t border-white/10">
          <form 
            onSubmit={async (e) => {
              e.preventDefault();
              if (!chatInput.trim() || isTyping) return;
              
              const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
              setChatMessages(newMessages);
              setChatInput('');
              setIsTyping(true);
              
              try {
                const res = await fetch('/api/customer/chat', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ messages: newMessages })
                });
                const data = await res.json();
                if (data.reply) {
                  setChatMessages([...newMessages, { role: 'assistant', content: data.reply }]);
                }
              } catch(err) {
                console.error(err);
              } finally {
                setIsTyping(false);
              }
            }} 
            className="chat-input"
          >
            <input 
              type="text" 
              placeholder="Ask me anything..." 
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
            />
            <button type="submit" disabled={isTyping}>
              {isTyping ? <div className="button-spinner"/> : <Icon name="send" size={16} />}
            </button>
          </form>
        </div>
      </aside>
    </div>
  );
}
