import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Settings, 
  PlusCircle, 
  Copy, 
  Check, 
  Calendar, 
  User, 
  CreditCard, 
  Share2, 
  Trash2, 
  ExternalLink,
  ChevronRight,
  Info,
  Car,
  Lock,
  ShieldCheck,
  KeyRound,
  Mail,
  Send,
  X,
  MessageSquare,
  Database,
  Activity,
  AlertTriangle,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { ContractData, CampervanSettings, ReservationInquiry } from '../types';
import { 
  encodeContract, 
  calculateContractPrice,
  checkRentalCollision,
  DEFAULT_SETTINGS
} from '../utils/contractUtils';
import { dbService, isSupabaseConfigured, DatabaseHealthReport } from '../lib/supabase';
import { getAdminPassword, setAdminPassword } from '../utils/authUtils';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface HostDashboardProps {
  onViewContract: (contract: ContractData) => void;
}

export default function HostDashboard({ onViewContract }: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'contracts' | 'new-contract' | 'settings' | 'inquiries'>('inquiries');
  const [settings, setSettings] = useState<CampervanSettings>(DEFAULT_SETTINGS);
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [inquiries, setInquiries] = useState<ReservationInquiry[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Database Diagnostics State
  const [healthReport, setHealthReport] = useState<DatabaseHealthReport | null>(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [newInquiryToast, setNewInquiryToast] = useState<string | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);
  const [isCreatingTestInquiry, setIsCreatingTestInquiry] = useState(false);

  // Form states for a new contract
  const [tenantName, setTenantName] = useState('');
  const [tenantBirthDate, setTenantBirthDate] = useState('');
  const [tenantIdNumber, setTenantIdNumber] = useState('');
  const [tenantDlNumber, setTenantDlNumber] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('10:00');
  const [customDailyPrice, setCustomDailyPrice] = useState<number | ''>('');
  const [customDeposit, setCustomDeposit] = useState<number | ''>('');
  const [customCleaningFee, setCustomCleaningFee] = useState<number | ''>('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  // Settings form states
  const [ownerName, setOwnerName] = useState(DEFAULT_SETTINGS.ownerName);
  const [ownerId, setOwnerId] = useState(DEFAULT_SETTINGS.ownerId);
  const [ownerAddress, setOwnerAddress] = useState(DEFAULT_SETTINGS.ownerAddress);
  const [ownerPhone, setOwnerPhone] = useState(DEFAULT_SETTINGS.ownerPhone);
  const [ownerEmail, setOwnerEmail] = useState(DEFAULT_SETTINGS.ownerEmail);
  const [ownerBank, setOwnerBank] = useState(DEFAULT_SETTINGS.ownerBank);
  const [brand, setBrand] = useState(DEFAULT_SETTINGS.brand);
  const [model, setModel] = useState(DEFAULT_SETTINGS.model);
  const [plateNumber, setPlateNumber] = useState(DEFAULT_SETTINGS.plateNumber);
  const [year, setYear] = useState(DEFAULT_SETTINGS.year);
  const [dailyPrice, setDailyPrice] = useState(DEFAULT_SETTINGS.dailyPrice);
  const [deposit, setDeposit] = useState(DEFAULT_SETTINGS.deposit);
  const [cleaningFee, setCleaningFee] = useState(DEFAULT_SETTINGS.cleaningFee);
  const [kmLimitPerDay, setKmLimitPerDay] = useState(DEFAULT_SETTINGS.kmLimitPerDay);
  const [kmOverLimitPrice, setKmOverLimitPrice] = useState(DEFAULT_SETTINGS.kmOverLimitPrice);
  const [bufferHours, setBufferHours] = useState(DEFAULT_SETTINGS.bufferHours ?? 1.5);

  // Admin Security Password State
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState(false);

  // Email Sharing Modal State
  const [emailModalContract, setEmailModalContract] = useState<ContractData | null>(null);
  const [copiedEmailText, setCopiedEmailText] = useState(false);

  // Load data on mount and whenever activeTab changes
  useEffect(() => {
    // Load settings from database
    dbService.getSettings()
      .then(res => {
        if (!res) return;
        setSettings(res);
        setOwnerName(res.ownerName || DEFAULT_SETTINGS.ownerName);
        setOwnerId(res.ownerId || DEFAULT_SETTINGS.ownerId);
        setOwnerAddress(res.ownerAddress || DEFAULT_SETTINGS.ownerAddress);
        setOwnerPhone(res.ownerPhone || DEFAULT_SETTINGS.ownerPhone);
        setOwnerEmail(res.ownerEmail || DEFAULT_SETTINGS.ownerEmail);
        setOwnerBank(res.ownerBank || DEFAULT_SETTINGS.ownerBank);
        setBrand(res.brand || DEFAULT_SETTINGS.brand);
        setModel(res.model || DEFAULT_SETTINGS.model);
        setPlateNumber(res.plateNumber || DEFAULT_SETTINGS.plateNumber);
        setYear(res.year || DEFAULT_SETTINGS.year);
        setDailyPrice(res.dailyPrice ?? DEFAULT_SETTINGS.dailyPrice);
        setDeposit(res.deposit ?? DEFAULT_SETTINGS.deposit);
        setCleaningFee(res.cleaningFee ?? DEFAULT_SETTINGS.cleaningFee);
        setKmLimitPerDay(res.kmLimitPerDay ?? DEFAULT_SETTINGS.kmLimitPerDay);
        setKmOverLimitPrice(res.kmOverLimitPrice ?? DEFAULT_SETTINGS.kmOverLimitPrice);
        setBufferHours(res.bufferHours ?? DEFAULT_SETTINGS.bufferHours ?? 1.5);
      })
      .catch(err => {
        console.error('Error fetching settings in dashboard:', err);
      });

    // Load contracts
    dbService.getContracts()
      .then(res => {
        setContracts(Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error('Error loading contracts in dashboard:', err);
        setContracts([]);
      });

    // Load inquiries
    dbService.getInquiries()
      .then(res => {
        setInquiries(Array.isArray(res) ? res : []);
      })
      .catch(err => {
        console.error('Error loading inquiries in dashboard:', err);
        setInquiries([]);
      });

    // Initial DB Health Check
    if (dbService && typeof dbService.checkDatabaseHealth === 'function') {
      dbService.checkDatabaseHealth()
        .then(res => {
          if (res) setHealthReport(res);
        })
        .catch(err => {
          console.error('Health check failed:', err);
        });
    }

    // Subscribe to Realtime Inquiries
    let unsubscribe: () => void = () => {};
    try {
      unsubscribe = dbService.subscribeToInquiries((newInquiry) => {
        if (!newInquiry || !newInquiry.id) return;
        setInquiries(prev => {
          const list = Array.isArray(prev) ? prev : [];
          if (list.some(i => i.id === newInquiry.id)) return list;
          return [newInquiry, ...list];
        });
        setNewInquiryToast(`Nová poptávka od: ${newInquiry.name || 'Zákazník'} (${newInquiry.phone || newInquiry.email || 'Bez kontaktu'})`);
        setTimeout(() => setNewInquiryToast(null), 8000);
      });
    } catch (e) {
      console.warn('Realtime subscription error:', e);
    }

    return () => {
      try {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      } catch (e) {
        console.warn('Unsubscribe cleanup error:', e);
      }
    };
  }, [activeTab]);

  const handleRunHealthCheck = async () => {
    setIsCheckingHealth(true);
    try {
      if (dbService && typeof dbService.checkDatabaseHealth === 'function') {
        const report = await dbService.checkDatabaseHealth();
        setHealthReport(report);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const handleSendTestInquiry = async () => {
    setIsCreatingTestInquiry(true);
    try {
      const today = new Date();
      const testStart = new Date(today);
      testStart.setDate(today.getDate() + 14);
      const testEnd = new Date(today);
      testEnd.setDate(today.getDate() + 18);

      const startStr = testStart.toISOString().split('T')[0];
      const endStr = testEnd.toISOString().split('T')[0];

      const testInquiry: Partial<ReservationInquiry> = {
        name: 'Zkušební Poptávka (Test Systému)',
        email: settings.ownerEmail || 'test@obytkem.cz',
        phone: '+420 777 000 111',
        startDate: startStr,
        startTime: '10:00',
        endDate: endStr,
        endTime: '10:00',
        message: 'Toto je testovací poptávka pro ověření funkčnosti databáze a příjmu rezervací.',
        status: 'pending'
      };

      const saved = await dbService.saveInquiry(testInquiry);
      const updatedList = await dbService.getInquiries();
      setInquiries(updatedList);
      setActiveTab('inquiries');
      alert(`✅ Testovací poptávka byla úspěšně vytvořena a uložena!\n\nNyní ji vidíte v seznamu poptávek.`);
      handleRunHealthCheck();
    } catch (err: any) {
      alert(`❌ Chyba při vytváření testovací poptávky: ${err?.message || err}`);
    } finally {
      setIsCreatingTestInquiry(false);
    }
  };

  const handleCopySqlSchema = () => {
    const sql = `-- ====================================================================
-- SUPABASE / POSTGRESQL DATABASE SCHEMA FOR OBYTKEM.CZ
-- ====================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. campervan_settings
CREATE TABLE IF NOT EXISTS public.campervan_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    brand TEXT NOT NULL DEFAULT 'Ahorn',
    model TEXT NOT NULL DEFAULT 'Canada TU Plus',
    plate_number TEXT NOT NULL DEFAULT '7AM 8243',
    year INTEGER NOT NULL DEFAULT 2023,
    daily_price NUMERIC(10, 2) NOT NULL DEFAULT 3200.00,
    deposit NUMERIC(10, 2) NOT NULL DEFAULT 30000.00,
    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    km_limit_per_day INTEGER NOT NULL DEFAULT 300,
    km_over_limit_price NUMERIC(10, 2) NOT NULL DEFAULT 6.00,
    buffer_hours NUMERIC(4, 2) NOT NULL DEFAULT 1.5,
    owner_name TEXT NOT NULL DEFAULT 'Petr Svoboda',
    owner_id TEXT NOT NULL DEFAULT '12345678',
    owner_address TEXT NOT NULL DEFAULT 'Slunečná 45, 100 00 Praha 10',
    owner_phone TEXT NOT NULL DEFAULT '+420 777 888 999',
    owner_email TEXT NOT NULL DEFAULT 'info@obytkem.cz',
    owner_bank TEXT NOT NULL DEFAULT '123456789/0100 (Komerční banka)',
    admin_password TEXT DEFAULT 'obytkem2026'
);

-- 2. reservation_inquiries
CREATE TABLE IF NOT EXISTS public.reservation_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    start_date DATE NOT NULL,
    start_time TEXT NOT NULL DEFAULT '10:00',
    end_date DATE NOT NULL,
    end_time TEXT NOT NULL DEFAULT '10:00',
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'cancelled'))
);

-- 3. contracts
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    tenant_name TEXT NOT NULL,
    tenant_birth_date DATE NOT NULL,
    tenant_id_number TEXT NOT NULL,
    tenant_dl_number TEXT NOT NULL,
    tenant_address TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    tenant_email TEXT NOT NULL,
    start_date DATE NOT NULL,
    start_time TEXT NOT NULL DEFAULT '10:00',
    end_date DATE NOT NULL,
    end_time TEXT NOT NULL DEFAULT '10:00',
    daily_price NUMERIC(10, 2) NOT NULL,
    deposit NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) NOT NULL,
    km_limit_per_day INTEGER NOT NULL,
    km_over_limit_price NUMERIC(10, 2) NOT NULL,
    additional_terms TEXT,
    owner_signature TEXT,
    tenant_signature TEXT,
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_ip TEXT,
    is_signed BOOLEAN NOT NULL DEFAULT FALSE
);

-- 4. RLS POLICIES
ALTER TABLE public.campervan_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Povolit plný přístup k nastavení pro kohokoliv" ON public.campervan_settings;
CREATE POLICY "Povolit plný přístup k nastavení pro kohokoliv" ON public.campervan_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Povolit plný přístup k poptávkám pro kohokoliv" ON public.reservation_inquiries;
CREATE POLICY "Povolit plný přístup k poptávkám pro kohokoliv" ON public.reservation_inquiries FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Povolit plný přístup ke smlouvám pro kohokoliv" ON public.contracts;
CREATE POLICY "Povolit plný přístup ke smlouvám pro kohokoliv" ON public.contracts FOR ALL USING (true) WITH CHECK (true);`;

    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 4000);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newAdminPassword) {
      if (newAdminPassword.length < 4) {
        alert('Nové heslo musí mít alespoň 4 znaky.');
        return;
      }
      if (newAdminPassword !== confirmAdminPassword) {
        alert('Nová hesla se neshodují! Zkontrolujte zadané heslo a potvrzení hesla.');
        return;
      }
      setAdminPassword(newAdminPassword);
      setPasswordSuccessMessage(true);
      setNewAdminPassword('');
      setConfirmAdminPassword('');
      setTimeout(() => setPasswordSuccessMessage(false), 5000);
    }

    const updated: CampervanSettings = {
      ownerName,
      ownerId,
      ownerAddress,
      ownerPhone,
      ownerEmail,
      ownerBank,
      brand,
      model,
      plateNumber,
      year,
      dailyPrice,
      deposit,
      cleaningFee,
      kmLimitPerDay,
      kmOverLimitPrice,
      bufferHours: Number(bufferHours) || 1.5,
      adminPassword: newAdminPassword ? newAdminPassword : (settings.adminPassword || getAdminPassword())
    };
    
    try {
      const saved = await dbService.saveSettings(updated);
      setSettings(saved);
      alert('Nastavení i zabezpečení bylo úspěšně uloženo!');
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Chyba při ukládání nastavení.');
    }
  };

  const handleCreateContract = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !startDate || !endDate) {
      alert('Prosím vyplňte alespoň jméno nájemce, začátek a konec nájmu.');
      return;
    }

    // Check collision against existing contracts & active inquiries
    const collision = checkRentalCollision(
      {
        startDate,
        startTime: startTime || '10:00',
        endDate,
        endTime: endTime || '10:00'
      },
      [
        ...contracts.map(c => ({
          id: c.id,
          startDate: c.startDate,
          startTime: c.startTime || '10:00',
          endDate: c.endDate,
          endTime: c.endTime || '10:00'
        })),
        ...inquiries
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

    if (collision.hasCollision) {
      const proceed = confirm(
        `POZOR - KOLIZE S JINOU REZERVACÍ:\n${collision.message}\n\nChcete i přesto tuto smlouvu vytvořit?`
      );
      if (!proceed) return;
    }

    const priceOverride = customDailyPrice !== '' ? Number(customDailyPrice) : settings.dailyPrice;
    const depositOverride = customDeposit !== '' ? Number(customDeposit) : settings.deposit;
    const cleaningOverride = customCleaningFee !== '' ? Number(customCleaningFee) : settings.cleaningFee;

    const newContract: Partial<ContractData> = {
      tenantName,
      tenantBirthDate,
      tenantIdNumber,
      tenantDlNumber,
      tenantAddress,
      tenantPhone,
      tenantEmail,
      startDate,
      startTime: startTime || '10:00',
      endDate,
      endTime: endTime || '10:00',
      dailyPrice: priceOverride,
      deposit: depositOverride,
      cleaningFee: cleaningOverride,
      kmLimitPerDay: settings.kmLimitPerDay,
      kmOverLimitPrice: settings.kmOverLimitPrice,
      additionalTerms,
      isSigned: false
    };

    try {
      const savedContract = await dbService.saveContract(newContract);
      // Reload contracts
      const updatedList = await dbService.getContracts();
      setContracts(updatedList);

      // Clear form
      setTenantName('');
      setTenantBirthDate('');
      setTenantIdNumber('');
      setTenantDlNumber('');
      setTenantAddress('');
      setTenantPhone('');
      setTenantEmail('');
      setStartDate('');
      setStartTime('10:00');
      setEndDate('');
      setEndTime('10:00');
      setCustomDailyPrice('');
      setCustomDeposit('');
      setCustomCleaningFee('');
      setAdditionalTerms('');

      // Switch to lists and open email share modal
      setActiveTab('contracts');
      setEmailModalContract(savedContract);
    } catch (err) {
      console.error('Error creating contract:', err);
      alert('Chyba při ukládání smlouvy.');
    }
  };

  const handleDeleteContract = async (id: string) => {
    if (confirm('Opravdu chcete tuto smlouvu smazat?')) {
      try {
        await dbService.deleteContract(id);
        const updated = await dbService.getContracts();
        setContracts(updated);
      } catch (err) {
        console.error('Error deleting contract:', err);
        alert('Chyba při odstraňování smlouvy.');
      }
    }
  };

  const handleConvertInquiry = async (inquiry: ReservationInquiry) => {
    // Pre-fill fields
    setTenantName(inquiry.name);
    setTenantPhone(inquiry.phone);
    setTenantEmail(inquiry.email);
    setStartDate(inquiry.startDate);
    setStartTime(inquiry.startTime || '10:00');
    setEndDate(inquiry.endDate);
    setEndTime(inquiry.endTime || '10:00');
    setAdditionalTerms(inquiry.message ? `Poznámka z poptávky: ${inquiry.message}` : '');
    
    // Reset custom overrides so default settings are used
    setCustomDailyPrice('');
    setCustomDeposit('');
    setCustomCleaningFee('');

    try {
      // Update status to converted in db
      await dbService.saveInquiry({ ...inquiry, status: 'converted' });
      // Reload inquiries
      const updatedList = await dbService.getInquiries();
      setInquiries(updatedList);

      // Switch to contract creation
      setActiveTab('new-contract');
    } catch (err) {
      console.error('Error converting inquiry:', err);
    }
  };

  const handleCancelInquiry = async (id: string) => {
    const found = inquiries.find(i => i.id === id);
    if (!found) return;
    try {
      await dbService.saveInquiry({ ...found, status: 'cancelled' });
      const updatedList = await dbService.getInquiries();
      setInquiries(updatedList);
    } catch (err) {
      console.error('Error cancelling inquiry:', err);
    }
  };

  const handleDeleteInquiry = async (id: string) => {
    if (confirm('Opravdu chcete tuto poptávku smazat?')) {
      try {
        await dbService.deleteInquiry(id);
        const updatedList = await dbService.getInquiries();
        setInquiries(updatedList);
      } catch (err) {
        console.error('Error deleting inquiry:', err);
        alert('Chyba při odstraňování poptávky.');
      }
    }
  };

  const getContractLink = (contract: ContractData) => {
    const baseUrl = window.location.origin + window.location.pathname;
    if (contract.id && contract.id.includes('-')) {
      return `${baseUrl}?id=${contract.id}`;
    }
    const encoded = encodeContract(contract);
    return `${baseUrl}?contract=${encoded}`;
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const shareViaWhatsApp = (contract: ContractData) => {
    const link = getContractLink(contract);
    const message = `Ahoj ${contract.tenantName}, zde posílám odkaz na smlouvu o pronájmu obytňáku. Prosím o kontrolu tvých údajů a podpis přímo na telefonu zde: ${link}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getEmailText = (contract: ContractData) => {
    const link = getContractLink(contract);
    const startStr = formatDateText(contract.startDate) + (contract.startTime ? ` v ${contract.startTime} hod.` : '');
    const endStr = formatDateText(contract.endDate) + (contract.endTime ? ` v ${contract.endTime} hod.` : '');
    const price = calculateContractPrice(contract.startDate, contract.endDate, contract.dailyPrice, contract.cleaningFee);

    return `Vážený/á ${contract.tenantName || 'zákazníku'},

potvrzujeme schválení Vaší rezervace obytného vozu ${settings.brand} ${settings.model} (SPZ: ${settings.plateNumber}).

Přehled schváleného pronájmu:
• Datum a čas převzetí: ${startStr}
• Datum a čas vrácení: ${endStr}
• Počet dní: ${price.days}
• Celková cena nájemného: ${price.grandTotal.toLocaleString('cs-CZ')} Kč
• Vratná kauce (při převzetí): ${contract.deposit.toLocaleString('cs-CZ')} Kč

Pro kontrolu Vašich osobních údajů a elektronický podpis nájemní smlouvy prosím použijte tento přímý odkaz do Vašeho Zákaznického portálu:
${link}

Smlouvu můžete pohodlně zkontrolovat a podepsat prstem či myší přímo na displeji Vašeho mobilního telefonu nebo počítače.

V případě jakýchkoliv dotazů nás neváhejte kontaktovat.

S pozdravem,
${settings.ownerName}
Telefon: ${settings.ownerPhone}
E-mail: ${settings.ownerEmail}`;
  };

  const sendDirectEmail = (contract: ContractData) => {
    const subject = `Schválená rezervace obytného vozu ${settings.brand} - Smlouva k podpisu`;
    const body = getEmailText(contract);
    const mailtoUrl = `mailto:${contract.tenantEmail || ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.open(mailtoUrl, '_blank');
  };

  const formatDateText = (dateStr?: string) => {
    if (!dateStr || typeof dateStr !== 'string') return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return format(d, 'd. M. yyyy', { locale: cs });
    } catch {
      return dateStr || '';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Smluvní Portál</h1>
          <p className="text-slate-500 mt-1">Jednoduchá správa pronájmu vašeho obytného vozu {settings.brand} {settings.model}.</p>
        </div>
        
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1 flex-wrap gap-1">
          <button 
            onClick={() => setActiveTab('inquiries')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all relative ${activeTab === 'inquiries' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Calendar className="w-4 h-4" /> Poptávky
            {(Array.isArray(inquiries) ? inquiries : []).filter(i => i && i.status === 'pending').length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white font-bold text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
                {(Array.isArray(inquiries) ? inquiries : []).filter(i => i && i.status === 'pending').length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('contracts')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'contracts' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <FileText className="w-4 h-4" /> Smlouvy
          </button>
          <button 
            onClick={() => setActiveTab('new-contract')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'new-contract' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <PlusCircle className="w-4 h-4" /> Nová smlouva
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${activeTab === 'settings' ? 'bg-primary text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <Settings className="w-4 h-4" /> Nastavení
          </button>
        </div>
      </div>

      {/* Realtime New Inquiry Toast */}
      {newInquiryToast && (
        <div className="bg-emerald-600 text-white px-5 py-3.5 rounded-2xl mb-6 flex items-center justify-between shadow-lg shadow-emerald-600/20 animate-bounce">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-xl">
              <BellRing className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Právě dorazila nová poptávka!</h4>
              <p className="text-xs text-emerald-100">{newInquiryToast}</p>
            </div>
          </div>
          <button 
            onClick={() => setNewInquiryToast(null)}
            className="text-white/80 hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Database Status & Health Bar */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 mb-6 shadow-xs">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${
              healthReport?.status === 'connected' 
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' 
                : healthReport?.status === 'error'
                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                : 'bg-amber-50 text-amber-600 border border-amber-200'
            }`}>
              <Database className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Stav databáze a příjmu rezervací:</span>
                {healthReport?.status === 'connected' && (
                  <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span> Supabase Cloud Aktivní
                  </span>
                )}
                {healthReport?.status === 'error' && (
                  <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3 text-rose-600" /> Chyba synchronizace tabulek
                  </span>
                )}
                {healthReport?.status === 'unconfigured' && (
                  <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[11px] font-bold px-2 py-0.5 rounded-full">
                    Offline režim (Prohlížeč)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {healthReport?.status === 'connected' 
                  ? `Všechny poptávky z webu se okamžitě ukládají do centrální Supabase databáze (${healthReport.inquiriesCount} poptávek celkem).`
                  : healthReport?.errorDetails || 'Data se ukládají lokálně v tomto prohlížeči. Pro sdílení mezi zařízeními propojte Supabase.'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            <button
              onClick={handleSendTestInquiry}
              disabled={isCreatingTestInquiry}
              className="px-3 py-1.5 bg-sky-50 hover:bg-sky-100 text-sky-700 text-xs font-bold rounded-xl border border-sky-200 transition-all flex items-center gap-1.5"
              title="Vytvořit testovací poptávku a ověřit, že dorazí"
            >
              <Send className="w-3.5 h-3.5" />
              {isCreatingTestInquiry ? 'Odesílám test...' : 'Otestovat příjem poptávky'}
            </button>
            <button
              onClick={() => setShowDiagnostics(!showDiagnostics)}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-slate-500" />
              {showDiagnostics ? 'Skrýt detail' : 'Detail připojení'}
            </button>
          </div>
        </div>

        {/* Detailed Diagnostic Panel */}
        {showDiagnostics && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-4 text-xs animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-semibold text-slate-700">1. Nastavení vozu</div>
                <div className="mt-1 flex items-center gap-1">
                  {healthReport?.settingsOk ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Tabulka dostupná</span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Nedostupná</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-semibold text-slate-700">2. Poptávky (Inquiries)</div>
                <div className="mt-1 flex items-center gap-1">
                  {healthReport?.inquiriesOk ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {healthReport.inquiriesCount} záznamů</span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Nedostupná</span>
                  )}
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="font-semibold text-slate-700">3. Smlouvy (Contracts)</div>
                <div className="mt-1 flex items-center gap-1">
                  {healthReport?.contractsOk ? (
                    <span className="text-emerald-600 font-bold flex items-center gap-1"><Check className="w-3.5 h-3.5" /> {healthReport.contractsCount} záznamů</span>
                  ) : (
                    <span className="text-rose-600 font-bold flex items-center gap-1"><X className="w-3.5 h-3.5" /> Nedostupná</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl">
              <div className="text-slate-600">
                Supabase URL: <span className="font-mono font-semibold text-slate-800">{healthReport?.supabaseUrl}</span>
                {healthReport?.lastChecked && <span className="text-slate-400 ml-2"> (Ověřeno v {healthReport.lastChecked})</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleRunHealthCheck}
                  disabled={isCheckingHealth}
                  className="px-3 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isCheckingHealth ? 'animate-spin' : ''}`} /> Zkontrolovat znovu
                </button>
                <button
                  onClick={handleCopySqlSchema}
                  className="px-3 py-1 bg-primary text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer hover:bg-primary/90"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedSql ? 'Zkopírováno!' : 'Kopírovat opravný SQL skript'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Info Warning banner about Single campervan */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 flex gap-3 items-start">
        <div className="bg-primary/10 text-primary p-2 rounded-xl flex-shrink-0">
          <Car className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">Jedno-vozidlový režim aktivní</h3>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Veškeré parametry, jako je registrační značka (SPZ), denní sazba, kauce, a údaje o vlastníkovi jsou nastavené globálně v záložce Nastavení. Při tvorbě smluv se tyto hodnoty automaticky načítají, což šetří váš čas.
          </p>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'contracts' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {(!Array.isArray(contracts) || contracts.length === 0) ? (
            <div className="p-16 text-center text-slate-400">
              <FileText className="w-12 h-12 mx-auto opacity-30 mb-4" />
              <p className="font-semibold text-slate-600 text-base">Zatím jste nevytvořili žádnou smlouvu</p>
              <p className="text-sm mt-1 max-w-sm mx-auto">Vytvořte svou první smlouvu kliknutím na "Nová smlouva" nahoře a pošlete ji nájemci k podpisu.</p>
              <button 
                onClick={() => setActiveTab('new-contract')}
                className="mt-6 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm"
              >
                Vytvořit smlouvu
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider font-semibold text-slate-500">
                    <th className="py-4 px-6">Nájemce</th>
                    <th className="py-4 px-6">Termín</th>
                    <th className="py-4 px-6">Celkem (Kauce)</th>
                    <th className="py-4 px-6">Stav</th>
                    <th className="py-4 px-6 text-right">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {contracts.filter(Boolean).map(contract => {
                    const price = calculateContractPrice(contract.startDate, contract.endDate, contract.dailyPrice, contract.cleaningFee);
                    const link = getContractLink(contract);
                    
                    return (
                      <tr key={contract.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{contract.tenantName}</div>
                          <div className="text-xs text-slate-400">{contract.tenantEmail || 'Bez e-mailu'}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{formatDateText(contract.startDate)} ({contract.startTime || '10:00'}) - {formatDateText(contract.endDate)} ({contract.endTime || '10:00'})</span>
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">{price.days} dní</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900">{price.grandTotal.toLocaleString('cs-CZ')} Kč</div>
                          <div className="text-xs text-slate-400">Kauce: {contract.deposit.toLocaleString('cs-CZ')} Kč</div>
                        </td>
                        <td className="py-4 px-6">
                          {contract.isSigned ? (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                              Podepsáno
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-200">
                              <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
                              Čeká na podpis
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            {/* Email Share button */}
                            <button
                              onClick={() => {
                                setEmailModalContract(contract);
                                setCopiedEmailText(false);
                              }}
                              className="p-2 text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                              title="Odeslat e-mailem zákazníkovi"
                            >
                              <Mail className="w-4 h-4" />
                            </button>

                            {/* Copy link button */}
                            <button
                              onClick={() => copyToClipboard(link, contract.id)}
                              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                              title="Kopírovat přímý odkaz"
                            >
                              {copiedId === contract.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                            </button>

                            {/* Share on WhatsApp */}
                            <button
                              onClick={() => shareViaWhatsApp(contract)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-all"
                              title="Odeslat na WhatsApp"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>

                            {/* View / Print */}
                            <button
                              onClick={() => onViewContract(contract)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition-all flex items-center gap-1"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Zobrazit
                            </button>

                            {/* Delete */}
                            <button
                              onClick={() => handleDeleteContract(contract.id)}
                              className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Smazat"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'inquiries' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
          {(!Array.isArray(inquiries) || inquiries.length === 0) ? (
            <div className="p-16 text-center text-slate-400">
              <Calendar className="w-12 h-12 mx-auto opacity-30 mb-4" />
              <p className="font-semibold text-slate-600 text-base">Žádné poptávky k dispozici</p>
              <p className="text-sm mt-1 max-w-sm mx-auto">Všechny poptávky, které zákazníci vyplní na úvodní stránce webu, se zobrazí zde.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wider font-semibold text-slate-500">
                    <th className="py-4 px-6">Zájemce</th>
                    <th className="py-4 px-6">Požadovaný termín</th>
                    <th className="py-4 px-6">Poznámka</th>
                    <th className="py-4 px-6">Stav</th>
                    <th className="py-4 px-6 text-right">Akce</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {inquiries.filter(Boolean).map(inquiry => {
                    const price = calculateContractPrice(inquiry.startDate, inquiry.endDate, settings.dailyPrice, settings.cleaningFee);
                    
                    return (
                      <tr key={inquiry.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-semibold text-slate-900">{inquiry.name}</div>
                          <div className="text-xs text-slate-600">{inquiry.phone}</div>
                          <div className="text-xs text-slate-400">{inquiry.email}</div>
                          <div className="text-[10px] text-slate-400 mt-1 font-mono">Přijato: {formatDateText(inquiry.createdAt)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-1.5 font-medium text-slate-700">
                            <Calendar className="w-4 h-4 text-slate-400 text-primary" />
                            <span>{formatDateText(inquiry.startDate)} ({inquiry.startTime || '10:00'}) - {formatDateText(inquiry.endDate)} ({inquiry.endTime || '10:00'})</span>
                          </div>
                          <div className="text-xs text-slate-500 mt-1">{price.days} dní</div>
                          <div className="text-xs font-semibold text-primary mt-0.5">Orientační cena: {price.grandTotal.toLocaleString('cs-CZ')} Kč</div>
                        </td>
                        <td className="py-4 px-6 max-w-xs">
                          {inquiry.message ? (
                            <p className="text-xs text-slate-600 line-clamp-2 italic">"{inquiry.message}"</p>
                          ) : (
                            <span className="text-xs text-slate-400 italic">Bez poznámky</span>
                          )}
                        </td>
                        <td className="py-4 px-6">
                          {inquiry.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full text-xs font-bold border border-yellow-200">
                              Nová poptávka
                            </span>
                          )}
                          {inquiry.status === 'converted' && (
                            <span className="inline-flex items-center gap-1 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-xs font-bold border border-green-200">
                              Smlouva vytvořena
                            </span>
                          )}
                          {inquiry.status === 'cancelled' && (
                            <span className="inline-flex items-center gap-1 bg-slate-50 text-slate-500 px-2.5 py-1 rounded-full text-xs font-bold border border-slate-200 line-through">
                              Stornováno
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            {inquiry.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleConvertInquiry(inquiry)}
                                  className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-all flex items-center gap-1 shadow-sm"
                                  title="Převést na smlouvu"
                                >
                                  Schválit & smlouva
                                </button>
                                <button
                                  onClick={() => handleCancelInquiry(inquiry.id)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 text-xs font-semibold rounded-lg transition-all"
                                  title="Stornovat poptávku"
                                >
                                  Storno
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => handleDeleteInquiry(inquiry.id)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Smazat poptávku navždy"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'new-contract' && (
        <form onSubmit={handleCreateContract} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-8">
          
          {/* Section 1: Tenant Information */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">1. Údaje o nájemci</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Celé Jméno *</label>
                <input 
                  type="text" 
                  required 
                  value={tenantName}
                  onChange={e => setTenantName(e.target.value)}
                  placeholder="např. Jan Novák" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Datum narození</label>
                <input 
                  type="date" 
                  value={tenantBirthDate}
                  onChange={e => setTenantBirthDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trvalá adresa</label>
                <input 
                  type="text" 
                  value={tenantAddress}
                  onChange={e => setTenantAddress(e.target.value)}
                  placeholder="Ulice, č.p., obec, PSČ" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Číslo OP / Pasu</label>
                <input 
                  type="text" 
                  value={tenantIdNumber}
                  onChange={e => setTenantIdNumber(e.target.value)}
                  placeholder="např. 123456789" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Číslo řidičského průkazu</label>
                <input 
                  type="text" 
                  value={tenantDlNumber}
                  onChange={e => setTenantDlNumber(e.target.value)}
                  placeholder="např. EA123456" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Telefon</label>
                <input 
                  type="tel" 
                  value={tenantPhone}
                  onChange={e => setTenantPhone(e.target.value)}
                  placeholder="např. +420 777 123 456" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1 md:col-span-2 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">E-mail</label>
                <input 
                  type="email" 
                  value={tenantEmail}
                  onChange={e => setTenantEmail(e.target.value)}
                  placeholder="např. jan.novak@email.cz" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Volitelné údaje (narození, OP, ŘP, adresa) může nájemce dodatečně vyplnit sám při podpisu smlouvy.
            </p>
          </div>

          {/* Section 2: Dates and Price */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <Calendar className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">2. Termín a podmínky nájmu</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Začátek pronájmu (Datum & Čas) *</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    required
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                  />
                  <select
                    value={startTime}
                    onChange={e => setStartTime(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-xs font-bold focus:bg-white focus:border-primary outline-none"
                  >
                    {['07:00', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Konec pronájmu (Datum & Čas) *</label>
                <div className="flex gap-2">
                  <input 
                    type="date" 
                    required
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                  />
                  <select
                    value={endTime}
                    onChange={e => setEndTime(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-2 py-3 text-xs font-bold focus:bg-white focus:border-primary outline-none"
                  >
                    {['07:00', '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '20:00'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Cena za den (výchozí: {settings.dailyPrice} Kč)</label>
                <input 
                  type="number" 
                  value={customDailyPrice}
                  onChange={e => setCustomDailyPrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={`${settings.dailyPrice} Kč`} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kauce (výchozí: {settings.deposit} Kč)</label>
                <input 
                  type="number" 
                  value={customDeposit}
                  onChange={e => setCustomDeposit(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={`${settings.deposit} Kč`} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Extra clauses / Special arrangements */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <FileText className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">3. Zvláštní ujednání</h2>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Dodatečné podmínky smlouvy</label>
              <textarea 
                rows={3}
                value={additionalTerms}
                onChange={e => setAdditionalTerms(e.target.value)}
                placeholder="např. Povoleno vycestovat do Chorvatska, zapůjčení kávovaru Nespresso zdarma, vrácení nejpozději do 18:00 hod." 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit"
              className="bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all text-sm"
            >
              Uložit a generovat odkaz pro podpis
            </button>
          </div>
        </form>
      )}

      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-8">
          
          {/* Landlord information */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <User className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Údaje o pronajímateli</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Jméno / Firma *</label>
                <input 
                  type="text" 
                  required 
                  value={ownerName}
                  onChange={e => setOwnerName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">IČO (volitelné)</label>
                <input 
                  type="text" 
                  value={ownerId}
                  onChange={e => setOwnerId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trvalé bydliště / Sídlo *</label>
                <input 
                  type="text" 
                  required 
                  value={ownerAddress}
                  onChange={e => setOwnerAddress(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Telefon *</label>
                <input 
                  type="text" 
                  required 
                  value={ownerPhone}
                  onChange={e => setOwnerPhone(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">E-mail *</label>
                <input 
                  type="email" 
                  required 
                  value={ownerEmail}
                  onChange={e => setOwnerEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Číslo bankovního účtu *</label>
                <input 
                  type="text" 
                  required 
                  value={ownerBank}
                  onChange={e => setOwnerBank(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Vehicle Settings */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <Car className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Specifikace vozidla</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Značka *</label>
                <input 
                  type="text" 
                  required 
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Model *</label>
                <input 
                  type="text" 
                  required 
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Registrační značka (SPZ) *</label>
                <input 
                  type="text" 
                  required 
                  value={plateNumber}
                  onChange={e => setPlateNumber(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Rok výroby *</label>
                <input 
                  type="number" 
                  required 
                  value={year}
                  onChange={e => setYear(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* Standard Pricing and rules */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Výchozí cenové podmínky</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Denní nájemné *</label>
                <input 
                  type="number" 
                  required 
                  value={dailyPrice}
                  onChange={e => setDailyPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kauce (depozit) *</label>
                <input 
                  type="number" 
                  required 
                  value={deposit}
                  onChange={e => setDeposit(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Servisní / Úklidový poplatek *</label>
                <input 
                  type="number" 
                  required 
                  value={cleaningFee}
                  onChange={e => setCleaningFee(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Denní limit km (0 = neomezený)</label>
                <input 
                  type="number" 
                  required 
                  value={kmLimitPerDay}
                  onChange={e => setKmLimitPerDay(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kč za nadlimitní km</label>
                <input 
                  type="number" 
                  required 
                  value={kmOverLimitPrice}
                  onChange={e => setKmOverLimitPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Servisní pauza mezi nájmy (hodin) *</label>
                <input 
                  type="number" 
                  step="0.5"
                  min="0"
                  required 
                  value={bufferHours}
                  onChange={e => setBufferHours(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
              <Info className="w-3.5 h-3.5" /> Servisní pauza vytváří vyžadovanou mezeru pro úklid a údržbu vozu mezi vrácením a dalším vyzvednutím (např. 1.5 h).
            </p>
          </div>

          {/* Admin Security Settings */}
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-6">
              <div className="bg-primary/10 text-primary p-1.5 rounded-lg">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">Zabezpečení administrace</h2>
            </div>

            {passwordSuccessMessage && (
              <div className="mb-4 p-3.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>Heslo pro vstup do administrace bylo úspěšně změněno.</span>
              </div>
            )}
            
            <p className="text-xs text-slate-500 mb-4">
              Zde můžete změnit heslo vyžadované při vstupu do portálu administrace majitele.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Nové heslo administrátora</label>
                <input 
                  type="password" 
                  value={newAdminPassword}
                  onChange={e => setNewAdminPassword(e.target.value)}
                  placeholder="Ponechte prázdné pro zachování..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Potvrzení nového hesla</label>
                <input 
                  type="password" 
                  value={confirmAdminPassword}
                  onChange={e => setConfirmAdminPassword(e.target.value)}
                  placeholder="Zadejte heslo znovu..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="submit"
              className="bg-primary text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/10 hover:bg-primary/90 transition-all text-sm"
            >
              Uložit nastavení
            </button>
          </div>
        </form>
      )}

      {/* Email Sharing Modal */}
      {emailModalContract && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="bg-sky-100 text-sky-700 p-2.5 rounded-2xl">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Odeslat smlouvu zákazníkovi e-mailem</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Příjemce: <strong className="text-slate-800">{emailModalContract.tenantName}</strong> ({emailModalContract.tenantEmail || 'e-mail nezadán'})
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setEmailModalContract(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Explanation box */}
            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 text-xs text-sky-900 flex gap-3 items-start">
              <Info className="w-5 h-5 text-sky-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <strong className="block font-bold">Přímý odkaz do Zákaznického Portálu</strong>
                <p className="leading-relaxed">
                  Tento e-mail obsahuje přímý bezpečný odkaz do osobního klientského portálu nájemce. Zákazník v něm uvidí pouze svou smlouvu k nahlédnutí a elektronickému podpisu bez přístupu k administraci.
                </p>
              </div>
            </div>

            {/* Email Text Preview / Textarea */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-wider block">Text e-mailu pro zákazníka</label>
              <textarea 
                readOnly
                rows={11}
                value={getEmailText(emailModalContract)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-700 leading-relaxed outline-none resize-none focus:bg-white"
              />
            </div>

            {/* Direct action buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => sendDirectEmail(emailModalContract)}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" /> Otevřít v e-mailovém programu (mailto:)
              </button>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(getEmailText(emailModalContract));
                  setCopiedEmailText(true);
                  setTimeout(() => setCopiedEmailText(false), 2500);
                }}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copiedEmailText ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" /> Zkopírováno do schránky!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 text-slate-500" /> Zkopírovat kompletní e-mail
                  </>
                )}
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs">
              <button
                onClick={() => {
                  const link = getContractLink(emailModalContract);
                  navigator.clipboard.writeText(link);
                  alert('Přímý odkaz pro zákazníka byl zkopírován do schránky:\n' + link);
                }}
                className="text-primary hover:underline font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Zkopírovat pouze přímý URL odkaz
              </button>

              <button 
                onClick={() => setEmailModalContract(null)}
                className="text-slate-500 hover:text-slate-800 font-semibold px-4 py-2 cursor-pointer"
              >
                Zavřít
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
