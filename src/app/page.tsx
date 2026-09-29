import Link from 'next/link';
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import { Icon } from '@/components/Icon';

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
    <div className="min-h-screen bg-transparent text-white selection:bg-[#f3bd65]/30 flex flex-col">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 lg:px-12 lg:py-6 backdrop-blur-xl bg-[#0a0d12]/70 border-b border-white/5 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#e8a33b]/30 bg-[#e8a33b]/10 text-[#e8a33b] font-serif italic text-lg shadow-[0_0_15px_rgba(232,163,59,0.15)]">
            Æ
          </div>
          <span className="font-serif text-2xl tracking-widest italic">Arc</span>
        </div>

        <div className="flex items-center gap-6">
          {isLoggedIn ? (
            <Link href={dashboardLink} className="button-primary px-8 py-2.5 text-[13px] uppercase tracking-widest shadow-[0_0_20px_rgba(227,160,59,0.2)]">
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-[13px] font-semibold tracking-[0.15em] text-[#8c94a0] hover:text-white transition-colors uppercase">
                Login
              </Link>
              <Link href="/signup" className="button-primary px-8 py-2.5 text-[13px] uppercase tracking-widest shadow-[0_0_20px_rgba(227,160,59,0.2)]">
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center pt-40 lg:pt-52 px-5 text-center relative z-10 w-full max-w-[1400px] mx-auto">
        <div className="absolute top-[10%] left-[10%] w-[40rem] h-[40rem] bg-[#f3bd65]/5 rounded-full blur-[150px] pointer-events-none -z-10"></div>
        <div className="absolute bottom-[20%] right-[10%] w-[30rem] h-[30rem] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none -z-10"></div>

        <span className="eyebrow mb-6 text-[#f3bd65] tracking-[0.3em] bg-[#f3bd65]/10 px-4 py-1.5 rounded-full border border-[#f3bd65]/20">The Future of High-End Real Estate</span>
        <h1 className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] tracking-tight leading-[1.05] mb-8 max-w-5xl text-white drop-shadow-2xl">
          An Intelligent Deal Room <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f3bd65] to-[#f9d592]">Powered by AI</span>
        </h1>
        <p className="text-lg md:text-xl text-[#a0a8b5] max-w-3xl mb-14 leading-relaxed font-light">
          Arc is the ultimate two-sided ecosystem bridging high-net-worth buyers and luxury brokers. 
          Experience dynamic natural language matchmaking, automated lead qualification, and a synchronized real-time negotiation pipeline.
        </p>

        <div className="flex flex-col sm:flex-row gap-5 relative z-10 w-full sm:w-auto px-5">
          <Link href={isLoggedIn ? dashboardLink : "/login"} className="px-10 py-4 bg-gradient-to-b from-[#f3bd65] to-[#e3a03b] text-[#1a1307] font-semibold tracking-wider rounded-md hover:brightness-110 transition-all shadow-[0_0_30px_rgba(243,189,101,0.25)] uppercase text-sm w-full sm:w-auto">
            {isLoggedIn ? 'Enter Deal Room' : 'Access Dashboard'}
          </Link>
          {!isLoggedIn && (
            <Link href="/signup" className="px-10 py-4 bg-white/5 border border-white/10 text-white font-semibold tracking-wider rounded-md hover:bg-white/10 transition-all backdrop-blur-md uppercase text-sm w-full sm:w-auto">
              Create Account
            </Link>
          )}
        </div>

        {/* Detailed Explanation Section */}
        <div className="mt-40 mb-20 w-full text-left space-y-32">
          
          {/* Platform Overview */}
          <div className="text-center max-w-4xl mx-auto mb-20">
            <h2 className="font-display text-4xl md:text-5xl mb-6">How Arc Transforms Real Estate</h2>
            <div className="w-16 h-0.5 bg-[#f3bd65] mx-auto mb-8"></div>
            <p className="text-[#8c94a0] text-lg leading-relaxed">
              Traditional CRMs are static databases. Arc is an active participant in your workflow. By embedding Large Language Models directly into the application pipeline, Arc analyzes intent, categorizes leads, and automates follow-ups, saving brokers countless hours while delivering a concierge-level experience to buyers.
            </p>
          </div>

          {/* For Brokers */}
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="eyebrow text-[#f3bd65]">For Brokers & Admins</div>
              <h3 className="font-display text-4xl lg:text-5xl leading-tight">The Ultimate AI <br/> Deal Room</h3>
              <p className="text-[#8c94a0] text-lg leading-relaxed">
                Manage your luxury inventory with unparalleled intelligence. Arc's Deal Room automatically sorts your pipeline based on AI-calculated intent scores (0-99).
              </p>
              <ul className="space-y-4 mt-8">
                <li className="flex items-start gap-4 text-[#a0a8b5]">
                  <div className="mt-1 text-[#75c994]"><Icon name="check" size={18} /></div>
                  <div><strong className="text-white font-oswald tracking-wide uppercase text-sm">Automated Qualification:</strong> The AI extracts missing criteria, budget, and timeline instantly from every lead.</div>
                </li>
                <li className="flex items-start gap-4 text-[#a0a8b5]">
                  <div className="mt-1 text-[#75c994]"><Icon name="check" size={18} /></div>
                  <div><strong className="text-white font-oswald tracking-wide uppercase text-sm">Autonomous Agents:</strong> Instruct an AI agent to call or email clients on your behalf. Arc updates the CRM automatically.</div>
                </li>
                <li className="flex items-start gap-4 text-[#a0a8b5]">
                  <div className="mt-1 text-[#75c994]"><Icon name="check" size={18} /></div>
                  <div><strong className="text-white font-oswald tracking-wide uppercase text-sm">Real-Time Sync:</strong> The moment you approve a deal, the customer's portal updates instantly with a glowing success timeline.</div>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-[#11151c]/60 border border-white/5 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#e8a33b]/10 rounded-full blur-[80px]"></div>
              <div className="metric-card relative z-10 mb-6 border-white/10">
                <p className="eyebrow !tracking-[.1em] !text-[10px] text-[#69717e]">PRIORITY PIPELINE</p>
                <strong className="text-[#f3bd65]">24 Active</strong>
                <span>leads in total</span>
              </div>
              <div className="lead-row relative z-10 !bg-[#151a23] !border-white/10 p-5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#5b4130] text-[#f5c682] flex items-center justify-center font-bold text-sm">JM</div>
                  <div>
                    <h4 className="text-white font-bold text-lg">James Miller</h4>
                    <p className="text-xs text-[#a0a8b5] uppercase tracking-wider">South Mumbai • ₹ 15 Cr • 4 BHK</p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <span className="priority border-[#e8a33b] text-[#f5bf68]">HOT <b>99</b></span>
                  <span className="text-[11px] text-[#8c94a0] uppercase tracking-widest border border-white/10 px-3 py-1 rounded">Urgent Action</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

          {/* For Buyers */}
          <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
            <div className="flex-1 space-y-6">
              <div className="eyebrow text-[#f3bd65]">For Luxury Buyers</div>
              <h3 className="font-display text-4xl lg:text-5xl leading-tight">A Premium Property <br/> Portal</h3>
              <p className="text-[#8c94a0] text-lg leading-relaxed">
                Step into a world-class customer dashboard wrapped in dark glassmorphic aesthetics. Apply for properties, track your deals in real-time, and get matched using natural language.
              </p>
              <ul className="space-y-4 mt-8">
                <li className="flex items-start gap-4 text-[#a0a8b5]">
                  <div className="mt-1 text-[#75c994]"><Icon name="check" size={18} /></div>
                  <div><strong className="text-white font-oswald tracking-wide uppercase text-sm">Natural Language Matching:</strong> Don't just click filters. Type exactly what you want (e.g., "Sea-facing duplex under ₹ 20 Cr"), and Arc finds it.</div>
                </li>
                <li className="flex items-start gap-4 text-[#a0a8b5]">
                  <div className="mt-1 text-[#75c994]"><Icon name="check" size={18} /></div>
                  <div><strong className="text-white font-oswald tracking-wide uppercase text-sm">Live Timelines:</strong> Track your application from 'Under Review' to 'Deal Approved' with instant synchronization.</div>
                </li>
                <li className="flex items-start gap-4 text-[#a0a8b5]">
                  <div className="mt-1 text-[#75c994]"><Icon name="check" size={18} /></div>
                  <div><strong className="text-white font-oswald tracking-wide uppercase text-sm">Urgent Escalation:</strong> Found the perfect home? Click "Request Urgent Attention" to instantly notify the broker on their dashboard.</div>
                </li>
              </ul>
            </div>
            <div className="flex-1 w-full bg-[#11151c]/60 border border-white/5 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]"></div>
              
              <div className="relative z-10 border border-white/10 rounded-xl p-6 bg-[#0a0c10]/80">
                <h4 className="font-display text-2xl text-white mb-4">Application Status</h4>
                <div className="flex gap-4 items-start relative">
                  <span className="w-4 h-4 mt-1 rounded-full bg-[#75c994] border-2 border-[#161b22] shadow-[0_0_15px_#75c994] shrink-0 z-10"></span>
                  <div className="flex flex-col">
                    <span className="text-xs uppercase tracking-[0.2em] text-[#75c994] font-bold">Deal Made / Approved</span>
                    <p className="text-sm text-white/80 mt-1.5 font-medium leading-relaxed">Congratulations! The admin has approved your deal for this property. The broker will contact you shortly with the next steps.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
        
        {/* Final CTA */}
        <div className="w-full max-w-4xl mx-auto text-center border-t border-white/10 pt-20 mb-32">
          <h2 className="font-display text-4xl mb-6">Ready to elevate your workflow?</h2>
          <p className="text-[#8c94a0] mb-10 text-lg">Join Arc today and experience the next generation of real estate technology.</p>
          <Link href="/signup" className="inline-block px-12 py-4 bg-white text-[#0a0d12] font-bold tracking-widest rounded hover:bg-gray-200 transition-all uppercase text-sm shadow-[0_0_30px_rgba(255,255,255,0.15)]">
            Create Your Free Account
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#06080a]/80 py-10 px-6 lg:px-12 mt-auto backdrop-blur-xl relative z-20">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 opacity-90">
            <div className="flex h-8 w-8 items-center justify-center border border-[#e8a33b]/30 bg-[#e8a33b]/10 text-[#e8a33b] font-serif italic text-sm">
              Æ
            </div>
            <span className="text-sm tracking-[0.2em] text-[#8c94a0] font-semibold">ARC AI PLATFORM</span>
          </div>
          <p className="text-[11px] text-[#69717e] uppercase tracking-[0.2em] font-semibold">
            &copy; {new Date().getFullYear()} Arc AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
