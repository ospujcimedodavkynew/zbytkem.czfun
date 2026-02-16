
import React, { useState } from 'react';
import { Vehicle, Reservation, ReservationStatus } from '../types';
import { formatCurrency } from '../utils/format';

interface PublicHomeProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onBookNow: (vehicleId: string) => void;
  onScrollTo: (sectionId: string) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ vehicles, reservations, onBookNow, onScrollTo }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const renderMiniCalendar = () => {
    const today = new Date();
    const displayDate = today.getFullYear() < 2026 ? new Date(2026, 6, 1) : today;
    const currentMonth = displayDate.getMonth();
    const currentYear = displayDate.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    const days = [];
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const isReserved = (day: number) => {
      if (!day) return false;
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return reservations.some(r => 
        r.status !== ReservationStatus.CANCELLED &&
        dateStr >= r.startDate && 
        dateStr <= r.endDate
      );
    };

    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
          Termíny {displayDate.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' })}
        </h4>
        <div className="grid grid-cols-7 gap-1">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
            <div key={d} className="text-[10px] text-center font-bold text-slate-400 uppercase py-1">{d}</div>
          ))}
          {days.map((day, idx) => (
            <div 
              key={idx} 
              className={`h-8 flex items-center justify-center text-xs rounded transition-colors
                ${!day ? 'bg-transparent' : isReserved(day) ? 'bg-red-100 text-red-600 font-bold border border-red-200' : 'bg-green-50 text-green-700 border border-green-100'}`}
            >
              {day}
            </div>
          ))}
        </div>
        <div className="mt-4 flex gap-4 text-[10px] font-bold uppercase tracking-tighter">
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-green-50 border border-green-100 rounded"></div> Volno</div>
          <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Obsazeno</div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-widest mb-6">
          <span className="relative flex h-2 w-2">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
          </span>
          Sezóna 2026 Brno
        </div>
        <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-tight">
          Půjčte si poctivou klasiku <br/><span className="text-orange-600">Laika Kreos 7010</span>
        </h1>
        <p className="mt-8 text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Italský styl, robustní konstrukce a maximální pohodlí. 
          Vlajková loď Laika Kreos (Model 2016) připravená na vaše výpravy v roce 2026.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => onBookNow(vehicles[0].id)}
            className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all"
          >
            Rezervovat na sezónu 2026
          </button>
          <button 
            onClick={() => onScrollTo('fleet')}
            className="px-10 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all"
          >
            Technické parametry
          </button>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900">Naše vozidlo</h2>
          <div className="h-1.5 w-20 bg-orange-600 mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            {vehicles.map(vehicle => (
              <div key={vehicle.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group">
                <div className="relative h-[450px] overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(vehicle.images[0])}>
                  <img 
                    src={vehicle.images[0]} 
                    alt={vehicle.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="px-4 py-2 bg-white/90 backdrop-blur rounded-full text-xs font-bold shadow-sm text-slate-900">Proven Quality</span>
                    <span className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold shadow-sm">Model 2016</span>
                  </div>
                </div>
                
                {/* Image Thumbnails Gallery */}
                <div className="flex gap-4 p-4 bg-slate-50 border-b border-slate-100 overflow-x-auto">
                   {vehicle.images.map((img, idx) => (
                      <button key={idx} onClick={() => setSelectedImage(img)} className="w-24 h-16 rounded-xl overflow-hidden border-2 border-transparent hover:border-orange-500 transition-all flex-shrink-0">
                         <img src={img} className="w-full h-full object-cover" />
                      </button>
                   ))}
                </div>

                <div className="p-10">
                  <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4 text-center md:text-left">
                    <div>
                      <h3 className="text-3xl font-black text-slate-900">{vehicle.name}</h3>
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Podvozek AL-KO | Motor Fiat Ducato 180 HP</p>
                    </div>
                    <div className="text-left md:text-right">
                      <div className="text-3xl font-black text-slate-900">{formatCurrency(vehicle.basePrice)}</div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">cena od / den</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8 py-8 border-y border-slate-100">
                    <div className="text-center">
                      <div className="text-slate-900 mb-2 font-black text-lg">Dvojitá</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Podlaha</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-900 mb-2 font-black text-lg">Zimní</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Izolace</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-900 mb-2 font-black text-lg">4 Osoby</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Jízda/Spaní</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-900 mb-2 font-black text-lg">7.4m</div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Délka</div>
                    </div>
                  </div>

                  <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-8">
                    <p>
                      <strong>Laika Kreos 7010</strong> je postaven na prémiovém podvozku AL-KO s rozšířeným rozchodem kol. Dvojitá podlaha nabízí špičkovou tepelnou izolaci pro zimní kempování a nadstandardní úložné prostory přístupné z obou stran.
                    </p>
                  </div>

                  {/* Premium Equipment Section */}
                  <div className="mb-10">
                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Prémiová výbava vozu</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {vehicle.equipment.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-orange-200 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                          </div>
                          <span className="text-sm font-bold text-slate-700">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button 
                    onClick={() => onBookNow(vehicle.id)}
                    className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-1"
                  >
                    Rezervovat Kreos 7010
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="space-y-8">
            {renderMiniCalendar()}
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
              <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-sm">V ceně pronájmu</h4>
              <ul className="space-y-4">
                {[
                  'Dálniční známka ČR 2026',
                  'Kompletní kempingový nábytek',
                  'Vybavená kuchyně (nádobí)',
                  'Plynová láhev + Chemie',
                  'Nosič kol (4 pozice)',
                  'Kabeláž a vyrovnávací klíny'
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-slate-600">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-12 text-center">
          <h2 className="text-4xl font-black text-slate-900">Přehledný ceník 2026</h2>
          <p className="text-slate-500 mt-4">Transparentní ceny bez skrytých poplatků</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Sezóna</th>
                <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Období</th>
                <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Cena / Den</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {vehicles[0].seasonalPricing.map(s => (
                <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900">{s.name}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">{new Date(s.startDate).toLocaleDateString('cs-CZ')} - {new Date(s.endDate).toLocaleDateString('cs-CZ')}</td>
                  <td className="px-8 py-6 text-right font-black text-orange-600 text-lg">{formatCurrency(s.pricePerDay)}</td>
                </tr>
              ))}
              <tr className="bg-slate-50/50">
                <td className="px-8 py-6 font-bold text-slate-900">Mimo sezónu / Ostatní</td>
                <td className="px-8 py-6 text-slate-500 text-sm">Zbytek roku</td>
                <td className="px-8 py-6 text-right font-black text-orange-600 text-lg">{formatCurrency(vehicles[0].basePrice)}</td>
              </tr>
            </tbody>
          </table>
          <div className="p-8 bg-orange-50 text-orange-800 text-xs font-medium border-t border-orange-100">
            * Minimální délka pronájmu jsou 3 dny. Vratná kauce činí 25 000 Kč. Limit nájezdu je 300 km/den, poté 6 Kč/km.
          </div>
        </div>
      </section>

      {/* Lightbox for Gallery */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
           <button className="absolute top-8 right-8 text-white hover:scale-110 transition-transform"><svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
           <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
};

export default PublicHome;
