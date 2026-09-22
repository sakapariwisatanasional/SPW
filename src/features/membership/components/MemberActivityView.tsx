/**
 * SPWN Apps 2.0 - Member Activity History Component
 * Location: src/features/membership/components/MemberActivityView.tsx
 * -------------------------------------------------------------
 * Riwayat Kegiatan Anggota dalam bentuk Modern Interactive Timeline:
 * - Event, Pelatihan, Pengabdian, Kegiatan Wisata
 * - Berdasarkan data MEMBER_ACTIVITY
 * - Zero-Blob compliant media preview
 */

import React, { useState, useMemo } from 'react';
import {
  Calendar,
  MapPin,
  User,
  ExternalLink,
  Compass,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  Shield,
  Layers,
} from 'lucide-react';
import { useAchievementStore } from '../../../stores/achievementStore';
import { MOCK_ACTIVE_ACTIVITIES } from '../../achievement/data/achievementMockData';

type ActivityCategory = 'ALL' | 'EVENT' | 'PELATIHAN' | 'PENGABDIAN' | 'WISATA';

export const MemberActivityView: React.FC = () => {
  const { activities: storeActivities } = useAchievementStore();
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extended mock dataset covering all required categories: Event, Pelatihan, Pengabdian, Kegiatan Wisata
  const allActivities = useMemo(() => {
    return [
      {
        id: 'act-01',
        title: 'Pemandu Delegasi Hari Pariwisata Dunia (WTD) 2024',
        category: 'EVENT' as ActivityCategory,
        categoryLabel: 'Event Nasional',
        date: '27 September 2024',
        year: '2024',
        location: 'Bandung & Kawasan Heritage Asia Afrika',
        role: 'Pemandu Wisata Lapangan (Tour Leader)',
        desc: 'Pelayanan interpretasi sejarah dan keramahan pramuka pariwisata menyambut delegasi pariwisata internasional.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
        referenceUrl: 'https://saka-pariwisata.org/agenda/wtd-2024',
      },
      {
        id: 'act-02',
        title: 'Kemah Bhakti SAKA Pariwisata Jawa Barat',
        category: 'PENGABDIAN' as ActivityCategory,
        categoryLabel: 'Pengabdian Masyarakat',
        date: '12 - 14 Agustus 2024',
        year: '2024',
        location: 'Bumi Perkemahan Mandalawangi, Cibodas',
        role: 'Koordinator MICE & Protokoler',
        desc: 'Rehabilitasi jalur tracking wisata ramah disabilitas dan penataan rambu interpretasi alam.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?w=600&auto=format&fit=crop&q=80',
        referenceUrl: 'https://saka-pariwisata.org/agenda/kemah-bhakti-2024',
      },
      {
        id: 'act-03',
        title: 'Pelatihan Sertifikasi Pemandu Ekowisata Curug Malela',
        category: 'PELATIHAN' as ActivityCategory,
        categoryLabel: 'Pelatihan Kompetensi',
        date: '18 Maret 2025',
        year: '2025',
        location: 'Kawasan Wisata Bandung Barat',
        role: 'Peserta Utama Diklat',
        desc: 'Uji kompetensi pertolongan pertama pada kecelakaan di medan basah, keselamatan tali, dan geowisata.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
        referenceUrl: 'https://saka-pariwisata.org/agenda/diklat-malela-2025',
      },
      {
        id: 'act-04',
        title: 'Aksi Bersih Destinasi & Edukasi Sapta Pesona',
        category: 'PENGABDIAN' as ActivityCategory,
        categoryLabel: 'Pengabdian / Sadar Wisata',
        date: '10 Juni 2024',
        year: '2024',
        location: 'Desa Wisata Alamendah, Ciwidey',
        role: 'Fasilitator Penyuluhan Pengunjung',
        desc: 'Penyuluhan sadar wisata, pilah sampah organik plastik, serta pendampingan kebersihan homestay binaan.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
        referenceUrl: 'https://saka-pariwisata.org/agenda/sapta-pesona-ciwidey',
      },
      {
        id: 'act-05',
        title: 'Eksplorasi Jalur Geowisata Kawah Tangkuban Parahu',
        category: 'WISATA' as ActivityCategory,
        categoryLabel: 'Kegiatan Wisata',
        date: '15 Maret 2024',
        year: '2024',
        location: 'TWA Tangkuban Parahu, Subang',
        role: 'Petugas Pengamat Trek & Navigasi',
        desc: 'Pemetaan titik rawan longsor dan verifikasi kelayakan rambu wisata vulkanik bersama Balai Konservasi.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
        referenceUrl: 'https://saka-pariwisata.org/agenda/geowisata-tangkuban',
      },
      {
        id: 'act-06',
        title: 'Workshop Digital Marketing Desa Wisata Berbasis AI',
        category: 'PELATIHAN' as ActivityCategory,
        categoryLabel: 'Pelatihan Digital',
        date: '02 Februari 2026',
        year: '2026',
        location: 'Gedung Kwarda Jawa Barat',
        role: 'Peserta & Trainer Asisten',
        desc: 'Pembuatan konten video promosi destinasi berbasis storytelling kearifan lokal nusantara.',
        thumbnailUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
        referenceUrl: 'https://saka-pariwisata.org/agenda/workshop-desa-wisata',
      },
    ];
  }, []);

  // Filtered Activities
  const filteredActivities = useMemo(() => {
    return allActivities.filter((act) => {
      const matchCategory = selectedCategory === 'ALL' || act.category === selectedCategory;
      const matchSearch =
        act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        act.role.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [allActivities, selectedCategory, searchQuery]);

  return (
    <div id="member-activity-history" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#009B4D] uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>MEMBER_ACTIVITY TIMELINE</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Riwayat Partisipasi & Kegiatan
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Jejak langkah pengabdian, pelatihan kompetensi, event pariwisata, dan jelajah kepanduan.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari kegiatan, lokasi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:border-[#0066B3] outline-hidden"
          />
        </div>
      </div>

      {/* Category Filter Pills (Event, Pelatihan, Pengabdian, Wisata) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'ALL', label: 'Semua Kegiatan', count: allActivities.length },
          { id: 'EVENT', label: 'Event', count: allActivities.filter((a) => a.category === 'EVENT').length },
          { id: 'PELATIHAN', label: 'Pelatihan', count: allActivities.filter((a) => a.category === 'PELATIHAN').length },
          { id: 'PENGABDIAN', label: 'Pengabdian', count: allActivities.filter((a) => a.category === 'PENGABDIAN').length },
          { id: 'WISATA', label: 'Kegiatan Wisata', count: allActivities.filter((a) => a.category === 'WISATA').length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id as ActivityCategory)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedCategory === tab.id
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                selectedCategory === tab.id ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Interactive Modern Timeline */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        {filteredActivities.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Compass className="w-8 h-8 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Tidak ada kegiatan yang sesuai filter</p>
            <p className="text-xs text-slate-400">Silakan ubah kata kunci pencarian atau kategori.</p>
          </div>
        ) : (
          <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-2.5 sm:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {filteredActivities.map((act, index) => {
              const isEven = index % 2 === 0;
              return (
                <div key={act.id} className="relative group">
                  {/* Timeline Node Point */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-3 border-white shadow-sm flex items-center justify-center transition-transform group-hover:scale-125 ${
                      act.category === 'EVENT'
                        ? 'bg-[#F7941D]'
                        : act.category === 'PELATIHAN'
                        ? 'bg-[#0066B3]'
                        : act.category === 'PENGABDIAN'
                        ? 'bg-[#009B4D]'
                        : 'bg-[#782B90]'
                    }`}
                  />

                  {/* Activity Card */}
                  <div className="bg-slate-50/70 hover:bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 transition-all shadow-xs hover:shadow-md flex flex-col md:flex-row gap-4 items-start">
                    {/* Thumbnail (Zero-Blob: pointer preview) */}
                    <div className="w-full md:w-44 h-32 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-200/80 relative">
                      <img
                        src={act.thumbnailUrl}
                        alt={act.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                        {act.categoryLabel}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1 font-semibold text-slate-600">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {act.date}
                          </span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                          SELESAI
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors leading-snug">
                        {act.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed">{act.desc}</p>

                      <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />
                            <strong className="text-slate-700">{act.location}</strong>
                          </span>
                          <span>•</span>
                          <span className="inline-flex items-center gap-1 text-slate-500">
                            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            Peran: <strong className="text-[#0066B3]">{act.role}</strong>
                          </span>
                        </div>

                        {act.referenceUrl && (
                          <a
                            href={act.referenceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#0066B3] hover:underline"
                          >
                            <span>Rujukan Agenda</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
