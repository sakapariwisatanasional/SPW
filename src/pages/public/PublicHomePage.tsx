/**
 * SPWN Apps 2.0 - Public Home Page
 * Location: src/pages/public/PublicHomePage.tsx
 */

import React, { useState } from 'react';
import {
  ShieldCheck,
  UserPlus,
  LogIn,
  Compass,
  MapPin,
  Sparkles,
  ArrowRight,
  Award,
  CheckCircle2,
  Users,
  Building,
  TreePine,
  Utensils,
  BookOpen,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useUIStore } from '../../stores/uiStore';
import { LoginModal } from '../../components/auth/LoginModal';

export const PublicHomePage: React.FC = () => {
  const { setActiveView } = useUIStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const kridaList = [
    {
      id: 'pemandu',
      title: 'Krida Pemandu Wisata',
      code: 'KRD-01',
      desc: 'Pengembangan kompetensi pemanduan wisata budaya, alam, interpretasi destinasi, dan etika sapta pesona.',
      icon: Compass,
      color: 'from-blue-600 to-cyan-500',
    },
    {
      id: 'penyuluh',
      title: 'Krida Penyuluh Pariwisata',
      code: 'KRD-02',
      desc: 'Sosialisasi sadar wisata, kampanye ramah wisatawan, pelestarian lingkungan hidup, dan edukasi publik.',
      icon: Users,
      color: 'from-emerald-600 to-teal-500',
    },
    {
      id: 'mice',
      title: 'Krida Mice & Event',
      code: 'KRD-03',
      desc: 'Keahlian perencanaan event pariwisata nusantara, festival budaya daerah, pameran, dan konferensi pemuda.',
      icon: Building,
      color: 'from-amber-600 to-orange-500',
    },
    {
      id: 'kuliner',
      title: 'Krida Kuliner & Cinderamata',
      code: 'KRD-04',
      desc: 'Pemberdayaan kearifan kuliner tradisional, produk kerajinan tangan lokal, dan kewirausahaan kreatif pemuda.',
      icon: Utensils,
      color: 'from-rose-600 to-pink-500',
    },
  ];

  return (
    <div className="space-y-12">
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />

      {/* Hero Banner Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0B1F33] via-[#004b87] to-[#009B4D] text-white p-8 sm:p-12 lg:p-16 shadow-xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Ekosistem Digital Gerakan Pramuka • SPWN 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Harmoni Kepariwisataan Nusantara bersama <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-emerald-300 to-white">SAKA Pariwisata</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed max-w-2xl font-normal">
            Platform terpadu registrasi anggota, penerbitan KTA Digital terstandarisasi, verifikasi keaslian identitas secara seketika, dan eksplorasi destinasi unggulan Indonesia.
          </p>

          {/* Action CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 w-full">
            <Button
              size="lg"
              variant="primary"
              className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-lg shadow-emerald-500/30 text-sm"
              leftIcon={<ShieldCheck className="w-5 h-5" />}
              onClick={() => setActiveView('verification')}
            >
              Cek Keaslian KTA
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-md text-sm"
              leftIcon={<UserPlus className="w-5 h-5" />}
              onClick={() => setActiveView('registration')}
            >
              Daftar Anggota Baru
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100 font-bold shadow-md text-sm"
              leftIcon={<LogIn className="w-5 h-5 text-[#0066B3]" />}
              onClick={() => setIsLoginModalOpen(true)}
            >
              Masuk ke Portal
            </Button>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300 border-t border-white/10">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Standar KTA Nasional</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-PII Dynamic QR</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Google Apps Script Cloud</span>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Access Restriction Notice */}
      <section className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-amber-900">Peraturan Akses Dashboard SPWN</h4>
            <p className="text-xs text-amber-700 mt-0.5">
              Area Dashboard Anggota dan Panel Administrasi dilindungi otentikasi resmi. Pengunjung publik dapat melakukan verifikasi KTA, pendaftaran, melihat warta, dan eksplorasi destinasi tanpa batas.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="primary"
          className="shrink-0 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs"
          onClick={() => setIsLoginModalOpen(true)}
        >
          Masuk Akun Anda
        </Button>
      </section>

      {/* 4 Krida Unggulan Section */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-bold text-[#0066B3] uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Peminatan Spesialisasi
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            4 Krida Saka Pariwisata Indonesia
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Pendidikan dan pelatihan keterampilan khusus kepariwisataan untuk membekali Pramuka Penegak dan Pandega.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {kridaList.map((k) => {
            const Icon = k.icon;
            return (
              <div
                key={k.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${k.color} flex items-center justify-center text-white font-bold mb-4 shadow-sm`}>
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  {k.code}
                </span>
                <h3 className="text-sm font-bold text-slate-900 mt-1 mb-2 group-hover:text-[#0066B3] transition-colors">
                  {k.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {k.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Quick Service Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div
          onClick={() => setActiveView('tourism')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#0066B3] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center mb-3">
            <Compass className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#0066B3] flex items-center justify-between">
            Destinasi Wisata Nusantara
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Jelajahi potensi wisata daerah dan binaan obyek wisata oleh pangkalan Saka Pariwisata di seluruh Indonesia.
          </p>
        </div>

        <div
          onClick={() => setActiveView('content')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-[#009B4D] transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009B4D] flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 group-hover:text-[#009B4D] flex items-center justify-between">
            Warta & Kabar Kegiatan
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Informasi terkini kegiatan kepramukaan pariwisata, perkemahan bakti, diklat krida, dan artikel edukasi.
          </p>
        </div>

        <div
          onClick={() => setActiveView('commerce')}
          className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-amber-500 transition-all cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-3">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-sm text-slate-900 group-hover:text-amber-600 flex items-center justify-between">
            Kedai SAKA & UMKM Binaan
            <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Dukung produk lokal, atribut resmi Saka Pariwisata, dan hasil karya kewirausahaan Pramuka mandiri.
          </p>
        </div>
      </section>
    </div>
  );
};
