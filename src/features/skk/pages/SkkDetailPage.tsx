/**
 * SPWN Apps 2.0 - Detail SKK Page (/krida/:slug/skk/:kode)
 * Sumber: Buku Panduan Krida dan Syarat Kecakapan Khusus SAKA Pariwisata 2026
 * Location: src/features/skk/pages/SkkDetailPage.tsx
 */

import React from 'react';
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  FileCheck,
  FileText,
  Award,
  Layers,
  Sparkles,
  Printer,
  Compass,
  Megaphone,
  CalendarCheck,
  UtensilsCrossed,
  ShieldAlert,
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import { SkkEvaluationMatrix } from '../components/SkkEvaluationMatrix';
import { useKridaStore } from '../../../stores/kridaStore';
import { useUIStore } from '../../../stores/uiStore';
import { SkkLevelKey } from '../../../types/krida';
import { SKK_MASTER_LIST, KRIDA_LIST } from '../../krida/data/kridaData';

export const SkkDetailPage: React.FC<{
  skkCode?: string;
  onBack?: () => void;
}> = ({ skkCode, onBack }) => {
  const { selectedSkkCode, selectedLevelTab, setSelectedLevelTab, setSelectedKridaSlug } = useKridaStore();
  const { setActiveView } = useUIStore();

  const codeToDisplay = skkCode || selectedSkkCode || 'PM-01';
  const skk = SKK_MASTER_LIST.find((s) => s.kode.toUpperCase() === codeToDisplay.toUpperCase()) || SKK_MASTER_LIST[0];
  const krida = KRIDA_LIST.find((k) => k.id === skk.kridaId) || KRIDA_LIST[0];

  const currentLevel = skk.tingkatan[selectedLevelTab];

  const handleBackToKrida = () => {
    setSelectedKridaSlug(krida.slug);
    if (onBack) {
      onBack();
    } else {
      setActiveView(`krida-${krida.slug}`);
    }
  };

  const handleBackToLearningCenter = () => {
    setActiveView('skk-learning');
  };

  const levelTabs: { key: SkkLevelKey; label: string; sub: string; badge: string; color: string }[] = [
    {
      key: 'purwa',
      label: 'PURWA',
      sub: 'Tingkat Dasar (7–15 Thn)',
      badge: 'Mengenal & Berlatih',
      color: 'bg-emerald-600 text-white',
    },
    {
      key: 'madya',
      label: 'MADYA',
      sub: 'Tingkat Menengah (15–20 Thn)',
      badge: 'Menerapkan & Mandiri',
      color: 'bg-[#0066B3] text-white',
    },
    {
      key: 'utama',
      label: 'UTAMA',
      sub: 'Tingkat Tertinggi (21–25 Thn)',
      badge: 'Mengembangkan & Membina',
      color: 'bg-purple-700 text-white',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Breadcrumbs & Action Bar */}
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
            onClick={handleBackToLearningCenter}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            SKK Learning Center
          </button>
          <span>/</span>
          <button
            onClick={handleBackToKrida}
            className="hover:text-slate-900 transition-colors cursor-pointer"
          >
            {krida.nama}
          </button>
          <span>/</span>
          <span className="font-semibold text-slate-900">{skk.kode}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleBackToKrida}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Kembali ke {krida.nama}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Cetak Panduan
          </Button>
        </div>
      </div>

      {/* Main SKK Header Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-[#0B1F33] via-[#003E6D] to-[#0066B3] text-white shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="px-3 py-1 rounded-lg bg-white/20 text-white font-mono font-bold text-sm tracking-wide border border-white/20">
              {skk.kode}
            </span>
            <Badge variant="blue" className="bg-white/10 text-white border-white/20">
              {krida.nama}
            </Badge>
            <Badge variant="neutral" className="bg-white/10 text-slate-200 border-white/20">
              {skk.bidang}
            </Badge>
          </div>

          <div className="text-xs text-slate-300 font-medium">
            Buku Panduan SKK Nasional 2026
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            {skk.nama}
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            {skk.deskripsi}
          </p>
        </div>

        {/* Acuan SKKNI Chip */}
        <div className="pt-2 border-t border-white/10 flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="text-white font-semibold">Rujukan Standar Kerja:</span>
          <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-white border border-white/15">
            {skk.acuanSkkni}
          </span>
        </div>
      </div>

      {/* Catatan Keselamatan Khusus jika ada */}
      {skk.catatanKhusus && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold text-amber-950">Ketentuan Khusus & Batas Keselamatan</p>
            <p className="leading-relaxed text-amber-800">{skk.catatanKhusus}</p>
          </div>
        </div>
      )}

      {/* Tujuan Pembinaan Card */}
      <Card padding="md" className="border border-slate-200">
        <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Tujuan Pembinaan Kecakapan</span>
        </h3>
        <p className="text-xs text-slate-500 mb-3">
          Setelah menempuh Mata Kecakapan {skk.kode} ({skk.nama}), anggota diharapkan mampu:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-700">
          {skk.tujuan.map((t, idx) => (
            <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="w-5 h-5 rounded-full bg-blue-100 text-[#0066B3] text-[11px] font-bold flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              <span className="leading-tight pt-0.5">{t}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Interactive Level Switcher Tabs */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#0066B3]" />
              <span>Silabus & Standar Tingkatan Kecakapan</span>
            </h3>
            <p className="text-xs text-slate-500">
              Pilih tingkatan untuk melihat standar kompetensi, materi pengetahuan, unjuk kerja, dan produk praktik.
            </p>
          </div>
        </div>

        {/* 3 Level Tab Buttons */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {levelTabs.map((tab) => {
            const isSelected = selectedLevelTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setSelectedLevelTab(tab.key)}
                className={`p-3 sm:p-4 rounded-xl text-left border transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? 'border-[#0066B3] bg-blue-50/70 shadow-sm ring-2 ring-[#0066B3]/20'
                    : 'border-slate-200 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-xs sm:text-sm font-bold ${isSelected ? 'text-[#0066B3]' : 'text-slate-900'}`}>
                    Tingkat {tab.label}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                    isSelected ? 'bg-[#0066B3] text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {tab.key === 'purwa' ? 'Dasar' : tab.key === 'madya' ? 'Penerapan' : 'Pengembangan'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">{tab.sub}</p>
                <p className="text-[10px] text-slate-400 mt-1 truncate">{tab.badge}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Level Content Container */}
      <div className="space-y-4">
        {/* Level Overview Card */}
        <Card padding="md" className="bg-gradient-to-r from-slate-900 to-slate-800 text-white border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-xs text-white/90 mb-1">
                <Sparkles className="w-3 h-3 text-[#F7941D]" />
                <span>Fokus Pembinaan {selectedLevelTab.toUpperCase()}</span>
              </div>
              <h4 className="text-lg font-bold text-white">{currentLevel.fokus}</h4>
              <p className="text-xs text-slate-300">
                Pengelompokan Operasional: {currentLevel.kelompokUsia} (Buku Panduan Hal. 8)
              </p>
            </div>
            <div className="shrink-0 p-3 rounded-xl bg-white/10 backdrop-blur-xs border border-white/10 text-center">
              <p className="text-[10px] uppercase text-slate-300 font-semibold">Produk Wajib</p>
              <p className="text-xs font-bold text-white max-w-[200px] line-clamp-2 mt-0.5">
                {currentLevel.produkPraktik}
              </p>
            </div>
          </div>
        </Card>

        {/* 2-Column: Standar & Materi vs Unjuk Kerja & Sikap */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kolom Kiri: Standar & Pengetahuan */}
          <div className="space-y-4">
            {/* Standar Kecakapan */}
            <Card padding="md" className="border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-[#0066B3]" />
                <span>1. Standar Kecakapan (Kompetensi)</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentLevel.standar.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0066B3] shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Materi Pengetahuan */}
            <Card padding="md" className="border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#009B4D]" />
                <span>2. Lingkup Materi Pengetahuan (Bobot 20%)</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-slate-700">
                {currentLevel.pengetahuan.map((p, idx) => (
                  <div key={idx} className="p-2 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#009B4D]" />
                    <span className="text-[11px] leading-tight">{p}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Kolom Kanan: Keterampilan, Sikap & Produk */}
          <div className="space-y-4">
            {/* Keterampilan Unjuk Kerja */}
            <Card padding="md" className="border border-slate-200">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2.5 flex items-center gap-2">
                <Award className="w-4 h-4 text-[#F7941D]" />
                <span>3. Keterampilan Unjuk Kerja (Bobot 40%)</span>
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {currentLevel.keterampilan.map((k, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-amber-100 text-amber-700 font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            </Card>

            {/* Sikap Kerja & Produk */}
            <Card padding="md" className="border border-slate-200 space-y-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  <span>4. Sikap Kerja Kepramukaan (Bobot 20%)</span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {currentLevel.sikapKerja.map((sk, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 text-[11px] font-medium"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-1.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0066B3]" />
                  <span>5. Produk / Praktik Nyata & Bukti (Bobot 20%)</span>
                </h4>
                <p className="text-xs font-semibold text-slate-900 bg-blue-50/60 p-2.5 rounded-lg border border-blue-100">
                  {currentLevel.produkPraktik}
                </p>
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Bukti Kecakapan yang Dikumpulkan:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentLevel.buktiKecakapan.map((b, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md"
                      >
                        ✓ {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Evaluation Matrix & Lembar Uji (Bab VIII) */}
        <div className="pt-2">
          <SkkEvaluationMatrix
            skkKode={skk.kode}
            skkNama={skk.nama}
            produkUtama={currentLevel.produkPraktik}
            tingkatNama={selectedLevelTab}
          />
        </div>
      </div>
    </div>
  );
};
