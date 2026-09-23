import React, { useState } from 'react';
import {
  LogIn,
  User,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';
import { ROLES } from '../../config/constants';

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
  const { loginWithCredentials } = useAuthStore();
  const { setActiveView, addToast } = useUIStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMessage('Nomor KTA / Username dan Kata Sandi wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginWithCredentials(identifier, password);
      if (res.success) {
        addToast({
          type: 'success',
          title: 'Login Berhasil',
          message: res.message || 'Selamat datang di SPWN Apps 2.0',
        });
        onClose();
        if (targetViewAfterLogin) {
          setActiveView(targetViewAfterLogin);
        } else if (res.user?.role === ROLES.MEMBER) {
          setActiveView('membership');
        } else {
          setActiveView('admin_portal');
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title="Masuk ke SPWN Apps 2.0"
      description="Sistem Administrasi Terpadu SAKA Pariwisata Network"
    >
      <div className="space-y-4 pt-1">
        <form onSubmit={handleCredentialsLogin} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
              <span className="font-medium leading-relaxed">{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1.5">
              Nomor KTA / Username / Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Contoh: 00.3201.010.000089 atau email terdaftar"
                required
                autoComplete="username"
                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:border-[#0066B3] focus:ring-2 focus:ring-[#0066B3]/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-800">
                Kata Sandi
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
              >
                {showPassword ? (
                  <>
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Sembunyikan</span>
                  </>
                ) : (
                  <>
                    <Eye className="w-3.5 h-3.5" />
                    <span>Lihat Sandi</span>
                  </>
                )}
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi akun Anda"
                required
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:border-[#0066B3] focus:ring-2 focus:ring-[#0066B3]/20 focus:outline-none transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Belum memiliki akun?</span>
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView('registration');
              }}
              className="text-[#0066B3] font-bold hover:underline cursor-pointer"
            >
              Daftar Anggota Baru
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full py-2.5 text-xs font-bold shadow-sm"
            leftIcon={<LogIn className="w-4 h-4" />}
          >
            Masuk Sekarang
          </Button>
        </form>
      </div>
    </Modal>
  );
};
