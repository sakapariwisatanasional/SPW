/**
 * SPWN Apps 2.0 - Admin Command Center (Module 1 Upgrade)
 * Location: src/features/admin/components/AdminDashboardOverview.tsx
 * -----------------------------------------------------------------
 * Pusat Komando Operasional Administrator SPWN Apps 2.0:
 * 1. Global Search Admin (Nama Anggota, Nomor KTA, Wilayah)
 * 2. Operational Cards (Status Siklus 4-Tahap & Integritas Wilayah)
 * 3. Quick Action Panel (Akses Pintas Approval, KTA, & Delegasi)
 * 4. Wilayah Monitoring (Sebaran Kwarda, Kwarcab, & 4 Krida Saka)
 * 5. Activity Timeline (Unified Realtime Audit Feed)
 */

import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  CreditCard,
  Compass,
  Utensils,
  Map,
  Smile,
  ChevronRight,
  TrendingUp,
  Award,
  AlertCircle,
  Search,
  Zap,
  Activity,
  ShieldCheck,
  Globe2,
  Filter,
  Eye,
  FileCheck2,
  ArrowUpRight,
  RefreshCw,
  X,
  History,
  KeyRound,
  FileText,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { KRIDA_MASTER } from '../../../config/constants';
import { AdminMemberRecord } from '../types/admin.types';

