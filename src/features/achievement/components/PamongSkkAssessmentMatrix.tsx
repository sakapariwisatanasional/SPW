import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  CheckCircle2,
  Clock3,
  Save,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { apiClient } from '../../../services/api/apiClient';

interface PamongSkkAssessmentMatrixProps {
  member: any;
  canAssess?: boolean;
  onUpdated?: () => void | Promise<void>;
}

const upper = (value: unknown) =>
  String(value ?? '').trim().toUpperCase();

const statusLabel = (status: string) => {
  const s = upper(status);

  if (s === 'VERIFIED' || s === 'COMPLETED') return 'SELESAI';
  if (s === 'SUBMITTED') return 'MENUNGGU REVIEW';
  if (s === 'REVISION_REQUIRED') return 'REVISI';
  if (s === 'IN_PROGRESS' || s === 'SELECTED') return 'PROSES';
  if (s === 'RESUBMITTED') return 'DIKIRIM ULANG';

  return 'BELUM DIMULAI';
};

const statusClass = (status: string) => {
  const s = upper(status);

  if (s === 'VERIFIED' || s === 'COMPLETED') {
    return 'bg-emerald-50 text-emerald-700 border-emerald-200';
  }

  if (s === 'SUBMITTED' || s === 'RESUBMITTED') {
    return 'bg-blue-50 text-blue-700 border-blue-200';
  }

  if (s === 'REVISION_REQUIRED') {
    return 'bg-amber-50 text-amber-700 border-amber-200';
  }

  if (s === 'IN_PROGRESS' || s === 'SELECTED') {
    return 'bg-violet-50 text-violet-700 border-violet-200';
  }

  return 'bg-slate-50 text-slate-600 border-slate-200';
};

