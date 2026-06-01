import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Map, Compass, Sparkles, Users, Car } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  
  const navItems = [
    { name: t('nav_map'), icon: Map, path: '/app/map' },
    { name: t('nav_community'), icon: Users, path: '/app/community' },
    { name: t('nav_routes'), icon: Compass, path: '/app/routes' },
    { name: t('nav_garage'), icon: Car, path: '/app/garage' },
    { name: t('nav_ai'), icon: Sparkles, path: '/app/ai' }
  ];

  return (
    <div className="absolute bottom-0 left-0 right-0 h-12 flex items-end pointer-events-none z-[110] group/nav">
      {/* Ultra-slim trigger area at the very bottom edge */}
      <div className="absolute bottom-0 left-0 right-0 h-6 pointer-events-auto" />
      
      <div className="w-full px-5 pb-4 pointer-events-none">
        <div className={cn(
          "h-[68px] bg-[#111111]/95 backdrop-blur-xl border border-white/10 rounded-2xl flex items-center justify-around px-2 pointer-events-auto transition-all duration-500 transform shadow-none",
          "translate-y-20 opacity-0 group-hover/nav:translate-y-0 group-hover/nav:opacity-100 hover:translate-y-0 hover:opacity-100"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center w-full h-full relative group/item active:scale-90 transition-transform"
              >
                <Icon 
                  size={22} 
                  className={cn(
                    "transition-all duration-200",
                    isActive 
                      ? "text-nike-volt" 
                      : "text-white/30 group-hover/item:text-white"
                  )} 
                />
                <span className={cn(
                  "text-[9px] mt-1 font-bold tracking-tighter transition-all duration-200",
                  isActive ? "text-nike-volt opacity-100" : "text-white/20 opacity-0 group-hover/item:opacity-50"
                )}>
                  {item.name.toUpperCase()}
                </span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-[2px] bg-nike-volt rounded-full"></div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  );
};

export const MobileLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex justify-center items-center p-0 md:p-8 transition-colors duration-300">
      <div className="w-full h-[100dvh] md:h-[844px] md:max-h-[100vh] max-w-[390px] bg-[#0a0a0a] md:rounded-[40px] border-none overflow-hidden relative flex flex-col transition-colors duration-300 shadow-none">
        <div className="flex-1 overflow-hidden relative bg-[#0a0a0a] transition-colors duration-300">
          <Outlet />
        </div>
        <BottomNav />
      </div>
    </div>
  );
};
