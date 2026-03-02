
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Minus, HelpCircle } from 'lucide-react';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const mainVehicle = vehicles && vehicles.length > 0 ? vehicles[0] : null;

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!mainVehicle?.images) return;
    setCurrentImageIndex((prev) => (prev + 1) % mainVehicle.images!.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!mainVehicle?.images) return;
    setCurrentImageIndex((prev) => (prev - 1 + mainVehicle.images!.length) % mainVehicle.images!.length);
  };

  const faqs = [
    {
      q: "Co všechno je v ceně pronájmu?",
      a: "V ceně je kompletní vybavení vozu (kuchyňské potřeby, kempingový nábytek, markýza), dálniční známka pro ČR, havarijní pojištění, asistenční služby a plná nádrž čisté vody. Neplatíte žádné servisní poplatky."
    },
    {
      q: "Jaký řidičský průkaz potřebuji?",
      a: "Stačí vám běžný řidičský průkaz skupiny B. Naše vozy mají celkovou hmotnost do 3 500 kg. Podmínkou je věk minimálně 21 let a alespoň 2 roky praxe."
    },
    {
      q: "Je ve voze klimatizace?",
      a: "Ano, náš Ahorn TU Plus je vybaven jak motorovou klimatizací pro jízdu, tak výkonnou nástavbovou klimatizací, která vás ochladí i při stání v kempu (vyžaduje připojení na 230V)."
    },
    {
      q: "Můžu s sebou vzít domácího mazlíčka?",
      a: "Po předchozí domluvě je to možné. Účtujeme jednorázový poplatek za zvýšený úklid interiéru, aby byl vůz pro další posádku v perfektním stavu."
    },
    {
      q: "Kde si můžu vůz vyzvednout?",
      a: "Předání probíhá v Brně - Bohunicích. Vaše osobní auto u nás můžete po dobu dovolené bezpečně a zdarma zaparkovat v našem areálu."
    }
  ];

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
        <h4 className="font-black text-slate-400 mb-4 flex items-center gap-2 text-[10px] uppercase tracking-widest">
          <svg className="w-4 h-4 text-slate-900" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
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
        <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[0.9]">
          Ahorn TU Plus <br/><span className="text-slate-400">Model 2021</span>
        </h1>
        <p className="mt-8 text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
          Německá preciznost, unikátní zadní sezení a maximální prostor. 
          Váš ideální společník pro nezapomenutelné výpravy v roce 2026.
        </p>
        <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => onBookNow(mainVehicle.id)} className="px-12 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-2xl shadow-slate-200">Rezervovat sezónu 2026</button>
          <button onClick={() => onScrollTo('fleet')} className="px-12 py-5 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 transition-all">Technické parametry</button>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Náš vůz v detailu</h2>
          <div className="h-1 w-12 bg-slate-900 mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group relative">
              <div className="relative h-[500px] overflow-hidden bg-slate-100">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImageIndex}
                    src={mainVehicle.images?.[currentImageIndex] || 'https://picsum.photos/seed/camper/1200/800'}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                    className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
                    onClick={() => setSelectedImage(mainVehicle.images?.[currentImageIndex] || null)}
                  />
                </AnimatePresence>

                {/* Carousel Controls */}
                {mainVehicle.images && mainVehicle.images.length > 1 && (
                  <>
                    <button 
                      onClick={prevImage}
                      className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl text-slate-900 hover:bg-white transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={nextImage}
                      className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center shadow-xl text-slate-900 hover:bg-white transition-all z-10 opacity-0 group-hover:opacity-100"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    
                    {/* Dots */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                      {mainVehicle.images.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                          className={`w-2 h-2 rounded-full transition-all ${idx === currentImageIndex ? 'bg-white w-6' : 'bg-white/40 hover:bg-white/60'}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              
              <div className="p-10">
                <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-4">
                  <div>
                    <h3 className="text-3xl font-black text-slate-900">{mainVehicle.name}</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs mt-1">Podvozek Renault Master | Motor 2.3 dCi 145 HP</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-3xl font-black text-slate-900">{formatCurrency(mainVehicle.basePrice)}</div>
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">cena od / den</div>
                  </div>
                </div>

                {/* Technická karta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">145 HP</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Výkon motoru</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">3 500 kg</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Celková váha (sk. B)</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">Renault</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Spolehlivý podvozek</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-black text-lg">100 L</div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Nádrž na vodu</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-10">
                  <p>{mainVehicle.description}</p>
                  <div className="mt-6 p-6 bg-slate-900 text-white rounded-2xl text-sm font-medium">
                    <p className="font-black text-slate-400 uppercase tracking-widest text-[10px] mb-2">Technické unikátnosti:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 list-none p-0">
                      <li className="flex items-center gap-2"><span className="text-slate-400">✓</span> Zadní sezení "U" pro 6 osob</li>
                      <li className="flex items-center gap-2"><span className="text-slate-400">✓</span> Elektrické spouštěcí lůžko</li>
                      <li className="flex items-center gap-2"><span className="text-slate-400">✓</span> LED osvětlení interiéru</li>
                      <li className="flex items-center gap-2"><span className="text-slate-400">✓</span> Nástavbová klimatizace</li>
                    </ul>
                  </div>
                </div>

                <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Prémiové vybavení v ceně</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {mainVehicle.equipment.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => onBookNow(mainVehicle.id)} className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 hover:-translate-y-1">Rezervovat {mainVehicle.name}</button>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {renderMiniCalendar()}
            <div className="bg-slate-900 p-8 rounded-3xl text-white shadow-xl">
              <h4 className="font-black text-slate-400 mb-6 uppercase tracking-widest text-[10px]">Informace pro řidiče</h4>
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
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Přehledný ceník 2026</h2>
          <p className="text-slate-500 mt-4 font-medium">Transparentní ceny bez skrytých poplatků a servisních nákladů</p>
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
                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-8 py-6 font-bold text-slate-900">{s.name}</td>
                  <td className="px-8 py-6 text-slate-500 text-sm">{new Date(s.startDate).toLocaleDateString('cs-CZ')} - {new Date(s.endDate).toLocaleDateString('cs-CZ')}</td>
                  <td className="px-8 py-6 text-right font-black text-slate-900 text-lg">{formatCurrency(s.pricePerDay)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="p-8 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-100 text-center">
            * Vratná kauce činí 25 000 Kč • Limit nájezdu 300 km/den • Minimální doba nájmu 3 dny
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="inline-flex p-3 bg-slate-100 rounded-2xl mb-4">
            <HelpCircle className="w-6 h-6 text-slate-900" />
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Časté dotazy</h2>
          <p className="text-slate-500 mt-4 font-medium">Vše, co potřebujete vědět před cestou</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-slate-200 overflow-hidden transition-all hover:border-slate-300">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className="font-bold text-slate-900">{faq.q}</span>
                {openFaq === idx ? <Minus className="w-5 h-5 text-slate-400" /> : <Plus className="w-5 h-5 text-slate-400" />}
              </button>
              <AnimatePresence>
                {openFaq === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-8 pb-8 text-slate-500 text-sm leading-relaxed">
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
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
