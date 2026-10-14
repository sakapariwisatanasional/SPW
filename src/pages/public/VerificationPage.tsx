/**
 * SPWN Apps 2.0 - Mobile-first Public KTA Verification
 * Route: /verifikasi
 * Preserves URL token auto-verification and existing verification store/components.
 */
import React, { useEffect, useRef, useState } from 'react';
import {
  ShieldCheck,
  QrCode,
  History,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Camera,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useVerificationStore } from '../../stores/verificationStore';
import { VerificationInputForm } from '../../features/verification/components/VerificationInputForm';
import { QrScannerModal } from '../../features/verification/components/QrScannerModal';
import { VerificationResultCard } from '../../components/display/VerificationResultCard';
import { Skeleton } from '../../components/ui/Skeleton';

export const VerificationPage: React.FC = () => {
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const lastAutoToken = useRef('');

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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromQuery = (params.get('token') || params.get('verifyId') || '').trim();
    const pathMatch = window.location.pathname.match(/\/(?:verifikasi|verify)\/([^/]+)\/?$/i);
    const fromPath = pathMatch ? decodeURIComponent(pathMatch[1]).trim() : '';
    const fromUrl = fromQuery || fromPath;
    if (!fromUrl || lastAutoToken.current === fromUrl) return;
    lastAutoToken.current = fromUrl;
    void verifyToken(fromUrl);
  }, [verifyToken]);

  const handleScanSuccess = (token: string) => {
    setIsScannerOpen(false);
    void verifyToken(token);
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7FAFC] px-4 pb-5 pt-4 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-xl">
        <section className="overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0B2F5B] via-[#0A6BA8] to-[#169CD8] p-5 text-white shadow-xl sm:p-7">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-sky-100"><ShieldCheck className="h-3.5 w-3.5" /> Verifikasi resmi</div>
              <h1 className="mt-1 text-2xl font-black sm:text-3xl">Cek KTA Digital</h1>
              <p className="mt-1 text-xs text-sky-100">Scan QR adalah cara tercepat di HP.</p>
            </div>
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/12 backdrop-blur"><QrCode className="h-7 w-7" /></div>
          </div>

          {!result && !isLoading && !isRateLimited && (
            <button
              type="button"
              onClick={() => setIsScannerOpen(true)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-white py-3.5 text-sm font-black text-[#0B2F5B] shadow-lg"
            >
              <Camera className="h-5 w-5 text-[#169CD8]" /> Scan QR KTA
            </button>
          )}
        </section>

        <div className="mt-4">
          {!result && !isLoading && !isRateLimited && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-3 shadow-sm sm:p-5">
              <div className="mb-2 text-center text-[10px] font-bold uppercase tracking-wider text-slate-400">atau masukkan token</div>
              <VerificationInputForm
                onOpenScanner={() => setIsScannerOpen(true)}
                onVerifyToken={(token) => verifyToken(token)}
                isLoading={isLoading}
              />
            </div>
          )}

          {isLoading && (
            <div className="rounded-[24px] border border-slate-200 bg-white p-6 text-center shadow-sm">
              <div className="relative mx-auto h-16 w-16">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-slate-100 border-r-[#63B32E] border-t-[#169CD8]" />
                <QrCode className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-[#169CD8]" />
              </div>
              <h3 className="mt-4 text-sm font-black text-[#0B2F5B]">Memvalidasi KTA...</h3>
              <div className="mt-4 space-y-2"><Skeleton className="mx-auto h-3 w-2/3 rounded" /><Skeleton className="mx-auto h-3 w-1/2 rounded" /></div>
            </div>
          )}

          {(result || isRateLimited) && !isLoading && (
            <div className="space-y-3">
              <VerificationResultCard
                result={result || { isValid: false, verifiedAt: new Date().toISOString(), message: error || 'Batas pemindaian tercapai.' }}
                isRateLimited={isRateLimited}
                onScanAgain={() => { resetVerification(); setIsScannerOpen(true); }}
                onRetry={() => { if (qrToken) void verifyToken(qrToken); else resetVerification(); }}
              />
              <button onClick={resetVerification} className="mx-auto flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold text-slate-500 hover:bg-white">
                <RotateCcw className="h-3.5 w-3.5" /> Verifikasi lainnya
              </button>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <section className="mt-4 overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-sm">
            <button onClick={() => setHistoryOpen((v) => !v)} className="flex w-full items-center justify-between gap-3 p-4 text-left">
              <div className="flex items-center gap-2"><History className="h-4 w-4 text-[#6F3BC5]" /><span className="text-xs font-black text-[#0B2F5B]">Riwayat ({history.length})</span></div>
              {historyOpen ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
            </button>
            {historyOpen && (
              <div className="max-h-52 overflow-y-auto border-t border-slate-100 px-4">
                {history.map((item, idx) => (
                  <button key={`${item.token}-${idx}`} onClick={() => void verifyToken(item.token)} className="flex w-full items-center justify-between gap-3 border-b border-slate-100 py-3 text-left last:border-0">
                    <div className="flex min-w-0 items-center gap-2.5">
                      {item.isValid ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <XCircle className="h-4 w-4 shrink-0 text-rose-500" />}
                      <div className="min-w-0"><div className="truncate text-xs font-bold text-slate-700">{item.nama || item.token}</div><div className="text-[9px] text-slate-400">{item.no_kta || 'Token KTA'}</div></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#169CD8]">Cek</span>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        <div className="mt-4 flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400"><ShieldCheck className="h-3.5 w-3.5 text-[#63B32E]" /> Data diverifikasi melalui sistem SPWN resmi</div>
      </div>

      <QrScannerModal isOpen={isScannerOpen} onClose={() => setIsScannerOpen(false)} onScanSuccess={handleScanSuccess} />
    </div>
  );
};

export default VerificationPage;
