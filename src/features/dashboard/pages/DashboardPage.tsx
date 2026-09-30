import React, { useEffect, useState } from 'react';
import {
  Users,
  Compass,
  ShoppingBag,
  Newspaper,
  TrendingUp,
  ArrowUpRight,
  MapPin,
  Calendar,
  CheckCircle2,
  Sparkles,
  QrCode,
  GraduationCap,
  Award,
  CreditCard,
  Layers,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { Card, Badge, Button, Avatar, Skeleton } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { formatCurrencyIDR } from '../../../utils/formatters';
import { apiClient } from '../../../services/api/apiClient';
import { KridaGridSection } from '../../krida/components/KridaGridSection';
import { DigitalMemberCard } from '../../admin/components/DigitalMemberCard';

export const DashboardPage: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { setActiveView, addToast } = useUIStore();
  const [isLoadingSkeleton, setIsLoadingSkeleton] = useState(false);
  const [selectedKridaFilter, setSelectedKridaFilter] = useState('ALL');

  const [nationalIntegration, setNationalIntegration] = useState({
    pangkalan: 'Memuat data...',
    destinasi: 'Memuat data...',
    umkm: 'Memuat data...'
  });

  useEffect(() => {

    async function loadDashboardMetrics(){

      try{

        const response = await apiClient.post<any>(
          'admin.achievement.directory',
          {}
        );

        const rawData = response.data || [];

        const members = Array.isArray(rawData)
          ? rawData
          : (
              rawData.members ||
              rawData.data ||
              []
            );

        const data = {
          total_member: members.length,
          active_member: members.filter(
            (item:any) =>
              String(item.status || '').toUpperCase() === 'ACTIVE'
          ).length,
          total_product: members.reduce(
            (sum:number, item:any) =>
              sum + Number(item.total_product || 0),
            0
          ),
          total_content: members.reduce(
            (sum:number, item:any) =>
              sum + Number(item.total_content || 0),
            0
          ),
          pangkalan_terbanyak:
            members[0]?.pangkalan ||
            members[0]?.position ||
            null,
          destinasi_terverifikasi:
            `${members.filter((item:any)=>item.status === 'ACTIVE').length} anggota aktif`,
          pasar_umkm:
            `${members.length} data anggota`
        };

        setNationalIntegration({
          pangkalan:
            data.pangkalan_terbanyak ||
            data.top_pangkalan ||
            `${currentUser?.province || 'Nasional'} (${data.total_member || 0} anggota)`,

          destinasi:
            data.destinasi_terverifikasi ||
            data.top_destinasi ||
            `${data.active_member || 0} anggota aktif`,

          umkm:
            data.pasar_umkm ||
            data.top_umkm ||
            `${data.total_product || 0} produk / toko`
        });

        setMetrics(prev => prev.map((item,index)=>{

          const values = [
            data.total_member || 0,
            data.active_member || 0,
            data.total_product || 0,
            data.total_content || 0
          ];

          return {
            ...item,
            value:String(values[index])
          };

        }));

      }catch(error){

        console.error(
          'Dashboard metrics gagal dimuat',
          error
        );

      }

    }

    loadDashboardMetrics();

  }, []);


  // Trigger simulated skeleton loading to demonstrate interaction
  const triggerSkeletonRefresh = async () => {
    setIsLoadingSkeleton(true);

    try {

      const response = await apiClient.post<any>(
        'admin.dashboard.summary',
        {}
      );

      const rawData = response.data || [];

        const members = Array.isArray(rawData)
          ? rawData
          : (
              rawData.members ||
              rawData.data ||
              []
            );

        const data = {
          total_member: members.length,
          active_member: members.filter(
            (item:any) =>
              String(item.status || '').toUpperCase() === 'ACTIVE'
          ).length,
          total_product: members.reduce(
            (sum:number, item:any) =>
              sum + Number(item.total_product || 0),
            0
          ),
          total_content: members.reduce(
            (sum:number, item:any) =>
              sum + Number(item.total_content || 0),
            0
          ),
          pangkalan_terbanyak:
            members[0]?.pangkalan ||
            members[0]?.position ||
            null,
          destinasi_terverifikasi:
            `${members.filter((item:any)=>item.status === 'ACTIVE').length} anggota aktif`,
          pasar_umkm:
            `${members.length} data anggota`
        };

      setNationalIntegration({
        pangkalan:
          data.pangkalan_terbanyak ||
          data.top_pangkalan ||
          `${currentUser?.province || 'Nasional'} (${data.total_member || 0} anggota)`,

        destinasi:
          data.destinasi_terverifikasi ||
          data.top_destinasi ||
          `${data.active_member || 0} anggota aktif`,

        umkm:
          data.pasar_umkm ||
          data.top_umkm ||
          `${data.total_product || 0} produk / toko`
      });

      setMetrics(prev => prev.map((item,index)=>{

        const values = [
          data.total_member || 0,
          data.active_member || 0,
          data.total_product || 0,
          data.total_content || 0
        ];

        return {
          ...item,
          value:String(values[index])
        };

      }));

      addToast({
        type: 'success',
        title: 'Data Terkini Diperbarui',
        message: 'Ringkasan metrik dan aktivitas ekosistem tersinkronisasi.',
      });

    } catch(error) {

      console.error(
        'Refresh dashboard gagal',
        error
      );

      addToast({
        type: 'error',
        title: 'Gagal Memperbarui Data',
        message: 'Tidak dapat mengambil data dashboard dari server.',
      });

    } finally {

      setIsLoadingSkeleton(false);

    }

  };

  const [metrics, setMetrics] = useState([
    {
      label: 'Total Anggota SAKA',
      value: '0',
      change: 'Sinkronisasi database',
      icon: <Users className="w-5 h-5 text-[#0066B3]" />,
      colorClass: 'text-[#0066B3]',
      bgClass: 'bg-blue-50',
      borderAccent: 'border-l-4 border-l-[#0066B3]',
      detail: 'Data Saka Pariwisata',
    },
    {
      label: 'Destinasi Terverifikasi',
      value: '0',
      change: 'Sinkronisasi database',
      icon: <Compass className="w-5 h-5 text-[#009B4D]" />,
      colorClass: 'text-[#009B4D]',
      bgClass: 'bg-emerald-50',
      borderAccent: 'border-l-4 border-l-[#009B4D]',
      detail: 'Data dari Anggota Saka',
    },
    {
      label: 'Katalog UMKM & Produk',
      value: '0',
      change: 'Sinkronisasi database',
      icon: <ShoppingBag className="w-5 h-5 text-[#F7941D]" />,
      colorClass: 'text-[#F7941D]',
      bgClass: 'bg-amber-50',
      borderAccent: 'border-l-4 border-l-[#F7941D]',
      detail: 'Produk Anggota Saka',
    },
    {
      label: 'Artikel & Agenda Edukasi',
      value: '0',
      change: 'Sinkronisasi database',
      icon: <Newspaper className="w-5 h-5 text-[#6A1B9A]" />,
      colorClass: 'text-[#6A1B9A]',
      bgClass: 'bg-purple-50',
      borderAccent: 'border-l-4 border-l-[#6A1B9A]',
      detail: 'Data dari Anggota Saka',
    },
  ]);

  const quickShortcuts = [
    {
      title: 'Pusat KTA Digital',
      desc: 'Lihat, balik kartu, dan unduh KTA resmi.',
      action: () => setActiveView('membership'),
      icon: <CreditCard className="w-5 h-5 text-[#0066B3]" />,
      badge: 'Identity Center',
      badgeColor: 'blue' as const,
    },
    {
      title: 'Verifikasi KTA Instan',
      desc: 'Validasi QR code dan integritas nomor KTA.',
      action: () => setActiveView('kta-verification'),
      icon: <QrCode className="w-5 h-5 text-[#009B4D]" />,
      badge: 'Validator',
      badgeColor: 'green' as const,
    },
    {
      title: 'Modul SKK Learning',
      desc: 'Pelajari kurikulum 4 Krida Pariwisata.',
      action: () => setActiveView('skk-learning'),
      icon: <GraduationCap className="w-5 h-5 text-[#6A1B9A]" />,
      badge: 'Edukasi',
      badgeColor: 'purple' as const,
    },
    {
      title: 'Pencapaian & Lencana',
      desc: 'Track TKK & riwayat keikutsertaan bakti.',
      action: () => setActiveView('member-achievement'),
      icon: <Award className="w-5 h-5 text-[#F7941D]" />,
      badge: 'Portofolio',
      badgeColor: 'orange' as const,
    },
  ];

  const recentActivities = [
    {
      id: '1',
      title: 'Verifikasi KTA Anggota Baru Kwarda Jabar',
      desc: 'Admin Wilayah memvalidasi 12 anggota KRIDA PEMANDU pangkalan Bogor.',
      time: '10 menit lalu',
      badge: 'Membership',
      badgeVariant: 'blue' as const,
    },
    {
      id: '2',
      title: 'Pendaftaran Desa Wisata Nglanggeran',
      desc: 'Tourism Manager memverifikasi homestay dan jalur trekking edukasi.',
      time: '45 menit lalu',
      badge: 'Tourism',
      badgeVariant: 'green' as const,
    },
    {
      id: '3',
      title: 'Publikasi Panduan Jambore 2026',
      desc: 'Redaksi menerbitkan jadwal dan agenda resmi perkemahan nasional.',
      time: '2 jam lalu',
      badge: 'Content',
      badgeVariant: 'purple' as const,
    },
    {
      id: '4',
      title: 'Pemesanan Suvenir Kriya Rotan Dayak',
      desc: 'Pesanan #SPWN-8821 diproses mitra pengrajin binaan Kaltim.',
      time: '4 jam lalu',
      badge: 'Commerce',
      badgeVariant: 'orange' as const,
    },
  ];

  const profile = (currentUser as any)?.memberProfile || {};
  const displayName =
    currentUser?.fullName ||
    (currentUser as any)?.full_name ||
    (currentUser as any)?.nama ||
    profile.full_name ||
    profile.nama ||
    currentUser?.username ||
    'Anggota SAKA';

  const displayRole =
    currentUser?.roleName ||
    currentUser?.role ||
    'ANGGOTA';

  const displayProvince =
    currentUser?.province ||
    profile.province ||
    'Nasional';

  const displayPangkalan =
    currentUser?.pangkalan ||
    profile.position ||
    displayProvince;

  const displayKrida =
    (currentUser as any)?.kridaName ||
    (currentUser as any)?.krida ||
    profile.krida ||
    'Belum tersedia';

  const displayKta =
    (currentUser as any)?.no_kta ||
    (currentUser as any)?.nomor_kta ||
    (currentUser as any)?.nomorKTA ||
    profile.no_kta ||
    'Belum tersedia';

  const displayPhoto =
    currentUser?.avatarUrl ||
    (currentUser as any)?.photo_url ||
    profile.photo_url ||
    '';

  const displayStatus =
    currentUser?.status ||
    profile.status ||
    'ACTIVE';

  const displayInitials =
    String(displayName || 'SA')
      .split(' ')
      .map((part:string) => part.charAt(0))
      .join('')
      .substring(0,2)
      .toUpperCase();

  const dashboardKtaMember = {
    id: profile.id || currentUser?.memberId || '',
    fullName: displayName,
    noKta: displayKta,
    role: profile.position || displayRole,
    kridaName: displayKrida,
    province: displayProvince,
    photoUrl: displayPhoto,
    verificationToken:
      profile.qr_token ||
      profile.verification_url ||
      '',
    status: displayStatus
  };

  return (
    <div className="space-y-6">
      {/* Workspace App Header Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0B1F33] via-[#003E6D] to-[#0066B3] text-white p-6 sm:p-8 shadow-sm border border-slate-700/50">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#009B4D]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-16 w-64 h-64 rounded-full bg-[#F7941D]/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-white/95 border border-white/10">
              <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
              <span>SPWN Workspace 2.0 • Wonderful Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Halo, {currentUser.fullName}
            </h1>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
              Anda terhubung sebagai <span className="font-bold text-white bg-white/15 px-2 py-0.5 rounded-md">{currentUser.roleName}</span> wilayah <span className="font-semibold text-white">{currentUser.province || 'Nasional'}</span>. Akses kartu KTA, status verifikasi pangkalan, dan aktivitas ekosistem secara terpusat.
            </p>
          </div>

          {/* Quick Refresh & Telemetry Pill */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              onClick={triggerSkeletonRefresh}
              disabled={isLoadingSkeleton}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-medium text-white transition-all cursor-pointer shadow-xs disabled:opacity-50"
              title="Perbarui Data dengan Skeleton Loading"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSkeleton ? 'animate-spin' : ''}`} />
              <span>{isLoadingSkeleton ? 'Memuat Data...' : 'Segarkan Data'}</span>
            </button>
            <Button
              size="sm"
              variant="warning"
              onClick={() => setActiveView('membership')}
              leftIcon={<CreditCard className="w-4 h-4 text-slate-950" />}
              className="font-bold text-slate-950 shadow-xs"
            >
              Buka Identity Center
            </Button>
          </div>
        </div>
      </div>

      {/* Card-Based Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs transition-all hover:shadow-md ${m.borderAccent}`}
          >
            {isLoadingSkeleton ? (
              <div className="space-y-3">
                <Skeleton variant="text" width="60%" height={14} />
                <Skeleton variant="rectangular" width="40%" height={28} />
                <Skeleton variant="text" width="50%" height={12} />
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">{m.label}</span>
                  <div className={`p-2 rounded-xl ${m.bgClass}`}>
                    {m.icon}
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">{m.value}</h3>
                  <div className="flex items-center justify-between mt-1 text-[11px]">
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      {m.change}
                    </span>
                    <span className="text-slate-400">{m.detail}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Quick Workspace Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Pusat Aksi & Layanan Anggota</h2>
            <p className="text-xs text-slate-500">Akses cepat ke fitur-fitur utama ekosistem SPWN</p>
          </div>
          <span className="text-[11px] font-semibold text-[#0066B3]">4 Modul Utama</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {quickShortcuts.map((item, idx) => (
            <div
              key={idx}
              onClick={item.action}
              className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:border-[#0066B3]/40 hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-slate-100 group-hover:bg-[#0066B3]/10 transition-colors">
                  {item.icon}
                </div>
                <Badge size="sm" variant={item.badgeColor}>
                  {item.badge}
                </Badge>
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors flex items-center justify-between">
                  <span>{item.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0066B3] group-hover:translate-x-1 transition-all" />
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Personal KTA Preview + Recent Activity */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4 h-full">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0066B3]" />
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                    KTA Digital Anda
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Thumbnail kartu yang dilihat setiap anggota saat masuk dashboard
                  </p>
                </div>
              </div>
              <Badge size="sm" variant="green">
                {String(displayStatus).toUpperCase() === 'ACTIVE' ? 'Aktif Terverifikasi' : displayStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-4 items-stretch">
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-white p-3 shadow-sm">
                <div className="w-full max-w-[620px] mx-auto overflow-hidden rounded-xl">
                  <DigitalMemberCard
                    member={dashboardKtaMember}
                    previewSettings={null}
                  />
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-slate-800">
                    <ShieldCheck className="w-4 h-4 text-[#009B4D]" />
                    <h4 className="text-sm font-bold">Ringkasan Kartu</h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Pemilik KTA</span>
                      <span className="font-semibold text-slate-900 text-right">{displayName}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Status Keanggotaan</span>
                      <span className="font-semibold text-emerald-600 text-right">{displayStatus}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Provinsi / Kwartir</span>
                      <span className="font-semibold text-slate-900 text-right">{displayProvince}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-slate-500">Tingkatan</span>
                      <span className="font-semibold text-slate-900 text-right">{profile.position || currentUser?.membershipLevel || '-'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-200 space-y-2">
                  <Button
                    size="sm"
                    variant="primary"
                    fullWidth
                    onClick={() => setActiveView('membership')}
                    leftIcon={<Eye className="w-4 h-4" />}
                  >
                    Lihat KTA Lengkap
                  </Button>

                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Preview ini bersifat personal. Setiap anggota akan melihat thumbnail KTA miliknya sendiri saat membuka dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Timeline Card */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Aktivitas Terkini
            </h3>
            <Badge size="sm" variant="neutral">Real-time</Badge>
          </div>

          <div className="space-y-3">
            {recentActivities.map((act) => (
              <div key={act.id} className="text-xs space-y-1 border-b border-slate-100 last:border-0 pb-2.5 last:pb-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-900 truncate">{act.title}</span>
                  <Badge size="sm" variant={act.badgeVariant}>{act.badge}</Badge>
                </div>
                <p className="text-slate-500 text-[11px] leading-relaxed line-clamp-2">{act.desc}</p>
                <p className="text-slate-400 text-[10px]">{act.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* National Connectivity Card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1F33] to-[#003E6D] text-white border border-slate-800 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#009B4D] animate-pulse" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Integrasi Kwartir & Wilayah Nasional
            </h3>
          </div>
          <span className="text-[11px] font-mono text-[#F7941D] bg-white/10 px-2 py-0.5 rounded w-fit">
            GAS Sync Hub
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <p className="text-[10px] text-slate-400">Pangkalan Terbanyak</p>
            <p className="text-sm font-bold text-white mt-1">{nationalIntegration.pangkalan}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <p className="text-[10px] text-slate-400">Destinasi Terverifikasi</p>
            <p className="text-sm font-bold text-white mt-1">{nationalIntegration.destinasi}</p>
          </div>
          <div className="bg-white/5 border border-white/10 p-4 rounded-xl">
            <p className="text-[10px] text-slate-400">Pasar UMKM SAKA</p>
            <p className="text-sm font-bold text-white mt-1">{nationalIntegration.umkm}</p>
          </div>
        </div>
      </div>

      {/* 4 Krida SAKA Pariwisata Section */}
      <KridaGridSection />
    </div>
  );
};
