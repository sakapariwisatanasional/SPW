import React, { useMemo, useState } from 'react';
import {
  Compass,
  Megaphone,
  CalendarDays,
  Utensils,
  GraduationCap,
  Search,
  ChevronRight,
  BookOpen,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { KRIDA_LIST, SKK_MASTER_LIST } from '../../krida/data/kridaData';
import { useSkkSequentialAccess } from '../hooks/useSkkSequentialAccess';
import { useUIStore } from '../../../stores/uiStore';
import { useKridaStore } from '../../../stores/kridaStore';

const WI = ['#169CD8', '#F7941D', '#EC2F78', '#63B32E'];
const ICONS = [Compass, Megaphone, CalendarDays, Utensils];

export const SkkLearningCenterPage: React.FC = () => {
  const { setActiveView } = useUIStore();
  const { selectedLevelTab, setSelectedLevelTab, setSelectedSkkCode } = useKridaStore();
  const level = selectedLevelTab.toUpperCase() as 'PURWA' | 'MADYA' | 'UTAMA';
  const setLevel = (next: 'PURWA' | 'MADYA' | 'UTAMA') => setSelectedLevelTab(next.toLowerCase() as 'purwa' | 'madya' | 'utama');
  const { isMember, loading, error, getAccess, canOpen } = useSkkSequentialAccess(level);
  const [selected, setSelected] = useState<string>(() => String((KRIDA_LIST as any[])?.[0]?.id || 'pemandu'));
  const [search, setSearch] = useState('');

  const kridas = (KRIDA_LIST as any[]) || [];
  const activeKrida = kridas.find((k) => String(k.id) === selected) || kridas[0];

  const skkItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    const activeKridaId = String(activeKrida?.id || '');
    const activeCodes = new Set(
      (Array.isArray(activeKrida?.skkCodes) ? activeKrida.skkCodes : [])
        .map((code: unknown) => String(code || '').trim().toUpperCase())
        .filter(Boolean)
    );

    return ((SKK_MASTER_LIST as any[]) || [])
      .filter((item: any) => {
        const code = String(item?.kode || item?.skk_code || item?.skkCode || '').trim().toUpperCase();
        const kridaId = String(item?.kridaId || item?.krida_id || '').trim();
        const belongsToKrida =
          (activeKridaId && kridaId === activeKridaId) ||
          (code && activeCodes.has(code));

        if (!belongsToKrida) return false;
        if (!q) return true;

        const name = String(item?.nama || item?.skk_nama || item?.title || '').toLowerCase();
        return code.toLowerCase().includes(q) || name.includes(q);
      })
      .sort((a: any, b: any) => {
        const aCode = String(a?.kode || a?.skk_code || a?.skkCode || '');
        const bCode = String(b?.kode || b?.skk_code || b?.skkCode || '');
        return aCode.localeCompare(bCode, 'id', { numeric: true });
      });
  }, [activeKrida, search]);

  // Membaca panduan berbeda dari memulai/mengajukan penilaian.
  // Semua anggota boleh membuka materi; pembatasan penilaian tetap ditegakkan
  // pada alur pengajuan/penilaian oleh backend.
  const openSkk = (code: string) => {
    setSelectedSkkCode(code);
    setActiveView(`skk-${String(code).toLowerCase()}`);
  };

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
              <span className="rounded-full bg-slate-50 px-3 py-1.5 text-[10px] font-black text-slate-500">{activeKrida.totalSkk || skkItems.length} SKK</span>
            </div>
          </div>
        )}

        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="mb-2 text-xs font-bold text-[#0B2F5B]">Tingkatan kecakapan</div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Pilih tingkat SKK">
            {(['PURWA','MADYA','UTAMA'] as const).map((candidate) => (
              <button key={candidate} type="button" onClick={() => setLevel(candidate)}
                aria-pressed={level === candidate}
                className={`rounded-xl px-4 py-2 text-xs font-bold ${level === candidate ? 'bg-[#48218A] text-white' : 'bg-slate-100 text-slate-700'}`}>
                {candidate.charAt(0) + candidate.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-500">Madya terbuka setelah seluruh SKK Purwa di Krida ini lulus; Utama setelah seluruh SKK Madya lulus. Status ditentukan oleh GAS.</p>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari kode atau nama SKK..." className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:border-[#6F3BC5]" />
        </div>

        {isMember && (loading || error) && <div role="status" className="mb-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">{loading ? 'Memuat status SKK dari server…' : error}</div>}
        {skkItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-center text-sm text-slate-500 shadow-sm">SKK tidak ditemukan.</div>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {skkItems.map((item: any, index: number) => {
              const code = String(item?.kode || item?.skk_code || item?.skkCode || '');
              const name = String(item?.nama || item?.skk_nama || item?.title || 'Nama SKK belum tersedia');
              const access = getAccess(code);
              const locked = isMember && !canOpen(code);
              const passed = isMember && !!access?.passed;

              return (
                <button
                  key={code}
                  onClick={() => openSkk(code)}
                  title={locked ? 'Panduan dapat dibaca; akses penilaian mengikuti progres SKK.' : 'Buka panduan SKK'}
                  className="group flex min-h-[112px] items-center justify-between gap-3 rounded-[20px] border border-slate-200 bg-white p-3.5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-purple-200 hover:shadow-md"
                >
                  <div className="min-w-0">
                    <span
                      className="grid h-8 w-8 place-items-center rounded-xl text-[10px] font-black text-white"
                      style={{ backgroundColor: activeKrida?.warna || WI[index % WI.length] }}
                    >
                      {index + 1}
                    </span>
                    <div className="mt-2 text-xs font-black uppercase tracking-wide text-[#0066B3]">{code}</div>
                    <div className="mt-0.5 line-clamp-2 text-sm font-black leading-5 text-[#0B2F5B]">{name}</div>
                    <div className="mt-1 text-[9px] font-semibold text-slate-500">{locked ? (access?.blockedBy ? `Panduan terbuka • Penilaian setelah lulus ${access.blockedBy}` : access?.blockedLevel ? `Panduan terbuka • Penilaian mengikuti tingkat ${access.blockedLevel}` : 'Panduan terbuka • Status penilaian perlu diverifikasi') : passed ? 'Lulus • Baca kembali panduan' : 'Panduan tersedia • Buka materi'}</div>
                  </div>
                  {locked ? <BookOpen className="h-4 w-4 shrink-0 text-purple-500" /> : passed ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" /> : <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" />}
                </button>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default SkkLearningCenterPage;
