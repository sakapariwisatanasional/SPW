import React, { useEffect, useMemo, useState } from 'react';
import { Calendar, Compass, ExternalLink, MapPin, RefreshCw, Search, User } from 'lucide-react';
import { achievementApi } from '../../../services/api/achievement.api';
import { MemberActivityItem } from '../../../types/achievement';
import { useAuthStore } from '../../../stores/authStore';

export const MemberActivityView: React.FC = () => {
  const { currentUser } = useAuthStore();
  const [activities, setActivities] = useState<MemberActivityItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const memberId =
    (currentUser as any)?.memberId ||
    (currentUser as any)?.memberProfile?.id ||
    (currentUser as any)?.id ||
    '';

  const load = async () => {
    if (!memberId) {
      setActivities([]);
      setLoading(false);
      setError('Member ID tidak tersedia pada sesi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await achievementApi.getActivities(memberId);
      setActivities(Array.isArray(res.data) ? res.data : []);
    } catch (e: any) {
      setActivities([]);
      setError(e?.message || 'Gagal memuat riwayat kegiatan dari GAS.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, [memberId]);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activities.filter((a) => !q || [a.activityName, a.location, a.role].some((v) => String(v || '').toLowerCase().includes(q)));
  }, [activities, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#009B4D] uppercase"><Compass className="w-4 h-4" /> MEMBER_ACTIVITY</div>
          <h2 className="text-xl font-black text-slate-900">Riwayat Partisipasi & Kegiatan</h2>
          <p className="text-xs text-slate-500">Data berasal dari endpoint member.activities GAS.</p>
        </div>
        <button onClick={() => void load()} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold"><RefreshCw className="w-4 h-4" />Muat Ulang</button>
      </div>

      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Cari kegiatan..." className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-slate-900" />
      </div>

      {loading ? <p className="text-sm text-slate-500">Memuat dari GAS...</p> :
       error ? <p className="text-sm text-red-700">{error}</p> :
       filtered.length === 0 ? <p className="text-sm text-slate-500">Belum ada riwayat kegiatan pada basis data.</p> :
       <div className="space-y-4">
        {filtered.map((a) => (
          <div key={a.id} className="bg-white rounded-2xl border border-slate-200 p-4 flex gap-4">
            {a.thumbnailUrl && <img src={a.thumbnailUrl} alt={a.activityName} className="w-28 h-24 object-cover rounded-xl" />}
            <div className="flex-1 space-y-1">
              <h3 className="font-bold text-slate-900">{a.activityName}</h3>
              <div className="text-xs text-slate-500 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{a.date || '-'}</span>
                <span className="inline-flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{a.location || '-'}</span>
                <span className="inline-flex items-center gap-1"><User className="w-3.5 h-3.5" />{a.role || '-'}</span>
              </div>
              {a.referenceUrl && <a href={a.referenceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-[#0066B3]"><ExternalLink className="w-3.5 h-3.5" />Rujukan</a>}
            </div>
          </div>
        ))}
      </div>}
    </div>
  );
};
