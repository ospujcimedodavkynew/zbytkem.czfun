
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Minus, HelpCircle, Calendar as CalendarIcon, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Vehicle, Reservation, ReservationStatus } from '../types';
import { formatCurrency } from '../utils/format';
import AvailabilityCalendar from './AvailabilityCalendar';

interface PublicHomeProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onBookNow: (vehicleId: string, startDate?: string) => void;
  onScrollTo: (sectionId: string) => void;
  onNavigate: (view: 'blog' | 'vehicle-detail' | 'guides' | 'checklist' | 'calculator') => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ vehicles, reservations, onBookNow, onScrollTo, onNavigate }) => {
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

  const guides = [
    {
      title: "WC a odpadní voda",
      icon: "🚽",
      content: "Kazeta WC se nachází v servisním otvoru zvenčí. Po naplnění ji vyjměte, vyprázdněte na určeném místě (v kempu) a doplňte chemii. Šedá voda (z dřezu a sprchy) se vypouští ventilem pod vozem."
    },
    {
      title: "Elektřina a plyn",
      icon: "⚡",
      content: "Vůz má vlastní baterii dobíjenou solárem. Pro 230V zásuvky a klimatizaci se musíte připojit kabelem v kempu. Plyn slouží pro vaření, topení a ohřev vody (vždy mějte otevřenou lahev)."
    },
    {
      title: "Voda a doplňování",
      icon: "💧",
      content: "Nádrž na čistou vodu (100L) se plní zvenčí hadicí. Stav vody uvidíte na kontrolním panelu nad dveřmi. Vždy používejte pitnou vodu z ověřených zdrojů."
    },
    {
      title: "Jízda a rozměry",
      icon: "🚐",
      content: "Vůz je vysoký 3 metry a dlouhý 7 metrů. Pozor na podjezdy a větve! Při couvání vždy využívejte kameru a ideálně i pomocníka venku. Nezapomeňte před jízdou zavřít všechna okna a zajistit skříňky."
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
    <div className="space-y-0 overflow-x-hidden">
      {/* Hero Section with Integrated Calendar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left reveal-up">
            <h1 className="gradient-text">
              Váš domov na cestách <br/>
              přímo z Brna
            </h1>
            
            <p className="text-lg text-slate-600 font-medium leading-relaxed mb-8 max-w-xl">
              Půjčte si náš plně vybavený obytný vůz <strong>Ahorn Canada TU Plus</strong>. Žádné skryté poplatky, kompletní výbava v ceně a férový přístup. 
            </p>

            <div className="flex flex-wrap gap-4 mb-12">
              <button 
                onClick={() => onBookNow(mainVehicle.id)} 
                className="btn-ultimate-primary"
              >
                Rezervovat vůz
                <ArrowRight className="ml-3 w-4 h-4" />
              </button>
              <button 
                onClick={() => onNavigate('calculator')} 
                className="btn-ultimate-secondary"
              >
                Spočítat cenu
              </button>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="van-badge">Pojištění v ceně</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="van-badge">Bez limitu km</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-brand-primary/10 rounded-[3rem] blur-2xl -z-10" />
            <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium relative">
              <div className="flex justify-between items-center mb-6">
                <div className="bg-brand-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Live Dostupnost
                </div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                  Klikněte na volný den
                </div>
              </div>
              <AvailabilityCalendar 
                vehicles={vehicles} 
                reservations={reservations} 
                isEmbedded={true} 
                initialVehicleId={mainVehicle.id}
                onDateClick={(date) => onBookNow(mainVehicle.id, date)}
              />
              <div className="mt-6 pt-6 border-t border-slate-50 flex justify-between items-center">
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Volno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Obsazeno</span>
                  </div>
                </div>
                <button 
                  onClick={() => onScrollTo('fleet')}
                  className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:text-slate-900 transition-colors"
                >
                  Zobrazit ceník →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="card-ultimate p-8 space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Po Brně přivezeme</h3>
            <p className="text-base text-slate-600 leading-relaxed">Pokud budete chtít, obytňák vám přivezeme až před dům za 300 Kč. Jednoduché a pohodlné.</p>
          </div>
          <div className="card-ultimate p-8 space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">GPS a alarm</h3>
            <p className="text-base text-slate-600 leading-relaxed">Vůz je chráněn GPS sledováním s dálkovou deaktivací. Vaše bezpečí je naší prioritou.</p>
          </div>
          <div className="card-ultimate p-8 space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Osobní přístup</h3>
            <p className="text-base text-slate-600 leading-relaxed">Vše vám vysvětlíme, poradíme a pomůžeme. Pronájem s lidským přístupem.</p>
          </div>
          <div className="card-ultimate p-8 space-y-4">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0"></path></svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">Dálniční známka</h3>
            <p className="text-base text-slate-600 leading-relaxed">Cestujte bez omezení po českých dálnicích. Havarijní pojištění v ceně.</p>
          </div>
        </div>

        <div className="mt-20 p-10 bg-slate-900 rounded-[3rem] text-white">
          <div className="max-w-3xl">
            <h2 className="text-3xl font-black mb-6">Co u nás získáváte?</h2>
            <p className="text-slate-400 font-medium mb-8 leading-relaxed">
              Působíme v Brně a okolí, ale naše vozy brázdí silnice po celé Evropě. Při pronájmu u nás získáváte:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                "Dálniční známka pro ČR",
                "Havarijní pojištění (spoluúčast 25 000 Kč)",
                "GPS zabezpečení vozidla",
                "Kompletní kempingová výbava a připravenost na cestu",
                "Individuální domluva na místě a čase předání"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black">✓</div>
                  <span className="text-sm font-bold">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Fleet Section */}
      <section id="fleet" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding scroll-mt-24">
        <div className="mb-12">
          <h2 className="gradient-text">Náš obytný vůz k pronájmu – Ahorn Canada TU Plus</h2>
          <div className="h-1.5 w-20 bg-brand-primary mt-4 rounded-full"></div>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <div className="card-ultimate group relative">
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
                    <h3 className="text-2xl font-bold text-slate-900">{mainVehicle.name}</h3>
                    <p className="text-slate-500 font-semibold uppercase tracking-wider text-[10px] mt-1">Podvozek Renault Master | Motor 2.3 dCi 145 HP</p>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="text-2xl font-bold text-slate-900">{formatCurrency(mainVehicle.basePrice)}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">cena od / den</div>
                  </div>
                </div>

                {/* Technická karta */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-bold text-lg">145 HP</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Výkon motoru</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-bold text-lg">3 500 kg</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Celková váha (sk. B)</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-bold text-lg">Renault</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Spolehlivý podvozek</div>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="text-slate-900 font-bold text-lg">100 L</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Nádrž na vodu</div>
                  </div>
                </div>

                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed mb-10">
                  <p>Tento <strong>moderní obytný vůz k pronájmu</strong> je navržený pro maximální komfort v každém ročním období. Unikátní zadní sezení ve tvaru "U" nabízí nejvíce prostoru pro relaxaci v této třídě vozů. Ideální pro rodiny i páry, kteří hledají <strong>luxusní kempování</strong> bez omezení.</p>
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

                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">Prémiové vybavení v ceně</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
                  {mainVehicle.equipment.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
                      <span className="text-sm font-bold text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>

                <button onClick={() => onBookNow(mainVehicle.id)} className="btn-ultimate-primary w-full">Rezervovat {mainVehicle.name}</button>
              </div>
            </div>
          </div>
          
          <div className="space-y-8">
            {renderMiniCalendar()}
            <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl">
              <h4 className="van-badge bg-white/10 text-white border-0 mb-6">Informace pro řidiče</h4>
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
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding scroll-mt-24">
        <div className="mb-12 text-center">
          <h2 className="gradient-text">Přehledný ceník 2026</h2>
          <p className="text-slate-500 mt-4 font-medium">Transparentní ceny bez skrytých poplatků a servisních nákladů</p>
        </div>
        <div className="card-ultimate overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[600px] md:min-w-0">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sezóna</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Období</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Cena / Den</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {mainVehicle.seasonalPricing.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-bold text-slate-900 whitespace-nowrap">{s.name}</td>
                    <td className="px-8 py-6 text-slate-500 text-sm whitespace-nowrap">{new Date(s.startDate).toLocaleDateString('cs-CZ')} - {new Date(s.endDate).toLocaleDateString('cs-CZ')}</td>
                    <td className="px-8 py-6 text-right font-black text-slate-900 text-lg whitespace-nowrap">{formatCurrency(s.pricePerDay)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-8 bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-widest border-t border-slate-100 text-center">
            * Vratná kauce činí 25 000 Kč • Limit nájezdu 300 km/den • Minimální doba nájmu 3 dny
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 section-padding scroll-mt-24">
        <div className="mb-12 text-center">
          <div className="inline-flex p-4 bg-blue-50 rounded-2xl mb-4">
            <HelpCircle className="w-8 h-8 text-brand-primary" />
          </div>
          <h2 className="gradient-text">Časté dotazy</h2>
          <p className="text-slate-500 mt-4 font-medium">Vše, co potřebujete vědět před cestou</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="card-ultimate transition-all">
              <button 
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full px-8 py-6 flex items-center justify-between text-left"
              >
                <span className="font-bold text-slate-900 text-lg">{faq.q}</span>
                {openFaq === idx ? <Minus className="w-5 h-5 text-brand-primary" /> : <Plus className="w-5 h-5 text-slate-400" />}
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

      {/* Guides Section */}
      <section id="guides" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding scroll-mt-24">
        <div className="mb-12 text-center">
          <h2 className="gradient-text">Návody pro začátečníky</h2>
          <p className="text-slate-500 mt-4 font-medium">Vše, co potřebujete vědět pro vaši první cestu</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {guides.map((guide, idx) => (
            <div key={idx} className="card-ultimate p-8">
              <div className="text-4xl mb-6">{guide.icon}</div>
              <h3 className="text-lg font-bold text-slate-900 mb-4">{guide.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed font-medium mb-6">
                {guide.content}
              </p>
              <button 
                onClick={() => onNavigate('guides')}
                className="text-[11px] font-bold text-brand-primary uppercase tracking-wider hover:text-blue-700 transition-colors"
              >
                Zobrazit detail návodu →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Sister Company Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 border border-slate-100 flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-100 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Naše další služby</span>
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
              Potřebujete spíše <br/>
              <span className="text-orange-600">půjčit dodávku?</span>
            </h2>
            <p className="text-lg text-slate-500 font-medium leading-relaxed">
              Kromě obytných vozů provozujeme také nejlépe hodnocenou půjčovnu užitkových vozů v Brně. Ať už se stěhujete, nebo potřebujete převézt rozměrný náklad, jsme tu pro vás s flotilou vozů Renault Master a Opel Movano.
            </p>
            <div className="flex flex-wrap gap-4">
              <a 
                href="https://www.pujcimedodavky.cz" 
                target="_blank" 
                rel="noopener noreferrer"
                className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 flex items-center gap-3"
              >
                Přejít na web PujcimeDodavky.cz
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="absolute -inset-4 bg-orange-200/30 rounded-[3rem] blur-2xl -z-10" />
            <div className="bg-white p-4 rounded-[2.5rem] shadow-premium border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop" 
                alt="Půjčovna dodávek Brno" 
                className="rounded-[2rem] w-full h-64 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <div className="mb-12 text-center">
          <h2 className="gradient-text">Recenze našich zákazníků</h2>
          <p className="text-slate-500 mt-4 font-medium">Zkušenosti těch, kteří s námi už vyrazili za dobrodružstvím</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              name: "Patricia",
              text: "Skvělá zkušenost od začátku do konce. Rezervace byla rychlá, komunikace bez problémů a předání vozu perfektně vysvětlené. Obytný vůz byl čistý, moderní a skvěle vybavený. Cestování bez hotelů je úplně jiná úroveň svobody. Určitě doporučuji a příště půjčujeme znovu."
            },
            {
              name: "Liliana",
              text: "Perfektní servis a velmi ochotný přístup. Vůz nám dovezli až před dům, vše ukázali a poradili i tipy na cestu. Auto bylo ve výborném stavu a řízení úplně v pohodě i pro někoho, kdo jel s obytným vozem poprvé. Skvělý zážitek, moc děkujeme."
            },
            {
              name: "Dan Líbánek",
              text: "Naprostá spokojenost. Online rezervace jednoduchá, rychlá domluva a profesionální předání. Obytný vůz byl krásně připravený a plně vybavený, nic nám nechybělo. Ideální způsob, jak cestovat pohodlně a svobodně. Rozhodně doporučuji."
            }
          ].map((rev, i) => (
            <div key={i} className="card-ultimate p-8">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-blue-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-slate-600 text-sm leading-relaxed italic mb-6">"{rev.text}"</p>
              <div className="font-bold text-slate-900 text-xs uppercase tracking-wider">— {rev.name}</div>
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
