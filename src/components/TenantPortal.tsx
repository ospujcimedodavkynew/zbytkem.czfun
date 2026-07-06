import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle, 
  FileText, 
  Signature, 
  Send, 
  Printer, 
  Share2, 
  Edit2, 
  ChevronRight, 
  Info,
  Car,
  Calendar,
  DollarSign
} from 'lucide-react';
import { ContractData, CampervanSettings } from '../types';
import { calculateContractPrice, encodeContract, getStoredSettings } from '../utils/contractUtils';
import SignaturePad from './SignaturePad';
import ContractDocument from './ContractDocument';
import Logo from './Logo';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface TenantPortalProps {
  initialContract: Partial<ContractData>;
  onBackToMain?: () => void;
}

export default function TenantPortal({ initialContract, onBackToMain }: TenantPortalProps) {
  const [contract, setContract] = useState<Partial<ContractData>>(initialContract);
  const [settings] = useState<CampervanSettings>(getStoredSettings());
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Info review, 2: Document review, 3: Signature, 4: Success/Print
  
  // Input fields for the tenant (to fill out missing data)
  const [tenantName, setTenantName] = useState(contract.tenantName || '');
  const [tenantBirthDate, setTenantBirthDate] = useState(contract.tenantBirthDate || '');
  const [tenantIdNumber, setTenantIdNumber] = useState(contract.tenantIdNumber || '');
  const [tenantDlNumber, setTenantDlNumber] = useState(contract.tenantDlNumber || '');
  const [tenantAddress, setTenantAddress] = useState(contract.tenantAddress || '');
  const [tenantPhone, setTenantPhone] = useState(contract.tenantPhone || '');
  const [tenantEmail, setTenantEmail] = useState(contract.tenantEmail || '');

  const [signatureImage, setSignatureImage] = useState(contract.tenantSignature || '');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signedLink, setSignedLink] = useState('');

  // Auto-redirect if already signed in the URL payload
  useEffect(() => {
    if (contract.isSigned && contract.tenantSignature) {
      setStep(4);
      setSignedLink(window.location.href);
    }
  }, [contract]);

  const price = calculateContractPrice(
    contract.startDate || '',
    contract.endDate || '',
    contract.dailyPrice || settings.dailyPrice,
    contract.cleaningFee || settings.cleaningFee
  );

  const formatDateText = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      return format(new Date(dateStr), 'd. M. yyyy', { locale: cs });
    } catch {
      return dateStr;
    }
  };

  const handleNextToDoc = () => {
    if (!tenantName || !tenantPhone || !tenantEmail) {
      alert('Prosím vyplňte jméno, telefon a e-mail, abychom mohli pokračovat.');
      return;
    }

    const updatedContract = {
      ...contract,
      tenantName,
      tenantBirthDate,
      tenantIdNumber,
      tenantDlNumber,
      tenantAddress,
      tenantPhone,
      tenantEmail
    };
    
    setContract(updatedContract);
    setStep(2);
  };

  const handleNextToSignature = () => {
    setStep(3);
  };

  const handleConfirmSignature = () => {
    if (!signatureImage) {
      alert('Prosím nakreslete svůj podpis do vyznačeného pole.');
      return;
    }
    if (!agreedToTerms) {
      alert('Pro dokončení musíte souhlasit se zněním nájemní smlouvy.');
      return;
    }

    // Capture signature, timestamp and mock IP details
    const finalContract: ContractData = {
      id: contract.id || 'c_' + Math.random().toString(36).substring(2, 11),
      createdAt: contract.createdAt || new Date().toISOString(),
      tenantName,
      tenantBirthDate,
      tenantIdNumber,
      tenantDlNumber,
      tenantAddress,
      tenantPhone,
      tenantEmail,
      startDate: contract.startDate || '',
      endDate: contract.endDate || '',
      dailyPrice: contract.dailyPrice || settings.dailyPrice,
      deposit: contract.deposit || settings.deposit,
      cleaningFee: contract.cleaningFee || settings.cleaningFee,
      kmLimitPerDay: contract.kmLimitPerDay || settings.kmLimitPerDay,
      kmOverLimitPrice: contract.kmOverLimitPrice || settings.kmOverLimitPrice,
      additionalTerms: contract.additionalTerms || '',
      tenantSignature: signatureImage,
      isSigned: true,
      signedAt: new Date().toISOString(),
      signedIp: '85.160.12.92' // Mock user external IP
    };

    setContract(finalContract);
    
    // Save locally to local history as well if the owner is looking at it
    try {
      const stored = localStorage.getItem('obytkem_contracts');
      if (stored) {
        const list: ContractData[] = JSON.parse(stored);
        const index = list.findIndex(c => c.id === finalContract.id);
        if (index !== -1) {
          list[index] = finalContract;
        } else {
          list.unshift(finalContract);
        }
        localStorage.setItem('obytkem_contracts', JSON.stringify(list));
      } else {
        localStorage.setItem('obytkem_contracts', JSON.stringify([finalContract]));
      }
    } catch (e) {
      console.error(e);
    }

    // Generate signed URL link
    const baseUrl = window.location.origin + window.location.pathname;
    const encoded = encodeContract(finalContract);
    const newLink = `${baseUrl}?contract=${encoded}`;
    setSignedLink(newLink);
    
    setStep(4);
    
    // Smooth scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const shareSignedWhatsApp = () => {
    const msg = `Ahoj, podepsal(a) jsem smlouvu o pronájmu obytňáku. Odkaz na podepsanou smlouvu k nahlédnutí a tisku zde: ${signedLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const shareSignedEmail = () => {
    const subject = `Podepsaná nájemní smlouva - ${tenantName}`;
    const body = `Dobrý den,\n\npodepsal(a) jsem smlouvu o pronájmu obytného vozu.\n\nOdkaz na podepsanou smlouvu k nahlédnutí a tisku naleznete zde:\n${signedLink}\n\nS pozdravem,\n${tenantName}`;
    window.open(`mailto:${settings.ownerEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 print:py-0">
      
      {/* Brand logo at top */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <Logo className="w-10 h-10" />
        {onBackToMain && (
          <button 
            onClick={onBackToMain}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-4 py-2 rounded-xl transition-all"
          >
            Zpět na úvod
          </button>
        )}
      </div>

      {/* Progress wizard indicator (hidden in print) */}
      {step < 4 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-4 mb-8 flex justify-between items-center print:hidden text-xs md:text-sm">
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step >= 1 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>1</span>
            <span className={`font-semibold ${step === 1 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>Údaje</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step >= 2 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>2</span>
            <span className={`font-semibold ${step === 2 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>Kontrola smlouvy</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-300" />
          <div className="flex items-center gap-2">
            <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${step >= 3 ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500'}`}>3</span>
            <span className={`font-semibold ${step === 3 ? 'text-slate-900 font-bold' : 'text-slate-400'}`}>Podpis</span>
          </div>
        </div>
      )}

      {/* STEP 1: Info Review */}
      {step === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-8 print:hidden"
        >
          {/* Welcome Header */}
          <div className="text-center max-w-lg mx-auto">
            <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Car className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Ahoj {tenantName || 'cestovateli'}!</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Majitel <strong className="text-slate-800">{settings.ownerName}</strong> ti připravil návrh nájemní smlouvy na obytný vůz <strong className="text-slate-800">{settings.brand} {settings.model}</strong>.
            </p>
          </div>

          {/* Quick summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-center">
              <Car className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Vozidlo</p>
                <p className="text-xs font-bold text-slate-800">{settings.brand} ({settings.plateNumber})</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-center">
              <Calendar className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Termín pronájmu</p>
                <p className="text-xs font-bold text-slate-800">{formatDateText(contract.startDate)} - {formatDateText(contract.endDate)}</p>
              </div>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-3 items-center">
              <DollarSign className="w-5 h-5 text-primary flex-shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Celková cena</p>
                <p className="text-xs font-bold text-slate-800">{price.grandTotal.toLocaleString('cs-CZ')} Kč</p>
              </div>
            </div>
          </div>

          {/* Data Form */}
          <div className="space-y-6">
            <div className="border-b border-slate-100 pb-2">
              <h2 className="text-base font-bold text-slate-900">Zkontroluj a doplň své osobní údaje</h2>
              <p className="text-xs text-slate-400">Tyto údaje budou automaticky doplněny do finálního znění nájemní smlouvy.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Celé Jméno a Příjmení *</label>
                <input 
                  type="text" 
                  required
                  value={tenantName}
                  onChange={e => setTenantName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Datum narození *</label>
                <input 
                  type="date" 
                  required
                  value={tenantBirthDate}
                  onChange={e => setTenantBirthDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Trvalá adresa bydliště *</label>
                <input 
                  type="text" 
                  required
                  value={tenantAddress}
                  onChange={e => setTenantAddress(e.target.value)}
                  placeholder="Ulice, č.p., město, PSČ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Číslo OP nebo Pasu *</label>
                <input 
                  type="text" 
                  required
                  value={tenantIdNumber}
                  onChange={e => setTenantIdNumber(e.target.value)}
                  placeholder="např. 123456789"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Číslo řidičského průkazu *</label>
                <input 
                  type="text" 
                  required
                  value={tenantDlNumber}
                  onChange={e => setTenantDlNumber(e.target.value)}
                  placeholder="např. EA123456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">Telefonní číslo *</label>
                <input 
                  type="tel" 
                  required
                  value={tenantPhone}
                  onChange={e => setTenantPhone(e.target.value)}
                  placeholder="např. +420 777 123 456"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-xs font-bold text-slate-600 uppercase tracking-wider">E-mail *</label>
                <input 
                  type="email" 
                  required
                  value={tenantEmail}
                  onChange={e => setTenantEmail(e.target.value)}
                  placeholder="např. tvuj.email@seznam.cz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:bg-white focus:border-primary outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button 
              type="button"
              onClick={handleNextToDoc}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center gap-2 text-sm"
            >
              Pokračovat ke smlouvě <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 2: Document Review */}
      {step === 2 && (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }}
          className="space-y-6 print:hidden"
        >
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex gap-3 items-center">
            <Info className="w-5 h-5 text-primary flex-shrink-0" />
            <p className="text-xs text-slate-600 leading-relaxed">
              Zde vidíš kompletní vygenerovaný právní dokument podle tvých zadaných údajů. Prosím, pečlivě si ho přečti, než přistoupíš k podpisu.
            </p>
          </div>

          {/* The Contract Document renderer */}
          <ContractDocument contract={contract} settings={settings} />

          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
            <button 
              onClick={() => setStep(1)}
              className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Upravit údaje
            </button>
            <button 
              onClick={handleNextToSignature}
              className="bg-primary hover:bg-primary/90 text-white font-bold px-8 py-3.5 rounded-xl shadow-lg shadow-primary/10 transition-all flex items-center gap-2 text-sm"
            >
              Přejít k podpisu <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 3: Signature Drawing */}
      {step === 3 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm p-6 md:p-8 space-y-8 print:hidden"
        >
          <div className="text-center max-w-md mx-auto">
            <div className="bg-primary/10 text-primary w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Signature className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Elektronický podpis smlouvy</h2>
            <p className="text-sm text-slate-400 mt-1">Podpis má plnou právní váhu a stvrdí platnost nájemního vztahu.</p>
          </div>

          {/* Canvas Signature Pad */}
          <SignaturePad 
            onSave={setSignatureImage}
            savedSignature={signatureImage}
            placeholderText="Zde se prstem nebo myší podepište"
          />

          {/* Terms Agreement Checkbox */}
          <label className="flex gap-3 items-start bg-slate-50 p-4 rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-100/50 transition-all">
            <input 
              type="checkbox" 
              checked={agreedToTerms}
              onChange={e => setAgreedToTerms(e.target.checked)}
              className="mt-1 w-4 h-4 text-primary border-slate-300 rounded focus:ring-primary focus:ring-1"
            />
            <span className="text-xs text-slate-600 leading-relaxed">
              Souhlasím s podmínkami výše zobrazené Smlouvy o nájmu dopravního prostředku, potvrzuji správnost mých údajů a chci dokument elektronicky podepsat a uzavřít.
            </span>
          </label>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <button 
              onClick={() => setStep(2)}
              className="px-6 py-3 border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl text-sm transition-all"
            >
              Zpět ke smlouvě
            </button>
            <button 
              onClick={handleConfirmSignature}
              disabled={!signatureImage || !agreedToTerms}
              className={`font-bold px-8 py-4 rounded-xl shadow-lg transition-all flex items-center gap-2 text-sm ${(!signatureImage || !agreedToTerms) ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none' : 'bg-primary text-white hover:bg-primary/90 shadow-primary/10'}`}
            >
              Potvrdit a podepsat smlouvu
            </button>
          </div>
        </motion.div>
      )}

      {/* STEP 4: Success Screen & Finished PDF printable preview */}
      {step === 4 && (
        <div className="space-y-8">
          {/* Success Banner */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 md:p-8 text-center max-w-2xl mx-auto print:hidden">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <CheckCircle className="w-10 h-10" />
            </motion.div>
            
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Smlouva byla úspěšně podepsána!</h1>
            <p className="text-slate-500 mt-2 text-sm">
              Skvělé, smlouva je nyní oboustranně uzavřena. Nyní musíš poslat podepsaný dokument zpět majiteli.
            </p>

            {/* Dynamic sharing buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
              <button
                onClick={shareSignedWhatsApp}
                className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-sm shadow-md"
              >
                <Share2 className="w-4 h-4" /> Odeslat WhatsAppem
              </button>
              
              <button
                onClick={shareSignedEmail}
                className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white font-bold py-3.5 px-4 rounded-xl transition-all text-sm shadow-md"
              >
                <Send className="w-4 h-4" /> Poslat na E-mail
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-bold py-3.5 px-4 rounded-xl transition-all text-sm shadow-sm"
              >
                <Printer className="w-4 h-4" /> Vytisknout / PDF
              </button>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-100 rounded-2xl flex gap-2 items-start text-left text-xs text-slate-700">
              <Info className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Důležité pro uložení:</strong>
                Zkopíruj si odkaz z adresního řádku nebo klikni na tlačítko výše a ulož si ho. Podpis je bezpečně uložen přímo v tomto unikátním odkazu, takže k němu budeš mít kdykoliv přístup.
              </div>
            </div>
          </div>

          {/* Render the printable fully signed contract document */}
          <div className="print:m-0">
            <div className="flex justify-between items-center mb-4 print:hidden px-2">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" /> Podepsaný originál smlouvy
              </h2>
              <span className="text-xs bg-green-100 text-green-800 font-bold px-3 py-1 rounded-full border border-green-200">
                Aktivní a platná
              </span>
            </div>
            <ContractDocument contract={contract} settings={settings} />
          </div>
        </div>
      )}

    </div>
  );
}