export const AdminDashboardOverview: React.FC = () => {
  const {
    members,
    ktaLogs,
    approvals,
    changeHistory,
    simulatedScope,
    scopeProvinceId,
    scopeProvinceName,
    scopeRegencyId,
    scopeRegencyName,
    setActiveTab,
    setSelectedMemberId,
  } = useAdminStore();

  // Global Search Admin State
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'APPROVAL' | 'KTA' | 'AUDIT'>('ALL');

  // Filter members based on regional scope
  const scopedMembers = useMemo(() => {
    return members.filter((m) => {
      if (simulatedScope === 'ADMIN_WILAYAH') {
        if (scopeProvinceId !== 'ALL' && m.provinsi_id !== scopeProvinceId) return false;
        if (scopeRegencyId !== 'ALL' && m.kabupaten_id !== scopeRegencyId) return false;
      }
      return true;
    });
  }, [members, simulatedScope, scopeProvinceId, scopeRegencyId]);

  // Operational Metrics
  const totalCount = scopedMembers.length;
  const pendingVerificationCount = scopedMembers.filter((m) => m.status_anggota === 'PENDING').length;
  const reviewedReadyCount = scopedMembers.filter((m) => m.status_anggota === 'REVIEWED_VERIFIED').length;
  const activeMembersCount = scopedMembers.filter((m) => m.status_anggota === 'ACTIVE').length;
  const activeKtaCount = scopedMembers.filter(
    (m) => (m.status_anggota === 'ACTIVE' || m.kta_status === 'ACTIVE') && Boolean(m.nomor_kta)
  ).length;

  // Global Search Admin Results (Nama, Nomor KTA, Wilayah)
  const searchResults = useMemo(() => {
    const q = globalSearchQuery.trim().toLowerCase();
    if (!q || q.length < 2) return [];

    return scopedMembers.filter((m) => {
      const matchName = m.nama_lengkap.toLowerCase().includes(q);
      const matchKta = (m.nomor_kta || '').toLowerCase().includes(q);
      const matchProv = (m.provinsi_nama || '').toLowerCase().includes(q);
      const matchKab = (m.kabupaten_nama || '').toLowerCase().includes(q);
      const matchKec = (m.wilayah_kecamatan_nama || m.kwartir_ranting || '').toLowerCase().includes(q);
      const matchGudep = (m.pangkalan_gudep || '').toLowerCase().includes(q);
      const matchId = m.id.toLowerCase().includes(q);

      return matchName || matchKta || matchProv || matchKab || matchKec || matchGudep || matchId;
    }).slice(0, 6);
  }, [scopedMembers, globalSearchQuery]);

  // Krida distribution
  const kridaCounts = useMemo(() => {
    return KRIDA_MASTER.map((k) => {
      const count = scopedMembers.filter((m) => m.krida_id === k.id).length;
      const percentage = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
      return { ...k, count, percentage };
    });
  }, [scopedMembers, totalCount]);

  // Sebaran Wilayah / Kwarda Ranking
  const provinceCounts = useMemo(() => {
    const map: Record<string, { name: string; count: number; activeKta: number }> = {};
    scopedMembers.forEach((m) => {
      const pName = m.provinsi_nama || 'Provinsi Lainnya';
      if (!map[pName]) {
        map[pName] = { name: pName, count: 0, activeKta: 0 };
      }
      map[pName].count += 1;
      if (m.nomor_kta) {
        map[pName].activeKta += 1;
      }
    });
    return Object.values(map).sort((a, b) => b.count - a.count);
  }, [scopedMembers]);

  // Unified Activity Timeline Feed
  const unifiedTimeline = useMemo(() => {
    interface TimelineItem {
      id: string;
      category: 'APPROVAL' | 'KTA' | 'AUDIT';
      title: string;
      desc: string;
      actor: string;
      role: string;
      timestamp: string;
      badgeColor: string;
      targetMemberId?: string;
    }

    const items: TimelineItem[] = [];

    // 1. Approvals
    approvals.forEach((app) => {
      items.push({
        id: app.id,
        category: 'APPROVAL',
        title: app.step_name === 'VERIFIKASI_BERKAS_WILAYAH'
          ? 'Verifikasi Berkas Wilayah'
          : app.step_name === 'FINAL_APPROVAL_PUSAT'
          ? 'Final Approval Kwarnas'
          : 'Revisi / Penolakan Berkas',
        desc: `${app.decision}: ${app.notes}`,
        actor: app.reviewer_id,
        role: app.reviewer_role,
        timestamp: app.reviewed_at,
        badgeColor: app.decision === 'APPROVED' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
        targetMemberId: app.member_id,
      });
    });

    // 2. KTA Logs
    ktaLogs.forEach((klog) => {
      items.push({
        id: klog.id,
        category: 'KTA',
        title: klog.action_type === 'INITIAL_ISSUE' ? 'Penerbitan KTA Perdana' : 'Peremajaan / Regenerasi KTA',
        desc: `No. KTA: ${klog.nomor_kta} • Alasan: ${klog.reason}`,
        actor: klog.generated_by,
        role: 'Admin KTA',
        timestamp: klog.generated_at,
        badgeColor: 'bg-blue-100 text-[#0066B3]',
        targetMemberId: klog.member_id,
      });
    });

    // 3. Change History / Audits
    changeHistory.forEach((hist) => {
      items.push({
        id: hist.id,
        category: 'AUDIT',
        title: `Koreksi Data: ${hist.field_name}`,
        desc: `${hist.old_value} ➔ ${hist.new_value} (${hist.reason})`,
        actor: hist.actor_id,
        role: hist.actor_role,
        timestamp: hist.timestamp,
        badgeColor: 'bg-purple-100 text-purple-800',
        targetMemberId: hist.member_id,
      });
    });

    // Sort by timestamp descending
    return items
      .filter((item) => (timelineFilter === 'ALL' ? true : item.category === timelineFilter))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 8);
  }, [approvals, ktaLogs, changeHistory, timelineFilter]);

  const handleOpenMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    setActiveTab('members');
  };

  return (
    <div className="space-y-6">
      {/* ========================================================================= */}
      {/* 1. COMMAND CENTER HEADER & GLOBAL SEARCH ADMIN                            */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#004C85] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#0066B3]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#009B4D]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Command Center
              </span>
              <span className="text-xs text-slate-300 font-medium">SPWN Apps 2.0 Enterprise</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
              Pusat Kendali Administrasi Nasional
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Monitoring real-time keanggotaan SAKA Pariwisata, orkestrasi siklus verifikasi 4-tahap,
              dan akuntabilitas penerbitan KTA Digital resmi di seluruh kwartir.
            </p>
          </div>

          {/* Scope Badge Summary */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 text-xs shrink-0 sm:min-w-[240px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
              Otoritas Terpasang
            </span>
            <p className="text-sm font-bold text-white mt-0.5">
              {simulatedScope === 'SUPER_ADMIN'
                ? 'Super Administrator'
                : simulatedScope === 'ADMIN_PUSAT'
                ? 'Admin Kwartir Nasional'
                : 'Admin Kwartir Wilayah'}
            </p>
            <p className="text-[11px] text-emerald-300 font-medium mt-1 truncate">
              Wilayah: {scopeProvinceName}
            </p>
          </div>
        </div>

        {/* Global Search Admin Input */}
        <div className="relative z-10 mt-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={globalSearchQuery}
              onChange={(e) => setGlobalSearchQuery(e.target.value)}
              placeholder="Pencarian Global Admin: Masukkan Nama Anggota, Nomor KTA (e.g. 00.000001), atau Wilayah/Gudep..."
              className="w-full pl-12 pr-10 py-3.5 bg-white/15 hover:bg-white/20 focus:bg-white text-slate-100 focus:text-slate-900 placeholder-slate-300 focus:placeholder-slate-400 rounded-2xl text-xs sm:text-sm border border-white/20 focus:border-white focus:ring-4 focus:ring-[#0066B3]/40 outline-none transition-all shadow-inner"
            />
            {globalSearchQuery && (
              <button
                type="button"
                onClick={() => setGlobalSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white p-1 rounded-full hover:bg-white/10"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Search Instant Results Dropdown */}
          {globalSearchQuery.trim().length >= 2 && (
            <div className="mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden text-xs divide-y divide-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="p-3 bg-slate-50 flex items-center justify-between font-bold text-slate-600">
                <span>Hasil Pencarian Global ({searchResults.length} ditemukan)</span>
                <span className="text-[11px] text-[#0066B3]">Klik untuk membuka Drawer Anggota</span>
              </div>

              {searchResults.length === 0 ? (
                <div className="p-6 text-center text-slate-400">
                  Tidak ada anggota yang cocok dengan kata kunci "{globalSearchQuery}".
                </div>
              ) : (
                searchResults.map((m) => (
                  <div
                    key={m.id}
                    onClick={() => handleOpenMember(m.id)}
                    className="p-3.5 hover:bg-blue-50/50 cursor-pointer flex items-center justify-between gap-4 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={m.foto_url}
                        alt={m.nama_lengkap}
                        className="w-10 h-12 object-cover rounded-lg border border-slate-200 shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 truncate">{m.nama_lengkap}</h4>
                          <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {m.id}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[11px] mt-0.5 truncate">
                          {m.nomor_kta ? (
                            <span className="text-[#0066B3] font-bold font-mono mr-2">KTA: {m.nomor_kta}</span>
                          ) : (
                            <span className="text-amber-600 font-medium mr-2">Belum Terbit KTA</span>
                          )}
                          <span>• {m.provinsi_nama} ({m.kabupaten_nama})</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status_anggota === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status_anggota === 'REVIEWED_VERIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {m.status_anggota}
                      </span>
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-[#0066B3] text-white hover:bg-blue-700"
                        title="Buka Drawer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. OPERATIONAL CARDS GRID (STATE MACHINE & INTEGRITY)                    */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Anggota */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-[#0066B3]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Basis Data</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center shadow-2xs">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {totalCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">jiwa</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between">
            <span>Sesuai Scope Wilayah</span>
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full text-[10px]">
              Active DB
            </span>
          </div>
        </div>

        {/* Card 2: Menunggu Verifikasi Wilayah (PENDING) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Menunggu Verifikasi Wilayah</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-2xs relative">
              <Clock className="w-5 h-5" />
              {pendingVerificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white animate-pulse" />
              )}
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
              {pendingVerificationCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">berkas</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className="mt-2 text-xs text-amber-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Buka Antrean Wilayah <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Siap Final Approval Pusat (REVIEWED_VERIFIED) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-purple-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Siap Final Approval Pusat</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shadow-2xs">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-purple-700 tracking-tight">
              {reviewedReadyCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">anggota</span>
          </div>
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className="mt-2 text-xs text-purple-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
          >
            Review Berkas Pusat <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: KTA Digital & QR Aktif (KTA GENERATED) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">KTA Digital Resmi Terbit</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-[#009B4D] flex items-center justify-center shadow-2xs">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-[#009B4D] tracking-tight">
              {activeKtaCount}
            </span>
            <span className="text-xs text-slate-500 font-medium">kartu</span>
          </div>
          <div className="mt-2 text-xs text-emerald-800 font-medium flex items-center justify-between">
            <span>QR Signature Aktif</span>
            <span className="font-bold text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
              100% Valid
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. QUICK ACTION COMMAND BAR                                              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Quick Action Administrator
            </h3>
          </div>
          <span className="text-[11px] text-slate-500">Pintasan Operasional Langsung</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-3.5">
          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#0066B3] hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <Clock className="w-4 h-4 text-[#0066B3] group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-bold text-slate-800">Verifikasi Berkas</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Antrean Wilayah</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('kta')}
            className="p-3 rounded-xl border border-slate-200 hover:border-[#009B4D] hover:bg-emerald-50/40 text-left transition-all group cursor-pointer"
          >
            <CreditCard className="w-4 h-4 text-[#009B4D] group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-bold text-slate-800">Cetak KTA Massal</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Batch Generation</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('admin_assignment')}
            className="p-3 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/40 text-left transition-all group cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-purple-700 group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-bold text-slate-800">Delegasi Admin</p>
            <p className="text-[10px] text-slate-500 mt-0.5">5 Tingkat Kwartir</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('regions')}
            className="p-3 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/40 text-left transition-all group cursor-pointer"
          >
            <Globe2 className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-bold text-slate-800">Master Wilayah</p>
            <p className="text-[10px] text-slate-500 mt-0.5">38 Provinsi BPS</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className="p-3 rounded-xl border border-slate-200 hover:border-slate-400 hover:bg-slate-50 text-left transition-all group cursor-pointer"
          >
            <History className="w-4 h-4 text-slate-700 group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-bold text-slate-800">Audit Trail</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Rekam Jejak</p>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('members')}
            className="p-3 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-left transition-all group cursor-pointer"
          >
            <KeyRound className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform mb-2" />
            <p className="text-xs font-bold text-slate-800">Reset Kredensial</p>
            <p className="text-[10px] text-slate-500 mt-0.5">Otoritas Pusat</p>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. WILAYAH MONITORING & 4 KRIDA SPECIALIZATION                            */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Wilayah Monitoring (Ranking Kwarda / Kwarcab) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-[#0066B3]" />
                <h3 className="text-sm font-bold text-slate-900">Wilayah Monitoring & Sebaran Kwartir</h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitoring keaktifan anggota dan penetrasi KTA Digital per Kwarda
              </p>
            </div>
            <button
              type="button"
              onClick={() => setActiveTab('regions')}
              className="text-xs text-[#0066B3] font-bold hover:underline flex items-center gap-1"
            >
              Master Wilayah <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="mt-5 space-y-3.5">
            {provinceCounts.slice(0, 6).map((p, idx) => {
              const pct = totalCount > 0 ? Math.round((p.count / totalCount) * 100) : 0;
              const ktaRate = p.count > 0 ? Math.round((p.activeKta / p.count) * 100) : 0;
              return (
                <div key={p.name} className="p-3 bg-slate-50/70 hover:bg-slate-50 rounded-xl border border-slate-100 transition-colors">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <span className="w-5 h-5 rounded-full bg-blue-50 text-[#0066B3] font-bold flex items-center justify-center text-[10px] shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-bold text-slate-900 truncate">{p.name}</span>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-right">
                      <span className="text-slate-600 font-medium">
                        <strong>{p.count}</strong> anggota
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        {ktaRate}% KTA Terbit
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#0066B3] to-[#009B4D] h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Standar Kodifikasi Wilayah BPS (38 Provinsi)</span>
            <span className="text-emerald-700 font-bold">Sinkronisasi 100% Aktif</span>
          </div>
        </div>

        {/* Distribusi 4 Krida SAKA Pariwisata */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Distribusi Peminatan 4 Krida</h3>
                <p className="text-xs text-slate-500 mt-0.5">Spesialisasi keahlian pariwisata</p>
              </div>
              <span className="text-[10px] font-bold text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded-full">
                4 Krida Resmi
              </span>
            </div>

            <div className="mt-5 space-y-4">
              {kridaCounts.map((k) => (
                <div key={k.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-800 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: k.color }}
                      />
                      {k.name}
                    </span>
                    <span className="text-slate-600 font-bold">
                      {k.count} jiwa ({k.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${k.percentage}%`,
                        backgroundColor: k.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Syarat Kecakapan Khusus (23 SKK)</span>
            <button
              type="button"
              onClick={() => setActiveTab('members')}
              className="text-[#0066B3] font-bold hover:underline"
            >
              Lihat di Direktori &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. UNIFIED REALTIME ACTIVITY TIMELINE                                     */}
      {/* ========================================================================= */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              <h3 className="text-base font-bold text-white tracking-tight">
                Activity Timeline & Workflow Feed
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Rekam jejak real-time persetujuan berkas, penerbitan KTA, dan koreksi audit data
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700 text-xs self-start sm:self-auto">
            {(['ALL', 'APPROVAL', 'KTA', 'AUDIT'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setTimelineFilter(cat)}
                className={`px-3 py-1 rounded-lg font-bold transition-all ${
                  timelineFilter === cat
                    ? 'bg-[#0066B3] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {cat === 'ALL' ? 'Semua' : cat === 'APPROVAL' ? 'Persetujuan' : cat === 'KTA' ? 'KTA' : 'Koreksi'}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Items */}
        <div className="mt-5 space-y-3">
          {unifiedTimeline.length === 0 ? (
            <div className="py-8 text-center text-slate-500 text-xs">
              Belum ada aktivitas tercatat pada filter ini.
            </div>
          ) : (
            unifiedTimeline.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-slate-800/60 hover:bg-slate-800 rounded-2xl border border-slate-700/70 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 mt-0.5 ${item.badgeColor}`}>
                    {item.category}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white">{item.title}</h4>
                      {item.targetMemberId && (
                        <button
                          type="button"
                          onClick={() => handleOpenMember(item.targetMemberId!)}
                          className="font-mono text-[10px] text-blue-300 hover:underline bg-slate-700/60 px-1.5 py-0.2 rounded"
                        >
                          {item.targetMemberId}
                        </button>
                      )}
                    </div>
                    <p className="text-slate-300 text-[11px] mt-0.5 break-words">{item.desc}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 text-slate-400 text-[11px] shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                  <span>Oleh: <strong className="text-slate-200">{item.actor}</strong> ({item.role})</span>
                  <span>•</span>
                  <span>{new Date(item.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Mematuhi SOP Akuntabilitas Kepramukaan SPWN 2.0</span>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline flex items-center gap-1"
          >
            Buka Audit Log Lengkap &rarr;
          </button>
        </div>
      </div>
    </div>
  );
};
