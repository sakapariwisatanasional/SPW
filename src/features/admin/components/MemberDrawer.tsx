/**
 * SPWN Apps 2.0 - Upgraded Member Drawer (Module 2)
 * Location: src/features/admin/components/MemberDrawer.tsx
 * -------------------------------------------------------------
 * 7 Dedicated Tabs:
 * 1. Overview      (Siklus 4-Tahap, Identitas Inti, & Quick Actions)
 * 2. Profil        (Data Pribadi, Kontak, Foto, & Koreksi Audit)
 * 3. Wilayah       (Kwarda, Kwarcab, Kwarran, Pangkalan Gudep)
 * 4. KTA           (Digital KTA Card, QR Signature, & Siklus KTA)
 * 5. Achievement   (SKK 4 Krida, TKU Garuda/Bantara/Laksana, Piagam)
 * 6. Portfolio     (Pengabdian Pemanduan, Sadar Wisata, Event)
 * 7. Audit Log     (Rekam Jejak Kronologis Lengkap Per Anggota)
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  Check,
  AlertTriangle,
  ShieldCheck,
  KeyRound,
  Edit3,
  Save,
  RefreshCw,
  Eye,
  User,
  MapPin,
  CreditCard,
  Award,
  Briefcase,
  History,
  ChevronRight,
  Copy,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Send,
  Sparkles,
  ExternalLink,
  Calendar,
  QrCode,
  Lock,
  Phone,
  Mail,
  Home,
  Shield,
  FileCheck2,
  XCircle,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { useUIStore } from '../../../stores/uiStore';
import { AdminMemberRecord, MemberAdminStatus } from '../types/admin.types';
import { OrganizationLevelType } from '../../../types/membership';
import { PROVINCES, getRegenciesByProvince } from '../../../data/wilayahData';
import { getKecamatanByKabupaten } from '../../../services/wilayahService';
import { KRIDA_MASTER } from '../../../config/constants';

export type MemberDrawerTab =
  | 'overview'
  | 'profil'
  | 'wilayah'
  | 'kta'
  | 'achievement'
  | 'portfolio'
  | 'audit';

interface MemberDrawerProps {
  member: AdminMemberRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onMemberUpdated?: (updatedMember: AdminMemberRecord) => void;
  initialTab?: MemberDrawerTab;
}

export const MemberDrawer: React.FC<MemberDrawerProps> = ({
  member,
  isOpen,
  onClose,
  onMemberUpdated,
  initialTab = 'overview',
}) => {
  const { addToast } = useUIStore();
  const {
    members,
    simulatedScope,
    scopeProvinceId,
    scopeRegencyId,
    reviewMember,
    approveMember,
    requestRevisionMember,
    rejectMember,
    generateKta,
    regenerateKta,
    revokeKta,
    updateMemberAdmin,
    resetMemberPassword,
    changeHistory,
    approvals,
  } = useAdminStore();

  // Active Tab
  const [activeTab, setActiveTab] = useState<MemberDrawerTab>(initialTab);

  // Synchronize initial tab when modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Current working member from store
  const currentMember = useMemo(() => {
    if (!member) return null;
    return members.find((m) => m.id === member.id) || member;
  }, [members, member]);

  // Form State for editing
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingWilayah, setIsEditingWilayah] = useState(false);
  const [formData, setFormData] = useState<Partial<AdminMemberRecord>>({});
  const [auditReason, setAuditReason] = useState('');
  const [auditError, setAuditError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Modals inside drawer
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [tempPasswordResult, setTempPasswordResult] = useState<string | null>(null);
  const [resetReason, setResetReason] = useState('Reset kata sandi akun oleh administrator');
  const [isResetting, setIsResetting] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // Workflow Action Modals
  const [workflowActionModal, setWorkflowActionModal] = useState<{
    type: 'REVIEW_WILAYAH' | 'FINAL_APPROVE' | 'REQUEST_REVISION' | 'REJECT_PERMANENT' | 'REJECT_REVISE' | 'GENERATE_KTA';
    title: string;
    notes: string;
  } | null>(null);
  const [isProcessingWorkflow, setIsProcessingWorkflow] = useState(false);

  // KTA Regenerate Modal
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);
  const [regenerateReason, setRegenerateReason] = useState('Pembaruan data identitas nasional dan penerbitan KTA baru');

  // Reset local state when member changes
  useEffect(() => {
    if (currentMember) {
      setFormData({ ...currentMember });
      setIsEditingProfile(false);
      setIsEditingWilayah(false);
      setAuditReason('');
      setAuditError('');
      setTempPasswordResult(null);
    }
  }, [currentMember]);

  if (!isOpen || !currentMember) return null;

  // Dropdowns for Wilayah editing
  const selectedProv = formData.provinsi_id || currentMember.provinsi_id || '32';
  const regenciesForProv = getRegenciesByProvince(selectedProv);
  const selectedKab = formData.kabupaten_id || currentMember.kabupaten_id || (regenciesForProv[0]?.code || '3201');
  const districtsForKab = getKecamatanByKabupaten(selectedKab);

  // Specific member change history
  const memberAuditLogs = changeHistory
    .filter((h) => h.member_id === currentMember.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Specific member approval history
  const memberApprovals = approvals
    .filter((a) => a.member_id === currentMember.id)
    .sort((a, b) => new Date(b.reviewed_at).getTime() - new Date(a.reviewed_at).getTime());

  // 6-Status State Machine Status Calculation
  const isPending = currentMember.status_anggota === 'PENDING';
  const isReviewed = currentMember.status_anggota === 'REVIEWED_VERIFIED';
  const isRevision = currentMember.status_anggota === 'REVISION_REQUIRED';
  const isActive = currentMember.status_anggota === 'ACTIVE';
  const isKtaGenerated = currentMember.status_anggota === 'KTA_GENERATED' || Boolean(currentMember.nomor_kta && currentMember.kta_status === 'ACTIVE');
  const isRejected = currentMember.status_anggota === 'REJECTED';
  const hasKta = isKtaGenerated;

  // Authority Check for Password Reset (SUPER_ADMIN or ADMIN_PUSAT)
  const canResetPassword = simulatedScope === 'SUPER_ADMIN' || simulatedScope === 'ADMIN_PUSAT';

  // Handle Save Profile / Wilayah
  const handleSaveData = async (type: 'profil' | 'wilayah') => {
    if (!auditReason.trim() || auditReason.trim().length < 5) {
      setAuditError('Alasan perubahan data administrasi wajib diisi minimal 5 karakter untuk audit trail akuntabel!');
      return;
    }

    setIsSaving(true);
    setAuditError('');

    try {
      // Simulate micro-delay for loading state
      await new Promise((r) => setTimeout(r, 400));

      const updates: Partial<AdminMemberRecord> = {};

      if (type === 'profil') {
        updates.nama_lengkap = formData.nama_lengkap;
        updates.tempat_lahir = formData.tempat_lahir;
        updates.tanggal_lahir = formData.tanggal_lahir;
        updates.jenis_kelamin = formData.jenis_kelamin;
        updates.golongan_darah = formData.golongan_darah;
        updates.alamat_domisili = formData.alamat_domisili;
        updates.nomor_telepon = formData.nomor_telepon;
        updates.email = formData.email;
        if (formData.foto_url) updates.foto_url = formData.foto_url;
      } else if (type === 'wilayah') {
        updates.level_organisasi = formData.level_organisasi;
        updates.provinsi_id = formData.provinsi_id;
        updates.provinsi_nama = formData.provinsi_nama;
        updates.kabupaten_id = formData.kabupaten_id;
        updates.kabupaten_nama = formData.kabupaten_nama;
        updates.kecamatan_id = formData.kecamatan_id;
        updates.wilayah_kecamatan_id = formData.kecamatan_id;
        updates.wilayah_kecamatan_nama = formData.wilayah_kecamatan_nama;
        updates.kwartir_ranting = formData.wilayah_kecamatan_nama;
        updates.pangkalan_gudep = formData.pangkalan_gudep;
        updates.tingkat_keanggotaan = formData.tingkat_keanggotaan;
        updates.krida_id = formData.krida_id;
        const krida = KRIDA_MASTER.find((k) => k.id === formData.krida_id);
        if (krida) updates.krida_nama = krida.name;
      }

      updateMemberAdmin(
        currentMember.id,
        updates,
        auditReason,
        simulatedScope === 'SUPER_ADMIN'
          ? 'Super Administrator'
          : simulatedScope === 'ADMIN_PUSAT'
          ? 'Admin Kwarnas'
          : 'Admin Wilayah',
        simulatedScope
      );

      addToast({
        type: 'success',
        title: 'Perubahan Data Tersimpan',
        message: `Data ${type === 'profil' ? 'Profil' : 'Wilayah'} ${currentMember.nama_lengkap} berhasil diperbarui dengan catatan audit.`,
      });

      if (type === 'profil') setIsEditingProfile(false);
      if (type === 'wilayah') setIsEditingWilayah(false);
      setAuditReason('');
    } catch (err: any) {
      setAuditError(err.message || 'Gagal menyimpan pembaruan data.');
      addToast({
        type: 'error',
        title: 'Penyimpanan Gagal',
        message: err.message || 'Terjadi kesalahan sistem saat menyimpan perubahan.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Workflow State Machine Transitions
  const handleExecuteWorkflow = async () => {
    if (!workflowActionModal) return;
    setIsProcessingWorkflow(true);

    try {
      await new Promise((r) => setTimeout(r, 450));
      const actorName =
        simulatedScope === 'SUPER_ADMIN'
          ? 'Super Administrator'
          : simulatedScope === 'ADMIN_PUSAT'
          ? 'Admin Kwartir Nasional'
          : 'Admin Kwartir Wilayah';

      if (workflowActionModal.type === 'REVIEW_WILAYAH') {
        reviewMember(
          currentMember.id,
          workflowActionModal.notes || 'Verifikasi berkas & kelayakan wilayah selesai.',
          actorName,
          simulatedScope
        );
        addToast({
          type: 'success',
          title: 'Verifikasi Wilayah Selesai',
          message: `Berkas ${currentMember.nama_lengkap} telah diverifikasi (REVIEWED_VERIFIED) dan siap untuk Final Approval Kwarnas.`,
        });
      } else if (workflowActionModal.type === 'FINAL_APPROVE') {
        approveMember(
          currentMember.id,
          workflowActionModal.notes || 'Persetujuan keanggotaan penuh tingkat nasional disahkan.',
          actorName,
          simulatedScope
        );
        addToast({
          type: 'success',
          title: 'Final Approval Berhasil',
          message: `Keanggotaan ${currentMember.nama_lengkap} kini berstatus ACTIVE. Siap diterbitkan KTA Digital.`,
        });
      } else if (workflowActionModal.type === 'REQUEST_REVISION') {
        if (!workflowActionModal.notes.trim()) {
          throw new Error('Catatan arahan perbaikan berkas wajib diisi!');
        }
        requestRevisionMember(
          currentMember.id,
          workflowActionModal.notes,
          actorName,
          simulatedScope
        );
        addToast({
          type: 'warning',
          title: 'Permintaan Revisi Terkirim',
          message: `Status anggota kini REVISION_REQUIRED: "${workflowActionModal.notes}"`,
        });
      } else if (workflowActionModal.type === 'REJECT_PERMANENT' || workflowActionModal.type === 'REJECT_REVISE') {
        if (!workflowActionModal.notes.trim()) {
          throw new Error('Alasan penolakan pendaftaran wajib diisi!');
        }
        rejectMember(
          currentMember.id,
          workflowActionModal.notes,
          actorName,
          simulatedScope
        );
        addToast({
          type: 'warning',
          title: 'Pendaftaran Ditolak',
          message: `Status anggota diubah menjadi REJECTED. Catatan audit tersimpan.`,
        });
      } else if (workflowActionModal.type === 'GENERATE_KTA') {
        const res = generateKta(
          currentMember.id,
          workflowActionModal.notes || 'Penerbitan KTA Digital Resmi SPWN 2.0',
          actorName
        );
        addToast({
          type: 'success',
          title: 'KTA Digital Resmi Diterbitkan',
          message: `Nomor KTA ${res.nomorKta} berhasil diterbitkan dengan QR Signature aktif.`,
        });
      }

      setWorkflowActionModal(null);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Eksekusi Workflow Gagal',
        message: err.message || 'Gagal memproses alur approval.',
      });
    } finally {
      setIsProcessingWorkflow(false);
    }
  };

  // Handle Reset Password Execution
  const handleExecuteResetPassword = async () => {
    if (!canResetPassword) {
      addToast({
        type: 'error',
        title: 'Akses Ditolak',
        message: 'Hanya Super Admin atau Admin Pusat yang berwenang mereset kata sandi.',
      });
      return;
    }

    setIsResetting(true);
    try {
      await new Promise((r) => setTimeout(r, 450));
      const res = resetMemberPassword(
        currentMember.id,
        undefined,
        resetReason,
        simulatedScope === 'SUPER_ADMIN' ? 'Super Administrator' : 'Admin Kwarnas',
        simulatedScope
      );

      setTempPasswordResult(res.temporaryPassword);
      addToast({
        type: 'success',
        title: 'Kata Sandi Direset',
        message: `Password sementara: ${res.temporaryPassword}. Anggota diwajibkan mengganti password pada login berikutnya.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Reset Password',
        message: err.message || 'Terjadi kesalahan saat mereset kata sandi.',
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleCopyPassword = () => {
    if (tempPasswordResult) {
      navigator.clipboard.writeText(tempPasswordResult);
      setCopiedPass(true);
      setTimeout(() => setCopiedPass(false), 2000);
      addToast({
        type: 'info',
        title: 'Tersalin',
        message: 'Password sementara berhasil disalin ke clipboard.',
      });
    }
  };

  // Handle Regenerate KTA
  const handleRegenerateKta = async () => {
    try {
      const res = regenerateKta(
        currentMember.id,
        regenerateReason,
        simulatedScope === 'SUPER_ADMIN' ? 'Super Administrator' : 'Admin Kwarnas'
      );
      addToast({
        type: 'success',
        title: 'KTA Berhasil Diperbarui',
        message: `Nomor KTA baru: ${res.nomorKta}. QR token telah disinkronkan.`,
      });
      setShowRegenerateModal(false);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Memperbarui KTA',
        message: err.message || 'Gagal meregenerasi KTA.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-10">
        <div className="w-full max-w-3xl bg-white shadow-2xl flex flex-col h-full transform transition-transform duration-300">
          {/* ============================================================= */}
          {/* DRAWER HEADER                                                 */}
          {/* ============================================================= */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={currentMember.foto_url}
                alt={currentMember.nama_lengkap}
                className="w-11 h-13 object-cover rounded-xl border border-slate-200 shadow-2xs shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded">
                    ID: {currentMember.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentMember.status_anggota === 'ACTIVE' || currentMember.status_anggota === 'KTA_GENERATED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentMember.status_anggota === 'REVIEWED_VERIFIED'
                        ? 'bg-blue-100 text-blue-800'
                        : currentMember.status_anggota === 'REVISION_REQUIRED'
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : currentMember.status_anggota === 'PENDING'
                        ? 'bg-amber-100 text-amber-800'
                        : currentMember.status_anggota === 'REJECTED'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {currentMember.status_anggota}
                  </span>
                  {hasKta && (
                    <span className="text-[10px] font-bold bg-emerald-50 text-[#009B4D] border border-emerald-200 px-1.5 py-0.2 rounded flex items-center gap-1">
                      <CreditCard className="w-3 h-3" />
                      KTA Resmi
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate mt-0.5">
                  {currentMember.nama_lengkap}
                </h2>
                <p className="text-[11px] text-slate-500 truncate">
                  {currentMember.provinsi_nama} • {currentMember.kabupaten_nama} • {currentMember.krida_nama}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-all cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* ============================================================= */}
          {/* 7-TAB NAVIGATION BAR                                          */}
          {/* ============================================================= */}
          <div className="px-6 bg-white border-b border-slate-200/80 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max py-2 text-xs font-bold">
              {[
                { id: 'overview', label: 'Overview', icon: Eye },
                { id: 'profil', label: 'Profil', icon: User },
                { id: 'wilayah', label: 'Wilayah', icon: MapPin },
                { id: 'kta', label: 'KTA', icon: CreditCard },
                { id: 'achievement', label: 'Achievement', icon: Award },
                { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
                { id: 'audit', label: 'Audit Log', icon: History },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActiveTab = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id as MemberDrawerTab);
                      setAuditError('');
                    }}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all cursor-pointer ${
                      isActiveTab
                        ? 'bg-[#0066B3] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActiveTab ? 'text-white' : 'text-slate-500'}`} />
                    <span>{tab.label}</span>
                    {tab.id === 'audit' && memberAuditLogs.length > 0 && (
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 ${
                        isActiveTab ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {memberAuditLogs.length}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ============================================================= */}
          {/* DRAWER BODY CONTENT                                           */}
          {/* ============================================================= */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Global Error Banner if any */}
            {auditError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{auditError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuditError('')}
                  className="text-red-500 hover:text-red-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 1: OVERVIEW & APPROVAL STATE MACHINE                  */}
            {/* ========================================================= */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Alert Status Khusus: REVISION_REQUIRED / REJECTED */}
                {isRevision && (
                  <div className="p-4 bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wide">Status: Perlu Revisi Berkas (REVISION_REQUIRED)</p>
                      <p className="text-xs text-amber-800 mt-0.5">
                        Anggota diminta memperbaiki kelengkapan atau dokumen pendaftaran. Setelah anggota melengkapi berkas, Admin Wilayah / Pusat dapat melakukan verifikasi ulang.
                      </p>
                      {memberApprovals[0]?.notes && (
                        <p className="text-[11px] font-mono bg-white/70 border border-amber-200 rounded-lg p-2 mt-2 text-amber-950">
                          Catatan Terakhir: &quot;{memberApprovals[0].notes}&quot; (oleh {memberApprovals[0].reviewer_name})
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {isRejected && (
                  <div className="p-4 bg-rose-50 border border-rose-300 text-rose-900 rounded-2xl flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs uppercase tracking-wide">Status: Pendaftaran Ditolak (REJECTED)</p>
                      <p className="text-xs text-rose-800 mt-0.5">
                        Berkas pendaftaran anggota ini telah ditolak secara resmi. Akses pendaftaran dihentikan dan dicatat dalam audit trail.
                      </p>
                      {memberApprovals[0]?.notes && (
                        <p className="text-[11px] font-mono bg-white/70 border border-rose-200 rounded-lg p-2 mt-2 text-rose-950">
                          Alasan Penolakan: &quot;{memberApprovals[0].notes}&quot; (oleh {memberApprovals[0].reviewer_name})
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* 1. Approval State Machine Stepper */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#0066B3]" />
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Approval State Machine (Siklus Verifikasi & Aktivasi)
                      </h4>
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">
                      Standar Prosedur Operasional SPWN 2.0
                    </span>
                  </div>

                  {/* Stepper Flow */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mt-4">
                    {/* Step 1: PENDING */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isPending
                          ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400/30'
                          : isRevision
                          ? 'bg-amber-50/50 border-amber-200'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs mb-1.5">
                        1
                      </div>
                      <p className="font-bold text-xs text-slate-900">PENDING</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Pendaftaran Masuk</p>
                      <span className="inline-block mt-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                        {isPending ? 'Tahap Aktif' : isRevision ? 'Perlu Revisi' : 'Terlewati'}
                      </span>
                    </div>

                    {/* Step 2: REVIEWED_VERIFIED */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isReviewed
                          ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400/30'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto rounded-full bg-blue-100 text-[#0066B3] flex items-center justify-center font-bold text-xs mb-1.5">
                        2
                      </div>
                      <p className="font-bold text-xs text-slate-900">REVIEWED_VERIFIED</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Verifikasi Wilayah</p>
                      <span className={`inline-block mt-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isReviewed
                          ? 'bg-blue-100 text-blue-800'
                          : isActive || hasKta
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isReviewed ? 'Tahap Aktif' : isActive || hasKta ? 'Telah Diverifikasi' : 'Menunggu'}
                      </span>
                    </div>

                    {/* Step 3: ACTIVE */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        isActive && !hasKta
                          ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400/30'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs mb-1.5">
                        3
                      </div>
                      <p className="font-bold text-xs text-slate-900">ACTIVE</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Approval Kwarnas</p>
                      <span className={`inline-block mt-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-purple-100 text-purple-800'
                          : hasKta
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        {isActive ? 'Tahap Aktif' : hasKta ? 'Disahkan' : 'Menunggu'}
                      </span>
                    </div>

                    {/* Step 4: KTA GENERATED */}
                    <div
                      className={`p-3 rounded-xl border text-center transition-all ${
                        hasKta
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="w-7 h-7 mx-auto rounded-full bg-emerald-100 text-[#009B4D] flex items-center justify-center font-bold text-xs mb-1.5">
                        4
                      </div>
                      <p className="font-bold text-xs text-slate-900">KTA GENERATED</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">Identitas Digital & QR</p>
                      <span className={`inline-block mt-2 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        hasKta ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {hasKta ? 'Terbit & Sah' : 'Belum Terbit'}
                      </span>
                    </div>
                  </div>

                  {/* Workflow Action Buttons for Current Step */}
                  <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-slate-700">Tindakan Workflow:</span>

                      {/* Aksi saat PENDING */}
                      {isPending && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowActionModal({
                                type: 'REVIEW_WILAYAH',
                                title: 'Verifikasi Berkas Wilayah (Kwarcab / Kwarda)',
                                notes: 'Semua berkas dan dokumen faktual telah diperiksa dan dinyatakan lengkap.',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-[#0066B3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Verifikasi Berkas Wilayah &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowActionModal({
                                type: 'REQUEST_REVISION',
                                title: 'Permintaan Perbaikan Berkas / Dokumen (REVISION_REQUIRED)',
                                notes: '',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Minta Revisi Berkas
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowActionModal({
                                type: 'REJECT_PERMANENT',
                                title: 'Tolak Pendaftaran Anggota Permanen (REJECTED)',
                                notes: '',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak Pendaftaran
                          </button>
                        </>
                      )}

                      {/* Aksi saat REVIEWED_VERIFIED */}
                      {isReviewed && (
                        <>
                          {simulatedScope === 'ADMIN_WILAYAH' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200 text-sky-800 text-xs font-semibold flex items-center gap-1.5">
                              <CheckCircle2 className="w-4 h-4 text-sky-600" />
                              Lolos Verifikasi Wilayah • Menunggu Final Approval Kwarnas
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setWorkflowActionModal({
                                  type: 'FINAL_APPROVE',
                                  title: 'Final Approval Kwarnas (Tingkat Nasional)',
                                  notes: 'Pengesahan keanggotaan tingkat nasional disetujui sesuai AD/ART Gerakan Pramuka.',
                                })
                              }
                              className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4" />
                              Final Approval Kwarnas &rarr;
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowActionModal({
                                type: 'REQUEST_REVISION',
                                title: 'Kembalikan Berkas ke Tahap Revisi (REVISION_REQUIRED)',
                                notes: '',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Minta Revisi
                          </button>
                          {simulatedScope !== 'ADMIN_WILAYAH' && (
                            <button
                              type="button"
                              onClick={() =>
                                setWorkflowActionModal({
                                  type: 'REJECT_PERMANENT',
                                  title: 'Tolak Pendaftaran Anggota Permanen (REJECTED)',
                                  notes: '',
                                })
                              }
                              className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Tolak
                            </button>
                          )}
                        </>
                      )}

                      {/* Aksi saat REVISION_REQUIRED */}
                      {isRevision && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowActionModal({
                                type: 'REVIEW_WILAYAH',
                                title: 'Verifikasi Ulang Dokumen Hasil Perbaikan',
                                notes: 'Berkas hasil revisi telah diperiksa dan dinyatakan memenuhi syarat.',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Verifikasi Ulang Berkas &rarr;
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setWorkflowActionModal({
                                type: 'REJECT_PERMANENT',
                                title: 'Tolak Pendaftaran Anggota Permanen (REJECTED)',
                                notes: '',
                              })
                            }
                            className="px-3 py-1.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak Permanen
                          </button>
                        </>
                      )}

                      {/* Aksi saat ACTIVE tapi belum KTA */}
                      {isActive && !hasKta && (
                        <>
                          {simulatedScope === 'ADMIN_WILAYAH' ? (
                            <span className="px-3 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-semibold flex items-center gap-1.5">
                              <ShieldCheck className="w-4 h-4 text-purple-600" />
                              Disahkan Kwarnas • Menunggu Penerbitan KTA oleh Pusat
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                setWorkflowActionModal({
                                  type: 'GENERATE_KTA',
                                  title: 'Terbitkan KTA Digital Resmi & QR Identity',
                                  notes: 'Generate Nomor Registrasi Nasional dan Token QR Signature resmi.',
                                })
                              }
                              className="px-3.5 py-1.5 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer"
                            >
                              <CreditCard className="w-4 h-4" />
                              Terbitkan KTA Digital Resmi &rarr;
                            </button>
                          )}
                        </>
                      )}

                      {/* Aksi saat KTA_GENERATED / hasKta */}
                      {hasKta && (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            KTA Aktif: {currentMember.nomor_kta}
                          </span>
                          {(simulatedScope === 'SUPER_ADMIN' || simulatedScope === 'ADMIN_PUSAT') && (
                            <button
                              type="button"
                              onClick={() => setShowRegenerateModal(true)}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 cursor-pointer"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Regenerasi KTA
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Reset Password Trigger (RBAC Enforced: SUPER_ADMIN & ADMIN_PUSAT only) */}
                    <div>
                      {canResetPassword ? (
                        <button
                          type="button"
                          onClick={() => {
                            setTempPasswordResult(null);
                            setCopiedPass(false);
                            setShowResetPasswordModal(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          Reset Kata Sandi
                        </button>
                      ) : (
                        <span
                          title="Hanya Super Administrator & Admin Pusat yang berwenang mereset kata sandi"
                          className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 text-xs font-semibold inline-flex items-center gap-1.5 cursor-not-allowed"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          Reset Sandi (Khusus Pusat)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 2. Overview Identity Card & Stats */}
                <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Ringkasan Informasi Anggota
                    </h4>
                    <span className="text-xs text-[#0066B3] font-bold">
                      {currentMember.tingkat_keanggotaan}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Kontak & Domisili
                      </span>
                      <p className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {currentMember.email || 'Email belum diisi'}
                      </p>
                      <p className="flex items-center gap-2 text-slate-800 font-semibold">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        {currentMember.nomor_telepon || 'Telepon belum diisi'}
                      </p>
                      <p className="flex items-start gap-2 text-slate-600">
                        <Home className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span>{currentMember.alamat_domisili || 'Alamat domisili belum terdata'}</span>
                      </p>
                    </div>

                    <div className="p-3.5 bg-slate-50 rounded-xl space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                        Wilayah Kwartir & Gudep
                      </span>
                      <p className="text-slate-800 font-semibold">
                        Kwarda: <strong>{currentMember.provinsi_nama}</strong>
                      </p>
                      <p className="text-slate-800 font-semibold">
                        Kwarcab: <strong>{currentMember.kabupaten_nama}</strong>
                      </p>
                      <p className="text-slate-600">
                        Kwarran: {currentMember.wilayah_kecamatan_nama || currentMember.kwartir_ranting || '-'}
                      </p>
                      <p className="text-slate-600">
                        Pangkalan Gudep: {currentMember.pangkalan_gudep || '-'}
                      </p>
                    </div>
                  </div>

                  {/* KTA Quick Status Banner */}
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-50 to-emerald-50 border border-blue-200/80 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066B3]">
                        Status Kartu Tanda Anggota (KTA)
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {currentMember.nomor_kta ? (
                          <span className="font-mono text-[#0066B3]">{currentMember.nomor_kta}</span>
                        ) : (
                          <span className="text-slate-500 font-normal">Belum Diterbitkan</span>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('kta')}
                      className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-[#0066B3] hover:bg-blue-50 cursor-pointer"
                    >
                      Buka Tab KTA &rarr;
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 2: PROFIL (DATA PRIBADI & AUDIT TRAIL)                */}
            {/* ========================================================= */}
            {activeTab === 'profil' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Data Pribadi & Kontak Anggota</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Kelola identitas personal sesuai standar KTP/KIA dan kepramukaan
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingProfile(!isEditingProfile);
                      setAuditReason('');
                      setAuditError('');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEditingProfile
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-[#0066B3] text-white shadow-xs hover:bg-blue-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingProfile ? 'Batal Koreksi' : 'Koreksi Data Profil'}
                  </button>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={formData.nama_lengkap || ''}
                      onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Email</label>
                    <input
                      type="email"
                      disabled={!isEditingProfile}
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Nomor Telepon / WhatsApp</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={formData.nomor_telepon || ''}
                      onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin</label>
                    <select
                      disabled={!isEditingProfile}
                      value={formData.jenis_kelamin || 'L'}
                      onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={formData.tempat_lahir || ''}
                      onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir</label>
                    <input
                      type="date"
                      disabled={!isEditingProfile}
                      value={formData.tanggal_lahir || ''}
                      onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Golongan Darah</label>
                    <select
                      disabled={!isEditingProfile}
                      value={formData.golongan_darah || '-'}
                      onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      <option value="-">-</option>
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">URL Foto Profil</label>
                    <input
                      type="text"
                      disabled={!isEditingProfile}
                      value={formData.foto_url || ''}
                      onChange={(e) => setFormData({ ...formData, foto_url: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Alamat Domisili Lengkap</label>
                    <textarea
                      rows={2}
                      disabled={!isEditingProfile}
                      value={formData.alamat_domisili || ''}
                      onChange={(e) => setFormData({ ...formData, alamat_domisili: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>
                </div>

                {/* Audit Reason & Action Button (Only in edit mode) */}
                {isEditingProfile && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Alasan Koreksi Audit (Wajib Diisi):</span>
                    </div>
                    <textarea
                      rows={2}
                      value={auditReason}
                      onChange={(e) => setAuditReason(e.target.value)}
                      placeholder="Contoh: Pembaruan nomor telepon aktif dan pembetulan ejaan nama sesuai berkas KTP..."
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingProfile(false)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveData('profil')}
                        className="px-4 py-2 rounded-xl bg-[#0066B3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Simpan Perubahan & Buat Audit Log
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 3: WILAYAH (KWARDA, KWARCAB, KWARRAN, GUDEP)          */}
            {/* ========================================================= */}
            {activeTab === 'wilayah' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Penugasan Kwartir & Pangkalan Gudep</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Struktur tingkatan organisasi dan peminatan Krida Saka Pariwisata
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingWilayah(!isEditingWilayah);
                      setAuditReason('');
                      setAuditError('');
                    }}
                    className={`px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isEditingWilayah
                        ? 'bg-slate-200 text-slate-800'
                        : 'bg-[#0066B3] text-white shadow-xs hover:bg-blue-700'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    {isEditingWilayah ? 'Batal Koreksi' : 'Koreksi Data Wilayah'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tingkat Organisasi</label>
                    <select
                      disabled={!isEditingWilayah}
                      value={formData.level_organisasi || 'WILAYAH'}
                      onChange={(e) => setFormData({ ...formData, level_organisasi: e.target.value as OrganizationLevelType })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      <option value="KWARTIR_NASIONAL">Kwartir Nasional (Pusat)</option>
                      <option value="WILAYAH">Kwartir Wilayah (Kwarda / Kwarcab)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Krida Saka Pariwisata</label>
                    <select
                      disabled={!isEditingWilayah}
                      value={formData.krida_id || 'KRIDA_PEMANDU'}
                      onChange={(e) => setFormData({ ...formData, krida_id: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      {KRIDA_MASTER.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.name} ({k.code})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Provinsi (Kwarda)</label>
                    <select
                      disabled={!isEditingWilayah}
                      value={selectedProv}
                      onChange={(e) => {
                        const provId = e.target.value;
                        const provObj = PROVINCES.find((p) => p.code === provId);
                        const newRegs = getRegenciesByProvince(provId);
                        const firstReg = newRegs[0];
                        const newDists = firstReg ? getKecamatanByKabupaten(firstReg.code) : [];
                        const firstDist = newDists[0];

                        setFormData({
                          ...formData,
                          provinsi_id: provId,
                          provinsi_nama: provObj?.name || '',
                          kabupaten_id: firstReg?.code || '',
                          kabupaten_nama: firstReg?.name || '',
                          kecamatan_id: firstDist?.kode_kecamatan || '',
                          wilayah_kecamatan_nama: firstDist?.nama_kecamatan || '',
                        });
                      }}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      {PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota (Kwarcab)</label>
                    <select
                      disabled={!isEditingWilayah}
                      value={selectedKab}
                      onChange={(e) => {
                        const kabId = e.target.value;
                        const kabObj = regenciesForProv.find((r) => r.code === kabId);
                        const newDists = getKecamatanByKabupaten(kabId);
                        const firstDist = newDists[0];

                        setFormData({
                          ...formData,
                          kabupaten_id: kabId,
                          kabupaten_nama: kabObj?.name || '',
                          kecamatan_id: firstDist?.kode_kecamatan || '',
                          wilayah_kecamatan_nama: firstDist?.nama_kecamatan || '',
                        });
                      }}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      {regenciesForProv.map((r) => (
                        <option key={r.code} value={r.code}>
                          {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Kecamatan (Kwarran)</label>
                    <select
                      disabled={!isEditingWilayah}
                      value={formData.kecamatan_id || currentMember.kecamatan_id || ''}
                      onChange={(e) => {
                        const distId = e.target.value;
                        const distObj = districtsForKab.find((d) => d.kode_kecamatan === distId);
                        setFormData({
                          ...formData,
                          kecamatan_id: distId,
                          wilayah_kecamatan_nama: distObj?.nama_kecamatan || '',
                        });
                      }}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      {districtsForKab.map((d) => (
                        <option key={d.kode_kecamatan} value={d.kode_kecamatan}>
                          [{d.kode_kecamatan}] {d.nama_kecamatan}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Tingkat Keanggotaan</label>
                    <select
                      disabled={!isEditingWilayah}
                      value={formData.tingkat_keanggotaan || 'Anggota'}
                      onChange={(e) => setFormData({ ...formData, tingkat_keanggotaan: e.target.value })}
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    >
                      <option value="Anggota">Anggota</option>
                      <option value="Dewan Saka">Dewan Saka</option>
                      <option value="Pamong Saka">Pamong Saka</option>
                      <option value="Pimpinan Saka">Pimpinan Saka</option>
                      <option value="Mabisaka">Mabisaka</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-700 mb-1">Pangkalan Gugusdepan (Gudep)</label>
                    <input
                      type="text"
                      disabled={!isEditingWilayah}
                      value={formData.pangkalan_gudep || ''}
                      onChange={(e) => setFormData({ ...formData, pangkalan_gudep: e.target.value })}
                      placeholder="Contoh: SMAN 1 Bandung / Pangkalan Gudep 01.002"
                      className="w-full bg-slate-50 disabled:bg-slate-100/80 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                    />
                  </div>
                </div>

                {isEditingWilayah && (
                  <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-800 font-bold text-xs">
                      <Shield className="w-4 h-4 text-amber-600" />
                      <span>Alasan Koreksi Wilayah / Mutasi (Wajib Diisi):</span>
                    </div>
                    <textarea
                      rows={2}
                      value={auditReason}
                      onChange={(e) => setAuditReason(e.target.value)}
                      placeholder="Contoh: Mutasi pangkalan gugusdepan dan pembaruan kwartir ranting domisili..."
                      className="w-full bg-white border border-amber-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsEditingWilayah(false)}
                        className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => handleSaveData('wilayah')}
                        className="px-4 py-2 rounded-xl bg-[#0066B3] hover:bg-blue-700 text-white font-bold text-xs shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                      >
                        {isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                        Simpan Penugasan & Rekam Audit
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 4: KTA (DIGITAL KTA CARD & QR IDENTITAS)              */}
            {/* ========================================================= */}
            {activeTab === 'kta' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Kartu Tanda Anggota Digital</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      KTA resmi terintegrasi dengan Nomor Registrasi Nasional dan QR Signature
                    </p>
                  </div>
                  {hasKta && (
                    <button
                      type="button"
                      onClick={() => setShowRegenerateModal(true)}
                      className="px-3 py-1.5 rounded-xl border border-blue-200 bg-blue-50 text-[#0066B3] hover:bg-blue-100 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Regenerate KTA
                    </button>
                  )}
                </div>

                {/* Digital KTA Mockup Card */}
                <div className="bg-gradient-to-br from-[#004C85] via-[#0066B3] to-[#009B4D] rounded-3xl p-6 text-white shadow-xl relative overflow-hidden max-w-lg mx-auto">
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex items-center justify-between border-b border-white/20 pb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-xs">
                        SP
                      </div>
                      <div>
                        <h5 className="font-bold text-xs uppercase tracking-wider">SAKA PARIWISATA</h5>
                        <p className="text-[9px] text-white/80">KARTU TANDA ANGGOTA DIGITAL</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full border border-white/20">
                      RESMI
                    </span>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <img
                      src={currentMember.foto_url}
                      alt={currentMember.nama_lengkap}
                      className="w-16 h-20 object-cover rounded-xl border-2 border-white shadow-md shrink-0"
                    />
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-sm sm:text-base truncate">{currentMember.nama_lengkap}</h4>
                      <p className="font-mono text-xs font-bold text-emerald-300 mt-0.5">
                        {currentMember.nomor_kta || 'NOMOR KTA BELUM DITERBITKAN'}
                      </p>
                      <p className="text-[11px] text-white/90 mt-1">
                        {currentMember.krida_nama} • {currentMember.tingkat_keanggotaan}
                      </p>
                      <p className="text-[10px] text-white/70">
                        {currentMember.kabupaten_nama}, {currentMember.provinsi_nama}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-white/20 flex items-center justify-between text-[10px] text-white/80">
                    <div className="flex items-center gap-1 font-mono">
                      <QrCode className="w-3.5 h-3.5" />
                      <span>TOKEN: {currentMember.qr_token || 'TOKEN-ACTIVE-2026'}</span>
                    </div>
                    <span className="font-semibold text-emerald-300">
                      Status: {currentMember.kta_status || 'NOT_CREATED'}
                    </span>
                  </div>
                </div>

                {/* KTA Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Nomor Registrasi KTA</span>
                    <p className="font-mono font-bold text-sm text-[#0066B3] mt-1">
                      {currentMember.nomor_kta || 'Belum Terbit'}
                    </p>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-[10px] font-bold uppercase text-slate-500">Status Validasi QR</span>
                    <p className="font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      100% Signature Aktif & Terverifikasi
                    </p>
                  </div>
                </div>

                {!hasKta && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs flex items-center justify-between gap-4">
                    <div>
                      <h5 className="font-bold text-amber-900">KTA Belum Diterbitkan</h5>
                      <p className="text-amber-700 mt-0.5">
                        Anggota ini belum memiliki nomor KTA nasional. Pastikan status keanggotaan telah disahkan.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setWorkflowActionModal({
                          type: 'GENERATE_KTA',
                          title: 'Terbitkan KTA Digital & Nomor Registrasi',
                          notes: 'Penerbitan KTA Digital resmi dengan QR verification.',
                        })
                      }
                      className="px-3.5 py-2 bg-[#009B4D] hover:bg-emerald-700 text-white font-bold rounded-xl shrink-0 cursor-pointer shadow-xs"
                    >
                      Terbitkan Sekarang
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 5: ACHIEVEMENT (SKK KRIDA, TKU, PIAGAM)              */}
            {/* ========================================================= */}
            {activeTab === 'achievement' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Pencapaian & Kecakapan Khusus (SKK)</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Rekam jejak Tanda Kecakapan Umum (TKU) dan TKK 4 Krida Saka Pariwisata
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-200">
                    23 SKK Saka Pariwisata
                  </span>
                </div>

                {/* TKU Card */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800">
                    Tingkat Kecakapan Umum (TKU)
                  </span>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-black">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-900 text-sm">Penegak Bantara</h5>
                      <p className="text-xs text-slate-600">Disahkan oleh Pangkalan Gudep pada 14 Agustus 2024</p>
                    </div>
                  </div>
                </div>

                {/* SKK List */}
                <div className="space-y-3">
                  <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Daftar SKK Krida Terverifikasi
                  </h5>

                  {[
                    {
                      name: 'SKK Pemandu Wisata Budaya',
                      tingkat: 'Tingkat Madya',
                      date: '10 Januari 2025',
                      krida: 'Krida Pemandu Wisata',
                      color: 'bg-blue-50 text-[#0066B3] border-blue-200',
                    },
                    {
                      name: 'SKK Sadar Wisata & Sapta Pesona',
                      tingkat: 'Tingkat Utama',
                      date: '28 November 2024',
                      krida: 'Krida Penyuluh Pariwisata',
                      color: 'bg-emerald-50 text-emerald-800 border-emerald-200',
                    },
                    {
                      name: 'SKK Kuliner Nusantara',
                      tingkat: 'Tingkat Purwa',
                      date: '15 September 2024',
                      krida: 'Krida Kuliner Wisata',
                      color: 'bg-amber-50 text-amber-800 border-amber-200',
                    },
                  ].map((skk, i) => (
                    <div
                      key={i}
                      className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <h6 className="font-bold text-slate-900">{skk.name}</h6>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {skk.krida} • Lulus Uji: {skk.date}
                          </p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${skk.color}`}>
                        {skk.tingkat}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 6: PORTFOLIO (AKTIVITAS & PENGABDIAN PARIWISATA)       */}
            {/* ========================================================= */}
            {activeTab === 'portfolio' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Portfolio & Rekam Aktivitas</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Pengabdian lapangan, pemanduan wisata, bakti saka, dan partisipasi event (Media via URL pointer)
                    </p>
                  </div>
                  <span className="text-xs font-bold text-[#009B4D] bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                    Zero-Blob Storage
                  </span>
                </div>

                {/* Storage Architecture Compliance Card */}
                <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3 text-xs">
                  <ShieldCheck className="w-4 h-4 text-[#0066B3] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-900">Kebijakan Penyimpanan Dokumen & Media:</span>
                    <p className="text-slate-600 mt-0.5 leading-relaxed text-[11px]">
                      Sistem mengadopsi <strong>External URL Storage Architecture</strong>. Seluruh foto dokumentasi, video kegiatan, dan berkas sertifikasi hanya disimpan dalam bentuk <strong>referensi URL eksternal</strong> (Google Drive publik, YouTube, atau CDN terdistribusi). Aplikasi tidak menyimpan berkas biner besar ke media penyimpanan internal, dan frontend hanya memuat thumbnail preview ringan.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    {
                      title: 'Pemanduan Wisata Edukasi Cagar Budaya',
                      role: 'Koordinator Pemandu Saka',
                      location: 'Kawasan Wisata Sejarah Kota Tua',
                      date: '15 Februari 2025',
                      badge: 'Ekowisata',
                      photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60',
                      videoUrl: 'https://youtube.com/watch?v=example-pemanduan',
                      documentUrl: 'https://drive.google.com/file/d/example-sertifikat-pemandu/view',
                    },
                    {
                      title: 'Sosialisasi Sadar Wisata & Bersih Pantai',
                      role: 'Instruktur Sapta Pesona',
                      location: 'Pantai Indah Kapuk',
                      date: '20 Desember 2024',
                      badge: 'Bakti Saka',
                      photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=60',
                      videoUrl: 'https://youtube.com/watch?v=example-sapta-pesona',
                      documentUrl: 'https://drive.google.com/file/d/example-surat-tugas/view',
                    },
                    {
                      title: 'Festival Kuliner Tradisional Saka Pariwisata',
                      role: 'Peserta & Kurator Menu',
                      location: 'Gelanggang Pemuda Nasional',
                      date: '05 Oktober 2024',
                      badge: 'Kuliner',
                      photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=60',
                      videoUrl: '',
                      documentUrl: 'https://drive.google.com/file/d/example-piagam-kuliner/view',
                    },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200 text-xs space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded">
                          {p.badge}
                        </span>
                        <span className="text-[11px] text-slate-500">{p.date}</span>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3.5">
                        {/* URL-based Thumbnail Preview (Lightweight preview only) */}
                        {p.photoUrl && (
                          <div className="shrink-0">
                            <img
                              src={p.photoUrl}
                              alt={p.title}
                              referrerPolicy="no-referrer"
                              className="w-full sm:w-28 h-20 object-cover rounded-xl border border-slate-200 shadow-2xs"
                            />
                            <span className="block text-[9px] text-slate-400 text-center mt-1">Thumbnail Preview</span>
                          </div>
                        )}

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <h5 className="font-bold text-slate-900 text-sm">{p.title}</h5>
                          <p className="text-slate-600">
                            Peran: <strong>{p.role}</strong> • Lokasi: {p.location}
                          </p>

                          {/* Media URL References (Only external links, no blob storage) */}
                          <div className="flex items-center gap-2 pt-1 flex-wrap">
                            {p.videoUrl && (
                              <a
                                href={p.videoUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-white border border-slate-200 text-[#0066B3] hover:bg-blue-50 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                              >
                                Video Dokumentasi (URL) &nearr;
                              </a>
                            )}
                            {p.documentUrl && (
                              <a
                                href={p.documentUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[10px] font-bold inline-flex items-center gap-1"
                              >
                                Berkas Sertifikat (URL) &nearr;
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB 7: AUDIT LOG (REKAM JEJAK KRONOLOGIS ANGGOTA)          */}
            {/* ========================================================= */}
            {activeTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Audit Log & Rekam Jejak Anggota ({memberAuditLogs.length})
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Catatan tak terhapuskan (immutable log) seluruh koreksi data dan mutasi
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
                    ID: {currentMember.id}
                  </span>
                </div>

                {memberAuditLogs.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    Belum ada riwayat koreksi data untuk anggota ini. Seluruh modifikasi profil, wilayah, atau password akan otomatis tercatat di sini.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {memberAuditLogs.map((log) => (
                      <div
                        key={log.id}
                        className="p-4 bg-white rounded-2xl border border-slate-200 text-xs space-y-2 shadow-2xs"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                              {log.field_name}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">{log.id}</span>
                          </div>
                          <span className="text-[11px] text-slate-500">
                            {new Date(log.timestamp).toLocaleString('id-ID')}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-2.5 bg-slate-50 rounded-xl text-[11px]">
                          <div>
                            <span className="text-slate-400 font-semibold block">Nilai Lama:</span>
                            <span className="text-slate-700 break-words">{log.old_value || '(Kosong)'}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 font-semibold block">Nilai Baru:</span>
                            <span className="font-bold text-slate-900 break-words">{log.new_value}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                          <span>
                            Alasan: <strong className="text-slate-700">{log.reason}</strong>
                          </span>
                          <span>
                            Oleh: <strong className="text-slate-700">{log.actor_id}</strong> ({log.actor_role})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ============================================================= */}
          {/* DRAWER FOOTER                                                 */}
          {/* ============================================================= */}
          <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
            <span>Sistem Akuntabilitas Keanggotaan Terpadu SPWN 2.0</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
            >
              Tutup Drawer
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: RESET PASSWORD WITH ROLE AUTHORIZATION & TEMP PASSWORD           */}
      {/* ========================================================================= */}
      {showResetPasswordModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-amber-500 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-100" />
                <h4 className="font-bold text-sm">Reset Kata Sandi Akun Anggota</h4>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setTempPasswordResult(null);
                }}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* If not authorized */}
              {!canResetPassword ? (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Akses Ditolak: Otoritas Tidak Mencukupi</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Hanya <strong>Super Administrator</strong> atau <strong>Admin Kwartir Pusat (Kwarnas)</strong> yang memiliki kewenangan mereset kata sandi akun anggota. Admin Wilayah tidak dapat melakukan tindakan ini demi integritas keamanan sistem.
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setShowResetPasswordModal(false)}
                      className="w-full py-2 bg-white border border-rose-300 rounded-xl font-bold text-rose-700 hover:bg-rose-100"
                    >
                      Tutup
                    </button>
                  </div>
                </div>
              ) : tempPasswordResult ? (
                /* Success State with Temporary Password Display */
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Kata Sandi Berhasil Direset</span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      Kredensial baru telah diterbitkan untuk <strong>{currentMember.nama_lengkap}</strong>. Berikan kata sandi sementara berikut kepada anggota:
                    </p>

                    <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center justify-between">
                      <span className="font-mono font-black text-base text-emerald-700 tracking-wider">
                        {tempPasswordResult}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyPassword}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedPass ? 'Tersalin!' : 'Salin'}
                      </button>
                    </div>

                    <p className="text-[10px] text-emerald-700 font-semibold">
                      * Sistem telah menandai akun ini sebagai <strong>force_change_password</strong>. Anggota diwajibkan mengganti kata sandi pada login pertama.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowResetPasswordModal(false);
                        setTempPasswordResult(null);
                      }}
                      className="px-4 py-2 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              ) : (
                /* Confirmation & Reason Input */
                <div className="space-y-4">
                  <p className="text-slate-600">
                    Tindakan ini akan menghasilkan <strong>kata sandi sementara</strong> dan mewajibkan anggota mengganti kata sandi saat login berikutnya. Tindakan ini akan dicatat ke dalam audit trail.
                  </p>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Alasan Reset Kata Sandi <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={resetReason}
                      onChange={(e) => setResetReason(e.target.value)}
                      placeholder="Contoh: Permintaan reset dari anggota via WhatsApp Kwarcab karena lupa kredensial..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowResetPasswordModal(false)}
                      className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      disabled={isResetting || !resetReason.trim()}
                      onClick={handleExecuteResetPassword}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                    >
                      {isResetting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <KeyRound className="w-3.5 h-3.5" />}
                      Generate Password Baru
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: WORKFLOW TRANSITION CONFIRMATION (APPROVAL / REVISE / KTA)       */}
      {/* ========================================================================= */}
      {workflowActionModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div
              className={`p-4 text-white flex items-center justify-between ${
                workflowActionModal.type === 'REJECT_PERMANENT' || workflowActionModal.type === 'REJECT_REVISE'
                  ? 'bg-rose-600'
                  : workflowActionModal.type === 'REQUEST_REVISION'
                  ? 'bg-amber-600'
                  : workflowActionModal.type === 'FINAL_APPROVE'
                  ? 'bg-purple-700'
                  : workflowActionModal.type === 'GENERATE_KTA'
                  ? 'bg-[#009B4D]'
                  : 'bg-[#0066B3]'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <h4 className="font-bold text-sm">{workflowActionModal.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => setWorkflowActionModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-600 leading-relaxed">
                Anda akan melakukan transisi status approval untuk anggota{' '}
                <strong>{currentMember.nama_lengkap}</strong> (ID: {currentMember.id}). Keputusan ini akan tersimpan permanen di riwayat persetujuan.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Catatan Persetujuan / Catatan Revisi <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={workflowActionModal.notes}
                  onChange={(e) =>
                    setWorkflowActionModal({
                      ...workflowActionModal,
                      notes: e.target.value,
                    })
                  }
                  placeholder="Tuliskan catatan verifikasi atau arahan perbaikan berkas..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setWorkflowActionModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isProcessingWorkflow}
                  onClick={handleExecuteWorkflow}
                  className={`px-4 py-2 rounded-xl text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-60 ${
                    workflowActionModal.type === 'REJECT_PERMANENT' || workflowActionModal.type === 'REJECT_REVISE'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : workflowActionModal.type === 'REQUEST_REVISION'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : workflowActionModal.type === 'FINAL_APPROVE'
                      ? 'bg-purple-700 hover:bg-purple-800'
                      : workflowActionModal.type === 'GENERATE_KTA'
                      ? 'bg-[#009B4D] hover:bg-emerald-700'
                      : 'bg-[#0066B3] hover:bg-blue-700'
                  }`}
                >
                  {isProcessingWorkflow ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  Konfirmasi Transisi Status
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: REGENERATE KTA                                                   */}
      {/* ========================================================================= */}
      {showRegenerateModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="bg-[#0066B3] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-white" />
                <h4 className="font-bold text-sm">Peremajaan / Regenerasi KTA</h4>
              </div>
              <button
                type="button"
                onClick={() => setShowRegenerateModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-slate-600">
                Regenerasi KTA akan menerbitkan nomor registrasi dan QR signature baru untuk anggota{' '}
                <strong>{currentMember.nama_lengkap}</strong>. Nomor KTA lama akan dicatat pada log mutasi.
              </p>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Alasan Regenerasi KTA <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={regenerateReason}
                  onChange={(e) => setRegenerateReason(e.target.value)}
                  placeholder="Contoh: Peremajaan data pasca mutasi kwarda..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRegenerateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleRegenerateKta}
                  className="px-4 py-2 rounded-xl bg-[#0066B3] hover:bg-blue-700 text-white font-bold shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Terbitkan KTA Baru
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
