import React from 'react';
import { cn } from '../../utils/cn';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeTab,
  onChange,
  variant = 'underline',
  className,
}) => {
  if (variant === 'pills') {
    return (
      <div className={cn("inline-flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl", className)}>
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-white text-[#0066B3] shadow-xs font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              )}
            >
              {tab.icon && <span className="shrink-0">{tab.icon}</span>}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.2 rounded-full",
                    isActive ? "bg-[#E6F0F8] text-[#0066B3]" : "bg-slate-200 text-slate-700"
                  )}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className={cn("border-b border-slate-200 flex items-center gap-6 overflow-x-auto", className)}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 py-3 border-b-2 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap -mb-px",
              isActive
                ? "border-[#0066B3] text-[#0066B3] font-semibold"
                : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
            )}
          >
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={cn(
                  "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                  isActive ? "bg-[#E6F0F8] text-[#0066B3]" : "bg-slate-100 text-slate-600"
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
