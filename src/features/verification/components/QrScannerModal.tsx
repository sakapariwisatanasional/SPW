/**
 * SPWN Apps 2.0 - QrScannerModal
 * Location: src/features/verification/components/QrScannerModal.tsx
 * -----------------------------------------------------------------
 * Modal pemindai kamera interaktif berbasis useQrScanner hook.
 * Fitur:
 * - Live camera viewfinder dengan efek laser scan
 * - Switch kamera (kamera depan / belakang)
 * - Toggle torch / senter jika didukung hardware
 * - Fallback simulasi scan cepat untuk pengujian lingkungan preview
 * - Penanganan izin akses kamera yang ramah pengguna
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  Camera,
  RotateCw,
  Zap,
  ZapOff,
  AlertCircle,
  X,
  Upload,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { useQrScanner } from '../../../hooks/useQrScanner';
import { Button } from '../../../components/ui/Button';

export interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (token: string) => void;
}

export const QrScannerModal: React.FC<QrScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [selectedDemoToken, setSelectedDemoToken] = useState<string>('');

  const {
    videoRef,
    isActive,
    hasPermission,
    error,
    isTorchSupported,
    isTorchOn,
    startScanner,
    stopScanner,
    switchCamera,
    toggleTorch,
    triggerScanResult,
  } = useQrScanner({
    onScanSuccess: (token) => {
      stopScanner();
      onScanSuccess(token);
      onClose();
    },
  });

  // Jalankan scanner saat modal terbuka, matikan saat ditutup
  useEffect(() => {
    if (isOpen) {
      startScanner('environment');
    } else {
      stopScanner();
    }
    return () => {
      stopScanner();
    };
  }, [isOpen, startScanner, stopScanner]);

  if (!isOpen) return null;

  // Handler simulasi scan token instan
  const handleSimulateScan = (token: string) => {
    setSelectedDemoToken(token);
    setTimeout(() => {
      triggerScanResult(token);
    }, 400);
  };

  // Handler unggah gambar QR
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulasi ekstraksi token dari file gambar KTA
      const sampleToken = 'SPWN-KTA-SIGN-XYZ123';
      handleSimulateScan(sampleToken);
    }
  };

  return (
    <div
      id="qr-scanner-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        id="qr-scanner-modal-dialog"
        className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col text-white"
      >
        {/* Header Bar */}
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 z-20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0066B3] flex items-center justify-center text-white">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold tracking-tight text-white">
                Pindai Kode QR KTA
              </h3>
              <p className="text-[11px] text-slate-400">
                Arahkan kamera ke QR Code pada kartu fisik atau digital
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            aria-label="Tutup pemindai"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport / Error State */}
        <div className="relative aspect-square w-full bg-black overflow-hidden flex items-center justify-center">
          {/* Video Stream Element */}
          <video
            ref={videoRef}
            className={`w-full h-full object-cover ${isActive ? 'block' : 'hidden'}`}
            playsInline
            muted
          />

          {/* Viewfinder Reticle (Ketika Kamera Aktif) */}
          {isActive && !error && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              {/* Outer Dimmer Mask */}
              <div className="w-64 h-64 sm:w-72 sm:h-72 border-2 border-[#009B4D] rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]">
                {/* 4 Corner Markers */}
                <span className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-[#0066B3] rounded-tl-lg" />
                <span className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-[#0066B3] rounded-tr-lg" />
                <span className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-[#0066B3] rounded-bl-lg" />
                <span className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-[#0066B3] rounded-br-lg" />

                {/* Laser Scanning Line Animation */}
                <div className="w-full h-1 bg-gradient-to-r from-transparent via-[#009B4D] to-transparent shadow-[0_0_12px_#009B4D] absolute top-0 animate-[bounce_2.5s_infinite]" />
              </div>
            </div>
          )}

          {/* Error / Permission Fallback View */}
          {error && (
            <div className="p-6 text-center space-y-3 z-10 max-w-xs">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/30">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-white">Akses Kamera Terkendala</h4>
              <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-2 text-white border-slate-700 hover:bg-slate-800"
                onClick={() => startScanner()}
              >
                Coba Buka Ulang Kamera
              </Button>
            </div>
          )}

          {/* Controls Overlay (Top Right of Video) */}
          {isActive && !error && (
            <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
              {isTorchSupported && (
                <button
                  onClick={toggleTorch}
                  className={`p-2.5 rounded-full backdrop-blur-md border transition-all ${
                    isTorchOn
                      ? 'bg-amber-400 text-slate-950 border-amber-300'
                      : 'bg-slate-900/70 text-white border-white/20 hover:bg-slate-800'
                  }`}
                  title={isTorchOn ? 'Matikan Senter' : 'Nyalakan Senter'}
                >
                  {isTorchOn ? <Zap className="w-4 h-4 fill-current" /> : <ZapOff className="w-4 h-4" />}
                </button>
              )}

              <button
                onClick={switchCamera}
                className="p-2.5 rounded-full bg-slate-900/70 text-white border border-white/20 hover:bg-slate-800 transition-all backdrop-blur-md"
                title="Putar / Ganti Kamera"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Bottom Options & Quick Testing Tray */}
        <div className="p-4 bg-slate-900 border-t border-slate-800 space-y-3">
          {/* File Picker Fallback */}
          <div className="flex items-center justify-between gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Button
              size="sm"
              variant="outline"
              className="w-full text-xs text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white"
              leftIcon={<Upload className="w-3.5 h-3.5 text-slate-400" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Unggah Foto / Screenshot QR KTA
            </Button>
          </div>

          {/* Quick Simulation Chips for Evaluators/Users */}
          <div className="pt-2 border-t border-slate-800/80">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#F7941D]" /> Simulasi Token Uji Cepat:
              </span>
              <span className="text-[10px] text-slate-500">Klik untuk tes instan</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSimulateScan('SPWN-KTA-SIGN-XYZ123')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-[#0066B3] text-slate-200 hover:text-white text-[10px] font-mono border border-slate-700 transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                <span>KTA Sah (Fajar - Jabar)</span>
              </button>
              <button
                onClick={() => handleSimulateScan('SPWN-INVALID-TOKEN-999')}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-rose-900 text-slate-300 hover:text-rose-100 text-[10px] font-mono border border-slate-700 transition-colors"
              >
                <span>Token Palsu / Expired</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
