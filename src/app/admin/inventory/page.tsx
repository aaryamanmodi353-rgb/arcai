'use client';
import { useState, useEffect } from 'react';
import { Icon } from '@/components/Icon';

export default function InventoryManagement() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', location: '', price: '', bhk: '', description: '', images: '' });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    const res = await fetch('/api/inventory');
    const data = await res.json();
    if (data.properties) setProperties(data.properties);
    setLoading(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/cron/sync', { method: 'POST' });
      if (res.ok) {
        await fetchProperties();
      } else {
        alert("Failed to sync MLS data.");
      }
    } catch (e) {
      alert("Error syncing data.");
    }
    setIsSyncing(false);
  };

  const handleEdit = (prop: any) => {
    setEditingId(prop._id);
    setForm({
      name: prop.name,
      location: prop.location,
      price: prop.price,
      bhk: prop.bhk,
      description: prop.description,
      images: prop.images.join(', ')
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    await fetch(`/api/inventory/${deleteConfirmId}`, { method: 'DELETE' });
    setDeleteConfirmId(null);
    fetchProperties();
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      ...form,
      images: form.images.split(',').map(i => i.trim()).filter(i => i)
    };
    
    if (editingId === 'new') {
      await fetch('/api/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } else {
      await fetch(`/api/inventory/${editingId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    }
    setEditingId(null);
    fetchProperties();
  };

  if (loading) return <div className="p-12 text-[#a8b0bb]">Loading inventory...</div>;

  return (
    <main className="p-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <p className="eyebrow text-[#e9b65e] mb-1">Database</p>
          <h1 className="text-3xl font-display text-white">Inventory Management</h1>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={handleSync}
            disabled={isSyncing}
            className="flex items-center gap-2 rounded-lg bg-black/40 border border-[#e8a33b]/40 px-4 py-2 text-sm font-semibold text-[#f4bd6a] hover:bg-[#e8a33b]/10 hover:border-[#e8a33b] transition-all disabled:opacity-50"
          >
            <Icon name="sparkle" /> {isSyncing ? 'Scraping Market...' : 'Sync MLS'}
          </button>
          <button 
            onClick={() => {
              setEditingId('new');
              setForm({ name: '', location: '', price: '', bhk: '', description: '', images: '' });
            }}
            className="button-primary"
          >
            <Icon name="plus" /> Add Property
          </button>
        </div>
      </div>

      <div className="grid gap-6">
        {editingId === 'new' && (
          <div className="panel p-6 border border-[#e8a33b]/30">
            <h2 className="text-xl text-white mb-4">Add New Property</h2>
            <form onSubmit={handleSave} className="grid gap-4">
              <input className="field" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
              <div className="grid grid-cols-2 gap-4">
                <input className="field" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                <input className="field" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
              </div>
              <input className="field" placeholder="BHK / Layout" value={form.bhk} onChange={e => setForm({...form, bhk: e.target.value})} required />
              <textarea className="field h-24 p-3" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
              <input className="field" placeholder="Image URLs (comma separated)" value={form.images} onChange={e => setForm({...form, images: e.target.value})} required />
              <div className="flex gap-4 justify-end mt-2">
                <button type="button" onClick={() => setEditingId(null)} className="text-gray-400">Cancel</button>
                <button type="submit" className="button-primary">Save Property</button>
              </div>
            </form>
          </div>
        )}

        {properties.map(p => (
          editingId === p._id ? (
            <div key={p._id} className="panel p-6 border border-[#e8a33b]/30">
              <h2 className="text-xl text-white mb-4">Edit {p.name}</h2>
              <form onSubmit={handleSave} className="grid gap-4">
                <input className="field" placeholder="Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
                <div className="grid grid-cols-2 gap-4">
                  <input className="field" placeholder="Location" value={form.location} onChange={e => setForm({...form, location: e.target.value})} required />
                  <input className="field" placeholder="Price" value={form.price} onChange={e => setForm({...form, price: e.target.value})} required />
                </div>
                <input className="field" placeholder="BHK / Layout" value={form.bhk} onChange={e => setForm({...form, bhk: e.target.value})} required />
                <textarea className="field h-24 p-3" placeholder="Description" value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                <input className="field" placeholder="Image URLs (comma separated)" value={form.images} onChange={e => setForm({...form, images: e.target.value})} required />
                <div className="flex gap-4 justify-end mt-2">
                  <button type="button" onClick={() => setEditingId(null)} className="text-gray-400">Cancel</button>
                  <button type="submit" className="button-primary">Save Changes</button>
                </div>
              </form>
            </div>
          ) : (
            <div key={p._id} className="panel p-6 flex flex-col md:flex-row gap-6 items-start">
              <div className="w-48 h-32 rounded-lg overflow-hidden shrink-0">
                <img src={p.images?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl text-white font-serif">{p.name}</h3>
                <p className="text-[#a8b0bb] text-sm mt-1">{p.location} • {p.bhk} • {p.price}</p>
                <p className="text-[#7f8995] text-sm mt-3 line-clamp-2">{p.description}</p>
              </div>
              <div className="flex flex-col gap-2 shrink-0">
                <button onClick={() => handleEdit(p)} className="button-secondary text-sm">Edit</button>
                <button onClick={() => setDeleteConfirmId(p._id)} className="button-secondary text-sm !text-red-400 border-red-500/20">Delete</button>
              </div>
            </div>
          )
        ))}
      </div>

      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="panel max-w-sm w-full p-6 border border-red-500/30 bg-[#0a0d12]">
            <h3 className="text-xl font-display text-white mb-2">Delete Property?</h3>
            <p className="text-[#a8b0bb] text-sm mb-6">Are you absolutely sure you want to delete this property? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="button-secondary px-4 py-2 text-sm">Cancel</button>
              <button onClick={confirmDelete} className="bg-red-500/10 border border-red-500/40 text-red-400 hover:bg-red-500 hover:text-white transition-colors rounded px-4 py-2 text-sm font-semibold">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
