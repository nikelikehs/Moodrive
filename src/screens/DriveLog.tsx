import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Trophy, Calendar, ArrowRight, Zap, Target } from 'lucide-react';

const MOCK_LOGS = [
  { id: 1, date: '2026.05.24', route: 'Urban Night Escape', dist: '42.5km', pts: 840, time: '1h 12m' },
  { id: 2, date: '2026.05.22', route: 'Coastal Breeze Course', dist: '128.2km', pts: 2450, time: '2h 45m' },
  { id: 3, date: '2026.05.21', route: 'Mountain Peak Vibe', dist: '35.1km', pts: 720, time: '55m' },
];

export const DriveLog: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full h-[100dvh] flex flex-col bg-[var(--bg-app)] text-[var(--text-main)] font-sans">
      <div className="flex items-center px-4 py-8 border-b border-[var(--border-subtle)] sticky top-0 bg-[var(--bg-app)] z-20">
        <button onClick={() => navigate('/app/map')} className="w-11 h-11 rounded-full flex items-center justify-center text-[var(--text-main)]"><ChevronLeft size={24} /></button>
        <h1 className="text-xl font-black italic uppercase tracking-tighter mx-auto -ml-11 flex-1 text-center">My Drive Logs</h1>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar p-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-3 mb-8">
           <div className="bg-[var(--bg-panel)] p-6 rounded-[32px] border border-[var(--border-subtle)]">
             <div className="flex items-center gap-2 mb-2">
                <Target size={14} className="text-nike-volt" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Distance</span>
             </div>
             <p className="text-3xl font-black italic tracking-tighter text-[var(--text-main)]">1,248<span className="text-xs ml-1 not-italic opacity-50">KM</span></p>
           </div>
           <div className="bg-[var(--bg-panel)] p-6 rounded-[32px] border border-[var(--border-subtle)]">
             <div className="flex items-center gap-2 mb-2">
                <Zap size={14} className="text-nike-volt" />
                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Experience</span>
             </div>
             <p className="text-3xl font-black italic tracking-tighter text-[var(--text-main)]">240<span className="text-xs ml-1 not-italic opacity-50">LVL</span></p>
           </div>
        </div>

        {/* Level Up Progress */}
        <div className="bg-black dark:bg-[var(--bg-panel)] p-8 rounded-[40px] mb-10 shadow-2xl relative overflow-hidden">
           <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                 <h2 className="text-2xl font-black italic tracking-tighter text-white uppercase italic leading-none">Next Milestone</h2>
                 <Trophy className="text-nike-volt" size={24} />
              </div>
              <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-6">32km until next tier: ELITE NAVIGATOR</p>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                 <div className="h-full bg-nike-volt w-3/4 shadow-[0_0_20px_rgba(204,255,0,0.5)]" />
              </div>
           </div>
           <div className="absolute -right-4 -bottom-4 opacity-10">
              <Zap size={140} className="text-nike-volt" />
           </div>
        </div>

        {/* Logs List */}
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-6 px-2">Recent Expeditions</h3>
        <div className="space-y-4">
           {MOCK_LOGS.map(log => (
             <div key={log.id} className="bg-[var(--bg-panel)] p-6 rounded-[28px] border border-[var(--border-subtle)] flex items-center gap-4 group hover:bg-[var(--bg-app)] transition-all">
                <div className="w-14 h-14 bg-[var(--bg-app)] rounded-2xl flex items-center justify-center shrink-0 border border-[var(--border-subtle)] group-hover:border-nike-volt/30">
                   <Calendar size={20} className="text-nike-volt" />
                </div>
                <div className="flex-1">
                   <div className="flex items-center justify-between mb-1">
                      <h4 className="text-[13px] font-black italic text-[var(--text-main)] uppercase tracking-tight">{log.route}</h4>
                      <span className="text-[10px] font-mono text-[var(--text-muted)]">{log.date}</span>
                   </div>
                   <div className="flex items-center gap-3 text-[10px] font-bold text-nike-volt/80 uppercase tracking-widest">
                      <span>{log.dist}</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                      <span>{log.pts} PTS</span>
                      <span className="w-1 h-1 rounded-full bg-[var(--border-subtle)]" />
                      <span>{log.time}</span>
                   </div>
                </div>
                <button className="w-10 h-10 bg-[var(--bg-app)] rounded-full flex items-center justify-center text-[var(--text-muted)] group-hover:text-nike-volt transition-colors border border-[var(--border-subtle)]">
                   <ArrowRight size={18} />
                </button>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
