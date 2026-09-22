import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Image as ImageIcon,
  Plus,
  Eye,
  FileText,
  Clock,
  CheckCircle,
} from 'lucide-react';
import { Button, Card, Badge, Tabs, Input, Select, Table } from '../../../components/ui';
import { useUIStore } from '../../../stores/uiStore';
import { formatDateID } from '../../../utils/formatters';

export const ContentPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('news');
  const { addToast } = useUIStore();

  const newsData = [
    {
      id: 'NEWS-01',
      title: 'Peluncuran Jambore Pariwisata Nasional 2026 di Danau Toba',
      category: 'Kegiatan Nasional',
      author: 'Redaksi Kwarnas SPWN',
      status: 'PUBLISHED' as const,
      publishedAt: '2026-09-18',
      views: 1420,
    },
    {
      id: 'NEWS-02',
      title: 'Standarisasi Kompetensi Pramuwisata Muda Krida Bina Pandu',
      category: 'Edukasi & Diklat',
      author: 'Ahmad Fauzan (Content Manager)',
      status: 'REVIEW' as const,
      publishedAt: '2026-09-20',
      views: 280,
    },
    {
      id: 'NEWS-03',
      title: 'Pedoman Konservasi Geopark Berbasis Sapta Pesona',
      category: 'Panduan Teknis',
      author: 'Dewi Anjani',
      status: 'DRAFT' as const,
      publishedAt: '-',
      views: 0,
    },
  ];

  const agendaData = [
    {
      id: 'EVT-01',
      title: 'Kemah Wisata Bahari & Coral Adoption Kepulauan Seribu',
      date: '10 - 13 Oktober 2026',
      location: 'Pulau Pari, DKI Jakarta',
      quota: '120 Peserta',
      status: 'UPCOMING',
    },
    {
      id: 'EVT-02',
      title: 'Festival Kuliner Tradisional Nusantara Binaan SAKA',
      date: '24 - 26 Oktober 2026',
      location: 'Benteng Vredeburg, DI Yogyakarta',
      quota: 'Terbuka Umum',
      status: 'UPCOMING',
    },
  ];

  const columns = [
    {
      key: 'title',
      header: 'Judul Konten / Artikel',
      render: (item: typeof newsData[0]) => (
        <div className="space-y-0.5">
          <p className="font-semibold text-slate-900 text-xs">{item.title}</p>
          <p className="text-[10px] text-slate-400">Penulis: {item.author}</p>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Kategori',
      render: (item: typeof newsData[0]) => (
        <Badge variant="blue" size="sm">{item.category}</Badge>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Status',
      render: (item: typeof newsData[0]) => {
        const variantMap = {
          PUBLISHED: 'green' as const,
          REVIEW: 'orange' as const,
          DRAFT: 'neutral' as const,
        };
        const labelMap = {
          PUBLISHED: 'Terbit Publik',
          REVIEW: 'Sedang Review',
          DRAFT: 'Draf Penulis',
        };
        return (
          <Badge variant={variantMap[item.status]} size="sm" dot>
            {labelMap[item.status]}
          </Badge>
        );
      },
    },
    {
      key: 'publishedAt',
      header: 'Tanggal Terbit',
      render: (item: typeof newsData[0]) => (
        <span className="text-xs text-slate-600">{formatDateID(item.publishedAt)}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Content Management System (CMS)
          </h1>
          <p className="text-xs text-slate-500">
            Pusat Publikasi Berita, Artikel Edukasi, Kalender Agenda, & Galeri Pariwisata.
          </p>
        </div>

        <Button
          size="sm"
          variant="primary"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() =>
            addToast({
              type: 'info',
              title: 'Editor Konten',
              message: 'Membuka formulir pembuatan artikel dan agenda baru.',
            })
          }
        >
          Buat Konten Baru
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'news', label: 'Berita & Artikel', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'agenda', label: 'Agenda Kegiatan', icon: <Calendar className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === 'news' && (
        <div className="space-y-4">
          <Table
            columns={columns}
            data={newsData}
            keyExtractor={(item) => item.id}
          />
        </div>
      )}

      {activeTab === 'agenda' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agendaData.map((evt) => (
            <Card key={evt.id} padding="lg">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Badge variant="green" size="sm">Agenda Terbuka</Badge>
                  <span className="text-xs text-slate-400">{evt.quota}</span>
                </div>
                <h3 className="text-sm font-bold text-slate-900">{evt.title}</h3>
                <div className="text-xs text-slate-500 space-y-1 pt-1">
                  <p className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#0066B3]" />
                    <span>{evt.date}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#F7941D]" />
                    <span>{evt.location}</span>
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
