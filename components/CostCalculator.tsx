import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Calculator, Fuel, Calendar, MapPin, Info, ArrowRight } from 'lucide-react';

interface CostCalculatorProps {
  onBack: () => void;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ onBack }) => {
  const [days, setDays] = useState(7);
  const [distance, setDistance] = useState(1000);
  const [season, setSeason] = useState<'low' | 'mid' | 'high'>('mid');
  
  const prices = {
    low: 2900,
    mid: 3500,
    high: 4200
  };

  const fuelConsumption = 11; // liters per 100km
  const fuelPrice = 38; // CZK per liter
  
  const rentalTotal = days * prices[season];
  const fuelTotal = (distance / 100) * fuelConsumption * fuelPrice;
  const total = rentalTotal + fuelTotal;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 pt-32">
      <div className="max-w-4xl mx-auto px-6">
        <button 
          onClick={onBack}
          className="mb-8 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-colors"
        >
          ← Zpět na úvod
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Input Section */}
          <div className="space-y-8">
            <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-premium">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600">
                  <Calculator className="w-5 h-5" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Plánovač nákladů</h1>
              </div>

              <div className="space-y-8">
                {/* Days Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Počet dní pronájmu
                  </label>
                  <input 
                    type="range" 
                    min="3" 
                    max="30" 
                    value={days}
                    onChange={(e) => setDays(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="mt-4 text-3xl font-black text-slate-900">{days} dní</div>
                </div>

                {/* Distance Input */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> Odhadovaná vzdálenost (km)
                  </label>
                  <input 
                    type="range" 
                    min="100" 
                    max="5000" 
                    step="100"
                    value={distance}
                    onChange={(e) => setDistance(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-orange-600"
                  />
                  <div className="mt-4 text-3xl font-black text-slate-900">{distance.toLocaleString()} km</div>
                </div>

                {/* Season Selection */}
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    Sezóna
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['low', 'mid', 'high'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => setSeason(s)}
                        className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                          season === s 
                            ? 'bg-slate-900 border-slate-900 text-white shadow-lg' 
                            : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                        }`}
                      >
                        {s === 'low' ? 'Nízká' : s === 'mid' ? 'Střední' : 'Hlavní'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-[2rem] p-8 border border-orange-100 flex items-start gap-4">
              <Info className="w-5 h-5 text-orange-600 mt-1 flex-shrink-0" />
              <p className="text-xs text-orange-800 font-medium leading-relaxed">
                Výpočet je orientační. Zahrnuje průměrnou spotřebu 11l/100km a aktuální průměrnou cenu nafty 38 Kč/l. Neobsahuje dálniční poplatky v zahraničí a kempy.
              </p>
            </div>
          </div>

          {/* Results Section */}
          <div className="lg:sticky lg:top-32 h-fit">
            <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-600/10 rounded-full blur-3xl -mr-32 -mt-32" />
              
              <h2 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-10">Odhadované náklady</h2>
              
              <div className="space-y-6 mb-12">
                <div className="flex justify-between items-end pb-6 border-bottom border-white/10">
                  <span className="text-slate-400 text-sm font-medium">Půjčovné ({days} dní)</span>
                  <span className="text-xl font-black">{rentalTotal.toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between items-end pb-6 border-bottom border-white/10">
                  <span className="text-slate-400 text-sm font-medium">Odhadované palivo</span>
                  <span className="text-xl font-black">{Math.round(fuelTotal).toLocaleString()} Kč</span>
                </div>
                <div className="flex justify-between items-end pt-4">
                  <span className="text-orange-500 text-sm font-black uppercase tracking-widest">Celkem</span>
                  <div className="text-right">
                    <div className="text-5xl font-black text-white">{Math.round(total).toLocaleString()} Kč</div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">včetně DPH</div>
                  </div>
                </div>
              </div>

              <button className="w-full py-6 bg-orange-600 hover:bg-orange-700 rounded-2xl font-black uppercase text-sm tracking-widest transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3 group">
                Nezávazně poptat tento termín
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;
