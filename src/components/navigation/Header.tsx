import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  Menu,
  Search,
  Bell,
  ChevronDown,
  UserCheck,
  QrCode,
  Shield,
  Layers,
  User,
  Activity,
  CheckCircle2,
  Sparkles,
  LogIn,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ROLES, UserRole } from '../../config/constants';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MemberProfileModal } from '../../features/membership/components/MemberProfileModal';
import { SIMULATION_USERS } from '../../config/simulationUsers';

export const Header: React.FC = () => {
  const {
    currentUser,
    setImpersonatedUser,
    clearImpersonation,
    getEffectiveUser,
    isAuthenticated,
    logout,
    updateCurrentUserProfile
  } = useAuthStore();

  // User yang tampil mengikuti simulasi SuperAdmin
  // Akun asli tetap tersimpan di currentUser
  const displayUser =
    getEffectiveUser
      ? getEffectiveUser()
      : currentUser;

  const {
    toggleSidebar,
    activeView,
    setActiveView,
    setQuickActionModalOpen,
    setLoginModalOpen,
    searchQuery,
    setSearchQuery,
  } = useUIStore();
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const isPublicUser = !isAuthenticated || displayUser?.role === ROLES.PUBLIC_USER;

  const availableRoles = [
    { key:'ADMIN_PUSAT', role:ROLES.ADMIN_PUSAT, label:'Admin Pusat (Kwarnas)', badgeVariant:'purple' },
    { key:'PENGURUS_PROVINSI', role:'PENGURUS_PROVINSI' as UserRole, label:'Pengurus Provinsi Demo', badgeVariant:'green' },
    { key:'PEMBINA_SAKA', role:'PEMBINA' as UserRole, label:'Pembina SAKA Demo', badgeVariant:'orange' },
    { key:'MEMBER_AKTIF', role:ROLES.MEMBER, label:'Member Aktif (Fajar)', badgeVariant:'green' },
    { key:'MEMBER_BARU', role:ROLES.MEMBER, label:'Member Baru', badgeVariant:'blue' },
    { key:'SUPER_ADMIN', role:ROLES.SUPER_ADMIN, label:'Kembali Super Admin', badgeVariant:'blue' },
  ];

  // Map active view to workspace title
  const getViewTitle = () => {
    switch (activeView) {
      case 'home':
      case '/': return 'Beranda Publik SAKA';
      case 'dashboard': return 'Dashboard Ekosistem';
      case 'membership': return 'Pusat Keanggotaan & KTA';
      case 'kta-verification':
      case 'verifikasi': return 'Verifikasi KTA Digital';
      case 'tourism': return 'Pusat Pariwisata & Destinasi';
      case 'content': return 'Redaksi & Artikel Wisata';
      case 'commerce': return 'Pasar UMKM SAKA';
      case 'analytics': return 'Analitik Ekosistem';
      case 'admin-portal':
      case 'admin': return 'Portal Administrator';
      case 'skk-learning': return 'SKK Learning Center';
      case 'member-achievement': return 'Pencapaian & Lencana';
      case 'design-system': return 'Design System & UI Kit';
      default: return 'SPWN Workspace';
    }
  };

  const handleLogout = () => {
    logout();
    setActiveView('home');
  };

  return (
    <header className="sticky top-0 z-40 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3 sm:gap-4 shadow-xs">
      {/* Left: Mobile Toggle, Breadcrumb & Search */}
      <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 rounded-lg lg:hidden cursor-pointer"
          aria-label="Buka navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* View Badge / Breadcrumb for desktop */}
        <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-800 shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#0066B3]" />
          <span className="truncate">{getViewTitle()}</span>
          <span className="text-slate-300">/</span>
        </div>

        {/* Search Input */}
        <div className="relative w-full max-w-[130px] sm:max-w-xs">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari anggota, KTA..."
            className="w-full pl-8 sm:pl-9 pr-2 sm:pr-8 py-1.5 text-xs bg-slate-100/80 border border-slate-200/60 rounded-xl focus:bg-white focus:border-[#0066B3] focus:ring-2 focus:ring-[#0066B3]/15 focus:outline-none transition-all placeholder:text-slate-400"
          />
          <kbd className="hidden sm:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white rounded border border-slate-200 pointer-events-none">
            /
          </kbd>
        </div>

        {/* Live sync pulse */}
        <div className="hidden xl:inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-[10px] font-medium text-emerald-800 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-[#009B4D] animate-pulse" />
          <span>Cloud Sync Online</span>
        </div>
      </div>

      {/* Right: Actions, Role Switcher Simulator & Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Quick KTA Verify Trigger */}
        <button
          onClick={() => setActiveView('kta-verification')}
          className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-emerald-200/80 bg-emerald-50/60 hover:bg-emerald-100/60 text-emerald-800 text-xs font-semibold transition-colors cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5 text-[#009B4D]" />
          <span>Verifikasi KTA</span>
        </button>

        {isPublicUser ? (
          <>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setActiveView('registration')}
              className="hidden md:inline-flex text-xs rounded-xl"
            >
              Daftar
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => setLoginModalOpen(true)}
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              className="text-xs rounded-xl shadow-xs font-semibold"
            >
              Masuk
            </Button>
          </>
        ) : (
          <>
            {/* Quick Admin Portal Trigger */}
            {(displayUser?.role === ROLES.SUPER_ADMIN || displayUser?.role === ROLES.ADMIN_PUSAT || displayUser?.role === ROLES.ADMIN_WILAYAH) && (
              <Button
                size="sm"
                variant="primary"
                onClick={() => setActiveView('admin_portal')}
                leftIcon={<Shield className="w-3.5 h-3.5" />}
                className="hidden md:inline-flex text-xs rounded-xl shadow-xs"
              >
                Portal Admin
              </Button>
            )}
          </>
        )}

        {/* Role Switcher Simulator (Enterprise RBAC Showcase) - KHUSUS SUPERADMIN */}
        {displayUser?.role === ROLES.SUPER_ADMIN && (
          <div className="relative">
            <button
              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-2 border-slate-200 hover:border-[#0066B3] hover:bg-[#0066B3] hover:text-white bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer transition-colors shadow-2xs group"
              title="Menu Simulasi Demo Peran RBAC (Khusus Superadmin)"
            >
              <Shield className="w-3.5 h-3.5 text-[#0066B3] group-hover:text-white shrink-0 transition-colors" />
              <span className="hidden lg:inline text-slate-500 group-hover:text-white/80 transition-colors">Peran:</span>
              <span className="font-semibold text-slate-900 group-hover:text-white truncate max-w-[70px] sm:max-w-[110px] transition-colors">{displayUser?.role}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-white ml-0.5 shrink-0 transition-colors" />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 border-b border-slate-100">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Simulasi Demo Pengurus & Anggota</p>
                    <p className="text-xs text-slate-500 mt-0.5">Khusus Superadmin menguji kapabilitas seluruh peran sistem</p>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1.5 px-1.5 space-y-1">
                    {availableRoles.map((item) => (
                      <button
                        key={item.role}
                        onClick={() => {
                          if (item.role === ROLES.MEMBER) {
                            sessionStorage.setItem('spwn_simulated_from_superadmin', 'true');
                            setImpersonatedUser({
                               ...currentUser,
                               role:item.role,
                               simulationRole:item.role,
                               simulationLabel:item.label
                             });
                            setActiveView('membership');
                          } else {
                            setImpersonatedUser({
                               ...currentUser,
                               role:item.role,
                               simulationRole:item.role,
                               simulationLabel:item.label
                             });
                          }
                          setIsRoleDropdownOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-xs rounded-xl hover:bg-[#0066B3] hover:text-white text-slate-800 flex items-center justify-between cursor-pointer transition-colors group"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <p className="font-semibold truncate group-hover:text-white">{item.label}</p>
                          <p className="text-[10px] font-mono text-slate-400 group-hover:text-white/80">{item.role}</p>
                        </div>
                        {displayUser?.role === item.role ? (
                          <Badge size="sm" variant={item.badgeVariant}>Aktif</Badge>
                        ) : (
                          <span className="text-[10px] text-slate-400 group-hover:text-white font-semibold">Pilih</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Notification Bell */}
        <button
          onClick={() => setQuickActionModalOpen(true)}
          className="relative p-2 rounded-xl text-slate-600 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-900 transition-colors cursor-pointer"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#F7941D] ring-2 ring-white" />
        </button>

        {/* User Profile or Logout */}
        {!isPublicUser ? (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsProfileModalOpen(true)}
              title="Klik untuk Detail Profil & Ganti Password Akun"
              className="flex items-center gap-2 pl-1.5 pr-2 py-1 rounded-xl border border-slate-200/80 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-colors cursor-pointer text-left shadow-2xs group"
            >
              <Avatar
                src={displayUser?.avatarUrl}
                name={(displayUser?.nama || displayUser?.fullName)}
                size="sm"
                status="online"
              />
              <div className="hidden lg:block text-left">
                <p className="text-xs font-semibold text-slate-900 group-hover:text-white leading-tight truncate max-w-[120px] transition-colors">
                  {(displayUser?.nama || displayUser?.fullName)}
                </p>
                <p className="text-[10px] text-slate-400 group-hover:text-slate-300 leading-tight truncate max-w-[120px] transition-colors">{displayUser?.province || 'Nasional'}</p>
              </div>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              title="Keluar dari akun"
              className="p-2 text-rose-600 border border-transparent hover:text-white hover:bg-rose-600 hover:border-rose-600 rounded-xl transition-colors cursor-pointer"
              aria-label="Keluar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : null}
      </div>

      {/* Member Profile Correction & Password Reset Modal
          Render outside header stacking context */}
      {typeof document !== 'undefined' &&
        createPortal(
          <MemberProfileModal
            isOpen={isProfileModalOpen}
            onClose={() => setIsProfileModalOpen(false)}
            currentUser={currentUser}
            updateCurrentUserProfile={updateCurrentUserProfile}
          />,
          document.body
        )}
    </header>
  );
};
