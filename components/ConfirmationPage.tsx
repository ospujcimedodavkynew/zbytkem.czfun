
import React from 'react';

interface ConfirmationPageProps {
  onBackHome: () => void;
}

const ConfirmationPage: React.FC<ConfirmationPageProps> = ({ onBackHome }) => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-20 animate-in fade-in zoom-in-95 duration-1000">
      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 text-center p-16">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-10 shadow-inner">
          <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className="text-4xl font-black text-slate-900 mb-6">Rezervace odeslána!</h1>
        <p className="text-slate-500 text-lg font-medium leading-relaxed max-w-md mx-auto mb-12">
          Děkujeme za vaši poptávku. Vaše dobrodružství právě začíná. Nyní se do toho pustíme my.
        </p>

        <div className="grid gap-4 text-left max-w-sm mx-auto mb-16">
          <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">1</div>
            <div>
              <div className="text-sm font-bold text-slate-900">Potvrzení termínu</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">Během 24h se vám ozveme zpět.</div>
            </div>
          </div>
          <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">2</div>
            <div>
              <div className="text-sm font-bold text-slate-900">Zaslání smlouvy</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">E-mailem obdržíte PDF smlouvu.</div>
            </div>
          </div>
          <div className="flex gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-black">3</div>
            <div>
              <div className="text-sm font-bold text-slate-900">Předání vozu</div>
              <div className="text-[10px] text-slate-400 font-bold uppercase mt-1">V Brně si vše vysvětlíme.</div>
            </div>
          </div>
        </div>

        <button onClick={onBackHome} className="px-12 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all">Zpět na úvodní stránku</button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
