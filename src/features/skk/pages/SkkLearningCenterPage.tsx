/**
 * SPWN Apps 2.0 - SKK Learning Center (/skk)
 * Sumber: Buku Panduan Krida dan Syarat Kecakapan Khusus SAKA Pariwisata 2026
 * Location: src/features/skk/pages/SkkLearningCenterPage.tsx
 */

import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Filter,
  Compass,
  Megaphone,
  CalendarCheck,
  UtensilsCrossed,
  Layers,
  ArrowRight,
  Sparkles,
  Award,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { Card, Badge, Button, Input } from '../../../components/ui';
import { useKridaStore } from '../../../stores/kridaStore';
import { useUIStore } from '../../../stores/uiStore';
import { SKK_MASTER_LIST, KRIDA_LIST } from '../../krida/data/kridaData';
import { KridaId } from '../../../types/krida';

const kridaBadgeVariantMap: Record<KridaId, 'blue' | 'orange' | 'purple' | 'green'> = {
  pemandu: 'blue',
  penyuluh: 'orange',
  'mice-event': 'purple',
  'kuliner-cinderamata': 'green',
};

export const SkkLearningCenterPage: React.FC<{
  onSelectSkk?: (code: string) => void;
  onSelectKrida?: (slug: string) => void;
}> = ({ onSelectSkk, onSelectKrida }) => {
  const {
    kridaFilter,
    setKridaFilter,
    searchFilter,
    setSearchFilter,
    setSelectedSkkCode,
    setSelectedKridaSlug,
  } = useKridaStore();
  const { setActiveView } = useUIStore();

  const [selectedLevel, setSelectedLevel] = useState<'all' | 'purwa' | 'madya' | 'utama'>('all');

  // Filter SKK
  const filteredSkk = SKK_MASTER_LIST.filter((item) => {
    // 1. Krida filter
    if (kridaFilter !== 'all' && item.kridaId !== kridaFilter && item.kridaSlug !== kridaFilter) {
      return false;
    }

    // 2. Search filter
    if (searchFilter.trim()) {
      const q = searchFilter.toLowerCase().trim();
      const match =
        item.kode.toLowerCase().includes(q) ||
        item.nama.toLowerCase().includes(q) ||
        item.bidang.toLowerCase().includes(q) ||
        item.deskripsi.toLowerCase().includes(q) ||
        item.tingkatan.purwa.produkPraktik.toLowerCase().includes(q) ||
        item.tingkatan.madya.produkPraktik.toLowerCase().includes(q) ||
        item.tingkatan.utama.produkPraktik.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const handleOpenSkkDetail = (kode: string, kridaSlug: string) => {
    setSelectedSkkCode(kode);
    setSelectedKridaSlug(kridaSlug);
    if (onSelectSkk) {
      onSelectSkk(kode);
    } else {
      setActiveView(`skk-${kode.toLowerCase()}`);
    }
  };

  const handleOpenKrida = (slug: string) => {
    setSelectedKridaSlug(slug);
    if (onSelectKrida) {
      onSelectKrida(slug);
    } else {
      setActiveView(`krida-${slug}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#0B1F33] via-[#003E6D] to-[#0066B3] text-white shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-white/90 border border-white/20">
            <BookOpen className="w-4 h-4 text-[#F7941D]" />
            <span>Pusat Pembelajaran Standar Nasional SAKA Pariwisata</span>
          </div>

          <Badge variant="blue" className="bg-white/20 text-white border-white/20">
            Edisi Buku Panduan 2026
          </Badge>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            SKK Learning Center SAKA Pariwisata
          </h1>
          <p className="text-xs sm:text-sm text-slate-200 max-w-3xl leading-relaxed">
            Eksplorasi silabus lengkap 23 Mata Kecakapan Khusus (SKK) dalam 4 Krida SAKA Pariwisata Indonesia. Lengkap dengan indikator pengetahuan, keterampilan, sikap kerja, produk/praktik nyata, portofolio, dan rubrik uji nasional.
          </p>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-white/15 text-white">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <p className="text-[10px] text-slate-300 font-semibold uppercase">4 Krida</p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">Pemandu, Penyuluh, MICE, Kuliner</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <p className="text-[10px] text-slate-300 font-semibold uppercase">23 Mata Kecakapan</p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">Silabus Lengkap Terstandar</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <p className="text-[10px] text-slate-300 font-semibold uppercase">3 Tingkatan</p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">Purwa • Madya • Utama</p>
          </div>
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-xs">
            <p className="text-[10px] text-slate-300 font-semibold uppercase">Kriteria Kelulusan</p>
            <p className="text-sm sm:text-base font-bold text-white mt-0.5">Nilai Akhir ≥ 80 (Memenuhi)</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card padding="md" className="space-y-4 border border-slate-200">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari SKK (contoh: Gunung, Ekowisata, Cinderamata, Itinerary)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3] bg-slate-50/50"
            />
          </div>

          {/* Tingkatan Filter Chips */}
          <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
              Tingkat:
            </span>
            {(['all', 'purwa', 'madya', 'utama'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {lvl === 'all' ? 'Semua Tingkat' : lvl.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Krida Tabs Filter */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setKridaFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              kridaFilter === 'all'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Krida (23)
          </button>
          {KRIDA_LIST.map((k) => (
            <button
              key={k.id}
              onClick={() => setKridaFilter(k.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
                kridaFilter === k.id
                  ? 'bg-[#0066B3] text-white shadow-xs font-bold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{k.nama}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/10">
                {k.totalSkk}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Grid of 23 SKK Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-500">
            Menampilkan <span className="text-slate-900 font-bold">{filteredSkk.length}</span> Mata Kecakapan Khusus
          </p>
          {kridaFilter !== 'all' && (
            <button
              onClick={() => handleOpenKrida(kridaFilter)}
              className="text-xs font-bold text-[#0066B3] hover:underline flex items-center gap-1"
            >
              <span>Buka Profil Detail Krida Ini</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {filteredSkk.length === 0 ? (
          <Card padding="lg" className="text-center py-12 space-y-3 border-dashed">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Mata Kecakapan Tidak Ditemukan</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Tidak ada SKK yang cocok dengan kata kunci "{searchFilter}". Silakan atur ulang filter pencarian.
            </p>
            <Button size="sm" variant="outline" onClick={() => { setSearchFilter(''); setKridaFilter('all'); }}>
              Reset Pencarian
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSkk.map((skk) => {
              const activeLevelData =
                selectedLevel === 'all' ? skk.tingkatan.purwa : skk.tingkatan[selectedLevel];

              return (
                <Card
                  key={skk.kode}
                  padding="md"
                  className="border border-slate-200 hover:border-[#0066B3] hover:shadow-md transition-all duration-150 flex flex-col justify-between cursor-pointer group"
                  onClick={() => handleOpenSkkDetail(skk.kode, skk.kridaSlug)}
                >
                  <div className="space-y-3">
                    {/* Header Card */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#0066B3] font-mono font-bold text-xs border border-blue-200">
                        {skk.kode}
                      </span>
                      <Badge variant={kridaBadgeVariantMap[skk.kridaId]} size="sm" className="text-[10px]">
                        {skk.kridaNama.replace('Krida ', '')}
                      </Badge>
                    </div>

                    {/* Title & Description */}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors line-clamp-1">
                        {skk.nama}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">{skk.bidang}</p>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1.5 leading-relaxed">
                        {skk.deskripsi}
                      </p>
                    </div>

                    {/* Produk Praktik Preview */}
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1.5">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-semibold text-slate-700">Produk Praktik:</span>
                        <span className="text-[10px] font-bold text-[#0066B3] uppercase">
                          {selectedLevel === 'all' ? 'Purwa' : selectedLevel}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {activeLevelData.produkPraktik}
                      </p>
                    </div>

                    {/* SKKNI Reference chip */}
                    <p className="text-[10px] text-slate-400 truncate">
                      <strong>SKKNI:</strong> {skk.acuanSkkni}
                    </p>
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0066B3] group-hover:translate-x-0.5 transition-transform">
                    <span>Lihat Silabus & Rubrik Uji</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Alur Sistem Pengembangan SKK (Bab II Hal. 18) */}
      <Card padding="md" className="border border-slate-200 bg-white">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#0066B3]" />
          <span>Alur Rangkaian Sistem Pengembangan SKK (Bab II Hal. 18)</span>
        </h4>
        <div className="grid grid-cols-3 sm:grid-cols-9 gap-1 text-center text-[10px] font-semibold">
          {[
            '1. Standar',
            '2. Belajar',
            '3. Latihan',
            '4. Praktik',
            '5. Produk',
            '6. Bukti',
            '7. Uji',
            '8. Pengakuan',
            '9. Kembang',
          ].map((step, idx) => (
            <div
              key={idx}
              className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700"
            >
              {step}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
