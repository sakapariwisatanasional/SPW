/**
 * SPWN Apps 2.0 - SuperAdmin National Achievement & Progress Center
 * Location: src/features/achievement/components/SuperAdminAchievementView.tsx
 * -------------------------------------------------------------------------
 * Tampilan khusus SuperAdmin pada menu "Pencapaian Saya":
 * - Daftar anggota dari seluruh wilayah Indonesia
 * - Data statistik kemajuan (SKK, Level Purwa/Madya/Utama, Badges, Rata-rata Skor)
 * - Matrix 23 SKK 4 Krida interaktif untuk masing-masing anggota
 * - Riwayat kegiatan dan portofolio partisipasi wisata masing-masing anggota
 */

import React, { useState, useMemo } from 'react';
import {
  Award,
  Users,
  Compass,
  CheckCircle2,
  Clock,
  CircleDashed,
  Search,
  Filter,
  Eye,
  MapPin,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Sparkles,
  BarChart3,
  Layers,
  FileText,
  UserCheck,
  RefreshCw,
  User,
} from 'lucide-react';
import {
  NATIONAL_ACHIEVEMENT_MEMBERS,
  NationalMemberAchievement,
} from '../data/nationalAchievementMembers';
import { MemberLevel, SkkStatusType } from '../../../types/achievement';
import { Badge, Button } from '../../../components/ui';

interface SuperAdminAchievementViewProps {
  onSwitchToPersonal?: () => void;
}

