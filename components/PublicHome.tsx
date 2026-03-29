
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Plus, Minus, HelpCircle, Calendar as CalendarIcon, ArrowRight, CheckCircle2, Gauge, Phone, ShieldCheck, Users, BedDouble, Zap, Tv, Navigation as NavIcon, Map, Info, Infinity, MessageCircle, MapPin, Video, ListChecks, Moon, Sun, Search, Play } from 'lucide-react';
import { Vehicle, Reservation, ReservationStatus } from '../types';
import { formatCurrency } from '../utils/format';
import AvailabilityCalendar from './AvailabilityCalendar';

interface PublicHomeProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  onBookNow: (vehicleId: string, startDate?: string) => void;
  onScrollTo: (sectionId: string) => void;
  onNavigate: (view: 'blog' | 'vehicle-detail' | 'guides' | 'checklist' | 'calculator') => void;
  isDarkMode: boolean;
  setIsDarkMode: (isDark: boolean) => void;
}

const PublicHome: React.FC<PublicHomeProps> = ({ vehicles, reservations, onBookNow, onScrollTo, onNavigate, isDarkMode, setIsDarkMode }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [checkedItems, setCheckedItems] = useState<string[]>([]);

  const toggleCheck = (item: string) => {
    setCheckedItems(prev => 
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

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
      q: "Co je všechno v ceně pronájmu?",
      a: "V ceně pronájmu je zahrnuto: vozidlo, propanbutanové lahve, příslušenství, sada nádobí, markýza, kabel na připojení v campu. Vůz má dálniční známku pro ČR a havarijní pojištění s asistencí po celé Evropě."
    },
    {
      q: "Jaké jsou rozměry a hmotnost Ahorn TU Plus?",
      a: "Ahorn TU Plus (2022) má délku 6980 cm (6,98 m), šířku 2,35 m a výšku 2,95 m. Provozní hmotnost je cca 3050 kg, doložnost tedy cca 450 kg do limitu 3500 kg (skupina B). Díky motoru 2.3 dCi s výkonem 165 kW (chip) je jízda velmi svižná i v kopcích."
    },
    {
      q: "Jak funguje spaní pro 5 osob?",
      a: "Vůz disponuje dvěma elektricky sjížděcími postelemi (přední nad sezením a zadní nad garáží). Páté lůžko se připravuje rozložením jídelního koutu. Všechny postele mají kvalitní matrace pro maximální komfort."
    },
    {
      q: "Je vůz vhodný pro zimní kempování?",
      a: "Ano, náš Ahorn je vybaven výkonným nezávislým topením Truma Combi 4 a izolovanou odpadní nádrží. Díky solárnímu panelu a dvěma nástavbovým bateriím jste energeticky soběstační i mimo kempy."
    },
    {
      q: "Kde si mohu vůz vyzvednout?",
      a: "Vyzvednutí probíhá v Brně - Bohunicích. Přesnou adresu a instrukce k parkování vašeho vozu obdržíte po potvrzení rezervace. Možnost parkování vašeho osobního vozu v našem hlídaném areálu po dobu pronájmu zdarma."
    }
  ];

  const packingList = [
    { category: "Doklady", items: ["Řidičský průkaz sk. B", "Občanský průkaz", "Potvrzení o rezervaci"] },
    { category: "Osobní věci", items: ["Pohodlné oblečení", "Plavky", "Přezůvky do vozu", "Toaletní potřeby"] },
    { category: "Elektronika", items: ["Nabíječky na telefon/tablet", "Powerbanka", "USB kabely"] },
    { category: "Ostatní", items: ["Sluneční brýle", "Osobní léky", "Repelent", "Baterka/Čelovka"] }
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
      content: "Vůz je vysoký 3 metry a dlouhý 6,98 metru. Pozor na podjezdy a větve! Při couvání vždy využívejte kameru a ideálně i pomocníka venku. Nezapomeňte před jízdou zavřít všechna okna a zajistit skříňky."
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
    <div className={`space-y-0 overflow-x-hidden transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-white' : 'bg-white text-slate-900'}`}>
      {/* Hero Section with Integrated Calendar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="text-left reveal-up">
            <h1 className={`text-5xl md:text-7xl font-black tracking-tight leading-[1.1] mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Svoboda na <br/>
              <span className="text-orange-600">čtyřech kolech.</span>
            </h1>
            
            <p className={`text-lg font-medium leading-relaxed mb-8 max-w-xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
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
                <Gauge className="w-5 h-5 text-brand-primary" />
                <span className="van-badge">Limit 350 km/den</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-brand-primary/10 rounded-[3rem] blur-2xl -z-10" />
            <div className={`rounded-[2.5rem] p-8 border relative transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-premium'}`}>
              <div className="flex justify-between items-center mb-6">
                <div className="bg-brand-primary text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
                  Live Dostupnost
                </div>
                <div className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                  Klikněte na volný den
                </div>
              </div>
              <AvailabilityCalendar 
                vehicles={vehicles} 
                reservations={reservations} 
                isEmbedded={true} 
                initialVehicleId={mainVehicle.id}
                onDateClick={(date) => onBookNow(mainVehicle.id, date)}
                isDarkMode={isDarkMode}
              />
              <div className={`mt-6 pt-6 border-t flex justify-between items-center ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400" />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Volno</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-400" />
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Obsazeno</span>
                  </div>
                </div>
                <button 
                  onClick={() => onScrollTo('fleet')}
                  className="text-[9px] font-black text-brand-primary uppercase tracking-widest hover:text-orange-600 transition-colors"
                >
                  Zobrazit ceník →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <MapPin className="w-6 h-6" />,
                title: "Po Brně přivezeme",
                desc: "Pokud budete chtít, obytňák vám přivezeme až před dům za 300 Kč. Jednoduché a pohodlné.",
                color: "blue"
              },
              {
                icon: <ShieldCheck className="w-6 h-6" />,
                title: "GPS a alarm",
                desc: "Vůz je chráněn GPS sledováním s dálkovou deaktivací. Vaše bezpečí je naší prioritou.",
                color: "green"
              },
              {
                icon: <Users className="w-6 h-6" />,
                title: "Osobní přístup",
                desc: "Vše vám vysvětlíme, poradíme a pomůžeme. Pronájem s lidským přístupem.",
                color: "orange"
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Dálniční známka",
                desc: "Cestujte bez omezení po českých dálnicích. Havarijní pojištění v ceně.",
                color: "purple"
              }
            ].map((item, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border space-y-4 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                  item.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                  item.color === 'green' ? 'bg-green-100 text-green-600' :
                  item.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {item.icon}
                </div>
                <h3 className={`text-xl font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{item.desc}</p>
              </div>
            ))}
          </div>

          <div className={`mt-20 p-10 rounded-[3rem] transition-colors ${isDarkMode ? 'bg-slate-900 border border-slate-800' : 'bg-slate-900 text-white'}`}>
            <div className="max-w-3xl">
              <h2 className={`text-3xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-white'}`}>Co u nás získáváte?</h2>
              <p className={`font-medium mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>
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
                    <div className="flex-shrink-0 w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] font-black text-white">✓</div>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-300' : 'text-white'}`}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Gallery */}
      <section id="gallery" className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Prohlédněte si Ahorn TU Plus</h2>
            <p className="text-slate-500 font-medium">Detailní pohled na váš budoucí domov na cestách</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[250px]">
            {mainVehicle.images?.map((img, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 0.98 }}
                className={`relative rounded-3xl overflow-hidden cursor-zoom-in group ${
                  idx === 0 ? 'md:col-span-2 md:row-span-2' : 
                  idx === 1 ? 'md:col-span-2' : 
                  ''
                }`}
                onClick={() => setSelectedImage(img)}
              >
                <img 
                  src={img} 
                  alt={`Ahorn TU Plus ${idx + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Search className="text-white w-8 h-8" />
                </div>
                {idx === 0 && (
                  <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20">
                      <Users className="w-4 h-4 text-brand-primary" />
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">5 osob jízda/spaní</span>
                    </div>
                    <div className="bg-orange-600/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl flex items-center gap-2 border border-white/20">
                      <Zap className="w-4 h-4 text-white" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">165 kW Výkon</span>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video Tour Section */}
      <section className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="mb-12">
            <span className="bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">Video Prohlídka</span>
            <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Zažijte ho na vlastní oči</h2>
          </div>
          
          <div className="relative aspect-video rounded-[3rem] overflow-hidden shadow-2xl group cursor-pointer border-8 border-white/10">
            <img 
              src={mainVehicle.images?.[0]} 
              alt="Video Thumbnail" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center text-white shadow-2xl"
              >
                <Play className="w-10 h-10 fill-current ml-1" />
              </motion.div>
            </div>
          </div>
          <p className="mt-8 text-slate-500 font-medium italic">"Tento model TU Plus je unikátní svým zadním sezením ve tvaru U, které nikde jinde nenajdete."</p>
        </div>
      </section>

      {/* Main Vehicle Details Section */}
      <section id="fleet" className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-12">
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Model 2022</span>
                  <h3 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{mainVehicle.name}</h3>
                </div>
                <p className={`text-lg font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  Podvozek Renault Master | Motor 2.3 dCi 165 kW (Zvýšený výkon)
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-6 rounded-3xl border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`font-black text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>165 kW</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Výkon motoru</div>
                </div>
                <div className={`p-6 rounded-3xl border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`font-black text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>3 500 kg</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Váha (sk. B)</div>
                </div>
                <div className={`p-6 rounded-3xl border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`font-black text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>6.98 m</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Délka vozu</div>
                </div>
                <div className={`p-6 rounded-3xl border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <div className={`font-black text-2xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>100 L</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">Nádrž na vodu</div>
                </div>
              </div>

              <div className={`prose prose-lg max-w-none leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                <p>Náš <strong>Ahorn TU Plus (2022)</strong> je vlajkovou lodí v kategorii polointegrovaných vozů. Unikátní zadní sezení ve tvaru "U" nabízí bezkonkurenční prostor pro relaxaci, který se večer promění v obrovské letiště. Díky <strong>dvěma elektrickým spouštěcím postelím</strong> pohodlně ubytuje až 5 osob, aniž byste museli složitě přestavovat interiér.</p>
                <p>Vůz je vybaven <strong>solárním panelem (140W)</strong> a automatickým satelitem, což vám dává naprostou svobodu i mimo kempy. Zvýšený výkon motoru na 165 kW zajišťuje hladkou jízdu i v horských průsmycích.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className={`p-8 rounded-[2.5rem] border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <h4 className={`text-lg font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Zap className="w-5 h-5 text-orange-600" />
                    Technické vybavení
                  </h4>
                  <ul className="space-y-4">
                    {[
                      'Zvýšený výkon motoru 165 kW',
                      'Solární panel 140W pro nezávislost',
                      'Automatický satelit + TV',
                      'RV Navigace pro obytné vozy',
                      'Elektrický nástupní schůdek',
                      'Zadní parkovací kamera'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className={`p-8 rounded-[2.5rem] border transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                  <h4 className={`text-lg font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <Users className="w-5 h-5 text-orange-600" />
                    Komfort a bydlení
                  </h4>
                  <ul className="space-y-4">
                    {[
                      '2x Elektrická spouštěcí postel',
                      'Velká lednice s mrazákem',
                      'Zadní sezení "U" pro 6 osob',
                      'Nezávislé naftové topení',
                      'Kompletní LED osvětlení',
                      'Měnič napětí 12V / 230V'
                    ].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm font-bold">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
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
              <button 
                onClick={() => onBookNow(mainVehicle.id)} 
                className="w-full py-6 bg-orange-600 hover:bg-orange-700 text-white rounded-[2rem] font-black text-lg transition-all shadow-xl shadow-orange-600/20 flex items-center justify-center gap-3"
              >
                Rezervovat vůz
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Přehledný ceník 2026</h2>
            <p className="text-slate-500 font-medium">Transparentní ceny bez skrytých poplatků a servisních nákladů</p>
          </div>
          <div className={`rounded-[3rem] overflow-hidden border transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left min-w-[600px] md:min-w-0">
                <thead className={`${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                  <tr>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sezóna</th>
                    <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Období</th>
                    <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Cena / Den</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
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
              * Vratná kauce činí 25 000 Kč • Limit nájezdu 350 km/den • Minimální doba nájmu 3 dny
            </div>
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

      {/* How it works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 section-padding">
        <div className="mb-12 text-center">
          <h2 className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Jak si půjčit obytňák?</h2>
          <p className="text-slate-500 mt-4 font-medium">Jednoduchý proces ve 4 krocích</p>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: "01", title: "Rezervace", desc: "Vyberte si termín v kalendáři a odešlete nezávaznou poptávku." },
            { step: "02", title: "Potvrzení", desc: "Ozveme se vám, doladíme detaily a potvrdíme dostupnost." },
            { step: "03", title: "Předání", desc: "V Brně vám vše vysvětlíme, podepíšeme smlouvu a předáme klíče." },
            { step: "04", title: "Cesta", desc: "Užijte si svobodu na cestách s plně vybaveným vozem." }
          ].map((item, i) => (
            <div key={i} className={`relative group p-8 rounded-[2.5rem] border shadow-sm hover:shadow-xl transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
              <div className={`text-5xl font-black group-hover:text-brand-primary/10 transition-colors absolute top-4 right-8 -z-0 ${isDarkMode ? 'text-slate-800' : 'text-slate-100'}`}>{item.step}</div>
              <div className="relative z-10 space-y-3">
                <h3 className={`text-lg font-black uppercase tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{item.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Packing Checklist Section */}
      <section className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-bold text-[10px] uppercase tracking-widest mb-4">
              <ListChecks className="w-4 h-4" />
              PŘÍPRAVA NA CESTU
            </div>
            <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Co si sbalit s sebou?</h2>
            <p className={`text-lg max-w-2xl mx-auto font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Vůz je plně vybaven, ale pár věcí si přesto nezapomeňte.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {packingList.map((cat, idx) => (
              <div key={idx} className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                <h3 className={`text-xl font-black mb-6 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <CheckCircle2 className="w-5 h-5 text-orange-600" />
                  {cat.category}
                </h3>
                <ul className="space-y-4">
                  {cat.items.map((item, i) => (
                    <li 
                      key={i} 
                      onClick={() => toggleCheck(item)}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                        checkedItems.includes(item) 
                          ? 'bg-orange-600 border-orange-600' 
                          : isDarkMode ? 'border-slate-600 group-hover:border-orange-600' : 'border-slate-300 group-hover:border-orange-600'
                      }`}>
                        {checkedItems.includes(item) && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className={`text-sm font-medium transition-all ${checkedItems.includes(item) ? 'line-through opacity-50' : ''} ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-600 font-bold text-[10px] uppercase tracking-widest mb-6">
                <MapPin className="w-4 h-4" />
                KDE NÁS NAJDETE
              </div>
              <h2 className={`text-4xl font-black mb-6 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Brno - Bohunice</h2>
              <p className={`text-lg mb-8 font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Naše základna se nachází v Brně - Bohunicích s výbornou dostupností z dálnice D1. 
                Při převzetí vozu u nás můžete zdarma zaparkovat své osobní auto v hlídaném areálu.
              </p>
              <div className="space-y-4">
                <div className={`flex items-center gap-4 p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-premium'}`}>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-black uppercase tracking-widest text-[10px] mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Adresa předání</p>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Brno - Bohunice (přesná adresa v potvrzení)</p>
                  </div>
                </div>
                <div className={`flex items-center gap-4 p-6 rounded-[2rem] border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100 shadow-premium'}`}>
                  <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                    <CalendarIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className={`font-black uppercase tracking-widest text-[10px] mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Čas předání</p>
                    <p className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Dle domluvy (standardně 14:00 - 18:00)</p>
                  </div>
                </div>
              </div>
              <a 
                href="https://maps.google.com/?q=Brno+Bohunice" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 mt-10 bg-slate-900 text-white px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl"
              >
                Otevřít v Google Maps
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
            <div className="h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2608.234567890123!2d16.56789012345678!3d49.16789012345678!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4712945678901234%3A0x1234567890123456!2sBohunice%2C+Brno!5e0!3m2!1scs!2scz!4v1234567890123" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* Sister Company Section */}
      <section className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
        <div className="max-w-7xl mx-auto">
          <div className={`rounded-[3rem] p-8 md:p-16 border flex flex-col lg:flex-row items-center gap-12 transition-colors ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
            <div className="lg:w-1/2 space-y-6 text-left">
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Naše další služby</span>
              </div>
              <h2 className={`text-4xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Potřebujete spíše <br/>
                <span className="text-orange-600">půjčit dodávku?</span>
              </h2>
              <p className={`text-lg font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Kromě obytných vozů provozujeme také nejlépe hodnocenou půjčovnu užitkových vozů v Brně. Ať už se stěhujete, nebo potřebujete převézt rozměrný náklad, jsme tu pro vás s flotilou vozů Renault Master a Opel Movano.
              </p>
              <div className="flex flex-wrap gap-4">
                <a 
                  href="https://www.pujcimedodavky.cz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl flex items-center gap-3"
                >
                  Přejít na web PujcimeDodavky.cz
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
            <div className="lg:w-1/2 relative">
              <div className="absolute -inset-4 bg-orange-200/30 rounded-[3rem] blur-2xl -z-10" />
              <div className={`p-4 rounded-[2.5rem] shadow-premium border rotate-2 hover:rotate-0 transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}>
                <img 
                  src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1000&auto=format&fit=crop" 
                  alt="Půjčovna dodávek Brno" 
                  className="rounded-[2rem] w-full h-64 object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section className={`py-20 px-4 transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-12 text-center">
            <h2 className={`text-4xl font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Recenze našich zákazníků</h2>
            <p className="text-slate-500 font-medium">Zkušenosti těch, kteří s námi už vyrazili za dobrodružstvím</p>
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
              <div key={i} className={`p-8 rounded-[2.5rem] border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-orange-500 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  ))}
                </div>
                <p className={`text-sm leading-relaxed italic mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>"{rev.text}"</p>
                <div className={`font-black text-xs uppercase tracking-wider ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>— {rev.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out" onClick={() => setSelectedImage(null)}>
           <img src={selectedImage} className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300" />
        </div>
      )}

      {/* Floating Buttons */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col gap-4 pointer-events-none">
        <motion.button
          onClick={() => setIsDarkMode(!isDarkMode)}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className={`pointer-events-auto w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${isDarkMode ? 'bg-white text-slate-900' : 'bg-slate-900 text-white'}`}
        >
          {isDarkMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </motion.button>
        <motion.a
          href="https://wa.me/420777123456"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-14 h-14 bg-green-500 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          <MessageCircle className="w-7 h-7" />
        </motion.a>
        <motion.a
          href="tel:+420777123456"
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-14 h-14 bg-orange-600 text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-orange-700 transition-colors"
        >
          <Phone className="w-6 h-6" />
        </motion.a>
        <motion.button
          onClick={() => onBookNow(mainVehicle.id)}
          initial={{ opacity: 0, scale: 0.8, x: 20 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="pointer-events-auto w-14 h-14 bg-brand-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:bg-brand-secondary transition-colors"
        >
          <CalendarIcon className="w-6 h-6" />
        </motion.button>
      </div>

      {/* Sticky Mobile Bar */}
      <div className={`md:hidden fixed bottom-0 left-0 right-0 z-[90] border-t p-4 flex items-center justify-between shadow-[0_-10px_30px_rgba(0,0,0,0.05)] transition-colors duration-500 ${isDarkMode ? 'bg-slate-900/90 border-slate-800 backdrop-blur-xl' : 'bg-white/80 backdrop-blur-xl border-slate-100'}`}>
        <div>
          <div className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>Cena od</div>
          <div className={`text-lg font-black ${isDarkMode ? 'text-white' : 'text-brand-primary'}`}>{formatCurrency(mainVehicle.basePrice)} <span className="text-[10px] text-slate-400">/ den</span></div>
        </div>
        <div className="flex gap-2">
          <a 
            href="https://wa.me/420777123456"
            className="w-12 h-12 bg-green-500 text-white rounded-xl flex items-center justify-center"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
          <button 
            onClick={() => onBookNow(mainVehicle.id)}
            className="btn-ultimate-primary px-8 py-3 text-[10px]"
          >
            Rezervovat
          </button>
        </div>
      </div>
    </div>
  );
};

export default PublicHome;
