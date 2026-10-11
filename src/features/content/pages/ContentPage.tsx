import React, { useEffect, useMemo, useState } from 'react';
import {
  Newspaper, Calendar, Plus, ExternalLink, Clock, MapPin, AlertCircle,
  Link as LinkIcon, RefreshCw
} from 'lucide-react';
import { Button, Card, Badge, Tabs, Modal } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { contentApi, ContentItem } from '../../../services/api/content.api';
import { formatDateID } from '../../../utils/formatters';

type ContentCategory = 'BERITA' | 'AGENDA';

export const ContentPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();

  const [items, setItems] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'feed' | 'news' | 'agenda'>('feed');
  const [searchFilter, setSearchFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formUrl, setFormUrl] = useState('');
  const [formCategory, setFormCategory] = useState<ContentCategory>('BERITA');
  const [formDescription, setFormDescription] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formThumbnail, setFormThumbnail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const memberId =
    (currentUser as any)?.memberId ||
    (currentUser as any)?.memberProfile?.id ||
    (currentUser as any)?.id ||
    '';

  const isApprovedMember = useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    if ([ROLES.SUPER_ADMIN, ROLES.ADMIN_PUSAT, ROLES.ADMIN_WILAYAH, ROLES.CONTENT_MANAGER].includes(currentUser.role as any)) {
      return true;
    }
    const status = String((currentUser as any).status || (currentUser as any).memberProfile?.status || '').toUpperCase();
    return currentUser.role === ROLES.MEMBER && ['ACTIVE', 'KTA_GENERATED'].includes(status);
  }, [currentUser, isAuthenticated]);

  const loadContent = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const response = await contentApi.list('');
      const data = Array.isArray(response.data)
        ? response.data
        : Array.isArray((response as any)?.data?.data)
          ? (response as any).data.data
          : [];
      setItems(data);
    } catch (error: any) {
      setItems([]);
      setLoadError(error?.message || 'Gagal memuat Warta SAKA dari GAS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadContent();
  }, []);

  const handleOpenCreateModal = () => {
    if (!isApprovedMember) {
      addToast({
        type: 'warning',
        title: 'Akses Terbatas',
        message: 'Konten hanya dapat dibuat oleh anggota aktif atau pengurus yang berwenang.',
      });
      return;
    }
    setFormUrl('');
    setFormCategory('BERITA');
    setFormDescription('');
    setFormTitle('');
    setFormThumbnail('');
    setIsCreateModalOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberId) {
      addToast({ type: 'error', title: 'Identitas Tidak Tersedia', message: 'Member ID tidak ditemukan pada sesi login.' });
      return;
    }
    if (!formTitle.trim()) {
      addToast({ type: 'error', title: 'Judul Wajib Diisi', message: 'Isi judul konten terlebih dahulu.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await contentApi.create({
        member_id: memberId,
        member_name: (currentUser as any)?.fullName || (currentUser as any)?.full_name || '',
        content_type: formCategory,
        title: formTitle.trim(),
        description: formDescription.trim(),
        url: formUrl.trim(),
        thumbnail_url: formThumbnail.trim(),
      });
      if (!res.success) throw new Error(res.message || 'Gagal membuat konten.');
      setIsCreateModalOpen(false);
      await loadContent();
      addToast({
        type: 'success',
        title: 'Konten Terkirim',
        message: 'Konten tersimpan di GAS dengan status PENDING dan menunggu moderasi.',
      });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Gagal Menyimpan', message: error?.message || 'Gagal menyimpan konten ke GAS.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtered = useMemo(() => {
    const q = searchFilter.trim().toLowerCase();
    return items
      .filter((item) => {
        const type = String(item.content_type || '').toUpperCase();
        if (activeTab === 'news' && type !== 'BERITA') return false;
        if (activeTab === 'agenda' && type !== 'AGENDA') return false;
        if (!q) return true;
        return [item.title, item.description, item.member_name]
          .some((v) => String(v || '').toLowerCase().includes(q));
      })
      .sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  }, [items, activeTab, searchFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Warta SAKA</h1>
          <p className="text-xs text-slate-500">Seluruh konten dimuat langsung dari basis data GAS.</p>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => void loadContent()} leftIcon={<RefreshCw className="w-4 h-4" />}>
            Muat Ulang
          </Button>
          <Button size="sm" variant="primary" onClick={handleOpenCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
            Buat Konten
          </Button>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'feed', label: 'Semua' },
          { id: 'news', label: 'Berita', icon: <Newspaper className="w-4 h-4" /> },
          { id: 'agenda', label: 'Agenda', icon: <Calendar className="w-4 h-4" /> },
        ]}
        activeTab={activeTab}
        onChange={(id) => setActiveTab(id as any)}
      />

      <input
        value={searchFilter}
        onChange={(e) => setSearchFilter(e.target.value)}
        placeholder="Cari judul, deskripsi, atau penulis..."
        className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm bg-white text-slate-900"
      />

      {loading ? (
        <Card><p className="text-sm text-slate-500">Memuat konten dari GAS...</p></Card>
      ) : loadError ? (
        <Card>
          <div className="flex items-center gap-2 text-red-700"><AlertCircle className="w-4 h-4" />{loadError}</div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card><p className="text-sm text-slate-500">Belum ada konten pada basis data.</p></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <Card key={item.id} className="space-y-3">
              {item.thumbnail_url && (
                <img src={item.thumbnail_url} alt={item.title} className="w-full h-48 object-cover rounded-xl" referrerPolicy="no-referrer" />
              )}
              <div className="flex items-center justify-between gap-2">
                <Badge variant={String(item.content_type).toUpperCase() === 'AGENDA' ? 'orange' : 'blue'}>
                  {String(item.content_type || 'BERITA').toUpperCase()}
                </Badge>
                <Badge variant={String(item.status).toUpperCase() === 'APPROVED' ? 'green' : 'gray'}>
                  {item.status || 'PENDING'}
                </Badge>
              </div>
              <h3 className="font-bold text-slate-900">{item.title}</h3>
              {item.description && <p className="text-sm text-slate-600">{item.description}</p>}
              <div className="text-xs text-slate-400">
                {item.member_name || 'Anggota SAKA'} · {item.created_at ? formatDateID(item.created_at) : '-'}
              </div>
              {item.url && (
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#0066B3]">
                  <ExternalLink className="w-3.5 h-3.5" /> Buka sumber
                </a>
              )}
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Buat Konten Warta">
        <form onSubmit={handleCreate} className="space-y-3">
          <select
            value={formCategory}
            onChange={(e) => setFormCategory(e.target.value as ContentCategory)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900"
          >
            <option value="BERITA">Berita</option>
            <option value="AGENDA">Agenda</option>
          </select>
          <input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="Judul" className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900" />
          <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Deskripsi" rows={4} className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900" />
          <input value={formUrl} onChange={(e) => setFormUrl(e.target.value)} placeholder="URL sumber/media (opsional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900" />
          <input value={formThumbnail} onChange={(e) => setFormThumbnail(e.target.value)} placeholder="URL thumbnail (opsional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-slate-900" />
          <Button type="submit" disabled={isSubmitting} leftIcon={<LinkIcon className="w-4 h-4" />}>
            {isSubmitting ? 'Menyimpan...' : 'Simpan ke GAS'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