export const PamongSkkAssessmentMatrix: React.FC<PamongSkkAssessmentMatrixProps> = ({
  member,
  canAssess = false,
  onUpdated,
}) => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [savingCode, setSavingCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedKrida, setSelectedKrida] = useState('ALL');
  const [scores, setScores] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});

  const memberId =
    member?.id ||
    member?.member_id ||
    member?.no_kta ||
    member?.nomor_kta ||
    '';

  const load = async () => {
    if (!memberId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await apiClient.get<any>(
        'pamong.skk.available',
        { member_id: memberId }
      );

      const payload =
        response?.data?.data ??
        response?.data ??
        null;

      const nextItems =
        Array.isArray(payload?.skk)
          ? payload.skk
          : [];

      setItems(nextItems);

      const initialScores: Record<string, string> = {};
      nextItems.forEach((item: any) => {
        initialScores[item.skkCode] =
          item.score == null ? '' : String(item.score);
      });
      setScores(initialScores);
    } catch (e: any) {
      setItems([]);
      setError(
        e?.message ||
        'Matriks SKK gagal dimuat.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [memberId]);

  const kridaOptions = useMemo(() => {
    const map = new Map<string, string>();

    items.forEach((item: any) => {
      const id = String(item.kridaId || '').trim();

      if (!id) return;

      map.set(
        id,
        item.kridaNama || id
      );
    });

    return Array.from(map.entries());
  }, [items]);

  const filteredItems = useMemo(
    () =>
      selectedKrida === 'ALL'
        ? items
        : items.filter(
            (item: any) =>
              String(item.kridaId) ===
              String(selectedKrida)
          ),
    [items, selectedKrida]
  );

  const grouped = useMemo(() => {
    const map = new Map<string, any[]>();

    filteredItems.forEach((item: any) => {
      const key =
        item.kridaNama ||
        item.kridaId ||
        'KRIDA';

      if (!map.has(key)) {
        map.set(key, []);
      }

      map.get(key)!.push(item);
    });

    return Array.from(map.entries());
  }, [filteredItems]);

  const saveAssessment = async (
    item: any,
    targetStatus: 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    if (!canAssess) return;

    setSavingCode(item.skkCode);
    setError(null);

    try {
      await apiClient.post<any>(
        'pamong.skk.assessment.save',
        {
          member_id: memberId,
          skk_code: item.skkCode,
          skk_nama: item.nama,
          krida_id: item.kridaId,
          status: targetStatus,
          progress_percent:
            targetStatus === 'COMPLETED'
              ? 100
              : Math.max(
                  1,
                  Number(item.progressPercent || 0)
                ),
          score:
            scores[item.skkCode] || '',
          notes:
            notes[item.skkCode] || '',
        }
      );

      await load();

      if (onUpdated) {
        await onUpdated();
      }
    } catch (e: any) {
      setError(
        e?.message ||
        'Penilaian SKK gagal disimpan.'
      );
    } finally {
      setSavingCode(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#0066B3]" />
            <p className="text-sm font-black text-slate-900">
              Matriks Penilaian SKK per Krida
            </p>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Sumber SKK: SKK_Master • Status: Member_Skill_Status
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={selectedKrida}
            onChange={(event) =>
              setSelectedKrida(event.target.value)
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[11px] font-semibold text-slate-700"
          >
            <option value="ALL">Semua Krida</option>
            {kridaOptions.map(([id, name]) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => void load()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-bold text-[#0066B3]"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                loading ? 'animate-spin' : ''
              }`}
            />
            Muat Ulang
          </button>
        </div>
      </div>

      {error && (
        <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700 flex gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          Memuat SKK per Krida...
        </div>
      ) : grouped.length ? (
        <div className="divide-y divide-slate-200">
          {grouped.map(([kridaName, rows]) => (
            <div key={kridaName}>
              <div className="px-4 py-2.5 bg-slate-50/70">
                <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
                  {kridaName}
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="px-4 py-2">SKK</th>
                      <th className="px-4 py-2">Status</th>
                      <th className="px-4 py-2">Progres</th>
                      <th className="px-4 py-2">Nilai</th>
                      <th className="px-4 py-2">Catatan</th>
                      <th className="px-4 py-2">Aksi Pamong</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {rows.map((item: any) => {
                      const completed =
                        ['VERIFIED', 'COMPLETED'].includes(
                          upper(item.status)
                        );

                      return (
                        <tr key={item.skkCode}>
                          <td className="px-4 py-3">
                            <p className="text-xs font-black text-slate-900">
                              {item.skkCode}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {item.nama || '-'}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex px-2 py-1 rounded-lg border text-[9px] font-black ${statusClass(
                                item.status
                              )}`}
                            >
                              {statusLabel(item.status)}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="w-28">
                              <div className="flex justify-between text-[10px] mb-1">
                                <span>
                                  {Number(item.progressPercent || 0)}%
                                </span>
                              </div>
                              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-[#0066B3]"
                                  style={{
                                    width: `${Math.min(
                                      100,
                                      Number(item.progressPercent || 0)
                                    )}%`,
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              disabled={!canAssess}
                              value={scores[item.skkCode] ?? ''}
                              onChange={(event) =>
                                setScores((prev) => ({
                                  ...prev,
                                  [item.skkCode]: event.target.value,
                                }))
                              }
                              className="w-20 rounded-lg border border-slate-200 px-2 py-1.5 text-xs disabled:bg-slate-50"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              disabled={!canAssess}
                              value={notes[item.skkCode] ?? ''}
                              onChange={(event) =>
                                setNotes((prev) => ({
                                  ...prev,
                                  [item.skkCode]: event.target.value,
                                }))
                              }
                              placeholder="Catatan penilaian"
                              className="w-52 rounded-lg border border-slate-200 px-2 py-1.5 text-xs disabled:bg-slate-50"
                            />
                          </td>

                          <td className="px-4 py-3">
                            {canAssess ? (
                              <div className="flex flex-wrap gap-1.5">
                                {!completed && (
                                  <button
                                    type="button"
                                    disabled={savingCode === item.skkCode}
                                    onClick={() =>
                                      void saveAssessment(item, 'IN_PROGRESS')
                                    }
                                    className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg border border-violet-200 bg-violet-50 text-violet-700 text-[9px] font-black disabled:opacity-50"
                                  >
                                    <Clock3 className="w-3 h-3" />
                                    Proses
                                  </button>
                                )}

                                <button
                                  type="button"
                                  disabled={savingCode === item.skkCode}
                                  onClick={() =>
                                    void saveAssessment(item, 'COMPLETED')
                                  }
                                  className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 text-white text-[9px] font-black disabled:opacity-50"
                                >
                                  {completed ? (
                                    <CheckCircle2 className="w-3 h-3" />
                                  ) : (
                                    <Save className="w-3 h-3" />
                                  )}
                                  {completed
                                    ? 'Perbarui Nilai'
                                    : 'Luluskan SKK'}
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400">
                                Lihat saja
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="px-4 py-10 text-center text-sm text-slate-500">
          SKK_Master belum memiliki data untuk anggota ini.
        </div>
      )}
    </div>
  );
};
