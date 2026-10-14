import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass,
  Star,
  MapPin,
  CalendarDays,
  RefreshCw,
  AlertCircle,
  Search,
  Map,
  Ticket,
} from 'lucide-react';
import { tourismApi, Destination, TourPackage } from '../../../services/api/tourism.api';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const TourismPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'destinations' | 'packages'>('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [packageError, setPackageError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    setPackageError('');

    // Destinasi adalah data utama. Paket Wisata adalah subfitur opsional.
    // Jangan gunakan Promise.all: satu endpoint opsional tidak boleh
    // menjatuhkan seluruh halaman Wisata.
    const destinationRequest = tourismApi.listDestinations({ limit: 100 });
    const packageRequest = tourismApi.listPackages();

    const [destinationResult, packageResult] = await Promise.allSettled([
      destinationRequest,
      packageRequest,
    ]);

    if (destinationResult.status === 'fulfilled') {
      const d = destinationResult.value;
      setDestinations(Array.isArray(d.data) ? d.data : []);
    } else {
      setDestinations([]);
      setError(
        (destinationResult.reason as any)?.message ||
        'Gagal memuat destinasi dari GAS.'
      );
    }

    if (packageResult.status === 'fulfilled') {
      const p = packageResult.value;
      setPackages(Array.isArray(p.data) ? p.data : []);
    } else {
      setPackages([]);
      setPackageError(
        (packageResult.reason as any)?.message ||
        'Paket wisata belum tersedia.'
      );
    }

    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filteredDestinations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return destinations.filter((d) =>
      !q || [d.nama_destinasi, d.kategori, d.lokasi]
        .some((v) => String(v || '').toLowerCase().includes(q))
    );
  }, [destinations, search]);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-[#F7FAFC] pb-5 sm:pb-10">
      <section className="bg-gradient-to-br from-[#0B2F5B] via-[#0F6FAE] to-[#169CD8] px-4 pb-6 pt-5 text-white sm:px-6 sm:pb-9 sm:pt-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[.2em] text-sky-100">
                <Compass className="h-3.5 w-3.5" /> Jelajah Indonesia
              </div>
              <h1 className="mt-1 text-2xl font-black sm:text-4xl">Temukan destinasi</h1>
              <p className="mt-1 max-w-xl text-xs text-sky-100 sm:text-sm">Geser kartu untuk menjelajah tanpa scroll panjang.</p>
            </div>
            <button onClick={() => void load()} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white/10 backdrop-blur" aria-label="Muat ulang">
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1.5 backdrop-blur-md sm:max-w-sm">
            <button
              onClick={() => setActiveTab('destinations')}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition ${activeTab === 'destinations' ? 'bg-white text-[#0B2F5B] shadow' : 'text-white'}`}
            >
              <Map className="h-4 w-4" /> Destinasi
            </button>
            <button
              onClick={() => setActiveTab('packages')}
              className={`flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-xs font-black transition ${activeTab === 'packages' ? 'bg-white text-[#0B2F5B] shadow' : 'text-white'}`}
            >
              <Ticket className="h-4 w-4" /> Paket
            </button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-7">
        {activeTab === 'destinations' && (
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari destinasi..."
              className="h-11 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:border-[#169CD8]"
            />
          </div>
        )}

        {loading ? (
          <div className="grid h-44 place-items-center rounded-3xl bg-white text-sm text-slate-500 shadow-sm">Memuat data pariwisata...</div>
        ) : error ? (
          <div className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertCircle className="h-4 w-4 shrink-0" /> {error}
          </div>
        ) : activeTab === 'destinations' ? (
          filteredDestinations.length === 0 ? (
            <div className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">Belum ada destinasi aktif.</div>
          ) : (
            <div className="flex snap-x gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-3">
              {filteredDestinations.map((d) => (
                <article key={d.id} className="min-w-[82%] snap-start overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm sm:min-w-0">
                  <div className="relative h-44 bg-slate-100">
                    {d.foto_utama ? <img src={d.foto_utama} alt={d.nama_destinasi} className="h-full w-full object-cover" /> : <div className="grid h-full place-items-center"><Compass className="h-8 w-8 text-slate-300" /></div>}
                    <span className="absolute left-3 top-3 rounded-xl bg-white/95 px-2.5 py-1 text-[10px] font-black text-[#0B2F5B] shadow">{d.kategori || 'Wisata'}</span>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-black text-[#0B2F5B]">{d.nama_destinasi}</h3>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-500"><MapPin className="h-3.5 w-3.5 text-[#EC2F78]" />{d.lokasi}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-600">{d.deskripsi}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="flex items-center gap-1 text-xs font-black text-amber-600"><Star className="h-3.5 w-3.5 fill-current" />{d.rating_rata_rata || 0}</span>
                      <span className="text-[10px] text-slate-400">{d.jumlah_ulasan || 0} ulasan</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )
        ) : packages.length === 0 ? (
          <div className="rounded-2xl bg-white p-5 text-sm text-slate-500 shadow-sm">
            {packageError ? 'Paket wisata belum tersedia. Destinasi tetap dapat dijelajahi.' : 'Belum ada paket tur aktif.'}
          </div>
        ) : (
          <div className="flex snap-x gap-3 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:overflow-visible">
            {packages.map((p) => (
              <article key={p.id} className="min-w-[82%] snap-start rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm sm:min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-orange-50 text-[#F7941D]"><CalendarDays className="h-5 w-5" /></span>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{p.krida_fokus || 'Paket Wisata'}</span>
                </div>
                <h3 className="mt-4 text-base font-black text-[#0B2F5B]">{p.nama_paket}</h3>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-600">{p.deskripsi}</p>
                <div className="mt-4 flex items-end justify-between gap-3 border-t border-slate-100 pt-3 text-xs">
                  <span className="text-slate-500">{p.durasi}</span>
                  <strong className="text-sm text-[#F7941D]">{formatCurrencyIDR(Number(p.harga || 0))}</strong>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TourismPage;
