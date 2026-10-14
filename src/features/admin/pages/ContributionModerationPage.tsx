import React, { useEffect, useState } from 'react';
import { Newspaper, MapPinned, ShoppingBag, RefreshCw, Check, X, ExternalLink, AlertCircle } from 'lucide-react';
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
      <div className="flex items-center justify-between gap-3">
        <div><h2 className="text-lg font-black text-slate-900">Verifikasi Kontribusi Anggota</h2><p className="text-xs text-slate-500">Konten, paket wisata, dan produk hanya tampil umum setelah disetujui.</p></div>
        <button onClick={()=>void load()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar">
        {tabs.map(t=>{const I=t.icon;return <button key={t.id} onClick={()=>setTab(t.id)} className={`px-3 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 whitespace-nowrap ${tab===t.id?'bg-[#0B5CAB] text-white':'bg-white border border-slate-200 text-slate-600'}`}><I className="w-4 h-4"/>{t.label}<span className={`rounded-full px-1.5 py-0.5 text-[10px] ${tab===t.id?'bg-white/20':'bg-slate-100'}`}>{t.count}</span></button>})}
      </div>

      {error && <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 flex gap-2"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5"/>{error}</div>}

      {tab==='content' && (content.length===0 ? <Empty/> : <div className="space-y-2">{content.map(i=><div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex gap-3"><div className="w-20 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">{i.thumbnail_url?<img src={i.thumbnail_url} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full grid place-items-center"><Newspaper className="w-6 h-6 text-slate-300"/></div>}</div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-slate-900 line-clamp-1">{i.title}</div><div className="text-xs text-slate-500 line-clamp-2">{i.description||i.url}</div><div className="text-[10px] text-slate-400 mt-1">{i.member_name||i.member_id}</div>{i.url&&<a href={i.url} target="_blank" rel="noreferrer" className="text-[10px] font-bold text-[#0B5CAB] inline-flex gap-1 items-center mt-1"><ExternalLink className="w-3 h-3"/>Buka link</a>}</div>{actionButtons('content',i.id)}</div>)}</div>)}

      {tab==='tourism' && (packages.length===0 ? <Empty/> : <div className="space-y-2">{packages.map(i=><div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex gap-3"><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-slate-900">{i.nama_paket}</div><div className="text-xs text-slate-500 line-clamp-2">{i.deskripsi||i.lokasi||'-'}</div><div className="text-[10px] text-slate-400 mt-1">{i.submitted_by_name||i.submitted_by} · {formatCurrencyIDR(Number(i.harga||0))}</div></div>{actionButtons('tourism',i.id)}</div>)}</div>)}

      {tab==='commerce' && (products.length===0 ? <Empty/> : <div className="space-y-2">{products.map(i=><div key={i.id} className="rounded-2xl border border-slate-200 bg-white p-3 flex gap-3"><div className="w-16 h-16 rounded-xl bg-slate-100 overflow-hidden shrink-0">{i.foto_utama?<img src={i.foto_utama} alt="" className="w-full h-full object-cover"/>:<div className="w-full h-full grid place-items-center"><ShoppingBag className="w-6 h-6 text-slate-300"/></div>}</div><div className="min-w-0 flex-1"><div className="text-sm font-extrabold text-slate-900">{i.nama_produk}</div><div className="text-xs text-slate-500 line-clamp-2">{i.deskripsi||i.kategori||'-'}</div><div className="text-[10px] text-slate-400 mt-1">{i.submitted_by_name||i.submitted_by} · {formatCurrencyIDR(Number(i.harga||0))}</div></div>{actionButtons('commerce',i.id)}</div>)}</div>)}
    </div>
  );
};

const Empty:React.FC=()=> <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">Tidak ada kontribusi yang menunggu verifikasi.</div>;
