import React, { useEffect, useState } from 'react';
import { Newspaper, MapPinned, ShoppingBag, RefreshCw, Check, X, ExternalLink, AlertCircle, Plus, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import { contentApi, ContentItem } from '../../../services/api/content.api';
import { tourismApi, TourPackage } from '../../../services/api/tourism.api';
import { commerceApi, Product } from '../../../services/api/commerce.api';
import { useUIStore } from '../../../stores/uiStore';
import { formatCurrencyIDR } from '../../../utils/formatters';

type Tab = 'content' | 'tourism' | 'commerce';

export const ContributionModerationPage: React.FC = () => {
  const { addToast } = useUIStore();
  const [tab, setTab] = useState<Tab>('content');
  const [content, setContent] = useState<ContentItem[]>([]);
  const [packages, setPackages] = useState<TourPackage[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [sourceUrl, setSourceUrl] = useState('');
  const [sourceCaption, setSourceCaption] = useState('');
  const [creating, setCreating] = useState(false);
  const [createPreviewError, setCreatePreviewError] = useState('');
  const [linkPreview, setLinkPreview] = useState<{ title?: string; description?: string; thumbnail_url?: string; url?: string } | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [c, t, p] = await Promise.all([
        contentApi.listPending(),
        tourismApi.listPendingPackages(),
        commerceApi.listPendingProducts(),
      ]);
      setContent(Array.isArray(c.data) ? c.data : []);
      setPackages(Array.isArray(t.data) ? t.data : []);
      setProducts(Array.isArray(p.data) ? p.data : []);
    } catch (e: any) {
      setError(e?.message || 'Gagal memuat antrean kontribusi dari GAS.');
    } finally {
      setLoading(false);
    }
  };

  const previewContentLink = async () => {
    if (!sourceUrl.trim()) {
      setCreatePreviewError('Masukkan URL sumber terlebih dahulu.');
      return;
    }
    setPreviewing(true);
    setCreatePreviewError('');
    try {
      const response = await contentApi.previewLink(sourceUrl.trim());
      if (response?.success === false) throw new Error(response.message || 'Metadata tautan tidak dapat dibaca.');
      const raw: any = response?.data;
      const result = raw?.data || raw;
      setLinkPreview(result);
      if (!result?.thumbnail_url) setCreatePreviewError('Tautan berhasil diperiksa, tetapi platform tidak menyediakan thumbnail yang dapat diakses. Konten tetap dapat disimpan dengan URL sumbernya.');
    } catch (e:any) {
      setLinkPreview(null);
      setCreatePreviewError(e?.message || 'Metadata tautan tidak dapat dibaca. Kamu tetap dapat menyimpan URL sumber.');
    } finally {
      setPreviewing(false);
    }
  };

  const createContent = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!sourceUrl.trim()) {
      addToast({ type:'error', title:'URL wajib diisi', message:'Tempel URL sumber publikasi terlebih dahulu.' });
      return;
    }
    setCreating(true);
    setCreatePreviewError('');
    try {
      let thumbnailUrl = linkPreview?.thumbnail_url || '';
      if (thumbnailFile) {
        setUploadingThumbnail(true);
        const dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => typeof reader.result === 'string' ? resolve(reader.result) : reject(new Error('Gagal membaca gambar.'));
          reader.onerror = () => reject(new Error('Gagal membaca gambar.'));
          reader.readAsDataURL(thumbnailFile);
        });
        const commaIndex = dataUrl.indexOf(',');
        if (commaIndex < 0) throw new Error('Format gambar tidak valid.');
        const uploadResponse = await contentApi.uploadThumbnail({
          file_name: thumbnailFile.name,
          mime_type: thumbnailFile.type,
          base64_data: dataUrl.slice(commaIndex + 1)
        });
        if (uploadResponse?.success === false) throw new Error(uploadResponse.message || 'Gagal mengunggah thumbnail ke Google Drive.');
        const uploadData: any = uploadResponse?.data;
        const uploaded = uploadData?.data || uploadData;
        thumbnailUrl = String(uploaded?.thumbnail_url || uploaded?.url || '');
        if (!thumbnailUrl) throw new Error('GAS tidak mengembalikan URL thumbnail Drive.');
      }
      const finalPayload = {
        url: sourceUrl.trim(),
        description: sourceCaption.trim(),
        caption: sourceCaption.trim(),
        content_type: 'BERITA',
        thumbnail_url: thumbnailUrl
      };
      const finalResponse = await contentApi.create(finalPayload);
      if (finalResponse?.success === false) throw new Error(finalResponse.message || 'GAS menolak penambahan konten.');
      setSourceUrl('');
      setSourceCaption('');
      setLinkPreview(null);
      setThumbnailFile(null);
      setThumbnailPreview('');
      setShowCreateForm(false);
      addToast({ type:'success', title:'Konten tersimpan', message:'Konten disimpan melalui GAS dan masuk ke antrean verifikasi.' });
      await load();
    } catch (e:any) {
      setCreatePreviewError(e?.message || 'Gagal menyimpan konten. Periksa URL dan koneksi GAS.');
      addToast({ type:'error', title:'Gagal menambahkan konten', message:e?.message || 'Terjadi kesalahan saat menyimpan konten.' });
    } finally {
      setCreating(false);
      setUploadingThumbnail(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const decide = async (kind:Tab, id:string, approve:boolean) => {
    const note = approve ? '' : (window.prompt('Alasan penolakan (opsional):', '') || '');
    setProcessing(`${kind}:${id}`);
    try {
      if (kind === 'content') {
        if (approve) await contentApi.approve(id); else await contentApi.reject(id);
      } else if (kind === 'tourism') {
        await tourismApi.reviewPackage(id, approve ? 'APPROVE' : 'REJECT', note);
      } else {
        await commerceApi.reviewProduct(id, approve ? 'APPROVE' : 'REJECT', note);
      }
      addToast({ type:'success', title: approve ? 'Disetujui' : 'Ditolak', message: approve ? 'Kontribusi sekarang dapat tampil di halaman publik.' : 'Kontribusi tidak dipublikasikan.' });
      await load();
    } catch (e:any) {
      addToast({ type:'error', title:'Moderasi gagal', message:e?.message || 'Terjadi kesalahan.' });
    } finally {
      setProcessing('');
    }
  };

  const tabs = [
    { id:'content' as Tab, label:'Warta', icon:Newspaper, count:content.length },
    { id:'tourism' as Tab, label:'Paket Wisata', icon:MapPinned, count:packages.length },
    { id:'commerce' as Tab, label:'Produk', icon:ShoppingBag, count:products.length },
  ];

  const actionButtons = (kind:Tab,id:string) => (
    <div className="flex gap-2 shrink-0">
      <button disabled={processing===`${kind}:${id}`} onClick={()=>void decide(kind,id,false)} className="w-9 h-9 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 grid place-items-center disabled:opacity-50" aria-label="Tolak"><X className="w-4 h-4"/></button>
      <button disabled={processing===`${kind}:${id}`} onClick={()=>void decide(kind,id,true)} className="w-9 h-9 rounded-xl bg-emerald-600 text-white grid place-items-center disabled:opacity-50" aria-label="Setujui"><Check className="w-4 h-4"/></button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-[#E8E1D6] bg-gradient-to-r from-[#FFF8ED] to-white p-4 sm:p-5">
        <div><h2 className="text-lg font-black text-slate-900">Warta & Kontribusi</h2><p className="text-xs text-slate-500 mt-1">Kelola publikasi, paket wisata, dan produk dari satu tempat.</p></div>
        <div className="flex gap-2">
          {tab==='content' && <button type="button" onClick={()=>setShowCreateForm(v=>!v)} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#6F3BC5] px-3 text-xs font-bold text-white"><Plus className="w-4 h-4"/><span className="hidden sm:inline">Tambah konten</span></button>}
          <button onClick={()=>void load()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center" aria-label="Muat ulang"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
        </div>
      </div>

      {tab==='content' && showCreateForm && <form onSubmit={createContent} className="rounded-2xl border border-violet-100 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div><h3 className="font-black text-slate-900">Tambahkan publikasi dari tautan</h3><p className="text-xs text-slate-500 mt-1">Judul, deskripsi, dan thumbnail akan dicoba diambil dari metadata URL melalui GAS.</p></div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-4">
          <div className="space-y-3">
            <div><label className="block text-xs font-bold text-slate-700 mb-1">URL sumber publikasi</label><input type="url" required value={sourceUrl} onChange={e=>{setSourceUrl(e.target.value);setLinkPreview(null)}} placeholder="https://www.instagram.com/... atau tautan YouTube/TikTok" className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/><p className="mt-1 text-[11px] text-slate-500">URL ini akan disimpan sebagai tautan sumber yang dapat dibuka pembaca.</p><button type="button" onClick={()=>void previewContentLink()} disabled={previewing} className="mt-2 inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-700 disabled:opacity-50"><ExternalLink className="w-3.5 h-3.5"/>{previewing?'Memeriksa tautan...':'Pratinjau tautan'}</button></div>
            <div><label className="block text-xs font-bold text-slate-700 mb-1">Caption / konteks (opsional)</label><textarea value={sourceCaption} onChange={e=>setSourceCaption(e.target.value)} rows={3} placeholder="Tambahkan konteks untuk anggota lain..." className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"/></div>
          </div>
          <div className="space-y-2">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-[#F7F8F4] min-h-[150px]">
              {thumbnailPreview ? <img src={thumbnailPreview} alt="Pratinjau thumbnail yang dipilih" className="aspect-video w-full object-cover" /> : linkPreview?.thumbnail_url ? <img src={linkPreview.thumbnail_url} alt={linkPreview.title || 'Pratinjau publikasi'} referrerPolicy="no-referrer" className="aspect-video w-full object-cover" onError={()=>setLinkPreview(previous=>previous?{...previous,thumbnail_url:''}:previous)}/> : <div className="min-h-[150px] p-4 flex flex-col items-center justify-center text-center"><ImageIcon className="w-8 h-8 text-slate-300"/><p className="mt-2 text-xs font-bold text-slate-600">{linkPreview ? 'Thumbnail tidak tersedia' : 'Pratinjau thumbnail'}</p><p className="mt-1 text-[11px] text-slate-500">{linkPreview ? 'Unggah gambar sendiri jika platform tidak menyediakan thumbnail.' : 'Tempel URL lalu pilih Pratinjau tautan.'}</p></div>}
              {(linkPreview || thumbnailFile) && <div className="p-3 bg-white"><p className="text-xs font-bold text-slate-800 line-clamp-2">{linkPreview?.title || thumbnailFile?.name}</p>{linkPreview?.url && <a href={linkPreview.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-[11px] font-bold text-[#0B5CAB]"><ExternalLink className="w-3 h-3"/>Buka sumber</a>}</div>}
            </div>
            <label className="block rounded-xl border border-dashed border-violet-300 bg-violet-50/60 p-3 cursor-pointer hover:bg-violet-50">
              <span className="flex items-center gap-2 text-xs font-bold text-violet-800"><ImageIcon className="w-4 h-4"/>{thumbnailFile ? 'Ganti gambar thumbnail' : 'Thumbnail tidak muncul? Unggah gambar'}</span>
              <span className="mt-1 block text-[11px] text-slate-500">JPG, PNG, atau WebP · maksimal 5 MB. Gambar akan diunggah ke Google Drive melalui GAS.</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" className="mt-2 block w-full text-xs text-slate-600" onChange={event => {
                const file = event.target.files?.[0] || null;
                if (!file) return;
                if (!['image/jpeg','image/png','image/webp'].includes(file.type)) {
                  addToast({ type:'error', title:'Format gambar tidak didukung', message:'Pilih gambar JPG, PNG, atau WebP.' });
                  event.currentTarget.value = '';
                  return;
                }
                if (file.size > 5 * 1024 * 1024) {
                  addToast({ type:'error', title:'Gambar terlalu besar', message:'Ukuran maksimum gambar adalah 5 MB.' });
                  event.currentTarget.value = '';
                  return;
                }
                setThumbnailFile(file);
                const reader = new FileReader();
                reader.onload = () => setThumbnailPreview(typeof reader.result === 'string' ? reader.result : '');
                reader.readAsDataURL(file);
              }} />
            </label>
          </div>
        </div>
        {createPreviewError && <div className="rounded-xl bg-rose-50 p-3 text-xs text-rose-700">{createPreviewError}</div>}
        <div className="flex justify-end gap-2"><button type="button" onClick={()=>{setShowCreateForm(false);setSourceUrl('');setSourceCaption('');setLinkPreview(null);setThumbnailFile(null);setThumbnailPreview('');setCreatePreviewError('')}} className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600">Batal</button><button type="submit" disabled={creating} className="inline-flex items-center gap-2 rounded-xl bg-[#6F3BC5] px-4 py-2 text-xs font-bold text-white disabled:opacity-50"><LinkIcon className="w-4 h-4"/>{uploadingThumbnail?'Mengunggah ke Drive...':creating?'Menyimpan...':'Simpan konten'}</button></div>
      </form>}

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map(t=>{const I=t.icon;return <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 whitespace-nowrap ${tab===t.id?'bg-[#0B5CAB] text-white':'bg-white border border-slate-200 text-slate-600'}`}><I className="w-4 h-4"/>{t.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab===t.id?'bg-white/20':'bg-slate-100'}`}>{t.count}</span></button>})}
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>{error}</div>}

      {tab==='content' && (content.length===0 ? <Empty/> : <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">{content.map(i=><div key={i.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="aspect-[16/9] bg-[#F1F6F0] overflow-hidden">{i.thumbnail_url?<img src={i.thumbnail_url} alt={i.title || 'Thumbnail Warta'} className="h-full w-full object-cover" referrerPolicy="no-referrer"/>:<div className="w-full h-full grid place-items-center"><Newspaper className="w-6 h-6 text-slate-300"/></div>}</div><div className="p-4"><div className="text-sm font-extrabold text-slate-900 line-clamp-2">{i.title}</div><div className="text-xs text-slate-500 line-clamp-2">{i.description||i.url}</div><div className="text-[10px] text-slate-400 mt-1">{i.member_name||i.member_id}</div>{i.url&&<a href={i.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#0B5CAB] inline-flex gap-1 items-center mt-1"><ExternalLink className="w-3 h-3"/>Buka link</a>}</div>{actionButtons('content',i.id)}</div>)}</div>)}

      {tab==='tourism' && (packages.length===0 ? <Empty/> : <div className="space-y-2">{packages.map(i=><div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex gap-3"><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-slate-900">{i.nama_paket}</div><div className="text-xs text-slate-500 line-clamp-2">{i.deskripsi||i.lokasi||'-'}</div><div className="text-[10px] text-slate-400 mt-1">{i.submitted_by_name||i.submitted_by} · {formatCurrencyIDR(Number(i.harga||0))}</div></div>{actionButtons('tourism',i.id)}</div>)}</div>)}

      {tab==='commerce' && (products.length===0 ? <Empty/> : <div className="space-y-2">{products.map(i=><div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex gap-3"><div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">{i.foto_utama?<img src={i.foto_utama} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full grid place-items-center"><ShoppingBag className="w-6 h-6 text-slate-300"/></div>}</div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-slate-900">{i.nama_produk}</div><div className="text-xs text-slate-500 line-clamp-2">{i.deskripsi||i.kategori||'-'}</div><div className="text-[10px] text-slate-400 mt-1">{i.submitted_by_name||i.submitted_by} · {formatCurrencyIDR(Number(i.harga||0))}</div></div>{actionButtons('commerce',i.id)}</div>)}</div>)}
    </div>
  );
};

const Empty:React.FC=()=> <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">Tidak ada kontribusi yang menunggu verifikasi.</div>;
