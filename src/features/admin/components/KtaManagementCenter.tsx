/**
 * SPWN Apps 2.0 - KTA Management Center (Module 3)
 * Location: src/features/admin/components/KtaManagementCenter.tsx
 * -----------------------------------------------------------------
 * Mengintegrasikan KTA Lifecycle:
 * - Antrean Penerbitan KTA Otomatis
 * - Regenerate KTA dengan Izin Khusus & Audit Log Alasan Peremajaan
 * - KTA Batch Preview & Cetak Massal (MENGGUNAKAN LegacyKtaPreview TERISOLASI)
 * - Log Riwayat Penerbitan KTA (KTA_Generation_Log)
 */

import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Printer,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Eye,
  X,
  Lock,
  Layers,
  Sliders,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { AdminMemberRecord } from '../types/admin.types';
import { DigitalMemberCard } from './DigitalMemberCard';
import { LegacyKtaPreview, LegacyKtaMemberData } from '../../../components/display/LegacyKtaPreview';
import { KtaCardCustomizerModal } from './KtaCardCustomizerModal';
import { storage } from '../../../services/storage';
import { resolveProvinsiName, resolveKabupatenName, resolveKecamatanName } from '../../../services/wilayahService';
import { KtaMemberBindingData } from '../../../types/kta.types';
import { useUIStore } from '../../../stores/uiStore';

