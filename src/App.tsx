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
  Info,
  LogOut,
  Lock,
  AlertCircle
} from 'lucide-react';
import HostDashboard from './components/HostDashboard';
import TenantPortal from './components/TenantPortal';
import Logo from './components/Logo';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import AdminLoginModal from './components/AdminLoginModal';
import { decodeContract, getStoredSettings, checkRentalCollision } from './utils/contractUtils';
import { dbService, isSupabaseConfigured } from './lib/supabase';
import { isAdminAuthenticated, logoutAdmin } from './utils/authUtils';
import { ContractData, ReservationInquiry } from './types';

export default function App() {
  const [viewMode, setViewMode] = useState<'landing' | 'admin' | 'tenant'>('landing');
  const [tenantContract, setTenantContract] = useState<Partial<ContractData> | null>(null);
  const [settings, setSettings] = useState(() => getStoredSettings());
  const [showAdminLoginModal, setShowAdminLoginModal] = useState(false);
  const [authenticatedAdmin, setAuthenticatedAdmin] = useState(() => isAdminAuthenticated());

  // Handle opening admin portal securely
  const handleOpenAdmin = () => {
    if (isAdminAuthenticated()) {
      setAuthenticatedAdmin(true);
      setViewMode('admin');
    } else {
      setShowAdminLoginModal(true);
    }
  };

  const handleAdminLoginSuccess = () => {
    setAuthenticatedAdmin(true);
    setShowAdminLoginModal(false);
    setViewMode('admin');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAuthenticatedAdmin(false);
    setViewMode('landing');
  };

  // Reservation form state
  const [inquiryName, setInquiryName] = useState('');
  const [inquiryEmail, setInquiryEmail] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryStartDate, setInquiryStartDate] = useState('');
  const [inquiryStartTime, setInquiryStartTime] = useState('10:00');
  const [inquiryEndDate, setInquiryEndDate] = useState('');
  const [inquiryEndTime, setInquiryEndTime] = useState('10:00');
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Existing DB data for collision checks
  const [existingContracts, setExistingContracts] = useState<ContractData[]>([]);
  const [existingInquiries, setExistingInquiries] = useState<ReservationInquiry[]>([]);

  // Load contracts and inquiries for availability check
  const loadCalendarData = () => {
    dbService.getContracts().then(res => setExistingContracts(res));
    dbService.getInquiries().then(res => setExistingInquiries(res));
  };

  // Sync settings and calendar data when entering viewMode
  useEffect(() => {
    dbService.getSettings().then(res => setSettings(res));
    loadCalendarData();
  }, [viewMode]);

  // Real-time rental collision check with service buffer
  const collisionResult = checkRentalCollision(
    {
      startDate: inquiryStartDate,
      startTime: inquiryStartTime,
      endDate: inquiryEndDate,
      endTime: inquiryEndTime
    },
    [
      ...existingContracts.map(c => ({
        id: c.id,
        startDate: c.startDate,
        startTime: c.startTime || '10:00',
        endDate: c.endDate,
        endTime: c.endTime || '10:00'
      })),
      ...existingInquiries
        .filter(i => i.status !== 'cancelled')
        .map(i => ({
          id: i.id,
          startDate: i.startDate,
          startTime: i.startTime || '10:00',
          endDate: i.endDate,
          endTime: i.endTime || '10:00'
        }))
    ],
    settings.bufferHours ?? 1.5
  );

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

    if (collisionResult.hasCollision) {
      alert(collisionResult.message || 'Vybraný termín koliduje s jinou rezervací.');
      return;
    }

    const newInquiry: Partial<ReservationInquiry> = {
      name: inquiryName,
      email: inquiryEmail,
      phone: inquiryPhone,
      startDate: inquiryStartDate,
      startTime: inquiryStartTime || '10:00',
      endDate: inquiryEndDate,
      endTime: inquiryEndTime || '10:00',
      message: inquiryMessage,
      status: 'pending'
    };

    try {
      await dbService.saveInquiry(newInquiry);
      
      setInquirySuccess(true);
      // Refresh DB data
      loadCalendarData();

      // Reset form
      setInquiryName('');
      setInquiryEmail('');
      setInquiryPhone('');
      setInquiryStartDate('');
      setInquiryStartTime('10:00');
      setInquiryEndDate('');
      setInquiryEndTime('10:00');
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
    if (!isAdminAuthenticated()) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center space-y-4">
            <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Přístup odmítnut</h2>
            <p className="text-xs text-slate-600">Pro přístup do administrace je vyžadováno přihlášení.</p>
            <button 
              onClick={handleOpenAdmin}
              className="w-full bg-primary text-white py-3 rounded-xl text-xs font-bold"
            >
              Přihlásit se do administrace
            </button>
          </div>
          <AdminLoginModal 
            isOpen={showAdminLoginModal} 
            onClose={() => {
              setShowAdminLoginModal(false);
              setViewMode('landing');
            }} 
            onSuccess={handleAdminLoginSuccess} 
          />
        </div>
      );
    }

    return (
      <div className="bg-paper min-h-screen flex flex-col">
        {/* Simple Back Navigation Header */}
        <nav className="bg-white border-b border-slate-200 py-4 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <Logo className="w-8 h-8" />
              <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-emerald-600" /> Administrace
              </span>
            </div>
            <div className="flex items-center gap-3">
              <a 
                href="https://www.obytkem.cz"
                className="hidden sm:flex text-xs font-semibold text-primary hover:text-primary/80 transition-all items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Hlavní web obytkem.cz
              </a>
              <button 
                onClick={() => setViewMode('landing')}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-all"
              >
                Zpět k poptávce
              </button>
              <button 
                onClick={handleAdminLogout}
                className="text-xs font-semibold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
                title="Odhlásit se z administrace"
              >
                <LogOut className="w-3.5 h-3.5" /> <span className="hidden sm:inline">Odhlásit se</span>
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
                    
                    {/* Date and Time picker fields with responsive grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Začátek pronájmu (Datum a Čas převzetí) *</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <input 
                            type="date" 
                            required
                            value={inquiryStartDate}
                            min={new Date().toISOString().split('T')[0]}
                            onChange={e => setInquiryStartDate(e.target.value)}
                            className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all cursor-pointer"
                          />
                          <select
                            value={inquiryStartTime}
                            onChange={e => setInquiryStartTime(e.target.value)}
                            className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-primary outline-none cursor-pointer"
                          >
                            {['07:00', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">Konec pronájmu (Datum a Čas vrácení) *</label>
                        <div className="grid grid-cols-3 gap-1.5">
                          <input 
                            type="date" 
                            required
                            value={inquiryEndDate}
                            min={inquiryStartDate || new Date().toISOString().split('T')[0]}
                            onChange={e => setInquiryEndDate(e.target.value)}
                            className="col-span-2 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2.5 text-xs font-semibold text-slate-700 focus:bg-white focus:border-primary outline-none transition-all cursor-pointer"
                          />
                          <select
                            value={inquiryEndTime}
                            onChange={e => setInquiryEndTime(e.target.value)}
                            className="col-span-1 bg-slate-50 border border-slate-200 rounded-xl px-1.5 py-2.5 text-xs font-bold text-slate-700 focus:bg-white focus:border-primary outline-none cursor-pointer"
                          >
                            {['07:00', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map(t => (
                              <option key={t} value={t}>{t}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Collision warning callout if selected dates & times overlap */}
                    {collisionResult.hasCollision && (
                      <motion.div 
                        initial={{ opacity: 0, y: -5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 flex items-start gap-3 text-xs text-rose-800"
                      >
                        <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-rose-900 font-bold mb-0.5">TER MÍN NELZE REZERVOVAT (KOLIZE):</strong>
                          <span>{collisionResult.message}</span>
                        </div>
                      </motion.div>
                    )}

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
                      disabled={collisionResult.hasCollision}
                      className={`w-full py-4 rounded-xl font-bold text-sm shadow-md transition-all mt-2 ${
                        collisionResult.hasCollision 
                          ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none' 
                          : 'bg-primary hover:bg-primary/95 text-white shadow-primary/15 cursor-pointer'
                      }`}
                    >
                      {collisionResult.hasCollision ? 'Vybraný termín koliduje (nedostupné)' : 'Odeslat nezávaznou poptávku'}
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
                onClick={handleOpenAdmin}
                className="hover:text-white transition-colors flex items-center gap-1 cursor-pointer font-semibold"
              >
                <Settings className="w-3.5 h-3.5 text-primary" /> Administrace (pro majitele)
              </button>
            </div>
          </div>
          
          <div className="pt-8 mt-8 border-t border-slate-800/60 text-center text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-4">
            <p>© {new Date().getFullYear()} obytkem.cz. Všechna práva vyhrazena.</p>
            <p className="text-[10px] opacity-80">Provozováno v zabezpečeném cloudovém prostředí.</p>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLoginModal 
        isOpen={showAdminLoginModal} 
        onClose={() => setShowAdminLoginModal(false)} 
        onSuccess={handleAdminLoginSuccess} 
      />
    </div>
  );
}
