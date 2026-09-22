/**
 * SPWN Apps 2.0 - Activity History Component
 * Location: src/features/achievement/components/ActivityHistory.tsx
 * -----------------------------------------------------------------
 * Riwayat partisipasi kegiatan kepariwisataan anggota.
 * 
 * MEDIA POLICY:
 * - thumbnail_url hanya digunakan untuk preview visual (render image tag).
 * - Tidak mengunduh file biner atau blob ke memori browser.
 * - Format URL eksternal / Google Drive SPWN aman.
 */

import React from 'react';
import { Calendar, MapPin, User, ExternalLink, Compass } from 'lucide-react';
import { MemberActivityItem } from '../../../types/achievement';

interface ActivityHistoryProps {
  activities: MemberActivityItem[];
}

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ activities }) => {
  return (
    <div
      id="activity-history-card"
      className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-[#0066B3]" />
            Riwayat Kegiatan & Partisipasi Wisata ({activities.length})
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Portofolio keterlibatan kepanduan dalam event pariwisata daerah & nasional
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-slate-500 text-xs bg-slate-50 rounded-xl border border-dashed border-slate-200">
          Belum ada riwayat kegiatan tercatat. Ikuti kemah bhakti pariwisata atau aksi sadar wisata.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activities.map(act => (
            <div
              key={act.id}
              className="flex flex-col sm:flex-row gap-4 p-3.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all bg-white"
            >
              {/* Thumbnail Container - Media Policy: Preview Only Reference */}
              {act.thumbnailUrl && (
                <div className="w-full sm:w-28 h-28 shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                  <img
                    src={act.thumbnailUrl}
                    alt={act.activityName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {/* Details */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {act.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug mb-1">
                    {act.activityName}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{act.location}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="inline-flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3 h-3 text-slate-400" />
                    Peran: <strong className="text-[#0066B3]">{act.role}</strong>
                  </span>

                  {act.referenceUrl && (
                    <a
                      href={act.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-slate-400 hover:text-[#0066B3] transition-colors"
                      title="Lihat Rujukan Agenda"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
