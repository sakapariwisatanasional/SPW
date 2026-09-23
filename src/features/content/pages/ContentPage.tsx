/**
 * SPWN Apps 2.0 - Content Management System (CMS) & Warta Realtime
 * Location: src/features/content/pages/ContentPage.tsx
 * -----------------------------------------------------------------
 * Fitur Utama:
 * 1. Aturan Akses Pembuatan Artikel:
 *    - Hanya dapat dilakukan oleh Anggota yang SUDAH DISETUJUI oleh Admin (Status: ACTIVE)
 *    - Publik & Anggota yang masih berstatus PENDING dicegah dan diberikan notifikasi edukatif.
 * 2. Pola Thumbnail URL Media Sosial (YouTube, TikTok, Facebook, Instagram, dll):
 *    - Anggota berbagi informasi secara realtime cukup menempelkan URL link media sosial
 *    - Sistem mendeteksi platform secara otomatis & mengekstrak thumbnail/embed player
 *    - Cukup menuliskan caption singkat sebagai redaksi
 *    - Pengkategorian: Berita / Agenda Kegiatan
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Newspaper,
  Calendar,
  Plus,
  ExternalLink,
  Share2,
  Video,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Lock,
  Sparkles,
  Link as LinkIcon,
  Play,
  Heart,
  Eye,
  Filter,
  UserCheck,
  Send,
  X,
  MessageCircle,
  Copy,
  Flame,
} from 'lucide-react';
import { Button, Card, Badge, Tabs, Input, Select, Modal } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { formatDateID } from '../../../utils/formatters';

export type ContentCategory = 'BERITA' | 'AGENDA';
export type SocialPlatform = 'youtube' | 'tiktok' | 'facebook' | 'instagram' | 'x' | 'website';

export interface SocialMediaPost {
  id: string;
  url: string;
  platform: SocialPlatform;
  title: string;
  caption: string;
  category: ContentCategory;
  authorName: string;
  authorKta?: string;
  authorPangkalan?: string;
  authorAvatar?: string;
  createdAt: string;
  eventDate?: string;
  eventLocation?: string;
  viewsCount: number;
  likesCount: number;
  thumbnailUrl?: string;
  youtubeVideoId?: string;
  status: 'PUBLISHED' | 'REVIEW';
}

// Deteksi platform dari URL link
export function detectPlatformFromUrl(url: string): { platform: SocialPlatform; youtubeId?: string } {
  if (!url) return { platform: 'website' };
  const clean = url.trim().toLowerCase();

  // YouTube match
  const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/i);
  if (ytMatch && ytMatch[1]) {
    return { platform: 'youtube', youtubeId: ytMatch[1] };
  }
  if (clean.includes('tiktok.com')) {
    return { platform: 'tiktok' };
  }
  if (clean.includes('facebook.com') || clean.includes('fb.watch') || clean.includes('fb.com')) {
    return { platform: 'facebook' };
  }
  if (clean.includes('instagram.com') || clean.includes('instagr.am')) {
    return { platform: 'instagram' };
  }
  if (clean.includes('twitter.com') || clean.includes('x.com')) {
    return { platform: 'x' };
  }
  return { platform: 'website' };
}

// Data awal contoh warta & agenda realtime dari link medsos anggota
const INITIAL_CMS_POSTS: SocialMediaPost[] = [
  {
    id: 'POST-001',
    url: 'https://www.youtube.com/watch?v=ScMzIvxBSi4',
    platform: 'youtube',
    youtubeVideoId: 'ScMzIvxBSi4',
    thumbnailUrl: 'https://img.youtube.com/vi/ScMzIvxBSi4/hqdefault.jpg',
    title: 'Giat Konservasi Mangrove Krida Bina Obyek Wisata di Pesisir Nusantara',
    caption: 'Dokumentasi realtime aksi kepedulian lingkungan pramuka SAKA Pariwisata bersama masyarakat pesisir dalam menjaga kelestarian ekowisata bahari.',
    category: 'BERITA',
    authorName: 'Fajar Nugraha',
    authorKta: 'KTA-PW-2026-0891',
    authorPangkalan: 'Pangkalan Kwarda Jawa Barat',
    createdAt: '2026-09-22T08:30:00Z',
    viewsCount: 420,
    likesCount: 58,
    status: 'PUBLISHED',
  },
  {
    id: 'POST-002',
    url: 'https://www.tiktok.com/@sakapariwisata/video/7300000000000000000',
    platform: 'tiktok',
    thumbnailUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    title: 'Pelatihan 23 Syarat Kecakapan Khusus (SKK) Krida Pemanduan Wisata',
    caption: 'Suasana seru praktik guiding dwibahasa di Candi Prambanan. Anggota dilatih Sapta Pesona dan teknik kepemanduan bertaraf internasional!',
    category: 'BERITA',
    authorName: 'Ahmad Fauzan',
    authorKta: 'KTA-PW-2026-0042',
    authorPangkalan: 'Pangkalan Kwarcab Sleman, DIY',
    createdAt: '2026-09-21T14:15:00Z',
    viewsCount: 1250,
    likesCount: 184,
    status: 'PUBLISHED',
  },
  {
    id: 'POST-003',
    url: 'https://www.facebook.com/sakapariwisata.id/posts/987654321',
    platform: 'facebook',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    title: 'Kemah Bakti Sadar Wisata & Promosi Geopark Nusantara 2026',
    caption: 'Undangan resmi agenda kemah bakti terbuka untuk anggota SAKA Pariwisata seluruh Indonesia. Mengasah krida sekaligus aksi bersih destinasi.',
    category: 'AGENDA',
    eventDate: '18 - 21 Oktober 2026',
    eventLocation: 'Geopark Ciletuh, Sukabumi, Jawa Barat',
    authorName: 'Siti Rahmawati',
    authorKta: 'KTA-PW-2026-0115',
    authorPangkalan: 'Kwarda DKI Jakarta',
    createdAt: '2026-09-20T10:00:00Z',
    viewsCount: 890,
    likesCount: 112,
    status: 'PUBLISHED',
  },
  {
    id: 'POST-004',
    url: 'https://www.instagram.com/p/C_abc123456/',
    platform: 'instagram',
    thumbnailUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
    title: 'Festival Kuliner Tradisional & Cenderamata Binaan Krida Kuliner',
    caption: 'Mari ramaikan stan UMKM binaan Krida Bina Kuliner & Cinderamata SAKA Pariwisata. Beragam sajian rasa khas nusantara dan kerajinan tangan.',
    category: 'AGENDA',
    eventDate: '26 - 28 Oktober 2026',
    eventLocation: 'Kawasan Benteng Vredeburg, DI Yogyakarta',
    authorName: 'Bambang Sudarsono',
    authorKta: 'KTA-PW-2026-0003',
    authorPangkalan: 'Kwarnas Gerakan Pramuka',
    createdAt: '2026-09-19T11:20:00Z',
    viewsCount: 640,
    likesCount: 95,
    status: 'PUBLISHED',
  },
];

export const ContentPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { addToast, setLoginModalOpen } = useUIStore();

  const [posts, setPosts] = useState<SocialMediaPost[]>(() => {
    try {
      const stored = localStorage.getItem('spwn_cms_social_posts');
      if (stored) return JSON.parse(stored);
    } catch (e) {
      // fallback
    }
    return INITIAL_CMS_POSTS;
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'news' | 'agenda'>('feed');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState('');

  // Modal State Pembuatan Konten Baru
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isRestrictedModalOpen, setIsRestrictedModalOpen] = useState(false);

  // Active Video Modal for YouTube Player
  const [activeYoutubeModalId, setActiveYoutubeModalId] = useState<string | null>(null);

  // Form State
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<ContentCategory>('BERITA');
  const [formCaption, setFormCaption] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formEventDate, setFormEventDate] = useState('');
  const [formEventLocation, setFormEventLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Deteksi Otomatis URL
  const detected = useMemo(() => detectPlatformFromUrl(formUrl), [formUrl]);

  // Evaluasi Hak Akses Pembuatan Artikel:
  // "Pembuatan artikel baru di Content Management System (CMS) hanya bisa dilakukan apabila mereka sudah menjadi anggota, dan sudah disetujui oleh Admin."
  const isApprovedMember = useMemo(() => {
    if (!isAuthenticated) return false;
    
    // Peran Admin & Pengurus Pusat/Wilayah selalu memiliki hak
    if (
      currentUser.role === ROLES.SUPER_ADMIN ||
      currentUser.role === ROLES.ADMIN_PUSAT ||
      currentUser.role === ROLES.ADMIN_WILAYAH ||
      currentUser.role === ROLES.CONTENT_MANAGER
    ) {
      return true;
    }

    // Untuk Anggota (MEMBER): Harus berstatus disetujui ('ACTIVE') dan bukan 'PENDING'
    if (currentUser.role === ROLES.MEMBER) {
      const status = (currentUser.status || 'ACTIVE').toUpperCase();
      return status === 'ACTIVE' || status === 'DISETUJUI';
    }

    return false;
  }, [currentUser, isAuthenticated]);

  // Simpan ke localStorage saat posts berubah
  useEffect(() => {
    try {
      localStorage.setItem('spwn_cms_social_posts', JSON.stringify(posts));
    } catch (e) {
      console.error(e);
    }
  }, [posts]);

  // Handler klik tombol Buat Konten Baru
  const handleOpenCreateModal = () => {
    if (!isAuthenticated) {
      setIsRestrictedModalOpen(true);
      return;
    }

    if (!isApprovedMember) {
      setIsRestrictedModalOpen(true);
      return;
    }

    // Reset Form
    setFormUrl('');
    setFormTitle('');
    setFormCaption('');
    setFormCategory('BERITA');
    setFormEventDate('');
    setFormEventLocation('');
    setIsCreateModalOpen(true);
  };

  // Submit Post Baru
  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formUrl.trim()) {
      addToast({ type: 'error', title: 'Tautan Wajib Diisi', message: 'Masukkan link tautan media sosial Anda.' });
      return;
    }

    if (!formCaption.trim()) {
      addToast({ type: 'error', title: 'Redaksi Caption Wajib Diisi', message: 'Tuliskan caption singkat sebagai narasi warta.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { platform, youtubeId } = detectPlatformFromUrl(formUrl);
      let thumb = '';

      if (youtubeId) {
        thumb = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      } else if (platform === 'tiktok') {
        thumb = 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80';
      } else if (platform === 'facebook') {
        thumb = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80';
      } else if (platform === 'instagram') {
        thumb = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
      } else {
        thumb = 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80';
      }

      const generatedTitle =
        formTitle.trim() ||
        (formCategory === 'AGENDA'
          ? `Agenda Kegiatan: ${formCaption.slice(0, 50)}...`
          : `Warta SAKA: ${formCaption.slice(0, 50)}...`);

      const newPost: SocialMediaPost = {
        id: `POST-${Date.now().toString().slice(-4)}`,
        url: formUrl.trim(),
        platform,
        youtubeVideoId: youtubeId,
        thumbnailUrl: thumb,
        title: generatedTitle,
        caption: formCaption.trim(),
        category: formCategory,
        authorName: currentUser.fullName || 'Anggota SAKA Pariwisata',
        authorKta: currentUser.nomor_kta || currentUser.memberId || 'KTA-TERDAFTAR',
        authorPangkalan: currentUser.pangkalan || 'Kwartir Wilayah Indonesia',
        createdAt: new Date().toISOString(),
        eventDate: formCategory === 'AGENDA' ? formEventDate : undefined,
        eventLocation: formCategory === 'AGENDA' ? formEventLocation : undefined,
        viewsCount: 1,
        likesCount: 0,
        status: 'PUBLISHED',
      };

      setPosts([newPost, ...posts]);
      setIsCreateModalOpen(false);

      addToast({
        type: 'success',
        title: 'Warta Realtime Berhasil Dibagikan!',
        message: 'Konten Anda telah tayang di linimasa informasi ekosistem SAKA Pariwisata.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Gagal Membagikan',
        message: err.message || 'Terjadi gangguan saat memproses warta.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Like Toggle
  const handleLikePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likesCount: p.likesCount + 1 } : p))
    );
    addToast({
      type: 'info',
      title: 'Apresiasi Warta',
      message: 'Terima kasih telah mengapresiasi karya anggota SAKA!',
    });
  };

  // Copy Link Post
  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    addToast({
      type: 'success',
      title: 'Tautan Disalin',
      message: 'Tautan media sosial berhasil disalin ke clipboard.',
    });
  };

  // Filter Data
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // Tab filter
      if (activeTab === 'news' && p.category !== 'BERITA') return false;
      if (activeTab === 'agenda' && p.category !== 'AGENDA') return false;

      // Platform filter
      if (platformFilter !== 'all' && p.platform !== platformFilter) return false;

      // Search filter
      if (searchFilter.trim()) {
        const query = searchFilter.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesCaption = p.caption.toLowerCase().includes(query);
        const matchesAuthor = p.authorName.toLowerCase().includes(query);
        if (!matchesTitle && !matchesCaption && !matchesAuthor) return false;
      }

      return true;
    });
  }, [posts, activeTab, platformFilter, searchFilter]);

  // Platform Badge Renderer
  const renderPlatformBadge = (platform: SocialPlatform) => {
    switch (platform) {
      case 'youtube':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-2xs">
            <Video className="w-3 h-3 fill-current" />
            <span>YouTube</span>
          </span>
        );
      case 'tiktok':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black text-white shadow-2xs">
            <span className="font-black text-[11px]">♪</span>
            <span>TikTok</span>
          </span>
        );
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#1877F2] text-white shadow-2xs">
            <span className="font-black text-[11px]">f</span>
            <span>Facebook</span>
          </span>
        );
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-2xs">
            <span>📷</span>
            <span>Instagram</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-white shadow-2xs">
            <ExternalLink className="w-3 h-3" />
            <span>Web Link</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-[#004C85] via-[#0066B3] to-[#009B4D] rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-white border border-white/20">
            <Flame className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span>Warta & Linimasa Informasi Realtime SAKA Pariwisata</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Content Management System (CMS)
          </h1>

          <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-normal">
            Berbagi informasi realtime antaranggota se-Indonesia menggunakan tautan media sosial (YouTube, TikTok, Facebook, Instagram) dengan caption redaksi ringkas.
          </p>
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <Button
            size="md"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={handleOpenCreateModal}
            className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl shadow-md cursor-pointer shrink-0"
          >
            Buat Konten Baru
          </Button>
        </div>
      </div>

      {/* RBAC Notice Callout */}
      {!isApprovedMember && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-amber-950 block">
                Aturan Pembuatan Konten Terverifikasi
              </span>
              <p className="text-amber-800 text-[11px] mt-0.5">
                {!isAuthenticated
                  ? 'Pembuatan artikel baru di CMS hanya dapat dilakukan oleh Anggota resmi yang telah disetujui Admin. Silakan masuk terlebih dahulu.'
                  : 'Akun Anda sedang dalam proses peninjauan persetujuan oleh Admin. Pembuatan artikel akan aktif setelah status keanggotaan Anda disetujui.'}
              </p>
            </div>
          </div>

          {!isAuthenticated ? (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setLoginModalOpen(true)}
              className="bg-[#0066B3] hover:bg-[#004C85] text-white text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
            >
              Masuk Akun Anggota
            </Button>
          ) : (
            <Badge variant="orange" size="sm">
              Status: Menunggu Persetujuan Admin
            </Badge>
          )}
        </div>
      )}

      {/* Filter Bar & Tabs Navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'feed'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Semua Linimasa</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {posts.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('news')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'news'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Newspaper className="w-4 h-4" />
            <span>Berita & Warta</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {posts.filter((p) => p.category === 'BERITA').length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('agenda')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'agenda'
                ? 'bg-[#0066B3] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Agenda Kegiatan</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {posts.filter((p) => p.category === 'AGENDA').length}
            </span>
          </button>
        </div>

        {/* Platform & Search Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Platform Pills */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { id: 'all', label: 'Semua' },
              { id: 'youtube', label: 'YouTube' },
              { id: 'tiktok', label: 'TikTok' },
              { id: 'facebook', label: 'Facebook' },
              { id: 'instagram', label: 'IG' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPlatformFilter(p.id)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                  platformFilter === p.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative min-w-[200px]">
            <input
              type="text"
              placeholder="Cari redaksi / anggota..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Grid Konten Realtime */}
      {filteredPosts.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0066B3] flex items-center justify-center mx-auto">
            <Newspaper className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Tidak ada warta yang cocok</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Coba ganti filter platform atau kata kunci pencarian Anda untuk melihat warta lainnya.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPosts.map((post) => (
            <Card
              key={post.id}
              className="group overflow-hidden rounded-2xl border-slate-200/90 hover:border-blue-300 hover:shadow-lg transition-all flex flex-col bg-white"
            >
              {/* Media Thumbnail Container */}
              <div className="relative aspect-video w-full bg-slate-900 overflow-hidden cursor-pointer select-none">
                {post.thumbnailUrl ? (
                  <img
                    src={post.thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white">
                    <Video className="w-10 h-10 opacity-30" />
                  </div>
                )}

                {/* Platform Badge Overlay */}
                <div className="absolute top-3 left-3 z-10">
                  {renderPlatformBadge(post.platform)}
                </div>

                {/* Category Badge Overlay */}
                <div className="absolute top-3 right-3 z-10">
                  <Badge
                    variant={post.category === 'BERITA' ? 'blue' : 'green'}
                    size="sm"
                    className="backdrop-blur-md bg-white/90 font-bold"
                  >
                    {post.category === 'BERITA' ? 'Warta Berita' : 'Agenda'}
                  </Badge>
                </div>

                {/* Center Play Button for Video */}
                {post.platform === 'youtube' && post.youtubeVideoId && (
                  <button
                    onClick={() => setActiveYoutubeModalId(post.youtubeVideoId || null)}
                    className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors"
                  >
                    <div className="w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-6 h-6 fill-white ml-0.5" />
                    </div>
                  </button>
                )}

                {/* Non-YouTube External Link Open */}
                {post.platform !== 'youtube' && (
                  <a
                    href={post.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="px-3 py-1.5 rounded-full bg-white/95 text-slate-900 font-bold text-xs flex items-center gap-1.5 shadow-md">
                      <span>Buka di {post.platform.toUpperCase()}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                  </a>
                )}
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {/* Event Metadata jika Kategori Agenda */}
                  {post.category === 'AGENDA' && (post.eventDate || post.eventLocation) && (
                    <div className="p-2.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-[11px] space-y-1 text-emerald-950 font-medium">
                      {post.eventDate && (
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#009B4D] shrink-0" />
                          <span>{post.eventDate}</span>
                        </p>
                      )}
                      {post.eventLocation && (
                        <p className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#F7941D] shrink-0" />
                          <span className="truncate">{post.eventLocation}</span>
                        </p>
                      )}
                    </div>
                  )}

                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors leading-snug line-clamp-2">
                    {post.title}
                  </h3>

                  {/* Redaksi Caption Singkat */}
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                    {post.caption}
                  </p>
                </div>

                {/* Author Info & Card Footer */}
                <div className="pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <div className="min-w-0 flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#0066B3] to-[#009B4D] flex items-center justify-center font-bold text-white text-[11px] shrink-0">
                        {post.authorName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 text-[11px] truncate">
                          {post.authorName}
                        </p>
                        <p className="text-[10px] text-slate-400 truncate">
                          {post.authorPangkalan || 'Anggota Resmi SPWN'}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] text-slate-400 whitespace-nowrap pl-1 font-mono">
                      {formatDateID(post.createdAt)}
                    </span>
                  </div>

                  {/* Action Buttons: Like, Copy Link, Open Source */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleLikePost(post.id)}
                        className="flex items-center gap-1 text-slate-500 hover:text-rose-600 transition-colors p-1 rounded-md hover:bg-rose-50 cursor-pointer"
                        title="Apresiasi warta ini"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500/20 hover:fill-rose-500" />
                        <span className="text-[11px] font-semibold">{post.likesCount}</span>
                      </button>

                      <button
                        onClick={() => handleCopyLink(post.url)}
                        className="flex items-center gap-1 text-slate-500 hover:text-slate-800 transition-colors p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                        title="Salin Tautan Sumber"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="text-[11px]">Salin</span>
                      </button>
                    </div>

                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0066B3] hover:underline"
                    >
                      <span>Lihat Sumber</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: PEMBUATAN KONTEN BARU DENGAN POLA URL LINK            */}
      {/* ============================================================== */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        size="lg"
        title="Bagikan Warta / Konten Baru"
        description="Berbagi warta realtime cukup menempelkan URL link media sosial Anda dengan caption redaksi ringkas."
      >
        <form onSubmit={handleCreatePost} className="space-y-4 pt-2">
          {/* Info Penulis Terverifikasi */}
          <div className="p-3 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#0066B3] text-white flex items-center justify-center font-bold text-xs">
                {currentUser.fullName?.charAt(0) || 'A'}
              </div>
              <div>
                <p className="font-bold text-slate-900 leading-tight">
                  {currentUser.fullName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentUser.nomor_kta || 'KTA Terdaftar'} • {currentUser.roleName}
                </p>
              </div>
            </div>
            <Badge variant="green" size="sm" dot>
              Penulis Terverifikasi
            </Badge>
          </div>

          {/* Input URL Link Media Sosial */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              URL Link Media Sosial (YouTube / TikTok / Facebook / Instagram / Web) *
            </label>
            <div className="relative">
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=... atau https://tiktok.com/@... atau link Facebook"
                value={formUrl}
                onChange={(e) => setFormUrl(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-24 py-2 text-xs focus:ring-2 focus:ring-[#0066B3] focus:border-[#0066B3]"
              />
              <LinkIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                {renderPlatformBadge(detected.platform)}
              </div>
            </div>
            <p className="text-[10px] text-slate-500 mt-1">
              Thumbnail gambar/video akan otomatis diekstrak secara realtime dari URL tautan yang Anda berikan.
            </p>
          </div>

          {/* Pratinjau Deteksi Realtime */}
          {formUrl && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Pratinjau Otomatis Platform
              </span>
              <div className="flex items-center gap-3">
                {detected.youtubeId ? (
                  <img
                    src={`https://img.youtube.com/vi/${detected.youtubeId}/hqdefault.jpg`}
                    alt="YouTube Preview"
                    className="w-24 h-14 object-cover rounded-lg border border-slate-300"
                  />
                ) : (
                  <div className="w-24 h-14 rounded-lg bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 uppercase">
                    {detected.platform}
                  </div>
                )}
                <div className="min-w-0 flex-1 text-xs">
                  <p className="font-bold text-slate-800">
                    Terdeteksi: {detected.platform.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{formUrl}</p>
                </div>
              </div>
            </div>
          )}

          {/* Kategori Informasi */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Kategori Informasi *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setFormCategory('BERITA')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  formCategory === 'BERITA'
                    ? 'border-[#0066B3] bg-blue-50/60 ring-2 ring-[#0066B3]/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Newspaper className="w-4 h-4 text-[#0066B3]" />
                  <span className="text-xs font-bold text-slate-900">Berita & Warta</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Liputan kegiatan, konservasi, kisah inspiratif, & edukasi pariwisata.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setFormCategory('AGENDA')}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  formCategory === 'AGENDA'
                    ? 'border-[#009B4D] bg-emerald-50/60 ring-2 ring-[#009B4D]/20'
                    : 'border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-[#009B4D]" />
                  <span className="text-xs font-bold text-slate-900">Agenda Kegiatan</span>
                </div>
                <p className="text-[10px] text-slate-500">
                  Kemah wisata, jambore, diklat 23 SKK, festival, & jadwal terbuka.
                </p>
              </button>
            </div>
          </div>

          {/* Bidang Tambahan Khusus Agenda Kegiatan */}
          {formCategory === 'AGENDA' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-2xl bg-emerald-50/50 border border-emerald-200">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Tanggal Pelaksanaan Kegiatan
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 15 - 18 Oktober 2026"
                  value={formEventDate}
                  onChange={(e) => setFormEventDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#009B4D]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  Lokasi / Tempat Acara
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pantai Kuta, Badung, Bali"
                  value={formEventLocation}
                  onChange={(e) => setFormEventLocation(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:ring-1 focus:ring-[#009B4D]"
                />
              </div>
            </div>
          )}

          {/* Judul Opsional */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Judul Warta (Opsional)
            </label>
            <input
              type="text"
              placeholder="Contoh: Aksi Bersih Pantai Bersama Krida Bina Sadar Wisata"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-[#0066B3]"
            />
          </div>

          {/* Caption Singkat Sebagai Redaksi */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>Caption Singkat Redaksi *</span>
              <span className="text-[10px] font-normal text-slate-400">
                {formCaption.length} karakter
              </span>
            </div>
            <textarea
              required
              rows={3}
              placeholder="Tuliskan keterangan singkat, esensi kegiatan, atau seruan pramuka pariwisata untuk dibagikan secara realtime..."
              value={formCaption}
              onChange={(e) => setFormCaption(e.target.value)}
              className="w-full bg-white border border-slate-300 rounded-xl p-3 text-xs focus:ring-2 focus:ring-[#0066B3] resize-none"
            />
          </div>

          {/* Tombol Aksi */}
          <div className="pt-2 flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Batal
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              leftIcon={<Send className="w-4 h-4" />}
              className="bg-[#0066B3] hover:bg-[#005291] text-white font-bold"
            >
              Bagikan Sekarang
            </Button>
          </div>
        </form>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 2: NOTIFIKASI AKSES DIBATASI (PUBLIC / PENDING)          */}
      {/* ============================================================== */}
      <Modal
        isOpen={isRestrictedModalOpen}
        onClose={() => setIsRestrictedModalOpen(false)}
        size="md"
        title="Hak Akses Pembuatan Artikel CMS"
        description="Ketentuan Khusus Publikasi Konten Terverifikasi"
      >
        <div className="space-y-4 pt-1 text-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-900">
              Hanya untuk Anggota Resmi yang Disetujui Admin
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md mx-auto">
              Sesuai aturan keamanan informasi SPWN Apps 2.0, pembuatan artikel baru di Content Management System (CMS) hanya dapat dilakukan apabila pengguna telah resmi menjadi anggota SAKA Pariwisata dan status pendaftarannya telah diverifikasi serta <strong>disetujui oleh Administrator</strong>.
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1.5">
            <p className="font-semibold text-slate-800">Langkah untuk memperoleh hak penulisan:</p>
            <ul className="space-y-1 text-slate-600 text-[11px] list-disc list-inside">
              <li>Mendaftarkan diri melalui formulir Pendaftaran Anggota Baru.</li>
              <li>Menunggu verifikasi dan aktivasi KTA oleh Kwartir / Admin.</li>
              <li>Login dengan akun resmi Anda untuk mulai berkontribusi.</li>
            </ul>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
            {!isAuthenticated ? (
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  setIsRestrictedModalOpen(false);
                  setLoginModalOpen(true);
                }}
                className="w-full sm:w-auto bg-[#0066B3] text-white font-bold"
              >
                Masuk ke Akun Member
              </Button>
            ) : (
              <Button
                variant="outline"
                size="md"
                onClick={() => setIsRestrictedModalOpen(false)}
                className="w-full sm:w-auto"
              >
                Saya Mengerti
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* ============================================================== */}
      {/* MODAL 3: YOUTUBE IN-APP EMBED PLAYER                           */}
      {/* ============================================================== */}
      {activeYoutubeModalId && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setActiveYoutubeModalId(null)}
        >
          <div
            className="bg-black rounded-3xl overflow-hidden max-w-3xl w-full shadow-2xl relative border border-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-3 bg-slate-900 text-white">
              <span className="text-xs font-bold flex items-center gap-1.5">
                <Video className="w-4 h-4 text-red-500 fill-red-500" />
                <span>Pemutar Warta Realtime SAKA</span>
              </span>
              <button
                onClick={() => setActiveYoutubeModalId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube.com/embed/${activeYoutubeModalId}?autoplay=1`}
                title="Warta Video SAKA Pariwisata"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
