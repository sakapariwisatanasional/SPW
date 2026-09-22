import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  KeyRound,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  X,
  CreditCard,
  Building,
  Sparkles,
  Camera,
  Check,
} from 'lucide-react';
import { useAuthStore } from '../../../stores/authStore';
import { useUIStore } from '../../../stores/uiStore';
import { KRIDA_MASTER, MASTER_TINGKATAN_SAKA } from '../../../config/constants';
import { PROVINCES, getRegenciesByProvince, getDistrictsByRegency, resolveDistrictName } from '../../../data/wilayahData';

interface MemberProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MemberProfileModal: React.FC<MemberProfileModalProps> = ({ isOpen, onClose }) => {
  const { currentUser, updateCurrentUserProfile, resetCurrentUserPassword } = useAuthStore();
  const { addToast } = useUIStore();

  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [profileData, setProfileData] = useState({
    fullName: currentUser.fullName || '',
    email: currentUser.email || '',
    phone: currentUser.phone || '',
    birthPlace: currentUser.birthPlace || '',
    birthDate: currentUser.birthDate || '',
    gender: currentUser.gender || 'L',
    bloodType: currentUser.bloodType || 'A',
    address: currentUser.address || '',
    pangkalan: currentUser.pangkalan || '',
    provinceId: currentUser.provinceId || '32',
    cityId: currentUser.cityId || '',
    districtId: currentUser.districtId || '',
    kridaId: currentUser.kridaId || 'KRIDA_PEMANDU',
    avatarUrl: currentUser.avatarUrl || '',
  });

  const availableRegencies = React.useMemo(() => {
    return profileData.provinceId ? getRegenciesByProvince(profileData.provinceId) : [];
  }, [profileData.provinceId]);

