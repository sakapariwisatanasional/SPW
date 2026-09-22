import React, { useState } from 'react';
import {
  Compass,
  Star,
  MapPin,
  Calendar,
  Users,
  Search,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { Button, Card, Badge, Input, Select, Tabs } from '../../../components/ui';
import { useUIStore } from '../../../stores/uiStore';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const TourismPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('destinations');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const { addToast } = useUIStore();

  const destinations = [
    {
      id: 'DEST-01',
      name: 'Desa Wisata Nglanggeran & Gunung Api Purba',
      category: 'WISATA_ALAM',
      categoryLabel: 'Wisata Alam & Edukasi',
      province: 'DI Yogyakarta',
      city: 'Gunungkidul',
      entryFee: 15000,
      ratingAvg: 4.9,
      reviewCount: 320,
      thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&auto=format&fit=crop&q=80',
      tag: 'Binaan Krida Bina Wisata',
      facilities: ['Homestay', 'Pemandu SAKA', 'Kuliner Cokelat', 'Camping Ground'],
    },
    {
      id: 'DEST-02',
      name: 'Taman Wisata Alam Kawah Ijen',
      category: 'WISATA_ALAM',
      categoryLabel: 'Wisata Alam & Konservasi',
      province: 'Jawa Timur',
      city: 'Banyuwangi',
      entryFee: 30000,
      ratingAvg: 4.8,
      reviewCount: 450,
      thumbnailUrl: 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?w=600&auto=format&fit=crop&q=80',
      tag: 'Blue Fire Phenomenon',
      facilities: ['Pemandu Wisata', 'Penyewaan Masker', 'Posko Medis'],
    },
    {
      id: 'DEST-03',
      name: 'Kawasan Adat & Budaya Desa Penglipuran',
      category: 'BUDAYA',
      categoryLabel: 'Wisata Budaya & Adat',
      province: 'Bali',
      city: 'Bangli',
      entryFee: 25000,
      ratingAvg: 5.0,
      reviewCount: 680,
      thumbnailUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=600&auto=format&fit=crop&q=80',
      tag: 'Desa Terbersih Dunia',
      facilities: ['Hutan Bambu', 'Homestay Adat', 'Kerajinan Tangan'],
    },
  ];

  const tourPackages = [
    {
      id: 'PKG-01',
      title: 'Eksplorasi Budaya & Alam Yogyakarta 3D2N',
      partner: 'Mitra Desa Wisata Prambanan',
      duration: '3 Hari 2 Malam',
      price: 1450000,
      quota: 'Maks 15 Peserta',
      rating: 4.9,
      destinations: 'Nglanggeran, Tebing Breksi, Candi Ijo',
      thumbnailUrl: 'https://images.unsplash.com/photo-1596402184320-417e7178b2cd?w=600&auto=format&fit=crop&q=80',
    },
    {
      id: 'PKG-02',
      title: 'Jelajah Bahari & Konservasi Terumbu Labuan Bajo 4D3N',
      partner: 'Mitra Bahari Komodo SAKA',
      duration: '4 Hari 3 Malam',
      price: 3850000,
      quota: 'Maks 12 Peserta',
      rating: 5.0,
      destinations: 'Pulau Padar, Komodo, Pink Beach',
      thumbnailUrl: 'https://images.unsplash.com/photo-1516690561799-46d8f74f9abf?w=600&auto=format&fit=crop&q=80',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Tourism Explorer & Marketplace
          </h1>
          <p className="text-xs text-slate-500">
            Katalog Destinasi Wisata Unggulan, Paket Tur, dan Kemitraan SAKA Pariwisata.
          </p>
        </div>

        <Button
          size="sm"
          variant="secondary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Kurasi Destinasi',
              message: 'Membuka formulir pendaftaran dan kurasi destinasi pariwisata binaan SAKA.',
            })
          }
        >
          Daftarkan Destinasi
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'destinations', label: 'Destinasi Wisata', icon: <Compass className="w-4 h-4" /> },
          { id: 'packages', label: 'Paket Tur Wisata', icon: <Calendar className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Destinations Grid */}
      {activeTab === 'destinations' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {destinations.map((d) => (
            <Card key={d.id} padding="none" variant="interactive" className="overflow-hidden flex flex-col">
              <div className="relative h-48 w-full bg-slate-100">
                <img
                  src={d.thumbnailUrl}
                  alt={d.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="blue">{d.categoryLabel}</Badge>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs px-2 py-1 rounded-md flex items-center gap-1 font-semibold">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{d.ratingAvg}</span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-1.5">
                  <p className="text-[11px] text-slate-500 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#0066B3]" />
                    <span>{d.city}, {d.province}</span>
                  </p>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{d.name}</h3>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {d.facilities.map((f, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                      {f}
                    </span>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Tiket Masuk Mulai</p>
                    <p className="text-xs font-bold text-[#0066B3]">{formatCurrencyIDR(d.entryFee)}</p>
                  </div>
                  <Button size="sm" variant="outline" rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
                    Detail
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Packages Grid */}
      {activeTab === 'packages' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tourPackages.map((pkg) => (
            <Card key={pkg.id} padding="none" variant="interactive" className="overflow-hidden flex flex-col sm:flex-row">
              <div className="sm:w-2/5 h-48 sm:h-auto bg-slate-100 relative">
                <img
                  src={pkg.thumbnailUrl}
                  alt={pkg.title}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <Badge variant="green">{pkg.duration}</Badge>
                </div>
              </div>

              <div className="p-5 sm:w-3/5 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <p className="text-[10px] text-slate-400 uppercase font-semibold">{pkg.partner}</p>
                  <h3 className="text-sm font-bold text-slate-900">{pkg.title}</h3>
                  <p className="text-xs text-slate-500 pt-1">Destinasi: {pkg.destinations}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-slate-400">Harga Paket</p>
                    <p className="text-sm font-bold text-[#009B4D]">{formatCurrencyIDR(pkg.price)}</p>
                  </div>
                  <Button size="sm" variant="primary">
                    Pesan Paket
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
