import React, { useEffect, useMemo, useState } from 'react';
import { ShoppingBag, Plus, RefreshCw, AlertCircle, PackageCheck } from 'lucide-react';
import { Card, Badge, Modal, Button } from '../../../components/ui';
import { commerceApi, Product, ProductCategory } from '../../../services/api/commerce.api';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const CommercePage:React.FC=()=>{
  const {currentUser,isAuthenticated}=useAuthStore();
  const {addToast}=useUIStore();
  const [products,setProducts]=useState<Product[]>([]),[mine,setMine]=useState<Product[]>([]),[categories,setCategories]=useState<ProductCategory[]>([]);
  const [category,setCategory]=useState('ALL'),[search,setSearch]=useState(''),[tab,setTab]=useState<'shop'|'mine'>('shop');
  const [loading,setLoading]=useState(true),[error,setError]=useState(''),[modal,setModal]=useState(false),[submitting,setSubmitting]=useState(false);
  const [form,setForm]=useState({nama_produk:'',kategori:'',deskripsi:'',harga:'',stok:'',berat_gram:'',foto_utama:''});
  const canSubmit=isAuthenticated&&!!currentUser&&currentUser.role!==ROLES.PUBLIC_USER;

  const load=async()=>{setLoading(true);setError('');try{
    const productRes=await commerceApi.listProducts({limit:100}); setProducts(Array.isArray(productRes.data)?productRes.data:[]);
    try{const catRes=await commerceApi.listCategories();setCategories(Array.isArray(catRes.data)?catRes.data:[]);}catch{setCategories([]);}
    if(canSubmit){try{const m=await commerceApi.listMyProducts();setMine(Array.isArray(m.data)?m.data:[]);}catch{setMine([]);}}
  }catch(e:any){setError(e?.message||'Gagal memuat Kedai SAKA dari GAS.');}finally{setLoading(false);}};
  useEffect(()=>{void load();},[canSubmit]);

  const filtered=useMemo(()=>products.filter(p=>{if(category!=='ALL'&&p.kategori!==category)return false;const q=search.trim().toLowerCase();return !q||[p.nama_produk,p.deskripsi,p.sku,p.kategori].some(v=>String(v||'').toLowerCase().includes(q));}),[products,category,search]);
  const visible=tab==='shop'?filtered:mine;

  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!form.nama_produk.trim())return;setSubmitting(true);try{await commerceApi.submitProduct({...form,harga:Number(form.harga||0),stok:Number(form.stok||0),berat_gram:Number(form.berat_gram||0)});setForm({nama_produk:'',kategori:'',deskripsi:'',harga:'',stok:'',berat_gram:'',foto_utama:''});setModal(false);setTab('mine');const m=await commerceApi.listMyProducts();setMine(Array.isArray(m.data)?m.data:[]);addToast({type:'success',title:'Produk terkirim',message:'Produk akan tampil di Kedai setelah diverifikasi.'});}catch(e:any){addToast({type:'error',title:'Gagal mengirim produk',message:e?.message||'Terjadi kesalahan.'});}finally{setSubmitting(false);}};

  return <div className="space-y-4 pb-4">
    <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><ShoppingBag className="w-5 h-5 text-[#FB8C00]"/><h1 className="text-xl font-black text-slate-900">Kedai SAKA</h1></div><p className="text-xs text-slate-500 mt-1">Produk anggota tampil umum setelah lolos verifikasi.</p></div><div className="flex gap-2"><button onClick={()=>void load()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>{canSubmit&&<button onClick={()=>setModal(true)} className="w-10 h-10 rounded-xl bg-[#FB8C00] text-white grid place-items-center"><Plus className="w-5 h-5"/></button>}</div></div>

    <div className="flex gap-2 overflow-x-auto no-scrollbar"><button onClick={()=>setTab('shop')} className={`px-4 py-2 rounded-full text-xs font-bold ${tab==='shop'?'bg-[#0B5CAB] text-white':'bg-white border border-slate-200'}`}>Kedai</button>{canSubmit&&<button onClick={()=>setTab('mine')} className={`px-4 py-2 rounded-full text-xs font-bold ${tab==='mine'?'bg-[#FB8C00] text-white':'bg-white border border-slate-200'}`}>Produk Saya</button>}</div>

    {tab==='shop'&&<div className="grid grid-cols-[140px_1fr] gap-2"><select value={category} onChange={e=>setCategory(e.target.value)} className="rounded-xl border border-slate-200 px-2 py-2 bg-white text-xs"><option value="ALL">Semua</option>{categories.map(c=><option key={c.id} value={c.nama_kategori}>{c.nama_kategori}</option>)}</select><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari produk..." className="rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm"/></div>}

    {loading?<Card><p className="text-sm text-slate-500">Memuat produk...</p></Card>:error?<Card><div className="flex gap-2 text-red-700"><AlertCircle className="w-4 h-4"/>{error}</div></Card>:visible.length===0?<Card><p className="text-sm text-slate-500">Belum ada produk pada bagian ini.</p></Card>:<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">{visible.map(p=><article key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="aspect-square bg-slate-100">{p.foto_utama?<img src={p.foto_utama} alt={p.nama_produk} className="w-full h-full object-cover" referrerPolicy="no-referrer"/>:<div className="w-full h-full grid place-items-center"><PackageCheck className="w-8 h-8 text-slate-300"/></div>}</div><div className="p-3"><div className="flex items-start justify-between gap-1"><h3 className="text-xs font-extrabold text-slate-900 line-clamp-2">{p.nama_produk}</h3>{tab==='mine'&&<Badge variant={String(p.status).toUpperCase()==='ACTIVE'?'green':String(p.status).toUpperCase()==='REJECTED'?'red':'gray'}>{p.status}</Badge>}</div><p className="mt-1 text-sm font-black text-[#0B5CAB]">{formatCurrencyIDR(Number(p.harga||0))}</p><p className="text-[10px] text-slate-400 mt-1">{p.kategori||'Produk anggota'}</p></div></article>)}</div>}

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Tambah Produk" description="Produk disimpan sebagai PENDING dan baru tampil umum setelah diverifikasi."><form onSubmit={submit} className="space-y-3"><input required value={form.nama_produk} onChange={e=>setForm({...form,nama_produk:e.target.value})} placeholder="Nama produk" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.kategori} onChange={e=>setForm({...form,kategori:e.target.value})} placeholder="Kategori" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><textarea value={form.deskripsi} onChange={e=>setForm({...form,deskripsi:e.target.value})} placeholder="Deskripsi" rows={3} className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><div className="grid grid-cols-2 gap-2"><input inputMode="numeric" value={form.harga} onChange={e=>setForm({...form,harga:e.target.value})} placeholder="Harga" className="rounded-xl border border-slate-200 px-3 py-2.5"/><input inputMode="numeric" value={form.stok} onChange={e=>setForm({...form,stok:e.target.value})} placeholder="Stok" className="rounded-xl border border-slate-200 px-3 py-2.5"/></div><input value={form.foto_utama} onChange={e=>setForm({...form,foto_utama:e.target.value})} placeholder="URL foto produk" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><Button type="submit" disabled={submitting}>{submitting?'Mengirim...':'Kirim untuk Verifikasi'}</Button></form></Modal>
  </div>;
};
