import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { cn } from '../layouts/MobileLayout';

export const Splash: React.FC = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      const savedUser = localStorage.getItem('moodrive_user');
      if (savedUser) {
        navigate('/app/map');
      } else {
        navigate('/login');
      }
    }, 2500);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[var(--bg-app)] flex justify-center items-center p-0 md:p-8 transition-colors duration-300">
      <div className="w-full h-[100dvh] md:h-[844px] md:max-h-[100vh] max-w-[390px] bg-[var(--bg-app)] md:rounded-[40px] border-none overflow-hidden relative flex flex-col transition-colors duration-300 shadow-none">
        <div className="flex flex-col items-center justify-center w-full h-full bg-black text-white overflow-hidden relative font-sans">
      <div 
        className={cn(
          "flex flex-col items-center z-10 transition-all duration-1000 ease-out",
          mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
        )}
      >
        <div className="w-28 h-28 bg-[#111111] border border-white/5 rounded-[40px] flex items-center justify-center shadow-2xl mb-8 group">
          <Compass size={64} className="text-nike-volt group-hover:rotate-45 transition-transform duration-700 ease-in-out" />
        </div>
        <h1 className="text-5xl font-black italic tracking-tighter mb-2 uppercase leading-none">
          MOODRIVE
        </h1>
        <div className="flex flex-col items-center">
           <p className="text-nike-volt font-bold text-[10px] tracking-[0.4em] uppercase opacity-80 mt-2">
             SELECT YOUR ROAD
           </p>
           <div className="h-[2px] w-8 bg-nike-volt mt-4 rounded-full"></div>
        </div>
      </div>
      
      {/* Bottom Legal/Version mockup */}
      <div className="absolute bottom-12 flex flex-col items-center">
         <p className="text-[8px] font-black uppercase tracking-widest text-dark-muted">Engineered for Performance</p>
         <p className="text-[8px] font-black uppercase tracking-widest text-nike-volt mt-1">v2.0 NIKE_MATTE_EDITION</p>
      </div>
        </div>
      </div>
    </div>
  );
};
