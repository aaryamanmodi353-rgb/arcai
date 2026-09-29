'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/components/Icon';
import Link from 'next/link';

export default function NewLead() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    requirement: '',
    budget: '',
    message: ''
  });
  
  const timelines = ['Immediately', '1–3 months', '3–6 months', '6+ months'];
  const [timelineIndex, setTimelineIndex] = useState(1);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          timeline: timelines[timelineIndex]
        })
      });

      if (res.ok) {
        const lead = await res.json();
        router.push(`/admin/leads/${lead._id}`);
      } else {
        const errorData = await res.json();
        alert(`Error: ${errorData.error}`);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      alert('Failed to submit lead.');
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 overflow-auto px-5 pb-10 pt-6 lg:px-9">
      <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
        <div className="mb-8">
          <Link href="/">
            <button type="button" className="eyebrow mb-4 text-[#858e9b]">← LEAD DIRECTORY</button>
          </Link>
          <h1 className="font-display text-3xl tracking-[-.04em] text-white">Create a new conversation</h1>
          <p className="mt-2 text-sm text-[#8c94a0]">Capture the signal; the system will make sense of the noise.</p>
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_.72fr]">
          <section className="panel p-6">
            <div className="section-title">
              <span>01</span><h2>Known details</h2>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label>Full name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="field mt-2 w-full" placeholder="e.g. Rhea Kapoor"/>
              </div>
              <div>
                <label>Preferred location</label>
                <input required name="location" value={formData.location} onChange={handleChange} className="field mt-2 w-full" placeholder="e.g. Bandra West"/>
              </div>
              <div>
                <label>Requirement</label>
                <input required name="requirement" value={formData.requirement} onChange={handleChange} className="field mt-2 w-full" placeholder="e.g. 3 BHK"/>
              </div>
              <div>
                <label>Budget</label>
                <input required name="budget" value={formData.budget} onChange={handleChange} className="field mt-2 w-full" placeholder="e.g. ₹ 3.5 Cr"/>
              </div>
              <div className="sm:col-span-2">
                <label>Buying timeline</label>
                <div className="mt-2 flex gap-2">
                  {timelines.map((x, i) => (
                    <button 
                      type="button" 
                      onClick={() => setTimelineIndex(i)} 
                      key={x} 
                      className={`choice ${timelineIndex === i ? 'choice-active' : ''}`}
                    >
                      {x}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="panel relative overflow-hidden p-6">
            <div className="absolute -right-8 -top-8 h-28 w-28 rounded-full bg-[#e8a33b]/10 blur-2xl"/>
            <div className="section-title">
              <span>02</span><h2>Raw customer inquiry</h2>
            </div>
            <p className="mt-3 text-sm leading-5 text-[#89929f]">Paste the original message, notes, or WhatsApp thread. AI will extract what matters.</p>
            <textarea 
              required
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="field mt-5 h-48 w-full resize-none p-3" 
              placeholder="Hi, I saw the listing in Bandra. We are a family of four moving from Singapore around October..."
            />
            <div className="mt-3 flex items-center gap-2 text-xs text-[#73808f]">
              <Icon name="sparkle" size={15}/><span>AI will structure this after creation</span>
            </div>
          </section>
        </div>

        <div className="mt-5 flex justify-end gap-3">
          <Link href="/">
            <button type="button" className="button-secondary">Cancel</button>
          </Link>
          <button type="submit" disabled={loading} className="button-primary">
            {loading ? <><span className="button-spinner"/> Creating lead…</> : <><Icon name="sparkle" size={16}/> Create & analyse</>}
          </button>
        </div>
      </form>
    </main>
  );
}
