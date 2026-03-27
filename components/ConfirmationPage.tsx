
import React from 'react';

interface ConfirmationPageProps {
  onBackHome: () => void;
  isEmbedded?: boolean;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ onBackHome, isEmbedded }) => {
  return (
    <div className={`max-w-3xl mx-auto px-4 ${isEmbedded ? 'py-4' : 'py-20'} animate-in fade-in zoom-in-95 duration-1000 overflow-x-hidden`}>
      <div className={`card-ultimate shadow-ultimate text-center ${isEmbedded ? 'p-8' : 'p-16'}`}>
        <div className={`${isEmbedded ? 'w-16 h-16' : 'w-24 h-24'} bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mx-auto ${isEmbedded ? 'mb-6' : 'mb-10'} shadow-inner`}>
          <svg className={`${isEmbedded ? 'w-8 h-8' : 'w-12 h-12'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className={`${isEmbedded ? 'text-2xl' : 'text-4xl'} font-black text-slate-900 ${isEmbedded ? 'mb-3' : 'mb-6'} gradient-text`}>Rezervace odeslána!</h1>
        <p className={`text-slate-500 ${isEmbedded ? 'text-sm' : 'text-lg'} font-medium leading-relaxed max-w-md mx-auto ${isEmbedded ? 'mb-8' : 'mb-12'}`}>
          Děkujeme za vaši poptávku. Vaše dobrodružství právě začíná. Nyní se do toho pustíme my.
        </p>

        {!isEmbedded && (
          <div className="grid gap-4 text-left max-w-sm mx-auto mb-16">
            <div className="flex gap-4 p-5 glass rounded-2xl border border-white/20 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">1</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Potvrzení termínu</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Během 24h se vám ozveme zpět.</div>
              </div>
            </div>
            <div className="flex gap-4 p-5 glass rounded-2xl border border-white/20 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">2</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Zaslání smlouvy</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">E-mailem obdržíte PDF smlouvu.</div>
              </div>
            </div>
            <div className="flex gap-4 p-5 glass rounded-2xl border border-white/20 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">3</div>
              <div>
                <div className="text-sm font-bold text-slate-900">Předání vozu</div>
                <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">V Brně si vše vysvětlíme.</div>
              </div>
            </div>
          </div>
        )}

        <button onClick={onBackHome} className="btn-ultimate-primary px-12 py-5 text-xs shadow-2xl shadow-brand-primary/20">Zpět na úvodní stránku</button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
