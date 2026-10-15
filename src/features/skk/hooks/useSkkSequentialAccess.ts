import { useEffect, useState } from 'react';
import { apiClient } from '../../../services/api/apiClient';
import { useAuthStore } from '../../../stores/authStore';

export type SkkAccess = { skkCode: string; locked: boolean; passed: boolean; blockedBy?: string; status?: string; accessStatus?: string };

/** GAS is the authority for member progression. Do not infer unlocks from local catalog data. */
export function useSkkSequentialAccess() {
  const currentUser = useAuthStore((state) => state.currentUser);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const role = String(currentUser?.role || '').toLowerCase();
  const isMember = isAuthenticated && (role.includes('member') || role.includes('anggota') || role.includes('dewan'));
  const memberId = String(currentUser?.memberId || currentUser?.nomor_kta || '');
  const [items, setItems] = useState<SkkAccess[]>([]);
  const [loading, setLoading] = useState(isMember);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);
  useEffect(() => {
    let live = true;
    if (!isMember) { setItems([]); setLoading(false); setError(''); return; }
    if (!memberId) { setItems([]); setLoading(false); setError('Identitas anggota belum tersedia. Silakan masuk kembali.'); return; }
    setLoading(true);
    setError('');
    apiClient.get<any>('pamong.skk.available', { member_id: memberId })
      .then((response) => {
        if (!live) return;
        const payload = response?.data?.data ?? response?.data;
        if (!Array.isArray(payload?.skk)) throw new Error('Status SKK dari server tidak tersedia.');
        setItems(payload.skk);
      })
      .catch((e) => { if (live) { setItems([]); setError(e?.message || 'Gagal memuat progres SKK.'); } })
      .finally(() => { if (live) setLoading(false); });
    return () => { live = false; };
  }, [isMember, memberId, refreshVersion]);
  useEffect(() => {
    if (!isMember) return;
    const refresh = () => setRefreshVersion((value) => value + 1);
    const onVisible = () => { if (document.visibilityState === 'visible') refresh(); };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('spwn:skk-progress-changed', refresh);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('spwn:skk-progress-changed', refresh);
    };
  }, [isMember]);
  const getAccess = (code: string) => items.find((item) => String(item.skkCode).toUpperCase() === String(code).toUpperCase());
  const canOpen = (code: string) => !isMember || (!loading && !error && !!getAccess(code) && !getAccess(code)?.locked);
  const refresh = () => setRefreshVersion((value) => value + 1);
  return { isMember, items, loading, error, getAccess, canOpen, refresh };
}
