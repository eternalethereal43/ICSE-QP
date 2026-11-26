import React from 'react';
import { FilePlus2 } from 'lucide-react';

export type AppView = 'studio' | 'concept' | 'library';

interface TopBarProps {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onNewPaper: () => void;
  savedCount: number;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeView,
  onNavigate,
  onNewPaper,
  savedCount,
}) => {
  const navItems: { id: AppView; label: string }[] = [
    { id: 'studio', label: 'Paper Studio' },
    { id: 'concept', label: 'Concept Studio' },
    { id: 'library', label: `Paper Library (${savedCount})` },
  ];

  return (
    <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Single-line Brand Wordmark */}
        <a
          href="#paper-studio"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('studio');
          }}
          className="font-editorial text-xl font-semibold tracking-tight text-[#0F172A] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          Scholaris ICSE
        </a>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-7 text-sm font-medium"
        >
          {navItems.map((item) => {
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`relative py-2 whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  isActive
                    ? 'text-[#1E3A5F] font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-0.5 bg-[#1E3A5F]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Single Primary Action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onNewPaper}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#1E3A5F] hover:bg-[#162C49] rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
          >
            <FilePlus2 className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>New Paper</span>
          </button>
        </div>
      </div>

      {/* Compact mobile navigation row */}
      <nav
        aria-label="Mobile navigation"
        className="flex md:hidden items-center justify-around border-t border-slate-200 bg-slate-50/90 px-2"
      >
        {navItems.map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`py-2.5 px-3 text-xs font-medium whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                isActive
                  ? 'border-[#1E3A5F] text-[#1E3A5F] font-semibold'
                  : 'border-transparent text-slate-600'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
};
