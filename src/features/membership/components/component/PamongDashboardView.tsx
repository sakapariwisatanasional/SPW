import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Award,
  ShieldCheck,
  ClipboardCheck,
  RefreshCw,
  AlertCircle,
  MapPin,
  ChevronRight,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { useAdminStore } from '../../admin/stores/adminStore';

interface PamongDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
  effectiveMember: any;
}

interface MonitoringData {
  scope?: {
    level?: string;
    province?: string;
    regency?: string;
    district?: string;
    pangkalan?: string;
  };
  summary?: {
    participants?: number;
    pamongs?: number;
    totalCompletedSkk?: number;
    averageProgress?: number;
  };
  participants?: any[];
}

const getPhoto = (member: any) =>
  member?.fotoUrl ||
  member?.photoUrl ||
  member?.photo_url ||
  member?.foto_url ||
  '';

const initials = (name?: string) =>
  String(name || '?')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');

export const PamongDashboardView: React.FC<PamongDashboardViewProps> = ({
  onNavigateTab,
  effectiveMember,
}) => {
  const {
    qaPerspective,
    scopeProvinceId,
    scopeProvinceName,
    scopeRegencyId,
    scopeRegencyName,
    scopeDistrictId,
    scopeDistrictName,
    scopePangkalanId,
    scopePangkalanName,
  } = useAdminStore();

  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const actingLevel = useMemo(() => {
    const explicit = String(
      effectiveMember?.level_organisasi ||
      effectiveMember?.tingkat_organisasi ||
      effectiveMember?.organization_level ||
      effectiveMember?.kwartir_level ||
      ''
    ).toUpperCase();

    if (explicit) return explicit;

    if (scopePangkalanId && scopePangkalanId !== 'ALL') return 'PANGKALAN';
    if (scopeDistrictId && scopeDistrictId !== 'ALL') return 'KWARRAN';
    if (scopeRegencyId && scopeRegencyId !== 'ALL') return 'KWARCAB';
    if (scopeProvinceId && scopeProvinceId !== 'ALL') return 'KWARDA';

    return 'PANGKALAN';
  }, [
    effectiveMember,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  ]);

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<any>(
        'achievement.monitoring.directory',
        {
          actingPosition: 'PAMONG SAKA',
          actingLevel,
          scopeProvinceId,
          scopeProvinceName,
          scopeRegencyId,
          scopeRegencyName,
          scopeDistrictId,
          scopeDistrictName,
          scopePangkalanId,
          scopePangkalanName,
        }
      );

      const payload =
        response?.data?.data ||
        response?.data ||
        null;

      setData(payload);
    } catch (e: any) {
      setError(
        e?.message ||
        'Dashboard Pamong gagal memuat data wilayah.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [
    qaPerspective,
    actingLevel,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  ]);

  const participants =
    Array.isArray(data?.participants)
      ? data!.participants!
      : [];

  const pendingReview = participants.reduce(
    (total: number, item: any) =>
      total +
      Number(item?.summary?.submittedSkk || 0),
    0
  );

  const scopeText = [
    data?.scope?.pangkalan,
    data?.scope?.district,
    data?.scope?.regency,
    data?.scope?.province,
  ]
    .filter(Boolean)
    .join(' • ');

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">
              Dashboard Pamong belum dapat dimuat
            </p>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-3 px-3 py-2 rounded-xl bg-white border border-red-200 text-xs font-bold text-red-700"
            >
              Muat Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="pamong-command-center" className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#0B1F33] via-[#0066B3] to-[#009B4D] text-white p-6 sm:p-8 shadow-lg">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
          <div>
            <p className="text-[11px] uppercase tracking-widest font-black text-white/75">
              Dashboard Pamong Saka
            </p>
            <h2 className="text-2xl font-black mt-1">
              {effectiveMember?.full_name ||
                effectiveMember?.nama_lengkap ||
                effectiveMember?.fullName ||
                'Pamong Saka'}
            </h2>
            <div className="flex items-center gap-1.5 text-sm text-white/85 mt-2">
              <MapPin className="w-4 h-4" />
              <span>
                {data?.scope?.level || actingLevel}
                {scopeText ? ` • ${scopeText}` : ''}
              </span>
            </div>
            <p className="text-sm text-white/80 mt-3 max-w-3xl">
              Pantau perkembangan anggota binaan, periksa bukti SKK,
              berikan verifikasi, dan catat hasil pengujian sesuai kewenangan wilayah.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onNavigateTab('achievement')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0066B3] text-xs font-black"
            >
              <ClipboardCheck className="w-4 h-4" />
              Review & Verifikasi
            </button>

            <button
              type="button"
              onClick={() => void load()}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Sinkronkan GAS
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => onNavigateTab('achievement')}
          className="text-left rounded-2xl border border-slate-200 bg-white p-4 hover:border-[#0066B3]"
        >
          <Users className="w-5 h-5 text-[#0066B3]" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.participants || 0}
          </p>
          <p className="text-xs text-slate-500">Anggota Binaan</p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('achievement')}
          className="text-left rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:border-amber-400"
        >
          <ClipboardCheck className="w-5 h-5 text-amber-600" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {pendingReview}
          </p>
          <p className="text-xs text-slate-500">Menunggu Review SKK</p>
        </button>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <Award className="w-5 h-5 text-emerald-600" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.totalCompletedSkk || 0}
          </p>
          <p className="text-xs text-slate-500">SKK Terverifikasi</p>
        </div>

        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4">
          <ShieldCheck className="w-5 h-5 text-purple-600" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.averageProgress || 0}%
          </p>
          <p className="text-xs text-slate-500">Rata-rata Progres</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        <div className="xl:col-span-2 rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-black text-slate-900">
                Anggota yang Perlu Perhatian
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Prioritas peserta dengan bukti menunggu review atau progres berjalan.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('achievement')}
              className="text-xs font-bold text-[#0066B3] inline-flex items-center gap-1"
            >
              Lihat Semua
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {participants
              .slice()
              .sort(
                (a: any, b: any) =>
                  Number(b?.summary?.submittedSkk || 0) -
                  Number(a?.summary?.submittedSkk || 0)
              )
              .slice(0, 6)
              .map((member: any) => (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => onNavigateTab('achievement')}
                  className="w-full px-5 py-3 flex items-center gap-3 text-left hover:bg-slate-50"
                >
                  {getPhoto(member) ? (
                    <img
                      src={getPhoto(member)}
                      alt={member.full_name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {initials(member.full_name)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {member.full_name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {member.krida || 'Belum memilih Krida'}
                    </p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-black text-slate-900">
                      {member.summary?.completedSkk || 0}
                      {' / '}
                      {member.summary?.totalSkkAvailable || 0}
                    </p>
                    <p className="text-[10px] text-amber-600 font-bold">
                      {member.summary?.submittedSkk || 0} perlu review
                    </p>
                  </div>
                </button>
              ))}

            {!participants.length && (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                Belum ada anggota binaan pada scope ini.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="font-black text-slate-900">Tugas Pamong</h3>
          <div className="space-y-2 mt-4">
            {[
              {
                icon: Users,
                title: 'Pantau Anggota Binaan',
                text: 'Lihat Krida, SKK, level, dan progres anggota.',
                action: () => onNavigateTab('achievement'),
              },
              {
                icon: ClipboardCheck,
                title: 'Review Bukti SKK',
                text: 'Verifikasi, minta revisi, atau tolak bukti anggota.',
                action: () => onNavigateTab('achievement'),
              },
              {
                icon: Award,
                title: 'Catat Hasil Pengujian',
                text: 'Simpan status, nilai, dan penyelesaian SKK.',
                action: () => onNavigateTab('achievement'),
              },
              {
                icon: CreditCard,
                title: 'KTA Saya',
                text: 'Lihat identitas resmi Pamong Saka.',
                action: () => onNavigateTab('kta'),
              },
              {
                icon: Calendar,
                title: 'Kegiatan',
                text: 'Pantau agenda pembinaan dan kegiatan.',
                action: () => onNavigateTab('kegiatan'),
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <button
                  type="button"
                  key={item.title}
                  onClick={item.action}
                  className="w-full text-left rounded-xl border border-slate-200 p-3 hover:border-[#0066B3] hover:bg-blue-50/30"
                >
                  <div className="flex gap-3">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0066B3] flex items-center justify-center shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.text}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
