/**
 * SPWN Apps 2.0 - Member Portfolio Experience & Pembina Verification
 * Location: src/features/membership/components/MemberPortfolioView.tsx
 * -------------------------------------------------------------
 * 1. ZERO-BLOB STORAGE:
 *    - Hanya menyimpan photo_url, video_url, document_url
 *    - Frontend hanya memuat thumbnail preview ringan
 * 2. Portfolio Card:
 *    - Foto, Judul, Tanggal, Lokasi, Status verifikasi Pembina
 * 3. Pembina Verification Feature:
 *    - Pembina dapat melihat portfolio anggota binaan
 *    - Memberikan verifikasi & catatan (verified_by, verified_at, verification_note)
 *    - Tidak boleh mengubah data identitas anggota
 */

import React, { useState } from 'react';
import {
  Briefcase,
  ShieldCheck,
  Plus,
  ExternalLink,
  Calendar,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  Video,
  FileText,
  MessageSquare,
  UserCheck,
  Sparkles,
  X,
  Save,
  Eye,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';

export interface PortfolioItem {
  id: string;
  title: string;
  category: 'Pemanduan' | 'Sadar Wisata' | 'Event' | 'Bakti Saka' | 'Kuliner';
  role: string;
  date: string;
  location: string;
  photoUrl: string;
  videoUrl?: string;
  documentUrl?: string;
  description: string;
  isVerified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNote?: string;
}

export const INITIAL_PORTFOLIO_ITEMS: PortfolioItem[] = [
  {
    id: 'PORT-001',
    title: 'Pemanduan Wisata Edukasi Cagar Budaya Heritage',
    category: 'Pemanduan',
    role: 'Koordinator Pemandu Saka',
    date: '15 Februari 2026',
    location: 'Kawasan Wisata Sejarah Kota Tua & Museum',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://youtube.com/watch?v=example-pemanduan',
    documentUrl: 'https://drive.google.com/file/d/example-sertifikat-pemandu/view',
    description: 'Memandu 45 pelajar pramuka penggalang dalam interpretasi sejarah arsitektur cagar budaya.',
    isVerified: true,
    verifiedBy: 'Kak Hendra Gunawan, S.Pd (Pamong Saka)',
    verifiedAt: '2026-02-18T10:30:00Z',
    verificationNote: 'Sangat baik, teknik interpretasi materi komunikatif dan menguasai Sapta Pesona.',
  },
  {
    id: 'PORT-002',
    title: 'Aksi Bersih Sadar Wisata & Penanaman Mangrove',
    category: 'Sadar Wisata',
    role: 'Instruktur Sapta Pesona',
    date: '20 Desember 2025',
    location: 'Kawasan Pesisir & Ekowisata Mangrove',
    photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=70',
    videoUrl: 'https://youtube.com/watch?v=example-sapta-pesona',
    documentUrl: 'https://drive.google.com/file/d/example-surat-tugas/view',
    description: 'Menggerakkan 30 kader pramuka dalam bakti kebersihan destinasi wisata dan penanaman 100 bibit mangrove.',
    isVerified: true,
    verifiedBy: 'Kak Hendra Gunawan, S.Pd (Pamong Saka)',
    verifiedAt: '2025-12-24T14:15:00Z',
    verificationNote: 'Dokumentasi lengkap, laporan pengabdian masyarakat telah disahkan Kwarcab.',
  },
  {
    id: 'PORT-003',
    title: 'Festival Kuliner Tradisional Saka Pariwisata',
    category: 'Kuliner',
    role: 'Kurator Menu & Stand Ekowisata',
    date: '05 Oktober 2025',
    location: 'Gelanggang Wisata Remaja',
    photoUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=70',
    videoUrl: '',
    documentUrl: 'https://drive.google.com/file/d/example-piagam-kuliner/view',
    description: 'Penyajian kuliner khas nusantara ramah lingkungan berbahan rempah lokal binaan UMKM.',
    isVerified: false,
    verificationNote: 'Menunggu review dokumen piagam oleh Pembina Saka.',
  },
];

export const MemberPortfolioView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const { addToast } = useUIStore();

  const [portfolios, setPortfolios] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem(`SPWN_PORTFOLIO_${currentUser.id}`);
      return saved ? JSON.parse(saved) : INITIAL_PORTFOLIO_ITEMS;
    } catch {
      return INITIAL_PORTFOLIO_ITEMS;
    }
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPembinaModalOpen, setIsPembinaModalOpen] = useState(false);
  const [selectedPortfolioForVerify, setSelectedPortfolioForVerify] = useState<PortfolioItem | null>(null);

  // Form State for Add Portfolio (Zero Blob: URLs only)
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState<PortfolioItem['category']>('Pemanduan');
  const [formRole, setFormRole] = useState('');
  const [formDate, setFormDate] = useState('');
  const [formLocation, setFormLocation] = useState('');
  const [formPhotoUrl, setFormPhotoUrl] = useState('');
  const [formVideoUrl, setFormVideoUrl] = useState('');
  const [formDocumentUrl, setFormDocumentUrl] = useState('');
  const [formDesc, setFormDesc] = useState('');

  // Pembina Verification Form State
  const [pembinaName, setPembinaName] = useState('Kak Pembina SAKA');
  const [pembinaNote, setPembinaNote] = useState('');

  const savePortfolios = (newItems: PortfolioItem[]) => {
    setPortfolios(newItems);
    try {
      localStorage.setItem(`SPWN_PORTFOLIO_${currentUser.id}`, JSON.stringify(newItems));
    } catch (e) {
      console.warn('Failed to save portfolio', e);
    }
  };

  const handleCreatePortfolio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formPhotoUrl.trim()) {
      addToast({
        type: 'error',
        title: 'Validasi',
        message: 'Judul dan URL foto dokumentasi wajib diisi.',
      });
      return;
    }

    const newItem: PortfolioItem = {
      id: `PORT-${Date.now().toString().slice(-4)}`,
      title: formTitle.trim(),
      category: formCategory,
      role: formRole.trim() || 'Anggota Pelaksana',
      date: formDate || new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
      location: formLocation.trim() || 'Destinasi Wisata',
      photoUrl: formPhotoUrl.trim(),
      videoUrl: formVideoUrl.trim() || undefined,
      documentUrl: formDocumentUrl.trim() || undefined,
      description: formDesc.trim(),
      isVerified: false,
    };

    const updated = [newItem, ...portfolios];
    savePortfolios(updated);
    setIsAddModalOpen(false);

    // Reset Form
    setFormTitle('');
    setFormRole('');
    setFormDate('');
    setFormLocation('');
    setFormPhotoUrl('');
    setFormVideoUrl('');
    setFormDocumentUrl('');
    setFormDesc('');

    addToast({
      type: 'success',
      title: 'Portofolio Ditambahkan',
      message: 'Karya berhasil dicatat dengan arsitektur Zero-Blob (URL Pointer).',
    });
  };

  // Pembina Verification Action
  const handleVerifyByPembina = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPortfolioForVerify) return;

    const updated = portfolios.map((item) => {
      if (item.id === selectedPortfolioForVerify.id) {
        return {
          ...item,
          isVerified: true,
          verifiedBy: pembinaName.trim() || 'Kak Hendra Gunawan, S.Pd (Pamong Saka)',
          verifiedAt: new Date().toISOString(),
          verificationNote: pembinaNote.trim() || 'Dokumentasi sah dan terverifikasi oleh Pembina Saka.',
        };
      }
      return item;
    });

    savePortfolios(updated);
    setIsPembinaModalOpen(false);
    setSelectedPortfolioForVerify(null);
    setPembinaNote('');

    addToast({
      type: 'success',
      title: 'Verifikasi Berhasil Disimpan',
      message: 'Catatan audit Pembina telah dibubuhkan pada portofolio anggota binaan.',
    });
  };

  return (
    <div id="member-portfolio-experience" className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F7941D] uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Portofolio Pengabdian & Karya</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rekam Portofolio & Verifikasi Pembina
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Dokumentasi keterlibatan lapangan anggota SAKA Pariwisata dengan standar Zero-Blob Storage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0066B3] hover:bg-[#005299] text-white text-xs font-bold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Karya</span>
          </button>
        </div>
      </div>

      {/* Zero-Blob Policy Notice */}
      <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex items-start gap-3 text-xs">
        <ShieldCheck className="w-4 h-4 text-[#009B4D] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold text-emerald-950">Kebijakan Penyimpanan (Zero-Blob Media Architecture):</span>
          <p className="text-emerald-800 leading-relaxed text-[11px]">
            Sistem tidak menyimpan video besar, dokumen biner, atau foto beresolusi penuh ke basis data server. Seluruh berkas disimpan menggunakan <strong>URL rujukan eksternal</strong> (Google Drive, YouTube, atau CDN publik), dan antarmuka web hanya merender <em>thumbnail preview</em> ringan untuk efisiensi dan keamanan.
          </p>
        </div>
      </div>

      {/* Portfolio Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Thumbnail Container (Lightweight preview only) */}
              <div className="w-full aspect-video bg-slate-100 relative overflow-hidden group">
                <img
                  src={item.photoUrl}
                  alt={item.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute top-3 left-3">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
                    {item.category}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {item.isVerified ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-500 text-white shadow-xs flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Terverifikasi
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-amber-500 text-white shadow-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Menunggu Review
                    </span>
                  )}
                </div>
              </div>

              {/* Body Details */}
              <div className="p-5 space-y-3">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" /> {item.date}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#0066B3] font-semibold mt-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />
                    <span className="truncate">{item.location}</span>
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.description}
                </p>

                {/* External Media Links (URL Pointers) */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 text-[11px]">
                  {item.videoUrl && (
                    <a
                      href={item.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50 text-red-700 hover:bg-red-100 font-semibold"
                    >
                      <Video className="w-3 h-3" /> Video Kegiatan
                    </a>
                  )}
                  {item.documentUrl && (
                    <a
                      href={item.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-[#0066B3] hover:bg-blue-100 font-semibold"
                    >
                      <FileText className="w-3 h-3" /> Berkas Tugas
                    </a>
                  )}
                </div>

                {/* Pembina Verification Details Box */}
                {item.isVerified && item.verifiedBy && (
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-100 space-y-1 text-xs">
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#009B4D]" />
                      <span>Diverifikasi oleh:</span>
                    </div>
                    <p className="text-slate-800 font-medium text-[11px]">{item.verifiedBy}</p>
                    {item.verificationNote && (
                      <p className="text-slate-600 text-[10px] italic border-l-2 border-emerald-300 pl-2 mt-1">
                        "{item.verificationNote}"
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions: Pembina Verification Trigger */}
            <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-500">
                Peran: <strong className="text-slate-800">{item.role}</strong>
              </span>

              {/* Tombol Khusus Verifikasi Pembina */}
              <button
                onClick={() => {
                  setSelectedPortfolioForVerify(item);
                  setPembinaNote(item.verificationNote || '');
                  setIsPembinaModalOpen(true);
                }}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  item.isVerified
                    ? 'bg-slate-200/80 text-slate-700 hover:bg-slate-300'
                    : 'bg-[#009B4D] text-white hover:bg-emerald-700 shadow-xs'
                }`}
                title="Buka panel verifikasi pembina untuk portofolio ini"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{item.isVerified ? 'Audit Pembina' : 'Verifikasi Pembina'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: TAMBAH PORTOFOLIO (ZERO BLOB STORAGE URL FORM)        */}
      {/* ============================================================== */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0066B3]" />
                <h3 className="text-base font-bold text-slate-900">Catat Portofolio Baru</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePortfolio} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Judul Kegiatan / Karya *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pemanduan Geowisata Karst Padalarang"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] focus:ring-1 focus:ring-[#0066B3] outline-hidden font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Kategori</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  >
                    <option value="Pemanduan">Pemanduan Wisata</option>
                    <option value="Sadar Wisata">Sadar Wisata / Sapta Pesona</option>
                    <option value="Event">Event / Festival</option>
                    <option value="Bakti Saka">Bakti Saka & Lingkungan</option>
                    <option value="Kuliner">Kuliner Tradisional</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Peran Anggota</label>
                  <input
                    type="text"
                    placeholder="Contoh: Pemandu Utama"
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tanggal Pelaksanaan</label>
                  <input
                    type="text"
                    placeholder="Contoh: 15 Maret 2026"
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Lokasi Kegiatan</label>
                  <input
                    type="text"
                    placeholder="Contoh: Kab. Bandung Barat"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                <span className="font-bold text-[#0066B3] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Masukkan Pointer URL Eksternal (Zero-Blob):
                </span>
                <div className="space-y-1.5">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">Foto Thumbnail URL (CDN/Drive Publik) *</label>
                    <input
                      type="url"
                      required
                      placeholder="https://images.unsplash.com/... atau https://drive.google.com/..."
                      value={formPhotoUrl}
                      onChange={(e) => setFormPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0066B3] outline-hidden text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">Video Dokumentasi URL (YouTube/Drive)</label>
                    <input
                      type="url"
                      placeholder="https://youtube.com/watch?v=..."
                      value={formVideoUrl}
                      onChange={(e) => setFormVideoUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0066B3] outline-hidden text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700">Dokumen Pendukung / Piagam URL</label>
                    <input
                      type="url"
                      placeholder="https://drive.google.com/file/d/.../view"
                      value={formDocumentUrl}
                      onChange={(e) => setFormDocumentUrl(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white focus:border-[#0066B3] outline-hidden text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Deskripsi Ringkas Kegiatan</label>
                <textarea
                  rows={3}
                  placeholder="Uraikan aksi, capaian sasaran sadar wisata, serta kontribusi Anda..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0066B3] hover:bg-[#005299] text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Simpan Portofolio</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: VERIFIKASI PEMBINA (PEMBINA VERIFICATION MODULE)      */}
      {/* ============================================================== */}
      {isPembinaModalOpen && selectedPortfolioForVerify && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#009B4D]" />
                <h3 className="text-base font-bold text-slate-900">Verifikasi Karya oleh Pembina</h3>
              </div>
              <button
                onClick={() => setIsPembinaModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 space-y-1">
              <span className="font-bold flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Hak Akses Pembina:
              </span>
              <p>
                Pembina hanya berwenang memvalidasi portofolio & membubuhkan catatan evaluasi. Pembina <strong>tidak boleh mengubah data identitas anggota</strong>.
              </p>
            </div>

            <form onSubmit={handleVerifyByPembina} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500">Karya yang Diverifikasi:</span>
                <p className="font-bold text-slate-900 text-sm">{selectedPortfolioForVerify.title}</p>
                <p className="text-[11px] text-slate-500">
                  {selectedPortfolioForVerify.role} • {selectedPortfolioForVerify.date}
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nama Pembina / Pamong Verifikator *</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kak Hendra Gunawan, S.Pd (Pamong Saka)"
                  value={pembinaName}
                  onChange={(e) => setPembinaName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Catatan Evaluasi Pembina *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Tuliskan apresiasi, saran teknis, atau catatan pengesahan kecakapan..."
                  value={pembinaNote}
                  onChange={(e) => setPembinaNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPembinaModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white font-bold shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Sahkan Verifikasi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
