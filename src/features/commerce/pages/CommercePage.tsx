import React, { useState } from 'react';
import {
  ShoppingBag,
  Store,
  Tag,
  Plus,
  Star,
  Package,
  ShoppingCart,
  CheckCircle,
} from 'lucide-react';
import { Button, Card, Badge, Tabs } from '../../../components/ui';
import { useUIStore } from '../../../stores/uiStore';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const CommercePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('products');
  const { addToast } = useUIStore();

  const products = [
    {
      id: 'PROD-01',
      name: 'Kopi Arabika Lereng Semeru (250g)',
      shopName: 'Koperasi Tani Wisata Semeru',
      price: 65000,
      stock: 42,
      rating: 4.9,
      soldCount: 180,
      thumbnailUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=500&auto=format&fit=crop&q=80',
      category: 'Kuliner Nusantara',
    },
    {
      id: 'PROD-02',
      name: 'Tas Anyaman Ketak Khas Lombok',
      shopName: 'Kriya Binaan SAKA NTB',
      price: 185000,
      stock: 15,
      rating: 4.8,
      soldCount: 95,
      thumbnailUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=500&auto=format&fit=crop&q=80',
      category: 'Kriya & Souvenir',
    },
    {
      id: 'PROD-03',
      name: 'Madu Hutan Sumbawa Murni Organik',
      shopName: 'Sentra Lebah Madu Rinjani',
      price: 120000,
      stock: 28,
      rating: 5.0,
      soldCount: 310,
      thumbnailUrl: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=500&auto=format&fit=crop&q=80',
      category: 'Kuliner Nusantara',
    },
    {
      id: 'PROD-04',
      name: 'Scarf Tenun Ikat Troso Jepara',
      shopName: 'Tenun Muda Nusantara SAKA',
      price: 95000,
      stock: 50,
      rating: 4.9,
      soldCount: 220,
      thumbnailUrl: 'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=500&auto=format&fit=crop&q=80',
      category: 'Wastra Nusantara',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tourism Commerce Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Pusat Produk UMKM Binaan, Suvenir Desa Wisata, & Kuliner Khas Nusantara.
          </p>
        </div>

        <Button
          size="sm"
          variant="warning"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Pendaftaran UMKM',
              message: 'Membuka formulir kemitraan dan onboarding produk UMKM SAKA Pariwisata.',
            })
          }
        >
          Daftarkan Produk UMKM
        </Button>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {products.map((p) => (
          <Card key={p.id} padding="none" variant="interactive" className="overflow-hidden flex flex-col">
            <div className="h-44 w-full bg-slate-100 relative">
              <img
                src={p.thumbnailUrl}
                alt={p.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-2.5 left-2.5">
                <Badge variant="blue" size="sm">{p.category}</Badge>
              </div>
            </div>

            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div className="space-y-1">
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Store className="w-3 h-3 text-[#0066B3]" />
                  <span>{p.shopName}</span>
                </p>
                <h3 className="text-xs font-bold text-slate-900 line-clamp-2 leading-snug">{p.name}</h3>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1 text-amber-500 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-amber-400" />
                  <span>{p.rating}</span>
                </span>
                <span>Terjual {p.soldCount}</span>
              </div>

              <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <p className="text-[9px] text-slate-400">Harga</p>
                  <p className="text-xs font-bold text-[#F7941D]">{formatCurrencyIDR(p.price)}</p>
                </div>
                <Button size="sm" variant="outline" className="text-xs py-1 px-2.5">
                  <ShoppingCart className="w-3.5 h-3.5 mr-1 text-[#0066B3]" />
                  Beli
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
