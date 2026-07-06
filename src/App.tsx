import React, { useState, useEffect, useRef } from 'react';
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
  FileText,
  Car,
  Check,
  Compass,
  Zap,
  ShieldCheck,
  CalendarDays,
  ArrowLeft,
  Globe
} from 'lucide-react';
import HostDashboard from './components/HostDashboard';
import TenantPortal from './components/TenantPortal';
import { decodeContract, getStoredSettings } from './utils/contractUtils';
import { ContractData, ReservationInquiry } from './types';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'landing' | 'admin' | 'tenant'>('landing');
  const [tenantContract, setTenantContract] = useState<Partial<ContractData> | null>(null);
  const [settings, setSettings] = useState(() => getStoredSettings());

  // Reservation form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryStartDate, setInquiryStartDate] = useState('');
  const [inquiryEndDate, setInquiryEndDate] = useState('');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Sync settings when entering viewMode
  useEffect(() => {
    setSettings(getStoredSettings());
  }, [viewMode]);

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

  const handleSendInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryPhone || !inquiryStartDate || !inquiryEndDate) {
      alert('Prosím vyplňte všechna povinná pole označená hvězdičkou.');
      return;
    }

    const newInquiry: ReservationInquiry = {
      id: 'inq_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      name: inquiryName,
      email: inquiryEmail,
      phone: inquiryPhone,
      startDate: inquiryStartDate,
      endDate: inquiryEndDate,
      message: inquiryMessage,
      status: 'pending'
    };

    try {
      const stored = localStorage.getItem('obytkem_inquiries');
      const list = stored ? JSON.parse(stored) : [];
      const updated = [newInquiry, ...list];
      localStorage.setItem('obytkem_inquiries', JSON.stringify(updated));
      
      setInquirySuccess(true);
      // Reset form
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryStartDate('');
      setInquiryEndDate('');
      setInquiryMessage('');
    } catch (err) {
      console.error('Error saving inquiry', err);
      alert('Došlo k chybě při ukládání poptávky. Zkuste to prosím znovu.');
    }
  };

  const scrollToInquiryForm = () => {
    const el = document.getElementById('rezervace-formular');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Live calculation of estimated price
  const calculateEstimate = () => {
    if (!inquiryStartDate || !inquiryEndDate) return null;
    const start = new Date(inquiryStartDate);
    const end = new Date(inquiryEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return null;
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const days = diffDays === 0 ? 1 : diffDays;
    const totalRental = days * settings.dailyPrice;
    const grandTotal = totalRental + settings.cleaningFee;
    return { days, totalRental, grandTotal };
  };

  const estimate = calculateEstimate();

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
            <div className="flex items-center gap-4">
              <a 
                href="https://www.obytkem.cz"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Vrátit se na hlavní web
              </a>
              <button 
                onClick={() => setViewMode('landing')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
              >
                Zpět na web
              </button>
            </div>
          </div>
        </nav>
        
        <main className="flex-grow">
          <HostDashboard onViewContract={handleViewContractInAdmin} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold text-xl">O</div>
              <span className="text-2xl font-display font-bold tracking-tighter text-slate-900">obytkem.cz</span>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a 
                href="https://www.obytkem.cz" 
                className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Vrátit se na hlavní web
              </a>
              <button onClick={scrollToInquiryForm} className="text-sm font-medium text-slate-600 hover:text-primary transition-colors cursor-pointer">
                Náš vůz
              </button>
              <a href="#specifikace" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
                Výbava a parametry
              </a>
              <button 
                onClick={() => setViewMode('admin')}
                className="flex items-center gap-1.5 text-sm font-semibold text-slate-600 hover:text-primary transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4" /> Správa smluv
              </button>
              <button 
                onClick={scrollToInquiryForm}
                className="bg-primary text-white px-6 py-2.5 rounded-full text-sm font-semibold hover:bg-primary/90 transition-all shadow-sm cursor-pointer"
              >
                Poptat rezervaci
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
            className="md:hidden bg-white border-b border-slate-200 absolute top-20 w-full z-40 p-4 space-y-4 shadow-xl text-left"
          >
            <a 
              href="https://www.obytkem.cz"
              className="flex items-center gap-2 text-lg font-bold text-primary py-2 border-b border-slate-100"
            >
              <ArrowLeft className="w-5 h-5" /> Vrátit se na hlavní web
            </a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToInquiryForm();
              }}
              className="block w-full text-left py-2 text-lg font-medium text-slate-900"
            >
              Náš vůz & Rezervace
            </button>
            <a 
              href="#specifikace"
              onClick={() => setIsMenuOpen(false)}
              className="block py-2 text-lg font-medium text-slate-900"
            >
              Výbava a parametry
            </a>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                setViewMode('admin');
              }}
              className="w-full flex justify-start items-center gap-2 text-lg font-semibold text-slate-700 py-2"
            >
              <FileText className="w-5 h-5" /> Správa smluv
            </button>
            <button 
              onClick={() => {
                setIsMenuOpen(false);
                scrollToInquiryForm();
              }}
              className="w-full bg-primary text-white py-4 rounded-xl font-bold"
            >
              Poptat rezervaci
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
            <img 
              src="https://images.unsplash.com/photo-1513313778780-9ae4807465f0?auto=format&fit=crop&q=80&w=2000" 
              alt="Ahorn Canada TU Plus" 
              className="w-full h-full object-cover brightness-50"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 text-center text-white">
            <span className="inline-block bg-accent/25 backdrop-blur-md border border-accent/40 text-accent font-bold px-4 py-1.5 rounded-full text-xs uppercase tracking-widest mb-6">
              EXKLUZIVNÍ PRONÁJEM OBYTNÉHO VOZU
            </span>
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-4xl sm:text-6xl md:text-7xl font-display font-bold mb-6 leading-tight tracking-tight"
            >
              {settings.brand} {settings.model}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-lg sm:text-xl md:text-2xl mb-10 text-slate-100 font-light max-w-2xl mx-auto leading-relaxed"
            >
              Luxusní rodinný obytný vůz s nadstandardní výbavou a prostorem až pro 6 osob. Užijte si svobodu cestování v naprostém komfortu.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="flex flex-col sm:flex-row justify-center gap-4"
            >
              <button 
                onClick={scrollToInquiryForm}
                className="bg-accent hover:bg-accent/95 text-white px-8 py-4 rounded-full font-bold text-base transition-all shadow-lg shadow-accent/20 cursor-pointer"
              >
                Poptat volný termín
              </button>
              <a 
                href="#specifikace"
                className="bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border border-white/30 px-8 py-4 rounded-full font-bold text-base transition-all"
              >
                Více o vozidle
              </a>
            </motion.div>
          </div>
        </section>

        {/* Real-time Availability & Detailed Inquiry Form Section */}
        <section id="rezervace-formular" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Left side: Premium Showcase */}
            <div className="lg:col-span-7 space-y-8">
              <div>
                <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight">
                  Prvotřídní komfort na cestách
                </h2>
                <p className="text-slate-500 mt-4 leading-relaxed text-base sm:text-lg">
                  {settings.brand} {settings.model} je ztělesněním svobody bez kompromisů. Nabízí obrovské množství vnitřního prostoru, oddělené sprchové kouty a WC, nezávislé solární napájení a zadní sezení ve tvaru písmene U, které zaručuje jedinečnou útulnost.
                </p>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=800" 
                    alt="Campervan interior" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-sm border border-slate-100">
                  <img 
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800" 
                    alt="Campervan kitchen" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              </div>

              {/* Badges / Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-xl flex-shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">6 osob</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Jízda i spánek</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-xl flex-shrink-0">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Skupina B</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Stačí r.p. na auto</p>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-start gap-3 col-span-2 sm:col-span-1">
                  <div className="bg-primary/10 text-primary p-2 rounded-xl flex-shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Solár 140W</h4>
                    <p className="text-xs text-slate-500 mt-0.5">Nezávislost na divoko</p>
                  </div>
                </div>
              </div>

              {/* Key terms and price guarantee */}
              <div className="bg-primary/5 rounded-3xl p-6 border border-primary/10 flex gap-4 items-start">
                <ShieldCheck className="w-6 h-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Vše v základní ceně a bez skrytých poplatků</h4>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    U nás neplatíte za zapůjčení kempingového nábytku, nádobí ani za druhou plynovou láhev. V ceně je také havarijní pojištění pro celou Evropu a dálniční známka pro ČR. Chceme, aby pro vás byl pronájem co nejjednodušší!
                  </p>
                </div>
              </div>
            </div>

            {/* Right side: Interactive Non-binding Inquiry Card */}
            <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <div>
                <span className="text-xs font-bold text-accent uppercase tracking-wider block mb-1">Rezervační systém</span>
                <h3 className="text-2xl font-bold text-slate-900">Nezávazná poptávka</h3>
                <p className="text-xs text-slate-500 mt-1">Vyberte si termín, vyplňte údaje a my se vám obratem ozveme s potvrzením a návrhem smlouvy.</p>
              </div>

              {inquirySuccess ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-green-50/50 border border-green-200/80 rounded-2xl p-6 text-center space-y-4"
                >
                  <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-green-900">Poptávka úspěšně odeslána!</h4>
                    <p className="text-xs text-green-700 mt-1.5 leading-relaxed">
                      Děkujeme za váš zájem o vůz {settings.brand} {settings.model}. Vaši poptávku jsme bezpečně zaznamenali a ihned se jí budeme věnovat. Brzy vás kontaktujeme s dalším postupem a odkazem na zjednodušený podpis smlouvy.
                    </p>
                  </div>
                  <button 
                    onClick={() => setInquirySuccess(false)}
                    className="text-xs font-bold text-green-700 underline cursor-pointer"
                  >
                    Odeslat další poptávku
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-4">
                  {/* Step 1: Dates */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Od *</label>
                      <input 
                        type="date" 
                        required
                        value={inquiryStartDate}
                        min={new Date().toISOString().split('T')[0]}
                        onChange={e => setInquiryStartDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Do *</label>
                      <input 
                        type="date" 
                        required
                        value={inquiryEndDate}
                        min={inquiryStartDate || new Date().toISOString().split('T')[0]}
                        onChange={e => setInquiryEndDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Step 2: Contact Information */}
                  <div className="space-y-3 pt-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Jméno a příjmení *</label>
                      <input 
                        type="text" 
                        required
                        value={inquiryName}
                        onChange={e => setInquiryName(e.target.value)}
                        placeholder="Jan Novák" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Telefon *</label>
                        <input 
                          type="tel" 
                          required
                          value={inquiryPhone}
                          onChange={e => setInquiryPhone(e.target.value)}
                          placeholder="+420 777 123 456" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">E-mail *</label>
                        <input 
                          type="email" 
                          required
                          value={inquiryEmail}
                          onChange={e => setInquiryEmail(e.target.value)}
                          placeholder="jan.novak@seznam.cz" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Vaše zpráva / doplňující otázky</label>
                      <textarea 
                        rows={2}
                        value={inquiryMessage}
                        onChange={e => setInquiryMessage(e.target.value)}
                        placeholder="Máte zájem o doplňkovou výbavu, nebo jedete se psem? Napište nám..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all resize-none"
                      />
                    </div>
                  </div>

                  {/* Pricing Breakdown Live Indicator */}
                  {estimate && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mt-4 space-y-2 text-xs"
                    >
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Počet dní pronájmu:</span>
                        <span>{estimate.days}x</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium">
                        <span>Sazba za den ({settings.dailyPrice.toLocaleString('cs-CZ')} Kč):</span>
                        <span>{estimate.totalRental.toLocaleString('cs-CZ')} Kč</span>
                      </div>
                      <div className="flex justify-between text-slate-600 font-medium pb-2 border-b border-slate-200/60">
                        <span>Servisní poplatek (úklid):</span>
                        <span>{settings.cleaningFee.toLocaleString('cs-CZ')} Kč</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold text-sm pt-1">
                        <span>Odhadovaná cena nájemného:</span>
                        <span className="text-primary">{estimate.grandTotal.toLocaleString('cs-CZ')} Kč</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[10px] italic mt-1 pt-1 border-t border-dashed border-slate-200">
                        <span>Vratná kauce (skládá se při převzetí):</span>
                        <span>{settings.deposit.toLocaleString('cs-CZ')} Kč</span>
                      </div>
                    </motion.div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-primary/95 text-white py-4 rounded-xl font-bold text-sm shadow-md shadow-primary/10 transition-all cursor-pointer mt-2"
                  >
                    Odeslat nezávaznou poptávku
                  </button>
                </form>
              )}

              <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                * Odesláním poptávky vyjadřujete souhlas se zpracováním osobních údajů pro účely vyřízení této rezervace. Poptávka je zcela nezávazná.
              </div>
            </div>

          </div>
        </section>

        {/* Technical Specification Section */}
        <section id="specifikace" className="py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-bold text-primary uppercase tracking-widest block mb-2">VŠECHNY PARAMETRY A ROZMĚRY</span>
              <h2 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight">Technická specifikace vozidla</h2>
              <p className="text-slate-500 mt-4 leading-relaxed text-base">
                Připravili jsme pro vás kompletní soupis specifikací a vybavení, abyste přesně věděli, do jaké obytné limuzíny nasedáte.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Box 1: Technické údaje */}
              <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/60">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Car className="text-primary w-5 h-5" /> Motor a podvozek
                </h3>
                <dl className="space-y-4 divide-y divide-slate-200/60 text-sm">
                  {[
                    { label: "Model vozu", value: `${settings.brand} ${settings.model} (Polointegrovaný / Alkovna)` },
                    { label: "Základní podvozek", value: "Renault Master dCi 145" },
                    { label: "Výkon motoru", value: "107 kW / 145 HP (Euro 6d)" },
                    { label: "Převodovka", value: "Manuální, 6 rychlostí" },
                    { label: "Hmotnostní limit", value: "Do 3500 kg (stačí řidičský průkaz sk. B)" },
                    { label: "Celková délka / šířka / výška", value: "7.43 m / 2.34 m / 3.06 m" },
                    { label: "Registrační značka (SPZ)", value: settings.plateNumber }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3">
                      <dt className="text-slate-500 font-medium">{item.label}</dt>
                      <dd className="text-slate-900 font-semibold text-right">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {/* Box 2: Komfortní vybavení */}
              <div className="bg-slate-50 rounded-3xl p-6 sm:p-8 border border-slate-200/60">
                <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                  <Compass className="text-primary w-5 h-5" /> Vybavení nástavby a pohodlí
                </h3>
                <dl className="space-y-4 divide-y divide-slate-200/60 text-sm">
                  {[
                    { label: "Počet míst (jízda / spaní)", value: "6 míst / 6 míst" },
                    { label: "Klimatizace", value: "Kabinová při jízdě" },
                    { label: "Vytápění a ohřev vody", value: "Truma Combi 4 Gas s digitálním panelem" },
                    { label: "Koupelna", value: "Oddělená sprcha a samostatné splachovací WC" },
                    { label: "Kuchyňská výbava", value: "Plynový vařič s 3 hořáky, dřez, 141l chladnička s mrazákem" },
                    { label: "Energetické napájení", value: "Nástavbová baterie + solární panel 140W" },
                    { label: "Další výbava v ceně", value: "Markýza, parkovací kamera, nosič na 4 kola" }
                  ].map((item, idx) => (
                    <div key={idx} className="flex justify-between py-3">
                      <dt className="text-slate-500 font-medium">{item.label}</dt>
                      <dd className="text-slate-900 font-semibold text-right">{item.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
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
                <h2 className="text-4xl md:text-6xl mb-8 leading-tight">Proč vyrazit právě s námi?</h2>
                <div className="space-y-6">
                  {[
                    { title: "Perfektní technický stav", desc: "Náš vůz Ahorn Canada TU Plus prochází důkladným servisem a čištěním po každém pronájmu." },
                    { title: "Kompletní výbava v ceně", desc: "Nádobí, kempingový nábytek i veškeré příslušenství jsou součástí ceny. Neplatíte nic navíc." },
                    { title: "Zákaznická podpora 24/7", desc: "Ať se na cestě stane cokoliv, jsme vám k dispozici na telefonu. Poradíme i s obsluhou." },
                    { title: "Kompletní pojištění bez starostí", desc: "Havarijní pojištění pro celou Evropu s nízkou spoluúčastí a asistenčními službami." }
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
              <h2 className="text-4xl md:text-6xl mb-6">Připraveni vyrazit za dobrodružstvím?</h2>
              <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto">
                Rezervujte si svůj termín ve vozu {settings.brand} {settings.model} ještě dnes a začněte plánovat nezapomenutelnou cestu.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <button 
                  onClick={scrollToInquiryForm}
                  className="w-full sm:w-auto bg-primary text-white px-10 py-5 rounded-full font-bold text-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 cursor-pointer"
                >
                  Nezávazná poptávka termínu
                </button>
                <button 
                  onClick={() => setViewMode('admin')}
                  className="w-full sm:w-auto bg-white border-2 border-slate-200 text-slate-900 px-10 py-5 rounded-full font-bold text-lg hover:border-primary transition-all cursor-pointer"
                >
                  Správa smluv
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
                Vaše brána do světa svobody a dobrodružství. Nabízíme prémiový obytný vůz {settings.brand} {settings.model} pro ty nejkrásnější cestovatelské zážitky.
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
                <li><a href="https://www.obytkem.cz" className="hover:text-white text-primary font-semibold transition-colors flex items-center gap-1.5"><ArrowLeft className="w-4 h-4" /> Vrátit se na hlavní web</a></li>
                <li><button onClick={scrollToInquiryForm} className="hover:text-white transition-colors cursor-pointer">Poptávka rezervace</button></li>
                <li><a href="#specifikace" className="hover:text-white transition-colors">Výbava a parametry</a></li>
                <li><button onClick={() => setViewMode('admin')} className="hover:text-white transition-colors cursor-pointer">Administrace smluv</button></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Kontakt</h4>
              <ul className="space-y-4 text-slate-400">
                <li className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-accent" />
                  <span>{settings.ownerPhone || "+420 777 123 456"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-accent" />
                  <span>{settings.ownerEmail || "info@obytkem.cz"}</span>
                </li>
                <li className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent" />
                  <span>{settings.ownerAddress || "Praha, Česká republika"}</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-bold mb-6">Newsletter</h4>
              <p className="text-slate-400 mb-4">Odebírejte novinky a tipy na cesty obytňákem.</p>
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
