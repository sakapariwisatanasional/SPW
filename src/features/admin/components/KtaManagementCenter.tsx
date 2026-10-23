/**
 * SPWN Apps 2.0 - KTA Management Center (Module 3)
 * Location: src/features/admin/components/KtaManagementCenter.tsx
 * -----------------------------------------------------------------
 * Mengintegrasikan KTA Lifecycle:
 * - Antrean Penerbitan KTA Otomatis
 * - Regenerate KTA dengan Izin Khusus & Audit Log Alasan Peremajaan
 * - KTA Batch Preview & Cetak Massal menggunakan DigitalMemberCard + template GAS
 * - Log Riwayat Penerbitan KTA (KTA_Generation_Log)
 */

import React, { useEffect, useState, useMemo } from 'react';
import { createRoot } from 'react-dom/client';
import {
  CreditCard,
  Printer,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  Shield,
  Eye,
  X,
  Lock,
  Layers,
  Sliders,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import { AdminMemberRecord } from '../types/admin.types';
import { DigitalMemberCard } from './DigitalMemberCard';
import { KtaCardCustomizerModal } from './KtaCardCustomizerModal';
import { KtaCardSettings } from '../../../types/kta.types';
import { spreadsheetService } from '../../../services/spreadsheetService';
import { mapMemberToKtaBinding } from '../../../utils/ktaMemberMapper';
import { useUIStore } from '../../../stores/uiStore';
import { memberApi } from '../../../services/api/member.api';
import { useAuthStore } from '../../../stores/authStore';

const getBackendMemberId = (member: AdminMemberRecord) =>
  member.id ||
  (member as any).member_id ||
  (member as any).memberId ||
  member.nomor_kta ||
  '';

export const KtaManagementCenter: React.FC = () => {
  const { addToast } = useUIStore();
  const {
    members,
    membersLoading,
    membersError,
    ktaLogs,
    simulatedScope,
    scopeProvinceId,
    scopeRegencyId,
    loadMembers,
  } = useAdminStore();
  const { currentUser: authUser } = useAuthStore();
  const isQaSuperAdminSession = authUser?.role === 'SUPER_ADMIN';

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'batch' | 'logs'>('queue');
  const [searchKta, setSearchKta] = useState('');

  // Selected member for single preview using DigitalMemberCard
  const [previewMember, setPreviewMember] = useState<AdminMemberRecord | null>(null);

  // Selected member for Regenerate KTA Modal
  const [regenMember, setRegenMember] = useState<AdminMemberRecord | null>(null);
  const [regenReason, setRegenReason] = useState('');
  const [regenAuthority, setRegenAuthority] = useState('Surat Keputusan Kwartir No. 04/SPWN/2026');
  const [regenError, setRegenError] = useState('');

  // Batch Print Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isBatchPreviewOpen, setIsBatchPreviewOpen] = useState(false);
  const [isPrintingBatch, setIsPrintingBatch] = useState(false);

  // KTA Template Designer Modal
  const [isCustomizerOpen, setIsCustomizerOpen] = useState(false);
  const [templateSettings, setTemplateSettings] = useState<KtaCardSettings | null>(null);
  const [templateLoading, setTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const loadTemplateSettings = async () => {
    setTemplateLoading(true);
    setTemplateError(null);

    try {
      const template = await spreadsheetService.refreshKtaSettings('TMPL_DEFAULT');

      if (!template) {
        setTemplateSettings(null);
        setTemplateError('Template TMPL_DEFAULT belum tersedia di GAS.');
        return;
      }

      setTemplateSettings(template);
    } catch (error: any) {
      console.error('KTA Management gagal memuat template GAS:', error);
      setTemplateSettings(null);
      setTemplateError(
        error?.message ||
        'Template KTA gagal dimuat dari GAS.'
      );
    } finally {
      setTemplateLoading(false);
    }
  };

  useEffect(() => {
    // Halaman KTA harus memuat database anggota sendiri. Jangan bergantung
    // pada dashboard/halaman lain yang mungkin belum pernah memanggil loadMembers().
    void loadTemplateSettings();
    void loadMembers();
  }, []);

  const refreshKtaDatabase = async () => {
    try {
      const loaded = await loadMembers();
      if (Array.isArray(loaded) && loaded.length > 0) {
        addToast({
          type: 'success',
          title: 'Database KTA Diperbarui',
          message: `${loaded.length} data anggota berhasil dimuat dari GAS.`,
        });
      } else {
        const currentError = useAdminStore.getState().membersError;
        addToast({
          type: currentError ? 'error' : 'info',
          title: currentError ? 'Database KTA Gagal Dimuat' : 'Database KTA Kosong',
          message: currentError || 'GAS berhasil merespons, tetapi belum ada data anggota yang dapat ditampilkan.',
        });
      }
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Database KTA Gagal Dimuat',
        message: error?.message || 'Gagal memuat data anggota dari GAS.',
      });
    }
  };


  // Filter members based on regional scope
  const scopedMembers = useMemo(() => {
    return members.filter((m) => {
      if (simulatedScope === 'ADMIN_WILAYAH') {
        if (scopeProvinceId !== 'ALL' && m.provinsi_id !== scopeProvinceId) return false;
        if (scopeRegencyId !== 'ALL' && m.kabupaten_id !== scopeRegencyId) return false;
      }
      if (searchKta.trim()) {
        const q = searchKta.toLowerCase();
        const matchName = (m.full_name || m.nama_lengkap || m.nama || '').toLowerCase().includes(q);
        const matchKta = (m.no_kta || m.nomor_kta || m.nomorKTA || '').toLowerCase().includes(q);
        const matchCity = (m.kabupaten_nama || '').toLowerCase().includes(q);
        if (!matchName && !matchKta && !matchCity) return false;
      }
      return true;
    });
  }, [members, simulatedScope, scopeProvinceId, scopeRegencyId, searchKta]);

  // Antrean Otomatis (REVIEWED_VERIFIED siap terbit, atau ACTIVE tanpa No KTA)
  const autoIssueQueue = useMemo(() => {
    return scopedMembers.filter((m) => m.status_anggota === 'REVIEWED_VERIFIED' || (m.status_anggota === 'ACTIVE' && (!(m.no_kta || m.nomor_kta) || m.kta_status !== 'ACTIVE')));
  }, [scopedMembers]);

  // Anggota aktif dengan KTA terbit
  const activeKtaMembers = useMemo(() => {
    return scopedMembers.filter((m) => {
      const memberStatus = String(m.status_anggota || m.status || '').trim().toUpperCase();
      const ktaNumber = String(
        m.no_kta || m.nomor_kta || (m as any).nomorKTA || (m as any).nationalMemberNumber || ''
      ).trim();
      return memberStatus === 'ACTIVE' && Boolean(ktaNumber);
    });
  }, [scopedMembers]);

  useEffect(() => {
    const validIds = new Set(activeKtaMembers.map((member) => String(getBackendMemberId(member))));
    setSelectedIds((current) => current.filter((id) => validIds.has(String(id))));
  }, [activeKtaMembers]);

  // Cetak batch A4 duplex: 10 kartu per halaman (2 kolom x 5 baris).
  // Data anggota dan template tetap bersumber dari store/GAS, tanpa data contoh.
  const handlePrintBatch = async () => {
    if (isPrintingBatch) return;
    if (!templateSettings) {
      addToast({ type: 'error', title: 'Template KTA Belum Tersedia',
        message: templateError || 'Template KTA harus berhasil dimuat dari GAS sebelum mencetak.' });
      return;
    }

    const selectedMembers = activeKtaMembers.filter((member) =>
      selectedIds.includes(getBackendMemberId(member))
    );
    if (!selectedMembers.length) {
      addToast({ type: 'info', title: 'Belum Ada KTA Dipilih',
        message: 'Pilih minimal satu anggota sebelum mencetak batch.' });
      return;
    }

    // Satu KTA = satu baris berisi sisi depan dan belakang berdampingan.
    // Untuk ukuran ID-1 85.6 x 53.98 mm, A4 portrait memuat 5 KTA lengkap/lembar.
    const cardWidthMm = Number(templateSettings.widthMm) > 0 ? Number(templateSettings.widthMm) : 85.6;
    const cardHeightMm = Number(templateSettings.heightMm) > 0 ? Number(templateSettings.heightMm) : 53.98;
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const sideGapMm = 4;
    const rowGapMm = 3;
    const horizontalMarginMm = 5;
    const verticalMarginMm = 5;
    const pairWidthMm = cardWidthMm * 2 + sideGapMm;
    const usableHeightMm = pageHeightMm - verticalMarginMm * 2;
    const rowsPerPage = Math.floor((usableHeightMm + rowGapMm) / (cardHeightMm + rowGapMm));
    if (pairWidthMm > pageWidthMm - horizontalMarginMm * 2) {
      addToast({
        type: 'error', title: 'Ukuran Template Tidak Muat di A4',
        message: `Dua sisi kartu (${pairWidthMm.toFixed(1)} mm) tidak muat berdampingan pada A4 portrait. Periksa ukuran kartu di template Spreadsheet.`,
      });
      return;
    }
    if (rowsPerPage < 1) {
      addToast({ type: 'error', title: 'Ukuran Kartu Tidak Muat', message: 'Tinggi kartu dari template lebih besar dari area cetak A4.' });
      return;
    }

    const designWidthPx = 448;
    const cardAspectRatio = cardWidthMm / cardHeightMm;
    const designHeightPx = designWidthPx / cardAspectRatio;
    const cardPrintScale = (cardWidthMm * 96 / 25.4) / designWidthPx;
    const pageMembers: Array<{ key: string; members: AdminMemberRecord[] }> = [];
    for (let start = 0; start < selectedMembers.length; start += rowsPerPage) {
      pageMembers.push({
        key: `sheet-${Math.floor(start / rowsPerPage) + 1}`,
        members: selectedMembers.slice(start, start + rowsPerPage),
      });
    }

    setIsPrintingBatch(true);
    let printRoot: HTMLDivElement | null = null;
    let reactRoot: ReturnType<typeof createRoot> | null = null;
    let printStyle: HTMLStyleElement | null = null;
    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      window.removeEventListener('afterprint', cleanup);
      try { reactRoot?.unmount(); } catch { /* Root mungkin sudah dilepas. */ }
      printRoot?.remove();
      printStyle?.remove();
      setIsPrintingBatch(false);
    };

    try {
      document.getElementById('kta-a4-batch-print-root')?.remove();
      document.getElementById('kta-a4-batch-print-style')?.remove();
      printRoot = document.createElement('div');
      printRoot.id = 'kta-a4-batch-print-root';
      printRoot.setAttribute('aria-hidden', 'true');
      Object.assign(printRoot.style, {
        position: 'fixed', left: '-100000px', top: '0', width: `${pageWidthMm}mm`,
        visibility: 'visible', pointerEvents: 'none', zIndex: '-99999',
      });
      document.body.appendChild(printRoot);
      reactRoot = createRoot(printRoot);

      reactRoot.render(
        <div className="kta-a4-print-document">
          {pageMembers.map((page) => (
            <section key={page.key} className="kta-a4-print-page">
              <div className="kta-a4-print-grid">
                {page.members.map((member) => (
                  <React.Fragment key={getBackendMemberId(member)}>
                    {(['FRONT', 'BACK'] as const).map((side) => (
                      <div className="kta-a4-print-slot" key={`${getBackendMemberId(member)}-${side}`}>
                        <div className="kta-batch-design-canvas" style={{
                          width: `${designWidthPx}px`, height: `${designHeightPx}px`,
                          transform: `scale(${cardPrintScale})`, transformOrigin: 'top left',
                        }}>
                          <DigitalMemberCard
                            member={mapMemberToKtaBinding(member)}
                            previewSettings={templateSettings}
                            side={side}
                            showControls={false}
                            scale={1}
                          />
                        </div>
                      </div>
                    ))}
                  </React.Fragment>
                ))}
              </div>
            </section>
          ))}
        </div>
      );

      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      try { if (document.fonts?.ready) await document.fonts.ready; } catch { /* Browser lama. */ }
      await Promise.all(Array.from(printRoot.querySelectorAll('img')).map((img) =>
        new Promise<void>((resolve) => {
          const image = img as HTMLImageElement;
          if (image.complete) { resolve(); return; }
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        })
      ));
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

      // Bekukan warna/font/layout computed dari renderer template sebelum masuk print mode.
      // Ini mencegah warna teks berubah karena stylesheet @media print atau default browser.
      Array.from(printRoot.querySelectorAll<HTMLElement>('.kta-batch-design-canvas')).forEach((canvas) => {
        const elements = [canvas, ...Array.from(canvas.querySelectorAll<HTMLElement | SVGElement>('*'))];
        elements.forEach((element) => {
          const computed = window.getComputedStyle(element);
          const inline = (element as HTMLElement).style;
          [
            'color', 'font-family', 'font-size', 'font-weight', 'font-style', 'text-align',
            'text-transform', 'line-height', 'letter-spacing', 'background-color', 'background-image',
            'border-color', 'border-width', 'border-style', 'opacity', 'display', 'position',
            'left', 'right', 'top', 'bottom', 'width', 'height', 'padding', 'margin', 'transform',
            'transform-origin', 'object-fit', 'object-position', 'overflow', 'white-space',
          ].forEach((property) => {
            const value = computed.getPropertyValue(property);
            if (value) inline.setProperty(property, value, 'important');
          });
          inline.setProperty('-webkit-print-color-adjust', 'exact', 'important');
          inline.setProperty('print-color-adjust', 'exact', 'important');
        });
      });

      printStyle = document.createElement('style');
      printStyle.id = 'kta-a4-batch-print-style';
      printStyle.textContent = `
        @page { size: A4 portrait; margin: 0; }
        #kta-a4-batch-print-root { display: none; }
        @media print {
          html, body {
            width: 210mm !important; margin: 0 !important; padding: 0 !important;
            overflow: visible !important; background: #fff !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          body > *:not(#kta-a4-batch-print-root) { display: none !important; }
          #kta-a4-batch-print-root {
            display: block !important; position: static !important; width: 210mm !important;
            margin: 0 !important; padding: 0 !important; visibility: visible !important;
          }
          #kta-a4-batch-print-root .kta-a4-print-page {
            box-sizing: border-box !important; width: 210mm !important; height: 297mm !important;
            margin: 0 !important; padding: ${verticalMarginMm}mm ${horizontalMarginMm}mm !important;
            overflow: hidden !important; display: flex !important; align-items: center !important;
            justify-content: center !important; position: relative !important;
            break-after: page !important; page-break-after: always !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          #kta-a4-batch-print-root .kta-a4-print-page:last-child {
            break-after: auto !important; page-break-after: auto !important;
          }
          #kta-a4-batch-print-root .kta-a4-print-grid {
            display: grid !important; grid-template-columns: repeat(2, ${cardWidthMm}mm) !important;
            grid-template-rows: repeat(${rowsPerPage}, ${cardHeightMm}mm) !important;
            column-gap: ${sideGapMm}mm !important; row-gap: ${rowGapMm}mm !important;
            width: ${pairWidthMm}mm !important;
            height: ${rowsPerPage * cardHeightMm + (rowsPerPage - 1) * rowGapMm}mm !important;
            align-content: center !important; justify-content: center !important;
          }
          #kta-a4-batch-print-root .kta-a4-print-slot {
            box-sizing: border-box !important; width: ${cardWidthMm}mm !important; height: ${cardHeightMm}mm !important;
            position: relative !important; overflow: hidden !important; display: block !important;
            margin: 0 !important; padding: 0 !important; break-inside: avoid !important; page-break-inside: avoid !important;
          }
          #kta-a4-batch-print-root .kta-a4-print-slot .kta-batch-design-canvas {
            position: absolute !important; left: 0 !important; top: 0 !important;
            width: ${designWidthPx}px !important; height: ${designHeightPx}px !important;
            max-width: none !important; min-width: 0 !important;
            transform: scale(${cardPrintScale}) !important; transform-origin: top left !important;
            margin: 0 !important; padding: 0 !important; overflow: hidden !important;
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
          #kta-a4-batch-print-root .kta-batch-design-canvas > #digital-member-card-wrapper {
            width: ${designWidthPx}px !important; min-width: ${designWidthPx}px !important;
            max-width: ${designWidthPx}px !important; margin: 0 !important; padding: 0 !important; gap: 0 !important;
          }
          #kta-a4-batch-print-root .kta-batch-design-canvas > #digital-member-card-wrapper > div:first-child {
            width: ${designWidthPx}px !important; min-width: ${designWidthPx}px !important;
            max-width: ${designWidthPx}px !important; height: ${designHeightPx}px !important;
            aspect-ratio: ${cardWidthMm} / ${cardHeightMm} !important; transform: none !important; transition: none !important;
          }
          #kta-a4-batch-print-root .kta-batch-design-canvas,
          #kta-a4-batch-print-root .kta-batch-design-canvas * {
            -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important;
          }
        }
      `;
      document.head.appendChild(printStyle);
      window.addEventListener('afterprint', cleanup, { once: true });
      await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      window.print();
      window.setTimeout(cleanup, 60000);
    } catch (error: any) {
      cleanup();
      addToast({ type: 'error', title: 'Cetak Massal Gagal',
        message: error?.message || 'Gagal menyiapkan lembar cetak KTA A4.' });
    }
  };

  // Handle Regenerate Submit
  const handleRegenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regenMember) return;
    if (!regenReason.trim() || regenReason.trim().length < 5) {
      setRegenError('Alasan peremajaan KTA wajib diisi minimal 5 karakter!');
      return;
    }

    try {
      const res = await memberApi.regenerateKta(
        getBackendMemberId(regenMember),
        `${regenReason} (Otoritas: ${regenAuthority})`
      );

      await loadMembers();
      addToast({
        type: 'success',
        title: 'KTA Berhasil Diregenerasi',
        message: `No. KTA Baru: ${res.nomorKta} dengan Token QR aktif.`,
      });
      setRegenMember(null);
      setRegenReason('');
      setRegenError('');
    } catch (err: any) {
      setRegenError(err.message || 'Gagal regenerasi KTA');
      addToast({
        type: 'error',
        title: 'Gagal Regenerasi KTA',
        message: err.message || 'Terjadi kendala saat regenerasi KTA.',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Sub Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3 flex-wrap gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('queue')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'queue'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            Antrean Penerbitan KTA ({autoIssueQueue.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('batch')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'batch'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            KTA Batch Preview & Cetak Massal ({activeKtaMembers.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('logs')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              activeSubTab === 'logs'
                ? 'bg-[#009B4D] text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileCheck className="w-3.5 h-3.5" />
            Log Riwayat Penerbitan ({ktaLogs.length})
          </button>

          {/* KTA Template Designer (Super Admin / Admin Pusat) */}
          {(isQaSuperAdminSession || simulatedScope === 'SUPER_ADMIN' || simulatedScope === 'ADMIN_PUSAT') && (
            <button
              type="button"
              onClick={() => setIsCustomizerOpen(true)}
              className="px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 shadow-2xs cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              Desain Template & Dynamic QR
            </button>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKta}
            onChange={(e) => setSearchKta(e.target.value)}
            placeholder="Cari nama atau No KTA..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
          />
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. ANTREAN PENERBITAN KTA OTOMATIS                            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'queue' && (
        <div className="space-y-4">
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 text-xs text-emerald-950 flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#009B4D] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Antrean Penerbitan KTA Otomatis (Thread-Safe LockService)</p>
                <p className="text-emerald-700 mt-0.5">
                  Anggota berstatus <strong>APPROVED</strong> siap diaktivasi dengan penomoran resmi: 
                  <strong> 00.NNNNNN</strong> (Kwarnas) atau <strong>00.PPKK.CCC.NNNNNN</strong> (Wilayah).
                </p>
              </div>
            </div>

            {autoIssueQueue.length > 0 && (
              <button
                type="button"
                onClick={async () => {
                  await memberApi.batchGenerateKta(
                    autoIssueQueue.map((m) => getBackendMemberId(m)),
                    'Penerbitan Batch Otomatis'
                  );

                  await loadMembers();
                  addToast({
                    type: 'success',
                    title: 'Penerbitan KTA Massal Selesai',
                    message: `${autoIssueQueue.length} KTA resmi berhasil diterbitkan serentak.`,
                  });
                }}
                className="px-4 py-2 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white font-bold text-xs shadow-xs shrink-0 transition-all cursor-pointer"
              >
                Terbitkan Seluruhnya ({autoIssueQueue.length})
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {autoIssueQueue.length === 0 ? (
              <div className="col-span-2 py-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                Tidak ada antrean penerbitan KTA. Semua anggota APPROVED telah memiliki KTA aktif.
              </div>
            ) : (
              autoIssueQueue.map((m) => (
                <div
                  key={getBackendMemberId(m)}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        Status: {m.status_anggota}
                      </span>
                      <h4 className="font-bold text-sm text-slate-900 mt-1">{m.nama_lengkap}</h4>
                      <p className="text-xs text-slate-500 font-mono">ID: {m.id}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-700">{m.kabupaten_nama}</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <p className="text-slate-600">
                      Format KTA: <span className="font-mono font-bold text-[#0066B3]">
                        {m.level_organisasi === 'KWARTIR_NASIONAL' ? '00.NNNNNN (Nasional)' : '00.PP.KK.CCC.NNNNNN (Wilayah)'}
                      </span>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Peminatan: <strong>{m.krida_nama || m.krida_id}</strong>
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        const res = await memberApi.generateKta(
                          getBackendMemberId(m),
                          'Penerbitan KTA Resmi'
                        );

                        await loadMembers();
                        addToast({
                          type: 'success',
                          title: 'KTA Berhasil Diterbitkan',
                          message: `Nomor KTA: ${res.nomorKta} aktif dengan QR Token ${res.qrToken}.`,
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-[#0066B3] text-white border-2 border-[#0066B3] hover:bg-white hover:text-[#0066B3] hover:border-[#0066B3] font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      Terbitkan KTA Sekarang
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. KTA BATCH PREVIEW & CETAK MASSAL (LEGACY KTA PREVIEW)      */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'batch' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === activeKtaMembers.length && activeKtaMembers.length > 0}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedIds(activeKtaMembers.map((m) => getBackendMemberId(m)));
                    } else {
                      setSelectedIds([]);
                    }
                  }}
                  className="rounded-sm text-[#0066B3]"
                />
                Pilih Semua ({activeKtaMembers.length})
              </label>

              {selectedIds.length > 0 && (
                <span className="text-xs text-[#0066B3] font-semibold bg-blue-50 px-2 py-0.5 rounded-full">
                  {selectedIds.length} KTA dipilih
                </span>
              )}
              <span className="text-[11px] text-slate-500">
                Depan + belakang berdampingan · hingga 5 KTA per lembar A4 untuk ukuran ID-1
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => void refreshKtaDatabase()}
                disabled={membersLoading}
                className="px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:opacity-50 text-slate-700 font-bold text-xs transition-all flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${membersLoading ? 'animate-spin' : ''}`} />
                {membersLoading ? 'Memuat Database...' : 'Muat Ulang Database'}
              </button>
              <button
                type="button"
                disabled={selectedIds.length === 0}
                onClick={() => setIsBatchPreviewOpen(true)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Eye className="w-3.5 h-3.5" />
                Preview Massal ({selectedIds.length})
              </button>

              <button
                type="button"
                onClick={() => void handlePrintBatch()}
                disabled={selectedIds.length === 0 || isPrintingBatch || templateLoading || !templateSettings}
                className="px-4 py-2 rounded-xl bg-[#009B4D] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
              >
                <Printer className="w-3.5 h-3.5" />
                {isPrintingBatch ? 'Menyiapkan Cetak...' : `Cetak A4 Satu Lembar (${selectedIds.length})`}
              </button>
            </div>
          </div>

          {membersLoading && (
            <div role="status" className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin" />
              Mengambil database anggota dan status KTA dari backend GAS...
            </div>
          )}

          {!membersLoading && membersError && (
            <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900 space-y-2">
              <p className="font-bold">Database KTA gagal dimuat dari GAS.</p>
              <p>{membersError}</p>
              <p className="text-xs">Periksa sesi admin, endpoint <code>admin.member.list</code>, dan log Executions pada proyek GAS. Tidak ada data dummy yang akan ditampilkan.</p>
              <button type="button" onClick={() => void refreshKtaDatabase()} className="rounded-lg bg-red-800 px-3 py-2 text-xs font-bold text-white">Coba Muat Ulang</button>
            </div>
          )}

          {!membersLoading && !membersError && activeKtaMembers.length === 0 && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 text-center space-y-2">
              <CreditCard className="mx-auto h-8 w-8 text-amber-700" />
              <p className="font-bold text-amber-950">Belum ada anggota aktif dengan nomor KTA yang dapat dicetak.</p>
              <p className="text-sm text-amber-900">Data anggota berhasil dimuat, tetapi tidak ada record yang memenuhi status ACTIVE dan memiliki nomor KTA. Periksa status anggota dan kolom nomor KTA pada data backend.</p>
              <button type="button" onClick={() => void refreshKtaDatabase()} className="rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-amber-900">Muat Ulang Database</button>
            </div>
          )}

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {!membersLoading && !membersError && activeKtaMembers.map((m) => (
              <div
                key={getBackendMemberId(m)}
                className={`bg-white rounded-2xl p-4 border transition-all shadow-xs flex flex-col justify-between ${
                  selectedIds.includes(getBackendMemberId(m))
                    ? 'border-[#0066B3] ring-2 ring-blue-100 bg-blue-50/20'
                    : 'border-slate-200/80 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(getBackendMemberId(m))}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds([...selectedIds, getBackendMemberId(m)]);
                      } else {
                        setSelectedIds(selectedIds.filter((id) => id !== getBackendMemberId(m)));
                      }
                    }}
                    className="mt-1 rounded-sm text-[#0066B3]"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-xs font-bold text-emerald-700 truncate">{m.no_kta || m.nomor_kta}</p>
                    <h4 className="font-bold text-slate-900 text-sm truncate">{m.full_name || m.nama_lengkap || m.nama}</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">{m.kabupaten_nama}, {m.provinsi_nama}</p>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => setPreviewMember(m)}
                    className="text-[#0066B3] hover:underline font-bold flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> Preview KTA
                  </button>

                  {/* Regenerate Button with Permission & Reason Guard */}
                  <button
                    type="button"
                    onClick={() => {
                      setRegenMember(m);
                      setRegenReason('');
                      setRegenError('');
                    }}
                    className="text-amber-700 hover:underline font-semibold flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" /> Regenerate
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. LOG RIWAYAT PENERBITAN KTA (KTA_Generation_Log)            */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Log Audit Penerbitan KTA (KTA_Generation_Log)
              </h4>
              <p className="text-[11px] text-slate-500">Rekam jejak pembuatan, regenerasi, dan peremajaan kartu</p>
            </div>
            <span className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-lg">
              {ktaLogs.length} Total Entri
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Log ID & Waktu</th>
                  <th className="py-3 px-4">Nomor KTA</th>
                  <th className="py-3 px-4">Tipe Aksi</th>
                  <th className="py-3 px-4">Alasan Peremajaan</th>
                  <th className="py-3 px-4">Petugas Otoritas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ktaLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-4">
                      <p className="font-mono text-slate-900 font-bold">{log.id}</p>
                      <p className="text-[11px] text-slate-400">{log.generated_at.substring(0, 16).replace('T', ' ')}</p>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-700">{log.nomor_kta}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.action_type === 'REGENERATE'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {log.action_type}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{log.reason}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{log.generated_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: SINGLE KTA PREVIEW USING DigitalMemberCard (Designer Template) */}
      {/* ------------------------------------------------------------- */}
      {previewMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 relative">
            <button
              type="button"
              onClick={() => setPreviewMember(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0066B3]">
                Template KTA Designer SPWN (ISO/IEC 7810 ID-1)
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">{previewMember.nama_lengkap}</h3>
            </div>

            {/* Semua preview memakai template GAS + DigitalMemberCard yang sama */}
            <div className="flex justify-center">
              {templateLoading ? (
                <div className="w-full max-w-md aspect-[1.586/1] rounded-2xl bg-slate-100 animate-pulse" />
              ) : templateSettings ? (
                <DigitalMemberCard
                  member={mapMemberToKtaBinding(previewMember)}
                  previewSettings={templateSettings}
                  showControls={true}
                />
              ) : (
                <div className="w-full rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-xs font-semibold text-rose-700">
                  {templateError || 'Template KTA tidak tersedia dari GAS.'}
                </div>
              )}
            </div>

            <div className="pt-2 text-center text-xs text-slate-500">
              Desain template kartu disinkronkan dengan KTA Designer Kwartir Nasional.
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: REGENERATE KTA GUARD WITH MANDATORY REASON             */}
      {/* ------------------------------------------------------------- */}
      {regenMember && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2 text-amber-800">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                <h3 className="text-base font-bold text-slate-900">Regenerasi KTA Anggota</h3>
              </div>
              <button
                type="button"
                onClick={() => setRegenMember(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Regenerasi akan memperbarui nomor seri & QR Token anggota <strong>{regenMember.nama_lengkap}</strong>. 
              Aksi ini memerlukan izin khusus dan dicatat ke dalam audit log.
            </p>

            {regenError && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {regenError}
              </div>
            )}

            <form onSubmit={handleRegenSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Alasan Peremajaan KTA (Wajib) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={regenReason}
                  onChange={(e) => setRegenReason(e.target.value)}
                  placeholder="Contoh: Kartu fisik hilang dilaporkan dengan bukti surat pangkalan..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Surat Keputusan / Dasar Otoritas *
                </label>
                <input
                  type="text"
                  required
                  value={regenAuthority}
                  onChange={(e) => setRegenAuthority(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium focus:ring-2 focus:ring-amber-500 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRegenMember(null)}
                  className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Konfirmasi Regenerasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* MODAL: BATCH PREVIEW MASSAL USING DigitalMemberCard (Designer Template) */}
      {/* ------------------------------------------------------------- */}
      {isBatchPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-100 rounded-3xl max-w-5xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  KTA Batch Preview ({selectedIds.length} Kartu Dipilih)
                </h3>
                <p className="text-xs text-slate-500">Sisi depan dan belakang berdampingan. Ukuran dan warna mengikuti template Spreadsheet; kartu per lembar mengikuti tinggi kartu.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => void handlePrintBatch()}
                  disabled={isPrintingBatch || templateLoading || !templateSettings}
                  className="px-4 py-1.5 rounded-xl bg-[#009B4D] hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> {isPrintingBatch ? 'Menyiapkan Cetak...' : 'Cetak A4 Satu Lembar'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsBatchPreviewOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-2">
              {activeKtaMembers
                .filter((m) => selectedIds.includes(getBackendMemberId(m)))
                .map((m) => (
                  <div key={getBackendMemberId(m)} className="flex justify-center bg-white p-4 rounded-2xl shadow-xs border border-slate-200">
                    {templateSettings ? (
                      <DigitalMemberCard
                        member={mapMemberToKtaBinding(m)}
                        previewSettings={templateSettings}
                        showControls={false}
                      />
                    ) : (
                      <div className="w-full aspect-[1.586/1] rounded-xl border border-rose-200 bg-rose-50 flex items-center justify-center px-3 text-center text-xs font-semibold text-rose-700">
                        {templateLoading
                          ? 'Memuat template KTA dari GAS...'
                          : templateError || 'Template KTA tidak tersedia.'}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* KTA Card Template & Dynamic QR Designer Modal */}
      <KtaCardCustomizerModal
        isOpen={isCustomizerOpen}
        onClose={() => setIsCustomizerOpen(false)}
        sessionUserName={isQaSuperAdminSession ? 'Super Administrator (Kwarnas)' : 'Admin Pusat'}
        userRole={simulatedScope}
        onSaved={(savedSettings) => {
          setTemplateSettings(savedSettings);
          setTemplateError(null);
        }}
      />
    </div>
  );
};
