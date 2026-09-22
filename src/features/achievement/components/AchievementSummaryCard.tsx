/**
 * SPWN Apps 2.0 - Achievement Summary Card Component
 * Location: src/features/achievement/components/AchievementSummaryCard.tsx
 * ------------------------------------------------------------------------
 * Kartu ringkasan metrik SKK, progress bar menuju tingkat berikutnya,
 * dan statistik perolehan lencana serta keaktifan kepariwisataan.
 */

import React from 'react';
import { CheckCircle2, Clock, Award, Compass, Sparkles } from 'lucide-react';
import { AchievementSummary, MemberLevel } from '../../../types/achievement';

interface AchievementSummaryCardProps {
  summary: AchievementSummary;
  currentLevel: MemberLevel;
}

export const AchievementSummaryCard: React.FC<AchievementSummaryCardProps> = ({
  summary,
  currentLevel
}) => {
  // Hitung target SKK berikutnya
  const nextTarget = currentLevel === 'PURWA'
    ? { level: 'MADYA', target: 3, remaining: Math.max(0, 3 - summary.completedSkk) }
    : currentLevel === 'MADYA'
    ? { level: 'UTAMA', target: 8, remaining: Math.max(0, 8 - summary.completedSkk) }
    : { level: 'UTAMA TERLENGKAPI', target: 23, remaining: Math.max(0, 23 - summary.completedSkk) };

  return (
    <div
      id="achievement-summary-card"
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Kemajuan Syarat Kecakapan Khusus (SKK)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Akumulasi pencapaian 23 SKK Nasional dari 4 Krida SAKA Pariwisata
          </p>
        </div>
        <div className="text-right">
          <span className="text-2xl font-extrabold text-slate-900">
            {summary.completedSkk}
            <span className="text-xs font-semibold text-slate-400">/{summary.totalSkkAvailable}</span>
          </span>
          <p className="text-[11px] font-medium text-emerald-600">
            {summary.progressPercent}% Selesai
          </p>
        </div>
      </div>

      {/* Progress Bar with Steps */}
      <div className="mb-6">
        <div className="w-full bg-slate-100 rounded-full h-3.5 p-0.5 overflow-hidden border border-slate-200">
          <div
            className="bg-gradient-to-r from-[#0066B3] via-[#00A86B] to-[#10B981] h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.min(100, Math.max(4, summary.progressPercent))}%` }}
          />
        </div>

        {/* Milestone Threshold Indicators */}
        <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1 font-medium">
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${summary.completedSkk >= 1 ? 'bg-emerald-500' : 'bg-slate-300'}`} />
            <span>Purwa (1 SKK)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${summary.completedSkk >= 3 ? 'bg-blue-500' : 'bg-slate-300'}`} />
            <span>Madya (3 SKK)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${summary.completedSkk >= 8 ? 'bg-amber-500' : 'bg-slate-300'}`} />
            <span>Utama (8+ SKK)</span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`w-2 h-2 rounded-full ${summary.completedSkk === 23 ? 'bg-indigo-500' : 'bg-slate-300'}`} />
            <span>Paripurna (23)</span>
          </div>
        </div>
      </div>

      {/* Next Level Hint */}
      {nextTarget.remaining > 0 ? (
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs text-blue-900">
          <span className="font-medium">
            Tingkat saat ini: <strong className="font-bold">{currentLevel}</strong>. Butuh {nextTarget.remaining} SKK lagi untuk mencapai tingkat {nextTarget.level}.
          </span>
          <span className="text-[11px] font-semibold text-[#0066B3] underline cursor-pointer">
            Panduan Ujian
          </span>
        </div>
      ) : (
        <div className="mb-6 px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center text-xs text-emerald-900 font-medium">
          Selamat! Anda telah melampaui standar kelayakan tingkat {currentLevel}.
        </div>
      )}

      {/* 4 Quick Stat Metric Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
          <div className="flex items-center gap-2 text-emerald-700 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-semibold">SKK Selesai</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{summary.completedSkk}</div>
          <div className="text-[10px] text-slate-500">Kecakapan Teruji</div>
        </div>

        <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-100">
          <div className="flex items-center gap-2 text-amber-700 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Dalam Proses</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{summary.inProgressSkk}</div>
          <div className="text-[10px] text-slate-500">Masa Pengujian</div>
        </div>

        <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100">
          <div className="flex items-center gap-2 text-blue-700 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-semibold">Lencana Diraih</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{summary.totalBadges}</div>
          <div className="text-[10px] text-slate-500">Digital Badges</div>
        </div>

        <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100">
          <div className="flex items-center gap-2 text-indigo-700 mb-1">
            <Compass className="w-4 h-4" />
            <span className="text-xs font-semibold">Kegiatan</span>
          </div>
          <div className="text-xl font-bold text-slate-900">{summary.totalActivities}</div>
          <div className="text-[10px] text-slate-500">Partisipasi Wisata</div>
        </div>
      </div>
    </div>
  );
};
