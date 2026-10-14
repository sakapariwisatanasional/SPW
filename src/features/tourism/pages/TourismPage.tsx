import React, { useEffect, useMemo, useState } from 'react';
import { Compass, MapPin, RefreshCw, AlertCircle, Plus, CalendarDays, PackageOpen } from 'lucide-react';
import { Card, Badge, Modal, Button } from '../../../components/ui';
import { tourismApi, Destination, TourPackage } from '../../../services/api/tourism.api';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { ROLES } from '../../../config/constants';
import { formatCurrencyIDR } from '../../../utils/formatters';

export const TourismPage:React.FC=()=>{
  const {currentUser,isAuthenticated}=useAuthStore();
  const {addToast}=useUIStore();
  const [tab,setTab]=useState<'destinations'|'packages'|'mine'>('destinations');
  const [destinations,setDestinations]=useState<Destination[]>([]),[packages,setPackages]=useState<TourPackage[]>([]),[mine,setMine]=useState<TourPackage[]>([]);
  const [search,setSearch]=useState(''),[loading,setLoading]=useState(true),[error,setError]=useState('');
  const [modal,setModal]=useState(false),[submitting,setSubmitting]=useState(false);
  const [form,setForm]=useState({nama_paket:'',deskripsi:'',harga:'',durasi:'',lokasi:'',kontak:'',url:'',foto_utama:''});
  const canSubmit=isAuthenticated&&!!currentUser&&currentUser.role!==ROLES.PUBLIC_USER;

  const load=async()=>{setLoading(true);setError('');try{
    const d=await tourismApi.listDestinations({limit:100});setDestinations(Array.isArray(d.data)?d.data:[]);
    try{const p=await tourismApi.listPackages({limit:100});setPackages(Array.isArray(p.data)?p.data:[]);}catch{setPackages([]);}
    if(canSubmit){try{const m=await tourismApi.listMyPackages();setMine(Array.isArray(m.data)?m.data:[]);}catch{setMine([]);}}
  }catch(e:any){setError(e?.message||'Gagal memuat data pariwisata dari GAS.');}finally{setLoading(false);}};
  useEffect(()=>{void load();},[canSubmit]);

  const filtered=useMemo(()=>{const q=search.trim().toLowerCase();return destinations.filter(d=>!q||[d.nama_destinasi,d.kategori,d.lokasi].some(v=>String(v||'').toLowerCase().includes(q)));},[destinations,search]);

  const submit=async(e:React.FormEvent)=>{e.preventDefault();if(!form.nama_paket.trim())return;setSubmitting(true);try{await tourismApi.submitPackage({...form,harga:Number(form.harga||0)});setForm({nama_paket:'',deskripsi:'',harga:'',durasi:'',lokasi:'',kontak:'',url:'',foto_utama:''});setModal(false);setTab('mine');const m=await tourismApi.listMyPackages();setMine(Array.isArray(m.data)?m.data:[]);addToast({type:'success',title:'Paket wisata terkirim',message:'Paket akan tampil umum setelah diverifikasi.'});}catch(e:any){addToast({type:'error',title:'Gagal mengirim paket',message:e?.message||'Terjadi kesalahan.'});}finally{setSubmitting(false);}};

  return <div className="space-y-4 pb-4">
    <div className="flex items-center justify-between gap-3"><div><div className="flex items-center gap-2"><Compass className="w-5 h-5 text-[#43A047]"/><h1 className="text-xl font-black text-slate-900">Wisata</h1></div><p className="text-xs text-slate-500 mt-1">Destinasi publik dan paket wisata karya anggota.</p></div><div className="flex gap-2"><button onClick={()=>void load()} className="w-10 h-10 rounded-xl border border-slate-200 bg-white grid place-items-center"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>{canSubmit&&<button onClick={()=>setModal(true)} className="w-10 h-10 rounded-xl bg-[#43A047] text-white grid place-items-center"><Plus className="w-5 h-5"/></button>}</div></div>

    <div className="flex gap-2 overflow-x-auto no-scrollbar"><button onClick={()=>setTab('destinations')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${tab==='destinations'?'bg-[#0B5CAB] text-white':'bg-white border border-slate-200'}`}>Destinasi</button><button onClick={()=>setTab('packages')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${tab==='packages'?'bg-[#43A047] text-white':'bg-white border border-slate-200'}`}>Paket Wisata</button>{canSubmit&&<button onClick={()=>setTab('mine')} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap ${tab==='mine'?'bg-[#7E57C2] text-white':'bg-white border border-slate-200'}`}>Paket Saya</button>}</div>

    {tab==='destinations'&&<input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Cari destinasi..." className="w-full rounded-xl border border-slate-200 px-3 py-2 bg-white text-sm"/>}

    {loading?<Card><p className="text-sm text-slate-500">Memuat Wisata...</p></Card>:error?<Card><div className="flex gap-2 text-red-700"><AlertCircle className="w-4 h-4"/>{error}</div></Card>:tab==='destinations'?(filtered.length===0?<Card><p className="text-sm text-slate-500">Belum ada destinasi aktif.</p></Card>:<div className="flex gap-3 overflow-x-auto snap-x pb-2 no-scrollbar">{filtered.map(d=><article key={d.id} className="min-w-[78%] sm:min-w-[340px] snap-start bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="aspect-[16/9] bg-slate-100">{d.foto_utama?<img src={d.foto_utama} alt={d.nama_destinasi} className="w-full h-full object-cover"/>:<div className="w-full h-full grid place-items-center"><Compass className="w-9 h-9 text-slate-300"/></div>}</div><div className="p-3"><h3 className="font-extrabold text-sm">{d.nama_destinasi}</h3><p className="text-xs text-slate-500 mt-1 inline-flex items-center gap-1"><MapPin className="w-3 h-3"/>{d.lokasi||'-'}</p></div></article>)}</div>):(
      (tab==='packages'?packages:mine).length===0?<Card><p className="text-sm text-slate-500">Belum ada paket wisata pada bagian ini.</p></Card>:<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{(tab==='packages'?packages:mine).map(p=><article key={p.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden"><div className="aspect-[16/9] bg-slate-100">{p.foto_utama?<img src={p.foto_utama} alt={p.nama_paket} className="w-full h-full object-cover"/>:<div className="w-full h-full grid place-items-center"><PackageOpen className="w-9 h-9 text-slate-300"/></div>}</div><div className="p-3 space-y-1.5"><div className="flex items-start justify-between gap-2"><h3 className="font-extrabold text-sm">{p.nama_paket}</h3>{tab==='mine'&&<Badge variant={String(p.status).toUpperCase()==='ACTIVE'?'green':String(p.status).toUpperCase()==='REJECTED'?'red':'gray'}>{p.status}</Badge>}</div>{p.lokasi&&<p className="text-xs text-slate-500 inline-flex items-center gap-1"><MapPin className="w-3 h-3"/>{p.lokasi}</p>}<div className="flex justify-between text-xs"><span className="inline-flex gap-1 items-center text-slate-500"><CalendarDays className="w-3 h-3"/>{p.durasi||'-'}</span><strong className="text-[#43A047]">{formatCurrencyIDR(Number(p.harga||0))}</strong></div>{p.deskripsi&&<p className="text-xs text-slate-600 line-clamp-2">{p.deskripsi}</p>}</div></article>)}</div>
    )}

    <Modal isOpen={modal} onClose={()=>setModal(false)} title="Tambah Paket Wisata" description="Paket akan berstatus PENDING sampai diverifikasi pengurus."><form onSubmit={submit} className="space-y-3"><input required value={form.nama_paket} onChange={e=>setForm({...form,nama_paket:e.target.value})} placeholder="Nama paket" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><textarea value={form.deskripsi} onChange={e=>setForm({...form,deskripsi:e.target.value})} rows={3} placeholder="Deskripsi paket" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><div className="grid grid-cols-2 gap-2"><input value={form.harga} onChange={e=>setForm({...form,harga:e.target.value})} inputMode="numeric" placeholder="Harga" className="rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.durasi} onChange={e=>setForm({...form,durasi:e.target.value})} placeholder="Durasi" className="rounded-xl border border-slate-200 px-3 py-2.5"/></div><input value={form.lokasi} onChange={e=>setForm({...form,lokasi:e.target.value})} placeholder="Lokasi" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.kontak} onChange={e=>setForm({...form,kontak:e.target.value})} placeholder="Kontak/WhatsApp" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.url} onChange={e=>setForm({...form,url:e.target.value})} placeholder="URL informasi/pemesanan (opsional)" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><input value={form.foto_utama} onChange={e=>setForm({...form,foto_utama:e.target.value})} placeholder="URL foto paket" className="w-full rounded-xl border border-slate-200 px-3 py-2.5"/><Button type="submit" disabled={submitting}>{submitting?'Mengirim...':'Kirim untuk Verifikasi'}</Button></form></Modal>
  </div>;
};
