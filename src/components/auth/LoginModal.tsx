import React, { useEffect, useState } from 'react';
import {
  LogIn,
  User,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  KeyRound,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { authApi } from '../../services/api/auth.api';
import { useUIStore } from '../../stores/uiStore';

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
  const { setActiveView, setLoginModalOpen, addToast } = useUIStore();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const token = params.get('passwordResetToken');
    if (token) {
      setResetToken(token);
      setMode('reset');
      setLoginModalOpen(true);
      setInfoMessage('Buat kata sandi baru untuk akun Anda.');
    }
  }, []);

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
        setIdentifier('');
        setPassword('');
        setErrorMessage(null);

        onClose();

        // Lepaskan rute QR publik sebelum membuka beranda pengguna.
        // Tanpa ini App akan terus memprioritaskan /verifikasi.
        if (typeof window !== 'undefined' && /^\/verifikasi(?:\/|$)/i.test(window.location.pathname)) {
          window.history.replaceState(window.history.state, '', '/');
        }

        // Semua peran mendarat di beranda/dashboard masing-masing.
        // MemberLayout maupun shell admin mengenali id "dashboard".
        // Jangan gunakan "admin_portal" (alias tidak dikenal).
        const requestedView = targetViewAfterLogin &&
          !['verifikasi', 'kta-verification', 'admin_portal'].includes(targetViewAfterLogin)
          ? targetViewAfterLogin : 'dashboard';
        setActiveView(requestedView);
        if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        setErrorMessage(res.message || 'Gagal login. Periksa kembali akun Anda.');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Terjadi kesalahan pada sistem otentikasi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null); setInfoMessage(null);
    if (!/^\S+@\S+\.\S+$/.test(resetEmail.trim())) { setErrorMessage('Masukkan alamat email yang valid.'); return; }
    setIsLoading(true);
    try {
      const response = await authApi.requestPasswordReset(resetEmail.trim().toLowerCase());
      if (response && (response.success === false || (response as any).ok === false)) {
        throw new Error(response.message || 'Layanan pemulihan kata sandi menolak permintaan.');
      }
      // Respons sukses tetap generik agar tidak membocorkan apakah email terdaftar.
      setInfoMessage(response?.message || 'Jika email terdaftar dan aktif, tautan pemulihan akan dikirim. Periksa kotak masuk dan folder spam.');
    } catch (error: any) {
      // Jangan menyatakan pengiriman berhasil ketika GAS atau MailApp gagal.
      // Pesan ini tidak mengungkap apakah alamat email terdaftar.
      setErrorMessage('Permintaan reset belum dapat diproses. Silakan coba lagi beberapa saat lagi. Jika masalah berlanjut, hubungi administrator.');
    } finally { setIsLoading(false); }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null); setInfoMessage(null);
    if (newPassword.length < 8) { setErrorMessage('Kata sandi baru minimal 8 karakter.'); return; }
    if (newPassword !== confirmNewPassword) { setErrorMessage('Konfirmasi kata sandi tidak sama.'); return; }
    setIsLoading(true);
    try {
      await authApi.confirmPasswordReset(resetToken, newPassword);
      setInfoMessage('Kata sandi berhasil diperbarui. Silakan masuk menggunakan kata sandi baru.');
      setMode('login'); setPassword(''); setNewPassword(''); setConfirmNewPassword('');
      const url = new URL(window.location.href); url.searchParams.delete('passwordResetToken'); window.history.replaceState({}, '', url.toString());
    } catch (error: any) { setErrorMessage(error?.message || 'Tautan reset tidak valid atau sudah kedaluwarsa. Minta tautan baru.'); }
    finally { setIsLoading(false); }
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
        {infoMessage && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">{infoMessage}</div>}
        {mode === 'forgot' ? (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <p className="text-xs text-slate-600">Masukkan email yang terdaftar. Jika cocok, kami akan mengirim tautan untuk membuat kata sandi baru.</p>
            {errorMessage && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{errorMessage}</div>}
            <label className="block text-xs font-bold text-slate-800">Email terdaftar
              <div className="relative mt-1.5"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/><input type="email" required value={resetEmail} onChange={e=>setResetEmail(e.target.value)} autoComplete="email" placeholder="nama@email.com" className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"/></div>
            </label>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full">Kirim Tautan Reset</Button>
            <button type="button" onClick={()=>{setMode('login');setErrorMessage(null);setInfoMessage(null);}} className="w-full flex items-center justify-center gap-2 text-xs text-slate-600"><ArrowLeft className="w-3.5 h-3.5"/> Kembali ke Login</button>
          </form>
        ) : mode === 'reset' ? (
          <form onSubmit={handleConfirmReset} className="space-y-4">
            <p className="text-xs text-slate-600">Buat kata sandi baru minimal 8 karakter.</p>
            {errorMessage && <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">{errorMessage}</div>}
            <label className="block text-xs font-bold text-slate-800">Kata sandi baru<input type="password" required minLength={8} value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password" className="mt-1.5 w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl"/></label>
            <label className="block text-xs font-bold text-slate-800">Konfirmasi kata sandi<input type="password" required minLength={8} value={confirmNewPassword} onChange={e=>setConfirmNewPassword(e.target.value)} autoComplete="new-password" className="mt-1.5 w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl"/></label>
            <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full" leftIcon={<KeyRound className="w-4 h-4"/>}>Simpan Kata Sandi Baru</Button>
          </form>
        ) : (
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

          <div className="flex justify-end -mt-2">
            <button type="button" onClick={() => { setMode('forgot'); setResetEmail(identifier.includes('@') ? identifier : ''); setErrorMessage(null); setInfoMessage(null); }} className="text-[11px] font-bold text-[#0066B3] hover:underline">Lupa Password?</button>
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
        )}
      </div>
    </Modal>
  );
};
