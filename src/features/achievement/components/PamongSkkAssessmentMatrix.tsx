import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Award, AlertCircle, RefreshCw, Save, CheckCircle2 } from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';

type Level = 'PURWA' | 'MADYA' | 'UTAMA';
type RubricField = 'knowledge_level' | 'skill_level' | 'attitude_level' | 'product_level';
type Rubric = Record<RubricField, string> & { assessment_note: string };
interface Props { member: any; canAssess?: boolean; onUpdated?: () => void | Promise<void> }
interface SkkItem { skkCode: string; nama?: string; kridaId?: string; kridaNama?: string; urutan?: number; isOfficial?: boolean; accessStatus?: string; blockedBy?: string }
const LEVELS: Level[] = ['PURWA', 'MADYA', 'UTAMA'];
const FIELDS: { key: RubricField; label: string }[] = [
  { key: 'knowledge_level', label: 'Pengetahuan' },
  { key: 'skill_level', label: 'Keterampilan' },
  { key: 'attitude_level', label: 'Sikap kerja' },
  { key: 'product_level', label: 'Produk / praktik' },
];
const emptyRubric = (): Rubric => ({ knowledge_level: '', skill_level: '', attitude_level: '', product_level: '', assessment_note: '' });
const isOfficial = (code: string) => /^(PM-0[1-8]|PY-0[1-6]|ME-0[1-4]|KC-0[1-5])$/i.test(code);
const responsePayload = (response: any) => response?.data?.data ?? response?.data ?? response;

/**
 * Matriks penilaian bertingkat. API tetap menjadi satu-satunya penentu otorisasi,
 * verifikasi bukti, status ledger, dan pembukaan SKK berikutnya.
 * Jangan menggunakan status pada MEMBER_SKILL_STATUS sebagai hasil kelulusan level.
 */
