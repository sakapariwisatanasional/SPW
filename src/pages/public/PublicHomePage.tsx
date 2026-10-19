import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Compass,
  CreditCard,
  MapPin,
  QrCode,
  Sparkles,
  UserPlus,
  ShoppingBag,
  AlertCircle,
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';
import { contentApi, ContentItem } from '../../../services/api/content.api';
import { tourismApi, TourPackage } from '../../../services/api/tourism.api';
import { commerceApi, Product } from '../../../services/api/commerce.api';

const WI = {
  blue: '#169CD8', green: '#63B32E', purple: '#6F3BC5', orange: '#F7941D', pink: '#EC2F78', navy: '#0B2F5B',
};

const HERO_IMAGE = 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=2200&q=86';

const shortcuts = [
  { label: 'Daftar', sub: 'Anggota baru', icon: UserPlus, action: 'registration', color: WI.orange },
  { label: 'Masuk', sub: 'Dashboard', icon: CreditCard, action: 'LOGIN', color: WI.blue },
  { label: 'SKK', sub: 'Belajar', icon: BookOpen, action: 'skk-learning', color: WI.purple },
  { label: 'Jelajah', sub: 'Destinasi', icon: Compass, action: 'tourism', color: WI.green },
  { label: 'Verifikasi', sub: 'Cek KTA', icon: QrCode, action: 'kta-verification', color: WI.pink },
];

type PublicEvent = ContentItem & {
  tanggal_mulai?: string; start_date?: string; event_date?: string; date?: string;
  lokasi?: string; location?: string; image_url?: string;
};

