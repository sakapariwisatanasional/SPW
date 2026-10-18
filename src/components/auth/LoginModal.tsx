import React, { useState } from 'react';
import { LogIn, User, AlertCircle, Mail, KeyRound, ArrowLeft } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { useUIStore } from '../../stores/uiStore';

interface LoginModalProps { isOpen: boolean; onClose: () => void; targetViewAfterLogin?: string; }
export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, targetViewAfterLogin }) => {
  const { requestLoginOtp, loginWithOtp } = useAuthStore();
  const { setActiveView, addToast } = useUIStore();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email'|'otp'>('email');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string|null>(null);
  const [infoMessage, setInfoMessage] = useState<string|null>(null);

  const requestCode = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null); setInfoMessage(null);
    const normalized = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(normalized)) { setErrorMessage('Masukkan alamat email yang valid.'); return; }
    setIsLoading(true);
    try {
      const result = await requestLoginOtp(normalized);
      if (!result.success) throw new Error(result.message);
      setEmail(normalized); setStep('otp'); setInfoMessage(result.message || 'Jika email terdaftar dan aktif, kode OTP akan dikirim. Kode berlaku 10 menit.');
    } catch (err:any) { setErrorMessage(err?.message || 'Permintaan OTP gagal.'); }
    finally { setIsLoading(false); }
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault(); setErrorMessage(null);
    if (!/^\d{6}$/.test(otp.trim())) { setErrorMessage('OTP harus terdiri dari 6 digit.'); return; }
    setIsLoading(true);
    try {
      const result = await loginWithOtp(email, otp);
      if (!result.success) throw new Error(result.message);
      addToast({ type:'success', title:'Login Berhasil', message:'Anda berhasil masuk ke SPW menggunakan OTP.' });
      setEmail(''); setOtp(''); setStep('email'); setInfoMessage(null); onClose();
      if (typeof window !== 'undefined' && /^\/verifikasi(?:\/|$)/i.test(window.location.pathname)) window.history.replaceState(window.history.state, '', '/');
      const requested = targetViewAfterLogin && !['verifikasi','kta-verification','admin_portal'].includes(targetViewAfterLogin) ? targetViewAfterLogin : 'dashboard';
      setActiveView(requested);
      if (typeof window !== 'undefined') window.scrollTo({ top:0, behavior:'instant' });
    } catch (err:any) { setErrorMessage(err?.message || 'OTP salah, kedaluwarsa, atau tidak dapat diverifikasi.'); }
    finally { setIsLoading(false); }
  };

  return <Modal isOpen={isOpen} onClose={onClose} size="md" title="Masuk ke SPW Apps 2.0" description="Login aman menggunakan OTP email">
    <div className="space-y-4 pt-1">
      {infoMessage && <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">{infoMessage}</div>}
      {errorMessage && <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700"><AlertCircle className="w-4 h-4 shrink-0"/><span>{errorMessage}</span></div>}
      {step === 'email' ? <form onSubmit={requestCode} className="space-y-4">
        <label className="block text-xs font-bold text-slate-800">Email terdaftar
          <div className="relative mt-1.5"><Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/><input type="email" required autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="nama@email.com" className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900"/></div>
        </label>
        <p className="text-xs text-slate-500">Kode OTP berlaku 10 menit dan hanya dapat digunakan sekali.</p>
        <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full" leftIcon={<Mail className="w-4 h-4"/>}>Kirim OTP</Button>
        <div className="flex justify-between text-xs text-slate-500"><span>Belum punya akun?</span><button type="button" onClick={()=>{onClose();setActiveView('registration');}} className="text-[#0066B3] font-bold hover:underline">Daftar Anggota Baru</button></div>
      </form> : <form onSubmit={verifyCode} className="space-y-4">
        <div className="text-xs text-slate-600">Masukkan kode 6 digit yang dikirim ke <b>{email}</b>.</div>
        <label className="block text-xs font-bold text-slate-800">Kode OTP
          <div className="relative mt-1.5"><KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2"/><input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required value={otp} onChange={e=>setOtp(e.target.value.replace(/\D/g,'').slice(0,6))} placeholder="000000" className="w-full pl-9 pr-3 py-2.5 text-lg tracking-[0.35em] font-bold border border-slate-300 rounded-xl bg-white text-slate-900"/></div>
        </label>
        <Button type="submit" variant="primary" size="md" isLoading={isLoading} className="w-full" leftIcon={<LogIn className="w-4 h-4"/>}>Verifikasi dan Masuk</Button>
        <button type="button" disabled={isLoading} onClick={()=>{setStep('email');setOtp('');setErrorMessage(null);setInfoMessage(null);}} className="w-full flex items-center justify-center gap-2 text-xs text-slate-600"><ArrowLeft className="w-3.5 h-3.5"/> Ganti email</button>
        <button type="button" disabled={isLoading} onClick={requestCode as any} className="w-full text-xs text-[#0066B3] font-semibold">Kirim ulang OTP</button>
      </form>}
    </div>
  </Modal>;
};
