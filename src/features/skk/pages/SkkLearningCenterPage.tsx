import React, { useMemo, useState } from 'react';
import {
  Compass,
  Megaphone,
  CalendarDays,
  Utensils,
  GraduationCap,
  Search,
  ChevronRight,
  Award,
} from 'lucide-react';
import { KRIDA_LIST } from '../../krida/data/kridaData';
import { useUIStore } from '../../../stores/uiStore';

const WI = ['#169CD8', '#F7941D', '#EC2F78', '#63B32E'];
const ICONS = [Compass, Megaphone, CalendarDays, Utensils];

export const SkkLearningCenterPage: React.FC = () => {
  const { setActiveView } = useUIStore();
  const [selected, setSelected] = useState<string>(() => String((KRIDA_LIST as any[])?.[0]?.id || 'pemandu'));
  const [search, setSearch] = useState('');

  const kridas = (KRIDA_LIST as any[]) || [];
  const activeKrida = kridas.find((k) => String(k.id) === selected) || kridas[0];

  const skkCodes = useMemo(() => {
    const list = Array.isArray(activeKrida?.skkCodes) ? activeKrida.skkCodes : [];
    const q = search.trim().toLowerCase();
    return list.filter((code: string) => !q || String(code).toLowerCase().includes(q));
  }, [activeKrida, search]);

  const openSkk = (code: string) => setActiveView(`skk-${String(code).toLowerCase()}`);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7FAFC] pb-5 sm:pb-10">
      <section className="bg-gradient-to-br from-[#48218A] via-[#6F3BC5] to-[#169CD8] px-4 pb-6 pt-5 text-white sm:px-6 sm:pb-9 sm:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-purple-100"><GraduationCap className="h-3.5 w-3.5" /> Learning Center</div>
              <h1 className="mt-1 text-2xl font-black sm:text-4xl">Belajar SKK</h1>
              <p className="mt-1 text-xs text-purple-100 sm:text-sm">Pilih Krida, lalu buka SKK yang kamu butuhkan.</p>
            </div>
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/12"><Award className="h-6 w-6" /></span>
          </div>

          <div className="mt-5 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-4 sm:overflow-visible">
            {kridas.map((krida, index) => {
              const Icon = ICONS[index % ICONS.length];
              const active = String(krida.id) === selected;
              const color = krida.warna || WI[index % WI.length];
              return (
                <button
                  key={String(krida.id)}
                  onClick={() => setSelected(String(krida.id))}
                  className={`min-w-[92px] rounded-2xl px-2 py-3 text-center transition sm:min-w-0 ${active ? 'bg-white text-[#0B2F5B] shadow-lg' : 'bg-white/10 text-white'}`}
                >
                  <span className="mx-auto grid h-10 w-10 place-items-center rounded-2xl text-white" style={{ backgroundColor: active ? color : 'rgba(255,255,255,.15)' }}><Icon className="h-5 w-5" /></span>
                  <div className="mt-1.5 line-clamp-1 text-[10px] font-black sm:text-xs">{String(krida.nama || krida.name || krida.slug || 'Krida').replace(/^Krida\s+/i, '')}</div>
                  <div className={`text-[9px] ${active ? 'text-slate-400' : 'text-white/65'}`}>{krida.totalSkk || (krida.skkCodes || []).length || 0} SKK</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-7">
        {activeKrida && (
          <div className="mb-4 rounded-[22px] border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wider" style={{ color: activeKrida.warna || '#6F3BC5' }}>{activeKrida.kode || 'KRIDA'}</div>
                <h2 className="mt-1 truncate text-base font-black text-[#0B2F5B] sm:text-xl">{activeKrida.nama || activeKrida.name}</h2>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{activeKrida.tagline || activeKrida.deskripsi || 'Kembangkan kecakapan pariwisata melalui SKK.'}</p>
              </div>
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500">{activeKrida.totalSkk || skkCodes.length} SKK</span>
            </div>
          </div>
        )}

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode SKK..." className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:border-[#6F3BC5]" />
        </div>

        {skkCodes.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm">SKK tidak ditemukan.</div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {skkCodes.map((code: string, index: number) => (
              <button
                key={code}
                onClick={() => openSkk(code)}
                className="group flex min-h-[92px] items-center justify-between gap-2 rounded-[20px] border border-slate-200 bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
              >
                <div>
                  <span className="grid h-8 w-8 place-items-center rounded-xl text-[10px] font-black text-white" style={{ backgroundColor: activeKrida?.warna || WI[index % WI.length] }}>{index + 1}</span>
                  <div className="mt-2 text-sm font-black text-[#0B2F5B]">{code}</div>
                  <div className="text-[9px] font-semibold text-slate-400">Buka materi</div>
                </div>
                <ChevronRight className="h-4 w-4 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#6F3BC5]" />
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default SkkLearningCenterPage;
