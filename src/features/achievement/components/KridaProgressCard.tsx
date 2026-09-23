/**
 * SPWN Apps 2.0 - Krida SKK Progress Card & Matrix
 * Location: src/features/achievement/components/KridaProgressCard.tsx
 * -------------------------------------------------------------------
 * Menampilkan tab 4 Krida SAKA Pariwisata, filter status kecakapan,
 * dan daftar SKK dengan sensor nilai privasi (UU PDP).
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  CircleDashed,
  Shield,
  ShieldCheck,
  Award,
  Filter,
  Search
} from 'lucide-react';
import { MemberSkkItem, SkkStatusType } from '../../../types/achievement';

interface KridaProgressCardProps {
  skkItems: MemberSkkItem[];
  selectedKrida: string;
  onSelectKrida: (kridaId: string) => void;
  isPrivacyScoreVisible: boolean;
}

export const KridaProgressCard: React.FC<KridaProgressCardProps> = ({
  skkItems,
  selectedKrida,
  onSelectKrida,
  isPrivacyScoreVisible
}) => {
  const [statusFilter, setStatusFilter] = useState<'ALL' | SkkStatusType>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const kridaTabs = [
    { id: 'all', label: 'Semua Krida' },
    { id: 'pemandu', label: 'Pemandu' },
    { id: 'penyuluh', label: 'Penyuluh' },
    { id: 'mice', label: 'Mice & Event' },
    { id: 'kuliner', label: 'Kuliner & Cinderamata' }
  ];

  // Filtering
  const filteredItems = skkItems.filter(item => {
    const matchKrida = selectedKrida === 'all' || item.kridaId === selectedKrida;
    const matchStatus = statusFilter === 'ALL' || item.status === statusFilter;
    const matchSearch =
      searchQuery.trim() === '' ||
      item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.skkCode.toLowerCase().includes(searchQuery.toLowerCase());
    return matchKrida && matchStatus && matchSearch;
  });

  // Render Status Badge
  const renderStatusBadge = (status: SkkStatusType) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Selesai
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Dalam Proses
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 border border-slate-200">
            <CircleDashed className="w-3.5 h-3.5" />
            Belum Diambil
          </span>
        );
    }
  };

  return (
    <div
      id="krida-skk-matrix-card"
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      {/* Card Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#0066B3]" />
            Matriks Syarat Kecakapan Khusus (SKK)
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar kompetensi kepariwisataan berdasarkan Krida dan status kelulusan
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kode / nama SKK..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#0066B3]/20 focus:border-[#0066B3]"
          />
        </div>
      </div>

      {/* Krida Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-4 border-b border-slate-100 scrollbar-none">
        {kridaTabs.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectKrida(tab.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              selectedKrida === tab.id
                ? 'bg-[#0066B3] text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Status Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-slate-500 font-medium flex items-center gap-1 mr-1">
          <Filter className="w-3.5 h-3.5" />
          Status:
        </span>
        {(['ALL', 'COMPLETED', 'IN_PROGRESS', 'NOT_STARTED'] as const).map(st => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              statusFilter === st
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {st === 'ALL' && 'Semua'}
            {st === 'COMPLETED' && 'Selesai'}
            {st === 'IN_PROGRESS' && 'Dalam Proses'}
            {st === 'NOT_STARTED' && 'Belum Diambil'}
          </button>
        ))}
      </div>

      {/* SKK Item List / Cards */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-xs">
          Tidak ada SKK yang cocok dengan filter yang dipilih.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredItems.map(item => (
            <div
              key={item.skkCode}
              id={`skk-card-${item.skkCode.toLowerCase()}`}
              className={`p-4 rounded-xl border transition-all ${
                item.status === 'COMPLETED'
                  ? 'border-emerald-200 bg-emerald-50/20 hover:border-emerald-300'
                  : item.status === 'IN_PROGRESS'
                  ? 'border-amber-200 bg-amber-50/20 hover:border-amber-300'
                  : 'border-slate-200 bg-slate-50/40 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                      {item.skkCode}
                    </span>
                    <span className="text-[11px] font-medium text-slate-500">
                      {item.kridaNama || item.kridaId}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.nama}
                  </h4>
                </div>
                <div>{renderStatusBadge(item.status)}</div>
              </div>

              {item.description && (
                <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                  {item.description}
                </p>
              )}

              {/* Status Details / Progress */}
              {item.status === 'IN_PROGRESS' && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                    <span>Progres Pengujian</span>
                    <span className="font-semibold text-amber-700">{item.progressPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${item.progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Bottom Details & Privacy Guarded Score */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px]">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className="font-medium text-slate-700">Tingkat: {item.levelAchieved}</span>
                  {item.completedAt && (
                    <>
                      <span>•</span>
                      <span>Lulus: {item.completedAt}</span>
                    </>
                  )}
                </div>

                {/* PRIVACY GUARDED SCORE DISPLAY */}
                <div className="flex items-center gap-1.5">
                  {isPrivacyScoreVisible ? (
                    item.score !== undefined && item.score !== null ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-[#0066B3] font-bold border border-blue-200">
                        <ShieldCheck className="w-3 h-3 text-[#0066B3]" />
                        Nilai: {item.score}/100
                      </span>
                    ) : (
                      <span className="text-slate-400 italic">Nilai belum diisi</span>
                    )
                  ) : (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 font-medium border border-slate-200"
                      title="Nilai evaluasi disensor untuk privasi publik (UU PDP)"
                    >
                      <Shield className="w-3 h-3 text-slate-400" />
                      Nilai Dilindungi
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
