/**
 * SPWN Apps 2.0 - Member Administration Module (Module 2)
 * Location: src/features/admin/components/MemberAdministration.tsx
 */

import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  CreditCard,
  Plus,
  Edit3,
  Eye,
  FileText,
  AlertTriangle,
  MapPin,
  Building,
  History,
  Check,
  X,
  Sparkles,
  QrCode,
  Upload,
  KeyRound,
  Copy,
  Lock,
  Download,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { AdminMemberRecord, MemberAdminStatus } from '../types/admin.types';
import { KRIDA_MASTER, MASTER_TINGKATAN_SAKA } from '../../../config/constants';
import { MemberDrawer, MemberDrawerTab } from './MemberDrawer';
import {
  wilayahService,
  MASTER_PROVINSI,
  MASTER_KABUPATEN,
  MASTER_KECAMATAN,
  getAllProvinsi,
  getProvinsiByCode,
  getKabupatenByProvinsi,
  getKabupatenByCode,
  getKecamatanByKabupaten,
  getKecamatanByCode,
  resolveProvinsiName,
  resolveKabupatenName,
  resolveKecamatanName,
  getKtaCccCode,
} from '../../../services/wilayahService';
import { OrganizationLevelType } from '../../../types/membership';
import { useUIStore } from '../../../stores/uiStore';