export const SuperAdminAchievementView: React.FC<SuperAdminAchievementViewProps> = ({
  onSwitchToPersonal,
}) => {
  // Filter States
  const [selectedKwarda, setSelectedKwarda] = useState<string>('ALL');
  const [selectedKrida, setSelectedKrida] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected Member for Matrix & Activity Inspector Modal
  const [selectedMember, setSelectedMember] = useState<NationalMemberAchievement | null>(null);
  const [inspectorTab, setInspectorTab] = useState<'matrix' | 'activities' | 'badges'>('matrix');
  const [inspectorKridaFilter, setInspectorKridaFilter] = useState<string>('all');

  // Daftar Kwarda unik untuk filter
  const kwardaOptions = useMemo(() => {
    const list = Array.from(new Set(NATIONAL_ACHIEVEMENT_MEMBERS.map((m) => m.kwarda)));
    return list.sort();
  }, []);

  // Filtered Members
  const filteredMembers = useMemo(() => {
    return NATIONAL_ACHIEVEMENT_MEMBERS.filter((m) => {
      const matchKwarda = selectedKwarda === 'ALL' || m.kwarda === selectedKwarda;
      const matchKrida = selectedKrida === 'ALL' || m.kridaUtamaId === selectedKrida;
      const matchLevel = selectedLevel === 'ALL' || m.level === selectedLevel;

      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        m.nama.toLowerCase().includes(q) ||
        m.nomorKta.toLowerCase().includes(q) ||
        m.pangkalan.toLowerCase().includes(q) ||
        m.kwarcab.toLowerCase().includes(q) ||
        m.kwarda.toLowerCase().includes(q);

      return matchKwarda && matchKrida && matchLevel && matchSearch;
    });
  }, [selectedKwarda, selectedKrida, selectedLevel, searchQuery]);

  // Statistik Agregat Nasional
  const nationalStats = useMemo(() => {
    const totalMembers = NATIONAL_ACHIEVEMENT_MEMBERS.length;
    const totalUtama = NATIONAL_ACHIEVEMENT_MEMBERS.filter((m) => m.level === 'UTAMA').length;
    const totalMadya = NATIONAL_ACHIEVEMENT_MEMBERS.filter((m) => m.level === 'MADYA').length;
    const totalPurwa = NATIONAL_ACHIEVEMENT_MEMBERS.filter((m) => m.level === 'PURWA').length;

    const avgProgress =
      NATIONAL_ACHIEVEMENT_MEMBERS.reduce((acc, curr) => acc + curr.summary.progressPercent, 0) /
      (totalMembers || 1);

    const totalSkkCompleted = NATIONAL_ACHIEVEMENT_MEMBERS.reduce(
      (acc, curr) => acc + curr.summary.completedSkk,
      0
    );

    const totalActivities = NATIONAL_ACHIEVEMENT_MEMBERS.reduce(
      (acc, curr) => acc + curr.activities.length,
      0
    );

    return {
      totalMembers,
      totalUtama,
      totalMadya,
      totalPurwa,
      avgProgress: avgProgress.toFixed(1),
      totalSkkCompleted,
      totalActivities,
    };
  }, []);

  // Helper render Level Badge
  const renderLevelBadge = (level: MemberLevel) => {
    switch (level) {
      case 'UTAMA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200 shadow-2xs">
            <Sparkles className="w-3 h-3 text-purple-600 fill-purple-600" />
            <span>Tingkat Utama</span>
          </span>
        );
      case 'MADYA':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-[#0066B3] border border-blue-200 shadow-2xs">
            <Award className="w-3 h-3 text-[#0066B3]" />
            <span>Tingkat Madya</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            <span>Tingkat Purwa</span>
          </span>
        );
    }
  };

  // Helper render Status Badge SKK
  const renderSkkStatusBadge = (status: SkkStatusType) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Lulus</span>
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>Proses</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 text-slate-500">
            <CircleDashed className="w-3 h-3 text-slate-400" />
            <span>Belum</span>
          </span>
        );
    }
  };

  return (
    <div id="superadmin-achievement-view" className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Header Banner & Scope Identification */}
      <div className="bg-gradient-to-r from-[#004C85] via-[#0066B3] to-[#009B4D] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20 inline-flex items-center gap-1.5">
                <BarChart3 className="w-3.5 h-3.5 text-amber-300" />
                <span>Pusat Data Anggota Saka Pariwisata Nasional</span>
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-[10px] font-bold uppercase tracking-wider">
                Super Admin Scope
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Pencapaian & Kemajuan Anggota Seluruh Wilayah
            </h1>

            <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
              Pantauan menyeluruh terhadap data statistik kemajuan 23 SKK, matriks capaian 4 Krida, serta riwayat portofolio kegiatan anggota SAKA Pariwisata dari berbagai Kwartir Daerah se-Indonesia.
            </p>
          </div>

          {onSwitchToPersonal && (
            <div className="relative z-10 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={onSwitchToPersonal}
                leftIcon={<User className="w-4 h-4 text-white" />}
                className="bg-white/10 hover:bg-white/20 text-white border-white/30 text-xs font-semibold rounded-2xl cursor-pointer"
              >
                Lihat Pencapaian Pribadi Saya
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 2. Statistik Agregat Kemajuan Nasional (KPI Cards) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Anggota</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {nationalStats.totalMembers}{' '}
              <span className="text-xs font-semibold text-slate-400">Wilayah</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">Seluruh Kwarda Terdata</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#009B4D] flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Rata-rata Progres</p>
            <p className="text-xl sm:text-2xl font-black text-[#009B4D] mt-0.5">
              {nationalStats.avgProgress}%
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">23 SKK Nasional</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Distribusi Level</p>
            <div className="flex items-center gap-1.5 mt-0.5 text-xs font-bold">
              <span className="text-purple-700">{nationalStats.totalUtama} Utama</span>
              <span className="text-slate-300">•</span>
              <span className="text-[#0066B3]">{nationalStats.totalMadya} Madya</span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-600">{nationalStats.totalPurwa} Purwa</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Capaian Lencana</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Portofolio Wisata</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
              {nationalStats.totalActivities}{' '}
              <span className="text-xs font-semibold text-slate-400">Kegiatan</span>
            </p>
            <p className="text-[10px] text-slate-400 mt-0.5">{nationalStats.totalSkkCompleted} SKK Tervalidasi</p>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls & Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#0066B3]" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Filter Direktori Anggota Seluruh Wilayah ({filteredMembers.length})
            </h3>
          </div>

          {(selectedKwarda !== 'ALL' || selectedKrida !== 'ALL' || selectedLevel !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedKwarda('ALL');
                setSelectedKrida('ALL');
                setSelectedLevel('ALL');
                setSearchQuery('');
              }}
              className="text-xs text-[#0066B3] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Semua Filter</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Pencarian */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama, KTA, pangkalan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0066B3] focus:bg-white transition-all"
            />
          </div>

          {/* Filter Kwarda / Provinsi */}
          <div>
            <select
              value={selectedKwarda}
              onChange={(e) => setSelectedKwarda(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0066B3] focus:bg-white"
            >
              <option value="ALL">Semua Kwarda / Wilayah</option>
              {kwardaOptions.map((kw) => (
                <option key={kw} value={kw}>
                  {kw}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 4 Krida */}
          <div>
            <select
              value={selectedKrida}
              onChange={(e) => setSelectedKrida(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0066B3] focus:bg-white"
            >
              <option value="ALL">Semua Krida</option>
              <option value="pemandu">Pemandu</option>
              <option value="penyuluh">Penyuluh</option>
              <option value="mice">Mice & Event</option>
              <option value="kuliner">Kuliner & Cinderamata</option>
            </select>
          </div>

          {/* Filter Level Capaian */}
          <div>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0066B3] focus:bg-white"
            >
              <option value="ALL">Semua Tingkat Level</option>
              <option value="UTAMA">Tingkat Utama</option>
              <option value="MADYA">Tingkat Madya</option>
              <option value="PURWA">Tingkat Purwa</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. Tabel / Kartu Daftar Anggota Seluruh Wilayah */}
      <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#0066B3]" />
            <span className="text-xs font-bold text-slate-800">
              Daftar Anggota ({filteredMembers.length} Personel)
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            Klik nama anggota untuk membuka Matriks 23 SKK & Riwayat Kegiatan
          </span>
        </div>

        {filteredMembers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada anggota yang cocok dengan filter</p>
            <p className="text-xs text-slate-400">Silakan ubah filter wilayah atau kata kunci pencarian Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-4">Anggota & Pangkalan</th>
                  <th className="py-3 px-4">Wilayah (Kwarda / Kwarcab)</th>
                  <th className="py-3 px-4">Krida & Peran</th>
                  <th className="py-3 px-4">Tingkat Level</th>
                  <th className="py-3 px-4">Statistik Kemajuan 23 SKK</th>
                  <th className="py-3 px-4 text-center">Portofolio</th>
                  <th className="py-3 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMembers.map((member) => (
                  <tr
                    key={member.id}
                    className="hover:bg-blue-50/40 transition-colors group cursor-pointer"
                    onClick={() => {
                      setSelectedMember(member);
                      setInspectorTab('matrix');
                    }}
                  >
                    {/* Anggota & KTA */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={member.fotoUrl}
                          alt={member.nama}
                          className="w-10 h-10 rounded-full object-cover border border-slate-200 group-hover:ring-2 group-hover:ring-[#0066B3] shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors truncate">
                            {member.nama}
                          </p>
                          <p className="text-[11px] font-mono text-slate-500 truncate">
                            {member.nomorKta}
                          </p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px]">
                            {member.pangkalan}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Wilayah */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{member.kwarda}</p>
                      <p className="text-[11px] text-slate-500">{member.kwarcab}</p>
                    </td>

                    {/* Krida & Tingkatan */}
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-800">{member.kridaUtamaNama}</p>
                      <p className="text-[11px] text-slate-500">{member.tingkatan}</p>
                    </td>

                    {/* Tingkat Level */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {renderLevelBadge(member.level)}
                    </td>

                    {/* Progress Bar 23 SKK */}
                    <td className="py-3 px-4 min-w-[180px]">
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800">
                            {member.summary.completedSkk} / 23 SKK
                          </span>
                          <span className="font-semibold text-[#0066B3]">
                            {member.summary.progressPercent}%
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#0066B3] to-[#009B4D] transition-all"
                            style={{ width: `${member.summary.progressPercent}%` }}
                          />
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-400">
                          <span>{member.summary.inProgressSkk} Proses</span>
                          <span>•</span>
                          <span>{member.summary.notStartedSkk} Belum</span>
                          {member.summary.averageScore && (
                            <>
                              <span>•</span>
                              <span className="text-emerald-600 font-semibold">
                                Nilai: {member.summary.averageScore}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Portofolio Badge & Kegiatan */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold border border-purple-200">
                          {member.badges.length} Badges
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                          {member.activities.length} Giat
                        </span>
                      </div>
                    </td>

                    {/* Tombol Aksi */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMember(member);
                          setInspectorTab('matrix');
                        }}
                        className="text-xs text-[#0066B3] hover:bg-blue-50 border-blue-200 font-bold rounded-xl cursor-pointer"
                        leftIcon={<Eye className="w-3.5 h-3.5" />}
                      >
                        Matrix & Riwayat
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. MODAL INSPECTOR: MATRIX 23 SKK & RIWAYAT KEGIATAN ANGGOTA TERPILIH */}
      {selectedMember && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-4xl w-full my-6 max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={selectedMember.fotoUrl}
                  alt={selectedMember.nama}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shrink-0"
                />
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20 text-white uppercase tracking-wider">
                      {selectedMember.kwarda}
                    </span>
                    {renderLevelBadge(selectedMember.level)}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-white truncate">
                    {selectedMember.nama}
                  </h2>
                  <p className="text-xs text-slate-300 font-mono truncate">
                    No. KTA: {selectedMember.nomorKta} • {selectedMember.kwarcab}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedMember(null)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Sub-Bar Metrik Ringkas Anggota */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:p-4 bg-slate-50 border-b border-slate-200 text-xs">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Kemajuan SKK</span>
                <span className="text-sm font-bold text-[#0066B3]">
                  {selectedMember.summary.completedSkk} / 23 SKK ({selectedMember.summary.progressPercent}%)
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Krida Utama</span>
                <span className="text-sm font-bold text-slate-900 truncate block">
                  {selectedMember.kridaUtamaNama}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Lencana Digital</span>
                <span className="text-sm font-bold text-purple-700">
                  {selectedMember.badges.length} Badges Terverifikasi
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white border border-slate-200/80">
                <span className="text-[10px] text-slate-500 uppercase font-semibold block">Riwayat Kegiatan</span>
                <span className="text-sm font-bold text-amber-700">
                  {selectedMember.activities.length} Event Partisipasi
                </span>
              </div>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center gap-2 px-6 pt-3 border-b border-slate-200">
              <button
                onClick={() => setInspectorTab('matrix')}
                className={`pb-3 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'matrix'
                    ? 'border-[#0066B3] text-[#0066B3]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Matrix 23 SKK (4 Krida)</span>
              </button>

              <button
                onClick={() => setInspectorTab('activities')}
                className={`pb-3 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'activities'
                    ? 'border-[#0066B3] text-[#0066B3]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Riwayat Kegiatan ({selectedMember.activities.length})</span>
              </button>

              <button
                onClick={() => setInspectorTab('badges')}
                className={`pb-3 px-2 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
                  inspectorTab === 'badges'
                    ? 'border-[#0066B3] text-[#0066B3]'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Award className="w-3.5 h-3.5" />
                <span>Koleksi Lencana Digital ({selectedMember.badges.length})</span>
              </button>
            </div>

            {/* Modal Content Area */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {/* TAB 1: MATRIX 23 SKK */}
              {inspectorTab === 'matrix' && (
                <div className="space-y-4">
                  {/* Krida Filter Sub-tabs */}
                  <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs">
                    {[
                      { id: 'all', label: 'Semua 23 SKK' },
                      { id: 'pemandu', label: 'Pemandu' },
                      { id: 'penyuluh', label: 'Penyuluh' },
                      { id: 'mice', label: 'Mice & Event' },
                      { id: 'kuliner', label: 'Kuliner & Cinderamata' },
                    ].map((t) => (
                      <button
                        key={t.id}
                        onClick={() => setInspectorKridaFilter(t.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                          inspectorKridaFilter === t.id
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>

                  {/* Grid SKK Items */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {selectedMember.skkMatrix
                      .filter((s) => inspectorKridaFilter === 'all' || s.kridaId === inspectorKridaFilter)
                      .map((skk) => (
                        <div
                          key={skk.skkCode}
                          className={`p-3.5 rounded-2xl border transition-all ${
                            skk.status === 'COMPLETED'
                              ? 'bg-emerald-50/40 border-emerald-200'
                              : skk.status === 'IN_PROGRESS'
                              ? 'bg-amber-50/40 border-amber-200'
                              : 'bg-white border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div>
                              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase">
                                {skk.skkCode} • {skk.kridaNama}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                {skk.nama}
                              </h4>
                            </div>
                            {renderSkkStatusBadge(skk.status)}
                          </div>

                          <p className="text-[11px] text-slate-600 leading-relaxed mb-2.5">
                            {skk.description}
                          </p>

                          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
                            {skk.status === 'COMPLETED' ? (
                              <>
                                <span className="font-semibold text-emerald-800">
                                  Tuntas: {skk.completedAt}
                                </span>
                                {skk.score && (
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold">
                                    Nilai Ujian: {skk.score} (Penguji: {skk.evaluatorNama})
                                  </span>
                                )}
                              </>
                            ) : skk.status === 'IN_PROGRESS' ? (
                              <>
                                <span className="font-semibold text-amber-800">
                                  Sedang Ditempuh ({skk.progressPercent}%)
                                </span>
                                <span className="text-slate-400">Dimulai {skk.startedAt}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 italic">Belum diambil oleh anggota</span>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* TAB 2: RIWAYAT KEGIATAN MASING-MASING */}
              {inspectorTab === 'activities' && (
                <div className="space-y-3">
                  {selectedMember.activities.length === 0 ? (
                    <div className="py-8 text-center text-xs text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      Belum ada riwayat kegiatan tercatat untuk anggota ini.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedMember.activities.map((act) => (
                        <div
                          key={act.id}
                          className="flex flex-col sm:flex-row gap-3 p-3.5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs"
                        >
                          {act.thumbnailUrl && (
                            <img
                              src={act.thumbnailUrl}
                              alt={act.activityName}
                              className="w-full sm:w-28 h-28 object-cover rounded-xl shrink-0 border border-slate-200"
                            />
                          )}
                          <div className="min-w-0 space-y-1.5 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900 leading-snug">
                                {act.activityName}
                              </h4>
                              <p className="text-[10px] text-[#0066B3] font-semibold mt-1">
                                Peran: {act.role}
                              </p>
                            </div>

                            <div className="space-y-0.5 text-[10px] text-slate-500 pt-1 border-t border-slate-100">
                              <p className="flex items-center gap-1">
                                <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                                <span>{act.date}</span>
                              </p>
                              <p className="flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                <span className="truncate">{act.location}</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: KOLEKSI LENCANA DIGITAL */}
              {inspectorTab === 'badges' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {selectedMember.badges.map((b) => (
                    <div
                      key={b.id}
                      className="p-4 rounded-2xl border border-slate-200 bg-white flex items-start gap-3 shadow-2xs"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-white shadow-xs"
                        style={{ backgroundColor: b.color }}
                      >
                        <Award className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {b.category} • {b.earnedAt}
                        </span>
                        <h4 className="text-xs font-bold text-slate-900 mt-0.5">{b.badgeName}</h4>
                        <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                          {b.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <span className="text-[11px] text-slate-500 font-mono">
                Pangkalan: {selectedMember.pangkalan}
              </span>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setSelectedMember(null)}
                className="bg-[#0066B3] hover:bg-[#004C85] text-white text-xs font-bold rounded-xl"
              >
                Tutup Ringkasan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
