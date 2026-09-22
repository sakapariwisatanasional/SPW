/**
 * SPWN Apps 2.0 - Hierarchical Admin Assignment Center (Penunjukan Admin Berjenjang)
 * Location: src/features/admin/components/AdminAssignmentCenter.tsx
 * ---------------------------------------------------------------------------------
 * Memfasilitasi Super Admin untuk menunjuk dan mendelegasikan wewenang administrator
 * pada 5 tingkat hierarki Gerakan Pramuka & SAKA Pariwisata:
 * 1. Nasional (Kwartir Nasional)
 * 2. Provinsi (Kwartir Daerah)
 * 3. Kabupaten/Kota (Kwartir Cabang)
 * 4. Kecamatan (Kwartir Ranting)
 * 5. Pangkalan (Gugus Depan / Saka Pariwisata Pangkalan)
 */

import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Plus,
  Search,
  Filter,
  KeyRound,
  FileText,
  MapPin,
  Building2,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  X,
  Globe2,
  Award,
  ChevronDown
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { AdminTierLevel, AdminAppointmentRecord } from '../types/admin.types';
import { ADMIN_TIERS, ADMIN_TIER_LABELS } from '../../../config/constants';
import { PROVINCES, getRegenciesByProvince, getDistrictsByRegency } from '../../../data/wilayahData';
import { Badge } from '../../../components/ui/Badge';
import { useUIStore } from '../../../stores/uiStore';

