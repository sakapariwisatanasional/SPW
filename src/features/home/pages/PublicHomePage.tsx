import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  Compass,
  CreditCard,
  ExternalLink,
  LoaderCircle,
  Newspaper,
  QrCode,
  RefreshCw,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';
import { contentApi, ContentItem } from '../../../services/api/content.api';

const WI = {
  blue: '#169CD8',
  green: '#63B32E',
  purple: '#6F3BC5',
  orange: '#F7941D',
  pink: '#EC2F78',
  navy: '#0B2F5B',
};

const shortcuts = [
  { label: 'Daftar', sub: 'Anggota baru', icon: UserPlus, action: 'registration', color: WI.orange },
  { label: 'Masuk', sub: 'Dashboard', icon: CreditCard, action: 'LOGIN', color: WI.blue },
  { label: 'SKK', sub: 'Belajar', icon: BookOpen, action: 'skk-learning', color: WI.purple },
  { label: 'Jelajah', sub: 'Destinasi', icon: Compass, action: 'tourism', color: WI.green },
  { label: 'Verifikasi', sub: 'Cek KTA', icon: QrCode, action: 'kta-verification', color: WI.pink },
];

const isApproved = (item: ContentItem) =>
  String(item.status || '').trim().toUpperCase() === 'APPROVED';

const validHttpUrl = (value?: string) => {
  const url = String(value || '').trim();
  return /^https?:\/\//i.test(url) ? url : '';
};

const platformLabel = (value?: string) => {
  const url = validHttpUrl(value);
  if (!url) return 'Warta SAKA';

  try {
    const host = new URL(url).hostname.toLowerCase().replace(/^www\./, '');
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'Instagram';
    if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'TikTok';
    if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') return 'YouTube';
    return host;
  } catch {
    return 'Warta SAKA';
  }
};

