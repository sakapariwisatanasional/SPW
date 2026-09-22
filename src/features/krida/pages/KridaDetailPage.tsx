/**
 * SPWN Apps 2.0 - Detail Krida Page (/krida/:slug)
 * Sumber: Buku Panduan Krida dan Syarat Kecakapan Khusus SAKA Pariwisata 2026
 * Location: src/features/krida/pages/KridaDetailPage.tsx
 */

import React from 'react';
import {
  ArrowLeft,
  Compass,
  Megaphone,
  CalendarCheck,
  UtensilsCrossed,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Award,
  Layers,
  FileCheck,
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import { useKridaStore } from '../../../stores/kridaStore';
import { useUIStore } from '../../../stores/uiStore';
import { KRIDA_LIST, SKK_MASTER_LIST } from '../data/kridaData';
import { KridaId } from '../../../types/krida';

const kridaIconMap: Record<KridaId, React.ReactNode> = {
  pemandu: <Compass className="w-8 h-8 text-white" />,
  penyuluh: <Megaphone className="w-8 h-8 text-white" />,
  'mice-event': <CalendarCheck className="w-8 h-8 text-white" />,
  'kuliner-cinderamata': <UtensilsCrossed className="w-8 h-8 text-white" />,
};

const kridaGradientMap: Record<KridaId, string> = {
  pemandu: 'from-[#0B1F33] via-[#003E6D] to-[#0066B3]',
  penyuluh: 'from-[#422006] via-[#B45309] to-[#F7941D]',
  'mice-event': 'from-[#3B0764] via-[#86198F] to-[#D81B60]',
  'kuliner-cinderamata': 'from-[#064E3B] via-[#047857] to-[#009B4D]',
};

export const KridaDetailPage: React.FC<{
  kridaSlug?: string;
  onBack?: () => void;
  onSelectSkk?: (code: string) => void;
}> = ({ kridaSlug, onBack, onSelectSkk }) => {
  const { selectedKridaSlug, setSelectedSkkCode } = useKridaStore();
  const { setActiveView } = useUIStore();

  const slug = kridaSlug || selectedKridaSlug || 'pemandu';
  const krida = KRIDA_LIST.find((k) => k.slug === slug || k.id === slug) || KRIDA_LIST[0];
  const skkItems = SKK_MASTER_LIST.filter((s) => s.kridaId === krida.id);

  const handleOpenSkk = (kode: string) => {
    setSelectedSkkCode(kode);
    if (onSelectSkk) {
      onSelectSkk(kode);
    } else {
      setActiveView(`skk-${kode.toLowerCase()}`);
    }
  };

  const handleBackToDashboard = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveView('dashboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <button
            onClick={() => setActiveView('dashboard')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <span>/</span>
          <button
            onClick={() => setActiveView('skk-learning')}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            SKK Learning Center
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">{krida.nama}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBackToDashboard}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali ke Beranda
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setActiveView('skk-learning')}
          >
            Katalog 23 SKK
          </Button>
        </div>
      </div>

      {/* Krida Header Hero */}
      <div className={`p-6 sm:p-8 rounded-2xl bg-gradient-to-r ${kridaGradientMap[krida.id]} text-white shadow-sm space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/20">
              {kridaIconMap[krida.id]}
            </div>
            <div>
              <span className="text-xs uppercase tracking-wider text-white/80 font-bold">
                {krida.kode} • {krida.bab}
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
                {krida.nama}
              </h1>
            </div>
          </div>
          <Badge variant="blue" className="bg-white/20 text-white border-white/20 text-xs px-3 py-1 font-semibold">
            {krida.totalSkk} Mata Kecakapan Khusus
          </Badge>
        </div>

        <p className="text-sm sm:text-base text-white/90 max-w-3xl leading-relaxed">
          {krida.deskripsi}
        </p>

        {/* 3 Step Tagline Bar */}
        <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-4 text-xs text-white/80">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Purwa (7–15 Thn)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-300" />
            <span>Madya (15–20 Thn)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-300" />
            <span>Utama (21–25 Thn)</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto text-white font-medium">
            <span>Standar Kelulusan Uji: Skor ≥ 80</span>
          </div>
        </div>
      </div>

      {/* Tujuan Pembinaan Krida Card */}
      <Card padding="lg" className="border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-[#0066B3]" />
          <span>Tujuan Pembinaan {krida.nama}</span>
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Buku Panduan SKK SAKA Pariwisata menetapkan tujuan terukur pada Krida ini untuk membentuk anggota yang:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {krida.tujuan.map((t, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5 text-xs text-slate-700"
            >
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0066B3] font-bold text-[11px] flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="leading-relaxed pt-0.5">{t}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Daftar SKK Table & Cards */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0066B3]" />
              <span>Daftar Mata Kecakapan Khusus ({skkItems.length} SKK)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pilih salah satu SKK untuk mempelajari deskripsi, tujuan, materi, unjuk kerja, produk praktik, dan rubrik uji.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {skkItems.map((item) => (
            <Card
              key={item.kode}
              padding="md"
              className="border border-slate-200 hover:border-[#0066B3] hover:shadow-md transition-all duration-150 flex flex-col justify-between cursor-pointer group"
              onClick={() => handleOpenSkk(item.kode)}
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-blue-50 text-[#0066B3] font-mono font-bold text-xs border border-blue-200">
                    {item.kode}
                  </span>
                  <Badge variant="neutral" size="sm" className="text-[10px]">
                    {item.bidang}
                  </Badge>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors">
                    {item.nama}
                  </h4>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {item.deskripsi}
                  </p>
                </div>

                {/* Produk Praktik Preview */}
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Produk Purwa:</span>
                    <span className="text-slate-500 truncate max-w-[180px]">{item.tingkatan.purwa.produkPraktik}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-700">Produk Madya:</span>
                    <span className="text-slate-500 truncate max-w-[180px]">{item.tingkatan.madya.produkPraktik}</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0066B3]">
                <span>Buka Silabus & Matriks Penilaian</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
