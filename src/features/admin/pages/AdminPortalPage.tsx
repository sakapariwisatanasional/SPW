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
  const { activeTab, setActiveTab, simulatedScope } = useAdminStore();

  const TABS: { id: AdminActiveTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Dashboard & Analitik', icon: LayoutDashboard },
    { id: 'admin_assignment', label: 'Penunjukan Admin Berjenjang', icon: UserCheck },
    { id: 'members', label: 'Administrasi Anggota', icon: Users },
    { id: 'kta', label: 'KTA Management Center', icon: CreditCard },
    { id: 'regions', label: 'Master Wilayah Nasional', icon: Globe },
    { id: 'audit', label: 'Audit & Akuntabilitas', icon: History },
  ];

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. Header & Scope Management */}
      <AdminScopeBar />

      {/* 2. Main Navigation Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1.5 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1 min-w-max">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-[#0066B3] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.id === 'admin_assignment' && (
                  <span className="bg-purple-100 text-purple-800 text-[10px] px-1.5 py-0.2 rounded font-semibold ml-0.5">
                    5 Tingkat
                  </span>
                )}
              </button>
            );
          })}
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
