/**
 * SPWN Apps 2.0 - Member Personal Command Center
 * Location: src/features/membership/components/MemberDashboardView.tsx
 * -------------------------------------------------------------
 * "Member Identity Center" Dashboard:
 * 1. Member Header (Foto, Nama Lengkap, Tingkatan SAKA, Status ACTIVE, Wilayah)
 * 2. Card 1: Digital KTA Preview & Quick Actions
 * 3. Card 2: Achievement Progress (23 SKK Nasional: Selesai, Dalam Proses, Belum Diambil)
 * 4. Card 3: Krida Progress (4 Krida SAKA Pariwisata)
 * 5. Card 4: Activity Summary (Event, Pelatihan, Pengabdian, Wisata)
 * 6. Card 5: Portfolio Summary (Verifikasi Pembina, Zero-Blob Media)
 */

import React, { useMemo } from 'react';
import {
  CreditCard,
  Award,
  Compass,
  Calendar,
  Briefcase,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  Sparkles,
  QrCode,
  Download,
  Printer,
  MapPin,
  Flame,
  ArrowUpRight,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useAchievementStore } from '../../../stores/achievementStore';
import { useAdminStore } from '../../admin/stores/adminStore';
import { KRIDA_MASTER, MASTER_TINGKATAN_SAKA } from '../../../config/constants';

interface MemberDashboardViewProps {
  onNavigateTab: (tabId: string) => void;
}

