import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calendar as CalendarIcon, 
  Users, 
  Check,
  FileText,
  Car,
  Zap,
  ShieldCheck,
  ArrowLeft,
  Settings,
  Mail,
  Phone,
  ArrowRight,
  Info
} from 'lucide-react';
import HostDashboard from './components/HostDashboard';
import TenantPortal from './components/TenantPortal';
import Logo from './components/Logo';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import { decodeContract, getStoredSettings } from './utils/contractUtils';
import { dbService, isSupabaseConfigured } from './lib/supabase';
import { ContractData, ReservationInquiry } from './types';

export default function App() {
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
    dbService.getSettings().then(res => setSettings(res));
  }, [viewMode]);

  // Check URL parameters on mount to support contract signatures directly via links
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const contractParam = params.get('contract');
    const idParam = params.get('id') || params.get('contractId');

    if (contractParam) {
      const decoded = decodeContract(contractParam);
      if (decoded) {
        setTenantContract(decoded);
        setViewMode('tenant');
      }
    } else if (idParam) {
      dbService.getContract(idParam).then(contract => {
        if (contract) {
          setTenantContract(contract);
          setViewMode('tenant');
        } else {
          alert('Smlouva s tímto ID nebyla v databázi nalezena.');
        }
      });
    }
  }, []);

  const handleViewContractInAdmin = (contract: ContractData) => {
    setTenantContract(contract);
    setViewMode('tenant');
  };

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inquiryName || !inquiryEmail || !inquiryPhone || !inquiryStartDate || !inquiryEndDate) {
      alert('Prosím vyplňte všechna povinná pole označená hvězdičkou.');
      return;
    }

    const newInquiry: Partial<ReservationInquiry> = {
      name: inquiryName,
      email: inquiryEmail,
      phone: inquiryPhone,
      startDate: inquiryStartDate,
      endDate: inquiryEndDate,
      message: inquiryMessage,
      status: 'pending'
    };

    try {
      await dbService.saveInquiry(newInquiry);
      
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

  // If we are in the standalone Tenant Portal, render it directly
  if (viewMode === 'tenant' && tenantContract) {
    return (
      <div className="bg-paper min-h-screen">
        <TenantPortal 
          initialContract={tenantContract} 
          onBackToMain={() => {
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
            <Logo className="w-8 h-8" />
            <div className="flex items-center gap-4">
              <a 
                href="https://www.obytkem.cz"
                className="text-xs font-semibold text-primary hover:text-primary/80 transition-all flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Vrátit se na hlavní web obytkem.cz
              </a>
              <button 
                onClick={() => setViewMode('landing')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
              >
                Zpět k poptávce
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
    <div className="min-h-screen flex flex-col bg-paper">
      {/* Navigation Header */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <Logo className="w-10 h-10" />
            
            <div className="flex items-center gap-4">
              <a 
                href="https://www.obytkem.cz" 
                className="flex items-center gap-2 bg-primary hover:bg-primary/95 text-white px-5 py-2.5 rounded-full text-xs font-bold transition-all shadow-xs"
              >
                <ArrowLeft className="w-4 h-4" /> Vrátit se na hlavní web obytkem.cz
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Container - Balanced Negative Space */}
      <main className="flex-grow py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          
          {/* Main Hero Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="inline-block bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-[10px] uppercase tracking-wider border border-primary/20 animate-fade-in">
              Nezávazný poptávkový formulář
            </span>
            <h1 className="text-3xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight leading-tight">
              Rezervujte si svůj termín pronájmu
            </h1>
            <p className="text-slate-600 leading-relaxed text-sm sm:text-base">
              Zde si můžete jednoduše a nezávazně poptat volný termín pro náš luxusní rodinný obytný vůz <strong className="text-slate-800">{settings.brand} {settings.model}</strong>. Ostatní informace, parametry, kompletní specifikace a fotogalerie jsou dostupné na našem hlavním webu.
            </p>
          </div>

          {/* Interactive Availability Calendar */}
          <AvailabilityCalendar 
            startDate={inquiryStartDate}
            endDate={inquiryEndDate}
            onSelectRange={(start, end) => {
              setInquiryStartDate(start);
              setInquiryEndDate(end);
            }}
            dailyPrice={settings.dailyPrice}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start pt-4">
            
            {/* Left Column: Context details, trustworthy guidelines */}
            <div className="lg:col-span-6 space-y-8">

              {/* Quick vehicle specs summary */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-xl">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Kapacita vozu</span>
                    <strong className="text-xs text-slate-900 block font-bold">Pro 5 osob</strong>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-3">
                  <div className="bg-primary/10 text-primary p-2 rounded-xl">
                    <Car className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 block">Řidičský průkaz</span>
                    <strong className="text-xs text-slate-900 block font-bold">Skupina B (auto)</strong>
                  </div>
                </div>
              </div>

              {/* Simple workflow layout */}
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                <h3 className="font-bold text-slate-900 text-lg flex items-center gap-2">
                  <Info className="w-5 h-5 text-primary" /> Jak u nás probíhá pronájem?
                </h3>
                
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Nezávazná poptávka", desc: "Zadejte požadované datum a kontaktní údaje. Systém vám okamžitě ukáže orientační výpočet ceny nájemného." },
                    { step: "2", title: "Potvrzení dostupnosti", desc: "Formulář okamžitě obdržíme, zkontrolujeme dostupnost vozu a obratem vás budeme kontaktovat s nabídkou." },
                    { step: "3", title: "Snadný podpis online", desc: "Po schválení vám zašleme odkaz na klientský portál, kde smlouvu podepíšete jednoduše online ze svého telefonu." }
                  ].map((item, idx) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
                        {item.step}
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Back Link bottom note */}
              <div className="flex items-center gap-2.5">
                <ArrowLeft className="w-4 h-4 text-primary" />
                <span className="text-xs text-slate-600">
                  Hledáte podrobné parametry vozu nebo ceny doplňků? Přejděte zpět na <a href="https://www.obytkem.cz" className="text-primary font-bold hover:underline">hlavní web www.obytkem.cz</a>.
                </span>
              </div>
            </div>

            {/* Right Column: Perfect interactive Inquiry Form */}
            <div className="lg:col-span-6">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-2xl pointer-events-none"></div>
                
                <div className="pb-4 border-b border-slate-100">
                  <h3 className="text-xl sm:text-2xl font-bold text-slate-900">Výběr termínu a odeslání</h3>
                  <p className="text-xs text-slate-500 mt-1">Po odeslání poptávky vám zablokujeme termín do doby, než se s vámi spojíme.</p>
                </div>

                {inquirySuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-green-50/50 border border-green-200/80 rounded-2xl p-6 text-center space-y-4 py-8"
                  >
                    <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto shadow-xs">
                      <Check className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-bold text-green-900 text-lg">Poptávka byla úspěšně odeslána!</h4>
                      <p className="text-xs text-green-700 mt-2 leading-relaxed max-w-sm mx-auto">
                        Děkujeme za váš zájem o pronájem vozu {settings.brand} {settings.model}. Vaši poptávku jsme v pořádku přijali a ihned se jí budeme věnovat. Brzy se vám ozveme zpět na zadaný telefon nebo e-mail.
                      </p>
                    </div>
                    <div className="pt-4 flex flex-col gap-3">
                      <button 
                        onClick={() => setInquirySuccess(false)}
                        className="text-xs font-bold text-green-800 underline hover:text-green-900 transition-colors cursor-pointer"
                      >
                        Odeslat novou poptávku
                      </button>
                      <a 
                        href="https://www.obytkem.cz"
                        className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 bg-green-700 hover:bg-green-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" /> Zpět na hlavní web obytkem.cz
                      </a>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSendInquiry} className="space-y-5">
                    
                    {/* Date picker fields with responsive grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Začátek pronájmu (Od) *</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            required
                            value={inquiryStartDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setInquiryStartDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Konec pronájmu (Do) *</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            required
                            value={inquiryEndDate}
                            min={inquiryStartDate || new Date().toISOString().split('T')[0]}
                            onChange={e => setInquiryEndDate(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Pricing calculation feedback in real-time */}
                    {estimate ? (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs"
                      >
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Počet dní pronájmu:</span>
                          <span className="font-bold text-slate-800">{estimate.days} dní</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium">
                          <span>Denní sazba:</span>
                          <span>{settings.dailyPrice.toLocaleString('cs-CZ')} Kč / den</span>
                        </div>
                        <div className="flex justify-between text-slate-600 font-medium pb-2 border-b border-slate-200/60">
                          <span>Servisní poplatek (příprava, úklid):</span>
                          <span>{settings.cleaningFee.toLocaleString('cs-CZ')} Kč</span>
                        </div>
                        <div className="flex justify-between text-slate-900 font-bold text-sm pt-1">
                          <span>Odhadovaná celková cena:</span>
                          <span className="text-accent text-base">{estimate.grandTotal.toLocaleString('cs-CZ')} Kč</span>
                        </div>
                        <div className="flex justify-between text-slate-500 text-[10px] italic pt-1 border-t border-dashed border-slate-200 mt-2">
                          <span>Vratná kauce (skládá se při převzetí):</span>
                          <span>{settings.deposit.toLocaleString('cs-CZ')} Kč</span>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-3 flex gap-2 items-start text-[11px] text-amber-800">
                        <Info className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                        <span>Po zvolení počátku a konce pronájmu se vám zde zobrazí přehledný odhad celkové ceny.</span>
                      </div>
                    )}

                    {/* Personal Detail inputs */}
                    <div className="space-y-3 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Vaše jméno a příjmení *</label>
                        <input 
                          type="text" 
                          required
                          value={inquiryName}
                          onChange={e => setInquiryName(e.target.value)}
                          placeholder="Např. Jan Novák" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Telefonní číslo *</label>
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
                          <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">E-mailová adresa *</label>
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
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Vaše zpráva / poznámka (volitelné)</label>
                        <textarea 
                          rows={3}
                          value={inquiryMessage}
                          onChange={e => setInquiryMessage(e.target.value)}
                          placeholder="Máte specifické požadavky, doplňující otázky k výbavě, nebo cestujete se zvířetem? Dejte nám vědět..." 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:border-primary outline-none transition-all resize-none"
                        />
                      </div>
                    </div>

                    <button 
                      type="submit"
                      className="w-full bg-primary hover:bg-primary/95 text-white py-4 rounded-xl font-bold text-sm shadow-md shadow-primary/15 transition-all cursor-pointer mt-2"
                    >
                      Odeslat nezávaznou poptávku
                    </button>
                  </form>
                )}

                <div className="text-[10px] text-slate-400 text-center leading-relaxed">
                  Odesláním vyjadřujete souhlas se zpracováním osobních údajů pro účely kalkulace a zprostředkování pronájmu.
                </div>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-white pt-12 pb-8 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo className="w-8 h-8" />

            <div className="flex flex-wrap justify-center gap-6 text-xs text-slate-400">
              <a href="https://www.obytkem.cz" className="hover:text-white transition-colors flex items-center gap-1.5 font-semibold text-primary">
                <ArrowLeft className="w-3.5 h-3.5" /> Přejít na hlavní web obytkem.cz
              </a>
              <button 
                onClick={() => setViewMode('admin')}
                className="hover:text-white transition-colors flex items-center gap-1"
              >
                <Settings className="w-3.5 h-3.5" /> Administrace (pro majitele)
              </button>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-slate-800/60 text-center text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} obytkem.cz. Všechna práva vyhrazena.</p>
            <p className="text-[10px] opacity-80">Provozováno v zabezpečeném cloudovém prostředí.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
