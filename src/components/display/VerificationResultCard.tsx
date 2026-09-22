/**
 * VerificationResultCard
 * -----------------------------------------------------------------
 * Komponen hasil scan QR & verifikasi KTA publik baru sesuai Refinement.
 * Mendukung status:
 * 1. SUCCESS (KTA Terverifikasi Resmi dengan data sanitized)
 * 2. INVALID (Token tidak valid / expired / tanda tangan digital tidak cocok)
 * 3. RATE LIMIT (429 Too Many Requests - Batas 30 request/menit tercapai)
 * Menampilkan audit timestamp, badge keaslian, dan kepatuhan UU PDP.
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  MapPin,
  Calendar,
  Award,
  User,
  RefreshCw,
  AlertTriangle,
  Copy,
  Check,
  Share2,
} from 'lucide-react';
import { QrVerificationResult } from '../../services/api/verification.api';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';

export interface VerificationResultCardProps {
  result: QrVerificationResult;
  isRateLimited?: boolean;
  onScanAgain?: () => void;
  onRetry?: () => void;
}

export const VerificationResultCard: React.FC<VerificationResultCardProps> = ({
  result,
  isRateLimited = false,
  onScanAgain,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const isValid = result.isValid;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  // 1. RATE LIMIT STATE (HTTP 429)
  if (isRateLimited) {
    return (
      <div
        id="verification-result-card-ratelimit"
        className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-amber-300 shadow-lg overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 px-6 py-5 text-white flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30">
            <AlertTriangle className="w-7 h-7 text-amber-200" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                Batas Pemindaian Tercapai
              </h3>
              <Badge variant="orange">LIMIT 30/MENIT</Badge>
            </div>
            <p className="text-xs text-white/90 mt-0.5">
              Sistem perlindungan gateway mencegah aktivitas verifikasi berlebihan
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs leading-relaxed space-y-2">
            <p className="font-bold text-amber-950">
              Pengamanan Pangkalan Data Anggota SPWN
            </p>
            <p>
              Untuk mencegah scraping dan penelusuran identitas massal tanpa izin, API verifikasi publik dibatasi maksimal <strong>30 permintaan per menit</strong> per alamat IP.
            </p>
            <p className="text-amber-800 text-[11px]">
              Silakan tunggu 60 detik sebelum melakukan pemindaian atau memasukkan token QR berikutnya.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            {onRetry && (
              <Button
                variant="primary"
                className="flex-1"
                leftIcon={<RefreshCw className="w-4 h-4 text-white" />}
                onClick={onRetry}
              >
                Coba Lagi Sekarang
              </Button>
            )}
            {onScanAgain && (
              <Button
                variant="outline"
                className="flex-1"
                onClick={onScanAgain}
              >
                Pindai Token Baru
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. REGULAR VERIFICATION RESULT (VALID / INVALID)
  return (
    <div
      id="verification-result-card"
      className="w-full max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200"
    >
      {/* Status Header Banner */}
      <div
        className={`px-6 py-5 text-white flex items-center justify-between ${
          isValid
            ? 'bg-gradient-to-r from-[#0066B3] via-[#004C85] to-[#009B4D]'
            : 'bg-gradient-to-r from-rose-600 via-rose-700 to-rose-800'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/30 shadow-inner">
            {isValid ? (
              <ShieldCheck className="w-7 h-7 text-emerald-300" />
            ) : (
              <XCircle className="w-7 h-7 text-rose-200" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold tracking-tight">
                {isValid ? 'KTA Resmi Terverifikasi' : 'Verifikasi Tidak Valid'}
              </h3>
              <Badge variant={isValid ? 'green' : 'red'}>
                {isValid ? 'VALID' : 'INVALID'}
              </Badge>
            </div>
            <p className="text-xs text-white/85 mt-0.5">
              {isValid
                ? 'Data otentik terkonfirmasi di pangkalan data SPWN Nasional'
                : 'Tanda tangan kriptografis tidak cocok atau KTA telah kedaluwarsa'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Body */}
      <div className="p-6 space-y-5">
        {isValid ? (
          <>
            {/* Identity Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
              <div className="w-16 h-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-xs flex items-center justify-center">
                {result.foto ? (
                  <img
                    src={result.foto}
                    alt={result.nama || 'Anggota'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <User className="w-8 h-8 text-slate-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Nama Anggota Terdaftar
                </span>
                <h4 className="text-base sm:text-lg font-bold text-slate-900 truncate">
                  {result.nama || 'Nama Tidak Tersedia'}
                </h4>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-sky-50 text-[#0066B3] rounded-md border border-sky-200">
                    {result.no_kta || 'N/A'}
                  </span>
                  <span className="text-xs text-slate-600 font-medium flex items-center gap-1">
                    Status: <strong className="text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">{result.status || 'ACTIVE'}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Key Attributes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Award className="w-5 h-5 text-[#F7941D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Tingkatan Pramuka</p>
                  <p className="text-sm font-bold text-slate-800">{result.tingkatan || '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-[#009B4D] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Peminatan Krida</p>
                  <p className="text-sm font-bold text-slate-800">{result.krida || '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#0066B3] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Kwartir Daerah</p>
                  <p className="text-sm font-bold text-slate-800">{result.kwartir_daerah || '-'}</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-3">
                <Calendar className="w-5 h-5 text-[#6A1B9A] shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-medium text-slate-500">Waktu Verifikasi</p>
                  <p className="text-sm font-bold text-slate-800">
                    {result.verifiedAt
                      ? new Date(result.verifiedAt).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        }) + ' WIB'
                      : 'Sekarang'}
                  </p>
                </div>
              </div>
            </div>

            {/* Dynamic QR Identity & Audit Stats */}
            <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700">Dynamic QR Identity</span>
                <p className="font-mono text-xs text-sky-950 font-semibold truncate max-w-[260px] sm:max-w-[340px]">
                  {result.qr_token || 'Token Resmi Kriptografis'}
                </p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="blue">
                  {result.qr_scan_count ? `Scan ke-${result.qr_scan_count}` : 'Terotentikasi'}
                </Badge>
              </div>
            </div>

            {/* Privacy & Trust Badge */}
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-semibold text-emerald-950">
                  Data Terverifikasi Pangkalan Data SPWN (MEMBER.SHEETS.ANGGOTA)
                </p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Informasi sensitif (NIK, tanggal lahir, kontak pribadi) telah disanitasi secara otomatis demi kepatuhan UU PDP No. 27/2022.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-6 text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 shadow-xs">
              <XCircle className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              Kode Token Tidak Dapat Diverifikasi
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {result.message ||
                'Token QR ini tidak terdaftar dalam pangkalan data resmi Saka Pariwisata Nasional atau tanda tangan digital KTA telah usang.'}
            </p>
            <div className="text-[11px] text-slate-400 pt-1">
              Pastikan QR Code yang Anda pindai adalah KTA Digital resmi SAKA Pariwisata Network (SPWN 2.0).
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
          {onScanAgain && (
            <Button
              variant="outline"
              className="w-full sm:flex-1 justify-center"
              leftIcon={<RefreshCw className="w-4 h-4 text-slate-600" />}
              onClick={onScanAgain}
            >
              Pindai QR Token Lain
            </Button>
          )}

          {isValid && (
            <Button
              variant="ghost"
              className="w-full sm:w-auto justify-center text-xs"
              leftIcon={copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-[#0066B3]" />}
              onClick={handleCopyLink}
            >
              {copied ? 'Tautan Disalin!' : 'Bagikan Hasil'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
