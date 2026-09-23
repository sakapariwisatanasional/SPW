import React from 'react';
import { ShieldAlert, LogIn, Lock, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { useUIStore } from '../../stores/uiStore';

interface AuthAccessBarrierProps {
  featureName?: string;
  requiredRole?: string;
}

export const AuthAccessBarrier: React.FC<AuthAccessBarrierProps> = ({
  featureName = 'Dashboard Administrasi',
  requiredRole = 'Pengurus / Anggota Terdaftar',
}) => {
  const { setActiveView, setLoginModalOpen } = useUIStore();

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <Card className="p-8 sm:p-10 text-center border-slate-200/90 shadow-lg space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8 text-[#F7941D]" />
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <span className="inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100/80 text-amber-900 border border-amber-200">
            Akses Terbatas • Autentikasi Diperlukan
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Halaman Ini Memerlukan Login
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Fitur <strong className="text-slate-800 font-semibold">{featureName}</strong> hanya dapat diakses oleh <strong className="text-slate-800 font-semibold">{requiredRole}</strong> yang telah masuk ke dalam sistem SPWN Apps 2.0.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 max-w-md mx-auto text-left">
          <p className="font-semibold text-slate-700 mb-1">Aturan Akses Pengguna:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Pengunjung publik hanya dapat mengakses fitur publik (Verifikasi, Pendaftaran, Direktori).</li>
            <li>Silakan masuk dengan Nomor KTA / Akun Pengurus Anda.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={() => setLoginModalOpen(true)}
            leftIcon={<LogIn className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-bold rounded-xl px-6 py-2.5 shadow-xs cursor-pointer"
          >
            Masuk ke Akun Anda
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => setActiveView('home')}
            leftIcon={<Home className="w-4 h-4" />}
            className="w-full sm:w-auto text-xs font-semibold rounded-xl border-slate-200 cursor-pointer"
          >
            Kembali ke Beranda
          </Button>
        </div>
      </Card>
    </div>
  );
};
