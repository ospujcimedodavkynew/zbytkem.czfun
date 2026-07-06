import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
}

export default function Logo({ className = "w-10 h-10", iconOnly = false }: LogoProps) {
  return (
    <div className="flex items-center gap-3 select-none">
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 48 48" 
        className={className}
        fill="none"
      >
        {/* Soft forest green backdrop */}
        <rect width="48" height="48" rx="14" fill="currentColor" className="text-primary/10" />
        
        {/* Mountain background peaks */}
        <path 
          d="M10 32L17.5 21L23 29L28.5 19L38 32H10Z" 
          fill="currentColor" 
          className="text-primary/20" 
         />
         
         {/* Little Pine Trees */}
         <path 
           d="M11 32L13.5 27.5L14.5 28.3L17 24L19.5 28.3L20.5 27.5L23 32H11Z" 
           fill="currentColor" 
           className="text-primary/30" 
         />

         {/* Elegant Campervan Silhouette */}
         <path 
           d="M15 25C15 25 16 24 18 24H28C30 24 32.5 25.5 33.5 27.5L35.5 30.5C36 31.5 35.5 32.5 34.5 32.5H16C15.4 32.5 15 32 15 31.4V25Z" 
           fill="currentColor" 
           className="text-accent" 
         />
         
         {/* Wheels */}
         <circle cx="19" cy="32.5" r="2.5" fill="currentColor" className="text-primary" />
         <circle cx="30" cy="32.5" r="2.5" fill="currentColor" className="text-primary" />
         <circle cx="19" cy="32.5" r="1" fill="white" />
         <circle cx="30" cy="32.5" r="1" fill="white" />
         
         {/* Windows */}
         <path d="M20 26.5H24V29H20V26.5Z" fill="white" />
         <path d="M26 26.5H29.5C30 26.5 30.5 27 30.8 27.5L31.5 29H26V26.5Z" fill="white" />
      </svg>
      
      {!iconOnly && (
        <div className="flex flex-col justify-center">
          <span className="text-2xl font-display font-black tracking-tighter text-slate-900 leading-none flex items-center">
            obytkem<span className="text-accent">.cz</span>
          </span>
          <span className="text-[9px] uppercase tracking-widest font-mono text-primary font-bold leading-none mt-1">
            půjčovna obytných vozů
          </span>
        </div>
      )}
    </div>
  );
}
