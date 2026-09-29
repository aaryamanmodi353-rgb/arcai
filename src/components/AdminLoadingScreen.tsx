'use client';
import { useEffect, useState } from 'react';
import { Icon } from './Icon';

export function AdminLoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    // Artificial progress animation
    const duration = 3500;
    const intervalTime = 50;
    const steps = duration / intervalTime;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const percent = Math.min(100, Math.floor((currentStep / steps) * 100));
      
      // Add a little randomness to make it feel real
      const jitter = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0;
      setProgress(prev => Math.min(100, Math.max(prev, percent + jitter)));

      if (percent > 30) setStep(1);
      if (percent > 70) setStep(2);
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setTimeout(onComplete, 400); // slight delay after reaching 100%
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0d1017] text-white">
      {/* Background grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-0 bottom-0 left-[20%] w-px bg-gradient-to-b from-transparent via-[#8c94a0] to-transparent"></div>
        <div className="absolute top-0 bottom-0 left-[80%] w-px bg-gradient-to-b from-transparent via-[#8c94a0] to-transparent"></div>
        <div className="absolute left-0 right-0 top-[30%] h-px bg-gradient-to-r from-transparent via-[#8c94a0] to-transparent"></div>
      </div>

      <div className="relative z-10 w-full max-w-[1400px] h-[80vh] flex flex-col md:flex-row">
        
        {/* Header (Absolute) */}
        <div className="absolute top-0 left-8 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center border border-[#e8a33b]/30 bg-[#e8a33b]/10 text-[#e8a33b] font-serif italic text-lg">
            Æ
          </div>
          <span className="font-serif text-2xl tracking-wide italic">Arc</span>
        </div>
        
        <div className="absolute top-2 right-8 flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#8c94a0]">South Mumbai Residential</span>
          <div className="w-8 h-px bg-[#e8a33b]/60"></div>
        </div>

        {/* Left Content */}
        <div className="flex-1 flex flex-col justify-center px-8 lg:px-16 pt-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8c94a0] mb-8">
            Curated Deals &bull; Verified Inventory &bull; Data-Driven Insights
          </p>
          
          <h1 className="font-display text-6xl lg:text-8xl tracking-tight leading-[1.1] mb-6">
            Loading<br />
            Your <span className="text-[#f3bd65]">Deal Room</span>
          </h1>
          
          <p className="text-[#8c94a0] text-lg max-w-md leading-relaxed mb-16">
            Setting up your pipeline, inventory and market intelligence. This will only take a moment.
          </p>

          {/* Progress Section */}
          <div className="max-w-xl">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-1 flex-1 bg-[#1a1f2b] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#f3bd65] rounded-full transition-all duration-200 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-[#f3bd65] font-oswald text-lg w-12 text-right">{progress}%</span>
            </div>

            {/* Steps Timeline */}
            <div className="flex justify-between items-center relative before:absolute before:left-0 before:right-0 before:top-3 before:h-px before:bg-[#1a1f2b] before:-z-10">
              <div className="flex flex-col items-center gap-3 bg-[#0d1017] px-2">
                {step > 0 ? (
                  <div className="w-6 h-6 rounded-full bg-[#f3bd65] flex items-center justify-center text-[#0d1017]">
                    <Icon name="check" size={14} />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#f3bd65] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#f3bd65] rounded-full"></div>
                  </div>
                )}
                <span className={`text-[11px] ${step > 0 ? 'text-[#8c94a0]' : 'text-white'}`}>Secure connection</span>
              </div>
              
              <div className="flex flex-col items-center gap-3 bg-[#0d1017] px-2">
                {step > 1 ? (
                  <div className="w-6 h-6 rounded-full bg-[#f3bd65] flex items-center justify-center text-[#0d1017]">
                    <Icon name="check" size={14} />
                  </div>
                ) : step === 1 ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[#f3bd65] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#f3bd65] rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#2a3143]"></div>
                )}
                <span className={`text-[11px] ${step > 1 ? 'text-[#8c94a0]' : step === 1 ? 'text-white' : 'text-[#4c566a]'}`}>Syncing data</span>
              </div>

              <div className="flex flex-col items-center gap-3 bg-[#0d1017] px-2">
                {step === 2 ? (
                  <div className="w-6 h-6 rounded-full border-2 border-[#f3bd65] flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#f3bd65] rounded-full animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full border-2 border-[#2a3143]"></div>
                )}
                <span className={`text-[11px] ${step === 2 ? 'text-white' : 'text-[#4c566a]'}`}>Preparing workspace</span>
              </div>
            </div>
          </div>
          
          <div className="mt-auto pt-16">
            <p className="font-serif italic text-[#8c94a0] text-lg mb-3">"A smarter way to manage residential opportunities."</p>
            <div className="w-12 h-0.5 bg-[#f3bd65]/60"></div>
          </div>
        </div>

        {/* Right Image */}
        <div className="flex-1 hidden lg:flex items-center justify-center p-8 relative">
          <div className="absolute top-0 right-10 w-[90%] h-[90%] border border-[#e8a33b]/20 rounded-3xl translate-x-4 translate-y-4"></div>
          <div className="relative w-full h-full max-h-[700px] bg-[#1a1f2b] rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Top-left cutout effect using a pseudo-element or absolute div */}
            <div className="absolute top-0 left-0 w-24 h-8 bg-[#0d1017] rounded-br-2xl border-b border-r border-[#1a1f2b] z-10"></div>
            <img 
              src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80" 
              alt="Luxury apartment balcony" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
