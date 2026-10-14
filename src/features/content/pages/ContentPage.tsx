import React, { useEffect, useMemo, useState } from 'react';
import { Newspaper, Plus, ExternalLink, RefreshCw, AlertCircle, Link as LinkIcon, Clock3 } from 'lucide-react';
import { Card, Badge, Modal, Button } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { contentApi, ContentItem } from '../../../services/api/content.api';
import { formatDateID } from '../../../utils/formatters';

export const ContentPage: React.FC = () => {
  const { currentUser, isAuthenticated } = useAuthStore();
  const { addToast } = useUIStore();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [mine, setMine] = useState<ContentItem[]>([]);
  const [activeTab, setActiveTab] = useState<'public' | 'mine'>('public');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = useMemo(() => {
    if (!isAuthenticated || !currentUser) return false;
    if (currentUser.role === ROLES.PUBLIC_USER) return false;
    if (currentUser.role !== ROLES.MEMBER) return true;
    const status = String((currentUser as any).status || (currentUser as any).memberProfile?.status || '').toUpperCase();
    return !status || ['ACTIVE', 'KTA_GENERATED'].includes(status);
  }, [isAuthenticated, currentUser]);

  const loadPublic = async () => {
    const res = await contentApi.list();
    setItems(Array.isArray(res.data) ? res.data : []);
  };

  const loadMine = async () => {
    if (!canSubmit) return setMine([]);
    const res = await contentApi.listMine();
    setMine(Array.isArray(res.data) ? res.data : []);
  };

  const load = async () => {
    setLoading(true); setError('');
    try {
      await loadPublic();
      if (canSubmit) await loadMine();
    } catch (e:any) {
      setError(e?.message || 'Gagal memuat Warta SAKA dari GAS.');
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, [canSubmit]);

  const submit = async (e:React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return addToast({type:'error', title:'URL wajib diisi', message:'Tempel URL artikel, video, atau publikasi yang ingin dibagikan.'});
    setSubmitting(true);
    try {
      await contentApi.submitLink(url.trim(), caption.trim(), 'BERITA');
      setUrl(''); setCaption(''); setModalOpen(false); setActiveTab('mine');
      await loadMine();
      addToast({type:'success', title:'Warta terkirim', message:'Thumbnail dan judul akan diambil dari link. Konten tampil umum setelah diverifikasi.'});
    } catch (e:any) {
      addToast({type:'error', title:'Gagal mengirim Warta', message:e?.message || 'Terjadi kesalahan.'});
    } finally { setSubmitting(false); }
  };

  const visible = activeTab === 'public' ? items : mine;

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2"><Newspaper className="w-5 h-5 text-[#7E57C2]"/><h1 className="text-xl font-black text-slate-900">Warta SAKA</h1></div>
          <p className="text-xs text-slate-500 mt-1">Bagikan link. SPWN menampilkan thumbnail, judul, dan caption setelah verifikasi.</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button type="button" onClick={() => void load()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center" aria-label="Muat ulang"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
          {canSubmit && <button type="button" onClick={() => setModalOpen(true)} className="w-10 h-10 rounded-xl bg-[#7E57C2] text-white grid place-items-center shadow-sm" aria-label="Tambah Warta"><Plus className="w-5 h-5"/></button>}
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        <button onClick={() => setActiveTab('public')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab==='public'?'bg-[#0B5CAB] text-white':'bg-white border border-slate-200 text-slate-600'}`}>Terbit</button>
        {canSubmit && <button onClick={() => setActiveTab('mine')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${activeTab==='mine'?'bg-[#EC407A] text-white':'bg-white border border-slate-200 text-slate-600'}`}>Kontribusi Saya</button>}
      </div>

      {loading ? <Card><p className="text-sm text-slate-500">Memuat Warta...</p></Card> : error ? <Card><div className="flex gap-2 text-red-700"><AlertCircle className="w-4 h-4"/>{error}</div></Card> : visible.length===0 ? <Card><p className="text-sm text-slate-500">Belum ada Warta pada bagian ini.</p></Card> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map(item => (
            <article key={item.id} className="rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs">
              {item.thumbnail_url ? <img src={item.thumbnail_url} alt={item.title} className="w-full aspect-[16/9] object-cover" referrerPolicy="no-referrer"/> : <div className="aspect-[16/9] bg-gradient-to-br from-[#0B5CAB]/10 via-[#7E57C2]/10 to-[#EC407A]/10 grid place-items-center"><Newspaper className="w-9 h-9 text-slate-300"/></div>}
              <div className="p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="blue">{String(item.content_type||'BERITA').toUpperCase()}</Badge>
                  {activeTab==='mine' && <Badge variant={String(item.status).toUpperCase()==='APPROVED'?'green':String(item.status).toUpperCase()==='REJECTED'?'red':'gray'}>{item.status||'PENDING'}</Badge>}
                </div>
                <h3 className="font-extrabold text-sm text-slate-900 line-clamp-2">{item.title}</h3>
                {item.description && <p className="text-xs text-slate-600 line-clamp-3">{item.description}</p>}
                <div className="flex items-center justify-between gap-2 text-[10px] text-slate-400">
                  <span className="truncate">{item.member_name || 'Anggota SAKA'}</span>
                  {item.created_at && <span className="inline-flex items-center gap-1 shrink-0"><Clock3 className="w-3 h-3"/>{formatDateID(item.created_at)}</span>}
                </div>
                {item.url && <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B5CAB]"><ExternalLink className="w-3.5 h-3.5"/>Buka sumber</a>}
              </div>
            </article>
          ))}
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Bagikan Warta dari Link" description="Tempel URL. SPWN akan mencoba mengambil judul, deskripsi, dan thumbnail dari halaman sumber.">
        <form onSubmit={submit} className="space-y-3">
          <div><label className="text-xs font-bold text-slate-700">URL publikasi</label><input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-900"/></div>
          <div><label className="text-xs font-bold text-slate-700">Caption</label><textarea value={caption} onChange={e=>setCaption(e.target.value)} rows={4} placeholder="Tuliskan konteks singkat untuk anggota lain..." className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 bg-white text-slate-900"/></div>
          <Button type="submit" disabled={submitting} leftIcon={<LinkIcon className="w-4 h-4"/>}>{submitting?'Mengirim...':'Kirim untuk Verifikasi'}</Button>
        </form>
      </Modal>
    </div>
  );
};