const PUBLIC_STATUSES = new Set(['PUBLISHED', 'APPROVED', 'ACTIVE']);
const isPublicStatus = (status: unknown) => {
  const value = String(status || '').trim().toUpperCase();
  return PUBLIC_STATUSES.has(value);
};
const isEvent = (item: ContentItem) => ['EVENT', 'EVENTS', 'AGENDA', 'KEGIATAN', 'ACARA'].includes(String(item.content_type || '').trim().toUpperCase());
const imageUrl = (value: unknown) => { const url = String(value || '').trim(); return /^https?:\/\//i.test(url) ? url : ''; };
const money = (value: unknown) => { const n = Number(value); return n > 0 && Number.isFinite(n) ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n) : 'Hubungi anggota'; };
const dateLabel = (value: unknown) => { if (!value) return ''; const d = new Date(String(value)); return Number.isNaN(d.getTime()) ? String(value) : new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short' }).format(d); };

export const PublicHomePage: React.FC = () => {
  const { setActiveView, setLoginModalOpen } = useUIStore();
  const { isAuthenticated, currentUser } = useAuthStore();
  const [events, setEvents] = useState<PublicEvent[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ events?: string; packages?: string; products?: string }>({});

  const loadPublicData = useCallback(async () => {
    setLoading(true);
    setErrors({});
    const results = await Promise.allSettled([contentApi.list(), tourismApi.listPackages({ limit: 6 }), commerceApi.listProducts({ limit: 6 })]);
    const nextErrors: { events?: string; packages?: string; products?: string } = {};
    const [eventResult, packageResult, productResult] = results;
    if (eventResult.status === 'fulfilled') {
      const rows = Array.isArray(eventResult.value?.data) ? eventResult.value.data as PublicEvent[] : [];
      setEvents(rows.filter((item) => isPublicStatus(item.status) && isEvent(item)).sort((a, b) => {
        const da = new Date(String(a.tanggal_mulai || a.start_date || a.event_date || a.created_at || 0)).getTime();
        const db = new Date(String(b.tanggal_mulai || b.start_date || b.event_date || b.created_at || 0)).getTime();
        return (Number.isFinite(da) ? da : 0) - (Number.isFinite(db) ? db : 0);
      }).slice(0, 6));
    } else { setEvents([]); nextErrors.events = 'Kegiatan belum dapat dimuat dari GAS.'; }
    if (packageResult.status === 'fulfilled') {
      const rows = Array.isArray(packageResult.value?.data) ? packageResult.value.data : [];
      setPackages(rows.filter((item) => isPublicStatus(item.status)).slice(0, 6));
    } else { setPackages([]); nextErrors.packages = 'Paket wisata belum dapat dimuat dari GAS.'; }
    if (productResult.status === 'fulfilled') {
      const rows = Array.isArray(productResult.value?.data) ? productResult.value.data : [];
      setProducts(rows.filter((item) => isPublicStatus(item.status)).slice(0, 6));
    } else { setProducts([]); nextErrors.products = 'Produk anggota belum dapat dimuat dari GAS.'; }
    setErrors(nextErrors);
    setLoading(false);
  }, []);

  useEffect(() => { void loadPublicData(); }, [loadPublicData]);

  const dashboard = () => {
    if (!isAuthenticated) return setLoginModalOpen(true);
    const role = String(currentUser?.role || '');
    setActiveView(role.includes('ADMIN') ? 'admin-portal' : 'membership');
  };

  const go = (action: string) => action === 'LOGIN' ? dashboard() : setActiveView(action);

  return (
    <div className="bg-white">
      <section className="relative h-[430px] overflow-hidden sm:h-[570px] lg:h-[650px]">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMAGE})` }} />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(3,40,79,.96)_0%,rgba(4,82,137,.78)_48%,rgba(0,0,0,.12)_100%)]" />
        <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-5 sm:px-8 lg:px-12">
          <div className="max-w-2xl pb-9 text-white sm:pb-0">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[.22em] backdrop-blur-md sm:text-xs">
              <Sparkles className="h-3.5 w-3.5 text-yellow-300" /> Jelajah • Belajar • Berkarya
            </div>
            <h1 className="mt-4 text-[34px] font-black leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
              Bersama <span className="text-[#FFD32A]">SAKA Pariwisata</span> Indonesia
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
              Identitas, SKK, kegiatan dan jejaring pariwisata dalam satu aplikasi.
            </p>
            <div className="mt-5 flex gap-2 sm:mt-7">
              <button onClick={() => setActiveView('registration')} className="inline-flex items-center gap-2 rounded-2xl bg-[#F7941D] px-4 py-3 text-xs font-black text-white shadow-lg sm:px-6 sm:text-sm">
                Mulai <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={dashboard} className="rounded-2xl bg-white px-4 py-3 text-xs font-black text-[#0B2F5B] shadow-lg sm:px-6 sm:text-sm">
                {isAuthenticated ? 'Dashboard' : 'Masuk'}
              </button>
            </div>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* Icon-first quick actions. On phones this replaces large text cards. */}
      <section className="relative z-10 mx-auto -mt-5 max-w-[1120px] px-3 sm:-mt-8 sm:px-6">
        <div className="grid grid-cols-5 gap-2 rounded-[24px] border border-slate-200 bg-white p-3 shadow-xl shadow-slate-900/10 sm:gap-4 sm:p-5">
          {shortcuts.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.label} onClick={() => go(item.action)} className="group flex min-w-0 flex-col items-center gap-1.5 rounded-2xl p-1.5 text-center hover:bg-slate-50 sm:p-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl text-white shadow-md transition group-hover:-translate-y-0.5 sm:h-14 sm:w-14" style={{ backgroundColor: item.color }}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <span className="text-[10px] font-black text-[#0B2F5B] sm:text-sm">{item.label}</span>
                <span className="hidden text-[10px] text-slate-400 sm:block">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-8 sm:px-6 sm:pt-12">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[#0B2F5B]">Kegiatan anggota</h2><p className="mt-1 text-xs text-slate-500">Postingan acara yang dipublikasikan melalui aplikasi.</p></div><button onClick={() => setActiveView('content')} className="text-xs font-bold text-[#169CD8]">Lihat semua</button></div>
        <div className="mt-4">
          {errors.events ? <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><span className="flex items-center gap-2"><AlertCircle className="h-4 w-4" />{errors.events}</span><button onClick={() => void loadPublicData()} className="font-bold">Coba lagi</button></div> : loading ? <p className="py-8 text-sm text-slate-500">Memuat kegiatan dari GAS…</p> : events.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Belum ada postingan kegiatan yang dipublikasikan.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((item) => { const image = imageUrl(item.thumbnail_url || item.image_url); const date = dateLabel(item.tanggal_mulai || item.start_date || item.event_date || item.date); return <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="relative h-36 bg-slate-100">{image ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><CalendarDays className="h-9 w-9" /></div>}{date && <span className="absolute left-3 top-3 rounded-xl bg-white px-2 py-1 text-[10px] font-black text-[#0B2F5B] shadow">{date}</span>}</div><div className="p-4"><h3 className="line-clamp-2 text-sm font-black text-[#0B2F5B]">{item.title}</h3>{item.description && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.description}</p>}<p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3 w-3" />{item.lokasi || item.location || 'Lokasi belum dicantumkan'}</p>{item.member_name && <p className="mt-2 text-[10px] text-slate-400">Oleh {item.member_name}</p>}</div></article>; })}
          </div>}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pt-9 sm:px-6 sm:pt-12">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[#0B2F5B]">Paket wisata anggota</h2><p className="mt-1 text-xs text-slate-500">Paket wisata yang dipublikasikan oleh anggota.</p></div><button onClick={() => setActiveView('tourism')} className="text-xs font-bold text-[#169CD8]">Jelajahi</button></div>
        <div className="mt-4">
          {errors.packages ? <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><span>{errors.packages}</span><button onClick={() => void loadPublicData()} className="font-bold">Coba lagi</button></div> : loading ? <p className="py-8 text-sm text-slate-500">Memuat paket wisata dari GAS…</p> : packages.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Belum ada paket wisata yang disetujui untuk ditampilkan.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {packages.map((item) => { const image = imageUrl(item.foto_utama); return <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-36 bg-slate-100">{image ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><Compass className="h-9 w-9" /></div>}</div><div className="p-4"><h3 className="line-clamp-2 text-sm font-black text-[#0B2F5B]">{item.nama_paket}</h3>{item.deskripsi && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.deskripsi}</p>}<p className="mt-2 flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3 w-3" />{item.lokasi || 'Lokasi belum dicantumkan'}</p><div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-black text-[#0B2F5B]">{money(item.harga)}</span>{item.submitted_by_name && <span className="text-[10px] text-slate-400">Anggota: {item.submitted_by_name}</span>}</div></div></article>; })}
          </div>}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-9 sm:px-6 sm:py-12">
        <div className="flex items-center justify-between gap-3"><div><h2 className="text-lg font-black text-[#0B2F5B]">Produk anggota</h2><p className="mt-1 text-xs text-slate-500">Produk dan cinderamata karya anggota SAKA Pariwisata.</p></div><button onClick={() => setActiveView('commerce')} className="text-xs font-bold text-[#169CD8]">Lihat produk</button></div>
        <div className="mt-4">
          {errors.products ? <div className="flex items-center justify-between gap-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900"><span>{errors.products}</span><button onClick={() => void loadPublicData()} className="font-bold">Coba lagi</button></div> : loading ? <p className="py-8 text-sm text-slate-500">Memuat produk dari GAS…</p> : products.length === 0 ? <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-8 text-center text-sm text-slate-500">Belum ada produk anggota yang dipublikasikan.</div> : <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((item) => { const image = imageUrl(item.foto_utama); return <article key={item.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="h-36 bg-slate-100">{image ? <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center text-slate-300"><ShoppingBag className="h-9 w-9" /></div>}</div><div className="p-4"><div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{item.kategori || 'Produk anggota'}</div><h3 className="mt-1 line-clamp-2 text-sm font-black text-[#0B2F5B]">{item.nama_produk}</h3>{item.deskripsi && <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{item.deskripsi}</p>}<div className="mt-3 flex items-center justify-between gap-2"><span className="text-sm font-black text-[#0B2F5B]">{money(item.harga)}</span>{Number(item.stok) > 0 ? <span className="text-[10px] text-emerald-700">Stok {item.stok}</span> : <span className="text-[10px] text-slate-400">Hubungi penjual</span>}</div></div></article>; })}
          </div>}
        </div>
      </section>

      <section className="mx-4 mb-7 overflow-hidden rounded-[24px] bg-[#0B2F5B] px-5 py-5 text-white sm:mx-auto sm:max-w-[1160px] sm:px-8 sm:py-8">
        <div className="flex items-center justify-between gap-4">
          <div><div className="text-xs font-bold text-blue-200">Siap mulai?</div><h2 className="mt-1 text-lg font-black sm:text-2xl">Jadi bagian dari SAKA Pariwisata</h2></div>
          <button onClick={() => setActiveView('registration')} className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F7941D] sm:h-auto sm:w-auto sm:px-5 sm:py-3"><ArrowRight className="h-5 w-5" /><span className="hidden sm:ml-2 sm:inline sm:text-sm sm:font-black">Daftar</span></button>
        </div>
      </section>
    </div>
  );
};

export default PublicHomePage;
