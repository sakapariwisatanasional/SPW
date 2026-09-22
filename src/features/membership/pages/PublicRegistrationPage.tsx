/**
 * SPWN Apps 2.0 - Public Registration Page (Pendaftaran Anggota Saka Pariwisata)
 * Location: src/features/membership/pages/PublicRegistrationPage.tsx
 * -------------------------------------------------------------
 * Ketentuan Teknis & Arsitektur SPWN:
 * 1. Pendaftaran mandiri publik masuk dengan status: PENDING
 * 2. TIDAK ADA penerbitan KTA otomatis pada tahap pendaftaran publik.
 *    KTA dan Dynamic QR hanya diterbitkan oleh Admin Pusat setelah lolos:
 *    - Review & Verifikasi Berkas (Admin Wilayah)
 *    - Final Approval (Admin Pusat)
 * 3. Foto profil tersimpan pada photo_url sebagai single source of truth.
 */

import React, { useState, useMemo } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Compass,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAdminStore } from '../../admin/stores/adminStore';
import {
  MASTER_PROVINSI,
  getKabupatenByProvinsi,
  getKecamatanByKabupaten,
  resolveProvinsiName,
  resolveKabupatenName,
  resolveKecamatanName,
} from '../../../services/wilayahService';
import { KRIDA_MASTER, MASTER_TINGKATAN_SAKA } from '../../../config/constants';
import { useUIStore } from '../../../stores/uiStore';

