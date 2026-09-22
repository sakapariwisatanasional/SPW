import React from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  MapPin,
  ShoppingBag,
  Download,
  Calendar,
} from 'lucide-react';
import { Button, Card, Badge } from '../../../components/ui';
import { useUIStore } from '../../../stores/uiStore';

export const AnalyticsPage: React.FC = () => {
  const { addToast } = useUIStore();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">
            Executive Analytics & Telemetri Platform
          </h1>
          <p className="text-xs text-slate-500">
            Laporan Real-time Pertumbuhan Anggota, Kunjungan Wisata, & Transaksi UMKM.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          leftIcon={<Download className="w-4 h-4" />}
          onClick={() =>
            addToast({
              type: 'success',
              title: 'Ekspor Dimulai',
              message: 'Laporan eksekutif analitik (PDF/Excel) sedang disiapkan dan diunduh.',
            })
          }
        >
          Ekspor Laporan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Komposisi Krida Nasional</h3>
            <Badge variant="blue">Proporsi</Badge>
          </div>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>KRIDA PEMANDU</span>
                <span className="font-bold text-[#009B4D]">35%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#009B4D]" style={{ width: '35%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>KRIDA PENYULUH</span>
                <span className="font-bold text-[#0066B3]">28%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#0066B3]" style={{ width: '28%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>KRIDA MICE & EVENT</span>
                <span className="font-bold text-[#6A1B9A]">22%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#6A1B9A]" style={{ width: '22%' }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between font-medium mb-1">
                <span>KRIDA KULINER & CINDERAMATA</span>
                <span className="font-bold text-[#F7941D]">15%</span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                <div className="h-full bg-[#F7941D]" style={{ width: '15%' }} />
              </div>
            </div>
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Top 5 Kwarda Teraktif</h3>
            <Badge variant="green">Keaktifan</Badge>
          </div>
          <div className="space-y-2.5 text-xs">
            {[
              { prov: '1. Kwarda Jawa Barat', count: '4.210 Anggota', score: '98 pts' },
              { prov: '2. Kwarda Jawa Tengah', count: '3.890 Anggota', score: '94 pts' },
              { prov: '3. Kwarda Jawa Timur', count: '3.640 Anggota', score: '91 pts' },
              { prov: '4. Kwarda Bali', count: '2.450 Anggota', score: '89 pts' },
              { prov: '5. Kwarda DI Yogyakarta', count: '2.120 Anggota', score: '88 pts' },
            ].map((k, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                <div>
                  <p className="font-semibold text-slate-900">{k.prov}</p>
                  <p className="text-[10px] text-slate-400">{k.count}</p>
                </div>
                <Badge size="sm" variant="blue">{k.score}</Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Performa Gateway Google Sheets</h3>
            <Badge variant="orange">Latency</Badge>
          </div>
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100">
              <p className="text-[10px] text-emerald-600 font-semibold uppercase">Status LockService</p>
              <p className="text-xs font-bold text-emerald-900 mt-0.5">Berjalan Normal (Zero Deadlock)</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50 border border-blue-100">
              <p className="text-[10px] text-blue-600 font-semibold uppercase">CacheService Hit Rate</p>
              <p className="text-xs font-bold text-blue-900 mt-0.5">88.4% Cached (Sub-200ms)</p>
            </div>
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <p className="text-[10px] text-slate-500 font-semibold uppercase">Rata-rata Response Time</p>
              <p className="text-xs font-bold text-slate-800 mt-0.5">320ms</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
