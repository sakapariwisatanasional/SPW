import React, { useState, useMemo, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  CreditCard,
  Plus,
  Shield,
  FileSpreadsheet,
  CheckCircle2,
  Building2,
  MapPin,
  Sparkles,
  User,
  LayoutGrid,
  List,
  Copy,
  QrCode,
  ArrowRight,
  RotateCw,
  ExternalLink,
} from 'lucide-react';
import {
  Button,
  Card,
  Badge,
  Input,
  Select,
  Table,
  Modal,
  Tabs,
} from '../../../components/ui';
import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';
import { DigitalKTACard } from '../components/locked/DigitalKTACard';
import { MemberProfileModal } from '../components/MemberProfileModal';
import { KRIDA_MASTER, PROVINCES_INDONESIA, TINGKAT_GOLONGAN_PRAMUKA } from '../../../config/constants';
import { useUIStore } from '../../../stores/uiStore';
import { MemberRecord, OrganizationLevelType } from '../../../types/membership';
import {
  PROVINCES,
  REGENCIES,
  SAMPLE_DISTRICTS,
  getRegenciesByProvince,
  getDistrictsByRegency,
  getProvinceByCode,
  getRegencyByCode,
  resolveDistrictName,
} from '../../../data/wilayahData';
import { storage } from '../../../services/storage';
import { ktaService } from '../../../services/ktaService';
import { memberApi } from '../../../services/api/member.api';

