import React from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Camera,
  CheckCircle2,
  Compass,
  CreditCard,
  Globe2,
  GraduationCap,
  Hotel,
  Leaf,
  MapPin,
  Megaphone,
  QrCode,
  ShoppingBag,
  Sparkles,
  Utensils,
  UserPlus,
  Users,
  Waves,
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';

const WI = {
  blue: '#169CD8',
  green: '#63B32E',
  purple: '#6F3BC5',
  orange: '#F7941D',
  pink: '#EC2F78',
  navy: '#0B2F5B',
};

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&w=2200&q=86';

const journeyCards = [
  {
    title: 'Saya ingin Bergabung',
    description: 'Daftar menjadi anggota SAKA Pariwisata',
    icon: UserPlus,
    action: 'registration',
    color: WI.orange,
    image:
      'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Saya sudah Anggota',
    description: 'Masuk ke dashboard dan lanjutkan perjalananmu',
    icon: CreditCard,
    action: 'LOGIN',
    color: '#1476D4',
    image:
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Saya ingin Belajar SKK',
    description: 'Tingkatkan keterampilan di bidang pariwisata',
    icon: BookOpen,
    action: 'skk-learning',
    color: WI.purple,
    image:
      'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=900&q=80',
  },
  {
    title: 'Saya ingin Jelajahi Indonesia',
    description: 'Temukan destinasi, kegiatan dan karya anggota',
    icon: Compass,
    action: 'tourism',
    color: '#1F9D3A',
    image:
      'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&w=900&q=80',
  },
];

const stats = [
  { label: 'Anggota Aktif', value: '12.480', icon: Users, color: WI.blue },
  { label: 'Kwarda Aktif', value: '34', icon: Globe2, color: WI.green },
  { label: 'SKK Tersedia', value: '23', icon: Award, color: WI.orange },
  { label: 'Kegiatan', value: '186', icon: CalendarDays, color: WI.pink },
];

const events = [
  {
    date: '18',
    month: 'Okt',
    title: 'Aksi Bersih Pantai Kuta Mandalika',
    place: 'Lombok, NTB',
    participants: '120 peserta',
    image:
      'https://images.unsplash.com/photo-1535139262971-c51845709a48?auto=format&fit=crop&w=900&q=80',
  },
  {
    date: '25',
    month: 'Okt',
    title: 'Pelatihan Pemanduan Wisata Budaya',
    place: 'Yogyakarta, DIY',
    participants: '80 peserta',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=900&q=80',
  },
  {
    date: '02',
    month: 'Nov',
    title: 'Jelajah Geopark Batur',
    place: 'Bangli, Bali',
    participants: '60 peserta',
    image:
      'https://images.unsplash.com/photo-1533669955142-6a73332af4db?auto=format&fit=crop&w=900&q=80',
  },
];

const destinations = [
  {
    name: 'Labuan Bajo',
    region: 'Nusa Tenggara Timur',
    image:
      'https://images.unsplash.com/photo-1570789210967-2cac24afeb00?auto=format&fit=crop&w=1200&q=84',
  },
  {
    name: 'Raja Ampat',
    region: 'Papua Barat Daya',
    image:
      'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?auto=format&fit=crop&w=700&q=82',
  },
  {
    name: 'Danau Toba',
    region: 'Sumatera Utara',
    image:
      'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=700&q=82',
  },
  {
    name: 'Borobudur',
    region: 'Jawa Tengah',
    image:
      'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?auto=format&fit=crop&w=700&q=82',
  },
];

const krida = [
  { name: 'Pemanduan Wisata', icon: Compass, color: WI.blue },
  { name: 'Kuliner', icon: Utensils, color: WI.orange },
  { name: 'Cinderamata', icon: ShoppingBag, color: WI.pink },
  { name: 'Perhotelan', icon: Hotel, color: WI.green },
  { name: 'Perjalanan Wisata', icon: Camera, color: WI.purple },
  { name: 'Konservasi Alam', icon: Leaf, color: '#2FA34A' },
  { name: 'Bahasa Asing', icon: Globe2, color: '#1677E8' },
  { name: 'Promosi Pariwisata', icon: Megaphone, color: WI.orange },
];

