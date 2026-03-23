
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
  Zap
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
      tagline: "Malá dodávka, skvělé ovládání.",
      prices: { h4: "800 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "3 EURO palety",
        motor: "2.3 CDTI 74kw Renault",
        volume: "8 m³",
        load: "1080 kg",
        license: "sk. B",
        consumption: "8-10 Litrů",
        seats: "3",
        euro: "5"
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
        consumption: "8-10 Litrů",
        seats: "3",
        euro: "5"
      },
      image: "https://images.unsplash.com/photo-1606206591513-adbf9762965a?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano L3H3",
      tagline: "Velká dodávka, parkovací senzory, asistent rozjezdu do kopce.",
      prices: { h4: "900 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDI 92 Kw",
        volume: "16 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "8-10 Litrů",
        seats: "3",
        euro: "5"
      },
      image: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Renault Master 2022 L2H2",
      tagline: "Klimatizace, parkovací senzory, vyhřívané sedadlo, parkovací kamera, Bluetooth, dřevěná podlaha.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "4 EURO palety",
        motor: "2.3 CDTI 100 KW",
        volume: "11 m³",
        load: "1080 kg",
        license: "sk. B",
        consumption: "7-8 Litrů",
        seats: "3",
        euro: "6"
      },
      image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Fiat Ducato L2H2",
      tagline: "Dřevěná podlaha, výkonný motor.",
      prices: { h4: "800 Kč", h12: "1 300 Kč" },
      specs: {
        pallets: "4 EURO palety",
        motor: "2.3 JTD 96kw IVECO",
        volume: "11 m³",
        load: "1080 kg",
        license: "sk. B",
        consumption: "8-9 litrů",
        seats: "3",
        euro: "5"
      },
      image: "https://images.unsplash.com/photo-1580674684081-7617fbf3d745?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano 2021",
      tagline: "Klimatizace, Tempomat, Navigace, Apple car.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDI 100 Kw",
        volume: "14 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "8-10 Litrů",
        seats: "3",
        euro: "6"
      },
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Renault Master L4H3 MAXI",
      tagline: "Klimatizace, Tempomat, Handsfree, Parkovací kamera, Bluetooth, asistent rozjezdu.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "5 EURO palet",
        motor: "2.3 CDTI 107 kw Renault zadní náhon",
        volume: "17 m³",
        load: "1300 kg",
        license: "sk. B",
        consumption: "10-13 Litrů",
        seats: "3",
        euro: "5"
      },
      image: "https://images.unsplash.com/photo-1606206591513-adbf9762965a?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano L2H2 2021",
      tagline: "Dřevěná podlaha, Klimatizace, Tempomat, Apple car play, navigace.",
      prices: { h4: "900 Kč", h12: "1 400 Kč" },
      specs: {
        pallets: "4 EURO palety",
        motor: "2.3 CDTI 92 KW",
        volume: "11 m³",
        load: "1100 kg",
        license: "sk. B",
        consumption: "9-10 Litrů",
        seats: "3",
        euro: "-"
      },
      image: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?q=80&w=800&auto=format&fit=crop"
    }
  ];

  const renderHome = () => (
    <>
      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-full border border-orange-100">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Půjčovna dodávek Brno</span>
            </div>
            <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9]">
              VAŠE PRÁCE <br/>
              <span className="text-slate-400">NEPOČKÁ.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium max-w-lg leading-relaxed">
              Spolehlivé užitkové vozy Renault Master a Fiat Ducato. Půjčení již od 4 hodin, nonstop servis a dálniční známka v ceně.
            </p>
            <div className="flex flex-wrap gap-4">
              <button onClick={() => setCurrentView('fleet')} className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 hover:bg-orange-600 transition-all flex items-center gap-3">
                Rezervovat online
                <ArrowRight className="w-4 h-4" />
              </button>
              <a href="tel:776333301" className="px-10 py-5 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:border-slate-900 transition-all flex items-center gap-3">
                <Phone className="w-4 h-4" />
                776 333 301
              </a>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-10 bg-orange-100 rounded-[4rem] blur-3xl -z-10 opacity-50" />
            <img 
              src="https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=1200&auto=format&fit=crop" 
              alt="Dodávka Renault Master" 
              className="rounded-[3rem] shadow-premium rotate-2 hover:rotate-0 transition-transform duration-700"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 border-y border-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Půjčení od", val: "4 hodin" },
              { label: "Cena od", val: "800 Kč" },
              { label: "Dostupnost", val: "Nonstop" },
              { label: "Pojištění", val: "V ceně" }
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
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Proč si půjčit dodávku <br/>právě od nás?</h2>
            <p className="text-slate-500 font-medium text-lg">Zákazník je pro nás na prvním místě. Děláme maximum pro vaši spokojenost.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-black mb-4">{benefit.title}</h3>
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
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Stěhujete se? <br/>
                <span className="text-orange-500">Bude to hračka.</span>
              </h2>
              <div className="space-y-6">
                <p className="text-slate-400 text-lg font-medium leading-relaxed">
                  Naše vozy mají v nákladním prostoru dřevěnou podlahu s kobercem. Váš majetek bude jako v bavlnce.
                </p>
                <ul className="grid gap-4">
                  {[
                    "Zdarma zapůjčíme rudl a popruhy",
                    "Přistavení před dům po Brně za 200 Kč",
                    "Žádné zbytečné otáčení s osobákem",
                    "Všechny vozy s dálniční známkou"
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
                alt="Stěhování dodávkou" 
                className="absolute inset-0 w-full h-full object-cover opacity-80"
                referrerPolicy="no-referrer"
              />
            </div>
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
            <span className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Náš vozový park</span>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">Vozový park <br/><span className="text-slate-400 text-4xl md:text-6xl">půjčovny dodávek Brno</span></h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {[
              "Dlouhodobé zapůjčení za výhodnou cenu",
              "Interaktivní rezervační systém",
              "300 Km nájezd v ceně (další 3 Kč/km)",
              "Perfektní technický stav",
              "Nejsme plátci DPH - ceny jsou konečné",
              "Přistavení po Brně za 200 Kč"
            ].map((benefit, i) => (
              <div key={i} className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                <span className="text-xs font-bold text-slate-700">{benefit}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-12">
          {fleetData.map((van, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              key={i} 
              className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all flex flex-col lg:grid lg:grid-cols-12"
            >
              <div className="lg:col-span-5 h-80 lg:h-auto relative overflow-hidden group">
                <img 
                  src={van.image} 
                  alt={van.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                  {van.name.includes('MAXI') ? 'Největší v nabídce' : 'Skladem v Brně'}
                </div>
              </div>
              <div className="lg:col-span-7 p-8 md:p-12 space-y-8">
                <div>
                  <h3 className="text-3xl font-black tracking-tight mb-2">{van.name}</h3>
                  <p className="text-slate-500 font-medium">{van.tagline}</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Objem</div>
                    <div className="text-sm font-black">{van.specs.volume}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Palety</div>
                    <div className="text-sm font-black">{van.specs.pallets}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Zatížení</div>
                    <div className="text-sm font-black">{van.specs.load}</div>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Řidičák</div>
                    <div className="text-sm font-black">{van.specs.license}</div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-8 py-6 border-y border-slate-50">
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">4 hodiny</div>
                    <div className="text-xl font-black text-orange-600">{van.prices.h4}</div>
                  </div>
                  <div>
                    <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">12 hodin</div>
                    <div className="text-xl font-black text-orange-600">{van.prices.h12}</div>
                  </div>
                  <div className="ml-auto flex gap-2">
                    <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-lg text-[9px] font-black uppercase tracking-widest">Euro {van.specs.euro}</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[9px] font-black uppercase tracking-widest">{van.specs.seats} místa</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-orange-600 transition-all flex items-center gap-2">
                    Online rezervace <ArrowRight className="w-4 h-4" />
                  </button>
                  <button className="px-8 py-4 bg-white border-2 border-slate-100 text-slate-900 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-slate-900 transition-all">
                    Detailní parametry
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
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-5xl font-black tracking-tight mb-8 text-slate-900">Ceník pronájmu</h2>
        <p className="text-slate-500 font-medium text-lg mb-16">Transparentní ceny bez skrytých poplatků. Nejsme plátci DPH.</p>
        
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
      <div className="max-w-4xl mx-auto">
        <h2 className="text-5xl font-black tracking-tight mb-12 text-slate-900">Podmínky zapůjčení</h2>
        
        <div className="space-y-8">
          {[
            {
              title: "Doklady potřebné k zapůjčení",
              content: "Fyzické osoby: Občanský průkaz a řidičský průkaz sk. B (platný min. 2 roky). Firmy: Výpis z OR nebo Živnostenský list, plná moc (pokud nepřebírá jednatel)."
            },
            {
              title: "Platba a kauce",
              content: "Při převzetí vozu se skládá vratná kauce ve výši 5 000 Kč. Nájemné se hradí předem při převzetí vozidla. Přijímáme platby v hotovosti i převodem."
            },
            {
              title: "Pojištění a asistence",
              content: "Všechny naše vozy mají kompletní havarijní pojištění se spoluúčastí 10% (min. 10 000 Kč). Součástí jsou nonstop asistenční služby pro případ poruchy nebo nehody."
            },
            {
              title: "Vrácení vozidla",
              content: "Vozidlo se vrací s plnou nádrží (tak, jak bylo předáno) a v přiměřeně čistém stavu. Předání i vrácení probíhá na adrese Teslova, Brno, pokud není domluveno jinak."
            }
          ].map((term, i) => (
            <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
              <h3 className="text-xl font-black mb-4 flex items-center gap-3">
                <span className="w-8 h-8 bg-slate-900 text-white rounded-lg flex items-center justify-center text-xs">{i+1}</span>
                {term.title}
              </h3>
              <p className="text-slate-500 font-medium leading-relaxed">{term.content}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 p-12 bg-slate-900 rounded-[3rem] text-center text-white">
          <Info className="w-12 h-12 text-orange-500 mx-auto mb-6" />
          <h4 className="text-2xl font-black mb-4">Máte další dotazy?</h4>
          <p className="text-slate-400 font-medium mb-8">Neváhejte nám zavolat, rádi vám vše vysvětlíme.</p>
          <a href="tel:776333301" className="text-3xl font-black text-orange-500 hover:text-orange-400 transition-colors tracking-tight">776 333 301</a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
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