export const PublicRegistrationPage: React.FC = () => {
  const { addMember } = useAdminStore();
  const { setActiveView } = useUIStore();

  // Form State
  const [formData, setFormData] = useState({
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L' as 'L' | 'P',
    golongan_darah: 'O',
    email: '',
    nomor_telepon: '',
    alamat_domisili: '',
    provinsi_id: '31',
    provinsi_nama: 'DKI JAKARTA',
    kabupaten_id: '3171',
    kabupaten_nama: 'JAKARTA SELATAN',
    kecamatan_id: '3171010',
    wilayah_kecamatan_id: '3171010',
    wilayah_kecamatan_nama: 'JAGAKARSA',
    pangkalan_gudep: '',
    kwartir_ranting: 'JAGAKARSA',
    kwartir_cabang: 'JAKARTA SELATAN',
    krida_id: 'KRIDA_PEMANDU',
    tingkat_keanggotaan: 'Anggota',
    level_organisasi: 'WILAYAH' as 'KWARTIR_NASIONAL' | 'WILAYAH',
    foto_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  });

  const [photoPreview, setPhotoPreview] = useState<string>(formData.foto_url);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [registeredResult, setRegisteredResult] = useState<{
    id: string;
    nama: string;
    kabupaten: string;
    tingkat: string;
    createdAt: string;
  } | null>(null);

  // Available regencies based on province
  const regencies = useMemo(() => {
    return getKabupatenByProvinsi(formData.provinsi_id);
  }, [formData.provinsi_id]);

  // Available districts based on regency
  const districts = useMemo(() => {
    return getKecamatanByKabupaten(formData.kabupaten_id);
  }, [formData.kabupaten_id]);

  // Handle Province Change
  const handleProvinceChange = (provCode: string) => {
    const provName = resolveProvinsiName(provCode);
    const availableRegs = getKabupatenByProvinsi(provCode);
    const defaultReg = availableRegs[0];
    const availableDists = defaultReg ? getKecamatanByKabupaten(defaultReg.kode_kabupaten) : [];
    const defaultDist = availableDists[0];

    setFormData((prev) => ({
      ...prev,
      provinsi_id: provCode,
      provinsi_nama: provName,
      kabupaten_id: defaultReg ? defaultReg.kode_kabupaten : '',
      kabupaten_nama: defaultReg ? defaultReg.nama_kabupaten : '',
      kecamatan_id: defaultDist ? defaultDist.kode_kecamatan : '',
      wilayah_kecamatan_id: defaultDist ? defaultDist.kode_kecamatan : '',
      wilayah_kecamatan_nama: defaultDist ? defaultDist.nama_kecamatan : '',
      kwartir_cabang: defaultReg ? defaultReg.nama_kabupaten : '',
      kwartir_ranting: defaultDist ? defaultDist.nama_kecamatan : '',
    }));
  };

  // Handle Regency Change
  const handleRegencyChange = (regCode: string) => {
    const regName = resolveKabupatenName(regCode);
    const availableDists = getKecamatanByKabupaten(regCode);
    const defaultDist = availableDists[0];

    setFormData((prev) => ({
      ...prev,
      kabupaten_id: regCode,
      kabupaten_nama: regName,
      kecamatan_id: defaultDist ? defaultDist.kode_kecamatan : '',
      wilayah_kecamatan_id: defaultDist ? defaultDist.kode_kecamatan : '',
      wilayah_kecamatan_nama: defaultDist ? defaultDist.nama_kecamatan : '',
      kwartir_cabang: regName,
      kwartir_ranting: defaultDist ? defaultDist.nama_kecamatan : '',
    }));
  };

  // Handle District Change
  const handleDistrictChange = (distCode: string) => {
    const distName = resolveKecamatanName(distCode, formData.kabupaten_id);
    setFormData((prev) => ({
      ...prev,
      kecamatan_id: distCode,
      wilayah_kecamatan_id: distCode,
      wilayah_kecamatan_nama: distName,
      kwartir_ranting: distName,
    }));
  };

  // Handle Photo Upload (File -> Data URL)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('File harus berupa gambar (JPG, PNG, atau WEBP)');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Ukuran file maksimal 2 MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setPhotoPreview(url);
      setFormData((prev) => ({ ...prev, foto_url: url }));
      setErrorMsg(null);
    };
    reader.readAsDataURL(file);
  };

  // Submit Handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Form Validations
    if (formData.nama_lengkap.trim().length < 3) {
      setErrorMsg('Nama lengkap minimal 3 karakter.');
      return;
    }
    if (!formData.tempat_lahir.trim() || !formData.tanggal_lahir) {
      setErrorMsg('Tempat dan tanggal lahir wajib diisi.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMsg('Alamat email aktif wajib diisi dengan benar.');
      return;
    }
    if (formData.nomor_telepon.trim().length < 8) {
      setErrorMsg('Nomor telepon / WhatsApp aktif wajib diisi.');
      return;
    }

    setIsSubmitting(true);

    try {
      const selectedKrida = KRIDA_MASTER.find((k) => k.id === formData.krida_id);

      // PENTING: Status pendaftaran mandiri = 'PENDING'.
      // Tidak menghasilkan nomor KTA maupun QR sebelum verifikasi & approval.
      const newMember = addMember({
        nama_lengkap: formData.nama_lengkap.trim(),
        tempat_lahir: formData.tempat_lahir.trim(),
        tanggal_lahir: formData.tanggal_lahir,
        jenis_kelamin: formData.jenis_kelamin,
        golongan_darah: formData.golongan_darah,
        provinsi_id: formData.provinsi_id,
        provinsi_nama: formData.provinsi_nama,
        kabupaten_id: formData.kabupaten_id,
        kabupaten_nama: formData.kabupaten_nama,
        kecamatan_id: formData.kecamatan_id || formData.wilayah_kecamatan_id,
        wilayah_kecamatan_id: formData.wilayah_kecamatan_id,
        wilayah_kecamatan_nama: formData.wilayah_kecamatan_nama,
        pangkalan_gudep: formData.pangkalan_gudep || 'Gugusdepan Terbuka',
        kwartir_cabang: formData.kwartir_cabang || formData.kabupaten_nama,
        kwartir_ranting: formData.kwartir_ranting || formData.wilayah_kecamatan_nama,
        krida_id: formData.krida_id,
        krida_nama: selectedKrida ? selectedKrida.name : 'KRIDA PEMANDU',
        tingkat_keanggotaan: formData.tingkat_keanggotaan,
        status_anggota: 'PENDING',
        kta_status: 'NOT_CREATED',
        status: 'PENDING',
        nomor_kta: '', // Belum terbit
        email: formData.email.trim(),
        nomor_telepon: formData.nomor_telepon.trim(),
        alamat_domisili: formData.alamat_domisili.trim(),
        foto_url: formData.foto_url,
        level_organisasi: formData.level_organisasi,
        tanggal_bergabung: new Date().toISOString().substring(0, 10),
      });

      setRegisteredResult({
        id: newMember.id,
        nama: newMember.nama_lengkap,
        kabupaten: newMember.kabupaten_nama,
        tingkat: newMember.tingkat_keanggotaan,
        createdAt: newMember.created_at,
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat memproses pendaftaran.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS SCREEN
  if (registeredResult) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-[#009B4D] flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-bold uppercase tracking-wider">
              Status Berkas: PENDING
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              Pendaftaran Berhasil Dikirim!
            </h2>
            <p className="text-sm text-slate-600 max-w-lg mx-auto">
              Terima kasih <strong>{registeredResult.nama}</strong>. Berkas pendaftaran keanggotaan Saka Pariwisata Nasional telah tersimpan di sistem SPWN 2.0.
            </p>
          </div>

          {/* Ticket Information */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-6 text-left space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">ID Registrasi Anggota</span>
              <span className="font-bold text-slate-900">{registeredResult.id}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Peran / Tingkat</span>
              <span className="font-bold text-slate-900">{registeredResult.tingkat}</span>
            </div>
            <div className="flex justify-between items-center pb-2 border-b border-slate-200">
              <span className="text-slate-500">Wilayah Kwartir Cabang</span>
              <span className="font-bold text-slate-900">{registeredResult.kabupaten}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500">Waktu Pengajuan</span>
              <span className="font-bold text-slate-900">{registeredResult.createdAt}</span>
            </div>
          </div>

          {/* Verification Workflow Explanation (RBAC Alignment) */}
          <div className="text-left bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <ShieldCheck className="w-4 h-4 text-[#009B4D]" />
              Alur Verifikasi Resmi Keanggotaan & Penerbitan KTA:
            </div>
            <ol className="text-xs text-emerald-800/90 space-y-2 list-decimal list-inside leading-relaxed">
              <li>
                <strong>Pendaftaran Mandiri:</strong> Berkas diterima dengan status <em>PENDING</em> (Selesai).
              </li>
              <li>
                <strong>Review & Verifikasi Berkas (Admin Wilayah):</strong> Admin Kwarcab / Kwarda memeriksa keabsahan berkas, biodata, dan pangkalan.
              </li>
              <li>
                <strong>Final Approval (Admin Pusat):</strong> Pimpinan Saka Pariwisata Nasional / Kwarnas menyetujui penerimaan keanggotaan resmi.
              </li>
              <li>
                <strong>Penerbitan KTA & Dynamic QR:</strong> Nomor KTA resmi dan identitas QR dinamis ber-entropy tinggi diterbitkan secara otomatis setelah disetujui.
              </li>
            </ol>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveView('dashboard')}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
            >
              Kembali ke Beranda
            </button>
            <button
              type="button"
              onClick={() => {
                setRegisteredResult(null);
                setFormData((prev) => ({ ...prev, nama_lengkap: '', email: '' }));
              }}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all"
            >
              Daftarkan Anggota Baru Lainnya
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-emerald-900 via-[#009B4D] to-teal-800 text-white p-8 sm:p-10 mb-8 shadow-sm">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Portal Pendaftaran Mandiri Anggota Saka Pariwisata
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Formulir Registrasi Anggota SPWN
          </h1>
          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
            Lengkapi data keanggotaan Saka Pariwisata secara mandiri. Berkas akan diverifikasi oleh Admin Wilayah sebelum persetujuan resmi dan penerbitan KTA Digital oleh Admin Pusat.
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 flex items-start gap-3 text-xs animate-shake">
          <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
          <div className="space-y-1">
            <strong className="font-bold">Mohon Periksa Kembali Isian Anda:</strong>
            <p>{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Main Registration Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: DATA PRIBADI & IDENTITAS */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#009B4D] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">1. Data Pribadi & Pasfoto</h2>
              <p className="text-xs text-slate-500">
                Data resmi sesuai KTP/KIA untuk keabsahan arsip kepramukaan
              </p>
            </div>
          </div>

          {/* Photo Upload Section */}
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50/70 rounded-2xl border border-slate-200/60">
            <div className="relative group shrink-0">
              <img
                src={photoPreview}
                alt="Pasfoto Preview"
                className="w-28 h-36 object-cover rounded-xl border-2 border-white shadow-md ring-1 ring-slate-200"
              />
              <label
                htmlFor="photo-upload-input"
                className="absolute inset-0 bg-black/40 text-white rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer text-[10px] font-semibold p-2 text-center"
              >
                <Upload className="w-5 h-5 mb-1" />
                Ganti Foto
              </label>
              <input
                id="photo-upload-input"
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2 text-center sm:text-left">
              <h4 className="text-xs font-bold text-slate-800">Pasfoto Resmi Anggota (3x4)</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed max-w-md">
                Disarankan mengenakan seragam Pramuka lengkap dengan setangan leher. Format PNG/JPG maksimal 2 MB. Foto ini adalah <em>single source of truth</em> identitas KTA Anda.
              </p>
              <label
                htmlFor="photo-upload-input"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-slate-500" />
                Pilih File Foto
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nama Lengkap */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nama Lengkap (Sesuai Identitas Resmi) *
              </label>
              <input
                type="text"
                value={formData.nama_lengkap}
                onChange={(e) => setFormData({ ...formData, nama_lengkap: e.target.value })}
                placeholder="Contoh: Muhammad Rizky Pratama"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#009B4D]/30 focus:border-[#009B4D]"
                required
              />
            </div>

            {/* Tempat Lahir */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tempat Lahir *
              </label>
              <input
                type="text"
                value={formData.tempat_lahir}
                onChange={(e) => setFormData({ ...formData, tempat_lahir: e.target.value })}
                placeholder="Kota / Kabupaten Kelahiran"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#009B4D]/30 focus:border-[#009B4D]"
                required
              />
            </div>

            {/* Tanggal Lahir */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                value={formData.tanggal_lahir}
                onChange={(e) => setFormData({ ...formData, tanggal_lahir: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#009B4D]/30 focus:border-[#009B4D]"
                required
              />
            </div>

            {/* Jenis Kelamin */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Jenis Kelamin *
              </label>
              <select
                value={formData.jenis_kelamin}
                onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.target.value as 'L' | 'P' })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#009B4D]/30 focus:border-[#009B4D]"
              >
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>

            {/* Golongan Darah */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Golongan Darah
              </label>
              <select
                value={formData.golongan_darah}
                onChange={(e) => setFormData({ ...formData, golongan_darah: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-[#009B4D]/30 focus:border-[#009B4D]"
              >
                <option value="A">A</option>
                <option value="B">B</option>
                <option value="AB">AB</option>
                <option value="O">O</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 2: KONTAK & DOMISILI */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">2. Kontak & Alamat Domisili</h2>
              <p className="text-xs text-slate-500">
                Informasi untuk pengiriman verifikasi dan komunikasi kegiatan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Email Aktif *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="nama@email.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp / Seluler *
              </label>
              <input
                type="tel"
                value={formData.nomor_telepon}
                onChange={(e) => setFormData({ ...formData, nomor_telepon: e.target.value })}
                placeholder="081234567890"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Alamat Lengkap Domisili *
              </label>
              <textarea
                rows={2}
                value={formData.alamat_domisili}
                onChange={(e) => setFormData({ ...formData, alamat_domisili: e.target.value })}
                placeholder="Jalan, No. Rumah, RT/RW, Kelurahan / Desa"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 3: WILAYAH ORGANISASI & KEPRAMUKAAN */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">3. Wilayah Kwartir & Pangkalan</h2>
              <p className="text-xs text-slate-500">
                Penentuan wilayah Kwarda, Kwarcab, dan pangkalan Gugusdepan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Provinsi */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Provinsi (Kwarda) *
              </label>
              <select
                value={formData.provinsi_id}
                onChange={(e) => handleProvinceChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-medium"
              >
                {MASTER_PROVINSI.map((p) => (
                  <option key={p.kode_provinsi} value={p.kode_provinsi}>
                    {p.kode_provinsi} - {p.nama_provinsi}
                  </option>
                ))}
              </select>
            </div>

            {/* Kabupaten / Kota */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kabupaten / Kota (Kwarcab) *
              </label>
              <select
                value={formData.kabupaten_id}
                onChange={(e) => handleRegencyChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-medium"
              >
                {regencies.map((r) => (
                  <option key={r.kode_kabupaten} value={r.kode_kabupaten}>
                    {r.kode_kabupaten} - {r.nama_kabupaten}
                  </option>
                ))}
              </select>
            </div>

            {/* Kecamatan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Kecamatan (Kwarran)
              </label>
              <select
                value={formData.kecamatan_id || formData.wilayah_kecamatan_id}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 font-medium"
              >
                {districts.map((d) => (
                  <option key={d.kode_kecamatan} value={d.kode_kecamatan}>
                    {d.kode_kecamatan} - {d.nama_kecamatan}
                  </option>
                ))}
              </select>
            </div>

            {/* Pangkalan / Gudep */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pangkalan Gugusdepan Asal (SMA/SMK/Universitas/Komunitas)
              </label>
              <input
                type="text"
                value={formData.pangkalan_gudep}
                onChange={(e) => setFormData({ ...formData, pangkalan_gudep: e.target.value })}
                placeholder="Contoh: Gudep 01.001 - 01.002 Pangkalan SMAN 1 Cibinong"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        {/* SECTION 4: PEMINATAN KRIDA & TINGKAT KEANGGOTAAN */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">4. Peminatan Krida Saka Pariwisata</h2>
              <p className="text-xs text-slate-500">
                Pilih fokus keahlian krida dan tingkatan kepramukaan
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Krida Selection */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Pilihan Krida Saka Pariwisata *
              </label>
              <select
                value={formData.krida_id}
                onChange={(e) => setFormData({ ...formData, krida_id: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-bold"
              >
                {KRIDA_MASTER.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.name} ({k.code})
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {KRIDA_MASTER.find((k) => k.id === formData.krida_id)?.description}
              </p>
            </div>

            {/* Tingkat Keanggotaan */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Peran / Tingkat Keanggotaan Saka *
              </label>
              <select
                value={formData.tingkat_keanggotaan}
                onChange={(e) => setFormData({ ...formData, tingkat_keanggotaan: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-semibold"
              >
                {MASTER_TINGKATAN_SAKA.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Scope Note */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#009B4D] shrink-0 mt-0.5" />
            <div className="text-xs text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Catatan Keamanan & Hak Penerbitan:</strong>
              <p className="mt-0.5">
                Sesuai kebijakan SPWN Apps 2.0, pendaftaran mandiri ini berstatus <strong>PENDING</strong>. Nomor KTA dan Dynamic QR Identity akan di-generate oleh <strong>Admin Pusat (Kwarnas)</strong> setelah diverifikasi oleh Admin Wilayah (Kwarcab).
              </p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all"
          >
            Batal
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-xl bg-[#009B4D] hover:bg-emerald-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <span>Mengirim Berkas...</span>
            ) : (
              <>
                <span>Kirim Formulir Pendaftaran</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
