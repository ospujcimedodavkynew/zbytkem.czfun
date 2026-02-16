
import React from 'react';

interface LogoProps {
  className?: string;
  light?: boolean;
}

const Logo: React.FC<LogoProps> = ({ className = "", light = false }) => {
  // Definice barev pro SVG (HEX kódy zajistí, že logo nebude černé po stažení)
  const colors = {
    orangePrimary: light ? '#fb923c' : '#ea580c', // orange-400 : orange-600
    textPrimary: light ? '#ffffff' : '#0f172a',   // white : slate-900
    textSecondary: light ? '#94a3b8' : '#64748b', // slate-400 : slate-500
    circleStroke: light ? 'rgba(255,255,255,0.1)' : '#e2e8f0' // white/10 : slate-200
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="relative w-12 h-12 flex items-center justify-center">
        {/* Abstract Professional Badge */}
        <svg viewBox="0 0 100 100" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Circle Background */}
          <circle cx="50" cy="50" r="48" stroke={colors.circleStroke} strokeWidth="1" />
          
          {/* Stylized Mountain/Road Line */}
          <path 
            d="M20 65 L40 45 L55 60 L80 30" 
            stroke={colors.orangePrimary} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Minimalist Camper Line Art */}
          <path 
            d="M25 75 H75 V55 Q75 45 65 45 H35 Q25 45 25 55 Z" 
            stroke={colors.textPrimary} 
            strokeWidth="3" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
          />
          
          {/* Wheels as dots */}
          <circle cx="35" cy="75" r="3" fill={colors.orangePrimary} />
          <circle cx="65" cy="75" r="3" fill={colors.orangePrimary} />
        </svg>
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tighter uppercase" style={{ color: colors.textPrimary }}>
          obytkem<span style={{ color: colors.orangePrimary }}>.cz</span>
        </span>
        <span className="text-[8px] font-bold tracking-[0.3em] uppercase mt-1" style={{ color: colors.textSecondary }}>
          Premium Camper Rental
        </span>
      </div>
    </div>
  );
};

export default Logo;