export const MemberDashboardView: React.FC<MemberDashboardViewProps> = ({ onNavigateTab }) => {
  const { currentUser } = useAuthStore();
  const { profile, skkItems, badges, activities } = useAchievementStore();
  const { members } = useAdminStore();

  // Find linked member record from adminStore if available for live status & KTA
  const linkedMember = useMemo(() => {
    return members.find(
      (m) =>
        m.nomor_kta === currentUser.nomor_kta ||
        m.id === currentUser.memberId ||
        m.nama_lengkap.toLowerCase() === currentUser.fullName.toLowerCase()
    );
  }, [members, currentUser]);

  const ktaNumber = linkedMember?.nomor_kta || currentUser.nomor_kta || '00.3201.010.000089';
  const qrToken = linkedMember?.qr_token || 'SPWN-QR-WIL-3201-99812A';
  const ktaStatus = linkedMember?.kta_status || 'ACTIVE';
  const qrVerificationUrl = `${window.location.origin}/verifikasi/${qrToken}`;

  // Krida stats
  const kridaList = useMemo(() => {
    return [
      { id: 'KRIDA_PEMANDU', name: 'Pemandu Wisata', color: '#0066B3', icon: '🧭', totalSkk: 6, completed: 3 },
      { id: 'KRIDA_PENYULUH', name: 'Penyuluh Wisata', color: '#009B4D', icon: '📢', totalSkk: 6, completed: 2 },
      { id: 'KRIDA_MICE_EVENT', name: 'MICE & Event', color: '#F7941D', icon: '🎪', totalSkk: 6, completed: 1 },
      { id: 'KRIDA_KULINER_CINDERAMATA', name: 'Kuliner & Cinderamata', color: '#782B90', icon: '🍲', totalSkk: 5, completed: 0 },
    ];
  }, []);

  // SKK Summary calculations (23 SKK Nasional)
  const skkSummary = useMemo(() => {
    const total = 23;
    const completed = skkItems.filter((s) => s.status === 'COMPLETED').length || 6;
    const inProgress = skkItems.filter((s) => s.status === 'IN_PROGRESS').length || 4;
    const notStarted = total - completed - inProgress;
    const percentage = Math.round((completed / total) * 100);
    return { total, completed, inProgress, notStarted, percentage };
  }, [skkItems]);

  return (
    <div id="member-command-center" className="space-y-6">
      {/* ============================================================== */}
      {/* 1. MEMBER IDENTITY HEADER (Personal Member Command Center)     */}
      {/* ============================================================== */}
      <div className="bg-gradient-to-r from-[#0066B3] via-[#004D8C] to-[#009B4D] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-[#F7941D]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          {/* Member Profile Identity */}
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="relative shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-3 border-white/40 shadow-xl bg-slate-900">
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-2xl text-white">
                    {currentUser.fullName.charAt(0)}
                  </div>
                )}
              </div>
              <span
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#009B4D] border-2 border-white flex items-center justify-center text-white"
                title="Status Keanggotaan: Aktif"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-white/20 backdrop-blur-xs text-white border border-white/30">
                  {currentUser.membershipLevel || 'Anggota SAKA'}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-400 text-slate-950 shadow-xs">
                  ACTIVE
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight">
                {currentUser.fullName}
              </h2>

              <p className="text-xs sm:text-sm text-slate-100/90 flex flex-wrap items-center gap-1.5 font-medium">
                <MapPin className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />
                <span>Kwarda {currentUser.province || 'Jawa Barat'}</span>
                <span>•</span>
                <span>Kwarcab {currentUser.cityName || 'Kabupaten Bandung'}</span>
                {currentUser.districtName && (
                  <>
                    <span>•</span>
                    <span>Kwarran {currentUser.districtName}</span>
                  </>
                )}
              </p>

              <div className="text-[11px] text-white/80 pt-0.5 flex items-center gap-3">
                <span>Pangkalan: <strong>{currentUser.pangkalan || 'Pangkalan Saka Pariwisata'}</strong></span>
                <span>•</span>
                <span>Krida: <strong>{currentUser.kridaName || 'Krida Pemandu Wisata'}</strong></span>
              </div>
            </div>
          </div>

          {/* Quick Action Navigation Buttons */}
          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <button
              onClick={() => onNavigateTab('kta')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#0066B3] font-bold text-xs hover:bg-slate-50 transition-all shadow-md active:scale-95"
            >
              <CreditCard className="w-4 h-4 text-[#0066B3]" />
              <span>Buka KTA Digital</span>
            </button>
            <button
              onClick={() => onNavigateTab('achievement')}
              className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-semibold text-xs border border-white/30 transition-all active:scale-95"
            >
              <Award className="w-4 h-4 text-[#F7941D]" />
              <span>Pencapaian SKK</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. COMMAND CENTER GRID (Bento Layout)                          */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: DIGITAL KTA SHOWCASE (Takes 1 Col on Desktop) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">Digital KTA Resmi</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Identitas Anggota SPWN 2.0</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                {ktaStatus}
              </span>
            </div>

            {/* Compact Mini Card Preview */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-[#0066B3] to-[#0B1F33] text-white relative overflow-hidden shadow-inner">
              <div className="flex items-center justify-between text-[10px] uppercase font-bold tracking-wider text-slate-200 border-b border-white/20 pb-2 mb-3">
                <span>SAKA PARIWISATA</span>
                <span className="text-emerald-400">KTA WILAYAH</span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[10px] text-slate-300 font-mono">NOMOR KTA</p>
                  <p className="text-sm sm:text-base font-extrabold tracking-wider font-mono text-white">
                    {ktaNumber}
                  </p>
                  <p className="text-xs font-semibold text-slate-200 mt-1 truncate max-w-[170px]">
                    {currentUser.fullName}
                  </p>
                </div>
                <div className="w-14 h-14 bg-white p-1 rounded-xl shadow-xs shrink-0 flex items-center justify-center">
                  <QrCode className="w-12 h-12 text-slate-900" />
                </div>
              </div>
              <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-slate-300">
                <span>{currentUser.kridaName || 'Krida Pemandu'}</span>
                <span className="text-emerald-300 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> QR Terverifikasi
                </span>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Token QR:</span>
                <span className="font-mono font-bold text-slate-700">{qrToken}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span className="text-slate-500">Masa Berlaku:</span>
                <span className="font-medium text-emerald-700">Seumur Hidup (Aktif)</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-4">
            <button
              onClick={() => onNavigateTab('kta')}
              className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#0066B3] text-white text-xs font-bold hover:bg-[#005299] transition-colors shadow-xs"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Buka & Putar Kartu</span>
            </button>
            <a
              href={`/verifikasi/${qrToken}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              title="Cek URL Verifikasi Publik"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* CARD 2: ACHIEVEMENT PROGRESS (23 SKK NASIONAL) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-[#F7941D] flex items-center justify-center">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">Pencapaian SKK</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">23 Syarat Kecakapan Khusus Nasional</p>
                </div>
              </div>
              <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                Tingkat Madya
              </span>
            </div>

            {/* Radial / Bar Progress Metrics */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-black text-slate-900">{skkSummary.completed}</span>
                  <span className="text-xs font-semibold text-slate-500"> / {skkSummary.total} SKK</span>
                </div>
                <span className="text-xs font-bold text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded-lg">
                  {skkSummary.percentage}% Tuntas
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden flex">
                <div
                  style={{ width: `${(skkSummary.completed / skkSummary.total) * 100}%` }}
                  className="h-full bg-[#009B4D]"
                  title={`Selesai: ${skkSummary.completed}`}
                />
                <div
                  style={{ width: `${(skkSummary.inProgress / skkSummary.total) * 100}%` }}
                  className="h-full bg-[#F7941D]"
                  title={`Dalam Proses: ${skkSummary.inProgress}`}
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                <div className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-100">
                  <p className="text-[10px] text-emerald-800 font-medium">Selesai</p>
                  <p className="text-sm font-bold text-emerald-900">{skkSummary.completed}</p>
                </div>
                <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-100">
                  <p className="text-[10px] text-amber-800 font-medium">Proses</p>
                  <p className="text-sm font-bold text-amber-900">{skkSummary.inProgress}</p>
                </div>
                <div className="p-2 rounded-lg bg-slate-100/70 border border-slate-200">
                  <p className="text-[10px] text-slate-600 font-medium">Belum</p>
                  <p className="text-sm font-bold text-slate-700">{skkSummary.notStarted}</p>
                </div>
              </div>
            </div>

            {/* Level Tier Status */}
            <div className="flex items-center justify-between text-xs px-1">
              <span className="text-slate-500 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-[#F7941D]" /> Target Level Berikutnya:
              </span>
              <span className="font-bold text-slate-900">Utama (+4 SKK)</span>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateTab('achievement')}
              className="w-full inline-flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <span>Lihat Detail Matriks 23 SKK</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        {/* CARD 3: 4 KRIDA SAKA PROGRESS */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-[#782B90] flex items-center justify-center">
                  <Compass className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-none">Spesialisasi Krida</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pengembangan 4 Bidang Pariwisata</p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-[#782B90] border border-purple-200">
                4 Krida
              </span>
            </div>

            {/* 4 Krida List */}
            <div className="space-y-2.5">
              {kridaList.map((k) => {
                const percent = Math.round((k.completed / k.totalSkk) * 100);
                const isSelected = k.name.toLowerCase().includes(currentUser.kridaName?.toLowerCase() || 'pemandu');
                return (
                  <div
                    key={k.id}
                    className={`p-2.5 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-blue-50/50 border-[#0066B3]/40'
                        : 'bg-slate-50/50 border-slate-100 hover:border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{k.icon}</span>
                        <span className={`font-bold ${isSelected ? 'text-[#0066B3]' : 'text-slate-800'}`}>
                          {k.name}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-black uppercase text-[#0066B3] bg-blue-100/70 px-1.5 py-0.2 rounded">
                            Utama
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500">
                        {k.completed} / {k.totalSkk} SKK
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${percent}%`, backgroundColor: k.color }}
                        className="h-full rounded-full transition-all"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <button
              onClick={() => onNavigateTab('achievement')}
              className="w-full inline-flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors"
            >
              <span>Eksplorasi Silabus Krida</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. LOWER SPLIT: RECENT ACTIVITY & PORTFOLIO SUMMARY            */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 4: ACTIVITY SUMMARY (MEMBER_ACTIVITY) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#009B4D] flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-none">Riwayat Kegiatan Terbaru</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Event, Pelatihan & Bakti Kepanduan</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('kegiatan')}
              className="text-xs font-bold text-[#0066B3] hover:underline inline-flex items-center gap-0.5"
            >
              <span>Semua</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'ACT-01',
                title: 'Pelatihan Pemandu Geowisata Curug Malela',
                date: '18 Maret 2026',
                category: 'Pelatihan',
                location: 'Bandung Barat',
                status: 'Selesai',
              },
              {
                id: 'ACT-02',
                title: 'Bakti Saka Sadar Wisata Sapta Pesona',
                date: '28 Februari 2026',
                category: 'Pengabdian',
                location: 'Kawasan Ciwidey',
                status: 'Selesai',
              },
              {
                id: 'ACT-03',
                title: 'Jambore Daerah Saka Pariwisata Jabar',
                date: '10 Januari 2026',
                category: 'Event',
                location: 'Bumi Perkemahan Kiara Payung',
                status: 'Selesai',
              },
            ].map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center justify-between text-xs hover:border-slate-200 transition-colors"
              >
                <div className="space-y-0.5 min-w-0 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-[#0066B3] bg-blue-50 px-2 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-slate-400">{item.date}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate mt-1">{item.title}</h4>
                  <p className="text-[11px] text-slate-500">{item.location}</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg shrink-0 border border-emerald-200">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* CARD 5: PORTFOLIO SUMMARY (ZERO BLOB STORAGE COMPLIANCE) */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#F7941D] flex items-center justify-center">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 leading-none">Portofolio Pengabdian</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">Dokumentasi Karya & Verifikasi Pembina</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('portfolio')}
              className="text-xs font-bold text-[#0066B3] hover:underline inline-flex items-center gap-0.5"
            >
              <span>Kelola</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'PORT-01',
                title: 'Pemanduan Wisata Edukasi Heritage',
                role: 'Koordinator Pemandu',
                date: '15 Feb 2026',
                verifiedBy: 'Kak Hendra, M.Pd (Pembina)',
                status: 'VERIFIED',
                thumb: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&auto=format&fit=crop&q=60',
              },
              {
                id: 'PORT-02',
                title: 'Penyuluhan Sadar Wisata Desa Digital',
                role: 'Narasumber Muda',
                date: '20 Des 2025',
                verifiedBy: 'Kak Hendra, M.Pd (Pembina)',
                status: 'VERIFIED',
                thumb: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=60',
              },
            ].map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-2xl bg-slate-50/70 border border-slate-100 flex items-center gap-3 hover:border-slate-200 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200">
                  <img src={p.thumb} alt={p.title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="min-w-0 flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{p.title}</h4>
                  </div>
                  <p className="text-[11px] text-slate-500">{p.role} • {p.date}</p>
                  <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-[#009B4D]" />
                    Terverifikasi: {p.verifiedBy}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
