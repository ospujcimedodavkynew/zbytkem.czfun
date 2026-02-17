
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

  const mainVehicle = vehicles && vehicles.length > 0 ? vehicles[0] : null;

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
      if (!day || !reservations) return false;
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
          <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
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
      </div>
    );
  };

  if (!mainVehicle) {
    return <div className="py-20 text-center font-bold text-slate-400">Načítám vozový park...</div>;
  }

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
          Vlajková loď Laika Kreos připravená na vaše výpravy v roce 2026.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => onBookNow(mainVehicle.id)} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-200 hover:bg-orange-700 hover:-translate-y-1 transition-all">Rezervovat na sezónu 2026</button>
          <button onClick={() => onScrollTo('fleet')} className="px-10 py-4 bg-white border border-slate-200 text-slate-700 rounded-2xl font-bold shadow-sm hover:bg-slate-50 transition-all">Technické parametry</button>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900">Náš vůz v detailu</h2>
          <div className="h-1.5 w-20 bg-orange-600 mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group">
              <div className="relative h-[450px] overflow-hidden cursor-zoom-in" onClick={() => setSelectedImage(mainVehicle.images?.[0] || null)}>
                <img src={mainVehicle.images?.[0]} alt={mainVehicle.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              </div>
              
              <div className="p-10">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{mainVehicle.name}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Podvozek AL-KO | Motor Fiat Ducato 180 HP</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-3xl font-black text-slate-900">{formatCurrency(mainVehicle.basePrice)}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">cena od / den</div>
                  </div>
                </div>

                {/* Technická karta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-orange-600 font-black text-lg">180 HP</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Výkon motoru</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">3 500 kg</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Celková váha (sk. B)</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">AL-KO</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Prémiový podvozek</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">120 L</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Nádrž na vodu</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-10">
                  <p>{mainVehicle.description}</p>
                  <div className="mt-6 p-6 bg-orange-50 border border-orange-100 rounded-2xl text-orange-900 text-sm italic font-medium">
                    "Tento model je známý svou legendární odolností. Díky dvojité podlaze a topení ALDE je vůz ideální i pro zimní výpravy do Alp."
                  </div>
                </div>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Vybavení a specifikace</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {mainVehicle.equipment.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => onBookNow(mainVehicle.id)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-all shadow-xl hover:-translate-y-1">Rezervovat {mainVehicle.name}</button>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {renderMiniCalendar()}
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
              <h4 className="font-black text-orange-500 mb-6 uppercase tracking-widest text-xs">Informace pro řidiče</h4>
              <ul className="space-y-6">
                <li className="space-y-1">
                  <div className="text-sm font-bold">Řidičský průkaz sk. B</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-relaxed">Stačí vám běžný průkaz na auto. Věk min. 21 let a 2 roky praxe.</div>
                </li>
                <li className="space-y-1">
                  <div className="text-sm font-bold">Havarijní pojištění</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-relaxed">Vůz je plně pojištěn se spoluúčastí 10% (min. 10 000 Kč).</div>
                </li>
                <li className="space-y-1">
                  <div className="text-sm font-bold">Místo předání: Brno</div>
                  <div className="text-[10px] text-slate-400 font-medium leading-relaxed">Předáváme v Brně - Bohunicích, vaše auto u nás můžete bezpečně zaparkovat.</div>
                </li>
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
              {mainVehicle.seasonalPricing.map(s => (
                <tr key={s.id} className="hover:bg-orange-50/30 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900">{s.name}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">{new Date(s.startDate).toLocaleDateString('cs-CZ')} - {new Date(s.endDate).toLocaleDateString('cs-CZ')}</td>
                  <td className="px-8 py-6 text-right font-black text-orange-600 text-lg">{formatCurrency(s.pricePerDay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-8 bg-orange-50 text-orange-800 text-[10px] font-black uppercase tracking-widest border-t border-orange-100 text-center">
            * Vratná kauce činí 25 000 Kč • Limit nájezdu 300 km/den • Minimální doba nájmu 3 dny
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
           <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}
    </div>
  );
};

export default PublicHome;
