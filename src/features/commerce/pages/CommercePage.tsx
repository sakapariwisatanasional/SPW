import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Store, Package, ShoppingCart, RefreshCw, AlertCircle } from 'lucide-react';
import { Button, Card, Badge } from '../../../components/ui';
import { commerceApi, Product, ProductCategory } from '../../../services/api/commerce.api';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const CommercePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [category, setCategory] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [productRes, categoryRes] = await Promise.all([
        commerceApi.listProducts({ limit: 100 }),
        commerceApi.listCategories(),
      ]);
      setProducts(Array.isArray(productRes.data) ? productRes.data : []);
      setCategories(Array.isArray(categoryRes.data) ? categoryRes.data : []);
    } catch (e: any) {
      setProducts([]);
      setCategories([]);
      setError(e?.message || 'Gagal memuat Kedai SAKA dari GAS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => products.filter((p) => {
    if (category !== 'ALL' && p.kategori !== category) return false;
    const q = search.trim().toLowerCase();
    return !q || [p.nama_produk, p.deskripsi, p.sku, p.kategori].some((v) => String(v || '').toLowerCase().includes(q));
  }), [products, category, search]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Kedai SAKA</h1>
          <p className="text-xs text-slate-500">Produk dan stok berasal langsung dari GAS/Spreadsheet.</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => void load()} leftIcon={<RefreshCw className="w-4 h-4" />}>Muat Ulang</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-3">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900">
          <option value="ALL">Semua kategori</option>
          {categories.map((c) => <option key={c.id} value={c.nama_kategori}>{c.nama_kategori}</option>)}
        </select>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari produk..." className="rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900" />
      </div>

      {loading ? (
        <Card><p className="text-sm text-slate-500">Memuat produk dari GAS...</p></Card>
      ) : error ? (
        <Card><div className="flex gap-2 text-red-700"><AlertCircle className="w-4 h-4" />{error}</div></Card>
      ) : filtered.length === 0 ? (
        <Card><p className="text-sm text-slate-500">Belum ada produk aktif di basis data.</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filtered.map((p) => (
            <Card key={p.id} padding="none" className="overflow-hidden flex flex-col">
              <div className="h-44 bg-slate-100">
                {p.foto_utama ? <img src={p.foto_utama} alt={p.nama_produk} className="w-full h-full object-cover" /> : <div className="h-full grid place-items-center"><Package className="w-8 h-8 text-slate-300" /></div>}
              </div>
              <div className="p-4 space-y-3">
                <Badge variant="blue" size="sm">{p.kategori || 'Produk'}</Badge>
                <h3 className="text-sm font-bold text-slate-900">{p.nama_produk}</h3>
                <p className="text-xs text-slate-500 line-clamp-2">{p.deskripsi}</p>
                <div className="flex justify-between text-xs">
                  <span className="font-bold text-[#F7941D]">{formatCurrencyIDR(Number(p.harga || 0))}</span>
                  <span className="text-slate-500">Stok {p.stok}</span>
                </div>
                <Button size="sm" variant="outline" disabled={Number(p.stok) <= 0} className="w-full">
                  <ShoppingCart className="w-3.5 h-3.5 mr-1" /> {Number(p.stok) > 0 ? 'Pilih Produk' : 'Stok Habis'}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
