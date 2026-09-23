import React from 'react';
import {
  LayoutDashboard,
  Users,
  Compass,
  ShoppingBag,
  Shield,
  CreditCard,
  QrCode,
} from 'lucide-react';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { ROLES } from '../../config/constants';
import { cn } from '../../utils/cn';

export const BottomNavigation: React.FC = () => {
  const { activeView, setActiveView } = useUIStore();
  const { currentUser } = useAuthStore();

  const isPublic = currentUser.role === ROLES.PUBLIC_USER;

  const navItems = [
    { id: isPublic ? 'home' : 'dashboard', label: 'Beranda', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'membership', label: 'Anggota', icon: <Users className="w-5 h-5" />, requiresAuth: true },
    { id: 'kta-verification', label: 'Cek KTA', icon: <QrCode className="w-5 h-5" /> },
    { id: 'tourism', label: 'Wisata', icon: <Compass className="w-5 h-5" /> },
    { id: 'commerce', label: 'Pasar', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  const visibleItems = navItems.filter((item) => {
    if (item.requiresAuth && currentUser.role === ROLES.PUBLIC_USER) {
      return false;
    }
    return true;
  });

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-lg border-t border-slate-200/90 px-3 py-1.5 flex items-center justify-around lg:hidden shadow-lg safe-area-pb">
      {visibleItems.map((item) => {
        const isActive = activeView === item.id;
        const isKtaCenter = item.id === 'kta-verification';

        if (isKtaCenter) {
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="flex flex-col items-center justify-center -mt-4 cursor-pointer group"
              aria-label="Verifikasi KTA"
            >
              <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#0066B3] to-[#009B4D] text-white flex items-center justify-center shadow-md shadow-[#0066B3]/25 group-active:scale-95 transition-transform">
                <QrCode className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-slate-700 mt-1">Cek KTA</span>
            </button>
          );
        }

        return (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={cn(
              "flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer relative",
              isActive ? "text-[#0066B3] font-bold" : "text-slate-500 hover:text-slate-900"
            )}
          >
            <span className={cn("transition-transform", isActive ? "scale-110 text-[#0066B3]" : "text-slate-400")}>
              {item.icon}
            </span>
            <span className="text-[10px] mt-0.5 tracking-tight font-medium">{item.label}</span>
            {isActive && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#0066B3] mt-0.5" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
