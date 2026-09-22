/**
 * SPWN Apps 2.0 - SKK Evaluation Matrix Component
 * Sumber: BAB VIII & Lembar Uji Buku Panduan SKK SAKA Pariwisata 2026
 * Location: src/features/skk/components/SkkEvaluationMatrix.tsx
 */

import React from 'react';
import { Card, Badge } from '../../../components/ui';
import { CheckCircle2, AlertTriangle, Award, FileText, ClipboardList } from 'lucide-react';

interface Props {
  skkKode: string;
  skkNama: string;
  produkUtama: string;
  tingkatNama: string;
}

export const SkkEvaluationMatrix: React.FC<Props> = ({
  skkKode,
  skkNama,
  produkUtama,
  tingkatNama,
}) => {
  const components = [
    {
      no: 1,
      nama: 'Pengetahuan (Teori & Wawasan)',
      bobot: '20%',
      metode: 'Tanya jawab lisan, studi kasus, pemahaman konsep',
      keterangan: 'Mengukur penguasaan terhadap materi, prosedur, dan aturan kepariwisataan.',
    },
    {
      no: 2,
      nama: 'Keterampilan (Praktik Unjuk Kerja)',
      bobot: '40%',
      metode: 'Praktik langsung, simulasi, demonstrasi teknis',
      keterangan: 'Penerapan nyata keahlian di lapangan atau kondisi yang disimulasikan.',
    },
    {
      no: 3,
      nama: 'Sikap Kerja (Etika Kepramukaan)',
      bobot: '20%',
      metode: 'Observasi perilaku selama kegiatan & pengujian',
      keterangan: 'Kedisiplinan, tanggung jawab, ketelitian, keramahan, dan kepedulian keselamatan.',
    },
    {
      no: 4,
      nama: 'Produk / Hasil Praktik Nyata',
      bobot: '20%',
      metode: 'Penilaian karya fisik/dokumen portofolio',
      keterangan: 'Wajib menghasilkan karya nyata (dokumen, foto/video, produk kriya, atau simulasi teruji).',
    },
  ];

  const rubrik = [
    { rentang: '90 – 100', predikat: 'Sangat Baik', status: 'MEMENUHI' },
    { rentang: '80 – 89', predikat: 'Baik (Ambang Lulus Minimal)', status: 'MEMENUHI' },
    { rentang: '70 – 79', predikat: 'Cukup (Perlu Pembinaan Lanjut)', status: 'BELUM MEMENUHI' },
    { rentang: '60 – 69', predikat: 'Kurang', status: 'BELUM MEMENUHI' },
    { rentang: '0 – 59', predikat: 'Belum Memenuhi', status: 'BELUM MEMENUHI' },
  ];

  return (
    <div className="space-y-4">
      {/* Bobot Uji Table Card */}
      <Card padding="md" className="border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#0066B3]" />
              <span>Matriks Penilaian & Bobot Uji Standar Nasional (Bab VIII)</span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Format lembar uji seragam secara nasional untuk {skkKode} ({tingkatNama.toUpperCase()})
            </p>
          </div>
          <Badge variant="blue" size="sm">
            Total Bobot: 100%
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                <th className="py-2.5 px-3 font-semibold w-12 text-center">No</th>
                <th className="py-2.5 px-3 font-semibold">Komponen yang Dinilai</th>
                <th className="py-2.5 px-3 font-semibold w-24 text-center">Bobot</th>
                <th className="py-2.5 px-3 font-semibold">Metode Evaluasi Penguji</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {components.map((comp) => (
                <tr key={comp.no} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{comp.no}</td>
                  <td className="py-2.5 px-3">
                    <p className="font-semibold text-slate-900">{comp.nama}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{comp.keterangan}</p>
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-900 bg-slate-50/50">
                    {comp.bobot}
                  </td>
                  <td className="py-2.5 px-3 text-slate-600 text-[11px]">{comp.metode}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Rumus Nilai Akhir */}
        <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="text-[11px] text-slate-600">
            <span className="font-semibold text-slate-900">Rumus Nilai Akhir: </span>
            <code>(Pengetahuan × 20%) + (Keterampilan × 40%) + (Sikap × 20%) + (Produk × 20%)</code>
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Kriteria Lulus: Nilai Akhir ≥ 80</span>
          </div>
        </div>
      </Card>

      {/* Rubrik Skor & Standar Kelulusan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Rubrik Kategori */}
        <Card padding="md" className="border border-slate-200">
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#F7941D]" />
            <span>Rubrik Kategori Skor (Rentang 0–100)</span>
          </h4>
          <div className="space-y-1.5 text-xs">
            {rubrik.map((r, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-800 w-16">{r.rentang}</span>
                  <span className="text-slate-600 text-[11px]">{r.predikat}</span>
                </div>
                <Badge
                  size="sm"
                  variant={r.status === 'MEMENUHI' ? 'green' : 'neutral'}
                  className="text-[10px]"
                >
                  {r.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Portofolio & Ketentuan Hak Profesi */}
        <Card padding="md" className="border border-slate-200 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#009B4D]" />
              <span>Ketentuan Portofolio & Batas Kewenangan</span>
            </h4>
            <div className="space-y-2 text-[11px] text-slate-600 leading-relaxed">
              <p>
                <strong>Portofolio Wajib:</strong> Peserta wajib menyertakan lembar profil/rencana, foto proses kegiatan, dokumentasi produk akhir, lembar observasi pembina, serta catatan penguji resmi.
              </p>
              <p>
                <strong>Produk Utama ({tingkatNama}):</strong> <span className="font-semibold text-slate-800">{produkUtama}</span> tidak boleh dihilangkan dari rangkaian proses uji kecakapan.
              </p>
            </div>
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-tight">
              <strong>Catatan Buku Panduan:</strong> Pengakuan SKK SAKA Pariwisata merupakan standar pendidikan kepramukaan nasional dan tidak dengan sendirinya menggantikan sertifikasi kompetensi profesi (SKKNI/BNSP).
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};
