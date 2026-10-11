import React, { useEffect, useMemo, useState } from 'react';
import { Compass, Star, MapPin, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Card, Badge, Tabs } from '../../../components/ui';
import { tourismApi, Destination, TourPackage } from '../../../services/api/tourism.api';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const TourismPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('destinations');
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [d, p] = await Promise.all([
        tourismApi.listDestinations({ limit: 100 }),
        tourismApi.listPackages(),
      ]);
      setDestinations(Array.isArray(d.data) ? d.data : []);
      setPackages(Array.isArray(p.data) ? p.data : []);
    } catch (e: any) {
      setDestinations([]);
      setPackages([]);
      setError(e?.message || 'Gagal memuat data pariwisata dari GAS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filteredDestinations = useMemo(() => {
    const q = search.trim().toLowerCase();
    return destinations.filter((d) => !q || [d.nama_destinasi, d.kategori, d.lokasi].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [destinations, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Tourism Explorer</h1>
          <p className="text-xs text-slate-500">Destinasi dan paket tur dimuat langsung dari GAS.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} leftIcon={<RefreshCw className="w-4 h-4" />}>Muat Ulang</Button>
      </div>

      <Tabs
        tabs={[
          { id: 'destinations', label: 'Destinasi Wisata', icon: <Compass className="w-4 h-4" /> },
          { id: 'packages', label: 'Paket Tur', icon: <Calendar className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'destinations' && (
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari destinasi..." className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900" />
      )}

      {loading ? (
        <Card><p className="text-sm text-slate-500">Memuat data dari GAS...</p></Card>
      ) : error ? (
        <Card><div className="flex gap-2 text-red-700"><AlertCircle className="w-4 h-4" />{error}</div></Card>
      ) : activeTab === 'destinations' ? (
        filteredDestinations.length === 0 ? <Card><p className="text-sm text-slate-500">Belum ada destinasi aktif.</p></Card> :
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDestinations.map((d) => (
            <Card key={d.id} padding="none" className="overflow-hidden">
              <div className="h-48 bg-slate-100">{d.foto_utama && <img src={d.foto_utama} alt={d.nama_destinasi} className="w-full h-full object-cover" />}</div>
              <div className="p-4 space-y-2">
                <Badge variant="blue">{d.kategori}</Badge>
                <h3 className="font-bold text-slate-900">{d.nama_destinasi}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{d.lokasi}</p>
                <p className="text-xs text-slate-600">{d.deskripsi}</p>
                <div className="text-xs text-amber-600 font-bold flex items-center gap-1"><Star className="w-3.5 h-3.5" />{d.rating_rata_rata || 0} ({d.jumlah_ulasan || 0})</div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        packages.length === 0 ? <Card><p className="text-sm text-slate-500">Belum ada paket tur aktif.</p></Card> :
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {packages.map((p) => (
            <Card key={p.id} className="space-y-2">
              <h3 className="font-bold text-slate-900">{p.nama_paket}</h3>
              <p className="text-xs text-slate-600">{p.deskripsi}</p>
              <div className="flex justify-between text-xs"><span>{p.durasi}</span><strong className="text-[#F7941D]">{formatCurrencyIDR(Number(p.harga || 0))}</strong></div>
              <Badge variant="green">{p.krida_fokus}</Badge>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
