import React from 'react';
import {
  Compass,
  QrCode,
  UserPlus,
  ShieldCheck,
  ShoppingBag,
  Newspaper,
  GraduationCap,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  LogIn,
  Globe2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useUIStore } from '../../../stores/uiStore';
import { useAuthStore } from '../../../stores/authStore';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { KRIDA_LIST } from '../../krida/data/kridaData';

export const PublicHomePage: React.FC = () => {
  const { setActiveView, setLoginModalOpen } = useUIStore();
  const { isAuthenticated, currentUser } = useAuthStore();

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B1F33] via-[#004C85] to-[#0066B3] text-white p-8 sm:p-12 shadow-xl border border-blue-900/30">
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -top-20 w-72 h-72 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-white">
            <span className="w-2 h-2 rounded-full bg-[#009B4D] animate-pulse" />
            <span>SAKA Pariwisata Network Indonesia • SPWN 2.0</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight sm:leading-none text-white">
            Ekosistem Terpadu <br />
            <span className="bg-gradient-to-r from-amber-300 to-emerald-300 bg-clip-text text-transparent">
              SAKA Pariwisata Indonesia
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-normal max-w-2xl">
            Sistem administrasi keanggotaan terintegrasi dengan Google Spreadsheet melalui Google Apps Script. 
            Menghadirkan KTA Digital dengan QR terenkripsi, penguasaan 23 Syarat Kecakapan Khusus (SKK), 
            serta promosi pariwisata Nusantara.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setActiveView('kta-verification')}
              leftIcon={<QrCode className="w-5 h-5 text-[#009B4D]" />}
              className="bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all cursor-pointer"
            >
              Verifikasi KTA Publik
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => setActiveView('registration')}
              leftIcon={<UserPlus className="w-5 h-5 text-white" />}
              className="border-white/30 text-white hover:bg-white/10 font-bold rounded-2xl cursor-pointer"
            >
              Daftar Anggota Baru
            </Button>

            {!isAuthenticated ? (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setLoginModalOpen(true)}
                leftIcon={<LogIn className="w-5 h-5 text-amber-300" />}
                className="border-amber-400/40 text-amber-200 hover:bg-amber-400/10 font-bold rounded-2xl cursor-pointer"
              >
                Masuk Pengurus & Anggota
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setActiveView(currentUser.role.includes('ADMIN') ? 'admin-portal' : 'membership')}
                leftIcon={<ShieldCheck className="w-5 h-5 text-emerald-300" />}
                className="border-emerald-400/40 text-emerald-200 hover:bg-emerald-400/10 font-bold rounded-2xl cursor-pointer"
              >
                Buka Dashboard Saya
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Akses Khusus & Aturan Pengguna Callout */}
      {!isAuthenticated && (
        <section className="p-4 sm:p-5 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-900 shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-950 uppercase tracking-wider">
                Aturan Hak Akses Pengguna (RBAC Enforcement)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                Pengunjung publik hanya dapat mengakses fitur publik (Verifikasi KTA, Pendaftaran, Direktori Wisata, dan SKK Learning). 
                Dashboard administrasi dan data keanggotaan dilindungi autentikasi login.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant="primary"
            onClick={() => setLoginModalOpen(true)}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="text-xs font-semibold rounded-xl shrink-0 cursor-pointer"
          >
            Masuk ke Akun
          </Button>
        </section>
      )}

      {/* 4 Pilar Krida SAKA Pariwisata */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">4 Krida SAKA Pariwisata</h2>
            <p className="text-xs text-slate-500">
              Spesialisasi pembinaan keterampilan kepramukaan di sektor pariwisata nasional
            </p>
          </div>
          <button
            onClick={() => setActiveView('skk-learning')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0066B3] hover:underline cursor-pointer"
          >
            <span>Lihat Semua 23 SKK</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {KRIDA_LIST.map((krida) => (
            <Card
              key={krida.id}
              className="p-4 hover:shadow-md transition-shadow border-slate-200/80 cursor-pointer group"
              onClick={() => setActiveView(`krida-${krida.slug}`)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-xs shadow-xs"
                  style={{ backgroundColor: krida.warna }}
                >
                  {krida.kode}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors truncate">
                    {krida.nama}
                  </h3>
                  <p className="text-[10px] text-slate-500">{krida.totalSkk} SKK Terdaftar</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                {krida.deskripsi}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* Fitur Utama Ekosistem */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Layanan Ekosistem SPWN</h2>
          <p className="text-xs text-slate-500">
            Jelajahi layanan terbuka untuk publik dan anggota SAKA di seluruh Nusantara
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card
            className="p-5 border-slate-200 hover:border-emerald-300 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setActiveView('kta-verification')}
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5 text-[#009B4D]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
              Verifikasi KTA Digital
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Validasi keaslian kartu tanda anggota SAKA Pariwisata secara instan menggunakan pemindai QR dan database resmi Google Apps Script.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-emerald-800">
              <span>Buka Verifikasi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          <Card
            className="p-5 border-slate-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setActiveView('tourism')}
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <Compass className="w-5 h-5 text-[#0066B3]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#0066B3] transition-colors">
              Pusat Pariwisata & Destinasi
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Eksplorasi destinasi unggulan binaan pangkalan SAKA Pariwisata dengan standar Sapta Pesona dan ulasan komunitas terverifikasi.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-[#0066B3]">
              <span>Jelajahi Wisata</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>

          <Card
            className="p-5 border-slate-200 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer group"
            onClick={() => setActiveView('commerce')}
          >
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-5 h-5 text-[#F7941D]" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
              Pasar UMKM & Kedai SAKA
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Dukung produk ekonomi kreatif, cenderamata kepramukaan, dan kuliner khas karya anggota binaan Krida Kuliner & Cinderamata.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-semibold text-amber-700">
              <span>Kunjungi Kedai</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};
