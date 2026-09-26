/**
 * SPWN Apps 2.0 - Admin Pending Member Approval Workflow Component
 * Location: src/features/admin/components/PendingMemberTable.tsx
 * -----------------------------------------------------------------
 * Mengintegrasikan Admin Approval Workflow ke Google Apps Script:
 * 1. admin.member.pending  - Fetch antrean anggota pending
 * 2. admin.member.review   - PENDING -> REVIEWED_VERIFIED
 * 3. admin.member.activate - REVIEWED_VERIFIED -> ACTIVE
 * 4. admin.member.reject   - Penolakan berkas / keanggotaan
 * 5. admin.kta.generate    - ACTIVE -> KTA_GENERATED
 * 
 * SIKLUS ALUR STATUS:
 * PENDING -> REVIEWED_VERIFIED -> ACTIVE -> KTA_GENERATED
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Eye,
  Check,
  X,
  FileText,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  QrCode,
  Search,
  Filter,
} from 'lucide-react';
import { memberApi } from '../../../services/api/member.api';
import { useUIStore } from '../../../stores/uiStore';
import { useAdminStore } from '../stores/adminStore';

export interface PendingMemberItem {
  id: string;
  no_kta?: string;
  nomor_kta?: string;
  full_name?: string;
  nama_lengkap?: string;
  nama?: string;
  email: string;
  phone?: string;
  telepon?: string;
  nomor_telepon?: string;
  province?: string;
  provinsi_nama?: string;
  provinsi?: string;
  city?: string;
  kabupaten_nama?: string;
  kabupaten_kota?: string;
  district?: string;
  kecamatan_nama?: string;
  krida?: string;
  krida_nama?: string;
  krida_id?: string;
  position?: string;
  status?: string;
  status_anggota?: string;
  photo_url?: string;
  foto_url?: string;
  registered_at?: string;
  created_at?: string;
  qr_token?: string;
}

export const PendingMemberTable: React.FC = () => {
  const { addToast } = useUIStore();
  const { loadMembers } = useAdminStore();

  const [membersList, setMembersList] = useState<PendingMemberItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modal dialog konfirmasi action
  const [activeModal, setActiveModal] = useState<{
    member: PendingMemberItem;
    actionType: 'REVIEW' | 'ACTIVATE' | 'REJECT' | 'GENERATE_KTA';
    notes: string;
  } | null>(null);

  /**
   * Action 1: admin.member.pending
   * Mengambil data antrean real dari Google Apps Script
   */
  const fetchPendingMembers = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await memberApi.getPendingMembers();
      const rawData = response.data || (response as any).members || [];

      if (Array.isArray(rawData)) {
        setMembersList(rawData);
      } else {
        setMembersList([]);
      }
    } catch (err: any) {
      const msg = err?.message || 'Gagal memuat daftar anggota pending dari server.';
      setErrorMsg(msg);
      addToast({
        type: 'error',
        title: 'Gagal Memuat Antrean',
        message: msg,
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchPendingMembers();
  }, [fetchPendingMembers]);

  /**
   * Helper normalisasi data anggota
   */
  const getName = (m: PendingMemberItem) => m.full_name || m.nama_lengkap || m.nama || 'Tanpa Nama';
  const getPhone = (m: PendingMemberItem) => m.phone || m.telepon || m.nomor_telepon || '-';
  const getProvince = (m: PendingMemberItem) => m.province || m.provinsi_nama || m.provinsi || '-';
  const getCity = (m: PendingMemberItem) => m.city || m.kabupaten_nama || m.kabupaten_kota || '-';
  const getKrida = (m: PendingMemberItem) => m.krida || m.krida_nama || 'Bina Wisata';
  const getPhoto = (m: PendingMemberItem) => m.photo_url || m.foto_url || '';
  const getKtaNumber = (m: PendingMemberItem) => m.nomor_kta || m.no_kta || '';

  const getEffectiveStatus = (m: PendingMemberItem): 'PENDING' | 'REVIEWED_VERIFIED' | 'ACTIVE' | 'KTA_GENERATED' | string => {
    const raw = (m.status || m.status_anggota || 'PENDING').toUpperCase();
    const hasKta = Boolean(getKtaNumber(m));

    if (raw === 'KTA_GENERATED' || hasKta) {
      return 'KTA_GENERATED';
    }
    if (raw === 'ACTIVE') {
      return 'ACTIVE';
    }
    if (raw === 'REVIEWED_VERIFIED' || raw === 'REVIEWED') {
      return 'REVIEWED_VERIFIED';
    }
    return raw;
  };

  /**
   * Eksekusi Action Workflow melalui Google Apps Script:
   * 2. admin.member.review
   * 3. admin.member.activate
   * 4. admin.member.reject
   * 5. admin.kta.generate
   */
  const handleExecuteAction = async () => {
    if (!activeModal) return;

    const { member, actionType, notes } = activeModal;
    const memberId = member.id;
    setProcessingId(memberId);

    try {
      if (actionType === 'REVIEW') {
        // PENDING -> REVIEWED_VERIFIED
        const res = await memberApi.reviewMember(
          memberId,
          'REVIEWED_VERIFIED',
          notes || 'Berkas telah ditinjau dan diverifikasi wilayah'
        );
        addToast({
          type: 'success',
          title: 'Review Berhasil',
          message: res.message || `Berkas ${getName(member)} berhasil direview & diverifikasi.`,
        });
      } else if (actionType === 'ACTIVATE') {
        // REVIEWED_VERIFIED -> ACTIVE
        const res = await memberApi.activateMember(
          memberId,
          notes || 'Aktivasi resmi keanggotaan SAKA Pariwisata'
        );
        addToast({
          type: 'success',
          title: 'Aktivasi Berhasil',
          message: res.message || `Anggota ${getName(member)} berhasil diaktivasi (Status: ACTIVE).`,
        });
      } else if (actionType === 'REJECT') {
        // REJECT
        const res = await memberApi.rejectMember(
          memberId,
          notes || 'Berkas pendaftaran belum memenuhi syarat'
        );
        addToast({
          type: 'info',
          title: 'Pendaftaran Ditolak',
          message: res.message || `Pendaftaran ${getName(member)} telah ditolak.`,
        });
      } else if (actionType === 'GENERATE_KTA') {
        // ACTIVE -> KTA_GENERATED
        const res = await memberApi.generateKta(
          memberId,
          notes || 'Penerbitan KTA Digital & QR Token resmi'
        );
        const ktaNo = res.data?.nomorKta || res.data?.nomor_kta || 'KTA Digital';
        addToast({
          type: 'success',
          title: 'KTA Berhasil Diterbitkan',
          message: res.message || `KTA resmi berhasil digenerate: ${ktaNo}`,
        });
      }

      // Tutup modal
      setActiveModal(null);

      // Refresh data member dari GAS
      await fetchPendingMembers();

      // Sinkronkan juga store admin utama jika tersedia
      try {
        await loadMembers();
      } catch {
        // non-blocking
      }
    } catch (err: any) {
      const errMsg = err?.message || 'Gagal memproses aksi keanggotaan pada server.';
      addToast({
        type: 'error',
        title: 'Aksi Gagal',
        message: errMsg,
      });
    } finally {
      setProcessingId(null);
    }
  };

  /**
   * Filter antrean anggota
   */
  const filteredMembers = membersList.filter((m) => {
    const q = searchFilter.trim().toLowerCase();
    const status = getEffectiveStatus(m);

    // Status filter
    if (statusFilter !== 'ALL' && status !== statusFilter) {
      return false;
    }

    // Search filter
    if (q) {
      const name = getName(m).toLowerCase();
      const email = (m.email || '').toLowerCase();
      const phone = getPhone(m).toLowerCase();
      const prov = getProvince(m).toLowerCase();
      const city = getCity(m).toLowerCase();
      const krida = getKrida(m).toLowerCase();
      const kta = getKtaNumber(m).toLowerCase();

      return (
        name.includes(q) ||
        email.includes(q) ||
        phone.includes(q) ||
        prov.includes(q) ||
        city.includes(q) ||
        krida.includes(q) ||
        kta.includes(q) ||
        m.id.toLowerCase().includes(q)
      );
    }

    return true;
  });

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Header Panel */}
      <div className="p-5 sm:p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-blue-50/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0066B3]/10 text-[#0066B3] border border-[#0066B3]/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Live Approval Pipeline
              </span>
              <span className="text-xs text-slate-500 font-medium">Google Apps Script API</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight mt-1 flex items-center gap-2">
              Tabel Antrean Pending & Approval Anggota
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kelola alur persetujuan keanggotaan bertahap:
              <span className="font-bold text-amber-600 ml-1">PENDING</span> →
              <span className="font-bold text-blue-600 ml-1">REVIEWED_VERIFIED</span> →
              <span className="font-bold text-emerald-600 ml-1">ACTIVE</span> →
              <span className="font-bold text-purple-600 ml-1">KTA_GENERATED</span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={fetchPendingMembers}
              disabled={isLoading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:text-[#0066B3] transition-all shadow-2xs cursor-pointer disabled:opacity-50"
              title="Refresh antrean dari Google Spreadsheet"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#0066B3]' : ''}`} />
              <span>{isLoading ? 'Memuat...' : 'Refresh Antrean'}</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Cari nama, email, nomor HP, atau kota..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3]"
            />
            {searchFilter && (
              <button
                type="button"
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Status:
            </span>
            {[
              { id: 'ALL', label: 'Semua Status' },
              { id: 'PENDING', label: 'Pending' },
              { id: 'REVIEWED_VERIFIED', label: 'Reviewed' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'KTA_GENERATED', label: 'KTA Terbit' },
            ].map((btn) => (
              <button
                key={btn.id}
                type="button"
                onClick={() => setStatusFilter(btn.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                  statusFilter === btn.id
                    ? 'bg-[#0066B3] text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error state */}
      {errorMsg && (
        <div className="p-4 bg-rose-50 border-b border-rose-200 text-xs text-rose-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={fetchPendingMembers}
            className="font-bold underline hover:text-rose-950 ml-4 cursor-pointer"
          >
            Coba Lagi
          </button>
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-4 w-14">Foto</th>
              <th className="py-3 px-4">Nama</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Provinsi</th>
              <th className="py-3 px-4">Kota</th>
              <th className="py-3 px-4">Krida</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-center min-w-[200px]">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {isLoading ? (
              // Loading Skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-4 px-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200" />
                  </td>
                  <td className="py-4 px-4">
                    <div className="h-3.5 bg-slate-200 rounded w-28 mb-1" />
                    <div className="h-2.5 bg-slate-100 rounded w-16" />
                  </td>
                  <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-24" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-3 bg-slate-200 rounded w-20" /></td>
                  <td className="py-4 px-4"><div className="h-5 bg-slate-200 rounded-full w-16" /></td>
                  <td className="py-4 px-4 text-center"><div className="h-7 bg-slate-200 rounded-lg w-24 mx-auto" /></td>
                </tr>
              ))
            ) : filteredMembers.length === 0 ? (
              // Empty State
              <tr>
                <td colSpan={9} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center">
                    <Users className="w-10 h-10 text-slate-300 mb-2 stroke-1" />
                    <p className="font-bold text-slate-700">Tidak ada antrean anggota yang ditemukan</p>
                    <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                      {statusFilter !== 'ALL'
                        ? `Tidak ada data dengan status [ ${statusFilter} ].`
                        : 'Belum ada data pendaftaran anggota di Google Apps Script.'}
                    </p>
                    {statusFilter !== 'ALL' && (
                      <button
                        type="button"
                        onClick={() => setStatusFilter('ALL')}
                        className="mt-3 text-xs font-bold text-[#0066B3] hover:underline"
                      >
                        Reset Filter Status
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              // List Members
              filteredMembers.map((member) => {
                const effectiveStatus = getEffectiveStatus(member);
                const isItemProcessing = processingId === member.id;
                const photoSrc = getPhoto(member);
                const ktaNum = getKtaNumber(member);

                return (
                  <tr
                    key={member.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    {/* 1. Foto */}
                    <td className="py-3.5 px-4">
                      {photoSrc ? (
                        <img
                          src={photoSrc}
                          alt={getName(member)}
                          className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                          referrerPolicy="no-referrer"
                          onError={(e) => {
                            // Fallback jika Google Drive link tidak bisa diload
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-500 font-bold flex items-center justify-center text-xs shadow-2xs">
                          {getName(member).charAt(0).toUpperCase()}
                        </div>
                      )}
                    </td>

                    {/* 2. Nama */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 leading-tight">
                        {getName(member)}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                        {member.id}
                      </div>
                    </td>

                    {/* 3. Email */}
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-600">
                      {member.email || '-'}
                    </td>

                    {/* 4. Phone */}
                    <td className="py-3.5 px-4 text-slate-700 font-mono text-[11px]">
                      {getPhone(member)}
                    </td>

                    {/* 5. Provinsi */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {getProvince(member)}
                    </td>

                    {/* 6. Kota */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {getCity(member)}
                    </td>

                    {/* 7. Krida */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-50 text-[#0066B3] border border-blue-200/60">
                        {getKrida(member)}
                      </span>
                    </td>

                    {/* 8. Status */}
                    <td className="py-3.5 px-4">
                      {effectiveStatus === 'PENDING' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                          <Clock className="w-3 h-3 text-amber-600" />
                          PENDING
                        </span>
                      )}
                      {effectiveStatus === 'REVIEWED_VERIFIED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-[#0066B3] border border-blue-300">
                          <CheckCircle2 className="w-3 h-3 text-[#0066B3]" />
                          REVIEWED_VERIFIED
                        </span>
                      )}
                      {effectiveStatus === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                          <Check className="w-3 h-3 text-emerald-600" />
                          ACTIVE
                        </span>
                      )}
                      {effectiveStatus === 'KTA_GENERATED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-300">
                          <CreditCard className="w-3 h-3 text-purple-600" />
                          KTA_GENERATED
                        </span>
                      )}
                      {!['PENDING', 'REVIEWED_VERIFIED', 'ACTIVE', 'KTA_GENERATED'].includes(effectiveStatus) && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                          {effectiveStatus}
                        </span>
                      )}
                    </td>

                    {/* 9. Action Buttons */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5 flex-wrap">
                        {/* Mapping 1: PENDING -> Tampilkan tombol Review (& Reject) */}
                        {effectiveStatus === 'PENDING' && (
                          <>
                            <button
                              type="button"
                              disabled={isItemProcessing}
                              onClick={() =>
                                setActiveModal({
                                  member,
                                  actionType: 'REVIEW',
                                  notes: 'Berkas telah ditinjau dan diverifikasi wilayah',
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#0066B3] hover:bg-[#004C85] transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Review</span>
                            </button>
                            <button
                              type="button"
                              disabled={isItemProcessing}
                              onClick={() =>
                                setActiveModal({
                                  member,
                                  actionType: 'REJECT',
                                  notes: 'Berkas belum memenuhi syarat',
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Mapping 2: REVIEWED_VERIFIED -> Tampilkan tombol Activate (& Reject) */}
                        {effectiveStatus === 'REVIEWED_VERIFIED' && (
                          <>
                            <button
                              type="button"
                              disabled={isItemProcessing}
                              onClick={() =>
                                setActiveModal({
                                  member,
                                  actionType: 'ACTIVATE',
                                  notes: 'Aktivasi resmi keanggotaan SAKA Pariwisata',
                                })
                              }
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Activate</span>
                            </button>
                            <button
                              type="button"
                              disabled={isItemProcessing}
                              onClick={() =>
                                setActiveModal({
                                  member,
                                  actionType: 'REJECT',
                                  notes: 'Pengajuan ditolak setelah peninjauan berkas',
                                })
                              }
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-all cursor-pointer disabled:opacity-50"
                            >
                              <X className="w-3 h-3" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {/* Mapping 3: ACTIVE -> Tampilkan tombol Generate KTA */}
                        {effectiveStatus === 'ACTIVE' && (
                          <button
                            type="button"
                            disabled={isItemProcessing}
                            onClick={() =>
                              setActiveModal({
                                member,
                                actionType: 'GENERATE_KTA',
                                notes: 'Penerbitan KTA Digital & QR Token resmi',
                              })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Generate KTA</span>
                          </button>
                        )}

                        {/* Mapping 4: KTA_GENERATED -> Tampilkan informasi KTA */}
                        {effectiveStatus === 'KTA_GENERATED' && (
                          <div className="inline-flex flex-col items-center bg-purple-50/80 border border-purple-200/80 rounded-lg px-2.5 py-1">
                            <span className="text-[10px] font-bold text-purple-900 font-mono tracking-tight flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              {ktaNum || 'KTA Terbit'}
                            </span>
                            <span className="text-[9px] text-purple-600 font-medium">
                              QR Valid Active
                            </span>
                          </div>
                        )}

                        {isItemProcessing && (
                          <span className="text-[10px] text-slate-400 animate-pulse ml-1">
                            Memproses...
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="p-4 bg-slate-50/60 border-t border-slate-100 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            Menampilkan <span className="font-bold text-slate-700">{filteredMembers.length}</span> dari{' '}
            <span className="font-bold text-slate-700">{membersList.length}</span> antrean keanggotaan
          </span>
        </div>
        <div className="text-[11px] text-slate-400">
          Sinkronisasi langsung dengan endpoint Google Apps Script
        </div>
      </div>

      {/* Confirmation Modal */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                {activeModal.actionType === 'REVIEW' && (
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-[#0066B3] flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                )}
                {activeModal.actionType === 'ACTIVATE' && (
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Check className="w-4 h-4" />
                  </div>
                )}
                {activeModal.actionType === 'REJECT' && (
                  <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                    <XCircle className="w-4 h-4" />
                  </div>
                )}
                {activeModal.actionType === 'GENERATE_KTA' && (
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                    <CreditCard className="w-4 h-4" />
                  </div>
                )}
                <h3 className="text-sm font-black text-slate-900">
                  {activeModal.actionType === 'REVIEW' && 'Konfirmasi Review Berkas'}
                  {activeModal.actionType === 'ACTIVATE' && 'Konfirmasi Aktivasi Anggota'}
                  {activeModal.actionType === 'REJECT' && 'Konfirmasi Penolakan Pendaftaran'}
                  {activeModal.actionType === 'GENERATE_KTA' && 'Konfirmasi Penerbitan KTA'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1">
                <div className="font-bold text-slate-900">{getName(activeModal.member)}</div>
                <div className="text-slate-500 text-[11px]">Email: {activeModal.member.email}</div>
                <div className="text-slate-500 text-[11px]">
                  Wilayah: {getProvince(activeModal.member)} - {getCity(activeModal.member)}
                </div>
                <div className="text-slate-500 text-[11px]">Krida: {getKrida(activeModal.member)}</div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Catatan / Keterangan Eksekusi (Opsional):
                </label>
                <textarea
                  value={activeModal.notes}
                  onChange={(e) =>
                    setActiveModal({
                      ...activeModal,
                      notes: e.target.value,
                    })
                  }
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3]"
                  placeholder="Tambahkan catatan audit internal..."
                />
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                {activeModal.actionType === 'REVIEW' &&
                  'Aksi ini memanggil API [admin.member.review] dan mengubah status keanggotaan menjadi REVIEWED_VERIFIED.'}
                {activeModal.actionType === 'ACTIVATE' &&
                  'Aksi ini memanggil API [admin.member.activate], mengubah status menjadi ACTIVE, dan mengaktifkan akun login.'}
                {activeModal.actionType === 'REJECT' &&
                  'Aksi ini memanggil API [admin.member.reject] untuk menolak berkas pendaftaran anggota.'}
                {activeModal.actionType === 'GENERATE_KTA' &&
                  'Aksi ini memanggil API [admin.kta.generate] untuk menerbitkan Nomor KTA dan Dynamic QR Token ke spreadsheet.'}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                disabled={Boolean(processingId)}
                className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                  activeModal.actionType === 'REVIEW'
                    ? 'bg-[#0066B3] hover:bg-[#004C85]'
                    : activeModal.actionType === 'ACTIVATE'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : activeModal.actionType === 'REJECT'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : 'bg-purple-700 hover:bg-purple-800'
                }`}
              >
                {processingId ? 'Memproses...' : 'Ya, Eksekusi Sekarang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