  const availableDistricts = React.useMemo(() => {
    return profileData.cityId ? getDistrictsByRegency(profileData.cityId) : [];
  }, [profileData.cityId]);

  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Security / Password Reset Form State
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);

  if (!isOpen) return null;

  // Handle Profile Update
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData.fullName.trim()) {
      addToast({ type: 'error', title: 'Validasi', message: 'Nama lengkap wajib diisi!' });
      return;
    }

    setIsSavingProfile(true);

    const selectedKrida = KRIDA_MASTER.find((k) => k.id === profileData.kridaId);
    const selectedProv = PROVINCES.find((p) => p.code === profileData.provinceId);
    const selectedReg = availableRegencies.find((r) => r.code === profileData.cityId);
    const selectedDist = availableDistricts.find((d) => d.districtCode3 === profileData.districtId || d.code === profileData.districtId);

    updateCurrentUserProfile({
      ...profileData,
      province: selectedProv ? selectedProv.name : currentUser.province,
      cityName: selectedReg ? selectedReg.name : currentUser.cityName,
      districtName: selectedDist ? selectedDist.name : currentUser.districtName,
      kridaName: selectedKrida ? selectedKrida.name : profileData.kridaId,
    });

    setTimeout(() => {
      setIsSavingProfile(false);
      addToast({
        type: 'success',
        title: 'Profil Diperbarui',
        message: 'Koreksi data profil & wilayah anggota Anda berhasil disimpan ke sistem.',
      });
    }, 400);
  };

  // Handle Member Password Reset
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password baru minimal terdiri dari 6 karakter!');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Konfirmasi password baru tidak cocok!');
      return;
    }

    setIsSubmittingPassword(true);

    try {
      const res = await resetCurrentUserPassword(oldPassword, newPassword);
      setPasswordSuccess(res.message || 'Password akun berhasil diubah.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      addToast({
        type: 'success',
        title: 'Reset Password Berhasil',
        message: 'Kata sandi akun member Anda telah diperbarui dengan aman.',
      });
    } catch (err: any) {
      setPasswordError(err.message || 'Gagal mengubah kata sandi');
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  // Avatar presets
  const avatarPresets = [
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-[#0066B3] to-[#009B4D] p-5 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={profileData.avatarUrl || currentUser.avatarUrl || 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'}
                alt={currentUser.fullName}
                className="w-12 h-12 rounded-xl object-cover border-2 border-white/40 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">{currentUser.fullName}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/20 text-white border border-white/20">
                  {currentUser.roleName}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {currentUser.memberId ? `KTA: ${currentUser.memberId}` : currentUser.email} • {currentUser.province || 'Kwartir Nasional'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50 px-4 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Koreksi & Edit Profil Member</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'border-[#0066B3] text-[#0066B3] bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Keamanan & Reset Password</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto p-5 space-y-4 flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-[#0066B3] shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Sebagai anggota SAKA Pariwisata, Anda berhak memeriksa dan melakukan koreksi berkala atas kelengkapan profil, kontak, peminatan krida, dan pangkalan gugusdepan Anda.
                </p>
              </div>

              {/* Avatar Selector */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <label className="font-bold text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-slate-500" />
                  Foto Profil & Avatar
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex gap-2">
                    {avatarPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setProfileData({ ...profileData, avatarUrl: preset })}
                        className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                          profileData.avatarUrl === preset ? 'border-[#0066B3] ring-2 ring-blue-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt="preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                  <input
                    type="url"
                    value={profileData.avatarUrl}
                    onChange={(e) => setProfileData({ ...profileData, avatarUrl: e.target.value })}
                    placeholder="Atau tautkan URL foto kustom..."
                    className="flex-1 bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-800"
                  />
                </div>
              </div>

              {/* Form Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Nama Lengkap (Sesuai KTP / Ijazah) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Alamat Email Aktif</label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nomor Telepon / WhatsApp</label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      placeholder="08123456789"
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tempat Lahir</label>
                  <input
                    type="text"
                    value={profileData.birthPlace}
                    onChange={(e) => setProfileData({ ...profileData, birthPlace: e.target.value })}
                    placeholder="Contoh: Bandung"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Tanggal Lahir</label>
                  <input
                    type="date"
                    value={profileData.birthDate}
                    onChange={(e) => setProfileData({ ...profileData, birthDate: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Jenis Kelamin</label>
                  <select
                    value={profileData.gender}
                    onChange={(e) => setProfileData({ ...profileData, gender: e.target.value as 'L' | 'P' })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Golongan Darah</label>
                  <select
                    value={profileData.bloodType}
                    onChange={(e) => setProfileData({ ...profileData, bloodType: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="AB">AB</option>
                    <option value="O">O</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Peminatan 4 Krida SAKA Pariwisata</label>
                  <select
                    value={profileData.kridaId}
                    onChange={(e) => setProfileData({ ...profileData, kridaId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {KRIDA_MASTER.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.name} ({k.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Wilayah Anggota Cascading Selectors */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Provinsi (Kwarda) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileData.provinceId}
                    onChange={(e) => {
                      const newProv = e.target.value;
                      const nextRegs = getRegenciesByProvince(newProv);
                      setProfileData({
                        ...profileData,
                        provinceId: newProv,
                        cityId: nextRegs[0]?.code || '',
                        districtId: '',
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    {PROVINCES.map((p) => (
                      <option key={p.code} value={p.code}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kabupaten / Kota (Kwarcab) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileData.cityId}
                    onChange={(e) => {
                      const newCity = e.target.value;
                      const nextDists = getDistrictsByRegency(newCity);
                      setProfileData({
                        ...profileData,
                        cityId: newCity,
                        districtId: nextDists[0]?.districtCode3 || '',
                      });
                    }}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kabupaten / Kota --</option>
                    {availableRegencies.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">
                    Kecamatan (Kwartir Ranting) <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={profileData.districtId}
                    onChange={(e) => setProfileData({ ...profileData, districtId: e.target.value })}
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Pilih Kecamatan ({availableDistricts.length} terdata) --</option>
                    {availableDistricts.map((d) => (
                      <option key={d.code} value={d.districtCode3}>
                        {d.name} ({d.districtCode3})
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-slate-500 mt-1">
                    {availableDistricts.length > 0 ? `Sinkron dengan database master ${availableDistricts.length} kecamatan di kabupaten/kota ini.` : 'Pilih Kabupaten/Kota terlebih dahulu.'}
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Pangkalan Gugusdepan Asal</label>
                  <input
                    type="text"
                    value={profileData.pangkalan}
                    onChange={(e) => setProfileData({ ...profileData, pangkalan: e.target.value })}
                    placeholder="Contoh: Gudep 01.001 - 01.002 Pangkalan SMAN 1 Soreang"
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Alamat Domisili Lengkap</label>
                  <textarea
                    rows={2}
                    value={profileData.address}
                    onChange={(e) => setProfileData({ ...profileData, address: e.target.value })}
                    placeholder="Nama jalan, RT/RW, kelurahan/desa..."
                    className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#0066B3] hover:bg-blue-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingProfile ? 'Menyimpan...' : 'Simpan Koreksi Profil'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Shield className="w-4 h-4 text-amber-600" />
                  <span>Reset / Perubahan Kata Sandi Mandiri</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Pastikan kata sandi baru Anda unik, minimal 6 karakter, dan tidak dibagikan kepada orang lain untuk menjaga keamanan data keanggotaan SAKA Pariwisata Anda.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              {passwordSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passwordSuccess}</span>
                </div>
              )}

              <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Kata Sandi Saat Ini</label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      placeholder="Masukkan kata sandi lama Anda"
                      value={oldPassword}
                      onChange={(e) => setOldPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  {newPassword && (
                    <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                      <span className="text-slate-500">Kekuatan Sandi:</span>
                      <span
                        className={`font-bold ${
                          newPassword.length >= 8 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {newPassword.length >= 8 ? 'Kuat (Aman)' : 'Cukup (Disarankan min. 8 karakter)'}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Konfirmasi Kata Sandi Baru <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="password"
                      required
                      placeholder="Ulangi kata sandi baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingPassword}
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isSubmittingPassword ? 'Memproses...' : 'Ubah Kata Sandi Sekarang'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
