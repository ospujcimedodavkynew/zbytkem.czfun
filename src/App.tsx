import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Menu, 
  X, 
  MapPin, 
  Calendar as CalendarIcon, 
  Users, 
  ChevronRight, 
  Star, 
  CheckCircle2,
  Instagram,
  Facebook,
  Twitter,
  Phone,
  Mail,
  ArrowRight,
  FileText
} from 'lucide-react';
import HostDashboard from './components/HostDashboard';
import TenantPortal from './components/TenantPortal';
import { decodeContract } from './utils/contractUtils';
import { ContractData } from './types';

// Mock data for campervans
const CAMPERVANS = [
  {
    id: 1,
    name: "VW California Ocean",
    type: "Kompaktní",
    price: "2 500 Kč",
    rating: 4.9,
    reviews: 124,
    image: "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800",
    features: ["4 místa", "Kuchyňka", "Nezávislé topení"]
  },
  {
    id: 2,
    name: "Mercedes Marco Polo",
    type: "Luxusní",
    price: "3 200 Kč",
    rating: 4.8,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1513313778780-9ae4807465f0?auto=format&fit=crop&q=80&w=800",
    features: ["4 místa", "Automat", "Solární panely"]
  },
  {
    id: 3,
    name: "Fiat Ducato Sunlight",
    type: "Rodinný",
    price: "2 800 Kč",
    rating: 4.7,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&q=80&w=800",
    features: ["6 míst", "Koupelna", "Velká garáž"]
  }
];

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'admin' | 'tenant'>('landing');
  const [tenantContract, setTenantContract] = useState<Partial<ContractData> | null>(null);

  // Check URL parameters on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contractParam = params.get('contract');
    if (contractParam) {
      const decoded = decodeContract(contractParam);
      if (decoded) {
        setTenantContract(decoded);
        setViewMode('tenant');
      }
    }
  }, []);

  const handleViewContractInAdmin = (contract: ContractData) => {
    setTenantContract(contract);
    setViewMode('tenant');
  };

  // If we are in the standalone Tenant Portal, render it directly without landing page wrappers
  if (viewMode === 'tenant' && tenantContract) {
    return (
      <div className="bg-paper min-h-screen">
        <TenantPortal 
          initialContract={tenantContract} 
          onBackToMain={() => {
            // Remove ?contract=... parameter from URL to allow clean back navigation
            window.history.pushState({}, '', window.location.pathname);
            setViewMode('landing');
            setTenantContract(null);
          }} 
        />
      </div>
    );
  }

  // If we are in the Host Administration, render the dashboard
  if (viewMode === 'admin') {
    return (
      <div className="bg-paper min-h-screen flex flex-col">
        {/* Simple Back Navigation Header */}
        <nav className="bg-white border-b border-slate-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">O</div>
              <span className="font-display font-bold tracking-tighter text-slate-900">obytkem.cz</span>
            </div>
            <button 
              onClick={() => setViewMode('landing')}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
            >
              Zpět na web
            </button>
          </div>
        </nav>
        
        <main className="flex-grow">
          <HostDashboard onViewContract={handleViewContractInAdmin} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-paper/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">O</div>
              <span className="text-2xl font-display font-bold tracking-tighter text-slate-900">obytkem.cz</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Naše vozy</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Jak to funguje</a>
              <a href="#" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">Inspirace</a>
              <button 
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <FileText className="w-4 h-4" /> Správa smluv
              </button>
              <button 
                onClick={() => setViewMode('admin')}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm"
              >
                Rezervovat nyní
              </button>
            </div>

            <button 
              className="md:hidden p-2 text-slate-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden bg-paper border-b border-slate-200 absolute top-20 w-full z-40 p-4 space-y-4 shadow-xl"
          >
            <a href="#" className="block py-2 text-lg font-medium text-slate-900">Naše vozy</a>
            <a href="#" className="block py-2 text-lg font-medium text-slate-900">Jak to funguje</a>
            <a href="#" className="block py-2 text-lg font-medium text-slate-900">Inspirace</a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                setViewMode('admin');
              }}
              className="w-full flex justify-center items-center gap-2 text-lg font-semibold text-primary py-2"
            >
              <FileText className="w-5 h-5" /> Správa smluv
            </button>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                setViewMode('admin');
              }}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold"
            >
              Rezervovat nyní
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=2070" 
              alt="Campervan in nature" 
              className="w-full h-full object-cover brightness-75"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight"
            >
              Svoboda na čtyřech kolech
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl md:text-2xl mb-12 text-slate-100 font-light max-w-2xl mx-auto"
            >
              Pronajměte si moderní obytný vůz a vydejte se na cestu, o které jste vždy snili.
            </motion.p>

            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-white/10 backdrop-blur-xl p-2 rounded-2xl md:rounded-full border border-white/20 shadow-2xl max-w-3xl mx-auto"
            >
              <div className="flex flex-col md:flex-row items-center gap-2">
                <div className="flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-white/10">
                  <MapPin className="text-accent w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-white/60">Místo vyzvednutí</p>
                    <input type="text" placeholder="Kde začnete?" className="bg-transparent border-none p-0 focus:ring-0 text-white placeholder:text-white/40 w-full" />
                  </div>
                </div>
                <div className="flex-1 w-full flex items-center gap-3 px-6 py-3 border-b md:border-b-0 md:border-r border-white/10">
                  <CalendarIcon className="text-accent w-5 h-5 flex-shrink-0" />
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider font-bold text-white/60">Termín</p>
                    <input type="text" placeholder="Kdy vyrazíte?" className="bg-transparent border-none p-0 focus:ring-0 text-white placeholder:text-white/40 w-full" />
                  </div>
                </div>
                <button 
                  onClick={() => setViewMode('admin')}
                  className="w-full md:w-auto bg-accent text-white px-10 py-4 rounded-full font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2"
                >
                  <Search className="w-5 h-5" />
                  Hledat
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured Fleet */}
        <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div>
              <h2 className="text-4xl md:text-5xl mb-4">Naše flotila</h2>
              <p className="text-slate-500 max-w-xl">Vyberte si z našich pečlivě udržovaných vozů, které jsou připraveny na vaše další dobrodružství.</p>
            </div>
            <button 
              onClick={() => setViewMode('admin')}
              className="group flex items-center gap-2 text-primary font-bold"
            >
              Zobrazit vše <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {CAMPERVANS.map((van, idx) => (
              <motion.div 
                key={van.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-slate-100"
              >
                <div className="aspect-[4/3] overflow-hidden relative">
                  <img 
                    src={van.image} 
                    alt={van.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-primary uppercase tracking-wider">
                    {van.type}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl mb-1">{van.name}</h3>
                      <div className="flex items-center gap-1 text-sm text-slate-500">
                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                        <span className="font-bold text-slate-900">{van.rating}</span>
                        <span>({van.reviews} recenzí)</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary">{van.price}</p>
                      <p className="text-xs text-slate-400">za den</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    {van.features.map(feature => (
                      <span key={feature} className="text-[10px] bg-slate-50 text-slate-600 px-2 py-1 rounded-md font-medium uppercase tracking-wide">
                        {feature}
                      </span>
                    ))}
                  </div>

                  <button 
                    onClick={() => setViewMode('admin')}
                    className="w-full py-3 border-2 border-slate-100 rounded-xl font-bold text-slate-900 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all"
                  >
                    Detail vozu
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Why Us */}
        <section className="bg-primary py-24 text-white overflow-hidden relative">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-10 pointer-events-none">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              <path fill="#FFFFFF" d="M44.7,-76.4C58.1,-69.2,69.2,-58.1,76.4,-44.7C83.6,-31.3,86.9,-15.7,85.5,-0.8C84.1,14.1,78.1,28.2,69.5,40.4C60.9,52.6,49.8,62.9,36.9,70.5C24,78.1,9.4,83,-5.4,81.3C-20.2,79.6,-35.1,71.2,-47.8,60.4C-60.5,49.6,-71,36.4,-77.2,21.3C-83.4,6.2,-85.3,-10.8,-80.4,-25.9C-75.5,-41,-63.8,-54.2,-50.1,-61.3C-36.4,-68.4,-20.7,-69.4,-4.8,-71.2C11.1,-73,22.2,-75.6,33.4,-76.4C44.7,-77.2,56.1,-76.2,44.7,-76.4Z" transform="translate(100 100)" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-6xl mb-8 leading-tight">Proč si vybrat právě nás?</h2>
                <div className="space-y-6">
                  {[
                    { title: "Nové a spolehlivé vozy", desc: "Naše flotila se skládá pouze z moderních vozů v perfektním technickém stavu." },
                    { title: "Kompletní výbava v ceně", desc: "Nádobí, kempingový nábytek i lůžkoviny. Stačí si jen sbalit osobní věci." },
                    { title: "Podpora 24/7 na cestách", desc: "Ať se stane cokoliv, jsme vám k dispozici na telefonu po celou dobu vaší cesty." },
                    { title: "Pojištění bez starostí", desc: "Všechny naše vozy mají havarijní pojištění pro celou Evropu s nízkou spoluúčastí." }
                  ].map((item, idx) => (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-accent" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold mb-1">{item.title}</h3>
                        <p className="text-white/70">{item.desc}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-3">
                  <img 
                    src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1000" 
                    alt="Happy campers" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute -bottom-8 -left-8 bg-accent p-8 rounded-3xl shadow-xl -rotate-3 hidden md:block">
                  <p className="text-4xl font-bold mb-1">100%</p>
                  <p className="text-sm font-medium uppercase tracking-widest opacity-80">Spokojených klientů</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 bg-paper">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <div className="bg-white p-12 md:p-20 rounded-[40px] shadow-sm border border-slate-100">
              <h2 className="text-4xl md:text-6xl mb-6">Připraveni vyrazit?</h2>
              <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
                Rezervujte si svůj termín ještě dnes a začněte plánovat svou nezapomenutelnou cestu.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={() => setViewMode('admin')}
                  className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
                >
                  Rezervovat vůz
                </button>
                <button 
                  onClick={() => setViewMode('admin')}
                  className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-full font-bold text-lg hover:border-primary transition-all"
                >
                  Kontaktujte nás
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold text-lg">O</div>
                <span className="text-xl font-display font-bold tracking-tighter">obytkem.cz</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Vaše brána do světa svobody a dobrodružství. Nabízíme prémiové obytné vozy pro nezapomenutelné zážitky.
              </p>
              <div className="flex gap-4">
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-white/5 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Rychlé odkazy</h4>
              <ul className="space-y-4 text-slate-400">
                <li><button onClick={() => setViewMode('admin')} className="hover:text-white transition-colors">Naše flotila</button></li>
                <li><button onClick={() => setViewMode('admin')} className="hover:text-white transition-colors">Ceník pronájmu</button></li>
                <li><button onClick={() => setViewMode('admin')} className="hover:text-white transition-colors">Obchodní podmínky</button></li>
                <li><button onClick={() => setViewMode('admin')} className="hover:text-white transition-colors">Často kladené dotazy</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Kontakt</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent" />
                  <span>+420 777 123 456</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <span>info@obytkem.cz</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>Pražská 123, 100 00 Praha</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Newsletter</h4>
              <p className="text-slate-400 mb-4">Odebírejte novinky a tipy na cesty.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Váš e-mail" 
                  className="bg-white/5 border-none rounded-lg px-4 py-2 w-full focus:ring-1 focus:ring-primary"
                />
                <button className="bg-primary p-2 rounded-lg hover:bg-primary/90 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="pt-10 border-t border-white/5 text-center text-slate-500 text-sm">
            <p>© {new Date().getFullYear()} obytkem.cz. Všechna práva vyhrazena.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
