/**
 * SPWN Apps 2.0 - Homepage Section "4 Krida SAKA Pariwisata"
 * Location: src/features/krida/components/KridaGridSection.tsx
 */

import React from 'react';
import {
  Compass,
  Megaphone,
  CalendarCheck,
  UtensilsCrossed,
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { Card, Badge, Button } from '../../../components/ui';
import { KRIDA_LIST } from '../data/kridaData';
import { KridaId } from '../../../types/krida';
import { useKridaStore } from '../../../stores/kridaStore';
import { useUIStore } from '../../../stores/uiStore';

const kridaIconMap: Record<KridaId, React.ReactNode> = {
  pemandu: <Compass className="w-6 h-6 text-[#0066B3]" />,
  penyuluh: <Megaphone className="w-6 h-6 text-[#F7941D]" />,
  'mice-event': <CalendarCheck className="w-6 h-6 text-[#D81B60]" />,
  'kuliner-cinderamata': <UtensilsCrossed className="w-6 h-6 text-[#009B4D]" />,
};

const kridaBorderMap: Record<KridaId, string> = {
  pemandu: 'border-t-[#0066B3] hover:border-[#0066B3]',
  penyuluh: 'border-t-[#F7941D] hover:border-[#F7941D]',
  'mice-event': 'border-t-[#D81B60] hover:border-[#D81B60]',
  'kuliner-cinderamata': 'border-t-[#009B4D] hover:border-[#009B4D]',
};

export const KridaGridSection: React.FC<{
  onSelectKrida?: (slug: string) => void;
  onOpenLearningCenter?: () => void;
}> = ({ onSelectKrida, onOpenLearningCenter }) => {
  const { setSelectedKridaSlug } = useKridaStore();
  const { setActiveView } = useUIStore();

  const handleOpenKrida = (slug: string) => {
    setSelectedKridaSlug(slug);
    if (onSelectKrida) {
      onSelectKrida(slug);
    } else {
      setActiveView(`krida-${slug}`);
    }
  };

  const handleOpenCenter = () => {
    if (onOpenLearningCenter) {
      onOpenLearningCenter();
    } else {
      setActiveView('skk-learning');
    }
  };

  return (
    <section className="space-y-4 pt-2">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-[#0066B3] text-xs font-semibold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Pendidikan Kecakapan Khusus</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            4 Krida SAKA Pariwisata Indonesia
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
            Berdasarkan Buku Panduan SKK SAKA Pariwisata Nasional (Edisi 2026). Mengintegrasikan 23 Mata Kecakapan Khusus dengan rujukan SKKNI serta prinsip <em>Belajar – Berlatih – Berkarya – Mengabdi</em>.
          </p>
        </div>

        <div className="shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={handleOpenCenter}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Buka SKK Learning Center (23 SKK)
          </Button>
        </div>
      </div>

      {/* 4 Krida Interactive Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {KRIDA_LIST.map((krida) => {
          return (
            <Card
              key={krida.id}
              padding="md"
              className={`border-t-4 ${kridaBorderMap[krida.id]} flex flex-col justify-between transition-all duration-200 hover:shadow-md cursor-pointer group`}
              onClick={() => handleOpenKrida(krida.slug)}
            >
              <div className="space-y-3">
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div className="p-2.5 rounded-xl bg-slate-100 group-hover:scale-105 transition-transform duration-200">
                    {kridaIconMap[krida.id]}
                  </div>
                  <Badge variant="blue" size="sm" className="font-semibold text-[10px]">
                    {krida.totalSkk} SKK
                  </Badge>
                </div>

                {/* Title & Tagline */}
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {krida.kode} • {krida.bab.split(' ')[0]} {krida.bab.split(' ')[1]}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors mt-0.5">
                    {krida.nama}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {krida.tagline}
                  </p>
                </div>

                {/* Scope Preview List */}
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                    Cakupan Kecakapan:
                  </p>
                  <ul className="space-y-1 text-[11px] text-slate-600">
                    {krida.id === 'pemandu' && (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0066B3]" />
                          <span>Pemandu & Tour Leader (PM-01–04)</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#0066B3]" />
                          <span>Selam, Gunung, Outbond & Lifeguard</span>
                        </li>
                      </>
                    )}
                    {krida.id === 'penyuluh' && (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
                          <span>Sadar Wisata & Sapta Pesona</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F7941D]" />
                          <span>Ekowisata, Tirta, Religi & Mitigasi</span>
                        </li>
                      </>
                    )}
                    {krida.id === 'mice-event' && (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60]" />
                          <span>Promosi & Audio Visual/Drone</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D81B60]" />
                          <span>Perencanaan & Manajemen Hari-H</span>
                        </li>
                      </>
                    )}
                    {krida.id === 'kuliner-cinderamata' && (
                      <>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#009B4D]" />
                          <span>Masakan & Camilan Tradisional</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#009B4D]" />
                          <span>Kerajinan Bahan Lokal & Pemasaran</span>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0066B3] group-hover:translate-x-0.5 transition-transform">
                <span>Eksplorasi Krida</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Education Value Proposition */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#0066B3] flex items-center justify-center shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900">3 Tingkat Kecakapan</p>
            <p className="text-[11px] text-slate-500 truncate">Purwa (Dasar) • Madya • Utama</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 text-[#009B4D] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900">Rubrik Uji Terstandar</p>
            <p className="text-[11px] text-slate-500 truncate">Teori 20% • Praktik 40% • Sikap 20% • Karya 20%</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-slate-900">Portfolio & TKK Sah</p>
            <p className="text-[11px] text-slate-500 truncate">Sesuai Juklak SAKA Pariwisata 2026</p>
          </div>
        </div>
      </div>
    </section>
  );
};
