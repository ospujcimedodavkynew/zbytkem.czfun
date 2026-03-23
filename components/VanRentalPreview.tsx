
import React from 'react';
import { motion } from 'motion/react';
import { 
  Truck, 
  Clock, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  ArrowRight, 
  Package, 
  Star,
  Info,
  Calendar,
  Zap,
  Ruler,
  LayoutGrid,
  Weight,
  Fuel,
  Calculator,
  Maximize2,
  Layout
} from 'lucide-react';

interface VanRentalPreviewProps {
  onBack: () => void;
}

type PDView = 'home' | 'fleet' | 'pricing' | 'terms';

const VanRentalPreview: React.FC<VanRentalPreviewProps> = ({ onBack }) => {
  const [currentView, setCurrentView] = React.useState<PDView>('home');

  const benefits = [
    {
      title: "Perfektní stav",
      desc: "Pravidelně servisované vozy Renault Master, Fiat Ducato a Opel Movano.",
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />
    },
    {
      title: "Nonstop servis",
      desc: "Jsme vám k dispozici 24/7, včetně víkendů a svátků na Teslově.",
      icon: <Clock className="w-6 h-6 text-blue-500" />
    },
    {
      title: "Super ceny",
      desc: "Pronájem již od 800 Kč. Možnost zapůjčení i na pouhé 4 hodiny.",
      icon: <Zap className="w-6 h-6 text-orange-500" />
    },
    {
      title: "Přistavení vozu",
      desc: "Dodávku vám přivezeme až před dům nebo firmu po celém Brně.",
      icon: <MapPin className="w-6 h-6 text-red-500" />
    }
  ];

  const fleetData = [
    {
      name: "Renault Master L1H1 (3x)",
      tagline: "Malá dodávka, skvělé ovládání. Ideální pro městské stěhování.",
      prices: { h4: "800 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "3 EURO palety",
        motor: "2.3 CDTI 74kw Renault",
        volume: "8 m³",
        load: "1080 kg",
        license: "sk. B",
        consumption: "8-10 l/100km",
        seats: "3",
        euro: "5"
      },
      dims: {
        length: "2583 mm",
        width: "1765 mm",
        height: "1700 mm",
        betweenArches: "1380 mm",
        doorHeight: "1581 mm"
      },
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano L3H2 (2x)",
      tagline: "Velká dodávka, parkovací senzory, asistent rozjezdu do kopce.",
      prices: { h4: "900 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDI 92 Kw",
        volume: "14 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "8-10 l/100km",
        seats: "3",
        euro: "5"
      },
      dims: {
        length: "3733 mm",
        width: "1765 mm",
        height: "1894 mm",
        betweenArches: "1380 mm",
        doorHeight: "1780 mm"
      },
      image: "https://images.unsplash.com/photo-1606206591513-adbf9762965a?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano L3H3",
      tagline: "Extra vysoká dodávka pro objemné náklady.",
      prices: { h4: "900 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDI 92 Kw",
        volume: "16 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "8-10 l/100km",
        seats: "3",
        euro: "5"
      },
      dims: {
        length: "3733 mm",
        width: "1765 mm",
        height: "2144 mm",
        betweenArches: "1380 mm",
        doorHeight: "2030 mm"
      },
      image: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Renault Master 2022 L2H2",
      tagline: "Moderní výbava: Klimatizace, parkovací kamera, Bluetooth, dřevěná podlaha.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "4 EURO palety",
        motor: "2.3 CDTI 100 KW",
        volume: "11 m³",
        load: "1080 kg",
        license: "sk. B",
        consumption: "7-8 l/100km",
        seats: "3",
        euro: "6"
      },
      dims: {
        length: "3083 mm",
        width: "1765 mm",
        height: "1894 mm",
        betweenArches: "1380 mm",
        doorHeight: "1780 mm"
      },
      image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Fiat Ducato L2H2",
      tagline: "Spolehlivý motor IVECO, dřevěná podlaha pro ochranu nákladu.",
      prices: { h4: "800 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "4 EURO palety",
        motor: "2.3 JTD 96kw IVECO",
        volume: "11 m³",
        load: "1080 kg",
        license: "sk. B",
        consumption: "8-9 l/100km",
        seats: "3",
        euro: "5"
      },
      dims: {
        length: "3120 mm",
        width: "1870 mm",
        height: "1932 mm",
        betweenArches: "1422 mm",
        doorHeight: "1755 mm"
      },
      image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano 2021",
      tagline: "Komfortní výbava: Tempomat, Navigace, Apple CarPlay.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDI 100 Kw",
        volume: "14 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "8-10 l/100km",
        seats: "3",
        euro: "6"
      },
      dims: {
        length: "3733 mm",
        width: "1765 mm",
        height: "1894 mm",
        betweenArches: "1380 mm",
        doorHeight: "1780 mm"
      },
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Renault Master L4H3 MAXI",
      tagline: "Největší dodávka v Brně. Parkovací kamera, asistent rozjezdu.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDTI 107 kw Renault zadní náhon",
        volume: "17 m³",
        load: "1300 kg",
        license: "sk. B",
        consumption: "10-13 l/100km",
        seats: "3",
        euro: "5"
      },
      dims: {
        length: "4383 mm",
        width: "1765 mm",
        height: "2144 mm",
        betweenArches: "1080 mm",
        doorHeight: "2030 mm"
      },
      image: "https://images.unsplash.com/photo-1606206591513-adbf9762965a?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano L2H2 2021",
      tagline: "Dřevěná podlaha, Klimatizace, Apple CarPlay.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "4 EURO palety",
        motor: "2.3 CDTI 92 KW",
        volume: "11 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "9-10 l/100km",
        seats: "3",
        euro: "6"
      },
      dims: {
        length: "3083 mm",
        width: "1765 mm",
        height: "1894 mm",
        betweenArches: "1380 mm",
        doorHeight: "1780 mm"
      },
      image: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const [calcVan, setCalcVan] = React.useState(fleetData[0].name);
  const [calcHours, setCalcHours] = React.useState<'h4' | 'h12' | 'h24'>('h4');

  const getCalcPrice = () => {
    const van = fleetData.find(v => v.name === calcVan);
    if (!van) return "0 Kč";
    if (calcHours === 'h4') return van.prices.h4;
    if (calcHours === 'h12') return van.prices.h12;
    return "od 1 600 Kč";
  };

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Nejlépe hodnocená půjčovna dodávek Brno</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
              PŮJČOVNA <br/>
              <span className="text-slate-400 text-5xl md:text-7xl">DODÁVEK BRNO</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
              Hledáte spolehlivý <strong>pronájem dodávek v Brně</strong>? Nabízíme užitkové vozy Renault Master a Fiat Ducato v perfektním stavu. Půjčení již od 800 Kč, nonstop servis a dálniční známka vždy v ceně.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setCurrentView('fleet')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 hover:bg-orange-600 transition-all flex items-center gap-3">
                Vybrat dodávku online
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href="tel:776333301" className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-slate-900 transition-all flex items-center gap-3">
                <Phone className="w-4 h-4" />
                776 333 301
              </a>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Bez DPH</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Nonstop 24/7</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Parkování u nás</span>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-orange-100 rounded-[4rem] blur-3xl -z-10 opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop" 
              alt="Půjčovna dodávek Brno - Renault Master" 
              className="rounded-[3rem] shadow-premium rotate-2 hover:rotate-0 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase">V čem jsme <span className="text-orange-600">jiní?</span></h2>
            <p className="text-slate-500 font-medium text-lg">Srovnání naší půjčovny s běžnou konkurencí v Brně.</p>
          </div>
          
          <div className="bg-slate-50 rounded-[3rem] border border-slate-100 overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 border-b border-slate-200">
              <div className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Služba / Výhoda</div>
              <div className="p-8 bg-orange-600 text-white text-center font-black uppercase text-[10px] tracking-widest">PůjčímeDodávky.cz</div>
              <div className="p-8 text-center font-black uppercase text-[10px] tracking-widest text-slate-400">Běžná půjčovna</div>
            </div>
            {[
              { label: "Dálniční známka ČR", us: true, them: false },
              { label: "Asistenční služby 24/7", us: true, them: "Často za příplatek" },
              { label: "Půjčení na 4 hodiny", us: true, them: "Většinou min. 24h" },
              { label: "Rudl a popruhy zdarma", us: true, them: false },
              { label: "Plátce DPH", us: "Nejsme (konečné ceny)", them: "Většinou ano (+21%)" },
              { label: "Víkendy a svátky", us: "Bez příplatku", them: "Často s příplatkem" }
            ].map((row, i) => (
              <div key={i} className="grid grid-cols-3 border-b border-slate-100 last:border-0 hover:bg-white transition-colors">
                <div className="p-8 text-sm font-bold text-slate-700">{row.label}</div>
                <div className="p-8 bg-orange-50/50 flex items-center justify-center">
                  {row.us === true ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : <span className="text-xs font-black text-orange-600 text-center">{row.us}</span>}
                </div>
                <div className="p-8 flex items-center justify-center">
                  {row.them === false ? <div className="w-6 h-0.5 bg-slate-200" /> : <span className="text-xs font-bold text-slate-400 text-center">{row.them}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Content Section */}
      <section className="py-20 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2 space-y-6">
              <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">Profesionální pronájem užitkových vozů v Brně</h2>
              <p className="text-slate-600 leading-relaxed">
                Naše <strong>půjčovna dodávek Brno</strong> se specializuje na krátkodobý i dlouhodobý pronájem spolehlivých vozů do 3,5 tuny. Jsme ideální volbou pro firmy, živnostníky i soukromé osoby, které potřebují převézt materiál, zboží nebo nábytek. Díky naší strategické poloze na parkovišti Teslova jsme snadno dostupní z celého Brna i dálnice D1.
              </p>
              <p className="text-slate-600 leading-relaxed">
                Proč zvolit právě nás? Zakládáme si na <strong>perfektním technickém stavu</strong> našich vozidel. Každá dodávka prochází pravidelným servisem, aby vás na cestách nic nepřekvapilo. Navíc nabízíme flexibilní tarify – potřebujete dodávku jen na 4 hodiny pro rychlý nákup v IKEA, nebo na celý měsíc pro vaše podnikání? U nás není nic problém.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 text-orange-600">Naše hlavní lokality</h3>
              <ul className="space-y-4">
                {["Brno-jih (Teslova)", "Brno-střed", "Brno-Bohunice", "Brno-Lískovec", "Okolí Brna (přistavení)"].map((loc, i) => (
                  <li key={i} className="flex items-center gap-3 text-xs font-bold text-slate-700">
                    <MapPin className="w-4 h-4 text-slate-400" /> {loc}
                  </li>
                ))}
              </ul>
              <div className="mt-8 pt-8 border-t border-slate-200">
                <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                  "Jsme nejlevnější půjčovna dodávek v Brně s důrazem na kvalitu a čistotu vozů."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-y border-slate-50 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Půjčení od", val: "4 hodin" },
              { label: "Cena od", val: "800 Kč" },
              { label: "Dostupnost", val: "Nonstop 24/7" },
              { label: "Nájezd v ceně", val: "300 km" }
            ].map((stat, i) => (
              <div key={i} className="text-center md:text-left">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</div>
                <div className="text-2xl font-black text-slate-900">{stat.val}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6 uppercase">Proč si půjčit dodávku <br/>právě u nás?</h2>
            <p className="text-slate-500 font-medium text-lg max-w-2xl">Kombinujeme nízké ceny s nadstandardním servisem. U nás víte, co si půjčujete.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Vždy v perfektním stavu",
                desc: "Naše vozy Fiat Ducato, Renault Master a Opel Movano prochází pravidelnou kontrolou. Čistota a technická spolehlivost jsou u nás standardem.",
                icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              },
              {
                title: "Jsme tu pro vás nonstop",
                desc: "Volejte kdykoliv, pracujeme o víkendech i svátcích. Předání vozu na Teslově probíhá 24/7 po předchozí domluvě.",
                icon: <Clock className="w-6 h-6 text-blue-500" />
              },
              {
                title: "Nejlepší ceny v Brně",
                desc: "Ceny začínají na 800 Kč. Nejsme plátci DPH, takže cena, kterou vidíte, je konečná. Žádné skryté poplatky za pojištění.",
                icon: <Zap className="w-6 h-6 text-orange-500" />
              },
              {
                title: "Zákazník na 1. místě",
                desc: "Nabízíme přistavení dodávky až před váš dům nebo firmu po celém Brně. Šetříme váš čas i peníze.",
                icon: <MapPin className="w-6 h-6 text-red-500" />
              }
            ].map((benefit, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black mb-4 leading-tight">{benefit.title}</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Moving Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[4rem] overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/10 blur-3xl -mr-32" />
          <div className="grid lg:grid-cols-2 items-center">
            <div className="p-12 md:p-20 space-y-8">
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight uppercase">
                Stěhování v Brně <br/>
                <span className="text-orange-500 text-3xl md:text-5xl">s námi bude hračka</span>
              </h2>
              <div className="space-y-6">
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  Lidé říkají, že je lepší vyhořet než se stěhovat. S naší <strong>stěhovací dodávkou</strong> to ale neplatí. Naše vozy mají v nákladním prostoru dřevěnou podlahu s kobercem, aby se váš majetek nepoškodil.
                </p>
                <ul className="grid gap-4">
                  {[
                    "Zdarma zapůjčíme rudl a utahovací popruhy",
                    "Přistavení před dům po Brně za 200 Kč",
                    "Dostatek prostoru i pro největší skříně",
                    "Všechny vozy s dálniční známkou pro ČR"
                  ].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-white font-bold text-sm">
                      <CheckCircle2 className="w-5 h-5 text-orange-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <button onClick={() => setCurrentView('fleet')} className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20">
                Poptat dodávku na stěhování
              </button>
            </div>
            <div className="hidden lg:block h-full min-h-[600px] relative">
              <img 
                src="https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=1000&auto=format&fit=crop" 
                alt="Stěhování dodávkou Brno" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section for SEO */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-black tracking-tight mb-12 text-center uppercase">Časté dotazy k pronájmu dodávek</h2>
          <div className="space-y-4">
            {[
              { q: "Jaký řidičský průkaz potřebuji?", a: "Na všechny naše dodávky vám stačí řidičské oprávnění skupiny B (osobní automobil)." },
              { q: "Je v ceně dálniční známka?", a: "Ano, všechny naše užitkové vozy jsou vybaveny platnou dálniční známkou pro Českou republiku." },
              { q: "Mohu s dodávkou vyjet do zahraničí?", a: "Ano, po předchozí domluvě je možná cesta do EU. V tomto případě se skládá kauce 10 000 Kč." },
              { q: "Kde si mohu dodávku vyzvednout?", a: "Hlavní předávací místo je na parkovišti Teslova v Brně. Po dohodě vám vůz přistavíme kamkoliv po Brně." }
            ].map((faq, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100">
                <h4 className="font-black text-slate-900 mb-2">{faq.q}</h4>
                <p className="text-sm text-slate-500 font-medium">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );

  const renderFleet = () => (
    <div className="pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6">
            <Truck className="w-4 h-4 text-orange-600" />
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Vozový park půjčovny dodávek Brno</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 uppercase">Vozový park <br/><span className="text-slate-400 text-4xl md:text-6xl">půjčovny dodávek Brno</span></h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              "Dlouhodobé zapůjčení dodávky za výhodnou cenu",
              "Interaktivní rezervační systém s přehledem volných vozů",
              "V ceně 300 Km nájezd denně (další 3 Kč/km)",
              "Všechny vozy v perfektním technickém stavu",
              "Nejsme plátci DPH - ceny jsou konečné",
              "Přistavení po Brně až před dům za 200 Kč"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-16">
          {fleetData.map((van, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={i} 
              className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col lg:grid lg:grid-cols-12"
            >
              <div className="lg:col-span-5 h-[400px] lg:h-auto relative overflow-hidden group">
                <img 
                  src={van.image} 
                  alt={van.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 flex flex-wrap gap-2">
                  <div className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {van.specs.volume}
                  </div>
                  <div className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                    {van.name.includes('L1H1') ? 'Městské stěhování' : van.name.includes('MAXI') ? 'Maximální náklad' : 'Univerzální volba'}
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 p-6 bg-slate-900/90 backdrop-blur-md rounded-2xl text-white border border-white/10">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-orange-500 mb-4">
                    <Maximize2 className="w-3 h-3" /> Rozměry ložné plochy (v mm)
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Délka</div>
                      <div className="text-sm font-black tracking-tight">{van.dims.length}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Šířka</div>
                      <div className="text-sm font-black tracking-tight">{van.dims.width}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-slate-400 uppercase font-bold mb-1">Výška</div>
                      <div className="text-sm font-black tracking-tight">{van.dims.height}</div>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center">
                    <div className="text-[9px] text-slate-400 uppercase font-bold">Mezi podběhy</div>
                    <div className="text-xs font-black text-orange-400">{van.dims.betweenArches}</div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-7 p-8 md:p-12 space-y-8 bg-white">
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-3xl font-black tracking-tight">{van.name}</h3>
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-black uppercase tracking-widest">
                        {van.specs.volume}
                      </span>
                    </div>
                    <p className="text-slate-500 font-medium leading-relaxed max-w-md">{van.tagline}</p>
                  </div>
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-right min-w-[140px]">
                    <div className="text-[9px] font-black text-orange-400 uppercase tracking-widest mb-1">Pronájem od</div>
                    <div className="text-3xl font-black text-orange-600 leading-none">{van.prices.h4}</div>
                    <div className="text-[9px] font-bold text-orange-400 mt-1">včetně pojištění</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Euro Palety", val: van.specs.pallets, icon: <LayoutGrid className="w-4 h-4" /> },
                    { label: "Užitečná hm.", val: van.specs.load, icon: <Weight className="w-4 h-4" /> },
                    { label: "Motorizace", val: van.specs.motor.split(' ')[0] + ' ' + van.specs.motor.split(' ')[1], icon: <Zap className="w-4 h-4" /> },
                    { label: "Spotřeba", val: van.specs.consumption, icon: <Fuel className="w-4 h-4" /> }
                  ].map((spec, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-orange-200 transition-colors">
                      <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">
                        {spec.icon} {spec.label}
                      </div>
                      <div className="text-sm font-black text-slate-900">{spec.val}</div>
                    </div>
                  ))}
                </div>

                <div className="relative group/spec">
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-[2.2rem] blur opacity-20 group-hover/spec:opacity-30 transition duration-1000 group-hover/spec:duration-200"></div>
                  <div className="relative bg-slate-900 text-white rounded-[2rem] p-8 overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-5">
                      <Truck className="w-32 h-32 rotate-12" />
                    </div>
                    <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
                      <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Kompletní technický list</div>
                      <div className="text-[10px] font-bold text-slate-500">ID: PD-2024-{i+100}</div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-y-8 gap-x-12">
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Celý název motoru</div>
                        <div className="text-xs font-bold text-slate-200">{van.specs.motor}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Výška nákl. dveří</div>
                        <div className="text-xs font-bold text-slate-200">{van.dims.doorHeight}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Emisní norma</div>
                        <div className="text-xs font-bold text-slate-200">EURO {van.specs.euro}</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Řidičské oprávnění</div>
                        <div className="text-xs font-bold text-slate-200">{van.specs.license} (do 3.5t)</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Počet míst</div>
                        <div className="text-xs font-bold text-slate-200">{van.specs.seats} (včetně řidiče)</div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-500 uppercase tracking-widest mb-1 font-bold">Dálniční známka</div>
                        <div className="text-xs font-bold text-emerald-400">Platná (ČR)</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-100">
                  <div className="flex items-center justify-between mb-6">
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Vizualizace ložné plochy</div>
                    <div className="flex gap-2">
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                      <span className="w-2 h-2 rounded-full bg-slate-200"></span>
                    </div>
                  </div>
                  <div className="relative h-48 bg-white rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center">
                    {/* Simple SVG Visualization of a Van Cargo Area */}
                    <svg viewBox="0 0 400 200" className="w-full h-full p-8">
                      <rect x="50" y="40" width="300" height="120" fill="none" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="4 4" />
                      <path d="M50 40 L350 40 L350 160 L50 160 Z" fill="#f8fafc" stroke="#94a3b8" strokeWidth="2" />
                      {/* Dimension Lines */}
                      <line x1="50" y1="180" x2="350" y2="180" stroke="#f97316" strokeWidth="1" />
                      <text x="200" y="195" textAnchor="middle" className="text-[10px] font-bold fill-orange-600">{van.dims.length}</text>
                      
                      <line x1="30" y1="40" x2="30" y2="160" stroke="#f97316" strokeWidth="1" />
                      <text x="20" y="100" textAnchor="middle" transform="rotate(-90 20 100)" className="text-[10px] font-bold fill-orange-600">{van.dims.height}</text>

                      <line x1="370" y1="60" x2="370" y2="140" stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 2" />
                      <text x="385" y="100" textAnchor="middle" transform="rotate(90 385 100)" className="text-[8px] font-bold fill-slate-400">Dveře: {van.dims.doorHeight}</text>
                    </svg>
                    <div className="absolute top-4 right-4 text-[8px] font-black text-slate-300 uppercase tracking-tighter">Schéma ložného prostoru</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="flex-1 min-w-[200px] px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20 flex items-center justify-center gap-3">
                    Rezervovat tento vůz <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-slate-900 transition-all flex items-center gap-3">
                    <Phone className="w-4 h-4" /> 776 333 301
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPricing = () => (
    <div className="pt-40 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="max-w-4xl mx-auto text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-slate-900 uppercase">Ceník <br/><span className="text-orange-600">pronájmu dodávek</span></h2>
          <p className="text-slate-500 font-medium text-lg">Transparentní ceny bez skrytých poplatků. Nejsme plátci DPH.</p>
        </div>

        {/* Interactive Calculator */}
        <div className="max-w-4xl mx-auto bg-slate-900 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden mb-32">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Calculator className="w-64 h-64" />
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h3 className="text-3xl font-black uppercase tracking-tight">Rychlá kalkulace</h3>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vyberte vůz</label>
                  <select 
                    value={calcVan}
                    onChange={(e) => setCalcVan(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-4 font-bold text-sm focus:outline-none focus:border-orange-500 transition-colors text-white"
                  >
                    {fleetData.map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Doba zapůjčení</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'h4', label: '4 hod' },
                      { id: 'h12', label: '12 hod' },
                      { id: 'h24', label: '24 hod+' }
                    ].map(opt => (
                      <button
                        key={opt.id}
                        onClick={() => setCalcHours(opt.id as any)}
                        className={`py-3 rounded-xl font-black text-[10px] uppercase tracking-widest border transition-all ${calcHours === opt.id ? 'bg-orange-600 border-orange-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="text-center p-12 bg-white/5 backdrop-blur-md rounded-[2.5rem] border border-white/10">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Předpokládaná cena</div>
              <div className="text-6xl font-black text-orange-500 mb-2">{getCalcPrice()}</div>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Konečná cena (nejsme plátci DPH)</div>
              <button className="mt-8 w-full py-5 bg-white text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-500 hover:text-white transition-all">
                Rezervovat nyní
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900 text-white">
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">Typ vozu</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">4 hodiny</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">12 hodin</th>
                  <th className="px-8 py-6 text-[10px] font-black uppercase tracking-widest">24 hodin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fleetData.map((van, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6 font-black text-slate-900">{van.name}</td>
                    <td className="px-8 py-6 font-bold text-orange-600">{van.prices.h4}</td>
                    <td className="px-8 py-6 font-bold text-orange-600">{van.prices.h12}</td>
                    <td className="px-8 py-6 font-bold text-slate-500">od 1 600 Kč</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-2 gap-8 text-left">
          <div className="p-8 bg-orange-50 rounded-[2rem] border border-orange-100">
            <h4 className="font-black text-orange-900 mb-4 uppercase text-xs tracking-widest">Co je v ceně?</h4>
            <ul className="space-y-3">
              {["Havarijní pojištění ČR i EU", "Dálniční známka ČR", "300 km nájezd denně", "Asistenční služby", "Stěhovací technika (rudl, popruhy)"].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-sm font-bold text-orange-800">
                  <CheckCircle2 className="w-4 h-4" /> {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100">
            <h4 className="font-black text-slate-900 mb-4 uppercase text-xs tracking-widest">Doplňkové služby</h4>
            <ul className="space-y-3">
              <li className="flex justify-between text-sm font-bold text-slate-600">
                <span>Přistavení po Brně</span>
                <span className="text-slate-900">200 Kč</span>
              </li>
              <li className="flex justify-between text-sm font-bold text-slate-600">
                <span>Kilometry nad limit</span>
                <span className="text-slate-900">3 Kč / km</span>
              </li>
              <li className="flex justify-between text-sm font-bold text-slate-600">
                <span>Vratná kauce</span>
                <span className="text-slate-900">5 000 Kč</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTerms = () => (
    <div className="pt-40 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100 mb-6">
            <ShieldCheck className="w-4 h-4 text-orange-600" />
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Férové podmínky</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8 text-slate-900">Podmínky zapůjčení <br/><span className="text-slate-400 text-4xl md:text-6xl">dodávek u naší společnosti</span></h2>
          <p className="text-slate-500 font-medium text-xl max-w-3xl leading-relaxed">
            Potřebujete si půjčit dodávku? Není to nic složitého. Máme pro Vás přehledné podmínky zapůjčení v naší půjčovně v Brně.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8">
              <Star className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="text-xl font-black mb-6">Fyzické osoby</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Doklad totožnosti (OP nebo pas)
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Řidičský průkaz sk. B
              </li>
            </ul>
          </div>

          <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8">
              <Package className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="text-xl font-black mb-6">Právnické osoby</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Živnostenský list / Výpis z OR
              </li>
              <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> OP a ŘP řidiče
              </li>
            </ul>
          </div>

          <div className="p-10 bg-white rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-8">
              <MapPin className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-xl font-black mb-6">Cizinci v ČR</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 text-sm font-bold text-slate-600">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> Potvrzení o přechodném nebo trvalém pobytu v ČR
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-slate-900 rounded-[4rem] p-12 md:p-20 text-white relative overflow-hidden mb-20">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-orange-600/10 blur-3xl -mr-32" />
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h3 className="text-4xl font-black mb-6 tracking-tight">Vratná kauce</h3>
              <p className="text-slate-400 text-lg font-medium mb-10">Kauce se skládá při převzetí vozidla a je plně vratná při odevzdání vozu v původním stavu.</p>
              <div className="space-y-6">
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="text-4xl font-black text-orange-500">5 000</div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">Kč / Zapůjčení <br/>na území ČR</div>
                </div>
                <div className="flex items-center gap-6 p-6 bg-white/5 border border-white/10 rounded-3xl">
                  <div className="text-4xl font-black text-orange-500">10 000</div>
                  <div className="text-xs font-black uppercase tracking-widest text-slate-400">Kč / Zapůjčení <br/>do zahraničí</div>
                </div>
              </div>
            </div>
            <div className="space-y-8">
              <div className="p-8 bg-orange-600 rounded-[3rem] shadow-2xl shadow-orange-900/50">
                <h4 className="text-xl font-black mb-4">Rychlá rezervace</h4>
                <p className="text-orange-100 text-sm font-medium mb-6">Celé zapůjčení trvá maximálně 10 minut. Jsme efektivní, abyste mohli hned vyrazit.</p>
                <button onClick={() => setCurrentView('fleet')} className="w-full py-4 bg-white text-orange-600 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-900 hover:text-white transition-all">
                  Vybrat dodávku
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-4xl font-black tracking-tight mb-12 text-center">Jak probíhá půjčení dodávky?</h3>
          <div className="grid md:grid-cols-4 gap-4 relative">
            {[
              { title: "Příjezd", desc: "Najdete nás na parkovišti Teslova (Google Maps: pujcimedodavky)." },
              { title: "Kontrola", desc: "Společně prohlédneme vůz, škrábance a technický stav." },
              { title: "Smlouva", desc: "Sepsání smlouvy (2 vyhotovení) a složení vratné kauce." },
              { title: "Start", desc: "Předání klíčů a můžete jet. Vše hotovo do 10 minut." }
            ].map((step, i) => (
              <div key={i} className="relative p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                <div className="text-6xl font-black text-slate-200 mb-4 leading-none">{i + 1}</div>
                <h4 className="text-lg font-black mb-3">{step.title}</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-12 bg-orange-50 rounded-[3rem] border border-orange-100 text-center">
          <Info className="w-12 h-12 text-orange-500 mx-auto mb-6" />
          <h4 className="text-2xl font-black mb-4">Potřebujete poradit?</h4>
          <p className="text-slate-600 font-medium mb-8">Náš zkušený pracovník se vám bude na Teslově plně věnovat.</p>
          <a href="tel:776333301" className="text-4xl font-black text-slate-900 hover:text-orange-600 transition-colors tracking-tight">776 333 301</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden relative">
      {/* Navigation Preview */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <button onClick={() => setCurrentView('home')} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">PD</div>
            <span className="font-black text-xl tracking-tight uppercase">PůjčímeDodávky.cz</span>
          </button>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <button onClick={() => setCurrentView('fleet')} className={`${currentView === 'fleet' ? 'text-slate-900' : 'hover:text-slate-900'} transition-colors`}>Vozový park</button>
            <button onClick={() => setCurrentView('pricing')} className={`${currentView === 'pricing' ? 'text-slate-900' : 'hover:text-slate-900'} transition-colors`}>Ceník</button>
            <button onClick={() => setCurrentView('terms')} className={`${currentView === 'terms' ? 'text-slate-900' : 'hover:text-slate-900'} transition-colors`}>Podmínky</button>
            <a href="#" className="hover:text-slate-900 transition-colors">Kontakt</a>
          </div>
          <button onClick={onBack} className="px-5 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all">
            Zpět na Obytkem
          </button>
        </div>
      </nav>

      <main className="animate-in fade-in duration-700">
        {currentView === 'home' && renderHome()}
        {currentView === 'fleet' && renderFleet()}
        {currentView === 'pricing' && renderPricing()}
        {currentView === 'terms' && renderTerms()}
      </main>

      {/* Footer / Contact */}
      <footer className="bg-slate-900 text-white py-20 px-6 mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-900 font-black">PD</div>
                <span className="font-black text-xl tracking-tight uppercase">PůjčímeDodávky.cz</span>
              </div>
              <p className="text-slate-400 text-sm font-medium leading-relaxed">
                Krátkodobý i dlouhodobý pronájem užitkových vozů v Brně. Jsme tu pro vás 24/7.
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-8">Kontakt</h4>
              <ul className="space-y-4 text-sm font-bold">
                <li className="flex items-center gap-3 text-slate-300">
                  <Phone className="w-4 h-4 text-slate-500" /> 776 333 301
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <MapPin className="w-4 h-4 text-slate-500" /> Teslova parkoviště, Brno
                </li>
                <li className="flex items-center gap-3 text-slate-300">
                  <Package className="w-4 h-4 text-slate-500" /> Milan Gula, IČO: 07031653
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-8">Rychlé odkazy</h4>
              <ul className="space-y-4 text-sm font-bold text-slate-300">
                <li><button onClick={() => setCurrentView('fleet')} className="hover:text-white transition-colors">Vozový park</button></li>
                <li><button onClick={() => setCurrentView('pricing')} className="hover:text-white transition-colors">Ceník</button></li>
                <li><button onClick={() => setCurrentView('terms')} className="hover:text-white transition-colors">Podmínky zapůjčení</button></li>
                <li><a href="#" className="hover:text-white transition-colors">Online rezervace</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-8">Sesterský projekt</h4>
              <button onClick={onBack} className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all w-full text-left">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-black text-[10px]">O</div>
                <div>
                  <div className="text-[10px] font-black text-white uppercase tracking-widest">Obytkem.cz</div>
                  <div className="text-[8px] text-slate-500 font-bold">Půjčovna obytných vozů</div>
                </div>
              </button>
            </div>
          </div>
          <div className="pt-12 border-t border-white/5 text-center">
            <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em]">
              © 2026 PUJCIMEDODAVKY.CZ • MILAN GULA • BRNO
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default VanRentalPreview;
