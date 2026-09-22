/**
 * AdminLayout
 * -----------------------------------------------------------------
 * Shell layout untuk pengurus dan administrator (SUPER_ADMIN, ADMIN_PUSAT,
 * ADMIN_WILAYAH, CONTENT_MANAGER, TOURISM_MANAGER, COMMERCE_MANAGER).
 * Dilengkapi Sidebar bernavigasi bertingkat, Topbar switcher persona pengurus,
 * breadcrumb, dan status wilayah/kwarda aktif.
 */

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Compass,
  Newspaper,
  ShoppingBag,
  History,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useUIStore } from '../stores/uiStore';
import { ROLES, UserRole } from '../config/constants';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';

export interface AdminLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
  pageTitle?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  children,
  activeNav = 'dashboard',
  onNavigate,
  pageTitle = 'Dashboard Manajemen',
}) => {
  const { currentUser, switchRole } = useAuthStore();
  const { isAdminSidebarCollapsed, toggleAdminSidebar } = useUIStore();
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [roleSwitcherOpen, setRoleSwitcherOpen] = useState(false);

  const adminNavItems = [
    { id: 'dashboard', label: 'Ringkasan Utama', icon: LayoutDashboard, permission: null },
    { id: 'members', label: 'Pangkalan Data Anggota', icon: Users, permission: 'MEMBER_READ' },
    { id: 'verify', label: 'Verifikasi & Audit KTA', icon: ShieldCheck, permission: 'VERIFY_KTA_INTERNAL' },
    { id: 'tourism', label: 'Destinasi & Sapta Pesona', icon: Compass, permission: 'TOURISM_MANAGE' },
    { id: 'content', label: 'Meja Redaksi Warta', icon: Newspaper, permission: 'CONTENT_REVIEW' },
    { id: 'commerce', label: 'Kedai & Inventori SAKA', icon: ShoppingBag, permission: 'COMMERCE_MANAGE' },
    { id: 'audit', label: 'Jejak Audit Sistem', icon: History, permission: 'SYSTEM_AUDIT_READ' },
  ];

  const adminRoleOptions: { role: UserRole; label: string; region: string }[] = [
    { role: ROLES.SUPER_ADMIN, label: 'Super Administrator', region: 'Nasional' },
    { role: ROLES.ADMIN_PUSAT, label: 'Admin Pusat (Kwarnas)', region: 'Kwarnas' },
    { role: ROLES.ADMIN_WILAYAH, label: 'Admin Kwarda Jawa Barat', region: 'Jawa Barat' },
    { role: ROLES.CONTENT_MANAGER, label: 'Content Manager (DIY)', region: 'DI Yogyakarta' },
    { role: ROLES.TOURISM_MANAGER, label: 'Tourism Manager (Bali)', region: 'Bali' },
    { role: ROLES.COMMERCE_MANAGER, label: 'Commerce Manager (Jateng)', region: 'Jawa Tengah' },
  ];

  const handleNavClick = (id: string) => {
    setMobileDrawerOpen(false);
    if (onNavigate) onNavigate(id);
  };

  return (
    <div id="spwn-admin-layout" className="min-h-screen bg-[#F5F7FA] flex text-slate-800">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-[#0B1F33] text-white border-r border-slate-800 transition-all duration-200 z-30 shrink-0 ${
          isAdminSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Sidebar Brand Header */}
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
          {!isAdminSidebarCollapsed && (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#0066B3] flex items-center justify-center font-extrabold text-xs text-white shrink-0">
                SP
              </div>
              <div className="truncate">
                <h2 className="text-xs font-bold tracking-wider uppercase text-white truncate">
                  SPWN ADMIN
                </h2>
                <p className="text-[10px] text-slate-400 truncate">Pusat Kendali Sistem</p>
              </div>
            </div>
          )}

          {isAdminSidebarCollapsed && (
            <div className="w-full flex justify-center">
              <div className="w-8 h-8 rounded-lg bg-[#0066B3] flex items-center justify-center font-extrabold text-xs text-white">
                SP
              </div>
            </div>
          )}

          <button
            onClick={toggleAdminSidebar}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
            title={isAdminSidebarCollapsed ? 'Perluas Menu' : 'Perkecil Menu'}
          >
            {isAdminSidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Sidebar Nav Items */}
        <div className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#0066B3] text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                } ${isAdminSidebarCollapsed ? 'justify-center' : 'justify-start'}`}
                title={isAdminSidebarCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isAdminSidebarCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer User Info */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/50">
          {!isAdminSidebarCollapsed ? (
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0 border border-slate-600">
                {currentUser.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-white">A</div>
                )}
              </div>
              <div className="truncate flex-1">
                <p className="text-xs font-bold text-white truncate">{currentUser.fullName}</p>
                <p className="text-[10px] text-slate-400 truncate">{currentUser.province || 'Pusat'}</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white">
                {currentUser.fullName.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Admin Content Column */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Admin Top Header */}
        <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileDrawerOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              aria-label="Buka menu admin"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                Kwartir / Wilayah: <strong>{currentUser.province || 'Nasional'}</strong>
              </p>
            </div>
          </div>

          {/* Right: Persona Switcher & Logout */}
          <div className="flex items-center gap-3">
            {/* Quick Persona Switcher for Verification & Simulation */}
            <div className="relative">
              <button
                onClick={() => setRoleSwitcherOpen(!roleSwitcherOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-medium text-slate-700"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span className="truncate max-w-[130px] sm:max-w-none">{currentUser.roleName}</span>
              </button>

              {roleSwitcherOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Simulasi Peran Pengurus (RBAC)
                  </div>
                  {adminRoleOptions.map((opt) => (
                    <button
                      key={opt.role}
                      onClick={() => {
                        switchRole(opt.role);
                        setRoleSwitcherOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-slate-50 flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-800">{opt.label}</p>
                        <p className="text-[10px] text-slate-400">{opt.region}</p>
                      </div>
                      {currentUser.role === opt.role && (
                        <CheckCircle className="w-4 h-4 text-[#0066B3]" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              leftIcon={<LogOut className="w-3.5 h-3.5 text-rose-600" />}
              onClick={() => switchRole(ROLES.PUBLIC_USER)}
            >
              Mode Publik
            </Button>
          </div>
        </header>

        {/* Admin Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Mobile Drawer */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative w-64 bg-[#0B1F33] text-white flex flex-col h-full z-10 shadow-2xl">
            <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800">
              <span className="font-bold text-sm text-white">SPWN ADMIN</span>
              <button onClick={() => setMobileDrawerOpen(false)} className="text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 py-4 px-3 space-y-1">
              {adminNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold ${
                      isActive ? 'bg-[#0066B3] text-white' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
