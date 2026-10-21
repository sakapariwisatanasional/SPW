import React, { useEffect, useMemo, useState } from 'react';
import { Newspaper, Plus, ExternalLink, RefreshCw, AlertCircle, Link as LinkIcon, Clock3, Pencil, Trash2, ImageOff } from 'lucide-react';
import { Card, Badge, Modal, Button } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { contentApi, ContentItem } from '../../../services/api/content.api';
import { apiClient } from '../../../services/api/apiClient';
import { formatDateID } from '../../../utils/formatters';

type ContentTab = 'public' | 'mine';

function extractRows<T>(response: any): T[] {
  const raw = response?.data;
  if (Array.isArray(raw)) return raw as T[];
  if (Array.isArray(raw?.data)) return raw.data as T[];
  if (Array.isArray(raw?.items)) return raw.items as T[];
  return [];
}

export const ContentPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [mine, setMine] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<ContentTab>('public');
  const [loading, setLoading] = useState(true);
  const [publicError, setPublicError] = useState('');
  const [mineError, setMineError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [failedImages, setFailedImages] = useState<string[]>([]);

  const canSubmit = useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    if (currentUser.role === ROLES.PUBLIC_USER) return false;
    if (currentUser.role !== ROLES.MEMBER) return true;
    const status = String((currentUser as any).status || (currentUser as any).memberProfile?.status || '').toUpperCase();
    return !status || ['ACTIVE', 'KTA_GENERATED'].includes(status);
  }, [isAuthenticated, currentUser]);

  const loadPublic = async () => {
    const response = await contentApi.list();
    if (response?.success === false) throw new Error(response.message || 'GAS gagal memuat Warta yang sudah terbit.');
    setItems(extractRows<ContentItem>(response));
    setPublicError('');
  };

  const loadMine = async () => {
    if (!canSubmit) {
      setMine([]);
      setMineError('');
      return;
    }

    // Kompatibilitas untuk bundle API lama: tetap panggil GAS, bukan data lokal.
    const apiWithMine = contentApi as typeof contentApi & { listMine?: () => Promise<any> };
    const response = typeof apiWithMine.listMine === 'function'
      ? await apiWithMine.listMine()
      : await apiClient.get<any>('content.mine');

    if (response?.success === false) throw new Error(response.message || 'GAS gagal memuat kontribusi akun ini.');
    setMine(extractRows<ContentItem>(response));
    setMineError('');
  };

  const load = async () => {
    setLoading(true);
    setPublicError('');
    setMineError('');

    // Kedua sumber dimuat terpisah agar error kontribusi tidak menutupi feed publik.
    try {
      await loadPublic();
    } catch (error: any) {
      setItems([]);
      setPublicError(error?.message || 'Gagal memuat Warta SAKA dari GAS.');
    }

    if (canSubmit) {
      try {
        await loadMine();
      } catch (error: any) {
        setMine([]);
        setMineError(error?.message || 'Gagal memuat kontribusi dari GAS.');
      }
    } else {
      setMine([]);
      setMineError('');
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canSubmit]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim()) {
      addToast({ type: 'error', title: 'URL wajib diisi', message: 'Tempel URL artikel, video, atau publikasi yang ingin dibagikan.' });
      return;
    }
    setSubmitting(true);
    try {
      const response = editingItem
        ? await contentApi.update(editingItem.id, { url: url.trim(), caption: caption.trim(), description: caption.trim(), content_type: editingItem.content_type || 'BERITA' })
        : await contentApi.submitLink(url.trim(), caption.trim(), 'BERITA');
      if (response?.success === false) throw new Error(response.message || 'GAS menolak penyimpanan Warta.');
      setUrl('');
      setCaption('');
      setEditingItem(null);
      setModalOpen(false);
      await load();
      setActiveTab('mine');
      addToast({
        type: 'success',
        title: editingItem ? 'Warta diperbarui' : 'Warta terkirim',
        message: editingItem ? 'Perubahan tersimpan dan Warta menunggu verifikasi ulang.' : 'Kontribusi tersimpan dan menunggu verifikasi.'
      });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Gagal mengirim Warta', message: error?.message || 'GAS tidak dapat menyimpan kontribusi.' });
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (item: ContentItem) => {
    setEditingItem(item);
    setUrl(item.url || '');
    setCaption(item.description || '');
    setModalOpen(true);
  };

  const cancelForm = () => {
    setModalOpen(false);
    setEditingItem(null);
    setUrl('');
    setCaption('');
  };

  const removeItem = async (item: ContentItem) => {
    const confirmed = window.confirm(`Hapus Warta "${item.title || item.url || item.id}"? Tindakan ini tidak dapat dibatalkan.`);
    if (!confirmed) return;
    setDeletingId(item.id);
    try {
      const response = await contentApi.delete(item.id);
      if (response?.success === false) throw new Error(response.message || 'GAS menolak penghapusan Warta.');
      await load();
      addToast({ type: 'success', title: 'Warta dihapus', message: 'Kontribusi berhasil dihapus.' });
    } catch (error: any) {
      addToast({ type: 'error', title: 'Gagal menghapus Warta', message: error?.message || 'GAS tidak dapat menghapus kontribusi.' });
    } finally {
      setDeletingId(null);
    }
  };

  const visible = activeTab === 'public' ? items : mine;
  const activeError = activeTab === 'public' ? publicError : mineError;

  return (
    <div className="space-y-5 pb-6">
      <div className="flex items-center justify-between gap-3 rounded-2xl bg-gradient-to-r from-[#FFF9F0] to-white p-4 sm:p-5 border border-[#F0E8DA]">
        <div className="min-w-0">
          <div className="flex items-center gap-2"><Newspaper className="w-5 h-5 text-[#7E57C2]" /><h1 className="text-xl font-black text-slate-900">Warta SAKA</h1></div>
          <p className="text-xs text-slate-500 mt-1">Bagikan tautan publikasi. Konten umum ditampilkan setelah disetujui.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={() => void load()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center" aria-label="Muat ulang" disabled={loading}>
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          {canSubmit && <button type="button" onClick={() => { setEditingItem(null); setUrl(""); setCaption(""); setModalOpen(true); }} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#7E57C2] px-3 text-white shadow-sm hover:bg-[#6841B0]" aria-label="Tambah Warta"><Plus className="w-5 h-5" /><span className="hidden sm:inline text-xs font-bold">Bagikan Warta</span></button>}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button type="button" onClick={() => setActiveTab('public')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === 'public' ? 'bg-[#0B5CAB] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Terbit</button>
        {canSubmit && <button type="button" onClick={() => setActiveTab('mine')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab === 'mine' ? 'bg-[#EC407A] text-white' : 'bg-white border border-slate-200 text-slate-600'}`}>Kontribusi Saya</button>}
      </div>

      {loading ? <Card><p className="text-sm text-slate-500">Memuat Warta dari server...</p></Card> : activeError ? (
        <Card><div className="flex items-start gap-2 text-red-700"><AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /><div className="min-w-0"><p className="text-sm font-semibold">Data tidak berhasil dimuat</p><p className="text-sm">{activeError}</p><button type="button" onClick={() => void load()} className="mt-2 text-sm font-bold underline">Coba lagi</button></div></div></Card>
      ) : visible.length === 0 ? (
        <Card><p className="text-sm text-slate-500">{activeTab === 'public' ? 'Belum ada Warta yang disetujui untuk ditampilkan.' : 'Belum ada kontribusi dari akun ini.'}</p></Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {visible.map(item => (
            <article key={item.id} className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs">
              {item.thumbnail_url && !failedImages.includes(item.id) ? (
                <img
                  src={item.thumbnail_url}
                  alt={item.title || 'Thumbnail Warta'}
                  loading="lazy"
                  className="w-full aspect-[16/9] object-cover bg-[#F1F6F0]"
                  referrerPolicy="no-referrer"
                  onError={() => setFailedImages(previous => previous.includes(item.id) ? previous : [...previous, item.id])}
                />
              ) : (
                <div className="aspect-[16/9] bg-[#F1F6F0] grid place-items-center text-center px-4">
                  {failedImages.includes(item.id) ? <ImageOff className="w-9 h-9 text-slate-300" /> : <Newspaper className="w-9 h-9 text-slate-300" />}
                  <span className="mt-2 text-[10px] text-slate-400">{failedImages.includes(item.id) ? 'Thumbnail tidak dapat dimuat' : 'Pratinjau publikasi'}</span>
                </div>
              )}
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="blue">{String(item.content_type || '').toUpperCase() || 'WARTA'}</Badge>
                  {activeTab === 'mine' && <Badge variant={String(item.status).toUpperCase() === 'APPROVED' ? 'green' : String(item.status).toUpperCase() === 'REJECTED' ? 'red' : 'gray'}>{item.status || 'STATUS TIDAK TERSEDIA'}</Badge>}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2">{item.title}</h3>
                {item.description && <p className="text-xs text-slate-600 line-clamp-3">{item.description}</p>}
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  {item.member_name ? <span className="truncate">{item.member_name}</span> : <span />}
                  {item.created_at && <span className="inline-flex items-center gap-1 shrink-0"><Clock3 className="w-3 h-3" />{formatDateID(item.created_at)}</span>}
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  {item.url ? <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5CAB] hover:underline"><ExternalLink className="w-3.5 h-3.5" />Buka sumber</a> : <span />}
                  {activeTab === 'mine' && (
                    <div className="flex items-center gap-1.5">
                      <button type="button" onClick={() => beginEdit(item)} className="inline-flex items-center gap-1 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-2 text-xs font-bold text-violet-700 hover:bg-violet-100" aria-label={`Edit ${item.title || 'Warta'}`}>
                        <Pencil className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button type="button" onClick={() => void removeItem(item)} disabled={deletingId === item.id} className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 disabled:opacity-50" aria-label={`Hapus ${item.title || 'Warta'}`}>
                        <Trash2 className="w-3.5 h-3.5" /> {deletingId === item.id ? 'Menghapus' : 'Hapus'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={cancelForm} title={editingItem ? "Edit Warta" : "Bagikan Warta dari Link"} description={editingItem ? "Perubahan akan disimpan melalui GAS dan dikirim kembali untuk verifikasi." : "Tempel URL publikasi. Data disimpan melalui GAS dan menunggu verifikasi."}>
        <form onSubmit={submit} className="space-y-3">
          <div><label className="text-xs font-bold text-slate-700">URL publikasi</label><input value={url} onChange={event => setUrl(event.target.value)} placeholder="https://..." type="url" required className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-900" /></div>
          <div><label className="text-xs font-bold text-slate-700">Caption</label><textarea value={caption} onChange={event => setCaption(event.target.value)} rows={4} placeholder="Tuliskan konteks singkat untuk anggota lain..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-900" /></div>
          <Button type="submit" disabled={submitting} leftIcon={<LinkIcon className="w-4 h-4" />}>{submitting ? 'Menyimpan...' : editingItem ? 'Simpan Perubahan' : 'Kirim untuk Verifikasi'}</Button>
        </form>
      </Modal>
    </div>
  );
};
