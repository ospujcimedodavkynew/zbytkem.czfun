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
  Car
} from 'lucide-react';
import { ContractData, CampervanSettings } from '../types';
import { 
  getStoredSettings, 
  saveStoredSettings, 
  encodeContract, 
  calculateContractPrice 
} from '../utils/contractUtils';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface HostDashboardProps {
  onViewContract: (contract: ContractData) => void;
}

export default function HostDashboard({ onViewContract }: HostDashboardProps) {
  const [activeTab, setActiveTab] = useState<'contracts' | 'new-contract' | 'settings'>('contracts');
  const [settings, setSettings] = useState<CampervanSettings>(getStoredSettings());
  const [contracts, setContracts] = useState<ContractData[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form states for a new contract
  const [tenantName, setTenantName] = useState('');
  const [tenantBirthDate, setTenantBirthDate] = useState('');
  const [tenantIdNumber, setTenantIdNumber] = useState('');
  const [tenantDlNumber, setTenantDlNumber] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customDailyPrice, setCustomDailyPrice] = useState<number | ''>('');
  const [customDeposit, setCustomDeposit] = useState<number | ''>('');
  const [customCleaningFee, setCustomCleaningFee] = useState<number | ''>('');
  const [additionalTerms, setAdditionalTerms] = useState('');

  // Settings form states
  const [ownerName, setOwnerName] = useState(settings.ownerName);
  const [ownerId, setOwnerId] = useState(settings.ownerId);
  const [ownerAddress, setOwnerAddress] = useState(settings.ownerAddress);
  const [ownerPhone, setOwnerPhone] = useState(settings.ownerPhone);
  const [ownerEmail, setOwnerEmail] = useState(settings.ownerEmail);
  const [ownerBank, setOwnerBank] = useState(settings.ownerBank);
  const [brand, setBrand] = useState(settings.brand);
  const [model, setModel] = useState(settings.model);
  const [plateNumber, setPlateNumber] = useState(settings.plateNumber);
  const [year, setYear] = useState(settings.year);
  const [dailyPrice, setDailyPrice] = useState(settings.dailyPrice);
  const [deposit, setDeposit] = useState(settings.deposit);
  const [cleaningFee, setCleaningFee] = useState(settings.cleaningFee);
  const [kmLimitPerDay, setKmLimitPerDay] = useState(settings.kmLimitPerDay);
  const [kmOverLimitPrice, setKmOverLimitPrice] = useState(settings.kmOverLimitPrice);

  useEffect(() => {
    // Load contracts from localStorage
    const loadContracts = () => {
      try {
        const stored = localStorage.getItem('obytkem_contracts');
        if (stored) {
          setContracts(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Error loading contracts', err);
      }
    };
    loadContracts();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
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
      kmOverLimitPrice
    };
    setSettings(updated);
    saveStoredSettings(updated);
    alert('Nastavení uloženo!');
  };

  const handleCreateContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantName || !startDate || !endDate) {
      alert('Prosím vyplňte alespoň jméno nájemce, začátek a konec nájmu.');
      return;
    }

    const priceOverride = customDailyPrice !== '' ? Number(customDailyPrice) : settings.dailyPrice;
    const depositOverride = customDeposit !== '' ? Number(customDeposit) : settings.deposit;
    const cleaningOverride = customCleaningFee !== '' ? Number(customCleaningFee) : settings.cleaningFee;

    const newContract: ContractData = {
      id: 'c_' + Math.random().toString(36).substring(2, 11),
      createdAt: new Date().toISOString(),
      tenantName,
      tenantBirthDate,
      tenantIdNumber,
      tenantDlNumber,
      tenantAddress,
      tenantPhone,
      tenantEmail,
      startDate,
      endDate,
      dailyPrice: priceOverride,
      deposit: depositOverride,
      cleaningFee: cleaningOverride,
      kmLimitPerDay: settings.kmLimitPerDay,
      kmOverLimitPrice: settings.kmOverLimitPrice,
      additionalTerms,
      isSigned: false
    };

    const updatedContracts = [newContract, ...contracts];
    setContracts(updatedContracts);
    localStorage.setItem('obytkem_contracts', JSON.stringify(updatedContracts));

    // Clear form
    setTenantName('');
    setTenantBirthDate('');
    setTenantIdNumber('');
    setTenantDlNumber('');
    setTenantAddress('');
    setTenantPhone('');
    setTenantEmail('');
    setStartDate('');
    setEndDate('');
    setCustomDailyPrice('');
    setCustomDeposit('');
    setCustomCleaningFee('');
    setAdditionalTerms('');

    // Switch to lists
    setActiveTab('contracts');
  };

  const handleDeleteContract = (id: string) => {
    if (confirm('Opravdu chcete tuto smlouvu smazat?')) {
      const updated = contracts.filter(c => c.id !== id);
      setContracts(updated);
      localStorage.setItem('obytkem_contracts', JSON.stringify(updated));
    }
  };

  const getContractLink = (contract: ContractData) => {
    const baseUrl = window.location.origin + window.location.pathname;
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

  const formatDateText = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'd. M. yyyy', { locale: cs });
    } catch {
      return dateStr;
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
        
        <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 p-1">
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
          {contracts.length === 0 ? (
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
                  {contracts.map(contract => {
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
                            <span>{formatDateText(contract.startDate)} - {formatDateText(contract.endDate)}</span>
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
                            {/* Copy link button */}
                            <button
                              onClick={() => copyToClipboard(link, contract.id)}
                              className="p-2 text-slate-500 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                              title="Kopírovat odkaz"
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
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Začátek pronájmu *</label>
                <input 
                  type="date" 
                  required
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Konec pronájmu *</label>
                <input 
                  type="date" 
                  required
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
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
              <div className="space-y-1 lg:col-span-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Kč za nadlimitní km</label>
                <input 
                  type="number" 
                  required 
                  value={kmOverLimitPrice}
                  onChange={e => setKmOverLimitPrice(Number(e.target.value))}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
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

    </div>
  );
}
