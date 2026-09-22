/**
 * SPWN Apps 2.0 - Global Providers Wrapper
 * Location: src/app/Providers.tsx
 */

import React, { useEffect } from 'react';
import { useUIStore } from '../stores/uiStore';
import { apiClient } from '../services/api/apiClient';
import { useAuthStore } from '../stores/authStore';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const { toasts, removeToast } = useUIStore();
  const token = useAuthStore((state) => state.token);

  // Sambungkan token getter apiClient ke active auth session
  useEffect(() => {
    apiClient.registerTokenGetter(() => {
      return useAuthStore.getState().token;
    });
  }, [token]);

  return (
    <>
      {children}

      {/* Global Toast Notification Stack */}
      <aside
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => {
          const iconMap = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
            info: <Info className="w-5 h-5 text-[#0066B3] shrink-0" />,
          };

          const borderMap = {
            success: 'border-emerald-200 bg-white',
            error: 'border-rose-200 bg-white',
            warning: 'border-amber-200 bg-white',
            info: 'border-sky-200 bg-white',
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-lg ${
                borderMap[toast.type]
              } transition-all animate-in fade-in slide-in-from-bottom-2 duration-200`}
            >
              {iconMap[toast.type]}
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  {toast.title}
                </h4>
                {toast.message && (
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    {toast.message}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 -mr-1 -mt-1 text-slate-400 hover:text-slate-700 rounded-md"
                aria-label="Tutup notifikasi"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </aside>
    </>
  );
};
