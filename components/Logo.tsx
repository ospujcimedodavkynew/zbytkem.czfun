
import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", light = false }) => {
  const colors = {
    orangePrimary: light ? '#fb923c' : '#ea580c',
    textPrimary: light ? '#ffffff' : '#0f172a',
    textSecondary: light ? '#94a3b8' : '#64748b',
    circleStroke: light ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" stroke={colors.circleStroke} strokeWidth="1" />
          <path 
            d="M20 65 L40 45 L55 60 L80 30" 
            stroke={colors.orangePrimary} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <path 
            d="M25 75 H75 V55 Q75 45 65 45 H35 Q25 45 25 55 Z" 
            stroke={colors.textPrimary} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          <circle cx="35" cy="75" r="3" fill={colors.orangePrimary} />
          <circle cx="65" cy="75" r="3" fill={colors.orangePrimary} />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-[900] tracking-tighter uppercase" style={{ color: colors.textPrimary }}>
          obytkem<span style={{ color: colors.orangePrimary }}>.cz</span>
        </span>
        <span className="text-[8px] font-black tracking-[0.3em] uppercase mt-1" style={{ color: colors.textSecondary }}>
          Premium Camper Rental
        </span>
      </div>
    </div>
  );
};

export default Logo;
