/**
 * SPWN Apps 2.0 - VerificationInputForm
 * Location: src/features/verification/components/VerificationInputForm.tsx
 * -----------------------------------------------------------------
 * Form verifikasi KTA publik dengan orientasi UX Prioritas:
 * 1. PRIMARY ACTION: Pindai QR KTA (Kamera / Scanner Modal)
 * 2. SECONDARY ACTION: Input Token Kriptografis Manual
 * Tidak menjadikan Nomor KTA sebagai metode publik utama (demi keamanan & anti-forgery).
 */

import React, { useState } from 'react';
import {
  QrCode,
  Camera,
  Search,
  KeyRound,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Info,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';

export interface VerificationInputFormProps {
  onOpenScanner: () => void;
  onVerifyToken: (token: string) => void;
  isLoading?: boolean;
}

export const VerificationInputForm: React.FC<VerificationInputFormProps> = ({
  onOpenScanner,
  onVerifyToken,
  isLoading = false,
}) => {
  const [manualToken, setManualToken] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = manualToken.trim();
    if (!trimmed) {
      setInputError('Silakan masukkan kode token QR KTA');
      return;
    }
    setInputError(null);
    onVerifyToken(trimmed);
  };

  const handleQuickToken = (token: string) => {
    setManualToken(token);
    setInputError(null);
    onVerifyToken(token);
  };

  return (
    <div
      id="verification-input-form"
      className="w-full max-w-xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-md p-6 sm:p-8 space-y-6"
    >
      {/* 1. PRIMARY ACTION: SCAN QR KTA */}
      <div className="space-y-3 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-[#0066B3] text-xs font-bold uppercase tracking-wider">
          <QrCode className="w-3.5 h-3.5" />
          <span>Metode Verifikasi Utama</span>
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
            Pindai Kode QR KTA Digital
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1 leading-relaxed">
            Arahkan kamera smartphone atau pemindai ke QR Code yang tertera pada Kartu Tanda Anggota resmi SAKA Pariwisata.
          </p>
        </div>

        {/* Big Touch-Friendly Scanner Button (WCAG >48px: h-14) */}
        <button
          onClick={onOpenScanner}
          disabled={isLoading}
          id="btn-primary-open-scanner"
          className="w-full h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-[#0066B3] via-[#005291] to-[#009B4D] hover:from-[#005291] hover:to-[#007A3D] text-white font-extrabold text-sm sm:text-base shadow-lg shadow-[#0066B3]/25 flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
        >
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="w-5 h-5 text-white" />
          </div>
          <span>Buka Pemindai Kamera KTA</span>
        </button>
      </div>

      {/* Divider */}
      <div className="relative flex items-center justify-center">
        <div className="border-t border-slate-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-widest absolute">
          Atau Masukkan Token
        </span>
      </div>

      {/* 2. SECONDARY ACTION: MANUAL TOKEN ENTRY */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowManualInput(!showManualInput)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-[#0066B3]" />
            <span>Punya Kode Token QR? Masukkan Manual di Sini</span>
          </div>
          {showManualInput ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {showManualInput && (
          <form onSubmit={handleManualSubmit} className="space-y-3 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <div className="flex-1">
                <Input
                  placeholder="Contoh: SPWN-KTA-SIGN-XYZ123"
                  value={manualToken}
                  onChange={(e) => {
                    setManualToken(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  leftIcon={<KeyRound className="w-4 h-4" />}
                  error={inputError || undefined}
                  disabled={isLoading}
                  className="font-mono text-xs"
                />
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={isLoading}
                isLoading={isLoading}
                className="shrink-0 h-10 px-5"
                leftIcon={<Search className="w-4 h-4 text-white" />}
              >
                Cek Token
              </Button>
            </div>

            {/* Quick Demo Tokens for Evaluators */}
            <div className="p-3 rounded-xl bg-sky-50/60 border border-sky-100 text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#0066B3] font-bold text-[11px]">
                <Sparkles className="w-3.5 h-3.5 text-[#F7941D]" />
                <span>Uji Coba Token Format Final:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickToken('SPWN-QR-NAS-7A8F9C1B')}
                  className="px-2.5 py-1 rounded-md bg-white border border-amber-300 text-amber-900 font-mono text-[10px] font-semibold hover:bg-amber-50 transition-colors"
                >
                  SPWN-QR-NAS-7A8F9C1B (Kwarnas: 00.000001)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickToken('SPWN-QR-WIL-3204-7A8F9C1B')}
                  className="px-2.5 py-1 rounded-md bg-white border border-emerald-300 text-emerald-900 font-mono text-[10px] font-semibold hover:bg-emerald-50 transition-colors"
                >
                  SPWN-QR-WIL-3204-7A8F9C1B (Wilayah: 00.3204.190.000123)
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickToken('SPWN-INVALID-TOKEN-999')}
                  className="px-2.5 py-1 rounded-md bg-white border border-rose-200 text-rose-600 font-mono text-[10px] font-semibold hover:bg-rose-50 transition-colors"
                >
                  SPWN-INVALID-TOKEN-999 (Palsu)
                </button>
              </div>
            </div>
          </form>
        )}
      </div>

      {/* Security Info Note */}
      <div className="flex items-start gap-2 text-[11px] text-slate-500 leading-relaxed pt-1">
        <Info className="w-3.5 h-3.5 text-[#0066B3] shrink-0 mt-0.5" />
        <span>
          Layanan publik ini hanya menerima token tanda tangan QR terenkripsi guna mencegah manipulasi fisik kartu dan melindungi privasi anggota terdaftar.
        </span>
      </div>
    </div>
  );
};
