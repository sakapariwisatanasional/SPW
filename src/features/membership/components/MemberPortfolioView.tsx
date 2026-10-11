import React from 'react';
import { Briefcase, AlertCircle } from 'lucide-react';
import { Card } from '../../../components/ui';

export const MemberPortfolioView: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#0066B3] uppercase">
          <Briefcase className="w-4 h-4" /> PORTOFOLIO ANGGOTA
        </div>
        <h2 className="text-xl font-black text-slate-900">Portofolio Anggota</h2>
        <p className="text-xs text-slate-500">
          LocalStorage dan data dummy telah dinonaktifkan. Halaman ini menunggu endpoint portfolio/evidence GAS sebagai source of truth.
        </p>
      </div>

      <Card>
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-slate-900">Backend portfolio belum terdaftar pada Router GAS</h3>
            <p className="text-sm text-slate-600 mt-1">
              Frontend tidak akan lagi membuat, memverifikasi, atau menyimpan portofolio secara lokal.
              Data akan ditampilkan setelah endpoint resmi GAS untuk evidence/portfolio tersedia.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};
