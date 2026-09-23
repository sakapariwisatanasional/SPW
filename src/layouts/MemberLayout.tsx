/**
 * SPWN Apps 2.0 - Member Application Shell
 * Location: src/layouts/MemberLayout.tsx
 * -----------------------------------------------------------------
 * Shell layout utama untuk Anggota Aktif SAKA Pariwisata (MEMBER).
 * Konsep: "Mobile First Workspace" & "Member Identity Center".
 *
 * Desktop:
 * - Sidebar:
 *   1. Dashboard
 *   2. KTA Saya
 *   3. Achievement
 *   4. Portfolio
 *   5. Kegiatan
 *   6. Profil
 *
 * Mobile:
 * - Bottom Navigation:
 *   1. Home
 *   2. KTA
 *   3. Progress
 *   4. Portfolio
 *   5. Profil
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  CreditCard,
  Award,
  Briefcase,
  Calendar,
  User,
  LogOut,
  Shield,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  Compass,
  ArrowRightLeft,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { ROLES, UserRole } from '../config/constants';
import { MemberDashboardView } from '../features/membership/components/MemberDashboardView';
import { MemberKtaView } from '../features/membership/components/MemberKtaView';
import { MemberAchievementPage } from '../features/achievement/pages/MemberAchievementPage';
import { MemberPortfolioView } from '../features/membership/components/MemberPortfolioView';
import { MemberActivityView } from '../features/membership/components/MemberActivityView';
import { MemberProfileView } from '../features/membership/components/MemberProfileView';

export interface MemberLayoutProps {
  children?: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
}

export const MemberLayout: React.FC<MemberLayoutProps> = ({
  children,
  activeTab: controlledTab,
  onTabChange,
}) => {
  const { currentUser, switchRole } = useAuthStore();
  const { addToast, setActiveView } = useUIStore();

  const [internalTab, setInternalTab] = useState<string>('dashboard');
  const activeTab = controlledTab || internalTab;

  const handleTabClick = (tabId: string) => {
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      setInternalTab(tabId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Desktop Navigation Items (6 Items)
  const desktopNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'kta', label: 'KTA Saya', icon: CreditCard, badge: 'Aktif' },
    { id: 'achievement', label: 'Achievement', icon: Award, badge: '23 SKK' },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase, badge: null },
    { id: 'kegiatan', label: 'Kegiatan', icon: Calendar, badge: null },
    { id: 'profil', label: 'Profil & Keamanan', icon: User, badge: null },
  ];

  // Mobile Bottom Navigation Items (5 Items)
  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'kta', label: 'KTA', icon: CreditCard },
    { id: 'achievement', label: 'Progress', icon: Award },
    { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
    { id: 'profil', label: 'Profil', icon: User },
  ];

  // Render view corresponding to activeTab
  const renderCurrentView = () => {
    if (children && activeTab === 'custom') {
      return children;
    }

    switch (activeTab) {
      case 'dashboard':
        return <MemberDashboardView onNavigateTab={handleTabClick} />;
      case 'kta':
        return <MemberKtaView />;
      case 'achievement':
      case 'pencapaian':
        return <MemberAchievementPage />;
      case 'portfolio':
        return <MemberPortfolioView />;
      case 'kegiatan':
        return <MemberActivityView />;
      case 'profil':
        return <MemberProfileView />;
      default:
        return children || <MemberDashboardView onNavigateTab={handleTabClick} />;
    }
  };

  return (
    <div id="spwn-member-shell" className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased overflow-x-hidden w-full max-w-full">
      {/* ============================================================== */}
      {/* DESKTOP SIDEBAR (Visible on lg: screens)                       */}
      {/* ============================================================== */}
      <aside
        id="member-desktop-sidebar"
        className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200/80 fixed inset-y-0 left-0 z-30 shadow-xs select-none"
      >
        {/* Brand / Logo Area with Wonderful Indonesia Palette */}
        <div className="h-18 px-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-900/10 flex items-center justify-center p-1 shadow-xs">
              <img
                src="/logo.png"
                alt="Logo SAKA Pariwisata"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-slate-900 tracking-tight text-sm">SPWN 2.0</span>
                <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-blue-50 text-[#0066B3] border border-blue-200">
                  ANGGOTA
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Member Identity Center</p>
            </div>
          </div>
        </div>

        {/* Member Profile Compact Card */}
        <div className="p-4 mx-3 mt-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/70 border border-slate-200/60">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-slate-900 shrink-0 border border-slate-300">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-white text-xs">
                  {currentUser.fullName.charAt(0)}
                </div>
              )}
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#009B4D] border border-white rounded-full" />
            </div>

            <div className="min-w-0 flex-1">
              <h4 className="text-xs font-bold text-slate-900 truncate leading-snug">
                {currentUser.fullName}
              </h4>
              <p className="text-[10px] text-slate-500 truncate font-mono">
                {currentUser.nomor_kta || currentUser.memberId || 'SPWN.MEMBER'}
              </p>
              <div className="flex items-center gap-1 text-[9px] font-bold text-[#009B4D] mt-0.5">
                <ShieldCheck className="w-3 h-3" />
                <span>KTA Terverifikasi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items List */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu Utama
          </div>

          {desktopNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'achievement' && activeTab === 'pencapaian');

            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0066B3] text-white shadow-md shadow-[#0066B3]/20'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive
                        ? 'text-white'
                        : item.id === 'kta'
                        ? 'text-[#0066B3]'
                        : item.id === 'achievement'
                        ? 'text-[#F7941D]'
                        : item.id === 'portfolio'
                        ? 'text-[#009B4D]'
                        : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Actions & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          {sessionStorage.getItem('spwn_simulated_from_superadmin') === 'true' && (
            <button
              onClick={() => {
                sessionStorage.removeItem('spwn_simulated_from_superadmin');
                switchRole(ROLES.SUPER_ADMIN);
                setActiveView('admin_portal');
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold bg-[#0066B3] text-white hover:bg-white hover:text-[#0066B3] border-2 border-[#0066B3] transition-colors shadow-2xs cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Kembali ke Superadmin</span>
            </button>
          )}

          <button
            onClick={() => {
              sessionStorage.removeItem('spwn_simulated_from_superadmin');
              switchRole(ROLES.PUBLIC_USER);
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 border-2 border-transparent hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar Sesi</span>
          </button>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* MAIN CONTENT WORKSPACE                                         */}
      {/* ============================================================== */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 pb-20 lg:pb-8 transition-all overflow-x-hidden w-full max-w-full">
        {sessionStorage.getItem('spwn_simulated_from_superadmin') === 'true' && (
          <div className="bg-[#0B1F33] text-white px-4 py-2 text-xs flex items-center justify-between gap-3 shadow-md z-30">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">
                Mode Simulasi: Sedang melihat portal sebagai <strong>Demo Anggota SAKA ({currentUser.fullName})</strong>
              </span>
            </div>
            <button
              onClick={() => {
                sessionStorage.removeItem('spwn_simulated_from_superadmin');
                switchRole(ROLES.SUPER_ADMIN);
                setActiveView('admin_portal');
              }}
              className="px-3 py-1 rounded-lg text-xs font-bold bg-white text-[#0B1F33] border-2 border-white hover:bg-[#0066B3] hover:text-white hover:border-[#0066B3] transition-colors cursor-pointer shrink-0"
            >
              Kembali ke Superadmin
            </button>
          </div>
        )}

        {/* Mobile & Tablet Sticky Top Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 h-16 flex items-center justify-between lg:hidden shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-900/10 flex items-center justify-center p-0.5 shadow-xs">
              <img
                src="/logo.png"
                alt="Logo SAKA Pariwisata"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xs font-black text-slate-900 leading-none">Portal Anggota SPWN</h1>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">
                {currentUser.fullName}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabClick('profil')}
              className="w-8 h-8 rounded-full overflow-hidden border border-slate-200 bg-slate-100 shrink-0"
            >
              {currentUser.avatarUrl ? (
                <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center font-bold text-xs text-[#0066B3]">
                  {currentUser.fullName.charAt(0)}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Page Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto">
          {renderCurrentView()}
        </main>
      </div>

      {/* ============================================================== */}
      {/* MOBILE BOTTOM NAVIGATION (WCAG Touch Target Compliant: >48px)  */}
      {/* ============================================================== */}
      <nav
        id="member-mobile-bottom-nav"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 px-2 py-1 flex items-center justify-around lg:hidden shadow-lg"
        aria-label="Navigasi Anggota"
      >
        {mobileNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id || (item.id === 'achievement' && activeTab === 'pencapaian');

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex flex-col items-center justify-center w-14 min-h-[48px] py-1 transition-all rounded-xl ${
                isActive ? 'text-[#0066B3] font-black' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#0066B3]' : 'text-slate-400'
                  }`}
                />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-[#0066B3] rounded-full" />
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