export const KtaManagementCenter: React.FC = () => {
  const { addToast } = useUIStore();
  const {
    members,
    ktaLogs,
    simulatedScope,
    scopeProvinceId,
    scopeRegencyId,
    activateMember,
    regenerateKta,
    batchGenerateKta,
  } = useAdminStore();

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'batch' | 'logs'>('queue');
  const [searchKta, setSearchKta] = useState('');

  // Selected member for single Preview (using LegacyKtaPreview)
  const [previewMember, setPreviewMember] = useState<AdminMemberRecord | null>(null);

  // Selected member for Regenerate KTA Modal
  const [regenMember, setRegenMember] = useState<AdminMemberRecord | null>(null);
  const [regenReason, setRegenReason] = useState('');
  const [regenAuthority, setRegenAuthority] = useState('Surat Keputusan Kwartir No. 04/SPWN/2026');
  const [regenError, setRegenError] = useState('');

  // Batch Print Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchPreviewOpen, setIsBatchPreviewOpen] = useState(false);

  // KTA Template Designer Modal
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);

  // Filter members based on regional scope
  const scopedMembers = useMemo(() => {
    return members.filter((m) => {
      if (simulatedScope === 'ADMIN_WILAYAH') {
        if (scopeProvinceId !== 'ALL' && m.provinsi_id !== scopeProvinceId) return false;
        if (scopeRegencyId !== 'ALL' && m.kabupaten_id !== scopeRegencyId) return false;
      }
      if (searchKta.trim()) {
        const q = searchKta.toLowerCase();
        const matchName = m.nama_lengkap.toLowerCase().includes(q);
        const matchKta = m.nomor_kta.toLowerCase().includes(q);
        const matchCity = m.kabupaten_nama.toLowerCase().includes(q);
        if (!matchName && !matchKta && !matchCity) return false;
      }
      return true;
    });
  }, [members, simulatedScope, scopeProvinceId, scopeRegencyId, searchKta]);

  // Antrean Otomatis (REVIEWED_VERIFIED siap terbit, atau ACTIVE tanpa No KTA)
  const autoIssueQueue = useMemo(() => {
    return scopedMembers.filter((m) => m.status_anggota === 'REVIEWED_VERIFIED' || (m.status_anggota === 'ACTIVE' && (!m.nomor_kta || m.kta_status !== 'ACTIVE')));
  }, [scopedMembers]);

  // Anggota aktif dengan KTA terbit
  const activeKtaMembers = useMemo(() => {
    return scopedMembers.filter((m) => m.status_anggota === 'ACTIVE' && Boolean(m.nomor_kta));
  }, [scopedMembers]);

  // Handle Regenerate Submit
  const handleRegenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regenMember) return;
    if (!regenReason.trim() || regenReason.trim().length < 5) {
      setRegenError('Alasan peremajaan KTA wajib diisi minimal 5 karakter!');
      return;
    }

    try {
      const res = regenerateKta(
        regenMember.id,
        `${regenReason} (Otoritas: ${regenAuthority})`,
        simulatedScope === 'SUPER_ADMIN' ? 'Super Administrator' : 'Admin Nasional'
      );
      addToast({
        type: 'success',
        title: 'KTA Berhasil Diregenerasi',
        message: `No. KTA Baru: ${res.nomorKta} dengan Token QR aktif.`,
      });
      setRegenMember(null);
      setRegenReason('');
      setRegenError('');
    } catch (err: any) {
      setRegenError(err.message || 'Gagal regenerasi KTA');
      addToast({
        type: 'error',
        title: 'Gagal Regenerasi KTA',
        message: err.message || 'Terjadi kendala saat regenerasi KTA.',
      });
    }
  };

  // Convert AdminMemberRecord to KtaMemberBindingData with dynamic district resolution
  const toBindingFormat = (m: AdminMemberRecord): KtaMemberBindingData => {
    const provName = resolveProvinsiName(m.provinsi_id) || m.provinsi_nama || 'Kwartir Nasional';
    const regName = resolveKabupatenName(m.kabupaten_id) || m.kabupaten_nama || 'Kabupaten Bogor';
    const distName =
      resolveKecamatanName(m.kecamatan_id || m.wilayah_kecamatan_id, m.kabupaten_id) ||
      m.wilayah_kecamatan_nama ||
      m.kwartir_ranting ||
      '';

    return {
      id: m.id,
      fullName: m.nama_lengkap,
      nationalMemberNumber: m.nomor_kta || '00.000000',
      membershipLevel: m.tingkat_keanggotaan,
      currentPosition: m.tingkat_keanggotaan,
      provinceName: provName,
      provinsi_id: m.provinsi_id,
      regencyName: regName,
      kabupaten_id: m.kabupaten_id,
      districtName: distName,
      kecamatan_id: m.kecamatan_id || m.wilayah_kecamatan_id,
      wilayah_kecamatan_id: m.wilayah_kecamatan_id,
      kwartirName: m.provinsi_nama ? `Kwarda ${provName}` : 'Kwartir Nasional',
      kwartirHierarchy: m.provinsi_nama ? `Kwarda ${provName} • Kwarcab ${regName}` : 'Kwartir Nasional Gerakan Pramuka',
      branchName: m.pangkalan_gudep || 'Pangkalan Saka Pariwisata',
      gugusDepan: m.pangkalan_gudep || 'Pangkalan Saka Pariwisata',
      krida: m.krida_nama || 'KRIDA PEMANDU',
      phone: m.nomor_telepon || '-',
      email: m.email || '-',
      joinYear: m.tanggal_bergabung ? String(m.tanggal_bergabung).substring(0, 4) : '2024',
      photoUrl: m.foto_url,
      qrToken: m.qr_token,
      qrUrl: m.qr_url,
      status: m.status_anggota,
    };
  };

  // Convert AdminMemberRecord to LegacyKtaMemberData (Fallback Locked)
  const toLegacyFormat = (m: AdminMemberRecord): LegacyKtaMemberData => ({
    fullName: m.nama_lengkap,
    noKta: m.nomor_kta || '00.000000',
    membershipLevel: m.tingkat_keanggotaan,
    kridaName: m.krida_nama || 'Krida SAKA Pariwisata',
    province: m.provinsi_nama,
    city: m.kabupaten_nama,
    joinedDate: m.tanggal_aktivasi || m.tanggal_bergabung,
    photoUrl: m.foto_url,
    verificationToken: m.qr_token || 'SPWN-QR-PREVIEW',
    status: m.status_anggota,
  });

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'queue'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Antrean Penerbitan KTA ({autoIssueQueue.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('batch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'batch'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            KTA Batch Preview & Cetak Massal ({activeKtaMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-[#009B4D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Log Riwayat Penerbitan ({ktaLogs.length})
          </button>

          {/* KTA Template Designer (Super Admin / Admin Pusat) */}
          {(simulatedScope === 'SUPER_ADMIN' || simulatedScope === 'ADMIN_PUSAT') && (
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Desain Template & Dynamic QR
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKta}
            onChange={(e) => setSearchKta(e.target.value)}
            placeholder="Cari nama atau No KTA..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ANTREAN PENERBITAN KTA OTOMATIS                            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#009B4D] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Antrean Penerbitan KTA Otomatis (Thread-Safe LockService)</p>
                <p className="text-emerald-700 mt-0.5">
                  Anggota berstatus <strong>APPROVED</strong> siap diaktivasi dengan penomoran resmi: 
                  <strong> 00.NNNNNN</strong> (Kwarnas) atau <strong>00.PPKK.CCC.NNNNNN</strong> (Wilayah).
                </p>
              </div>
            </div>

            {autoIssueQueue.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  batchGenerateKta(
                    autoIssueQueue.map((m) => m.id),
                    'Penerbitan Batch Otomatis',
                    'Admin SPWN'
                  );
                  addToast({
                    type: 'success',
                    title: 'Penerbitan KTA Massal Selesai',
                    message: `${autoIssueQueue.length} KTA resmi berhasil diterbitkan serentak.`,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs shrink-0 transition-all cursor-pointer"
              >
                Terbitkan Seluruhnya ({autoIssueQueue.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {autoIssueQueue.length === 0 ? (
              <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Tidak ada antrean penerbitan KTA. Semua anggota APPROVED telah memiliki KTA aktif.
              </div>
            ) : (
              autoIssueQueue.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Status: {m.status_anggota}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{m.nama_lengkap}</h4>
                      <p className="text-xs text-slate-500 font-mono">ID: {m.id}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{m.kabupaten_nama}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      Format KTA: <span className="font-mono font-bold text-[#0066B3]">
                        {m.level_organisasi === 'KWARTIR_NASIONAL' ? '00.NNNNNN (Nasional)' : '00.PP.KK.CCC.NNNNNN (Wilayah)'}
                      </span>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Peminatan: <strong>{m.krida_nama || m.krida_id}</strong>
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        const res = activateMember(m.id, 'Penerbitan KTA Resmi', 'Admin SPWN');
                        addToast({
                          type: 'success',
                          title: 'KTA Berhasil Diterbitkan',
                          message: `Nomor KTA: ${res.nomorKta} aktif dengan QR Token ${res.qrToken}.`,
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0066B3] hover:bg-[#004C85] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Terbitkan KTA Sekarang
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. KTA BATCH PREVIEW & CETAK MASSAL (LEGACY KTA PREVIEW)      */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'batch' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === activeKtaMembers.length && activeKtaMembers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(activeKtaMembers.map((m) => m.id));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  className="rounded-sm text-[#0066B3]"
                />
                Pilih Semua ({activeKtaMembers.length})
              </label>

              {selectedIds.length > 0 && (
                <span className="text-xs text-[#0066B3] font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedIds.length} kartu dipilih
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => setIsBatchPreviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Massal ({selectedIds.length})
              </button>

              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => {
                  window.print();
                }}
                className="px-4 py-2 rounded-xl bg-[#009B4D] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                Cetak Batch ({selectedIds.length})
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeKtaMembers.map((m) => (
              <div
                key={m.id}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between ${
                  selectedIds.includes(m.id)
                    ? 'border-[#0066B3] ring-2 ring-blue-100 bg-blue-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(m.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, m.id]);
                      } else {
                        setSelectedIds(selectedIds.filter((id) => id !== m.id));
                      }
                    }}
                    className="mt-1 rounded-sm text-[#0066B3]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold text-emerald-700 truncate">{m.nomor_kta}</p>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{m.nama_lengkap}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{m.kabupaten_nama}, {m.provinsi_nama}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMember(m)}
                    className="text-[#0066B3] hover:underline font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview KTA
                  </button>

                  {/* Regenerate Button with Permission & Reason Guard */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegenMember(m);
                      setRegenReason('');
                      setRegenError('');
                    }}
                    className="text-amber-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. LOG RIWAYAT PENERBITAN KTA (KTA_Generation_Log)            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Log Audit Penerbitan KTA (KTA_Generation_Log)
              </h4>
              <p className="text-[11px] text-slate-500">Rekam jejak pembuatan, regenerasi, dan peremajaan kartu</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {ktaLogs.length} Total Entri
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Log ID & Waktu</th>
                  <th className="py-3 px-4">Nomor KTA</th>
                  <th className="py-3 px-4">Tipe Aksi</th>
                  <th className="py-3 px-4">Alasan Peremajaan</th>
                  <th className="py-3 px-4">Petugas Otoritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ktaLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-900 font-bold">{log.id}</p>
                      <p className="text-[11px] text-slate-400">{log.generated_at.substring(0, 16).replace('T', ' ')}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{log.nomor_kta}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action_type === 'REGENERATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.reason}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{log.generated_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SINGLE KTA PREVIEW USING DigitalMemberCard (Designer Template) */}
      {/* ------------------------------------------------------------- */}
      {previewMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setPreviewMember(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066B3]">
                Template KTA Designer SPWN (ISO/IEC 7810 ID-1)
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{previewMember.nama_lengkap}</h3>
            </div>

            {/* Render DigitalMemberCard with user-defined Designer settings */}
            <div className="flex justify-center">
              <DigitalMemberCard
                member={toBindingFormat(previewMember)}
                previewSettings={storage.getKtaSettings()}
                showControls={true}
              />
            </div>

            <div className="pt-2 text-center text-xs text-slate-500">
              Desain template kartu disinkronkan dengan KTA Designer Kwartir Nasional.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REGENERATE KTA GUARD WITH MANDATORY REASON             */}
      {/* ------------------------------------------------------------- */}
      {regenMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Regenerasi KTA Anggota</h3>
              </div>
              <button
                type="button"
                onClick={() => setRegenMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Regenerasi akan memperbarui nomor seri & QR Token anggota <strong>{regenMember.nama_lengkap}</strong>. 
              Aksi ini memerlukan izin khusus dan dicatat ke dalam audit log.
            </p>

            {regenError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {regenError}
              </div>
            )}

            <form onSubmit={handleRegenSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan Peremajaan KTA (Wajib) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={regenReason}
                  onChange={(e) => setRegenReason(e.target.value)}
                  placeholder="Contoh: Kartu fisik hilang dilaporkan dengan bukti surat pangkalan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Surat Keputusan / Dasar Otoritas *
                </label>
                <input
                  type="text"
                  required
                  value={regenAuthority}
                  onChange={(e) => setRegenAuthority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegenMember(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Konfirmasi Regenerasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BATCH PREVIEW MASSAL USING DigitalMemberCard (Designer Template) */}
      {/* ------------------------------------------------------------- */}
      {isBatchPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-3xl max-w-5xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  KTA Batch Preview ({selectedIds.length} Kartu Dipilih)
                </h3>
                <p className="text-xs text-slate-500">Pratinjau lembar cetak massal ID-1 SAKA Pariwisata sesuai template KTA Designer</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-1.5 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Cetak Sekarang
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              {activeKtaMembers
                .filter((m) => selectedIds.includes(m.id))
                .map((m) => (
                  <div key={m.id} className="flex justify-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
                    <DigitalMemberCard
                      member={toBindingFormat(m)}
                      previewSettings={storage.getKtaSettings()}
                      showControls={false}
                    />
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* KTA Card Template & Dynamic QR Designer Modal */}
      <KtaCardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        sessionUserName={simulatedScope === 'SUPER_ADMIN' ? 'Super Administrator (Kwarnas)' : 'Admin Pusat'}
        userRole={simulatedScope}
      />
    </div>
  );
};
