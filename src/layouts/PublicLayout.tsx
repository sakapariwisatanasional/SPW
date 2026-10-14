import React, { useState } from 'react';
import {
  Menu,
  X,
  Search,
  LogIn,
  UserPlus,
  ChevronRight,
  Instagram,
  Youtube,
  Facebook,
} from 'lucide-react';
import { useUIStore } from '../stores/uiStore';

export interface PublicLayoutProps {
  children: React.ReactNode;
  activeNav?: string;
  onNavigate?: (navId: string) => void;
}

const COLORS = {
  blue: '#169CD8',
  green: '#63B32E',
  purple: '#6F3BC5',
  orange: '#F7941D',
  pink: '#EC2F78',
  navy: '#0B2F5B',
};

const NAV_ITEMS = [
  { id: 'home', label: 'Beranda' },
  { id: 'skk-learning', label: 'SKK' },
  { id: 'tourism', label: 'Destinasi' },
  { id: 'content', label: 'Berita' },
  { id: 'commerce', label: 'Karya & UMKM' },
  { id: 'kta-verification', label: 'Verifikasi KTA' },
];

export const PublicLayout: React.FC<PublicLayoutProps> = ({
  children,
  activeNav = 'home',
  onNavigate,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { setLoginModalOpen } = useUIStore();

  const go = (id: string) => {
    setMobileOpen(false);
    onNavigate?.(id);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 overflow-x-hidden">
      {/* Wonderful Indonesia color ribbon */}
      <div
        className="h-1.5 w-full"
        style={{
          background:
            `linear-gradient(90deg, ${COLORS.green} 0 19%, ${COLORS.purple} 19% 38%, ${COLORS.orange} 38% 58%, ${COLORS.blue} 58% 78%, ${COLORS.pink} 78% 100%)`,
        }}
      />

      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-xl shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => go('home')}
            className="group flex min-w-0 items-center gap-3 text-left"
            aria-label="Kembali ke Beranda SAKA Pariwisata"
          >
            {/* Abstract multicolor tourism mark, intentionally not a copy of the WI trademark */}
            <div className="relative h-11 w-12 shrink-0">
              <span className="absolute left-0 top-3 h-5 w-8 -rotate-12 rounded-full border-[5px] border-[#63B32E] border-r-transparent" />
              <span className="absolute left-4 top-0 h-8 w-5 rotate-[28deg] rounded-full border-[5px] border-[#6F3BC5] border-l-transparent" />
              <span className="absolute left-5 top-2 h-8 w-7 rotate-[48deg] rounded-full border-[5px] border-[#F7941D] border-b-transparent" />
              <span className="absolute left-6 top-2 h-10 w-8 rotate-[72deg] rounded-full border-[5px] border-[#169CD8] border-t-transparent" />
              <span className="absolute left-7 top-1 h-7 w-8 rotate-[98deg] rounded-full border-[5px] border-[#EC2F78] border-l-transparent" />
            </div>
            <div className="min-w-0 leading-tight">
              <div className="truncate text-[14px] font-black tracking-[0.08em] text-[#0B2F5B] sm:text-[15px]">
                SAKA PARIWISATA
              </div>
              <div className="text-[9px] font-bold tracking-[0.34em] text-slate-500 sm:text-[10px]">
                INDONESIA
              </div>
              <div className="hidden text-[9px] font-medium text-slate-400 sm:block">
                Jelajah • Belajar • Berkarya
              </div>
            </div>
          </button>

          <nav className="hidden items-center gap-1 lg:flex">
            {NAV_ITEMS.map((item) => {
              const active =
                activeNav === item.id ||
                (item.id === 'home' && (activeNav === '/' || activeNav === ''));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className={`relative rounded-xl px-3 py-2 text-sm font-semibold transition-all ${
                    active
                      ? 'text-[#0B2F5B]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#0B2F5B]'
                  }`}
                >
                  {item.label}
                  {active && (
                    <span
                      className="absolute inset-x-3 -bottom-[17px] h-[3px] rounded-full"
                      style={{
                        background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.green}, ${COLORS.orange}, ${COLORS.pink})`,
                      }}
                    />
                  )}
                </button>
              );
            })}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <button
              type="button"
              aria-label="Pencarian"
              className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-[#0B2F5B]"
            >
              <Search className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={() => setLoginModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-xl border-2 border-[#169CD8] bg-white px-4 py-2.5 text-sm font-bold text-[#0B5FA5] transition hover:bg-sky-50"
            >
              <LogIn className="h-4 w-4" />
              Masuk
            </button>
            <button
              type="button"
              onClick={() => go('registration')}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:-translate-y-0.5 hover:shadow-xl"
              style={{
                background: `linear-gradient(135deg, ${COLORS.blue}, #0B68C8)`,
              }}
            >
              <UserPlus className="h-4 w-4" />
              Daftar Sekarang
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-xl border border-slate-200 p-2.5 text-[#0B2F5B] lg:hidden"
            aria-label="Buka navigasi"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 shadow-xl lg:hidden">
            <div className="mx-auto max-w-[1440px] space-y-1">
              {NAV_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => go(item.id)}
                  className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-sm font-bold text-slate-700 hover:bg-slate-50"
                >
                  {item.label}
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </button>
              ))}
              <div className="grid grid-cols-2 gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => {
                    setMobileOpen(false);
                    setLoginModalOpen(true);
                  }}
                  className="rounded-xl border-2 border-[#169CD8] px-4 py-3 text-sm font-bold text-[#0B5FA5]"
                >
                  Masuk
                </button>
                <button
                  type="button"
                  onClick={() => go('registration')}
                  className="rounded-xl bg-[#169CD8] px-4 py-3 text-sm font-bold text-white"
                >
                  Daftar
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      <main>{children}</main>

      <footer className="relative overflow-hidden border-t border-slate-200 bg-white">
        <div
          className="absolute inset-x-0 top-0 h-1"
          style={{
            background:
              `linear-gradient(90deg, ${COLORS.green}, ${COLORS.purple}, ${COLORS.orange}, ${COLORS.blue}, ${COLORS.pink})`,
          }}
        />

        <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#169CD8] via-[#6F3BC5] to-[#EC2F78] shadow-md" />
                <div>
                  <div className="text-sm font-black tracking-[0.08em] text-[#0B2F5B]">SAKA PARIWISATA</div>
                  <div className="text-[10px] font-bold tracking-[0.28em] text-slate-500">INDONESIA</div>
                </div>
              </div>
              <p className="mt-4 max-w-md text-sm leading-6 text-slate-500">
                Platform digital SAKA Pariwisata untuk identitas anggota, pembelajaran SKK,
                kegiatan, karya, destinasi dan jejaring pariwisata Indonesia.
              </p>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#0B2F5B]">Tentang</div>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <button onClick={() => go('home')} className="block hover:text-[#169CD8]">Profil</button>
                <button onClick={() => go('skk-learning')} className="block hover:text-[#169CD8]">Krida & SKK</button>
                <button onClick={() => go('content')} className="block hover:text-[#169CD8]">Berita</button>
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#0B2F5B]">Jelajahi</div>
              <div className="mt-3 space-y-2 text-sm text-slate-500">
                <button onClick={() => go('tourism')} className="block hover:text-[#169CD8]">Destinasi</button>
                <button onClick={() => go('commerce')} className="block hover:text-[#169CD8]">Karya & UMKM</button>
                <button onClick={() => go('kta-verification')} className="block hover:text-[#169CD8]">Verifikasi KTA</button>
              </div>
            </div>

            <div>
              <div className="text-xs font-black uppercase tracking-wider text-[#0B2F5B]">Ikuti Kami</div>
              <div className="mt-3 flex gap-2">
                {[Instagram, Youtube, Facebook].map((Icon, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label="Media sosial"
                    className="grid h-9 w-9 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:-translate-y-0.5 hover:border-[#169CD8] hover:text-[#169CD8]"
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-col gap-2 border-t border-slate-200 pt-5 text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between">
            <span>© 2026 SAKA Pariwisata Indonesia. Seluruh hak cipta dilindungi.</span>
            <span>Jelajah • Belajar • Berkarya untuk Pariwisata Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default PublicLayout;
