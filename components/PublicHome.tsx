
import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { Vehicle, Reservation } from '../types';
import { formatCurrency } from '../utils/format';
import AvailabilityCalendar from './AvailabilityCalendar';

interface PublicHomeProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onBookNow: (vehicleId: string, startDate?: string) => void;
  onScrollTo: (sectionId: string) => void;
  onNavigate: (view: 'home' | 'admin' | 'booking' | 'confirmation' | 'calculator' | 'widget' | 'calendar' | 'contract-public') => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ vehicles, reservations, onBookNow, onNavigate, isDarkMode }) => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-20">
      {/* Hero / Header */}
      <div className="text-center space-y-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-primary/10 border border-brand-primary/20"
        >
          <div className="w-2 h-2 rounded-full bg-brand-primary animate-pulse" />
          <span className="text-[10px] font-black text-brand-primary uppercase tracking-widest">Rezervační systém Obytkem.cz</span>
        </motion.div>
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight px-2"
        >
          Naplánujte si svou <br className="hidden sm:block" />
          <span className="gradient-text">svobodu na cestách</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-slate-500 font-medium max-w-2xl mx-auto text-lg"
        >
          Vyberte si termín, doplňky a zarezervujte si náš prémiový obytný vůz Ahorn Canada TU Plus během několika minut.
        </motion.p>
      </div>

      {/* Main Content: Vehicle Cards */}
      <div className="grid gap-12">
        {vehicles.filter(v => v.isActive).map((vehicle, idx) => (
          <motion.div 
            key={vehicle.id}
            initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + idx * 0.1 }}
            className="card-ultimate p-8 md:p-12 shadow-ultimate flex flex-col lg:flex-row gap-12 items-center group"
          >
            {/* Image Section */}
            <div className="relative overflow-hidden rounded-[2.5rem] w-full lg:w-[450px] aspect-[4/3] shrink-0 bg-slate-100 shadow-2xl">
              <img 
                src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://picsum.photos/seed/camper/1200/800'} 
                alt={vehicle.name} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60" />
              <div className="absolute bottom-8 left-8">
                <div className="text-[10px] font-black text-white/70 uppercase tracking-widest mb-1">Model 2022</div>
                <div className="text-2xl font-black text-white uppercase tracking-tight">{vehicle.name}</div>
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-grow space-y-8 w-full">
              <div className="space-y-4">
                <div className="flex items-center justify-center lg:justify-start gap-3">
                  <span className="px-3 py-1 bg-green-500/10 text-green-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-green-500/20">
                    K dispozici
                  </span>
                  <span className="text-slate-300">|</span>
                  <div className="flex items-center gap-1 text-orange-500">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed text-base md:text-lg text-center lg:text-left">
                  {vehicle.description}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary border border-slate-100">
                    <Zap size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Výkon</div>
                    <div className="text-xs font-bold text-slate-900">165 kW (Chip)</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary border border-slate-100">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pojištění</div>
                    <div className="text-xs font-bold text-slate-900">Havarijní v ceně</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-brand-primary border border-slate-100">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servis</div>
                    <div className="text-xs font-bold text-slate-900">Bez poplatků</div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-8">
                <div className="text-center sm:text-left">
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Cena pronájmu od</div>
                  <div className="text-3xl font-black text-slate-900">
                    {formatCurrency(vehicle.basePrice)} <span className="text-xs text-slate-400 font-black uppercase tracking-widest ml-1">/ den</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button 
                    onClick={() => onNavigate('calculator')}
                    className="btn-ultimate-secondary w-full sm:w-auto px-8 py-4 text-[10px] font-black uppercase tracking-widest"
                  >
                    Kalkulačka
                  </button>
                  <button 
                    onClick={() => onBookNow(vehicle.id)}
                    className="btn-ultimate-primary w-full sm:w-auto px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-3"
                  >
                    Rezervovat nyní
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Calendar Section */}
      <div className="space-y-12 pt-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Kalendář obsazenosti</h2>
          <p className="text-slate-500 font-medium max-w-md mx-auto">Zkontrolujte si dostupnost vašeho termínu přímo v interaktivním kalendáři.</p>
        </div>
        <div className="card-ultimate p-4 md:p-10 shadow-ultimate">
          <AvailabilityCalendar 
            vehicles={vehicles} 
            reservations={reservations} 
            isEmbedded={false}
            onDateClick={(date) => onBookNow(vehicles[0].id, date)}
          />
        </div>
      </div>

      {/* Trust Badges */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 border-t border-slate-100">
        <div className="text-center space-y-2">
          <div className="text-2xl font-black text-slate-900">100%</div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Spokojenost</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-black text-slate-900">24/7</div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Asistence</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-black text-slate-900">0 Kč</div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Servisní poplatky</div>
        </div>
        <div className="text-center space-y-2">
          <div className="text-2xl font-black text-slate-900">Brno</div>
          <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Lokalita</div>
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
