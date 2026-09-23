import React, { useState } from 'react';
import {
  LogIn,
  KeyRound,
  User,
  Shield,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Badge } from '../ui/Badge';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ROLES, UserRole } from '../../config/constants';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetViewAfterLogin?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  targetViewAfterLogin,
}) => {
  const { loginWithCredentials, switchRole } = useAuthStore();
  const { setActiveView, addToast } = useUIStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'credentials' | 'demo'>('credentials');

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Nomor KTA / Username dan Password wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(identifier, password);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Login Berhasil',
          message: res.message || 'Selamat datang kembali di SPWN Apps 2.0',
        });
        onClose();
        if (targetViewAfterLogin) {
          setActiveView(targetViewAfterLogin);
        } else if (res.user?.role === ROLES.MEMBER) {
          setActiveView('membership');
        } else {
          setActiveView('dashboard');
        }
      } else {
        setErrorMessage(res.message || 'Gagal login. Periksa kembali akun Anda.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan pada sistem otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemoRole = (role: UserRole) => {
    switchRole(role);
    addToast({
      type: 'info',
      title: 'Masuk Akun Pengujian',
      message: `Beralih peran sebagai ${role}`,
    });
    onClose();
    if (targetViewAfterLogin) {
      setActiveView(targetViewAfterLogin);
    } else if (role === ROLES.MEMBER) {
      setActiveView('membership');
    } else {
      setActiveView('dashboard');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Masuk ke SPWN Apps 2.0"
      description="Akses Sistem Administrasi Terpadu SAKA Pariwisata Network"
    >
      <div className="space-y-4 pt-1">
        {/* Tab switch */}
        <div className="flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setActiveTab('credentials')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'credentials'
                ? 'border-[#0066B3] text-[#0066B3]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Masuk dengan Akun
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('demo')}
            className={`flex-1 py-2 text-xs font-semibold border-b-2 transition-colors cursor-pointer text-center ${
              activeTab === 'demo'
                ? 'border-[#0066B3] text-[#0066B3]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            Akun Pengujian Demo
          </button>
        </div>

        {activeTab === 'credentials' ? (
          <form onSubmit={handleCredentialsLogin} className="space-y-3.5">
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor KTA / Email / Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="Contoh: 09.01.2024.0001 atau email"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#0066B3] focus:ring-2 focus:ring-[#0066B3]/20 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kata Sandi
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi akun"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:border-[#0066B3] focus:ring-2 focus:ring-[#0066B3]/20 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Akun terdaftar di database Spreadsheet GAS</span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setActiveView('registration');
                }}
                className="text-[#0066B3] font-semibold hover:underline cursor-pointer"
              >
                Daftar Baru
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="w-full justify-center bg-[#0066B3] hover:bg-[#004C85] rounded-xl text-xs py-2.5 font-semibold shadow-xs"
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              Masuk Sekarang
            </Button>
          </form>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-2">
              Pilih peran di bawah ini untuk menguji hak akses RBAC dan fitur sistem secara langsung:
            </p>

            <button
              type="button"
              onClick={() => handleQuickDemoRole(ROLES.SUPER_ADMIN)}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-[#0066B3] hover:bg-blue-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-[#0066B3] flex items-center justify-center font-bold text-xs">
                  SA
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-[#0066B3]">Super Admin (Kwarnas)</p>
                  <p className="text-[10px] text-slate-500">Akses penuh database, KTA, dan kode GAS</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#0066B3] group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoRole(ROLES.ADMIN_WILAYAH)}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  AW
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">Admin Wilayah (Kwarda Jabar)</p>
                  <p className="text-[10px] text-slate-500">Verifikasi anggota regional & monitoring cabang</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoRole(ROLES.MEMBER)}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-purple-500 hover:bg-purple-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  MB
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Anggota SAKA (Fajar Nusantara)</p>
                  <p className="text-[10px] text-slate-500">KTA Digital, SKK Learning & portofolio kegiatan</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-700 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoRole(ROLES.TOURISM_MANAGER)}
              className="w-full p-2.5 rounded-xl border border-slate-200 hover:border-amber-500 hover:bg-amber-50/40 text-left transition-all flex items-center justify-between group cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  TM
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Tourism Lead (Bali)</p>
                  <p className="text-[10px] text-slate-500">Kurasi destinasi, mitra desa & paket wisata</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
};
