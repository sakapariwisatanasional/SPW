/**
 * VerificationTrustBadge
 * -----------------------------------------------------------------
 * Komponen jaminan otentisitas dan kepatuhan privasi SPWN Apps 2.0.
 * Menampilkan:
 * 1. Logo & Identitas SAKA Pariwisata Nasional
 * 2. Status Verifikasi Resmi Pangkalan Data Nasional (MEMBER.SHEETS.ANGGOTA)
 * 3. Kepatuhan UU PDP (Undang-Undang No. 27 Tahun 2022 tentang Pelindungan Data Pribadi)
 */

import React from 'react';
import { ShieldCheck, Lock, CheckCircle2, Award } from 'lucide-react';

export interface VerificationTrustBadgeProps {
  className?: string;
  variant?: 'compact' | 'full' | 'banner';
}

export const VerificationTrustBadge: React.FC<VerificationTrustBadgeProps> = ({
  className = '',
  variant = 'full',
}) => {
  if (variant === 'compact') {
    return (
      <div
        id="verification-trust-badge-compact"
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-200/80 text-[11px] text-slate-700 font-medium ${className}`}
      >
        <span className="w-2 h-2 rounded-full bg-[#009B4D] inline-block animate-pulse" />
        <span className="font-semibold text-[#0066B3]">SPWN Trust Engine</span>
        <span className="text-slate-400">•</span>
        <span className="text-slate-600 flex items-center gap-1">
          <Lock className="w-3 h-3 text-[#009B4D]" /> UU PDP Patuh
        </span>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div
        id="verification-trust-badge-banner"
        className={`w-full rounded-xl bg-gradient-to-r from-[#0B1F33] via-[#004C85] to-[#0066B3] p-4 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-xs flex items-center justify-center font-black text-sm text-white border border-white/25 shrink-0">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-bold tracking-tight">
                Pusat Otentikasi SAKA Pariwisata Nasional
              </h4>
              <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40 font-semibold uppercase tracking-wider">
                RESMI
              </span>
            </div>
            <p className="text-[11px] text-slate-200 mt-0.5">
              Terkoneksi langsung dengan Pangkalan Data Keanggotaan Gerakan Pramuka
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-emerald-300 font-medium bg-white/10 px-3 py-1.5 rounded-lg border border-white/20 shrink-0">
          <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>UU PDP No. 27/2022 Terjamin</span>
        </div>
      </div>
    );
  }

  return (
    <div
      id="verification-trust-badge"
      className={`rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs transition-all ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Brand & Authority */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#0066B3] to-[#009B4D] flex items-center justify-center text-white font-black text-base shadow-sm shrink-0">
            SP
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-900 leading-none">
                SAKA Pariwisata Network
              </h4>
              <span className="text-[10px] font-bold text-[#009B4D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 uppercase tracking-wide">
                TERVALIDASI
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Gugus Layanan Verifikasi KTA Pramuka Indonesia
            </p>
          </div>
        </div>

        {/* Sapta Pesona Emblem */}
        <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80 text-xs font-semibold text-slate-700">
          <Award className="w-4 h-4 text-[#F7941D]" />
          <span>Sapta Pesona & Krida Pariwisata</span>
        </div>
      </div>

      {/* Trust Commitments Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 text-xs text-slate-600">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-[#0066B3] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Tanda Tangan Kriptografis KTA:</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Setiap token QR diterbitkan dengan enkripsi digital yang diverifikasi secara real-time ke pangkalan data master.
            </p>
          </div>
        </div>

        <div className="flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-[#009B4D] shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-slate-800">Pelindungan Privasi (UU PDP):</span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Sesuai UU RI No. 27/2022, data sensitif (NIK, nomor telepon, dan kontak pribadi) tidak dipublikasikan ke publik.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
