import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showSubtitle = true }) => {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-14 h-14',
  }[size];

  const titleSize = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl',
  }[size];

  const subSize = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
  }[size];

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Circular Emblem matching Onitawa's Flyer */}
      <div
        className={`${iconDimensions} rounded-full bg-gradient-to-tr from-amber-600 via-amber-400 to-yellow-300 p-[2px] shadow-md shadow-amber-500/20 shrink-0`}
      >
        <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center relative overflow-hidden border border-amber-500/40">
          {/* Chef Fork & Spoon Silhouette with Smile Crest */}
          <svg
            viewBox="0 0 48 48"
            className="w-3/4 h-3/4 text-amber-400"
            fill="currentColor"
            aria-hidden="true"
          >
            {/* Fork */}
            <path d="M19 10v9a3 3 0 0 0 2 2.82V36a2 2 0 1 0 4 0V21.82A3 3 0 0 0 27 19V10a1 1 0 0 0-2 0v6h-1v-6a1 1 0 0 0-2 0v6h-1v-6a1 1 0 0 0-2 0z" />
            {/* Spoon */}
            <path d="M29 10c-3.3 0-6 3.6-6 8 0 2.2.7 4.1 1.8 5.4V36a2 2 0 1 0 4 0v-12.6c1.1-1.3 1.8-3.2 1.8-5.4 0-4.4-2.7-8-1.6-8z" opacity="0.85" />
            {/* Green leaf accent dot */}
            <circle cx="24" cy="40" r="2.5" fill="#22c55e" />
          </svg>
        </div>
      </div>

      <div className="flex flex-col leading-none">
        <span
          className={`font-black tracking-tight text-white font-['Outfit',sans-serif] ${titleSize}`}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.7)' }}
        >
          <span className="text-white">Onitawa</span>
          <span className="text-amber-400">’s</span>
        </span>
        {showSubtitle && (
          <span
            className={`font-extrabold uppercase tracking-widest text-amber-400 font-['Outfit',sans-serif] ${subSize}`}
          >
            Catering Service
          </span>
        )}
      </div>
    </div>
  );
};
