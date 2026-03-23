
import React, { useRef, useEffect } from 'react';

const LogoGenerator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const drawLogo = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 720;
    const scale = size / 100; // SVG is 100x100

    // 1. Background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, size, size);

    // 2. Draw SVG elements scaled
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Circle
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, 48 * scale, 0, Math.PI * 2);
    ctx.strokeStyle = '#f1f5f9';
    ctx.lineWidth = 1 * scale;
    ctx.stroke();

    // Mountain/Path line
    ctx.beginPath();
    ctx.moveTo(20 * scale, 65 * scale);
    ctx.lineTo(40 * scale, 45 * scale);
    ctx.lineTo(55 * scale, 60 * scale);
    ctx.lineTo(80 * scale, 30 * scale);
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // Camper body
    ctx.beginPath();
    ctx.moveTo(25 * scale, 75 * scale);
    ctx.lineTo(75 * scale, 75 * scale);
    ctx.lineTo(75 * scale, 55 * scale);
    ctx.quadraticCurveTo(75 * scale, 45 * scale, 65 * scale, 45 * scale);
    ctx.lineTo(35 * scale, 45 * scale);
    ctx.quadraticCurveTo(25 * scale, 45 * scale, 25 * scale, 55 * scale);
    ctx.closePath();
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3 * scale;
    ctx.stroke();

    // Wheels
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(35 * scale, 75 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(65 * scale, 75 * scale, 3 * scale, 0, Math.PI * 2);
    ctx.fill();

    // 3. Text
    ctx.fillStyle = '#0f172a';
    ctx.textAlign = 'center';
    
    // Main text "obytkem.cz"
    ctx.font = `900 ${14 * scale}px Inter, sans-serif`;
    ctx.fillText('obytkem.cz', size / 2, 88 * scale);

    // Subtitle
    ctx.fillStyle = '#94a3b8';
    ctx.font = `black ${3 * scale}px Inter, sans-serif`;
    ctx.letterSpacing = "3px";
    ctx.fillText('PREMIUM CAMPER RENTAL', size / 2, 95 * scale);
  };

  useEffect(() => {
    // Wait for fonts to load if possible, or just draw
    setTimeout(drawLogo, 500);
  }, []);

  const downloadJpg = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = 'logo-obytkem-google.jpg';
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 flex flex-col items-center justify-center">
      <div className="max-w-2xl w-full bg-white rounded-[2.5rem] p-12 shadow-premium border border-slate-100 text-center">
        <button 
          onClick={onBack}
          className="mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-colors mx-auto"
        >
          ← Zpět
        </button>
        
        <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Logo pro Google Moje Firma</h1>
        <p className="text-slate-500 font-medium mb-10">
          Připravil jsem pro vás logo v ideálním formátu (JPG, 720x720px, bílé pozadí), 
          které Google vyžaduje pro váš firemní profil.
        </p>

        <div className="relative inline-block border-4 border-slate-100 rounded-3xl overflow-hidden mb-10 shadow-inner bg-white">
          <canvas 
            ref={canvasRef} 
            width={720} 
            height={720} 
            className="w-64 h-64 md:w-80 md:h-80 object-contain"
          />
        </div>

        <div className="flex flex-col gap-4">
          <button 
            onClick={downloadJpg}
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-200 flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
            Stáhnout logo jako JPG
          </button>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
            Formát: JPG • Rozlišení: 720x720px • Pozadí: Bílé
          </p>
        </div>
      </div>
    </div>
  );
};

export default LogoGenerator;
