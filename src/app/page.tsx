import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';

export default async function LandingPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  
  let isLoggedIn = false;
  let userRole = '';

  if (token) {
    try {
      const verified = await verifyAuth(token) as any;
      if (verified) {
        isLoggedIn = true;
        userRole = verified.role;
      }
    } catch (e) {
      // Token invalid
    }
  }

  const dashboardLink = userRole === 'admin' ? '/admin' : '/customer';

  return (
    <div className="min-h-screen bg-transparent text-white selection:bg-[#f3bd65]/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-[#0d1017]/80 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#e8a33b]/30 bg-[#e8a33b]/10 text-[#e8a33b] font-serif italic text-lg">
            Æ
          </div>
          <span className="font-serif text-2xl tracking-wide italic">Arc</span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link href={dashboardLink} className="button-primary px-6 py-2">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold tracking-wider text-[#8c94a0] hover:text-white transition-colors">
                LOGIN
              </Link>
              <Link href="/signup" className="button-primary px-6 py-2">
                GET STARTED
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex flex-col items-center justify-center min-h-screen px-5 text-center overflow-hidden pt-20">
        
        {/* Background Gradients */}
        <div className="absolute top-[20%] left-[20%] w-96 h-96 bg-[#f3bd65]/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[10%] right-[10%] w-[30rem] h-[30rem] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none"></div>

        <p className="eyebrow mb-6 text-[#f3bd65] tracking-[0.3em]">THE FUTURE OF REAL ESTATE</p>
        <h1 className="font-display text-5xl md:text-7xl lg:text-8xl tracking-tight leading-[1.1] mb-8 max-w-5xl">
          An AI-Powered Deal Room <br />
          <span className="text-[#8c94a0]">for Premium Real Estate</span>
        </h1>
        <p className="text-lg md:text-xl text-[#8c94a0] max-w-2xl mb-12 leading-relaxed">
          Arc bridges the gap between high-net-worth buyers and luxury brokers. 
          Experience dynamic matching, real-time momentum tracking, and autonomous AI-driven workflows.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 relative z-10">
          <Link href={isLoggedIn ? dashboardLink : "/login"} className="px-8 py-4 bg-[#f3bd65] text-[#1a1307] font-semibold tracking-wide rounded hover:bg-[#e8a33b] transition-all shadow-[0_0_20px_rgba(243,189,101,0.3)]">
            {isLoggedIn ? 'ENTER DEAL ROOM' : 'ACCESS DASHBOARD'}
          </Link>
          {!isLoggedIn && (
            <Link href="/signup" className="px-8 py-4 bg-white/5 border border-white/10 text-white font-semibold tracking-wide rounded hover:bg-white/10 transition-all backdrop-blur-sm">
              CREATE ACCOUNT
            </Link>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mt-32 px-5 pb-20 w-full text-left relative z-10">
          <div className="p-8 rounded-xl bg-[#11151c]/60 border border-white/5 backdrop-blur-sm hover:border-[#f3bd65]/30 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-[#f3bd65]/10 flex items-center justify-center mb-6 border border-[#f3bd65]/20">
              <span className="text-[#f3bd65] text-2xl font-serif">A</span>
            </div>
            <h3 className="text-xl font-display mb-3">AI Matchmaking</h3>
            <p className="text-[#8c94a0] text-sm leading-relaxed">
              Our embedded LLM infrastructure parses complex natural language requests to instantly connect buyers with their perfect property match from our verified global inventory.
            </p>
          </div>
          
          <div className="p-8 rounded-xl bg-[#11151c]/60 border border-white/5 backdrop-blur-sm hover:border-[#f3bd65]/30 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center mb-6 border border-blue-500/20">
              <span className="text-blue-400 text-2xl font-serif">D</span>
            </div>
            <h3 className="text-xl font-display mb-3">Dynamic Deal Room</h3>
            <p className="text-[#8c94a0] text-sm leading-relaxed">
              Brokers get a synchronized birds-eye view of all active negotiations. AI agents automatically score intent, evaluate risk, and surface urgent opportunities.
            </p>
          </div>

          <div className="p-8 rounded-xl bg-[#11151c]/60 border border-white/5 backdrop-blur-sm hover:border-[#f3bd65]/30 transition-colors">
            <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
              <span className="text-emerald-400 text-2xl font-serif">R</span>
            </div>
            <h3 className="text-xl font-display mb-3">Real-Time Sync</h3>
            <p className="text-[#8c94a0] text-sm leading-relaxed">
              A dual-sided ecosystem where broker approvals and customer priority requests update instantly across the entire platform via synchronized state management.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/20 py-8 px-8 mt-auto backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 opacity-70">
            <span className="font-serif italic text-lg text-[#f3bd65]">Æ</span>
            <span className="text-sm tracking-widest text-[#8c94a0]">ARC AI PLATFORM</span>
          </div>
          <p className="text-xs text-[#69717e] uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Arc AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