export const AdminAssignmentCenter: React.FC = () => {
  const { addToast } = useUIStore();
  const {
    adminAppointments,
    members,
    assignAdmin,
    revokeAdmin,
    resetAdminPassword,
  } = useAdminStore();

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTierFilter, setSelectedTierFilter] = useState<'ALL' | AdminTierLevel>('ALL');

  // Modal State: Penunjukan Admin Baru
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [formTier, setFormTier] = useState<AdminTierLevel>('PROVINSI');
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [formNama, setFormNama] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formProvinsiId, setFormProvinsiId] = useState('32');
  const [formKabupatenId, setFormKabupatenId] = useState('');
  const [formKecamatanId, setFormKecamatanId] = useState('');
  const [formPangkalanNama, setFormPangkalanNama] = useState('');
  const [formNomorSk, setFormNomorSk] = useState('');
  const [formTanggalSk, setFormTanggalSk] = useState(new Date().toISOString().slice(0, 10));
  const [formMasaBerlaku, setFormMasaBerlaku] = useState('');
  const [formCatatan, setFormCatatan] = useState('');
  const [formError, setFormError] = useState('');

  // Modal State: Reset Password Admin
  const [resetModalData, setResetModalData] = useState<{
    appointment: AdminAppointmentRecord;
    isOpen: boolean;
    temporaryPassword?: string;
    reason: string;
    isSuccess: boolean;
  } | null>(null);

  // Modal State: Cabut Mandat
  const [revokeModalData, setRevokeModalData] = useState<{
    appointment: AdminAppointmentRecord;
    isOpen: boolean;
    reason: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);

  // Data wilayah dinamis sesuai form
  const availableRegencies = useMemo(() => {
    if (!formProvinsiId) return [];
    return getRegenciesByProvince(formProvinsiId);
  }, [formProvinsiId]);

  const availableDistricts = useMemo(() => {
    if (!formKabupatenId) return [];
    return getDistrictsByRegency(formKabupatenId);
  }, [formKabupatenId]);

  // Statistik per Tingkatan
  const stats = useMemo(() => {
    const total = adminAppointments.length;
    const active = adminAppointments.filter((a) => a.status === 'ACTIVE').length;
    const countNasional = adminAppointments.filter((a) => a.tier_level === 'NASIONAL' && a.status === 'ACTIVE').length;
    const countProvinsi = adminAppointments.filter((a) => a.tier_level === 'PROVINSI' && a.status === 'ACTIVE').length;
    const countKabupaten = adminAppointments.filter((a) => a.tier_level === 'KABUPATEN_KOTA' && a.status === 'ACTIVE').length;
    const countKecamatan = adminAppointments.filter((a) => a.tier_level === 'KECAMATAN' && a.status === 'ACTIVE').length;
    const countPangkalan = adminAppointments.filter((a) => a.tier_level === 'PANGKALAN' && a.status === 'ACTIVE').length;

    return { total, active, countNasional, countProvinsi, countKabupaten, countKecamatan, countPangkalan };
  }, [adminAppointments]);

  // Filtered Appointments
  const filteredAppointments = useMemo(() => {
    return adminAppointments.filter((item) => {
      const matchSearch =
        item.nama_lengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nomor_sk.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.provinsi_nama && item.provinsi_nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.kabupaten_nama && item.kabupaten_nama.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.pangkalan_nama && item.pangkalan_nama.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchTier = selectedTierFilter === 'ALL' || item.tier_level === selectedTierFilter;

      return matchSearch && matchTier;
    });
  }, [adminAppointments, searchQuery, selectedTierFilter]);

  // Handler auto-fill ketika anggota dipilih
  const handleSelectMember = (memberId: string) => {
    setSelectedMemberId(memberId);
    if (!memberId) return;

    const found = members.find((m) => m.id === memberId);
    if (found) {
      setFormNama(found.nama_lengkap);
      setFormEmail(found.email || '');
      setFormPhone(found.nomor_telepon || '');
      if (found.provinsi_id) setFormProvinsiId(found.provinsi_id);
      if (found.kabupaten_id) setFormKabupatenId(found.kabupaten_id);
      if (found.kwartir_cabang) setFormPangkalanNama(found.kwartir_cabang);
    }
  };

  // Handler Submit Penunjukan Admin
  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formNama.trim() || !formEmail.trim()) {
      setFormError('Nama lengkap dan alamat email wajib diisi.');
      return;
    }

    if (!formNomorSk.trim()) {
      setFormError('Nomor Surat Keputusan (SK) / Surat Mandat penunjukan wajib diisi.');
      return;
    }

    // Resolusi nama wilayah
    const selectedProv = PROVINCES.find((p) => p.code === formProvinsiId);
    const selectedReg = availableRegencies.find((r) => r.code === formKabupatenId);
    const selectedDist = availableDistricts.find((d) => d.districtCode3 === formKecamatanId || d.code === `${formKabupatenId}${formKecamatanId}`);

    let tingkatLabel = 'Admin Penunjukan';
    if (formTier === 'NASIONAL') tingkatLabel = 'Admin Kwartir Nasional';
    else if (formTier === 'PROVINSI') tingkatLabel = `Admin Kwarda ${selectedProv?.name || 'Provinsi'}`;
    else if (formTier === 'KABUPATEN_KOTA') tingkatLabel = `Admin Kwarcab ${selectedReg?.name || 'Kab/Kota'}`;
    else if (formTier === 'KECAMATAN') tingkatLabel = `Admin Kwarran ${selectedDist?.name || 'Kecamatan'}`;
    else if (formTier === 'PANGKALAN') tingkatLabel = `Admin Pangkalan ${formPangkalanNama || 'Gudep'}`;

    try {
      assignAdmin({
        member_id: selectedMemberId || undefined,
        nama_lengkap: formNama.trim(),
        email: formEmail.trim(),
        nomor_telepon: formPhone.trim() || undefined,
        tier_level: formTier,
        tingkat_label: tingkatLabel,
        provinsi_id: formTier !== 'NASIONAL' ? formProvinsiId : '00',
        provinsi_nama: formTier !== 'NASIONAL' ? selectedProv?.name : 'Kwartir Nasional',
        kabupaten_id: ['KABUPATEN_KOTA', 'KECAMATAN', 'PANGKALAN'].includes(formTier) ? formKabupatenId : undefined,
        kabupaten_nama: ['KABUPATEN_KOTA', 'KECAMATAN', 'PANGKALAN'].includes(formTier) ? selectedReg?.name : undefined,
        kecamatan_id: ['KECAMATAN', 'PANGKALAN'].includes(formTier) ? formKecamatanId : undefined,
        kecamatan_nama: ['KECAMATAN', 'PANGKALAN'].includes(formTier) ? selectedDist?.name : undefined,
        pangkalan_nama: formTier === 'PANGKALAN' ? formPangkalanNama.trim() : undefined,
        nomor_sk: formNomorSk.trim(),
        tanggal_sk: formTanggalSk,
        masa_berlaku: formMasaBerlaku.trim() || undefined,
        status: 'ACTIVE',
        catatan_mandat: formCatatan.trim(),
        appointed_by: 'Super Administrator',
      });

      addToast({
        type: 'success',
        title: 'Admin Berhasil Didelegasikan',
        message: `Mandat penunjukan admin untuk ${formNama} berhasil diterbitkan.`,
      });

      // Reset and close
      setIsAssignModalOpen(false);
      setSelectedMemberId('');
      setFormNama('');
      setFormEmail('');
      setFormPhone('');
      setFormNomorSk('');
      setFormCatatan('');
      setFormPangkalanNama('');
    } catch (err: any) {
      setFormError(err.message || 'Gagal mendelegasikan admin.');
      addToast({
        type: 'error',
        title: 'Gagal Delegasi Admin',
        message: err.message || 'Gagal mendelegasikan admin.',
      });
    }
  };

  // Handler Submit Reset Password Admin
  const handleExecuteResetPassword = () => {
    if (!resetModalData) return;
    try {
      const res = resetAdminPassword(
        resetModalData.appointment.id,
        resetModalData.temporaryPassword,
        resetModalData.reason,
        'Super Administrator'
      );
      setResetModalData({
        ...resetModalData,
        temporaryPassword: res.temporaryPassword,
        isSuccess: true,
      });
      addToast({
        type: 'success',
        title: 'Kata Sandi Direset',
        message: `Kata sandi admin ${resetModalData.appointment.nama_lengkap} berhasil diperbarui.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Reset Password',
        message: err.message || 'Gagal mereset kata sandi.',
      });
    }
  };

  // Handler Submit Cabut Mandat
  const handleExecuteRevoke = () => {
    if (!revokeModalData || !revokeModalData.reason.trim()) {
      addToast({
        type: 'error',
        title: 'Alasan Wajib Diisi',
        message: 'Alasan pencabutan mandat penunjukan admin wajib dicantumkan.',
      });
      return;
    }
    revokeAdmin(revokeModalData.appointment.id, revokeModalData.reason, 'Super Administrator');
    addToast({
      type: 'warning',
      title: 'Mandat Dicabut',
      message: `Wewenang admin untuk ${revokeModalData.appointment.nama_lengkap} telah dinonaktifkan.`,
    });
    setRevokeModalData(null);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(true);
    addToast({
      type: 'success',
      title: 'Tersalin',
      message: 'Kata sandi sementara berhasil disalin ke clipboard.',
    });
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const getTierBadge = (tier: AdminTierLevel) => {
    switch (tier) {
      case 'NASIONAL':
        return <Badge variant="purple" size="sm">1. Nasional (Kwarnas)</Badge>;
      case 'PROVINSI':
        return <Badge variant="blue" size="sm">2. Provinsi (Kwarda)</Badge>;
      case 'KABUPATEN_KOTA':
        return <Badge variant="green" size="sm">3. Kab/Kota (Kwarcab)</Badge>;
      case 'KECAMATAN':
        return <Badge variant="orange" size="sm">4. Kecamatan (Kwarran)</Badge>;
      case 'PANGKALAN':
        return <Badge variant="neutral" size="sm">5. Pangkalan (Gudep/Saka)</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-linear-to-r from-purple-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-96 bg-radial from-purple-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="bg-purple-500/30 text-purple-200 border border-purple-400/40 text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-purple-300" />
                SUPER ADMIN AUTHORITY
              </span>
              <span className="text-slate-300 text-xs">SPWN Apps 2.0 Governance</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Penunjukan & Delegasi Admin Berjenjang
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Super Admin memiliki hak eksklusif untuk menunjuk, mengatur cakupan wilayah/pangkalan,
              dan mereset kredensial admin berjenjang: <strong>Nasional</strong>, <strong>Provinsi</strong>,{' '}
              <strong>Kabupaten/Kota</strong>, <strong>Kecamatan</strong>, hingga <strong>Pangkalan Saka</strong>.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <button
              onClick={() => {
                setFormTier('PROVINSI');
                setIsAssignModalOpen(true);
              }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#F7941D] to-amber-500 hover:from-amber-600 hover:to-amber-700 text-white font-semibold px-4 py-2.5 rounded-xl shadow-sm text-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tunjuk Admin Baru</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5-Tier Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === 'NASIONAL' ? 'ALL' : 'NASIONAL')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTierFilter === 'NASIONAL'
              ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-400'
              : 'bg-white border-slate-200 hover:border-purple-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-purple-700">Tingkat 1</span>
            <Globe2 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.countNasional}</div>
          <div className="text-xs font-medium text-slate-600 truncate">Admin Nasional (Kwarnas)</div>
        </div>

        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === 'PROVINSI' ? 'ALL' : 'PROVINSI')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTierFilter === 'PROVINSI'
              ? 'bg-blue-50 border-blue-300 ring-2 ring-blue-400'
              : 'bg-white border-slate-200 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-blue-700">Tingkat 2</span>
            <ShieldCheck className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.countProvinsi}</div>
          <div className="text-xs font-medium text-slate-600 truncate">Admin Provinsi (Kwarda)</div>
        </div>

        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === 'KABUPATEN_KOTA' ? 'ALL' : 'KABUPATEN_KOTA')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTierFilter === 'KABUPATEN_KOTA'
              ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400'
              : 'bg-white border-slate-200 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-emerald-700">Tingkat 3</span>
            <MapPin className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.countKabupaten}</div>
          <div className="text-xs font-medium text-slate-600 truncate">Admin Kab/Kota (Kwarcab)</div>
        </div>

        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === 'KECAMATAN' ? 'ALL' : 'KECAMATAN')}
          className={`p-4 rounded-xl border transition-all cursor-pointer ${
            selectedTierFilter === 'KECAMATAN'
              ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-400'
              : 'bg-white border-slate-200 hover:border-amber-200'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-amber-700">Tingkat 4</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.countKecamatan}</div>
          <div className="text-xs font-medium text-slate-600 truncate">Admin Kecamatan (Kwarran)</div>
        </div>

        <div
          onClick={() => setSelectedTierFilter(selectedTierFilter === 'PANGKALAN' ? 'ALL' : 'PANGKALAN')}
          className={`p-4 rounded-xl border transition-all cursor-pointer col-span-2 sm:col-span-1 ${
            selectedTierFilter === 'PANGKALAN'
              ? 'bg-slate-100 border-slate-400 ring-2 ring-slate-400'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Tingkat 5</span>
            <Award className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-lg font-bold text-slate-900">{stats.countPangkalan}</div>
          <div className="text-xs font-medium text-slate-600 truncate">Admin Pangkalan (Gudep/Saka)</div>
        </div>
      </div>

      {/* Control & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari admin, email, nomor SK, wilayah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-purple-500 focus:bg-white transition-all"
          />
        </div>

        {/* Tier Filter Tabs */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setSelectedTierFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedTierFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({adminAppointments.length})
          </button>
          <button
            onClick={() => setSelectedTierFilter('NASIONAL')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTierFilter === 'NASIONAL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Nasional
          </button>
          <button
            onClick={() => setSelectedTierFilter('PROVINSI')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTierFilter === 'PROVINSI'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Provinsi
          </button>
          <button
            onClick={() => setSelectedTierFilter('KABUPATEN_KOTA')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTierFilter === 'KABUPATEN_KOTA'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kab/Kota
          </button>
          <button
            onClick={() => setSelectedTierFilter('KECAMATAN')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTierFilter === 'KECAMATAN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Kecamatan
          </button>
          <button
            onClick={() => setSelectedTierFilter('PANGKALAN')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              selectedTierFilter === 'PANGKALAN'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Pangkalan
          </button>
        </div>
      </div>

      {/* Admin Appointments Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
              <tr>
                <th className="px-5 py-3.5">Administrator</th>
                <th className="px-4 py-3.5">Tingkatan & Wewenang</th>
                <th className="px-4 py-3.5">Cakupan Wilayah / Pangkalan</th>
                <th className="px-4 py-3.5">Legalitas SK Mandat</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Aksi Super Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAppointments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <UserCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-semibold text-slate-600">Tidak ada data admin ditemukan</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Gunakan tombol "Tunjuk Admin Baru" untuk memberikan delegasi mandat.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredAppointments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {/* User Info */}
                    <td className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-linear-to-br from-purple-100 to-indigo-100 border border-purple-200 flex items-center justify-center font-bold text-purple-700 text-xs shrink-0 mt-0.5">
                          {item.nama_lengkap.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 leading-snug">{item.nama_lengkap}</p>
                          <p className="text-xs text-slate-500">{item.email}</p>
                          {item.nomor_telepon && (
                            <p className="text-[11px] text-slate-400 mt-0.5">{item.nomor_telepon}</p>
                          )}
                          {item.nomor_kta && (
                            <span className="inline-block mt-1 font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                              KTA: {item.nomor_kta}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Tier Level */}
                    <td className="px-4 py-4">
                      <div className="space-y-1">
                        {getTierBadge(item.tier_level)}
                        <p className="text-xs font-medium text-slate-800">{item.tingkat_label}</p>
                        {item.catatan_mandat && (
                          <p className="text-[11px] text-slate-500 italic max-w-xs line-clamp-2">
                            "{item.catatan_mandat}"
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Jurisdiction / Scope */}
                    <td className="px-4 py-4 text-xs">
                      {item.tier_level === 'NASIONAL' && (
                        <div className="flex items-center gap-1.5 text-purple-800 font-medium">
                          <Globe2 className="w-3.5 h-3.5" />
                          <span>Seluruh Indonesia (Nasional)</span>
                        </div>
                      )}

                      {item.tier_level === 'PROVINSI' && (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900">{item.provinsi_nama}</span>
                          <p className="text-[11px] text-slate-400">Kode Wilayah: {item.provinsi_id}</p>
                        </div>
                      )}

                      {item.tier_level === 'KABUPATEN_KOTA' && (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900">{item.kabupaten_nama}</span>
                          <p className="text-[11px] text-slate-500">{item.provinsi_nama}</p>
                        </div>
                      )}

                      {item.tier_level === 'KECAMATAN' && (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900">Kec. {item.kecamatan_nama}</span>
                          <p className="text-[11px] text-slate-500">{item.kabupaten_nama}, {item.provinsi_nama}</p>
                        </div>
                      )}

                      {item.tier_level === 'PANGKALAN' && (
                        <div className="space-y-0.5">
                          <span className="font-semibold text-slate-900">{item.pangkalan_nama || 'Pangkalan Saka'}</span>
                          <p className="text-[11px] text-slate-500">
                            Kec. {item.kecamatan_nama || '-'}, {item.kabupaten_nama}
                          </p>
                        </div>
                      )}
                    </td>

                    {/* Legal SK */}
                    <td className="px-4 py-4 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 font-mono font-medium text-slate-800">
                          <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[170px]">{item.nomor_sk}</span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          Tgl SK: {item.tanggal_sk}
                        </p>
                        {item.masa_berlaku && (
                          <p className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                            s/d {item.masa_berlaku}
                          </p>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      {item.status === 'ACTIVE' ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          Dicabut
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Reset Password */}
                        <button
                          type="button"
                          onClick={() => {
                            setResetModalData({
                              appointment: item,
                              isOpen: true,
                              reason: 'Reset kata sandi kredensial admin oleh Super Administrator',
                              isSuccess: false,
                            });
                          }}
                          title="Reset Password Akun Admin"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200 transition-all cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>

                        {/* Cabut Mandat */}
                        {item.status === 'ACTIVE' && (
                          <button
                            type="button"
                            onClick={() => {
                              setRevokeModalData({
                                appointment: item,
                                isOpen: true,
                                reason: '',
                              });
                            }}
                            title="Cabut Mandat Penunjukan Admin"
                            className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-rose-700 hover:bg-rose-50 hover:border-rose-200 transition-all cursor-pointer"
                          >
                            <UserX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL PENUNJUKAN ADMIN BARU ================= */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
            <div className="bg-linear-to-r from-purple-800 to-indigo-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <UserCheck className="w-5 h-5 text-purple-200" />
                <h3 className="font-bold text-lg">Formulir Penunjukan Admin Berjenjang</h3>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignSubmit} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* 1. Pilih Tingkatan Hierarki */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  1. Tingkatan Administrator yang Ditunjuk <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {(['NASIONAL', 'PROVINSI', 'KABUPATEN_KOTA', 'KECAMATAN', 'PANGKALAN'] as AdminTierLevel[]).map((tier) => (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => setFormTier(tier)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex flex-col items-center justify-center gap-1 transition-all ${
                        formTier === tier
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-center font-bold">
                        {tier === 'NASIONAL' && '1. Nasional'}
                        {tier === 'PROVINSI' && '2. Provinsi'}
                        {tier === 'KABUPATEN_KOTA' && '3. Kab/Kota'}
                        {tier === 'KECAMATAN' && '4. Kecamatan'}
                        {tier === 'PANGKALAN' && '5. Pangkalan'}
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  {ADMIN_TIER_LABELS[formTier]?.description}
                </p>
              </div>

              {/* 2. Pilihan Cakupan Wilayah Berjenjang */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  2. Wilayah / Pangkalan Binaan
                </label>

                {formTier === 'NASIONAL' ? (
                  <div className="text-xs text-purple-700 font-semibold flex items-center gap-2 bg-purple-50 p-2.5 rounded-lg border border-purple-200">
                    <Globe2 className="w-4 h-4" />
                    <span>Cakupan wewenang penuh di tingkat Kwartir Nasional (Nasional).</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    {/* Provinsi */}
                    <div>
                      <label className="block font-medium text-slate-700 mb-1">
                        Provinsi (Kwarda) <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={formProvinsiId}
                        onChange={(e) => {
                          setFormProvinsiId(e.target.value);
                          setFormKabupatenId('');
                          setFormKecamatanId('');
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                        required
                      >
                        {PROVINCES.map((p) => (
                          <option key={p.code} value={p.code}>
                            {p.code} - {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Kab/Kota */}
                    {['KABUPATEN_KOTA', 'KECAMATAN', 'PANGKALAN'].includes(formTier) && (
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Kabupaten / Kota (Kwarcab) <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formKabupatenId}
                          onChange={(e) => {
                            setFormKabupatenId(e.target.value);
                            setFormKecamatanId('');
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">-- Pilih Kab/Kota --</option>
                          {availableRegencies.map((r) => (
                            <option key={r.code} value={r.code}>
                              {r.code} - {r.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Kecamatan */}
                    {['KECAMATAN', 'PANGKALAN'].includes(formTier) && (
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Kecamatan (Kwarran) <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={formKecamatanId}
                          onChange={(e) => setFormKecamatanId(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                          required
                        >
                          <option value="">-- Pilih Kecamatan --</option>
                          {availableDistricts.map((d) => (
                            <option key={d.code} value={d.districtCode3}>
                              {d.districtCode3} - {d.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Pangkalan */}
                    {formTier === 'PANGKALAN' && (
                      <div>
                        <label className="block font-medium text-slate-700 mb-1">
                          Nama Gugus Depan / Pangkalan Saka <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Pangkalan SMKN 1 Soreang"
                          value={formPangkalanNama}
                          onChange={(e) => setFormPangkalanNama(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 3. Identitas Personel Admin */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    3. Data Personel Admin
                  </label>
                  <span className="text-[11px] text-slate-500">Pilih dari anggota atau isi baru</span>
                </div>

                {/* Pilih Anggota Existing */}
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    Pilih Dari Anggota SAKA Terdaftar (Opsional)
                  </label>
                  <select
                    value={selectedMemberId}
                    onChange={(e) => handleSelectMember(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Input Personel Mandiri / Baru --</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nama_lengkap} (KTA: {m.nomor_kta || 'Proses'}) - {m.provinsi_nama || m.provinsi_id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nama Lengkap Personel <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Kak Bambang Soedirman"
                      value={formNama}
                      onChange={(e) => setFormNama(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Alamat Email Akun <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="e.g. bambang@spwn.id"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 08123456789"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nomor KTA SPWN (Jika Ada)
                    </label>
                    <input
                      type="text"
                      placeholder="00.PPKK.CCC.NNNNNN"
                      value={members.find((m) => m.id === selectedMemberId)?.nomor_kta || ''}
                      readOnly
                      className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs text-slate-600"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Legalitas Surat Keputusan (SK) */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  4. Surat Keputusan (SK) & Mandat Penunjukan
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Nomor SK Mandat <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. SK-KWARNAS/09/2026"
                      value={formNomorSk}
                      onChange={(e) => setFormNomorSk(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Tanggal Penetapan SK
                    </label>
                    <input
                      type="date"
                      value={formTanggalSk}
                      onChange={(e) => setFormTanggalSk(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">
                      Masa Berlaku (Opsional)
                    </label>
                    <input
                      type="date"
                      value={formMasaBerlaku}
                      onChange={(e) => setFormMasaBerlaku(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Catatan Ruang Lingkup & Penugasan
                  </label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Diberikan mandat pengelolaan registrasi anggota dan verifikasi berkas di wilayah binaan..."
                    value={formCatatan}
                    onChange={(e) => setFormCatatan(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 shadow-xs transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Terbitkan Mandat & Tunjuk Admin</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL RESET PASSWORD ADMIN ================= */}
      {resetModalData && resetModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-amber-600 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-200" />
                <h3 className="font-bold text-sm">Reset Password Akun Administrator</h3>
              </div>
              <button
                onClick={() => setResetModalData(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {!resetModalData.isSuccess ? (
                <>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
                    <p className="font-semibold">Perhatian Keamanan:</p>
                    <p>
                      Super Admin akan menerbitkan password baru untuk admin{' '}
                      <strong>{resetModalData.appointment.nama_lengkap}</strong> (
                      {resetModalData.appointment.tingkat_label}).
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Alasan Reset Password (Audit Log Wajib)
                    </label>
                    <textarea
                      rows={2}
                      value={resetModalData.reason}
                      onChange={(e) =>
                        setResetModalData({ ...resetModalData, reason: e.target.value })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password Sementara Kustom (Kosongkan untuk acak)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. AdminSaka#8921"
                      value={resetModalData.temporaryPassword || ''}
                      onChange={(e) =>
                        setResetModalData({
                          ...resetModalData,
                          temporaryPassword: e.target.value,
                        })
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 font-mono focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setResetModalData(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={handleExecuteResetPassword}
                      className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs"
                    >
                      Konfirmasi & Reset
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Kata sandi admin berhasil direset dengan aman.</span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Kredensial Sementara Diterbitkan
                    </span>
                    <div className="flex items-center justify-between bg-white border border-slate-300 rounded-lg p-3">
                      <span className="font-mono text-sm font-bold text-slate-900">
                        {resetModalData.temporaryPassword}
                      </span>
                      <button
                        onClick={() => copyToClipboard(resetModalData.temporaryPassword || '')}
                        className="inline-flex items-center gap-1 text-xs text-purple-700 hover:text-purple-900 font-semibold px-2 py-1 rounded hover:bg-purple-50 transition-colors"
                      >
                        {copiedKey ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Disalin</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin</span>
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Berikan password ini kepada admin bersangkutan untuk login pertama kali.
                    </p>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => setResetModalData(null)}
                      className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl"
                    >
                      Selesai
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL CABUT MANDAT ADMIN ================= */}
      {revokeModalData && revokeModalData.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-rose-700 p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-200" />
                <h3 className="font-bold text-sm">Cabut Mandat Administrator</h3>
              </div>
              <button
                onClick={() => setRevokeModalData(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900">
                Apakah Anda yakin ingin mencabut mandat wewenang untuk:
                <p className="font-bold text-slate-900 mt-1">
                  {revokeModalData.appointment.nama_lengkap} (
                  {revokeModalData.appointment.tingkat_label})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  SK: {revokeModalData.appointment.nomor_sk}
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Pencabutan Mandat <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Contoh: Masa bakti kepengurusan berakhir / mutasi tugas dinas..."
                  value={revokeModalData.reason}
                  onChange={(e) =>
                    setRevokeModalData({ ...revokeModalData, reason: e.target.value })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setRevokeModalData(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleExecuteRevoke}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs"
                >
                  Ya, Cabut Mandat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