export const MembershipPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('directory');
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [copiedKta, setCopiedKta] = useState<string | null>(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedKrida, setSelectedKrida] = useState('ALL');
  const [selectedProvince, setSelectedProvince] = useState('ALL');
  const [selectedLevel, setSelectedLevel] = useState<'ALL' | OrganizationLevelType>('ALL');
  const [selectedMemberForKTA, setSelectedMemberForKTA] = useState<MemberRecord | null>(null);

  // Modal Pendaftaran & Generator KTA Interaktif
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [regLevel, setRegLevel] = useState<OrganizationLevelType>('WILAYAH');
  const [regFullName, setRegFullName] = useState('');
  const [regNik, setRegNik] = useState('');
  const [regProvCode, setRegProvCode] = useState('32');
  const [regKabCode, setRegKabCode] = useState('3201'); // Bogor
  const [regKecCode, setRegKecCode] = useState('010'); // Nanggung
  const [regKridaId, setRegKridaId] = useState('KRIDA_PEMANDU');
  const [regLevelKeanggotaan, setRegLevelKeanggotaan] = useState('Penegak');
  const [regSequence, setRegSequence] = useState('1');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const { addToast } = useUIStore();

  // Database Anggota SPWN (Sesuai Aturan KTA Format Final)
  // 1. Kwartir Nasional: 00.NNNNNN
  // 2. Wilayah: 00.PPKK.CCC.NNNNNN (Tanpa kode provinsi pada nomor KTA, namun kode provinsi, kab, kec tetap tersimpan di database)
  const [members, setMembers] = useState<MemberRecord[]>([]);


  useEffect(() => {
    async function loadMembers() {
      try {
        setLoadingMembers(true);
        const response = await memberApi.list();
        const rawData = response.data as unknown;
        const items = Array.isArray(rawData)
          ? rawData
          : (rawData as { items?: any[] })?.items || [];

        const mapped: MemberRecord[] = items.map((item: any, idx: number) => {
          const id = item.id || item.ID || `MEM-${idx + 1}`;
          const noKta = item.noKta || item.nomor_kta || item['Nomor KTA'] || '';
          const fullName = item.fullName || item.nama_lengkap || item['Nama Lengkap'] || 'Anggota SAKA';
          const gender = (item.gender || item.jenis_kelamin || item.Gender || 'L').toString().toUpperCase().startsWith('P') ? 'P' : 'L';
          const province = item.province || item.provinsi_nama || item['Provinsi'] || '';
          const city = item.city || item.kabupaten_nama || item['Kabupaten/Kota'] || '';
          const kecamatan = item.kecamatan || item.wilayah_kecamatan_nama || item['Kecamatan'] || '';
          const kridaName = item.kridaName || item.krida_nama || item['Krida'] || 'KRIDA PEMANDU';
          const membershipLevel = item.membershipLevel || item.tingkat_keanggotaan || item['Jabatan'] || 'Penegak';
          const photoUrl = item.photoUrl || item.foto_url || item['Foto URL'] || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80';
          const status = item.status || item.status_anggota || item['Status'] || 'ACTIVE';
          const verificationToken = item.verificationToken || item.qr_token || item['QR Token'] || '';
          const joinedDate = item.joinedDate || item.tanggal_bergabung || item['Tanggal Daftar'] || new Date().toISOString().slice(0, 10);
          const createdAt = item.createdAt || item.created_at || item['Created At'] || new Date().toISOString();

          return {
            id,
            noKta,
            fullName,
            gender,
            birthPlace: item.birthPlace || item.tempat_lahir || '',
            birthDate: item.birthDate || item.tanggal_lahir || '',
            levelOrganisasi: (item.levelOrganisasi || item.level_organisasi || 'WILAYAH') as OrganizationLevelType,
            kodeProvinsi: item.kodeProvinsi || item.provinsi_id || '',
            kodeKabupaten: item.kodeKabupaten || item.kabupaten_id || '',
            kodeKecamatan: item.kodeKecamatan || item.kecamatan_id || '',
            province,
            city,
            kecamatan,
            address: item.address || item.alamat_domisili || '',
            kridaId: item.kridaId || item.krida_id || 'KRIDA_PEMANDU',
            kridaName,
            membershipLevel,
            photoUrl,
            status: status as any,
            verificationToken,
            joinedDate,
            createdAt,
          };
        });

        setMembers(mapped);
      } catch (error) {
        console.error('Gagal mengambil data anggota dari spreadsheet', error);
      } finally {
        setLoadingMembers(false);
      }
    }

    loadMembers();
  }, []);


  // List opsi Kabupaten berdasarkan Provinsi terpilih di formulir
  const availableRegencies = useMemo(() => {
    return getRegenciesByProvince(regProvCode);
  }, [regProvCode]);

  // List opsi Kecamatan berdasarkan Kabupaten terpilih di formulir
  const availableDistricts = useMemo(() => {
    const d = getDistrictsByRegency(regKabCode);
    return d.length > 0 ? d : SAMPLE_DISTRICTS.filter((item) => item.regencyCode === '3201');
  }, [regKabCode]);

  // Preview Nomor KTA yang dihasilkan secara real-time
  const previewGeneratedKta = useMemo(() => {
    return ktaService.generateKtaNumber({
      level: regLevel,
      kodeKabupaten: regKabCode,
      kodeKecamatan: regKecCode,
      sequence: regSequence || 1,
    });
  }, [regLevel, regKabCode, regKecCode, regSequence]);

  // Filter Direktori
  const filteredMembers = members.filter((m) => {
    const matchKeyword =
      m.fullName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      m.noKta.toLowerCase().includes(searchKeyword.toLowerCase()) ||
      (m.city && m.city.toLowerCase().includes(searchKeyword.toLowerCase())) ||
      (m.kodeKabupaten && m.kodeKabupaten.includes(searchKeyword));

    const matchKrida = selectedKrida === 'ALL' || m.kridaId === selectedKrida;
    const matchProvince = selectedProvince === 'ALL' || m.province === selectedProvince;
    const matchLevel = selectedLevel === 'ALL' || m.levelOrganisasi === selectedLevel;

    return matchKeyword && matchKrida && matchProvince && matchLevel;
  });

  const handleCreateMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName.trim()) {
      addToast({ type: 'error', title: 'Validasi', message: 'Nama lengkap anggota wajib diisi' });
      return;
    }
    if (!regNik || regNik.length !== 16 || !/^\d{16}$/.test(regNik)) {
      addToast({ type: 'error', title: 'Validasi NIK', message: 'NIK harus terdiri dari 16 digit angka' });
      return;
    }

    const regencyObj = getRegencyByCode(regKabCode);
    const provObj = getProvinceByCode(regProvCode);
    const districtObj = availableDistricts.find((d) => d.districtCode3 === regKecCode);

    const generatedKta = previewGeneratedKta;
    const qrToken = ktaService.generateQrToken(generatedKta, regNik);

    const newMember: MemberRecord = {
      id: `MEM-${Date.now().toString().slice(-4)}`,
      noKta: generatedKta,
      fullName: regFullName,
      gender: 'L',
      birthPlace: regencyObj ? regencyObj.name : 'Indonesia',
      birthDate: '2004-01-01',
      levelOrganisasi: regLevel,
      kodeProvinsi: regLevel === 'KWARTIR_NASIONAL' ? '00' : regProvCode,
      kodeKabupaten: regLevel === 'KWARTIR_NASIONAL' ? '0000' : regKabCode,
      kodeKecamatan: regLevel === 'KWARTIR_NASIONAL' ? '000' : regKecCode,
      province: regLevel === 'KWARTIR_NASIONAL' ? 'Kwartir Nasional' : (provObj ? provObj.name : 'Provinsi'),
      city: regLevel === 'KWARTIR_NASIONAL' ? 'Pusat (Kwarnas)' : (regencyObj ? regencyObj.name : 'Kabupaten/Kota'),
      kecamatan: districtObj ? districtObj.name : (regLevel === 'KWARTIR_NASIONAL' ? 'Pusat' : 'Kecamatan'),
      address: 'Pangkalan Saka Pariwisata',
      kridaId: regKridaId,
      kridaName: KRIDA_MASTER.find((k) => k.id === regKridaId)?.name || 'KRIDA PEMANDU',
      membershipLevel: regLevelKeanggotaan,
      photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      verificationToken: qrToken,
      joinedDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
    };

    setMembers([newMember, ...members]);
    setIsRegisterModalOpen(false);
    setRegFullName('');
    setRegNik('');
    setRegSequence(String(parseInt(regSequence || '1', 10) + 1));

    addToast({
      type: 'success',
      title: 'Pendaftaran Berhasil',
      message: `Anggota berhasil didaftarkan dengan No. KTA: ${generatedKta}`,
    });
  };

  const memberColumns = [
    {
      key: 'noKta',
      header: 'No. KTA Resmi',
      width: '190px',
      render: (m: MemberRecord) => {
        const isNas = m.levelOrganisasi === 'KWARTIR_NASIONAL';
        return (
          <div className="space-y-1">
            <span
              className={`font-mono text-xs font-bold px-2 py-0.5 rounded border inline-block ${
                isNas
                  ? 'bg-amber-50 text-amber-900 border-amber-300'
                  : 'bg-emerald-50 text-emerald-900 border-emerald-300'
              }`}
            >
              {m.noKta}
            </span>
            <div className="text-[10px] text-slate-500 flex items-center gap-1 font-mono">
              {isNas ? (
                <span className="text-amber-700 font-semibold">Format: 00.NNNNNN</span>
              ) : (
                <span>
                  PPKK: <b className="text-slate-700">{m.kodeKabupaten || '-'}</b> | CCC:{' '}
                  <b className="text-slate-700">{m.kodeKecamatan || '-'}</b>
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      key: 'fullName',
      header: 'Nama & Tingkat',
      render: (m: MemberRecord) => (
        <div className="flex items-center gap-2.5">
          <img
            src={m.photoUrl}
            alt={m.fullName}
            className="w-8 h-8 rounded-full object-cover border border-slate-200"
            referrerPolicy="no-referrer"
          />
          <div>
            <p className="font-semibold text-slate-900 text-xs">{m.fullName}</p>
            <p className="text-[10px] text-slate-500">{m.membershipLevel}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'level',
      header: 'Tingkat Organisasi',
      render: (m: MemberRecord) => {
        const isNas = m.levelOrganisasi === 'KWARTIR_NASIONAL';
        return (
          <Badge variant={isNas ? 'orange' : 'blue'} size="sm">
            {isNas ? 'Kwartir Nasional' : 'Wilayah'}
          </Badge>
        );
      },
    },
    {
      key: 'wilayah',
      header: 'Wilayah (PPKK & CCC)',
      render: (m: MemberRecord) => {
        const provName = (m.kodeProvinsi && getProvinceByCode(m.kodeProvinsi)?.name) || m.province || 'Kwartir Nasional';
        const regName = (m.kodeKabupaten && getRegencyByCode(m.kodeKabupaten)?.name) || m.city || 'Pusat (Kwarnas)';
        const distName = (m.kodeKabupaten && m.kodeKecamatan && resolveDistrictName(m.kodeKabupaten, m.kodeKecamatan)) || m.kecamatan || '';
        return (
          <div className="text-xs space-y-0.5">
            <p className="font-medium text-slate-800">{provName}</p>
            <p className="text-[11px] text-slate-500">
              {regName} {distName ? `• Kec. ${distName}` : ''}
            </p>
          </div>
        );
      },
    },
    {
      key: 'krida',
      header: 'Krida',
      render: (m: MemberRecord) => (
        <Badge variant="blue" size="sm">
          {m.kridaName.replace('Krida ', '')}
        </Badge>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (m: MemberRecord) => (
        <Badge variant={m.status === 'ACTIVE' ? 'green' : 'orange'} size="sm" dot>
          {m.status === 'ACTIVE' ? 'Aktif' : 'Verifikasi'}
        </Badge>
      ),
    },
    {
      key: 'action',
      header: 'Aksi KTA',
      align: 'right' as const,
      render: (m: MemberRecord) => (
        <Button
          size="sm"
          variant="outline"
          leftIcon={<CreditCard className="w-3.5 h-3.5 text-[#0066B3]" />}
          onClick={() => setSelectedMemberForKTA(m)}
        >
          Lihat KTA
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title Bar & Info Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 flex items-center gap-2">
            Manajemen Keanggotaan & KTA Digital
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pusat Data Anggota Saka Pariwisata Nasional
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-initial text-xs"
            leftIcon={<User className="w-4 h-4 text-[#0066B3]" />}
            onClick={() => setIsProfileModalOpen(true)}
          >
            Profil & Akun Saya
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1 sm:flex-initial text-xs bg-[#0066B3] text-white"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsRegisterModalOpen(true)}
          >
            Registrasi & Generator KTA
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'identity-center', label: 'Pusat KTA Digital', icon: <CreditCard className="w-4 h-4" /> },
          { id: 'directory', label: `Direktori Anggota (${filteredMembers.length})`, icon: <Users className="w-4 h-4" /> },
          { id: 'krida', label: 'Master Krida SAKA', icon: <Shield className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Identity Center Tab */}
      {activeTab === 'identity-center' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-[#0066B3] to-[#009B4D] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl text-center md:text-left">
                <span className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-xs">
                  Official Identity Center SPWN
                </span>
                <h2 className="text-2xl sm:text-3xl font-black">
                  Kartu Tanda Anggota Elektronik (E-KTA)
                </h2>
                <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                  Identitas resmi anggota SAKA Pariwisata Nasional yang terintegrasi dengan basis data Kwartir, dilengkapi QR Code validasi keaslian, dan berlaku di seluruh pangkalan Nusantara.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto bg-white/20 border-white/30 text-white hover:bg-white/30 font-bold text-xs"
                  onClick={() => setIsProfileModalOpen(true)}
                  leftIcon={<User className="w-4 h-4" />}
                >
                  Edit Profil Saya
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  className="w-full sm:w-auto font-bold text-slate-950 text-xs"
                  onClick={() => {
                    const primaryMember = members[0];
                    if (primaryMember) setSelectedMemberForKTA(primaryMember);
                  }}
                  leftIcon={<CreditCard className="w-4 h-4 text-slate-950" />}
                >
                  Buka Kartu Interaktif
                </Button>
              </div>
            </div>
          </div>

          {/* Featured Identity Card Preview Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            <div className="lg:col-span-7 flex flex-col items-center justify-center p-6 sm:p-8 bg-slate-900 rounded-3xl shadow-md border border-slate-800">
              <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-4 pb-2 border-b border-slate-800">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-4 h-4" /> KTA Aktif & Terverifikasi
                </span>
                <span className="font-mono">Format: ISO/IEC 7810 ID-1</span>
              </div>

              {members[0] ? (
                <div className="w-full flex justify-center py-2">
                  <DigitalKTACard
                    memberData={{
                      fullName: members[0].fullName,
                      noKta: members[0].noKta,
                      membershipLevel: members[0].membershipLevel,
                      kridaName: members[0].kridaName,
                      province: members[0].province,
                      city: members[0].city,
                      kecamatan: members[0].kecamatan,
                      levelOrganisasi: members[0].levelOrganisasi,
                      kodeProvinsi: members[0].kodeProvinsi,
                      kodeKabupaten: members[0].kodeKabupaten,
                      kodeKecamatan: members[0].kodeKecamatan,
                      joinedDate: members[0].joinedDate,
                      photoUrl: members[0].photoUrl,
                      verificationToken: members[0].verificationToken,
                      status: members[0].status,
                    }}
                  />
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 space-y-3">
                  <CreditCard className="w-12 h-12 text-slate-600 mx-auto" />
                  <p className="text-sm font-semibold text-slate-300">Belum Ada KTA Terbit di Spreadsheet</p>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    Data keanggotaan terhubung langsung ke Google Sheets. Lakukan registrasi untuk menerbitkan KTA resmi pertama.
                  </p>
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => setIsRegisterModalOpen(true)}
                    className="bg-[#009B4D] hover:bg-emerald-700"
                  >
                    Daftar & Terbitkan KTA
                  </Button>
                </div>
              )}
            </div>

            {/* Identity Actions & Specifications */}
            <div className="lg:col-span-5 space-y-4">
              <Card padding="lg" className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-bold text-slate-900">Spesifikasi Kartu Anggota</h3>
                  <Badge variant="blue">Terstandarisasi</Badge>
                </div>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nama Pemegang:</span>
                    <span className="font-bold text-slate-900">{members[0]?.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Nomor KTA:</span>
                    <span className="font-mono font-bold text-[#0066B3]">{members[0]?.noKta}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Krida Spesialisasi:</span>
                    <span className="font-semibold text-emerald-700">{members[0]?.kridaName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-100">
                    <span className="text-slate-500">Wilayah Pangkalan:</span>
                    <span className="font-semibold text-slate-700">{members[0]?.city}, {members[0]?.province}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Status Keanggotaan:</span>
                    <Badge variant="green" size="sm">AKTIF RESMI</Badge>
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="w-full justify-center font-bold"
                    leftIcon={<Copy className="w-4 h-4" />}
                    onClick={() => {
                      if (members[0]?.noKta) {
                        navigator.clipboard.writeText(members[0].noKta);
                        setCopiedKta(members[0].noKta);
                        addToast({
                          type: 'success',
                          title: 'Nomor KTA Tersalin',
                          message: `${members[0].noKta} berhasil disalin ke clipboard.`,
                        });
                        setTimeout(() => setCopiedKta(null), 2000);
                      }
                    }}
                  >
                    {copiedKta === members[0]?.noKta ? 'Nomor KTA Tersalin!' : 'Salin Nomor KTA'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-center"
                    leftIcon={<QrCode className="w-4 h-4 text-emerald-600" />}
                    onClick={() => {
                      if (members[0]) setSelectedMemberForKTA(members[0]);
                    }}
                  >
                    Buka Pratinjau KTA Desain Penuh
                  </Button>
                </div>
              </Card>

              <Card padding="md" className="bg-gradient-to-br from-blue-50 to-emerald-50 border-blue-100">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#0066B3] shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <p className="font-bold text-slate-900">Validasi Digital Anti-Pemalsuan</p>
                    <p className="text-slate-600 leading-relaxed">
                      Setiap kartu memiliki signature token QR Code dinamis yang dapat dipindai oleh publik maupun panitia perkemahan nasional untuk menjamin orisinalitas data.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Directory Tab */}
      {activeTab === 'directory' && (
        <div className="space-y-4">
          {/* Filters Bar & View Mode Switcher */}
          <Card padding="md">
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <Input
                    placeholder="Cari nama, No KTA, kode PPKK..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    leftIcon={<Search className="w-4 h-4 text-slate-400" />}
                  />
                </div>

                {/* View Switcher Controls */}
                <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl shrink-0 self-start sm:self-auto">
                  <button
                    onClick={() => setViewMode('cards')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'cards'
                        ? 'bg-white text-[#0066B3] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                    <span>Kartu Modern</span>
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      viewMode === 'table'
                        ? 'bg-white text-[#0066B3] shadow-xs'
                        : 'text-slate-500 hover:text-slate-900'
                    }`}
                  >
                    <List className="w-3.5 h-3.5" />
                    <span>Tabel Data</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <Select
                  options={[
                    { value: 'ALL', label: 'Semua Tingkat Organisasi' },
                    { value: 'KWARTIR_NASIONAL', label: 'Kwartir Nasional (00.NNNNNN)' },
                    { value: 'WILAYAH', label: 'Wilayah / Daerah (00.PPKK.CCC.NNNNNN)' },
                  ]}
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value as any)}
                />

                <Select
                  options={[
                    { value: 'ALL', label: 'Semua Krida Spesialisasi' },
                    ...KRIDA_MASTER.map((k) => ({ value: k.id, label: k.name })),
                  ]}
                  value={selectedKrida}
                  onChange={(e) => setSelectedKrida(e.target.value)}
                />

                <Select
                  options={[
                    { value: 'ALL', label: 'Semua Provinsi' },
                    ...PROVINCES.map((p) => ({ value: p.name, label: `${p.code} - ${p.name}` })),
                  ]}
                  value={selectedProvince}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                />
              </div>
            </div>
          </Card>

          {/* Directory Content: Loading, Empty, or Cards/Table */}
          {loadingMembers ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
              <RotateCw className="w-6 h-6 animate-spin text-[#0066B3] mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">Menghubungkan ke Spreadsheet Google Apps Script...</p>
              <p className="text-xs text-slate-400 mt-1">Mengambil data anggota resmi langsung dari database...</p>
            </div>
          ) : filteredMembers.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
              <Users className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">Belum Ada Data Anggota di Spreadsheet</h4>
              <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                Database Google Apps Script belum memiliki data anggota yang sesuai dengan kriteria pencarian saat ini.
              </p>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setIsRegisterModalOpen(true)}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Daftarkan Anggota Baru
              </Button>
            </div>
          ) : viewMode === 'cards' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredMembers.map((m) => {
                const isNas = m.levelOrganisasi === 'KWARTIR_NASIONAL';
                return (
                  <div
                    key={m.id}
                    className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                  >
                    <div className="space-y-3">
                      {/* Card Header: Level & Status */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            isNas
                              ? 'bg-amber-50 text-amber-900 border-amber-300'
                              : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {isNas ? 'KWARTIR NASIONAL' : 'PANGKALAN WILAYAH'}
                        </span>
                        <Badge size="sm" variant={m.status === 'ACTIVE' ? 'green' : 'neutral'}>
                          {m.status}
                        </Badge>
                      </div>

                      {/* Member Info */}
                      <div className="flex items-center gap-3">
                        <img
                          src={m.photoUrl}
                          alt={m.fullName}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-xs"
                          referrerPolicy="no-referrer"
                        />
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm truncate group-hover:text-[#0066B3] transition-colors">
                            {m.fullName}
                          </h4>
                          <p className="text-xs text-slate-500 truncate">{m.membershipLevel}</p>
                          <span className="text-[10px] font-semibold text-[#009B4D] inline-block mt-0.5">
                            {m.kridaName}
                          </span>
                        </div>
                      </div>

                      {/* KTA Number Pill */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                        <div>
                          <p className="text-[9px] uppercase tracking-wider text-slate-400 font-semibold">Nomor KTA Resmi</p>
                          <p className="font-mono text-xs font-bold text-slate-900">{m.noKta}</p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(m.noKta);
                            setCopiedKta(m.noKta);
                            addToast({
                              type: 'success',
                              title: 'No KTA Disalin',
                              message: `${m.noKta} telah disalin.`,
                            });
                            setTimeout(() => setCopiedKta(null), 1500);
                          }}
                          className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                          title="Salin Nomor KTA"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Wilayah Location Summary */}
                      <div className="text-[11px] text-slate-500 space-y-0.5">
                        <p className="truncate">
                          <span className="text-slate-400">Pangkalan:</span> {m.city}, {m.province}
                        </p>
                        {m.kecamatan && (
                          <p className="truncate">
                            <span className="text-slate-400">Kecamatan:</span> {m.kecamatan}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Card Actions */}
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="primary"
                        className="flex-1 justify-center font-semibold"
                        leftIcon={<CreditCard className="w-3.5 h-3.5" />}
                        onClick={() => setSelectedMemberForKTA(m)}
                      >
                        Lihat KTA
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedMemberForKTA(m)}
                        title="Periksa QR Token"
                        className="px-2.5"
                      >
                        <QrCode className="w-4 h-4 text-slate-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <Table
              columns={memberColumns}
              data={filteredMembers}
              keyExtractor={(m) => m.id}
            />
          )}
        </div>
      )}

      {/* Master Krida View */}
      {activeTab === 'krida' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {KRIDA_MASTER.map((krida) => (
            <Card key={krida.id} padding="lg" className="border-t-4" style={{ borderTopColor: krida.color }}>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="blue" className="font-mono text-xs">{krida.code}</Badge>
                  <span className="text-xs text-slate-400">Master Data SAKA</span>
                </div>
                <h3 className="text-base font-bold text-slate-900">{krida.name}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{krida.description}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* KTA Preview Modal (Using KTA Designer DigitalMemberCard as Primary Renderer) */}
      <Modal
        isOpen={Boolean(selectedMemberForKTA)}
        onClose={() => setSelectedMemberForKTA(null)}
        title="Kartu Tanda Anggota (KTA Digital SPWN)"
        description="Pratinjau KTA menggunakan template aktif dari KTA Designer dengan resolusi wilayah resmi."
        size="lg"
      >
        {selectedMemberForKTA && (() => {
          const bindingMember = {
            id: selectedMemberForKTA.id,
            fullName: selectedMemberForKTA.fullName,
            nama_lengkap: selectedMemberForKTA.fullName,
            nationalMemberNumber: selectedMemberForKTA.noKta,
            nomor_kta: selectedMemberForKTA.noKta,
            membershipLevel: selectedMemberForKTA.membershipLevel,
            tingkat_keanggotaan: selectedMemberForKTA.membershipLevel,
            currentPosition: selectedMemberForKTA.membershipLevel,
            provinceName: (selectedMemberForKTA.kodeProvinsi && getProvinceByCode(selectedMemberForKTA.kodeProvinsi)?.name) || selectedMemberForKTA.province,
            provinsi_id: selectedMemberForKTA.kodeProvinsi,
            regencyName: (selectedMemberForKTA.kodeKabupaten && getRegencyByCode(selectedMemberForKTA.kodeKabupaten)?.name) || selectedMemberForKTA.city,
            kabupaten_id: selectedMemberForKTA.kodeKabupaten,
            districtName: (selectedMemberForKTA.kodeKabupaten && selectedMemberForKTA.kodeKecamatan && resolveDistrictName(selectedMemberForKTA.kodeKabupaten, selectedMemberForKTA.kodeKecamatan)) || selectedMemberForKTA.kecamatan,
            wilayah_kecamatan_id: selectedMemberForKTA.kodeKecamatan,
            krida: selectedMemberForKTA.kridaName || 'KRIDA PEMANDU',
            branchName: 'Pangkalan Saka Pariwisata',
            gugusDepan: 'Pangkalan Saka Pariwisata',
            photoUrl: selectedMemberForKTA.photoUrl,
            status: selectedMemberForKTA.status,
            qrToken: selectedMemberForKTA.verificationToken,
            phone: '0812-3456-7890',
            email: 'anggota@spwn.id',
          };

          return (
            <div className="py-2 flex flex-col items-center gap-4">
              <DigitalMemberCard
                member={bindingMember}
                previewSettings={storage.getKtaSettings()}
                showControls={true}
              />
              
              {/* Technical Database Metadata */}
              <div className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-600 space-y-1 font-mono">
                <p className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
                  Penyimpanan Database (Hanya Simpan ID Wilayah):
                </p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
                  <div>• level_organisasi: <b className="text-slate-900">{selectedMemberForKTA.levelOrganisasi || 'WILAYAH'}</b></div>
                  <div>• kode_provinsi: <b className="text-slate-900">{selectedMemberForKTA.kodeProvinsi || '-'}</b> ({bindingMember.provinceName})</div>
                  <div>• kode_kabupaten: <b className="text-slate-900">{selectedMemberForKTA.kodeKabupaten || '-'}</b> ({bindingMember.regencyName})</div>
                  <div>• kode_kecamatan: <b className="text-slate-900">{selectedMemberForKTA.kodeKecamatan || '-'}</b> ({bindingMember.districtName})</div>
                </div>
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Modal Registrasi & Generator KTA Interaktif */}
      <Modal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        title="Registrasi Anggota & Generator KTA Digital"
        description="Penerbitan KTA otomatis berdasarkan level organisasi dan kode wilayah resmi."
        size="lg"
      >
        <form onSubmit={handleCreateMember} className="space-y-4 py-1">
          {/* Live Preview Bar */}
          <div className="bg-slate-900 text-white rounded-lg p-4 border border-slate-700">
            <div className="text-[11px] text-slate-400 font-medium">HASIL GENERATOR NOMOR KTA:</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono text-xl sm:text-2xl font-bold text-amber-400 tracking-wider">
                {previewGeneratedKta}
              </span>
              <span className="text-[11px] px-2.5 py-1 rounded font-bold uppercase bg-slate-800 text-slate-200 border border-slate-700">
                {regLevel === 'KWARTIR_NASIONAL' ? '00.NNNNNN' : '00.PPKK.CCC.NNNNNN'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-2 border-t border-slate-800 pt-2 flex flex-wrap gap-x-4">
              <span>00 = Tetap</span>
              {regLevel === 'WILAYAH' && (
                <>
                  <span>PPKK (Kab/Kota): <b className="text-white">{regKabCode}</b></span>
                  <span>CCC (Kecamatan): <b className="text-white">{regKecCode}</b></span>
                </>
              )}
              <span>Nomor Urut: <b className="text-white">{String(regSequence).padStart(6, '0')}</b></span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkat Organisasi <span className="text-red-500">*</span>
              </label>
              <Select
                value={regLevel}
                onChange={(e) => setRegLevel(e.target.value as OrganizationLevelType)}
                options={[
                  { value: 'WILAYAH', label: 'Bukan Kwartir Nasional (Wilayah / Kwarda / Kwarcab)' },
                  { value: 'KWARTIR_NASIONAL', label: 'Kwartir Nasional (Format: 00.NNNNNN)' },
                ]}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Urut Anggota (NNNNNN) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="1"
                max="999999"
                value={regSequence}
                onChange={(e) => setRegSequence(e.target.value)}
                placeholder="Contoh: 1, 89, 120"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Lengkap Anggota <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: Kak Siti Rahmawati"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                NIK (16 Digit Angka) <span className="text-red-500">*</span>
              </label>
              <Input
                placeholder="Contoh: 3201015501040001"
                maxLength={16}
                value={regNik}
                onChange={(e) => setRegNik(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            {/* Jika Wilayah: Input Provinsi, Kabupaten/Kota (regencies), dan Kecamatan (districts) */}
            {regLevel === 'WILAYAH' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Provinsi (Data Laporan & Filtering)
                  </label>
                  <Select
                    value={regProvCode}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      setRegProvCode(newProv);
                      const regList = getRegenciesByProvince(newProv);
                      if (regList.length > 0) {
                        setRegKabCode(regList[0].code);
                        const distList = getDistrictsByRegency(regList[0].code);
                        if (distList.length > 0) {
                          setRegKecCode(distList[0].districtCode3);
                        }
                      }
                    }}
                    options={PROVINCES.map((p) => ({
                      value: p.code,
                      label: `${p.code} - ${p.name}`,
                    }))}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    *Kode provinsi TIDAK digunakan pada nomor KTA wilayah, namun tersimpan di database.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kabupaten / Kota (PPKK dari regencies.csv) <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={regKabCode}
                    onChange={(e) => {
                      const newKab = e.target.value;
                      setRegKabCode(newKab);
                      const distList = getDistrictsByRegency(newKab);
                      if (distList.length > 0) {
                        setRegKecCode(distList[0].districtCode3);
                      }
                    }}
                    options={availableRegencies.map((r) => ({
                      value: r.code,
                      label: `${r.code} - ${r.name}`,
                    }))}
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kecamatan <span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={regKecCode}
                    onChange={(e) => setRegKecCode(e.target.value)}
                    options={availableDistricts.map((d) => ({
                      value: d.districtCode3,
                      label: d.name.startsWith('Kecamatan ') || d.name.startsWith('KECAMATAN ') ? d.name : `Kecamatan ${d.name}`,
                    }))}
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Peminatan 4 Krida SAKA
              </label>
              <Select
                value={regKridaId}
                onChange={(e) => setRegKridaId(e.target.value)}
                options={KRIDA_MASTER.map((k) => ({ value: k.id, label: k.name }))}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tingkatan Golongan Pramuka
              </label>
              <Select
                value={regLevelKeanggotaan}
                onChange={(e) => setRegLevelKeanggotaan(e.target.value)}
                options={TINGKAT_GOLONGAN_PRAMUKA.map((t) => ({ value: t, label: t }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsRegisterModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              leftIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Terbitkan KTA Resmi
            </Button>
          </div>
        </form>
      </Modal>

      {/* Member Profile Correction & Password Reset Modal */}
      <MemberProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
      />
    </div>
  );
};
