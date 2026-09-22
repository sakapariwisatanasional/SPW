/**
 * SPWN Apps 2.0 - Achievement Empty State Component
 * Location: src/features/achievement/components/AchievementEmptyState.tsx
 * -----------------------------------------------------------------------
 * Ditampilkan khusus untuk anggota yang belum memiliki riwayat pencapaian
 * atau belum menyelesaikan Syarat Kecakapan Khusus (SKK).
 */

import React from 'react';
import { Award, Compass, BookOpen, ArrowRight, ShieldCheck } from 'lucide-react';

interface AchievementEmptyStateProps {
  memberNama?: string;
  onExploreCatalog?: () => void;
  onContactPembina?: () => void;
}

export const AchievementEmptyState: React.FC<AchievementEmptyStateProps> = ({
  memberNama = 'Anggota',
  onExploreCatalog,
  onContactPembina
}) => {
  return (
    <div
      id="achievement-empty-state"
      className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 text-center max-w-2xl mx-auto shadow-sm"
    >
      {/* Icon Badge Ring */}
      <div className="mx-auto w-20 h-20 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600 mb-6 shadow-inner">
        <Award className="w-10 h-10 stroke-[1.75]" />
      </div>

      {/* Heading & Subtitle */}
      <h3 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight mb-2">
        Belum Ada Pencapaian Tercatat
      </h3>
      <p className="text-slate-600 text-sm sm:text-base leading-relaxed mb-8 max-w-lg mx-auto">
        Halo <span className="font-semibold text-slate-900">{memberNama}</span>, Anda belum memiliki
        pencapaian Syarat Kecakapan Khusus (SKK) atau lencana digital yang terverifikasi. Mari mulai perjalanan
        kepariwisataan Anda bersama SAKA Pariwisata!
      </p>

      {/* Step Recommendation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left mb-8">
        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3 mb-2 text-[#0066B3]">
            <Compass className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-slate-900">Pilih Krida Peminatan</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Eksplorasi 4 Krida utama: Pemandu Wisata, Penyuluh Wisata, MICE, atau Kuliner Wisata.
          </p>
        </div>

        <div className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-colors">
          <div className="flex items-center gap-3 mb-2 text-emerald-600">
            <ShieldCheck className="w-5 h-5" />
            <h4 className="font-semibold text-sm text-slate-900">Uji Kecakapan dengan Pembina</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Ikuti materi ujian SKK di pangkalan dan selesaikan portofolio untuk meraih tingkatan Purwa.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          type="button"
          id="btn-explore-skk-catalog"
          onClick={onExploreCatalog}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066B3] hover:bg-[#005290] text-white font-medium text-sm shadow-sm transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Lihat Panduan SKK Nasional</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        {onContactPembina && (
          <button
            type="button"
            id="btn-contact-pembina"
            onClick={onContactPembina}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-all"
          >
            <span>Hubungi Pamong / Pembina</span>
          </button>
        )}
      </div>
    </div>
  );
};
