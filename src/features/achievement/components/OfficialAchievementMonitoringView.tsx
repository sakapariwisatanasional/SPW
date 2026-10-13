import React, { useEffect, useMemo, useState } from 'react';
import {
  Users,
  ShieldCheck,
  Award,
  TrendingUp,
  RefreshCw,
  AlertCircle,
  MapPin,
  Eye,
} from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';
import { useAdminStore } from '../../admin/stores/adminStore';

interface MonitoringData {
  scope?: {
    level?: string;
    province?: string;
    regency?: string;
    district?: string;
    pangkalan?: string;
  };
  actor?: {
    full_name?: string;
    role?: string;
    position?: string;
    level?: string;
  };
  summary?: {
    participants?: number;
    pamongs?: number;
    officials?: number;
    totalCompletedSkk?: number;
    averageProgress?: number;
  };
  participants?: any[];
  pamongs?: any[];
  officials?: any[];
}

const photoUrl = (member: any) =>
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

export const OfficialAchievementMonitoringView: React.FC = () => {
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

  const [data, setData] =
    useState<MonitoringData | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [tab, setTab] =
    useState<'participants' | 'pamongs'>('participants');

  const load = async () => {
    setLoading(true);
    setError(null);

    try {
      const qaPosition =
        qaPerspective === 'PAMONG_SAKA'
          ? 'PAMONG SAKA'
          : qaPerspective === 'PINSAKA'
          ? 'PIMPINAN SAKA'
          : qaPerspective === 'MABISAKA'
          ? 'MABISAKA'
          : '';

      const response =
        await apiClient.get<any>(
          'achievement.monitoring.directory',
          {
            scopeProvinceId,
            scopeProvinceName,
            scopeRegencyId,
            scopeRegencyName,
            scopeDistrictId,
            scopeDistrictName,
            scopePangkalanId,
            scopePangkalanName,
            actingPosition: qaPosition,
            actingLevel:
              qaPerspective === 'SUPER_ADMIN'
                ? 'KWARNAS'
                : qaPerspective === 'ADMIN_KWARDA'
                ? 'KWARDA'
                : qaPerspective === 'ADMIN_KWARCAB'
                ? 'KWARCAB'
                : qaPerspective === 'ADMIN_PANGKALAN'
                ? 'PANGKALAN'
                : scopePangkalanId && scopePangkalanId !== 'ALL'
                ? 'PANGKALAN'
                : scopeDistrictId && scopeDistrictId !== 'ALL'
                ? 'KWARRAN'
                : scopeRegencyId && scopeRegencyId !== 'ALL'
                ? 'KWARCAB'
                : scopeProvinceId && scopeProvinceId !== 'ALL'
                ? 'KWARDA'
                : 'KWARNAS',
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
        'Monitoring wilayah gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [
    qaPerspective,
    scopeProvinceId,
    scopeRegencyId,
    scopeDistrictId,
    scopePangkalanId,
  ]);

  const participants =
    Array.isArray(data?.participants)
      ? data!.participants!
      : [];

  const pamongs =
    Array.isArray(data?.pamongs)
      ? data!.pamongs!
      : [];

  const scopeText = useMemo(() => {
    const scope = data?.scope;

    if (!scope) return '-';

    const level =
      scope.level || 'UNKNOWN';

    if (level === 'PANGKALAN') {
      return [
        scope.pangkalan,
        scope.district,
        scope.regency,
        scope.province,
      ].filter(Boolean).join(' • ');
    }

    if (level === 'KWARRAN') {
      return [
        scope.district,
        scope.regency,
        scope.province,
      ].filter(Boolean).join(' • ');
    }

    if (level === 'KWARCAB') {
      return [
        scope.regency,
        scope.province,
      ].filter(Boolean).join(' • ');
    }

    if (level === 'KWARDA') {
      return scope.province || 'Provinsi';
    }

    if (level === 'KWARNAS') {
      return 'Seluruh Indonesia';
    }

    return 'Scope belum ditentukan';
  }, [data]);

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-5">
        <div className="flex gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <div>
            <p className="font-bold text-red-900">
              Monitoring wilayah gagal dimuat
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
    <div className="space-y-5">
      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex gap-3">
            <div className="w-11 h-11 rounded-xl bg-blue-100 text-[#0066B3] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-wider font-bold text-blue-700">
                Monitoring berdasarkan kewenangan wilayah
              </p>
              <h2 className="text-lg font-black text-slate-900 mt-0.5">
                {data?.actor?.position || 'Pengurus SAKA'}
                {' • '}
                {data?.scope?.level || 'Scope'}
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                {scopeText}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-blue-200 text-xs font-bold text-slate-700"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sinkronkan GAS
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Users className="w-5 h-5 text-[#0066B3]" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.participants || 0}
          </p>
          <p className="text-xs text-slate-500">
            Anggota/Dewan Saka
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.pamongs || 0}
          </p>
          <p className="text-xs text-slate-500">
            Pamong Saka
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <Award className="w-5 h-5 text-purple-600" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.totalCompletedSkk || 0}
          </p>
          <p className="text-xs text-slate-500">
            SKK Terverifikasi
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <TrendingUp className="w-5 h-5 text-amber-600" />
          <p className="text-2xl font-black text-slate-900 mt-2">
            {data?.summary?.averageProgress || 0}%
          </p>
          <p className="text-xs text-slate-500">
            Rata-rata Progres
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTab('participants')}
          className={`px-4 py-2 rounded-xl text-xs font-bold ${
            tab === 'participants'
              ? 'bg-[#0066B3] text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Anggota & Pencapaian ({participants.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('pamongs')}
          className={`px-4 py-2 rounded-xl text-xs font-bold ${
            tab === 'pamongs'
              ? 'bg-[#0066B3] text-white'
              : 'bg-white border border-slate-200 text-slate-700'
          }`}
        >
          Pamong Saka ({pamongs.length})
        </button>
      </div>

      {tab === 'participants' ? (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Anggota</th>
                  <th className="px-4 py-3">Wilayah</th>
                  <th className="px-4 py-3">Krida</th>
                  <th className="px-4 py-3">Level</th>
                  <th className="px-4 py-3">Kemajuan SKK</th>
                  <th className="px-4 py-3">Kewenangan</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {participants.map((member: any) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {photoUrl(member) ? (
                          <img
                            src={photoUrl(member)}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {initials(member.full_name)}
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {member.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            {member.no_kta || member.id}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      <div className="flex items-start gap-1.5">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 text-slate-400" />
                        <div>
                          <p>{member.pangkalan || '-'}</p>
                          <p>{member.city || member.district || '-'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                      {member.krida || 'Belum memilih'}
                    </td>

                    <td className="px-4 py-3 text-xs font-bold text-slate-700">
                      {member.level === 'BELUM_ADA'
                        ? 'Belum Ada Level'
                        : member.level}
                    </td>

                    <td className="px-4 py-3 min-w-[190px]">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-bold">
                          {member.summary?.completedSkk || 0}
                          {' / '}
                          {member.summary?.totalSkkAvailable || 0}
                          {' SKK'}
                        </span>
                        <span className="text-[#0066B3] font-bold">
                          {member.summary?.progressPercent || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#0066B3]"
                          style={{
                            width: `${member.summary?.progressPercent || 0}%`,
                          }}
                        />
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {member.canAssess ? (
                        <span className="inline-flex px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                          Dapat Verifikasi
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-bold border border-slate-200">
                          Lihat Saja
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {!participants.length && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Tidak ada anggota dalam scope wilayah ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr className="text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-3">Pamong Saka</th>
                  <th className="px-4 py-3">Tingkat</th>
                  <th className="px-4 py-3">Pangkalan</th>
                  <th className="px-4 py-3">Kabupaten/Kota</th>
                  <th className="px-4 py-3">Provinsi</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {pamongs.map((member: any) => (
                  <tr key={member.id}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {photoUrl(member) ? (
                          <img
                            src={photoUrl(member)}
                            alt={member.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                            {initials(member.full_name)}
                          </div>
                        )}

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {member.full_name}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {member.position}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                      {member.level_organisasi || '-'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {member.pangkalan || '-'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {member.city || '-'}
                    </td>

                    <td className="px-4 py-3 text-xs text-slate-600">
                      {member.province || '-'}
                    </td>
                  </tr>
                ))}

                {!pamongs.length && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-sm text-slate-500"
                    >
                      Belum ada Pamong Saka dalam scope wilayah ini.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
