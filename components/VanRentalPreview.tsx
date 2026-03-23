
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

const VanRentalPreview: React.FC<VanRentalPreviewProps> = ({ onBack }) => {
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

  const fleet = [
    {
      name: "Renault Master L3H2",
      specs: "2.3 dCi • 13 m³ • 3.5t",
      price: "od 800 Kč",
      image: "https://images.unsplash.com/photo-1519003722824-194d4455a60c?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Fiat Ducato Maxi",
      specs: "2.3 JTD • 17 m³ • 3.5t",
      price: "od 1 200 Kč",
      image: "https://images.unsplash.com/photo-1606206591513-adbf9762965a?q=80&w=800&auto=format&fit=crop"
    },
    {
      name: "Opel Movano",
      specs: "2.3 CDTi • 11 m³ • 3.5t",
      price: "od 900 Kč",
      image: "https://images.unsplash.com/photo-1549194388-2469d59ec75c?q=80&w=800&auto=format&fit=crop"
    }
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 overflow-x-hidden">
      {/* Navigation Preview */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black">PD</div>
            <span className="font-black text-xl tracking-tight uppercase">PůjčímeDodávky.cz</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="text-slate-900">Vozový park</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Ceník</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Podmínky</a>
            <a href="#" className="hover:text-slate-900 transition-colors">Kontakt</a>
          </div>
          <button onClick={onBack} className="px-5 py-2.5 bg-orange-50 text-orange-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-100 transition-all">
            Zpět na Obytkem
          </button>
        </div>
      </nav>

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
              <button className="px-10 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-2xl shadow-slate-200 hover:bg-orange-600 transition-all flex items-center gap-3">
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
              <button className="px-10 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-900/20">
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

      {/* Fleet Section */}
      <section className="py-32 px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-8 mb-20">
            <div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Náš vozový park</h2>
              <p className="text-slate-500 font-medium text-lg">Prověřené značky s výkonnými motory a velkým prostorem.</p>
            </div>
            <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-colors flex items-center gap-2">
              Zobrazit kompletní ceník <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {fleet.map((car, i) => (
              <div key={i} className="bg-white rounded-[3rem] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all group">
                <div className="h-64 overflow-hidden">
                  <img 
                    src={car.image} 
                    alt={car.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-10">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-2xl font-black tracking-tight">{car.name}</h3>
                    <div className="text-orange-600 font-black">{car.price}</div>
                  </div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">{car.specs}</p>
                  <button className="w-full py-4 bg-slate-50 hover:bg-slate-900 hover:text-white rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all">
                    Rezervovat tento vůz
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">Co o nás říkají klienti</h2>
            <div className="flex justify-center gap-1">
              {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-orange-400 fill-orange-400" />)}
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Veronika Z.", text: "Vše naprosto v pořádku, rychlá komunikace, pán velmi ochotný, super domluva. Auto čisté a v dobrém stavu. Určitě doporučuji!" },
              { name: "Kamil K.", text: "Vše probíhalo hladce, rychle a spolehlivě. Dodávka je ve skvělém stavu, dovezená majitelem přímo před dům. Velmi příjemné jednání." },
              { name: "Alena D.", text: "Rychlé jednání, v pátek jsem objednala, v sobotu mi dodávku dovezli až před dům. Auto ve skvělém stavu, motoricky jako nové." }
            ].map((rev, i) => (
              <div key={i} className="p-10 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm italic">
                <p className="text-slate-600 leading-relaxed mb-8">"{rev.text}"</p>
                <div className="text-[10px] font-black text-slate-900 uppercase tracking-widest">— {rev.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer className="bg-slate-900 text-white py-20 px-6">
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
                <li><a href="#" className="hover:text-white transition-colors">Vozový park</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Ceník a podmínky</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Stěhování Brno</a></li>
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
