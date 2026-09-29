'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      if (data.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/customer');
      }
      router.refresh();
    } else {
      setError(data.error || 'Login failed');
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4">
      <div className="panel w-full max-w-md p-8 border border-white/10 rounded-xl bg-black/40 backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="brand justify-center mb-2 flex items-center gap-3 text-3xl font-cursive text-white">
            <span className="grid place-items-center w-8 h-8 border border-[#c79042] text-[#f4bd6a] text-lg font-serif italic rounded-sm">Æ</span> Arc
          </div>
          <p className="text-[#a8b0bb] mt-2">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Email Address</label>
            <input 
              type="email" 
              className="field w-full bg-black/20" 
              placeholder="name@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-semibold text-[#a8b0bb]">Password</label>
            <input 
              type="password" 
              className="field w-full bg-black/20" 
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="text-red-400 text-sm bg-red-400/10 p-2 rounded border border-red-400/20">{error}</p>}

          <button type="submit" className="button-primary w-full mt-2 py-3" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-[#7f8995]">
          Don't have an account? <Link href="/signup" className="text-[#e3a03b] hover:underline ml-1">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
