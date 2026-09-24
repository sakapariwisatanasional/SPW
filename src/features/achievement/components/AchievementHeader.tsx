/**
 * SPWN Apps 2.0 - Achievement Header Component
 * Location: src/features/achievement/components/AchievementHeader.tsx
 * -------------------------------------------------------------------
 * Header hero profil pencapaian anggota dengan informasi pangkalan,
 * level badge kepramukaan, dan status proteksi privasi nilai.
 */

import React from 'react';
import {
  Shield,
  ShieldCheck,
  Eye,
  EyeOff,
  MapPin,
  Calendar,
  Sparkles,
  Award,
  UserCheck
} from 'lucide-react';
import { AchievementMemberInfo } from '../../../types/achievement';

interface AchievementHeaderProps {
  member: AchievementMemberInfo;
  isPrivacyScoreVisible: boolean;
  onTogglePrivacyView: () => void;
  onSwitchDemoProfile?: (type: 'active' | 'empty') => void;
  currentDemoType?: 'active' | 'empty';
}

export const AchievementHeader: React.FC<AchievementHeaderProps> = ({
  member,
  isPrivacyScoreVisible,
  onTogglePrivacyView,
  onSwitchDemoProfile,
  currentDemoType = 'active'
}) => {
  // Warna level kepramukaan resmi
  const levelBadgeConfig = {
    PURWA: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      label: 'Tingkat PURWA',
      desc: 'Kecakapan Dasar'
    },
    MADYA: {
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      label: 'Tingkat MADYA',
      desc: 'Kecakapan Menengah'
    },
    UTAMA: {
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      label: 'Tingkat UTAMA',
      desc: 'Kecakapan Mahir'
    }
  }[member.level] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    label: member.level,
    desc: 'Tingkatan'
  };

  return (
    <div
      id="achievement-profile-header"
      className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm relative overflow-hidden"
    >
      {/* Decorative Brand Accent Gradient Bar */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0066B3] via-[#00A86B] to-[#F59E0B]" />

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Side: Avatar & Bio */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar Container */}
          <div className="relative">
            <img
              src={member.fotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
              alt={member.full_name || member.nama}
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-slate-100"
              referrerPolicy="no-referrer"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-2 border-white shadow-sm" title="KTA Aktif">
              <UserCheck className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {member.full_name || member.nama}
              </h1>
              {/* Level Badge */}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${levelBadgeConfig.bg}`}>
                <Award className="w-3.5 h-3.5" />
                {levelBadgeConfig.label}
              </span>
            </div>

            {/* Nomor KTA & Krida */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-slate-600 mb-3">
              <span className="font-mono font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                {member.no_kta || member.nomorKta}
              </span>
              <span className="text-slate-300">•</span>
              <span className="inline-flex items-center gap-1 font-medium text-[#0066B3]">
                <Sparkles className="w-3.5 h-3.5" />
                {member.kridaUtamaNama}
              </span>
            </div>

            {/* Pangkalan & Tanggal */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {member.pangkalan} ({member.kwarcab}, {member.kwarda})
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Bergabung: {member.tanggalBergabung}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Privacy & Demo Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          {/* Privacy Score Protection Tag & Toggle */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="btn-toggle-privacy-score"
              onClick={onTogglePrivacyView}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isPrivacyScoreVisible
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
              }`}
              title="UU PDP Privacy Guard: Nilai evaluasi hanya tampil untuk anggota bersangkutan / pengurus berwenang"
            >
              {isPrivacyScoreVisible ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Akses Pemilik (Nilai Tampil)</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-slate-500" />
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mode Publik (Nilai Disensor)</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Demo Switcher (Active vs Empty State) */}
          {onSwitchDemoProfile && (
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg text-xs">
              <span className="text-slate-500 px-1.5 text-[11px] font-medium">Uji Profil:</span>
              <button
                type="button"
                id="btn-demo-active-profile"
                onClick={() => onSwitchDemoProfile('active')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentDemoType === 'active'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Fajar (Aktif)
              </button>
              <button
                type="button"
                id="btn-demo-empty-profile"
                onClick={() => onSwitchDemoProfile('empty')}
                className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                  currentDemoType === 'empty'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bagas (Baru / Kosong)
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
