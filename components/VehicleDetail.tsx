
import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, Info, Shield, Zap, Wind, Droplets, Thermometer } from 'lucide-react';
import { Vehicle } from '../types';
import { formatCurrency } from '../utils/format';

interface VehicleDetailProps {
  vehicle: Vehicle;
  onBack: () => void;
  onBook: () => void;
}

const VehicleDetail: React.FC<VehicleDetailProps> = ({ vehicle, onBack, onBook }) => {
  const specs = [
    { label: 'Podvozek', value: 'Renault Master' },
    { label: 'Motor', value: '2.3 dCi 145 HP' },
    { label: 'Převodovka', value: 'Manuální 6st.' },
    { label: 'Délka / Šířka / Výška', value: '7.47m / 2.37m / 3.06m' },
    { label: 'Počet míst (jízda/spaní)', value: '4 / 4' },
    { label: 'Váha', value: '3 500 kg (skupina B)' },
    { label: 'Nádrž na čistou vodu', value: '100 L' },
    { label: 'Nádrž na odpadní vodu', value: '100 L' },
    { label: 'Topení', value: 'Truma Combi 4 (plyn)' },
    { label: 'Lednice', value: '141 L (trojkombinace)' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 overflow-x-hidden">
      <button 
        onClick={onBack}
        className="mb-8 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Zpět na úvod
      </button>

      <div className="grid lg:grid-cols-2 gap-16 items-start">
        {/* Left: Images & Gallery */}
        <div className="space-y-8">
          <div className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm">
            <img 
              src={vehicle.images?.[0] || 'https://picsum.photos/seed/camper/1200/800'} 
              alt={vehicle.name}
              className="w-full h-auto"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {vehicle.images?.slice(1, 5).map((img, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm">
                <img src={img} alt={`${vehicle.name} detail ${i}`} className="w-full h-auto" />
              </div>
            ))}
          </div>
        </div>

        {/* Right: Info & Specs */}
        <div className="space-y-12">
          <div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight mb-4">{vehicle.name}</h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Německá kvalita Ahorn v kombinaci se spolehlivým podvozkem Renault. Tento vůz je unikátní svým zadním sezením do "U", které nabízí bezkonkurenční prostor pro relaxaci.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <Wind className="w-6 h-6 text-blue-500 mb-4" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Klimatizace</h3>
              <p className="text-xs text-slate-500 font-medium">Motorová i nástavbová pro maximální komfort v létě.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <Zap className="w-6 h-6 text-orange-500 mb-4" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Solární panel</h3>
              <p className="text-xs text-slate-500 font-medium">Dobíjení baterie ze slunce pro větší nezávislost.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <Shield className="w-6 h-6 text-green-500 mb-4" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Bezpečí</h3>
              <p className="text-xs text-slate-500 font-medium">GPS sledování a alarm s dálkovou deaktivací.</p>
            </div>
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <Thermometer className="w-6 h-6 text-red-500 mb-4" />
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Zimní paket</h3>
              <p className="text-xs text-slate-500 font-medium">Izolovaná nádrž a výkonné topení pro zimní cesty.</p>
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-sm">
            <h2 className="text-2xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <Info className="w-6 h-6 text-slate-400" />
              Technické parametry
            </h2>
            <div className="grid gap-4">
              {specs.map(spec => (
                <div key={spec.label} className="flex justify-between items-center py-3 border-b border-slate-50 last:border-0">
                  <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{spec.label}</span>
                  <span className="text-sm font-bold text-slate-900">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 bg-slate-900 rounded-[2.5rem] text-white">
            <div className="flex justify-between items-center mb-8">
              <div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cena pronájmu</div>
                <div className="text-4xl font-black">{formatCurrency(vehicle.basePrice)} <span className="text-xs text-slate-500">/ den</span></div>
              </div>
              <button 
                onClick={onBook}
                className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-500 hover:text-white transition-all shadow-xl shadow-slate-950/20"
              >
                Rezervovat nyní
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <Check className="w-4 h-4 text-green-500" /> V ceně dálniční známka ČR
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <Check className="w-4 h-4 text-green-500" /> Havarijní pojištění v ceně
              </div>
              <div className="flex items-center gap-3 text-xs font-bold text-slate-300">
                <Check className="w-4 h-4 text-green-500" /> Žádné skryté servisní poplatky
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
