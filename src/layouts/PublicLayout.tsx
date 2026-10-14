import React from 'react';
import {
  Home,
  Users,
  Compass,
  QrCode,
  Shapes,
  LogIn,
  UserPlus,
  Search,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

export interface PublicLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
}

const WI = {
  blue: '#169CD8',
  green: '#63B32E',
  purple: '#6F3BC5',
  orange: '#F7941D',
  pink: '#EC2F78',
  navy: '#0B2F5B',
};

const DESKTOP_NAV = [
  { id: 'home', label: 'Beranda' },
  { id: 'skk-learning', label: 'SKK' },
  { id: 'tourism', label: 'Destinasi' },
  { id: 'content', label: 'Berita' },
  { id: 'commerce', label: 'Karya & UMKM' },
  { id: 'kta-verification', label: 'Verifikasi' },
];

const MOBILE_NAV = [
  { id: 'home', label: 'Beranda', icon: Home },
  { id: 'registration', label: 'Anggota', icon: Users },
  { id: 'kta-verification', label: 'Cek KTA', icon: QrCode },
  { id: 'skk-learning', label: 'Krida', icon: Shapes },
  { id: 'tourism', label: 'Wisata', icon: Compass },
];

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  activeNav = 'home',
  onNavigate,
}) => {
  const { setLoginModalOpen } = useUIStore();

  const go = (id: string) => {
    onNavigate?.(id);
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isActive = (id: string) =>
    activeNav === id || (id === 'home' && (activeNav === '/' || activeNav === ''));

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-slate-900 pb-[78px] lg:pb-0">
      <div
        className="h-1 w-full"
        style={{
          background: `linear-gradient(90deg, ${WI.green}, ${WI.purple}, ${WI.orange}, ${WI.blue}, ${WI.pink})`,
        }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-3 px-3 sm:h-[72px] sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go('home')}
            className="flex min-w-0 items-center gap-2.5 text-left"
            aria-label="Beranda SAKA Pariwisata"
          >
            <div className="relative h-9 w-10 shrink-0 sm:h-11 sm:w-12">
              <span className="absolute left-0 top-3 h-4 w-7 -rotate-12 rounded-full border-[4px] border-[#63B32E] border-r-transparent sm:border-[5px]" />
              <span className="absolute left-3 top-0 h-7 w-5 rotate-[28deg] rounded-full border-[4px] border-[#6F3BC5] border-l-transparent sm:left-4 sm:h-8 sm:border-[5px]" />
              <span className="absolute left-4 top-1 h-7 w-6 rotate-[48deg] rounded-full border-[4px] border-[#F7941D] border-b-transparent sm:left-5 sm:top-2 sm:h-8 sm:w-7 sm:border-[5px]" />
              <span className="absolute left-5 top-1 h-8 w-7 rotate-[72deg] rounded-full border-[4px] border-[#169CD8] border-t-transparent sm:left-6 sm:top-2 sm:h-10 sm:w-8 sm:border-[5px]" />
              <span className="absolute left-6 top-0 h-6 w-7 rotate-[98deg] rounded-full border-[4px] border-[#EC2F78] border-l-transparent sm:left-7 sm:top-1 sm:h-7 sm:w-8 sm:border-[5px]" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[12px] font-black tracking-[0.08em] text-[#0B2F5B] sm:text-[15px]">SAKA PARIWISATA</div>
              <div className="text-[8px] font-bold tracking-[0.28em] text-slate-500 sm:text-[10px]">INDONESIA</div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {DESKTOP_NAV.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive(item.id) ? 'text-[#0B2F5B]' : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {isActive(item.id) && (
                  <span className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full bg-[#169CD8]" />
                )}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              aria-label="Cari"
              className="hidden rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 lg:inline-flex"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-[#0B2F5B] sm:h-auto sm:w-auto sm:px-4 sm:py-2.5 lg:border-2 lg:border-[#169CD8] lg:text-[#0B5FA5]"
              aria-label="Masuk"
            >
              <LogIn className="h-4 w-4" />
              <span className="hidden text-sm font-bold sm:ml-2 sm:inline">Masuk</span>
            </button>
            <button
              type="button"
              onClick={() => go('registration')}
              className="hidden items-center gap-2 rounded-xl bg-[#169CD8] px-4 py-2.5 text-sm font-bold text-white shadow-md sm:inline-flex"
            >
              <UserPlus className="h-4 w-4" /> Daftar
            </button>
          </div>
        </div>
      </header>

      <main>{children}</main>

      {/* Desktop footer only: mobile uses bottom navigation, so no long footer scroll. */}
      <footer className="hidden border-t border-slate-200 bg-white lg:block">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between px-8 py-7 text-sm text-slate-500">
          <div>
            <div className="font-black tracking-[0.08em] text-[#0B2F5B]">SAKA PARIWISATA INDONESIA</div>
            <div className="mt-1 text-xs">Jelajah • Belajar • Berkarya</div>
          </div>
          <div className="flex items-center gap-5 text-xs font-semibold">
            <button onClick={() => go('skk-learning')}>SKK</button>
            <button onClick={() => go('tourism')}>Destinasi</button>
            <button onClick={() => go('content')}>Berita</button>
            <button onClick={() => go('commerce')}>UMKM</button>
            <button onClick={() => go('kta-verification')}>Verifikasi</button>
          </div>
        </div>
      </footer>

      {/* Mobile bottom navigation: 5 shortcut utama sesuai kebutuhan pengguna HP. */}
      <nav className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-200 bg-white/95 px-1.5 pb-[max(6px,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-8px_30px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-lg grid-cols-5 gap-1">
          {MOBILE_NAV.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className={`flex min-h-[58px] flex-col items-center justify-center rounded-2xl px-0.5 text-[9px] font-bold leading-tight transition ${
                  active ? 'bg-sky-50 text-[#0B68C8]' : 'text-slate-500'
                }`}
                aria-label={item.label}
              >
                <Icon className={`mb-1 h-5 w-5 ${active ? 'stroke-[2.5]' : ''}`} />
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default PublicLayout;
