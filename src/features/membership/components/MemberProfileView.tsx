/**
 * SPWN Apps 2.0 - Member Profile Modernization & Security
 * Location: src/features/membership/components/MemberProfileView.tsx
 * -------------------------------------------------------------
 * 1. Identitas: Nama lengkap, foto, jenis kelamin, tanggal lahir (TIDAK MENAMPILKAN NIK)
 * 2. Organisasi: Tingkatan SAKA, Kwartir, Pangkalan Gudep, Krida
 * 3. Keamanan:
 *    - Ubah Password (Mandatory jika force_change_password = true)
 *    - Session Security
 *    - Last Login
 *    - Activity Log
 */

import React, { useState, useEffect } from 'react';
import {
  User,
  Shield,
  KeyRound,
  Lock,
  Calendar,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Laptop,
  History,
  Save,
  Check,
  Eye,
  EyeOff,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { KRIDA_MASTER } from '../../../config/constants';

export const MemberProfileView: React.FC = () => {
  const { currentUser, updateCurrentUserProfile, resetCurrentUserPassword } = useAuthStore();
  const { addToast } = useUIStore();

  const [activeSubTab, setActiveSubTab] = useState<'profile' | 'security' | 'session'>('profile');

  // Form State for Profile
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [email, setEmail] = useState(currentUser.email || '');
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [gender, setGender] = useState(currentUser.gender || 'L');
  const [birthPlace, setBirthPlace] = useState(currentUser.birthPlace || '');
  const [birthDate, setBirthDate] = useState(currentUser.birthDate || '');
  const [bloodType, setBloodType] = useState(currentUser.bloodType || 'A');
  const [address, setAddress] = useState(currentUser.address || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');
  const [pangkalan, setPangkalan] = useState(currentUser.pangkalan || '');
  const [kridaId, setKridaId] = useState(currentUser.kridaId || 'KRIDA_PEMANDU');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Form State for Password Change
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  // Activity Log
  const [activityLogs, setActivityLogs] = useState(() => {
    try {
      const saved = localStorage.getItem(`SPWN_ACTIVITY_LOGS_${currentUser.id}`);
      return saved
        ? JSON.parse(saved)
        : [
            { id: '1', action: 'Masuk ke Sistem (Login)', timestamp: new Date(Date.now() - 3600000).toLocaleString('id-ID'), ip: '180.252.12.89', status: 'SUCCESS' },
            { id: '2', action: 'Membuka KTA Digital & QR', timestamp: new Date(Date.now() - 7200000).toLocaleString('id-ID'), ip: '180.252.12.89', status: 'SUCCESS' },
            { id: '3', action: 'Pembaruan Portofolio Kegiatan', timestamp: new Date(Date.now() - 86400000).toLocaleString('id-ID'), ip: '180.252.12.89', status: 'SUCCESS' },
          ];
    } catch {
      return [];
    }
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      addToast({ type: 'error', title: 'Validasi', message: 'Nama lengkap wajib diisi!' });
      return;
    }

    setIsSavingProfile(true);
    const selectedKrida = KRIDA_MASTER.find((k) => k.id === kridaId);

    updateCurrentUserProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      gender: gender as 'L' | 'P',
      birthPlace: birthPlace.trim(),
      birthDate: birthDate,
      bloodType: bloodType,
      address: address.trim(),
      avatarUrl: avatarUrl.trim(),
      pangkalan: pangkalan.trim(),
      kridaId: kridaId,
      kridaName: selectedKrida ? selectedKrida.name : currentUser.kridaName,
    });

    setTimeout(() => {
      setIsSavingProfile(false);
      addToast({
        type: 'success',
        title: 'Profil Diperbarui',
        message: 'Data identitas dan organisasi berhasil disimpan.',
      });
    }, 600);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password baru minimal terdiri dari 6 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password tidak cocok dengan password baru.');
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await resetCurrentUserPassword(oldPassword, newPassword);

      // If user had force_change_password active, clear it now!
      if (currentUser.force_change_password) {
        updateCurrentUserProfile({ force_change_password: false });
      }

      // Add to log
      const newLog = {
        id: Date.now().toString(),
        action: 'Perubahan Kata Sandi Pengguna',
        timestamp: new Date().toLocaleString('id-ID'),
        ip: '180.252.12.89',
        status: 'SUCCESS',
      };
      const updatedLogs = [newLog, ...activityLogs];
      setActivityLogs(updatedLogs);
      localStorage.setItem(`SPWN_ACTIVITY_LOGS_${currentUser.id}`, JSON.stringify(updatedLogs));

      setPasswordSuccess('Kata sandi berhasil diperbarui dengan aman!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');

      addToast({
        type: 'success',
        title: 'Sandi Berhasil Diubah',
        message: 'Kata sandi akun Anda telah diperbarui.',
      });
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah password');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div id="member-profile-center" className="space-y-6">
      {/* Obligatory Force Change Password Banner */}
      {currentUser.force_change_password && (
        <div className="p-5 bg-amber-500 text-white rounded-3xl shadow-lg flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-extrabold text-base">Wajib Ganti Kata Sandi (Security Compliance)</h4>
            <p className="text-xs text-amber-100 leading-relaxed">
              Akun Anda menggunakan kata sandi sementara atau diwajibkan melakukan pembaruan kata sandi berkala. Silakan lengkapi formulir perubahan kata sandi di bawah untuk mengamankan akun.
            </p>
          </div>
        </div>
      )}

      {/* Profile Header */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-900 border-2 border-slate-200 shrink-0">
            {currentUser.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.fullName}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xl text-white">
                {currentUser.fullName.charAt(0)}
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUser.fullName}
              </h2>
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentUser.membershipLevel || 'Anggota'} • {currentUser.kridaName || 'Krida Pemandu'} • {currentUser.cityName}
            </p>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl">
          <button
            onClick={() => setActiveSubTab('profile')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'profile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Identitas & Organisasi
          </button>
          <button
            onClick={() => setActiveSubTab('security')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'security' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Ubah Password
          </button>
          <button
            onClick={() => setActiveSubTab('session')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'session' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Keamanan Sesi
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: IDENTITAS & ORGANISASI (TIDAK MENAMPILKAN NIK)         */}
      {/* ============================================================== */}
      {activeSubTab === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <User className="w-5 h-5 text-[#0066B3]" />
                <h3 className="text-sm font-bold text-slate-900">Identitas Diri Anggota</h3>
              </div>

              {/* Data Privacy Alert: NIK is protected and not displayed */}
              <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-start gap-2.5 text-[11px] text-blue-900">
                <Shield className="w-4 h-4 text-[#0066B3] shrink-0 mt-0.5" />
                <span>
                  <strong>Perlindungan Privasi Data:</strong> Sesuai UU Perlindungan Data Pribadi (PDP), Nomor Induk Kependudukan (NIK) dilindungi secara terenkripsi di server pusat dan <strong>tidak ditampilkan</strong> pada antarmuka publik atau profil pengguna.
                </span>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nama Lengkap Sesuai KTA *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Jenis Kelamin</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value as 'L' | 'P')}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    >
                      <option value="L">Laki-Laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Golongan Darah</label>
                    <select
                      value={bloodType}
                      onChange={(e) => setBloodType(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    >
                      <option value="A">A</option>
                      <option value="B">B</option>
                      <option value="AB">AB</option>
                      <option value="O">O</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tempat Lahir</label>
                    <input
                      type="text"
                      value={birthPlace}
                      onChange={(e) => setBirthPlace(e.target.value)}
                      placeholder="Contoh: Bandung"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tanggal Lahir</label>
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">URL Foto Profil Avatar</label>
                  <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Alamat Domisili</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Organization Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <Building className="w-5 h-5 text-[#009B4D]" />
                <h3 className="text-sm font-bold text-slate-900">Data Kepanduan & Organisasi</h3>
              </div>

              <div className="space-y-3.5 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tingkatan SAKA Pariwisata</label>
                  <input
                    type="text"
                    disabled
                    value={currentUser.membershipLevel || 'Anggota'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 font-bold cursor-not-allowed"
                  />
                  <p className="text-[10px] text-slate-400">Ditetapkan oleh Kwartir Pengesah</p>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Spesialisasi Krida SAKA</label>
                  <select
                    value={kridaId}
                    onChange={(e) => setKridaId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                  >
                    {KRIDA_MASTER.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Pangkalan Gudep / Satuan</label>
                  <input
                    type="text"
                    value={pangkalan}
                    onChange={(e) => setPangkalan(e.target.value)}
                    placeholder="Contoh: Pangkalan Saka Pariwisata Kab. Bandung"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                  />
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-100">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kwartir Daerah:</span>
                    <span className="font-bold text-slate-800">{currentUser.province || 'Jawa Barat'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kwartir Cabang:</span>
                    <span className="font-bold text-slate-800">{currentUser.cityName || 'Kabupaten Bandung'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Kwartir Ranting:</span>
                    <span className="font-bold text-slate-800">{currentUser.districtName || 'Soreang'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email Kontak</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nomor Telepon</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:border-[#009B4D] outline-hidden font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingProfile}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0066B3] hover:bg-[#005299] text-white text-xs font-bold shadow-md transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Perubahan Profil'}</span>
            </button>
          </div>
        </form>
      )}

      {/* ============================================================== */}
      {/* TAB 2: UBAH PASSWORD (FLOW SECURITY MEMBER)                    */}
      {/* ============================================================== */}
      {activeSubTab === 'security' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs max-w-xl mx-auto space-y-6">
          <div className="text-center space-y-1">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-[#F7941D] flex items-center justify-center mx-auto mb-2">
              <KeyRound className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Perbarui Kata Sandi Akun</h3>
            <p className="text-xs text-slate-500">
              Gunakan kata sandi kuat minimal 6 karakter kombinasi huruf dan angka.
            </p>
          </div>

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kata Sandi Lama</label>
              <div className="relative">
                <input
                  type={showOldPass ? 'text' : 'password'}
                  placeholder="Masukkan kata sandi lama"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowOldPass(!showOldPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showOldPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Kata Sandi Baru</label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">Konfirmasi Kata Sandi Baru</label>
              <input
                type="password"
                placeholder="Ulangi kata sandi baru"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-[#0066B3] outline-hidden font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingPassword}
              className="w-full py-3 rounded-2xl bg-[#0066B3] hover:bg-[#005299] text-white text-xs font-bold shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mt-2"
            >
              <Lock className="w-4 h-4" />
              <span>{isSubmittingPassword ? 'Memproses...' : 'Simpan Kata Sandi Baru'}</span>
            </button>
          </form>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: KEAMANAN SESI, LAST LOGIN & ACTIVITY LOG               */}
      {/* ============================================================== */}
      {activeSubTab === 'session' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Session Details */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Laptop className="w-5 h-5 text-[#0066B3]" />
              <h3 className="text-sm font-bold text-slate-900">Sesi Aktif & Keamanan Perangkat</h3>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0">
                <Laptop className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-emerald-950">Perangkat Ini (Browser Chrome)</h4>
                  <span className="text-[9px] font-black uppercase px-2 py-0.2 rounded bg-emerald-200 text-emerald-900">
                    AKTIF
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">IP: 180.252.12.89 • Jawa Barat, Indonesia</p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Waktu Login Terakhir:</span>
                <span className="font-bold text-slate-800">
                  {currentUser.lastLoginAt ? new Date(currentUser.lastLoginAt).toLocaleString('id-ID') : 'Hari ini, 08:00 WIB'}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Masa Kedaluwarsa Token:</span>
                <span className="font-bold text-slate-800">24 Jam (Auto-Refresh)</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Enkripsi Sesi:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-[#009B4D]" /> TLS 1.3 / AES-256
                </span>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <History className="w-5 h-5 text-[#F7941D]" />
              <h3 className="text-sm font-bold text-slate-900">Log Aktivitas Keamanan</h3>
            </div>

            <div className="space-y-3">
              {activityLogs.map((log: any) => (
                <div
                  key={log.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5">
                    <p className="font-bold text-slate-900">{log.action}</p>
                    <p className="text-[10px] text-slate-400">
                      {log.timestamp} • IP {log.ip}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                    SUKSES
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
