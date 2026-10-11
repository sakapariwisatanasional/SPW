/**
 * SPWN Apps 2.0 - Final Admin Dashboard Architecture Portal Page
 * Location: src/features/admin/pages/AdminPortalPage.tsx
 */

import React from 'react';
import {
  LayoutDashboard,
  Users,
  CreditCard,
  Globe,
  ShieldCheck,
  History,
  FileSpreadsheet,
  UserCheck,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { AdminScopeBar } from '../components/AdminScopeBar';
import { AdminDashboardOverview } from '../components/AdminDashboardOverview';
import { MemberAdministration } from '../components/MemberAdministration';
import { AdminAssignmentCenter } from '../components/AdminAssignmentCenter';
import { KtaManagementCenter } from '../components/KtaManagementCenter';
import { NationalRegionMaster } from '../components/NationalRegionMaster';
import { AuditAccountability } from '../components/AuditAccountability';
import { AdminActiveTab } from '../types/admin.types';

export const AdminPortalPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    loadMembers,
    members,
    membersLoading,
    membersError,
  } = useAdminStore();

  React.useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

  const TABS: {
    id: AdminActiveTab;
    label: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    {
      id: 'overview',
      label: 'Dashboard & Analitik',
      description: 'Ringkasan operasional, statistik, dan aktivitas nasional.',
      icon: LayoutDashboard,
    },
    {
      id: 'admin_assignment',
      label: 'Penunjukan Admin Berjenjang',
      description: 'Kelola mandat admin nasional hingga pangkalan.',
      icon: UserCheck,
      badge: '5 Tingkat',
    },
    {
      id: 'members',
      label: 'Administrasi Anggota',
      description: 'Verifikasi, pengesahan, dan pengelolaan data anggota.',
      icon: Users,
    },
    {
      id: 'kta',
      label: 'KTA Management Center',
      description: 'Penerbitan, regenerasi, QR, dan template KTA.',
      icon: CreditCard,
    },
    {
      id: 'regions',
      label: 'Master Wilayah Nasional',
      description: 'Referensi provinsi, kabupaten/kota, dan kecamatan.',
      icon: Globe,
    },
    {
      id: 'audit',
      label: 'Audit & Akuntabilitas',
      description: 'Jejak perubahan dan aktivitas administratif.',
      icon: History,
    },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Scope Management */}
      <AdminScopeBar />

      {/* 2. Main Navigation - Card Grid (tanpa horizontal scroll) */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                aria-pressed={isActive}
                className={`relative w-full min-h-[118px] rounded-2xl border-2 p-4 text-left transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0066B3] border-[#0066B3] text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs hover:border-[#0066B3]/40 hover:shadow-md'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-blue-50 text-[#0066B3]'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-extrabold text-sm leading-5">
                        {tab.label}
                      </span>

                      {tab.badge && (
                        <span
                          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {tab.badge}
                        </span>
                      )}
                    </div>

                    <p
                      className={`mt-1.5 text-xs leading-5 ${
                        isActive ? 'text-blue-50' : 'text-slate-500'
                      }`}
                    >
                      {tab.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Status sinkronisasi GAS: tidak memakai fallback dummy/local browser */}
        <div
          className={`rounded-xl border px-3.5 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 ${
            membersError
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          <div className="font-semibold">
            {membersLoading
              ? 'Mengambil data anggota dari GAS...'
              : membersError
              ? `GAS gagal dimuat: ${membersError}`
              : `GAS terhubung • ${members.length} anggota dimuat`}
          </div>

          <button
            type="button"
            onClick={() => void loadMembers()}
            disabled={membersLoading}
            className="rounded-lg border border-current/20 bg-white px-3 py-1.5 font-bold disabled:opacity-50"
          >
            {membersLoading ? 'Memuat...' : 'Muat Ulang GAS'}
          </button>
        </div>
      </div>

      {/* 3. Active Module Content */}
      <div className="transition-all duration-200">
        {activeTab === 'overview' && <AdminDashboardOverview />}
        {activeTab === 'admin_assignment' && <AdminAssignmentCenter />}
        {activeTab === 'members' && <MemberAdministration />}
        {activeTab === 'kta' && <KtaManagementCenter />}
        {activeTab === 'regions' && <NationalRegionMaster />}
        {activeTab === 'audit' && <AuditAccountability />}
      </div>
    </div>
  );
};