const dateLabel = (value?: string) => {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return new Intl.DateTimeFormat('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
};

const ContentThumbnail: React.FC<{ src?: string; title: string }> = ({ src, title }) => {
  const [failed, setFailed] = useState(false);
  const image = validHttpUrl(src);

  if (!image || failed) {
    return (
      <div className="grid h-full min-h-[170px] place-items-center bg-slate-50 text-slate-300">
        <Newspaper className="h-10 w-10" aria-hidden="true" />
      </div>
    );
  }

  return (
    <img
      src={image}
      alt={title ? `Thumbnail ${title}` : 'Thumbnail Warta SAKA'}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className="h-full min-h-[170px] w-full object-cover"
    />
  );
};

export const PublicHomePage: React.FC = () => {
  const { setActiveView, setLoginModalOpen } = useUIStore();
  const { isAuthenticated, currentUser } = useAuthStore();
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPublicContent = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const response = await contentApi.list();
      const rows = Array.isArray(response?.data) ? response.data : [];
      setContents(
        rows
          .filter(isApproved)
          .sort((a, b) => {
            const aTime = new Date(String(a.approved_at || a.created_at || 0)).getTime();
            const bTime = new Date(String(b.approved_at || b.created_at || 0)).getTime();
            return (Number.isFinite(bTime) ? bTime : 0) - (Number.isFinite(aTime) ? aTime : 0);
          })
      );
    } catch {
      setContents([]);
      setError('Warta SAKA belum dapat dimuat dari server. Periksa koneksi lalu coba lagi.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicContent();
  }, [loadPublicContent]);

  const dashboard = () => {
    if (!isAuthenticated) return setLoginModalOpen(true);
    const role = String(currentUser?.role || '');
    setActiveView(role.includes('ADMIN') ? 'admin-portal' : 'membership');
  };

  const go = (action: string) => (action === 'LOGIN' ? dashboard() : setActiveView(action));

  return (
    <div className="bg-white">
      <section className="relative min-h-[390px] overflow-hidden bg-gradient-to-br from-[#0B2F5B] via-[#07568A] to-[#169CD8] sm:min-h-[480px] lg:min-h-[540px]">
        <div className="absolute inset-0 opacity-20" aria-hidden="true">
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full border-[48px] border-white/30" />
          <div className="absolute -bottom-40 right-1/4 h-[28rem] w-[28rem] rounded-full border-[64px] border-white/20" />
        </div>
        <div className="relative mx-auto flex min-h-[390px] max-w-[1440px] items-center px-5 py-12 sm:min-h-[480px] sm:px-8 lg:min-h-[540px] lg:px-12">
          <div className="max-w-2xl text-white">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.22em] backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Jelajah • Belajar • Berkarya
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Bersama <span className="text-[#FFD32A]">SAKA Pariwisata</span> Indonesia
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
              Informasi, karya, dan publikasi anggota SAKA Pariwisata dari tautan media sosial yang telah diverifikasi.
            </p>
            <div className="mt-5 flex gap-2 sm:mt-7">
              <button
                onClick={() => setActiveView('registration')}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#F7941D] px-4 py-3 text-xs font-black text-white shadow-lg sm:px-6 sm:text-sm"
              >
                Mulai <ArrowRight className="h-4 w-4" />
              </button>
              <button
                onClick={dashboard}
                className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#0B2F5B] shadow-lg sm:px-6 sm:text-sm"
              >
                {isAuthenticated ? 'Dashboard' : 'Masuk'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-5 max-w-[1120px] px-3 sm:-mt-8 sm:px-6">
        <div className="grid grid-cols-5 gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 sm:gap-4 sm:p-5">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                onClick={() => go(item.action)}
                className="group flex min-w-0 flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center hover:bg-slate-50 sm:p-3"
              >
                <span
                  className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-md transition group-hover:-translate-y-0.5 sm:h-14 sm:w-14"
                  style={{ backgroundColor: item.color }}
                >
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="text-[10px] font-black text-[#0B2F5B] sm:text-sm">{item.label}</span>
                <span className="hidden text-[10px] text-slate-400 sm:block">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-[#0B2F5B] sm:text-xl">Warta SAKA</h2>
            <p className="mt-1 text-xs leading-5 text-slate-500 sm:text-sm">
              Publikasi dari Instagram, TikTok, YouTube, dan sumber lain yang telah disetujui admin.
            </p>
          </div>
          <button
            onClick={() => setActiveView('content')}
            className="text-xs font-bold text-[#169CD8] hover:underline"
          >
            Lihat semua
          </button>
        </div>

        <div className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 py-12 text-sm text-slate-500">
              <LoaderCircle className="h-4 w-4 animate-spin" /> Memuat Warta SAKA dari GAS…
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-8 text-center text-sm text-amber-900">
              <p>{error}</p>
              <button
                onClick={() => void loadPublicContent()}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 font-bold shadow-sm"
              >
                <RefreshCw className="h-4 w-4" /> Coba lagi
              </button>
            </div>
          ) : contents.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center">
              <Newspaper className="mx-auto h-9 w-9 text-slate-300" />
              <p className="mt-3 text-sm font-semibold text-slate-700">Belum ada Warta SAKA yang dipublikasikan.</p>
              <p className="mt-1 text-xs text-slate-500">Kiriman akan tampil di sini setelah disetujui admin.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {contents.map((item) => {
                const sourceUrl = validHttpUrl(item.url);
                const date = dateLabel(item.approved_at || item.created_at);
                return (
                  <article
                    key={item.id}
                    className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <div className="h-[190px] overflow-hidden bg-slate-50">
                      <ContentThumbnail src={item.thumbnail_url} title={item.title} />
                    </div>
                    <div className="p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="rounded-full border border-blue-100 bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">
                          {String(item.content_type || 'WARTA').replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700">Disetujui</span>
                      </div>
                      <h3 className="mt-3 line-clamp-2 break-words text-sm font-black text-[#0B2F5B]">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-2 line-clamp-3 break-words text-xs leading-5 text-slate-600">
                          {item.description}
                        </p>
                      )}
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
                        <span>{item.member_name || 'Anggota SAKA Pariwisata'}</span>
                        {date && <span>{date}</span>}
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-3">
                        <span className="truncate text-[11px] font-semibold text-slate-500">
                          {platformLabel(sourceUrl)}
                        </span>
                        {sourceUrl ? (
                          <a
                            href={sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-[#169CD8] hover:underline"
                          >
                            Buka sumber <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400">Sumber tidak tersedia</span>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      <section className="mx-4 mb-7 overflow-hidden rounded-[24px] bg-[#0B2F5B] px-5 py-5 text-white sm:mx-auto sm:max-w-[1160px] sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs font-bold text-blue-200">Siap mulai?</div>
            <h2 className="mt-1 text-lg font-black sm:text-2xl">Jadi bagian dari SAKA Pariwisata</h2>
          </div>
          <button
            onClick={() => setActiveView('registration')}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F7941D] sm:h-auto sm:w-auto sm:px-5 sm:py-3"
          >
            <ArrowRight className="h-5 w-5" />
            <span className="hidden sm:ml-2 sm:inline sm:text-sm sm:font-black">Daftar</span>
          </button>
        </div>
      </section>
    </div>
  );
};

export default PublicHomePage;
