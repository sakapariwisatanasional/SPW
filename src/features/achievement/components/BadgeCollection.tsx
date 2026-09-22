/**
 * SPWN Apps 2.0 - Badge Collection Component
 * Location: src/features/achievement/components/BadgeCollection.tsx
 * -----------------------------------------------------------------
 * Galeri lencana digital (Badges) kehormatan dan keikutsertaan
 * anggota SAKA Pariwisata.
 */

import React from 'react';
import { Award, Compass, Mountain, ShieldCheck, Sparkles, Calendar } from 'lucide-react';
import { MemberBadgeItem } from '../../../types/achievement';

interface BadgeCollectionProps {
  badges: MemberBadgeItem[];
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({ badges }) => {
  const getBadgeIcon = (iconName: string) => {
    switch (iconName.toLowerCase()) {
      case 'compass':
        return <Compass className="w-6 h-6" />;
      case 'mountain':
        return <Mountain className="w-6 h-6" />;
      case 'shieldcheck':
        return <ShieldCheck className="w-6 h-6" />;
      default:
        return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div
      id="badge-collection-card"
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            Lencana Digital & Apresiasi ({badges.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Sertifikasi digital atas kontribusi dan penugasan khusus kepariwisataan
          </p>
        </div>
      </div>

      {badges.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Belum ada lencana yang diraih. Ikuti penugasan lapangan atau selesaikan SKK tingkat Madya.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map(badge => (
            <div
              key={badge.id}
              className="p-4 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-slate-50/50 hover:shadow-md hover:border-[#0066B3]/40 transition-all flex flex-col justify-between"
            >
              <div>
                {/* Badge Icon Medallion */}
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-3 shadow-sm"
                  style={{
                    backgroundColor: `${badge.color}15`,
                    color: badge.color
                  }}
                >
                  {getBadgeIcon(badge.icon)}
                </div>

                <div className="text-[10px] font-bold tracking-wide uppercase text-slate-400 mb-1">
                  {badge.category}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-1.5 leading-snug">
                  {badge.badgeName}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3">
                  {badge.description}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-500 font-medium">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Diraih: {badge.earnedAt}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
