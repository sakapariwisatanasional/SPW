import React, { useEffect, useMemo, useState } from 'react';
import {
  Briefcase,
  Upload,
  RefreshCw,
  ExternalLink,
  Clock3,
  CheckCircle2,
  AlertCircle,
  FileText,
  Link2,
} from 'lucide-react';
import { Card } from '../../../components/ui';
import { useAuthStore } from '../../../stores/authStore';
import {
  portfolioApi,
  MemberEvidenceRecord,
} from '../../../services/api/portfolio.api';

const readFileAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () =>
      resolve(String(reader.result || ''));

    reader.onerror = () =>
      reject(
        new Error('File tidak dapat dibaca')
      );

    reader.readAsDataURL(file);
  });

export const MemberPortfolioView: React.FC = () => {
  const { currentUser } = useAuthStore();

  const memberId = useMemo(() => {
    const user: any = currentUser || {};

    return String(
      user.memberProfile?.id ||
      user.memberProfile?.member_id ||
      user.memberId ||
      user.id ||
      user.nomor_kta ||
      user.no_kta ||
      ''
    ).trim();
  }, [currentUser]);

  const [items, setItems] =
    useState<MemberEvidenceRecord[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [success, setSuccess] =
    useState<string | null>(null);

  const [skkCode, setSkkCode] =
    useState('');

  const [title, setTitle] =
    useState('');

  const [description, setDescription] =
    useState('');

  const [externalUrl, setExternalUrl] =
    useState('');

  const [file, setFile] =
    useState<File | null>(null);

  const load = async () => {
    if (!memberId) {
      setItems([]);
      setError(
        'Identitas anggota GAS belum tersedia.'
      );
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data =
        await portfolioApi.list(memberId);

      setItems(data);
    } catch (err: any) {
      setItems([]);
      setError(
        err?.message ||
        'Portofolio gagal dimuat dari GAS.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [memberId]);

  const handleSubmit = async (
    event: React.FormEvent
  ) => {
    event.preventDefault();

    if (!memberId) {
      setError(
        'Identitas anggota belum tersedia.'
      );
      return;
    }

    if (!skkCode.trim()) {
      setError(
        'Pilih/isi kode SKK terlebih dahulu.'
      );
      return;
    }

    if (!title.trim()) {
      setError(
        'Judul bukti wajib diisi.'
      );
      return;
    }

    if (!file && !externalUrl.trim()) {
      setError(
        'Lampirkan file atau URL bukti.'
      );
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      let fileDataUrl = '';

      if (file) {
        if (file.size > 8 * 1024 * 1024) {
          throw new Error(
            'Ukuran file maksimal 8 MB.'
          );
        }

        const allowed = [
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/pdf',
        ];

        if (!allowed.includes(file.type)) {
          throw new Error(
            'File harus JPG, PNG, WEBP, atau PDF.'
          );
        }

        fileDataUrl =
          await readFileAsDataUrl(file);
      }

      await portfolioApi.add({
        member_id: memberId,
        skk_code: skkCode.trim(),
        evidence_type:
          file
            ? 'FILE'
            : 'URL',
        title: title.trim(),
        description:
          description.trim(),
        url:
          externalUrl.trim(),
        file_data_url:
          fileDataUrl,
        file_name:
          file?.name || '',
      });

      setSkkCode('');
      setTitle('');
      setDescription('');
      setExternalUrl('');
      setFile(null);

      setSuccess(
        'Bukti berhasil dikirim dan menunggu verifikasi Pamong Saka.'
      );

      await load();
    } catch (err: any) {
      setError(
        err?.message ||
        'Bukti gagal disimpan ke GAS.'
      );
    } finally {
      setSaving(false);
    }
  };

  const verified =
    items.filter(
      (item) =>
        String(
          item.verification_status
        ).toUpperCase() === 'VERIFIED'
    ).length;

  const pending =
    items.filter(
      (item) =>
        String(
          item.verification_status
        ).toUpperCase() === 'PENDING'
    ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#0066B3] uppercase">
            <Briefcase className="w-4 h-4" />
            PORTOFOLIO ANGGOTA
          </div>

          <h2 className="text-xl font-black text-slate-900">
            Bukti & Portofolio SKK
          </h2>

          <p className="text-xs text-slate-500">
            Semua lampiran dibaca dan disimpan melalui Google Apps Script.
            Bukti yang dikirim akan diperiksa Pamong Saka.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 disabled:opacity-50"
        >
          <RefreshCw
            className={`w-4 h-4 ${
              loading ? 'animate-spin' : ''
            }`}
          />
          Muat Ulang
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <p className="text-xs text-slate-500">
            Total Bukti
          </p>
          <p className="text-2xl font-black text-slate-900 mt-1">
            {items.length}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Menunggu Pamong
          </p>
          <p className="text-2xl font-black text-amber-600 mt-1">
            {pending}
          </p>
        </Card>

        <Card>
          <p className="text-xs text-slate-500">
            Terverifikasi
          </p>
          <p className="text-2xl font-black text-emerald-600 mt-1">
            {verified}
          </p>
        </Card>
      </div>

      <Card>
        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <div>
            <h3 className="font-black text-slate-900">
              Tambahkan Bukti SKK
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Bukti wajib dikaitkan dengan SKK yang sedang dikerjakan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">
                Kode SKK
              </label>
              <input
                value={skkCode}
                onChange={(e) =>
                  setSkkCode(e.target.value)
                }
                placeholder="Contoh: PM-01"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                Judul Bukti
              </label>
              <input
                value={title}
                onChange={(e) =>
                  setTitle(e.target.value)
                }
                placeholder="Contoh: Praktik pemanduan wisata"
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700">
              Deskripsi
            </label>
            <textarea
              value={description}
              onChange={(e) =>
                setDescription(e.target.value)
              }
              rows={3}
              placeholder="Jelaskan kegiatan/bukti yang dilampirkan..."
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-700">
                Upload File
              </label>

              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
                onChange={(e) =>
                  setFile(
                    e.target.files?.[0] || null
                  )
                }
                className="mt-1 block w-full text-xs"
              />

              <p className="text-[10px] text-slate-400 mt-1">
                JPG/PNG/WEBP/PDF, maksimum 8 MB.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700">
                atau URL Bukti
              </label>

              <input
                type="url"
                value={externalUrl}
                onChange={(e) =>
                  setExternalUrl(e.target.value)
                }
                placeholder="https://..."
                className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              {success}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0066B3] text-white text-sm font-bold disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {saving
              ? 'Mengirim...'
              : 'Kirim Bukti ke Pamong'}
          </button>
        </form>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-black text-slate-900">
              Riwayat Portofolio
            </h3>
            <p className="text-xs text-slate-500">
              Data langsung dari MEMBER_SKK_EVIDENCE.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-10 text-center text-sm text-slate-500">
            Memuat portofolio dari GAS...
          </div>
        ) : items.length === 0 ? (
          <div className="py-10 text-center">
            <FileText className="w-8 h-8 mx-auto text-slate-300" />
            <p className="font-bold text-slate-700 mt-2">
              Belum ada bukti portofolio
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Bukti yang Anda kirim akan tampil di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => {
              const status =
                String(
                  item.verification_status ||
                  'PENDING'
                ).toUpperCase();

              const isVerified =
                status === 'VERIFIED';

              return (
                <div
                  key={
                    item.id ||
                    item.evidence_id
                  }
                  className="rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold">
                        {item.skk_code}
                      </span>

                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          isVerified
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {isVerified
                          ? 'TERVERIFIKASI'
                          : status}
                      </span>
                    </div>

                    <p className="font-bold text-slate-900 mt-2">
                      {item.title}
                    </p>

                    {item.description && (
                      <p className="text-xs text-slate-500 mt-1">
                        {item.description}
                      </p>
                    )}

                    <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-400">
                      <Clock3 className="w-3 h-3" />
                      {item.created_at ||
                        'Waktu tidak tersedia'}
                    </div>
                  </div>

                  {(item.file_url || item.url) && (
                    <a
                      href={
                        item.file_url ||
                        item.url
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#0066B3] hover:bg-blue-50"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Lihat Bukti
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