export const MemberAdministration: React.FC = () => {
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
    activateMember,
    updateMemberAdmin,
    addMember,
    changeHistory,
    approvals,
    ktaLogs,
    resetMemberPassword,
    selectedMemberId,
    setSelectedMemberId,
  } = useAdminStore();

  const [subTab, setSubTab] = useState<'directory' | 'approval' | 'create'>('directory');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterKrida, setFilterKrida] = useState<string>('ALL');
  const [filterProvince, setFilterProvince] = useState<string>('ALL');

  // Workflow Rejection / Revision Modal
  const [rejectWorkflowModal, setRejectWorkflowModal] = useState<{
    memberId: string;
    stage: 'WILAYAH' | 'PUSAT';
    actionType: 'REVISION' | 'REJECT';
    notes: string;
  } | null>(null);

  // Modern Member Drawer (7 Tabs + State Machine + Audit Logs + Role-Restricted Password Reset)
  const [inspectMember, setInspectMember] = useState<AdminMemberRecord | null>(null);
  const [drawerTab, setDrawerTab] = useState<MemberDrawerTab>('overview');

  const openMemberDrawer = (m: AdminMemberRecord, tab: MemberDrawerTab = 'overview') => {
    setInspectMember(m);
    setDrawerTab(tab);
  };

  // Sync with Global Search selection from Admin Command Center
  useEffect(() => {
    if (selectedMemberId) {
      const target = members.find((m) => m.id === selectedMemberId);
      if (target) {
        setInspectMember(target);
        setDrawerTab('overview');
        setSelectedMemberId(null);
      }
    }
  }, [selectedMemberId, members, setSelectedMemberId]);

  // Create member state
  const [createLevel, setCreateLevel] = useState<OrganizationLevelType>('WILAYAH');
  const [createFullName, setCreateFullName] = useState('');
  const [createProvCode, setCreateProvCode] = useState('31');
  const [createKabCode, setCreateKabCode] = useState('3171');
  const [createKecCode, setCreateKecCode] = useState('3171010');
  const [createPangkalan, setCreatePangkalan] = useState('');
  const [createKridaId, setCreateKridaId] = useState('KRIDA_PEMANDU');
  const [createTingkat, setCreateTingkat] = useState('Anggota');
  const [createEmail, setCreateEmail] = useState('');
  const [createPhone, setCreatePhone] = useState('');
  const [createStatus, setCreateStatus] = useState<MemberAdminStatus>('PENDING');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Dropdown list Kecamatan dinamis berdasarkan Kabupaten/Kota
  const availableDistricts = useMemo(() => {
    return getKecamatanByKabupaten(createKabCode);
  }, [createKabCode]);

  // Filter members based on scope & user filters
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      // 1. Enforce regional scope
      if (simulatedScope === 'ADMIN_WILAYAH') {
        if (scopeProvinceId !== 'ALL' && m.provinsi_id !== scopeProvinceId) return false;
        if (scopeRegencyId !== 'ALL' && m.kabupaten_id !== scopeRegencyId) return false;
      } else if (filterProvince !== 'ALL' && m.provinsi_id !== filterProvince) {
        return false;
      }

      // 2. Status filter
      if (filterStatus !== 'ALL' && m.status_anggota !== filterStatus) {
        return false;
      }

      // 3. Krida filter
      if (filterKrida !== 'ALL' && m.krida_id !== filterKrida) {
        return false;
      }

      // 4. Search query (nama, nomor KTA, wilayah provinsi/kab/kec, pangkalan gudep, ID)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = (m.nama_lengkap || '').toLowerCase().includes(q);
        const matchKta = (m.nomor_kta || '').toLowerCase().includes(q);
        const matchId = (m.id || '').toLowerCase().includes(q);
        const matchCity = (m.kabupaten_nama || '').toLowerCase().includes(q);
        const matchProv = (m.provinsi_nama || '').toLowerCase().includes(q);
        const matchDist = (m.wilayah_kecamatan_nama || m.kwartir_ranting || '').toLowerCase().includes(q);
        const matchGudep = (m.pangkalan_gudep || '').toLowerCase().includes(q);
        if (!matchName && !matchKta && !matchId && !matchCity && !matchProv && !matchDist && !matchGudep) return false;
      }

      return true;
    });
  }, [members, simulatedScope, scopeProvinceId, scopeRegencyId, filterProvince, filterStatus, filterKrida, searchQuery]);

  // Approval queue members (PENDING / REVIEWED_VERIFIED / REVISION_REQUIRED)
  const approvalQueue = useMemo(() => {
    return filteredMembers.filter(
      (m) =>
        m.status_anggota === 'PENDING' ||
        m.status_anggota === 'REVIEWED_VERIFIED' ||
        m.status_anggota === 'REVISION_REQUIRED'
    );
  }, [filteredMembers]);

  // Handle New Member Create
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createFullName.trim()) {
      addToast({
        type: 'error',
        title: 'Form Tidak Lengkap',
        message: 'Nama lengkap anggota wajib diisi.',
      });
      return;
    }

    const provName = resolveProvinsiName(createProvCode);
    const regName = resolveKabupatenName(createKabCode);
    const distName = resolveKecamatanName(createKecCode, createKabCode);
    const kridaObj = KRIDA_MASTER.find((k) => k.id === createKridaId);

    const isNasional = createLevel === 'KWARTIR_NASIONAL';
    const newRec = addMember({
      nomor_kta: '',
      nama_lengkap: createFullName.trim(),
      tempat_lahir: 'Indonesia',
      tanggal_lahir: '2004-01-01',
      jenis_kelamin: 'L',
      golongan_darah: 'O',
      provinsi_id: isNasional ? '00' : createProvCode,
      provinsi_nama: isNasional ? 'KWARTIR NASIONAL' : provName,
      kabupaten_id: isNasional ? '0000' : createKabCode,
      kabupaten_nama: isNasional ? 'PUSAT (KWARNAS)' : regName,
      kecamatan_id: isNasional ? '0000000' : createKecCode,
      wilayah_kecamatan_id: isNasional ? '0000000' : createKecCode,
      wilayah_kecamatan_nama: isNasional ? 'PUSAT' : distName,
      pangkalan_gudep: createPangkalan.trim() || (isNasional ? 'Kwarnas Gerakan Pramuka Pusat' : 'Pangkalan Saka Pariwisata'),
      kwartir_cabang: isNasional ? 'Kwartir Nasional' : regName,
      kwartir_ranting: isNasional ? 'Kwarnas' : distName,
      krida_id: createKridaId,
      krida_nama: kridaObj?.name || 'KRIDA PEMANDU',
      tingkat_keanggotaan: createTingkat,
      status_anggota: createStatus,
      kta_status: 'NOT_CREATED',
      status: createStatus,
      email: createEmail || `${createFullName.toLowerCase().replace(/\s+/g, '')}@spwn.id`,
      nomor_telepon: createPhone || '08123456789',
      level_organisasi: createLevel,
      tanggal_bergabung: new Date().toISOString().substring(0, 10),
    });

    setCreateSuccessMsg(`Anggota ${newRec.nama_lengkap} berhasil didaftarkan dengan ID: ${newRec.id}`);
    setCreateFullName('');
    setCreatePangkalan('');
    setCreateEmail('');
    setCreatePhone('');
  };

  // Ekspor CSV Aman (UU PDP No. 27/2022: NIK, Password, Token Kredensial Tidak Diekspor)
  const handleExportCsv = () => {
    const headers = [
      'ID Anggota',
      'Nomor KTA',
      'Nama Lengkap',
      'Jenis Kelamin',
      'Provinsi',
      'Kabupaten/Kota',
      'Kecamatan',
      'Pangkalan Gudep',
      'Krida',
      'Tingkat Keanggotaan',
      'Status Anggota',
      'Status KTA',
      'Tanggal Bergabung',
    ];

    const rows = filteredMembers.map((m) => {
      const provName = resolveProvinsiName(m.provinsi_id) || m.provinsi_nama || '';
      const kabName = resolveKabupatenName(m.kabupaten_id) || m.kabupaten_nama || '';
      const kecName =
        resolveKecamatanName(m.kecamatan_id || m.wilayah_kecamatan_id, m.kabupaten_id) ||
        m.wilayah_kecamatan_nama ||
        m.kwartir_ranting ||
        '';
      const krida = KRIDA_MASTER.find((k) => k.id === m.krida_id)?.name || m.krida_nama || '';

      return [
        `"${m.id || ''}"`,
        `"${m.nomor_kta || ''}"`,
        `"${(m.nama_lengkap || '').replace(/"/g, '""')}"`,
        `"${m.jenis_kelamin || ''}"`,
        `"${provName.replace(/"/g, '""')}"`,
        `"${kabName.replace(/"/g, '""')}"`,
        `"${kecName.replace(/"/g, '""')}"`,
        `"${(m.pangkalan_gudep || '').replace(/"/g, '""')}"`,
        `"${krida.replace(/"/g, '""')}"`,
        `"${m.tingkat_keanggotaan || ''}"`,
        `"${m.status_anggota || ''}"`,
        `"${m.kta_status || ''}"`,
        `"${m.tanggal_bergabung || ''}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SPWN_Direktori_Anggota_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Sub Tab Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSubTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              subTab === 'directory'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Direktori Anggota ({filteredMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setSubTab('approval')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'approval'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Antrean Approval 4-Tahap
            {approvalQueue.length > 0 && (
              <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded-full text-[10px]">
                {approvalQueue.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setSubTab('create')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              subTab === 'create'
                ? 'bg-[#009B4D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            Registrasi Baru
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs"
            title="Ekspor CSV Direktori (Aman UU PDP: Kolom NIK & Password Dikecualikan)"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Ekspor CSV
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 font-semibold text-[11px]">
            <Lock className="w-3 h-3" /> UU PDP: NIK Dikecualikan
          </span>
          <span>Multi-level RBAC & Hierarchical Region Scoping Active</span>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: DIREKTORI ANGGOTA                                  */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, ID anggota, No KTA, kota..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3] focus:bg-white"
              />
            </div>

            {/* Status Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
              >
                <option value="ALL">Semua Status Anggota</option>
                <option value="PENDING">PENDING (Pendaftaran Masuk)</option>
                <option value="REVIEWED_VERIFIED">REVIEWED_VERIFIED (Lolos Verifikasi Wilayah)</option>
                <option value="REVISION_REQUIRED">REVISION_REQUIRED (Perlu Revisi Dokumen)</option>
                <option value="ACTIVE">ACTIVE (Disahkan Kwarnas)</option>
                <option value="KTA_GENERATED">KTA_GENERATED (KTA Terbit & Aktif)</option>
                <option value="REJECTED">REJECTED (Ditolak)</option>
              </select>
            </div>

            {/* Krida Filter */}
            <div>
              <select
                value={filterKrida}
                onChange={(e) => setFilterKrida(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
              >
                <option value="ALL">Semua 4 Krida</option>
                {KRIDA_MASTER.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.code} - {k.name.substring(0, 24)}...
                  </option>
                ))}
              </select>
            </div>

            {/* Provinsi Filter (if not Wilayah scope) */}
            <div>
              <select
                disabled={simulatedScope === 'ADMIN_WILAYAH'}
                value={simulatedScope === 'ADMIN_WILAYAH' ? scopeProvinceId : filterProvince}
                onChange={(e) => setFilterProvince(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-2 focus:ring-[#0066B3] disabled:opacity-60"
              >
                <option value="ALL">Semua Provinsi</option>
                {MASTER_PROVINSI.map((p) => (
                  <option key={p.kode_provinsi} value={p.kode_provinsi}>
                    {p.kode_provinsi} - {p.nama_provinsi}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Members Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Identitas Anggota</th>
                    <th className="py-3 px-4">Wilayah & Kwarda</th>
                    <th className="py-3 px-4">Krida & Tingkatan</th>
                    <th className="py-3 px-4">Status 4-Tahap</th>
                    <th className="py-3 px-4 text-right">Aksi Administrasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMembers.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400">
                        Tidak ada data anggota sesuai filter atau scope wilayah.
                      </td>
                    </tr>
                  ) : (
                    filteredMembers.map((m) => {
                      const kridaInfo = KRIDA_MASTER.find((k) => k.id === m.krida_id);
                      return (
                        <tr
                          key={m.id}
                          onClick={() => openMemberDrawer(m, 'overview')}
                          className="hover:bg-slate-50/70 transition-colors cursor-pointer group"
                        >
                          {/* Nama & KTA */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                {m.foto_url ? (
                                  <img
                                    src={m.foto_url}
                                    alt={m.nama_lengkap}
                                    className="w-full h-full object-cover"
                                    referrerPolicy="no-referrer"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center font-bold text-slate-400 text-[10px]">
                                    {m.nama_lengkap.substring(0, 2).toUpperCase()}
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors truncate">
                                  {m.nama_lengkap}
                                </p>
                                <p className="text-[11px] text-slate-500 font-mono">
                                  {m.nomor_kta ? (
                                    <span className="text-emerald-700 font-semibold">{m.nomor_kta}</span>
                                  ) : (
                                    <span className="text-slate-400 italic">Belum terbit</span>
                                  )}
                                  {' • ID: '}{m.id}
                                </p>
                              </div>
                            </div>
                          </td>

                          {/* Wilayah & Pangkalan */}
                          <td className="py-3.5 px-4">
                            {(() => {
                              const provName = resolveProvinsiName(m.provinsi_id) || m.provinsi_nama || 'Kwartir Nasional';
                              const regName = resolveKabupatenName(m.kabupaten_id) || m.kabupaten_nama || '-';
                              const distName = resolveKecamatanName(m.kecamatan_id || m.wilayah_kecamatan_id, m.kabupaten_id) || m.wilayah_kecamatan_nama || m.kwartir_ranting || '';
                              return (
                                <>
                                  <p className="font-semibold text-slate-800">
                                    {regName}
                                    {distName ? ` • Kec. ${distName}` : ''}
                                  </p>
                                  <p className="text-[11px] text-slate-500">{provName}</p>
                                  {m.pangkalan_gudep && (
                                    <p className="text-[10px] text-[#0066B3] font-medium truncate max-w-[210px] mt-0.5">
                                      {m.pangkalan_gudep}
                                    </p>
                                  )}
                                </>
                              );
                            })()}
                          </td>

                          {/* Krida & Tingkat */}
                          <td className="py-3.5 px-4">
                            <span
                              className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold text-white mb-1"
                              style={{ backgroundColor: kridaInfo?.color || '#0066B3' }}
                            >
                              {kridaInfo?.code || 'SPWN'}
                            </span>
                            <p className="text-slate-700 font-medium">{m.tingkat_keanggotaan}</p>
                          </td>

                          {/* Status */}
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                                m.status_anggota === 'ACTIVE' || m.status_anggota === 'KTA_GENERATED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : m.status_anggota === 'REVIEWED_VERIFIED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : m.status_anggota === 'REVISION_REQUIRED'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : m.status_anggota === 'PENDING'
                                  ? 'bg-amber-100 text-amber-800'
                                  : m.status_anggota === 'REJECTED'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {(m.status_anggota === 'ACTIVE' || m.status_anggota === 'KTA_GENERATED') && <CheckCircle2 className="w-3 h-3" />}
                              {m.status_anggota === 'REVIEWED_VERIFIED' && <Award className="w-3 h-3" />}
                              {m.status_anggota === 'REVISION_REQUIRED' && <AlertTriangle className="w-3 h-3 text-amber-600" />}
                              {m.status_anggota === 'PENDING' && <Clock className="w-3 h-3" />}
                              {m.status_anggota === 'REJECTED' && <X className="w-3 h-3" />}
                              {m.status_anggota}
                            </span>
                          </td>

                          {/* Aksi */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => openMemberDrawer(m, 'overview')}
                                title="Buka Profil & Opsi Akses Anggota"
                                className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-colors cursor-pointer"
                              >
                                <KeyRound className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => openMemberDrawer(m, 'profil')}
                                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs inline-flex items-center gap-1 transition-colors cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                Detail & Koreksi
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: ANTREAN APPROVAL 4-TAHAP                           */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'approval' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#0066B3] shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Siklus Verifikasi & Aktivasi 4-Tahap SPWN Apps 2.0</p>
              <p className="text-blue-700 mt-0.5 leading-relaxed">
                <strong>1. DRAFT</strong> (Kelengkapan berkas) &rarr; 
                <strong> 2. VERIFICATION</strong> (Verifikasi faktual admin wilayah) &rarr; 
                <strong> 3. APPROVED</strong> (Persetujuan Kwartir) &rarr; 
                <strong> 4. ACTIVE</strong> (Penerbitan otomatis Nomor KTA + QR Token + Akun Login).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {approvalQueue.length === 0 ? (
              <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Antrean approval kosong. Seluruh berkas anggota telah diproses tuntas.
              </div>
            ) : (
              approvalQueue.map((m) => (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.status_anggota === 'ACTIVE'
                            ? 'bg-emerald-100 text-emerald-800'
                            : m.status_anggota === 'REVIEWED_VERIFIED'
                            ? 'bg-blue-100 text-blue-800'
                            : m.status_anggota === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        Tahap: {m.status_anggota}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{m.nama_lengkap}</h4>
                      <p className="text-xs text-slate-500 font-mono">
                        ID: {m.id} • {m.kabupaten_nama}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-medium">Tgl Daftar</span>
                      <p className="text-xs font-semibold text-slate-700">{m.tanggal_bergabung}</p>
                    </div>
                  </div>

                  {/* 3-Step Progress Indicator */}
                  <div className="grid grid-cols-3 gap-1.5 py-1">
                    <div className="h-1.5 rounded-full bg-emerald-500" title="1. Pendaftaran Berkas" />
                    <div
                      className={`h-1.5 rounded-full ${
                        m.status_anggota === 'REVIEWED_VERIFIED' || m.status_anggota === 'ACTIVE'
                          ? 'bg-blue-500'
                          : 'bg-slate-200'
                      }`}
                      title="2. Review & Verifikasi Wilayah"
                    />
                    <div
                      className={`h-1.5 rounded-full ${
                        m.status_anggota === 'ACTIVE' ? 'bg-[#009B4D]' : 'bg-slate-200'
                      }`}
                      title="3. Final Approval Pusat & KTA Terbit"
                    />
                  </div>

                  {/* Actions based on RBAC Final */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                    {/* Tahap 1: PENDING - Admin Wilayah / Pusat / Super Admin */}
                    {m.status_anggota === 'PENDING' && (
                      <div className="w-full flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setRejectWorkflowModal({
                                memberId: m.id,
                                stage: 'WILAYAH',
                                actionType: 'REVISION',
                                notes: '',
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-bold transition-all cursor-pointer"
                          >
                            Minta Revisi
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setRejectWorkflowModal({
                                memberId: m.id,
                                stage: 'WILAYAH',
                                actionType: 'REJECT',
                                notes: '',
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 text-xs font-bold transition-all cursor-pointer"
                          >
                            Tolak
                          </button>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            reviewMember(m.id, 'Berkas diverifikasi absah oleh Admin Wilayah', 'Admin Wilayah', simulatedScope);
                            addToast({
                              type: 'success',
                              title: 'Berkas Terverifikasi',
                              message: `Anggota ${m.nama_lengkap} lolos verifikasi tahap Wilayah (REVIEWED_VERIFIED).`,
                            });
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Review & Verifikasi Berkas (Wilayah)
                        </button>
                      </div>
                    )}

                    {/* Tahap REVISION_REQUIRED */}
                    {m.status_anggota === 'REVISION_REQUIRED' && (
                      <div className="w-full flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] text-amber-900 font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          Menunggu / Perlu Perbaikan Berkas
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openMemberDrawer(m, 'overview')}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold cursor-pointer"
                          >
                            Buka Detail
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              reviewMember(m.id, 'Berkas perbaikan telah diverifikasi ulang absah', 'Admin Wilayah', simulatedScope);
                              addToast({
                                type: 'success',
                                title: 'Verifikasi Ulang Lolos',
                                message: `Anggota ${m.nama_lengkap} kini berstatus REVIEWED_VERIFIED.`,
                              });
                            }}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Verifikasi Ulang &rarr;
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Tahap 2: REVIEWED_VERIFIED - Menunggu Final Approval Admin Pusat */}
                    {m.status_anggota === 'REVIEWED_VERIFIED' && (
                      <div className="w-full flex items-center justify-between gap-2 flex-wrap">
                        <span className="text-[11px] text-sky-800 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-sky-600" />
                          Berkas Lolos Verifikasi Wilayah
                        </span>

                        {simulatedScope === 'ADMIN_WILAYAH' ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectWorkflowModal({
                                  memberId: m.id,
                                  stage: 'WILAYAH',
                                  actionType: 'REVISION',
                                  notes: '',
                                });
                              }}
                              className="px-2.5 py-1 rounded bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold hover:bg-amber-100 cursor-pointer"
                            >
                              Minta Revisi Tambahan
                            </button>
                            <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-600 border border-slate-200 text-[11px] font-semibold">
                              Menunggu Final Approval Pusat
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setRejectWorkflowModal({
                                  memberId: m.id,
                                  stage: 'PUSAT',
                                  actionType: 'REVISION',
                                  notes: '',
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 text-xs font-semibold cursor-pointer"
                            >
                              Revisi
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectWorkflowModal({
                                  memberId: m.id,
                                  stage: 'PUSAT',
                                  actionType: 'REJECT',
                                  notes: '',
                                });
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold cursor-pointer"
                            >
                              Tolak
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                approveMember(m.id, 'Disetujui Admin Pusat', 'Admin Pusat', simulatedScope);
                                const res = activateMember(m.id, 'Penerbitan KTA & QR Identity', 'Admin Pusat');
                                addToast({
                                  type: 'success',
                                  title: 'Anggota Disetujui & KTA Terbit',
                                  message: `Nomor KTA: ${res.nomorKta} berhasil diterbitkan dengan QR Token aktif.`,
                                });
                              }}
                              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Final Approval & Terbitkan KTA
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: REGISTRASI BARU MANUAL & KOLEKTIF                  */}
      {/* ------------------------------------------------------------- */}
      {subTab === 'create' && (
        <div className="max-w-3xl bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5">
          <div>
            <h3 className="text-base font-bold text-slate-900">Formulir Registrasi Anggota SPWN Apps 2.0</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Pendaftaran resmi dengan scoping wilayah BPS & peminatan 4 Krida SAKA Pariwisata
            </p>
          </div>

          {createSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#009B4D] shrink-0" />
              <span>{createSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
            {/* Level Organisasi */}
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center gap-4">
              <span className="font-bold text-slate-700">Tingkat Organisasi:</span>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="createLevel"
                  checked={createLevel === 'WILAYAH'}
                  onChange={() => setCreateLevel('WILAYAH')}
                  className="text-[#0066B3]"
                />
                Kwarda / Kwarcab / Wilayah (Format 00.PPKK.CCC.NNNNNN)
              </label>
              <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                <input
                  type="radio"
                  name="createLevel"
                  checked={createLevel === 'KWARTIR_NASIONAL'}
                  onChange={() => setCreateLevel('KWARTIR_NASIONAL')}
                  className="text-[#0066B3]"
                />
                Kwartir Nasional (Format 00.NNNNNN)
              </label>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Nama Lengkap (Sesuai Identitas Resmi) *</label>
              <input
                type="text"
                required
                value={createFullName}
                onChange={(e) => setCreateFullName(e.target.value)}
                placeholder="Contoh: Raden Surya Pratama"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Provinsi</label>
                <select
                  value={createProvCode}
                  onChange={(e) => {
                    const newProv = e.target.value;
                    setCreateProvCode(newProv);
                    const list = getKabupatenByProvinsi(newProv);
                    if (list.length > 0) {
                      setCreateKabCode(list[0].kode_kabupaten);
                      const dists = getKecamatanByKabupaten(list[0].kode_kabupaten);
                      if (dists.length > 0) {
                        setCreateKecCode(dists[0].kode_kecamatan);
                      }
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                >
                  {MASTER_PROVINSI.map((p) => (
                    <option key={p.kode_provinsi} value={p.kode_provinsi}>
                      {p.kode_provinsi} - {p.nama_provinsi}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kabupaten/Kota</label>
                <select
                  value={createKabCode}
                  onChange={(e) => {
                    const newKab = e.target.value;
                    setCreateKabCode(newKab);
                    const dists = getKecamatanByKabupaten(newKab);
                    if (dists.length > 0) {
                      setCreateKecCode(dists[0].kode_kecamatan);
                    }
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                >
                  {getKabupatenByProvinsi(createProvCode).map((r) => (
                    <option key={r.kode_kabupaten} value={r.kode_kabupaten}>
                      {r.kode_kabupaten} - {r.nama_kabupaten}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Kecamatan</label>
                <select
                  value={createKecCode}
                  onChange={(e) => setCreateKecCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                >
                  {availableDistricts.map((d) => (
                    <option key={d.kode_kecamatan} value={d.kode_kecamatan}>
                      {d.kode_kecamatan} - {d.nama_kecamatan}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pangkalan Gugusdepan Asal */}
            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Pangkalan Gugusdepan Asal
                <span className="text-slate-400 font-normal text-xs ml-1.5">(Basis pangkalan sekolah / perguruan tinggi / gudep)</span>
              </label>
              <input
                type="text"
                value={createPangkalan}
                onChange={(e) => setCreatePangkalan(e.target.value)}
                placeholder="Contoh: Gudep 01.001 - 01.002 Pangkalan SMAN 1 Cibinong"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0066B3] focus:bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Peminatan 4 Krida SAKA</label>
                <select
                  value={createKridaId}
                  onChange={(e) => setCreateKridaId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                >
                  {KRIDA_MASTER.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Peran / Tingkat Keanggotaan Saka</label>
                <select
                  value={createTingkat}
                  onChange={(e) => setCreateTingkat(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                >
                  {MASTER_TINGKATAN_SAKA.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Aktif</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="pramuka@spwn.id"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nomor WhatsApp</label>
                <input
                  type="text"
                  value={createPhone}
                  onChange={(e) => setCreatePhone(e.target.value)}
                  placeholder="081234567890"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0066B3]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Tahap Awal Pendaftaran</label>
                <select
                  value={createStatus}
                  onChange={(e) => setCreateStatus(e.target.value as MemberAdminStatus)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-semibold text-[#0066B3] focus:ring-2 focus:ring-[#0066B3]"
                >
                  <option value="VERIFICATION">VERIFICATION (Langsung Antrean)</option>
                  <option value="DRAFT">DRAFT (Pendaftaran Awal)</option>
                  <option value="APPROVED">APPROVED (Siap Aktivasi KTA)</option>
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-[#0066B3] hover:bg-[#004C85] text-white font-bold shadow-xs transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Simpan & Daftarkan Anggota
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* DRAWER: 7-TAB MEMBER DRAWER MODERN & WORKFLOW STATE MACHINE   */}
      {/* ------------------------------------------------------------- */}
      <MemberDrawer
        member={inspectMember}
        isOpen={Boolean(inspectMember)}
        onClose={() => setInspectMember(null)}
        initialTab={drawerTab}
      />

      {/* ================= MODAL REVISI / TOLAK WORKFLOW APPROVAL ================= */}
      {rejectWorkflowModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
            <div className={`p-4 text-white flex items-center justify-between ${
              rejectWorkflowModal.actionType === 'REVISION' ? 'bg-amber-600' : 'bg-rose-600'
            }`}>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white/90" />
                <h3 className="font-bold text-sm">
                  {rejectWorkflowModal.actionType === 'REVISION'
                    ? `Minta Revisi Berkas (${rejectWorkflowModal.stage === 'WILAYAH' ? 'Wilayah' : 'Pusat'})`
                    : `Tolak Pendaftaran (${rejectWorkflowModal.stage === 'WILAYAH' ? 'Wilayah' : 'Pusat'})`}
                </h3>
              </div>
              <button
                onClick={() => setRejectWorkflowModal(null)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setRejectWorkflowModal({ ...rejectWorkflowModal, actionType: 'REVISION' })}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    rejectWorkflowModal.actionType === 'REVISION'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Minta Revisi Berkas
                </button>
                <button
                  type="button"
                  onClick={() => setRejectWorkflowModal({ ...rejectWorkflowModal, actionType: 'REJECT' })}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all ${
                    rejectWorkflowModal.actionType === 'REJECT'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Tolak Permanen
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {rejectWorkflowModal.actionType === 'REVISION'
                  ? 'Status anggota akan dialihkan ke REVISION_REQUIRED. Anggota dapat memperbaiki berkas atau data yang keliru.'
                  : 'Status anggota akan dialihkan ke REJECTED secara permanen. Tindakan tercatat di audit log.'}
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan {rejectWorkflowModal.actionType === 'REVISION' ? 'Revisi Dokumen' : 'Alasan Penolakan'} <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  value={rejectWorkflowModal.notes}
                  onChange={(e) => setRejectWorkflowModal({ ...rejectWorkflowModal, notes: e.target.value })}
                  placeholder={
                    rejectWorkflowModal.actionType === 'REVISION'
                      ? 'Contoh: Lampiran foto KTP buram, mohon unggah ulang dengan pencahayaan jelas...'
                      : 'Contoh: Tidak memenuhi persyaratan domisili pangkalan Saka Pariwisata...'
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setRejectWorkflowModal(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!rejectWorkflowModal.notes.trim()) {
                      addToast({
                        type: 'error',
                        title: 'Catatan Diperlukan',
                        message: 'Silakan isi alasan penolakan atau instruksi revisi berkas.',
                      });
                      return;
                    }

                    if (rejectWorkflowModal.actionType === 'REVISION') {
                      requestRevisionMember(
                        rejectWorkflowModal.memberId,
                        rejectWorkflowModal.notes.trim(),
                        rejectWorkflowModal.stage === 'WILAYAH' ? 'Admin Wilayah' : 'Admin Pusat',
                        simulatedScope
                      );
                      addToast({
                        type: 'warning',
                        title: 'Permintaan Revisi Dikirim',
                        message: 'Status anggota diubah ke REVISION_REQUIRED dengan catatan.',
                      });
                    } else {
                      rejectMember(
                        rejectWorkflowModal.memberId,
                        rejectWorkflowModal.notes.trim(),
                        rejectWorkflowModal.stage === 'WILAYAH' ? 'Admin Wilayah' : 'Admin Pusat',
                        simulatedScope
                      );
                      addToast({
                        type: 'error',
                        title: 'Pendaftaran Ditolak',
                        message: 'Status anggota diubah ke REJECTED.',
                      });
                    }
                    setRejectWorkflowModal(null);
                  }}
                  className={`px-4 py-2 rounded-xl text-white text-xs font-bold shadow-xs cursor-pointer ${
                    rejectWorkflowModal.actionType === 'REVISION'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {rejectWorkflowModal.actionType === 'REVISION' ? 'Kirim Permintaan Revisi' : 'Konfirmasi Tolak Pendaftaran'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

          </div>
  );
};