export const PamongSkkAssessmentMatrix: React.FC<Props> = ({ member, canAssess = false, onUpdated }) => {
  const memberId = String(member?.id || member?.member_id || member?.no_kta || member?.nomor_kta || '').trim();
  const [items, setItems] = useState<SkkItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [selectedKrida, setSelectedKrida] = useState('ALL');
  const [levels, setLevels] = useState<Record<string, Level>>({});
  const [rubrics, setRubrics] = useState<Record<string, Rubric>>({});
  const [assessedInSession, setAssessedInSession] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    if (!memberId) { setItems([]); return; }
    setLoading(true);
    setError('');
    try {
      const result = responsePayload(await apiClient.get<any>('pamong.skk.available', { member_id: memberId }));
      setItems(Array.isArray(result?.skk) ? result.skk.filter((x: any) => isOfficial(String(x.skkCode || ''))) : []);
    } catch (e: any) {
      setItems([]);
      setError(e?.message || 'Gagal memuat katalog SKK.');
    } finally { setLoading(false); }
  }, [memberId]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => { setRubrics({}); setAssessedInSession({}); setLevels({}); setMessage(''); }, [memberId]);

  const kridaOptions = useMemo(() => Array.from(new Map(items.map(x => [String(x.kridaId || ''), String(x.kridaNama || x.kridaId || '')])).entries()).filter(([id]) => id), [items]);
  const filtered = useMemo(() => items.filter(x => selectedKrida === 'ALL' || x.kridaId === selectedKrida).sort((a, b) => String(a.kridaId).localeCompare(String(b.kridaId)) || Number(a.urutan || 0) - Number(b.urutan || 0)), [items, selectedKrida]);
  const keyFor = (code: string, level: Level) => `${code}:${level}`;
  const levelFor = (code: string): Level => levels[code] || 'PURWA';
  const rubricFor = (code: string, level: Level): Rubric => rubrics[keyFor(code, level)] || emptyRubric();
  const updateRubric = (code: string, level: Level, field: keyof Rubric, value: string) => {
    const k = keyFor(code, level);
    setRubrics(prev => ({ ...prev, [k]: { ...(prev[k] || emptyRubric()), [field]: value } }));
    setAssessedInSession(prev => ({ ...prev, [k]: false }));
  };
  const validRubric = (rubric: Rubric) => FIELDS.every(({key}) => rubric[key] !== '' && Number.isInteger(Number(rubric[key])) && Number(rubric[key]) >= 0 && Number(rubric[key]) <= 4);

  const run = async (item: SkkItem, action: 'assess' | 'pass') => {
    if (!canAssess || !memberId) return;
    const level = levelFor(item.skkCode);
    const k = keyFor(item.skkCode, level);
    const rubric = rubricFor(item.skkCode, level);
    if (action === 'assess' && !validRubric(rubric)) {
      setError('Isi keempat komponen rubrik dengan nilai bilangan bulat 0–4.'); return;
    }
    // The completion action is deliberately separate; only the backend confirms pass.
    // A rubric must be saved in this session before this UI offers completion.
    if (action === 'pass' && !assessedInSession[k]) {
      setError('Simpan penilaian tingkat ini terlebih dahulu.'); return;
    }
    setBusy(k);
    setError(''); setMessage('');
    try {
      if (action === 'assess') {
        const data = Object.fromEntries(FIELDS.map(({ key }) => [key, Number(rubric[key])]));
        await apiClient.post<any>('pamong.skk.assessment.hybrid.save', {
          member_id: memberId, skk_code: item.skkCode, level,
          ...data, assessment_note: rubric.assessment_note,
        });
        setAssessedInSession(prev => ({ ...prev, [k]: true }));
        setMessage(`Penilaian ${item.skkCode} ${level} tersimpan. Kelulusan belum ditetapkan.`);
      } else {
        await apiClient.post<any>('pamong.skk.hybrid.complete', { member_id: memberId, skk_code: item.skkCode, level });
        setAssessedInSession(prev => ({ ...prev, [k]: false }));
        setMessage(`${item.skkCode} ${level}: keputusan kelulusan berhasil dicatat oleh backend.`);
        await load();
        await onUpdated?.();
      }
    } catch (e: any) {
      setError(e?.message || 'Proses gagal. Periksa tingkat, prasyarat, bukti terverifikasi, dan hak Pamong.');
    } finally { setBusy(''); }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-slate-900"><Award className="h-4 w-4" /> Penilaian SKK bertingkat</p>
          <p className="mt-1 text-xs text-slate-600">Purwa, Madya, dan Utama dicatat terpisah. Persyaratan kelulusan diverifikasi di GAS.</p>
        </div>
        <div className="flex items-center gap-2">
          <select className="rounded-lg border px-2 py-2 text-xs" value={selectedKrida} onChange={e => setSelectedKrida(e.target.value)} aria-label="Filter Krida">
            <option value="ALL">Semua Krida</option>
            {kridaOptions.map(([id, name]) => <option key={id} value={id}>{name}</option>)}
          </select>
          <button type="button" onClick={() => void load()} className="flex items-center gap-1 rounded-lg border px-3 py-2 text-xs font-semibold"><RefreshCw className="h-4 w-4" /> Muat ulang</button>
        </div>
      </div>
      {!!error && <div role="alert" className="m-4 flex gap-2 rounded-lg bg-red-50 p-3 text-xs text-red-700"><AlertCircle className="h-4 w-4 shrink-0" />{error}</div>}
      {!!message && <div role="status" className="m-4 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800">{message}</div>}
      {loading ? <p className="p-8 text-center text-sm text-slate-500">Memuat SKK...</p> : filtered.length === 0 ? <p className="p-8 text-center text-sm text-slate-500">Belum ada SKK resmi yang dapat ditampilkan.</p> : (
        <div className="divide-y divide-slate-200">
          {filtered.map(item => {
            const level = levelFor(item.skkCode);
            const k = keyFor(item.skkCode, level);
            const rubric = rubricFor(item.skkCode, level);
            return (
              <div key={item.skkCode} className="space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div><p className="text-sm font-bold text-slate-900">{item.skkCode} — {item.nama}</p><p className="text-xs text-slate-500">{item.kridaNama || item.kridaId}</p></div>
                  <label className="text-xs font-semibold text-slate-700">Tingkat
                    <select value={level} onChange={e => { setLevels(prev => ({ ...prev, [item.skkCode]: e.target.value as Level })); setError(''); }} className="ml-2 rounded-lg border px-2 py-1.5" aria-label={`Tingkat ${item.skkCode}`}>
                      {LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </label>
                </div>
                <div className="grid gap-2 sm:grid-cols-4">
                  {FIELDS.map(({ key, label }) => <label key={key} className="text-xs text-slate-700">{label}
                    <input type="number" inputMode="numeric" min={0} max={4} step={1} disabled={!canAssess || !!busy} value={rubric[key]} onChange={e => updateRubric(item.skkCode, level, key, e.target.value)} className="mt-1 block w-full rounded-lg border px-2 py-2 disabled:bg-slate-50" placeholder="0–4" />
                  </label>)}
                </div>
                <label className="block text-xs text-slate-700">Catatan penilaian
                  <input type="text" disabled={!canAssess || !!busy} value={rubric.assessment_note} onChange={e => updateRubric(item.skkCode, level, 'assessment_note', e.target.value)} className="mt-1 block w-full rounded-lg border px-2 py-2 disabled:bg-slate-50" placeholder="Catatan Pamong" />
                </label>
                <div className="flex flex-wrap items-center gap-2">
                  <button type="button" disabled={!canAssess || !!busy || !validRubric(rubric)} onClick={() => void run(item, 'assess')} className="flex items-center gap-1 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-800 disabled:opacity-50"><Save className="h-4 w-4" /> Simpan penilaian</button>
                  <button type="button" disabled={!canAssess || !!busy || !assessedInSession[k]} onClick={() => void run(item, 'pass')} className="flex items-center gap-1 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><CheckCircle2 className="h-4 w-4" /> Nyatakan lulus</button>
                  <span className="text-xs text-slate-500">Kelulusan baru sah jika GAS menerima bukti terverifikasi, nilai, dan urutan tingkat.</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
