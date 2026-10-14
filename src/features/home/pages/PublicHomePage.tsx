import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Compass,
  CreditCard,
  Globe2,
  MapPin,
  QrCode,
  Sparkles,
  UserPlus,
  Users,
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';

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

const stats = [
  { label: 'Anggota', value: '12.480', icon: Users, color: WI.blue },
  { label: 'Kwarda', value: '34', icon: Globe2, color: WI.green },
  { label: 'SKK', value: '23', icon: Award, color: WI.orange },
  { label: 'Kegiatan', value: '186', icon: CalendarDays, color: WI.pink },
];

const events = [
  { title: 'Aksi Bersih Pantai Mandalika', place: 'Lombok, NTB', date: '18 Okt', image: 'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=800&q=80' },
  { title: 'Pelatihan Pemanduan Wisata', place: 'Yogyakarta, DIY', date: '25 Okt', image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80' },
  { title: 'Jelajah Geopark Batur', place: 'Bangli, Bali', date: '02 Nov', image: 'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=800&q=80' },
];

const destinations = [
  { name: 'Labuan Bajo', region: 'NTT', image: 'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=900&q=84' },
  { name: 'Raja Ampat', region: 'Papua Barat Daya', image: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=900&q=82' },
  { name: 'Danau Toba', region: 'Sumatera Utara', image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=900&q=82' },
];

export const PublicHomePage: React.FC = () => {
  const { setActiveView, setLoginModalOpen } = useUIStore();
  const { isAuthenticated, currentUser } = useAuthStore();

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

      <section className="mx-auto max-w-[1200px] px-4 py-7 sm:px-6 sm:py-10">
        <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4 sm:overflow-visible">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="flex min-w-[128px] items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 sm:min-w-0 sm:px-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white shadow-sm"><Icon className="h-4 w-4" style={{ color: item.color }} /></span>
                <div><div className="text-lg font-black text-[#0B2F5B]">{item.value}</div><div className="text-[10px] font-semibold text-slate-500">{item.label}</div></div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Horizontal cards: swipe, not vertical stack. */}
      <section className="mx-auto max-w-[1200px] px-4 pb-7 sm:px-6 sm:pb-12">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black text-[#0B2F5B]">Kegiatan terdekat</h2><button className="text-xs font-bold text-[#169CD8]">Lihat semua</button></div>
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {events.map((event) => (
            <article key={event.title} className="min-w-[78%] snap-start overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm sm:min-w-[310px]">
              <div className="relative h-32"><img src={event.image} alt="" className="h-full w-full object-cover" /><span className="absolute left-3 top-3 rounded-xl bg-white px-2 py-1 text-[10px] font-black text-[#0B2F5B] shadow">{event.date}</span></div>
              <div className="p-3"><h3 className="line-clamp-1 text-sm font-black text-[#0B2F5B]">{event.title}</h3><p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3 w-3" /> {event.place}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 pb-8 sm:px-6 sm:pb-14">
        <div className="flex items-center justify-between"><h2 className="text-lg font-black text-[#0B2F5B]">Destinasi pilihan</h2><button onClick={() => setActiveView('tourism')} className="text-xs font-bold text-[#169CD8]">Jelajahi</button></div>
        <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {destinations.map((d) => (
            <button key={d.name} onClick={() => setActiveView('tourism')} className="relative min-w-[72%] snap-start overflow-hidden rounded-2xl text-left sm:min-w-[300px]">
              <img src={d.image} alt={d.name} className="h-44 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />
              <div className="absolute bottom-0 p-4 text-white"><div className="text-base font-black">{d.name}</div><div className="text-[11px] text-white/80">{d.region}</div></div>
            </button>
          ))}
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