export const PublicHomePage: React.FC = () => {
  const { setActiveView, setLoginModalOpen } = useUIStore();
  const { isAuthenticated, currentUser } = useAuthStore();

  const goToDashboard = () => {
    if (!isAuthenticated) {
      setLoginModalOpen(true);
      return;
    }

    const role = String(currentUser?.role || '');
    setActiveView(role.includes('ADMIN') ? 'admin-portal' : 'membership');
  };

  const handleJourney = (action: string) => {
    if (action === 'LOGIN') {
      goToDashboard();
      return;
    }
    setActiveView(action);
  };

  return (
    <div className="bg-white">
      {/* HERO */}
      <section className="relative min-h-[650px] overflow-hidden lg:min-h-[700px]">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,45,89,0.96)_0%,rgba(3,74,129,0.84)_38%,rgba(4,67,110,0.28)_68%,rgba(0,0,0,0.08)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#052C56]/80 via-transparent to-transparent" />

        <div className="relative mx-auto flex min-h-[650px] max-w-[1440px] items-center px-5 py-16 sm:px-8 lg:min-h-[700px] lg:px-12">
          <div className="max-w-3xl pt-4 text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.25em] backdrop-blur-md">
              <Sparkles className="h-4 w-4 text-[#F7C948]" />
              Jelajahi • Belajar • Berkarya
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
              Bersama{' '}
              <span className="text-[#FFD32A]">SAKA Pariwisata</span>
              <br />Indonesia
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-blue-50 sm:text-lg">
              Satu platform untuk mengembangkan keterampilan, membangun jejaring, berkarya,
              dan menjelajahi kekayaan pariwisata Indonesia bersama komunitas SAKA Pariwisata.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => setActiveView('registration')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#F7941D] px-6 py-4 text-sm font-black text-white shadow-xl shadow-orange-950/25 transition hover:-translate-y-0.5 hover:bg-[#E9830B]"
              >
                Mulai Perjalanan Saya
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                type="button"
                onClick={goToDashboard}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-black text-[#0B2F5B] shadow-xl transition hover:-translate-y-0.5 hover:bg-slate-50"
              >
                <CreditCard className="h-4 w-4 text-[#169CD8]" />
                {isAuthenticated ? 'Buka Dashboard Saya' : 'Saya Sudah Anggota — Masuk'}
              </button>

              <button
                type="button"
                onClick={() => setActiveView('kta-verification')}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-[#061C34]/40 px-5 py-4 text-sm font-bold text-white backdrop-blur-md transition hover:bg-white/15"
              >
                <QrCode className="h-4 w-4" />
                Verifikasi KTA
              </button>
            </div>

            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-blue-100">
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#7ED957]" /> Identitas anggota digital
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#7ED957]" /> 23 SKK pembelajaran
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-[#7ED957]" /> Jejaring nasional
              </span>
            </div>
          </div>
        </div>

        {/* Wave ribbons */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 sm:h-28">
          <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="h-full w-full">
            <path d="M0 78 C220 135 390 25 640 75 C875 122 1050 60 1440 86 L1440 140 L0 140 Z" fill="#169CD8" />
            <path d="M0 91 C210 136 430 45 650 90 C895 138 1110 67 1440 100 L1440 140 L0 140 Z" fill="#63B32E" />
            <path d="M0 104 C235 142 430 65 690 108 C910 143 1155 75 1440 113 L1440 140 L0 140 Z" fill="#F7941D" />
            <path d="M0 115 C260 146 475 85 700 119 C920 149 1170 87 1440 123 L1440 140 L0 140 Z" fill="#EC2F78" />
            <path d="M0 127 C260 150 500 106 720 130 C940 151 1180 108 1440 133 L1440 140 L0 140 Z" fill="#6F3BC5" />
          </svg>
        </div>
      </section>

      {/* GUIDED START */}
      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#0B2F5B]">
              Apa yang ingin kamu lakukan?
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#0B2F5B] sm:text-4xl">
              Mulai dari sini
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
              Temukan jalur sesuai kebutuhanmu dan jadilah bagian dari perjalanan besar
              SAKA Pariwisata Indonesia.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('skk-learning')}
            className="inline-flex items-center gap-2 text-sm font-black text-[#1476D4] hover:underline"
          >
            Lihat Semua Fitur <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {journeyCards.map((card) => {
            const Icon = card.icon;
            return (
              <button
                key={card.title}
                type="button"
                onClick={() => handleJourney(card.action)}
                className="group relative min-h-[260px] overflow-hidden rounded-[26px] text-left shadow-lg transition duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
              >
                <img src={card.image} alt="" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${card.color}22 0%, ${card.color}E8 100%)` }} />
                <div className="relative flex h-full min-h-[260px] flex-col justify-between p-5 text-white">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/95 shadow-lg">
                    <Icon className="h-6 w-6" style={{ color: card.color }} />
                  </div>
                  <div>
                    <h3 className="max-w-[220px] text-2xl font-black leading-tight">{card.title}</h3>
                    <p className="mt-2 max-w-[250px] text-sm leading-5 text-white/90">{card.description}</p>
                    <span className="mt-4 grid h-9 w-9 place-items-center rounded-full bg-white text-[#0B2F5B] transition group-hover:translate-x-1">
                      <ArrowRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* STATS */}
      <section className="relative overflow-hidden border-y border-blue-100 bg-[#F6FAFF]">
        <div className="absolute -left-20 top-0 h-44 w-44 rounded-full bg-[#63B32E]/10 blur-3xl" />
        <div className="absolute -right-16 bottom-0 h-44 w-44 rounded-full bg-[#EC2F78]/10 blur-3xl" />

        <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[1.1fr_2fr] lg:px-12">
          <div className="self-center">
            <h2 className="text-3xl font-black leading-tight text-[#0B2F5B]">SAKA Pariwisata<br />dalam Angka</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-500">
              Bersama anggota di seluruh Indonesia untuk pariwisata yang lebih maju dan berkelanjutan.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {stats.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-2xl border border-white bg-white p-5 text-center shadow-sm">
                  <Icon className="mx-auto h-7 w-7" style={{ color: item.color }} />
                  <div className="mt-3 text-2xl font-black text-[#0B2F5B]">{item.value}</div>
                  <div className="mt-1 text-[11px] font-bold text-slate-500">{item.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* EVENTS + DESTINATIONS */}
      <section className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid gap-10 xl:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black text-[#0B2F5B] sm:text-2xl">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-sky-50 text-[#169CD8]"><CalendarDays className="h-5 w-5" /></span>
                Kegiatan Terdekat
              </h2>
              <button onClick={() => setActiveView('content')} className="inline-flex items-center gap-1.5 text-xs font-black text-[#1476D4] hover:underline">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {events.map((event) => (
                <article key={event.title} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                  <div className="relative h-40 overflow-hidden">
                    <img src={event.image} alt={event.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    <div className="absolute left-3 top-3 rounded-xl bg-white px-3 py-2 text-center shadow-lg">
                      <div className="text-lg font-black leading-none text-[#0B2F5B]">{event.date}</div>
                      <div className="mt-1 text-[10px] font-black uppercase text-slate-500">{event.month}</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="min-h-[42px] text-sm font-black leading-5 text-[#0B2F5B]">{event.title}</h3>
                    <div className="mt-3 space-y-1.5 text-[11px] text-slate-500">
                      <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-[#169CD8]" />{event.place}</div>
                      <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 text-[#6F3BC5]" />{event.participants}</div>
                    </div>
                    <span className="mt-3 inline-flex rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-black text-green-700">Terbuka</span>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div>
            <div className="mb-5 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-black text-[#0B2F5B] sm:text-2xl">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-pink-50 text-[#EC2F78]"><MapPin className="h-5 w-5" /></span>
                Destinasi Pilihan
              </h2>
              <button onClick={() => setActiveView('tourism')} className="inline-flex items-center gap-1.5 text-xs font-black text-[#1476D4] hover:underline">
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1.6fr_1fr]">
              <button
                type="button"
                onClick={() => setActiveView('tourism')}
                className="group relative min-h-[330px] overflow-hidden rounded-[24px] text-left shadow-lg"
              >
                <img src={destinations[0].image} alt={destinations[0].name} className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <h3 className="text-2xl font-black">{destinations[0].name}</h3>
                  <p className="mt-1 text-xs text-white/80">{destinations[0].region}</p>
                  <span className="mt-4 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-black text-[#0B2F5B]">
                    Jelajahi Destinasi <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </button>

              <div className="space-y-3">
                {destinations.slice(1).map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => setActiveView('tourism')}
                    className="flex w-full items-center gap-3 rounded-2xl bg-slate-50 p-2 text-left transition hover:bg-blue-50"
                  >
                    <img src={item.image} alt={item.name} className="h-[82px] w-24 rounded-xl object-cover" />
                    <div>
                      <div className="text-sm font-black text-[#0B2F5B]">{item.name}</div>
                      <div className="mt-1 text-[10px] leading-4 text-slate-500">{item.region}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* KRIDA */}
      <section className="border-y border-slate-100 bg-gradient-to-b from-white to-[#F7FAFF]">
        <div className="mx-auto max-w-[1440px] px-5 py-14 sm:px-8 lg:px-12 lg:py-16">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-[#0B2F5B]">
                <span className="grid h-9 w-9 place-items-center rounded-full bg-purple-50 text-[#6F3BC5]"><GraduationCap className="h-5 w-5" /></span>
                Krida di SAKA Pariwisata
              </h2>
              <p className="mt-2 text-sm text-slate-500">Pilih bidang minatmu dan kembangkan potensimu.</p>
            </div>
            <button onClick={() => setActiveView('skk-learning')} className="hidden items-center gap-1.5 text-xs font-black text-[#1476D4] hover:underline sm:inline-flex">
              Lihat Semua Krida <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="mt-9 grid grid-cols-2 gap-y-8 sm:grid-cols-4 lg:grid-cols-8">
            {krida.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => setActiveView('skk-learning')}
                  className="group flex flex-col items-center px-2 text-center"
                >
                  <div
                    className="grid h-14 w-14 place-items-center rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 transition group-hover:-translate-y-1 group-hover:shadow-lg"
                    style={{ color: item.color }}
                  >
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-3 text-[11px] font-black leading-4 text-[#0B2F5B]">{item.name}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden bg-[#063A73]">
        <div className="absolute inset-0 opacity-25" style={{ backgroundImage: `url(${HERO_IMAGE})`, backgroundSize: 'cover', backgroundPosition: 'center 55%' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-[#063A73] via-[#063A73]/90 to-[#063A73]/50" />
        <div className="relative mx-auto flex max-w-[1440px] flex-col gap-7 px-5 py-12 text-white sm:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div>
            <p className="text-sm font-semibold text-blue-100">Saatnya Jadi Bagian dari</p>
            <h2 className="mt-1 text-2xl font-black sm:text-3xl">Generasi Muda untuk Pariwisata Indonesia</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100">
              Daftar sekarang, lengkapi profilmu, dapatkan KTA digital, ikuti SKK, dan raih pencapaian bersama SAKA Pariwisata.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setActiveView('registration')}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#F7941D] px-6 py-4 text-sm font-black text-white shadow-xl transition hover:-translate-y-0.5 hover:bg-[#E9830B]"
          >
            Daftar Menjadi Anggota <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="h-1.5" style={{ background: `linear-gradient(90deg, ${WI.green}, ${WI.blue}, ${WI.purple}, ${WI.pink}, ${WI.orange})` }} />
      </section>

      {/* Mobile quick actions */}
      <div className="fixed inset-x-4 bottom-4 z-40 flex gap-2 rounded-2xl border border-white/60 bg-white/92 p-2 shadow-2xl backdrop-blur-xl sm:hidden">
        <button onClick={() => setActiveView('registration')} className="flex-1 rounded-xl bg-[#F7941D] px-3 py-3 text-xs font-black text-white">
          Bergabung
        </button>
        <button onClick={goToDashboard} className="flex-1 rounded-xl bg-[#169CD8] px-3 py-3 text-xs font-black text-white">
          {isAuthenticated ? 'Dashboard' : 'Masuk'}
        </button>
        <button onClick={() => setActiveView('kta-verification')} className="grid w-12 place-items-center rounded-xl bg-slate-100 text-[#0B2F5B]" aria-label="Verifikasi KTA">
          <QrCode className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PublicHomePage;
