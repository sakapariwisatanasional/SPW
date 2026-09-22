/**
 * SPWN Apps 2.0 - National Region Master Module (Module 4)
 * Location: src/features/admin/components/NationalRegionMaster.tsx
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Globe,
  Database,
  Layers,
  Search,
  CheckCircle2,
  RefreshCw,
  Zap,
  Server,
  FileSpreadsheet,
  AlertCircle,
  ExternalLink,
  Upload,
  Download,
  Trash2,
  X,
  Plus,
  FileText,
  Check,
  ChevronRight,
} from 'lucide-react';
import { useAdminStore } from '../stores/adminStore';
import {
  PROVINCES,
  getRegenciesByProvince,
  SAMPLE_DISTRICTS,
  getDistrictsByRegency,
  getCustomDistricts,
  saveCustomDistricts,
  clearCustomDistricts,
  parseDistrictCsv,
  DistrictItem,
  RegencyItem,
  TOTAL_MASTER_DISTRICTS,
} from '../../../data/wilayahData';

export const NationalRegionMaster: React.FC = () => {
  const { regionSeederStatus, isSeederRunning, seederProgress, runRegionSeed } = useAdminStore();

  const [selectedProvinceCode, setSelectedProvinceCode] = useState('32'); // Default Jawa Barat
  const [searchRegionQuery, setSearchRegionQuery] = useState('');

  // CSV Import State
  const [showCsvModal, setShowCsvModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedPreview, setParsedPreview] = useState<{
    items: DistrictItem[];
    errors: string[];
    totalParsed: number;
  } | null>(null);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);

  // Drilldown Regency Modal State
  const [activeDrilldownRegency, setActiveDrilldownRegency] = useState<RegencyItem | null>(null);
  const [drilldownSearch, setDrilldownSearch] = useState('');
  const [manualDistrictName, setManualDistrictName] = useState('');
  const [manualDistrictCode3, setManualDistrictCode3] = useState('');

  // Counter of custom districts stored
  const [customCount, setCustomCount] = useState<number>(() => getCustomDistricts().length);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      setCustomCount(getCustomDistricts().length);
    };
    window.addEventListener('spwn:districts-updated', handleUpdate);
    return () => window.removeEventListener('spwn:districts-updated', handleUpdate);
  }, []);

  const activeProvince = useMemo(() => {
    return PROVINCES.find((p) => p.code === selectedProvinceCode) || PROVINCES[0];
  }, [selectedProvinceCode]);

  const regencies = useMemo(() => {
    return getRegenciesByProvince(selectedProvinceCode);
  }, [selectedProvinceCode]);

  const filteredRegencies = useMemo(() => {
    if (!searchRegionQuery.trim()) return regencies;
    const q = searchRegionQuery.toLowerCase();
    return regencies.filter(
      (r) => r.name.toLowerCase().includes(q) || r.code.includes(q)
    );
  }, [regencies, searchRegionQuery]);

  // Handle CSV file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCsvFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content) {
        setCsvText(content);
        const parsed = parseDistrictCsv(content);
        setParsedPreview(parsed);
      }
    };
    reader.readAsText(file);
  };

  // Handle CSV Text change
  const handleCsvTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setCsvText(val);
    if (val.trim()) {
      const parsed = parseDistrictCsv(val);
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
    }
  };

  // Commit Parsed CSV to System
  const handleApplyCsv = () => {
    if (!parsedPreview || parsedPreview.items.length === 0) return;

    const totalSaved = saveCustomDistricts(parsedPreview.items);
    setCustomCount(totalSaved);
    setImportSuccessMsg(`Berhasil mengimpor & menyinkronkan ${parsedPreview.items.length} kecamatan ke dalam sistem.`);
    setParsedPreview(null);
    setCsvText('');
    setCsvFileName('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setImportSuccessMsg(null);
      setShowCsvModal(false);
    }, 2000);
  };

  // Download Sample Template CSV
  const handleDownloadTemplate = () => {
    const templateContent = [
      'kode_kabupaten,kode_kecamatan_3digit,nama_kecamatan',
      '3201,010,CIBINONG',
      '3201,020,GUNUNG PUTRI',
      '3201,030,CITEUREUP',
      '3201,040,SUKARAJA',
      '3201,050,BABAKAN MADANG',
      '3204,010,CIWIDEY',
      '3204,020,RANCABALI',
      '3204,030,PASIRJAMBU',
      '3271,010,BOGOR SELATAN',
      '3271,020,BOGOR TIMUR',
    ].join('\n');

    const blob = new Blob([templateContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'template_kecamatan_spwn.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Clear Custom CSV Districts
  const handleClearCustom = () => {
    if (window.confirm('Yakin ingin mereset seluruh data kecamatan custom yang diimpor dari CSV?')) {
      clearCustomDistricts();
      setCustomCount(0);
    }
  };

  // Add Manual District for active drilldown regency
  const handleAddManualDistrict = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDrilldownRegency || !manualDistrictName.trim() || !manualDistrictCode3.trim()) return;

    const cleanCode3 = manualDistrictCode3.replace(/\D/g, '').padStart(3, '0').slice(-3);
    const newItem: DistrictItem = {
      code: `${activeDrilldownRegency.code}${cleanCode3}`,
      regencyCode: activeDrilldownRegency.code,
      districtCode3: cleanCode3,
      name: manualDistrictName.trim().toUpperCase(),
    };

    saveCustomDistricts([newItem]);
    setManualDistrictName('');
    setManualDistrictCode3('');
  };

  // Drilldown districts for modal
  const drilldownDistricts = useMemo(() => {
    if (!activeDrilldownRegency) return [];
    const list = getDistrictsByRegency(activeDrilldownRegency.code);
    if (!drilldownSearch.trim()) return list;
    const q = drilldownSearch.toLowerCase();
    return list.filter((d) => d.name.toLowerCase().includes(q) || d.districtCode3.includes(q));
  }, [activeDrilldownRegency, drilldownSearch, customCount]);

  return (
    <div className="space-y-6">
      {/* 1. Seeder Status Card (Chunked Loading & CSV Integration Status) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0066B3] flex items-center justify-center shrink-0">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  Status Database Master Wilayah Nasional (BPS / Kemendagri)
                </h3>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Idempotent & Synced
                </span>
                {customCount > 0 && (
                  <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                    +{customCount} CSV Aktif
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Penyelarasan kode wilayah otomatis untuk penerbitan KTA (Format: 00.PPKK.CCC.NNNNNN).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              id="btn-open-csv-importer"
              type="button"
              onClick={() => setShowCsvModal(true)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <Upload className="w-3.5 h-3.5" />
              Impor CSV Kecamatan
            </button>

            <button
              id="btn-sync-region-seed"
              type="button"
              disabled={isSeederRunning}
              onClick={() => runRegionSeed(true)}
              className="px-3.5 py-2 rounded-xl bg-[#0066B3] hover:bg-[#004C85] disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSeederRunning ? 'animate-spin' : ''}`} />
              {isSeederRunning ? 'Menyinkronkan...' : 'Sinkronkan'}
            </button>
          </div>
        </div>

        {/* Sync Progress Bar (Active during sync) */}
        {isSeederRunning && (
          <div className="space-y-1.5 py-1">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Memproses batch wilayah ke Google Sheets & Master Cache...</span>
              <span>{seederProgress}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#0066B3] h-full rounded-full transition-all duration-300"
                style={{ width: `${seederProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* 4 Statistical Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Provinsi Resmi
            </span>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {PROVINCES.length}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">38 Kwarda</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kabupaten / Kota
            </span>
            <p className="text-xl font-extrabold text-[#0066B3] mt-0.5">
              {regionSeederStatus.statistics.regencies}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">514 Kwarcab</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Kecamatan Terdata
            </span>
            <p className="text-xl font-extrabold text-emerald-700 mt-0.5">
              {(TOTAL_MASTER_DISTRICTS + customCount).toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {customCount > 0 ? `${TOTAL_MASTER_DISTRICTS.toLocaleString('id-ID')} Master + ${customCount} Custom` : `${TOTAL_MASTER_DISTRICTS.toLocaleString('id-ID')} Master Nasional`}
            </p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Desa / Kelurahan
            </span>
            <p className="text-xl font-extrabold text-purple-700 mt-0.5">
              {regionSeederStatus.statistics.villages.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">Basis Pangkalan Gudep</p>
          </div>
        </div>
      </div>

      {/* 2. Interactive Region Explorer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: 38 Provinces List */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Daftar 38 Provinsi (Kwarda)
            </h4>
            <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-md">
              {PROVINCES.length} Total
            </span>
          </div>

          <div className="space-y-1 max-h-[520px] overflow-y-auto pr-1">
            {PROVINCES.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => setSelectedProvinceCode(p.code)}
                className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                  selectedProvinceCode === p.code
                    ? 'bg-[#0066B3] text-white shadow-xs'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`font-mono text-[11px] px-1.5 py-0.5 rounded-md ${
                      selectedProvinceCode === p.code
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.code}
                  </span>
                  <span className="truncate">{p.name}</span>
                </div>
                <span className="text-[10px] opacity-80 shrink-0">
                  {getRegenciesByProvince(p.code).length} Kab/Kota
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Regencies & Sample Districts */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Kabupaten & Kota (Kwarcab)
              </span>
              <h4 className="text-sm font-bold text-slate-900">
                {activeProvince.code} - {activeProvince.name}
              </h4>
            </div>

            <div className="relative w-full sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="input-search-regency"
                type="text"
                value={searchRegionQuery}
                onChange={(e) => setSearchRegionQuery(e.target.value)}
                placeholder="Cari nama kabupaten/kota..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
              />
            </div>
          </div>

          {/* Regencies Table */}
          <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200 sticky top-0">
                  <th className="py-2.5 px-3">Kode PPKK</th>
                  <th className="py-2.5 px-3">Nama Kabupaten / Kota</th>
                  <th className="py-2.5 px-3">KTA Wilayah</th>
                  <th className="py-2.5 px-3 text-right">Kecamatan (Kwarran)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredRegencies.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-400">
                      Tidak ditemukan kabupaten/kota yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredRegencies.map((r) => {
                    const distList = getDistrictsByRegency(r.code);
                    const isCustom = getCustomDistricts(r.code).length > 0;
                    return (
                      <tr
                        key={r.code}
                        onClick={() => setActiveDrilldownRegency(r)}
                        className="hover:bg-blue-50/50 cursor-pointer transition-colors group"
                      >
                        <td className="py-2.5 px-3 font-mono font-bold text-[#0066B3]">{r.code}</td>
                        <td className="py-2.5 px-3">
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            {r.name}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0066B3] transition-colors" />
                          </div>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-emerald-700">
                          00.{r.code}.CCC.NNNNNN
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                              isCustom
                                ? 'bg-purple-100 text-purple-800'
                                : distList.length > 6
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {distList.length} Kecamatan
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1">
            <span>Klik pada baris Kabupaten/Kota untuk melihat rincian seluruh daftar kecamatan.</span>
            {customCount > 0 && (
              <button
                type="button"
                onClick={handleClearCustom}
                className="text-red-500 hover:text-red-700 font-semibold flex items-center gap-1 text-[11px]"
              >
                <Trash2 className="w-3 h-3" /> Reset Data CSV Custom
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. CSV UPLOAD & IMPORT MODAL */}
      {showCsvModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Impor & Sinkronisasi CSV Data Kecamatan
                  </h3>
                  <p className="text-xs text-slate-500">
                    Unggah file CSV atau tempel teks data kecamatan untuk mengisi seluruh wilayah.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {importSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 flex items-center gap-2 font-medium">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  {importSuccessMsg}
                </div>
              )}

              {/* Upload Box */}
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-emerald-500 hover:bg-emerald-50/30 transition-all">
                <input
                  id="csv-file-input"
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label htmlFor="csv-file-input" className="cursor-pointer block space-y-2">
                  <Upload className="w-7 h-7 mx-auto text-emerald-600" />
                  <div>
                    <span className="font-bold text-slate-800">
                      {csvFileName ? csvFileName : 'Pilih file CSV dari perangkat Anda'}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Mendukung format kolom: <code className="bg-slate-100 px-1 py-0.5 rounded">kode_kabupaten, kode_kecamatan, nama_kecamatan</code> atau kode 7-digit.
                    </p>
                  </div>
                </label>
              </div>

              {/* Paste Text Area */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-slate-700 font-semibold">
                  <span>Atau Tempel (Paste) Konten CSV di Sini:</span>
                  <button
                    type="button"
                    onClick={handleDownloadTemplate}
                    className="text-emerald-700 hover:text-emerald-800 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Download className="w-3 h-3" /> Unduh Template CSV
                  </button>
                </div>
                <textarea
                  id="textarea-csv-paste"
                  rows={4}
                  value={csvText}
                  onChange={handleCsvTextChange}
                  placeholder={`Contoh baris:\n3201,010,CIBINONG\n3201,020,GUNUNG PUTRI\n3204,010,CIWIDEY`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Preview Box */}
              {parsedPreview && (
                <div className="space-y-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">
                      Hasil Analisis CSV:
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-bold text-[11px]">
                      {parsedPreview.items.length} Kecamatan Terdeteksi
                    </span>
                  </div>

                  {parsedPreview.errors.length > 0 && (
                    <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[11px] space-y-0.5">
                      <p className="font-bold">Peringatan baris:</p>
                      {parsedPreview.errors.slice(0, 3).map((err, idx) => (
                        <p key={idx}>• {err}</p>
                      ))}
                      {parsedPreview.errors.length > 3 && (
                        <p>... dan {parsedPreview.errors.length - 3} peringatan lainnya.</p>
                      )}
                    </div>
                  )}

                  {/* Sample table */}
                  <div className="overflow-x-auto max-h-36">
                    <table className="w-full text-left text-[11px]">
                      <thead>
                        <tr className="text-slate-400 border-b border-slate-200">
                          <th className="py-1">Kode Kab/Kota</th>
                          <th className="py-1">Kode Kec (3-Digit)</th>
                          <th className="py-1">Nama Kecamatan</th>
                          <th className="py-1">Simulasi KTA</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {parsedPreview.items.slice(0, 5).map((item, idx) => (
                          <tr key={idx}>
                            <td className="py-1 text-blue-600 font-bold">{item.regencyCode}</td>
                            <td className="py-1 text-slate-800 font-bold">{item.districtCode3}</td>
                            <td className="py-1 font-sans text-slate-900">{item.name}</td>
                            <td className="py-1 text-emerald-700">00.{item.regencyCode}.{item.districtCode3}.XXXXXX</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {parsedPreview.items.length > 5 && (
                    <p className="text-[10px] text-slate-400 italic">
                      Menampilkan 5 sampel dari total {parsedPreview.items.length} kecamatan yang akan diimpor.
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowCsvModal(false)}
                className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/50 font-bold text-xs"
              >
                Batal
              </button>
              <button
                id="btn-apply-csv"
                type="button"
                disabled={!parsedPreview || parsedPreview.items.length === 0}
                onClick={handleApplyCsv}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                Simpan & Terapkan ke Sistem
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. DRILLDOWN REGENCY DISTRICTS MODAL */}
      {activeDrilldownRegency && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-[#0066B3] flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Kecamatan di {activeDrilldownRegency.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono">
                    Kode PPKK: {activeDrilldownRegency.code} | Total: {drilldownDistricts.length} Kwarran
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDrilldownRegency(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="input-drilldown-search"
                  type="text"
                  value={drilldownSearch}
                  onChange={(e) => setDrilldownSearch(e.target.value)}
                  placeholder="Cari kecamatan di kabupaten ini..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0066B3]"
                />
              </div>

              {/* Districts List */}
              <div className="border border-slate-200 rounded-xl overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3">Kode CCC</th>
                      <th className="py-2 px-3">Nama Kecamatan</th>
                      <th className="py-2 px-3">Kode Lengkap</th>
                      <th className="py-2 px-3 text-right">Format KTA Anggota</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {drilldownDistricts.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          Tidak ada kecamatan yang sesuai pencarian.
                        </td>
                      </tr>
                    ) : (
                      drilldownDistricts.map((d) => (
                        <tr key={d.code} className="hover:bg-slate-50">
                          <td className="py-2 px-3 font-mono font-bold text-[#0066B3]">
                            {d.districtCode3}
                          </td>
                          <td className="py-2 px-3 font-bold text-slate-900">{d.name}</td>
                          <td className="py-2 px-3 font-mono text-slate-500 text-[11px]">{d.code}</td>
                          <td className="py-2 px-3 font-mono text-emerald-700 text-right text-[11px]">
                            00.{activeDrilldownRegency.code}.{d.districtCode3}.NNNNNN
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Add District */}
              <form onSubmit={handleAddManualDistrict} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                <span className="font-bold text-slate-800 block text-xs">
                  + Tambah / Lengkapi Kecamatan Manual di {activeDrilldownRegency.name}:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-4">
                    <input
                      id="input-manual-code3"
                      type="text"
                      maxLength={3}
                      value={manualDistrictCode3}
                      onChange={(e) => setManualDistrictCode3(e.target.value)}
                      placeholder="Kode 3-digit (cth: 010)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 font-mono text-xs focus:ring-2 focus:ring-[#0066B3] focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-6">
                    <input
                      id="input-manual-name"
                      type="text"
                      value={manualDistrictName}
                      onChange={(e) => setManualDistrictName(e.target.value)}
                      placeholder="Nama Kecamatan (cth: SUKAMAJU)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs uppercase focus:ring-2 focus:ring-[#0066B3] focus:outline-hidden"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <button
                      id="btn-add-manual-district"
                      type="submit"
                      disabled={!manualDistrictName.trim() || !manualDistrictCode3.trim()}
                      className="w-full h-full py-1.5 px-3 bg-[#0066B3] hover:bg-[#004C85] disabled:opacity-50 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" /> Simpan
                    </button>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveDrilldownRegency(null)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

