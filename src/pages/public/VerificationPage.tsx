/**
 * SPWN Apps 2.0 - Public Member Verification Page
 * Location: src/pages/public/VerificationPage.tsx
 * Route: /verifikasi
 * -----------------------------------------------------------------
 * Halaman verifikasi publik keaslian KTA Pramuka SAKA Pariwisata.
 * Mengintegrasikan:
 *   React UI -> verificationStore -> verification.api.ts -> GAS API -> VerificationResultCard
 * Menggunakan:
 *   - Desain Wonderful Indonesia Palette
 *   - Abstraksi kamera useQrScanner
 *   - Konfigurasi backend MEMBER.SHEETS.ANGGOTA
 *   - Proteksi privasi UU PDP No. 27/2022
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  Sparkles,
  History,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Compass,
  ArrowRight,
} from 'lucide-react';
import { useVerificationStore } from '../../stores/verificationStore';
import { VerificationInputForm } from '../../features/verification/components/VerificationInputForm';
import { QrScannerModal } from '../../features/verification/components/QrScannerModal';
import { VerificationResultCard } from '../../components/display/VerificationResultCard';
import { VerificationTrustBadge } from '../../components/display/VerificationTrustBadge';
import { Skeleton } from '../../components/ui/Skeleton';
import { Button } from '../../components/ui/Button';
import { MEMBER } from '../../config/constants';

export const VerificationPage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const {
    qrToken,
    isLoading,
    isRateLimited,
    result,
    error,
    history,
    verifyToken,
    resetVerification,
  } = useVerificationStore();

  const handleVerify = async (token: string) => {
    await verifyToken(token);
  };

  const handleScanSuccess = (scannedToken: string) => {
    setIsScannerOpen(false);
    verifyToken(scannedToken);
  };

  return (
    <div id="public-verification-page" className="min-h-screen py-8 sm:py-12 bg-[#F5F7FA]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Breadcrumb / Top Indicator */}
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Compass className="w-3.5 h-3.5 text-[#0066B3]" />
            <span>Layanan Publik Resmi</span>
            <span>/</span>
            <span className="text-slate-900 font-semibold">Verifikasi KTA Digital</span>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-[11px] text-slate-500 font-mono">
            <span className="w-2 h-2 rounded-full bg-[#009B4D] inline-block animate-pulse" />
            <span>Pangkalan Data: {MEMBER.SHEETS.ANGGOTA}</span>
          </div>
        </div>

        {/* Page Header Banner */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-100 text-[#0066B3] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-[#0066B3]" />
            <span>Sistem Otentikasi Nasional</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 font-display">
            Pusat Verifikasi Anggota
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Periksa keabsahan Kartu Tanda Anggota (KTA) resmi Gerakan Pramuka SAKA Pariwisata secara real-time dan terenkripsi.
          </p>
        </div>

        {/* SECTION 1: VERIFICATION TRUST BADGE (Official Authority) */}
        <VerificationTrustBadge variant="banner" />

        {/* SECTION 2: CORE INTERACTION & UX STATES */}
        <div className="space-y-8">
          {/* A. INPUT FORM (Visible when not showing result, or to re-scan) */}
          {!result && !isLoading && !isRateLimited && (
            <VerificationInputForm
              onOpenScanner={() => setIsScannerOpen(true)}
              onVerifyToken={handleVerify}
              isLoading={isLoading}
            />
          )}

          {/* B. LOADING STATE */}
          {isLoading && (
            <div
              id="verification-loading-state"
              className="w-full max-w-lg mx-auto bg-white rounded-3xl border border-slate-200 shadow-lg p-8 space-y-6 text-center animate-in fade-in duration-300"
            >
              <div className="relative w-20 h-20 mx-auto">
                <div className="w-20 h-20 rounded-full border-4 border-slate-100 border-t-[#0066B3] border-r-[#009B4D] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <QrCode className="w-8 h-8 text-[#0066B3] animate-pulse" />
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Memvalidasi Tanda Tangan KTA...
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Menghubungkan ke Pangkalan Data Keanggotaan Nasional SPWN ({MEMBER.SHEETS.ANGGOTA}) dan mengaudit keaslian token digital.
                </p>
              </div>

              {/* Skeleton placeholder card */}
              <div className="pt-2 space-y-3">
                <Skeleton className="h-4 w-3/4 mx-auto rounded" />
                <Skeleton className="h-4 w-1/2 mx-auto rounded" />
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Skeleton className="h-12 rounded-xl" />
                  <Skeleton className="h-12 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {/* C. RESULT CARD (SUCCESS OR INVALID OR RATE LIMIT) */}
          {(result || isRateLimited) && !isLoading && (
            <div className="space-y-6">
              <VerificationResultCard
                result={
                  result || {
                    isValid: false,
                    verifiedAt: new Date().toISOString(),
                    message: error || 'Batas pemindaian tercapai.',
                  }
                }
                isRateLimited={isRateLimited}
                onScanAgain={() => {
                  resetVerification();
                  setIsScannerOpen(true);
                }}
                onRetry={() => {
                  if (qrToken) {
                    verifyToken(qrToken);
                  } else {
                    resetVerification();
                  }
                }}
              />

              {/* Back to form button */}
              <div className="text-center">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<RotateCcw className="w-4 h-4 text-slate-500" />}
                  onClick={resetVerification}
                >
                  Kembali ke Form Verifikasi
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: RECENT VERIFICATION AUDIT LOG (HISTORY) */}
        {history.length > 0 && (
          <div
            id="verification-history-section"
            className="w-full max-w-xl mx-auto bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-slate-500" />
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Riwayat Pemindaian Sesi Ini ({history.length})
                </h4>
              </div>
              <span className="text-[10px] text-slate-400">Penyimpanan Lokal Sesi</span>
            </div>

            <div className="divide-y divide-slate-100">
              {history.map((item, idx) => (
                <div
                  key={`${item.token}-${idx}`}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {item.isValid ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {item.nama || item.token}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono">
                        {item.no_kta ? `KTA: ${item.no_kta} • ` : ''}
                        {new Date(item.timestamp).toLocaleTimeString('id-ID', {
                          hour: '2-digit',
                          minute: '2-digit',
                        })} WIB
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleVerify(item.token)}
                    className="px-2.5 py-1 text-[11px] font-semibold text-[#0066B3] hover:bg-sky-50 rounded-lg transition-colors shrink-0"
                  >
                    Cek Ulang
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SECTION 4: TRUST & EDUCATION ACCORDION / FOOTER BADGE */}
        <VerificationTrustBadge variant="full" />

        {/* Educational Info: 4 Krida SAKA Pariwisata */}
        <div className="text-center text-xs text-slate-400 max-w-xl mx-auto pt-4 leading-relaxed">
          <p>
            Kartu Tanda Anggota resmi Gerakan Pramuka Satuan Karya Pariwisata memuat 4 peminatan krida: KRIDA PEMANDU, KRIDA PENYULUH, KRIDA MICE & EVENT, dan KRIDA KULINER & CINDERAMATA.
          </p>
        </div>

      </div>

      {/* QR SCANNER CAMERA MODAL */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
