import { ContractData, CampervanSettings } from '../types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';

interface ContractDocumentProps {
  contract: Partial<ContractData>;
  settings: CampervanSettings;
}

export default function ContractDocument({ contract, settings }: ContractDocumentProps) {
  // Safe date formatting helpers
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '_______________';
    try {
      return format(new Date(dateStr), 'd. M. yyyy', { locale: cs });
    } catch {
      return dateStr;
    }
  };

  const calculateDays = () => {
    if (!contract.startDate || !contract.endDate) return 0;
    try {
      const start = new Date(contract.startDate);
      const end = new Date(contract.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    } catch {
      return 0;
    }
  };

  const daysCount = calculateDays();
  const dailyPrice = contract.dailyPrice ?? settings.dailyPrice;
  const cleaningFee = contract.cleaningFee ?? settings.cleaningFee;
  const deposit = contract.deposit ?? settings.deposit;
  const rentalTotal = daysCount * dailyPrice;
  const grandTotal = rentalTotal + cleaningFee;
  const kmLimit = contract.kmLimitPerDay ?? settings.kmLimitPerDay;
  const kmLimitText = kmLimit === 0 ? "neomezený" : `${kmLimit * daysCount} km (denní limit ${kmLimit} km)`;

  return (
    <div id="contract-print-area" className="bg-white text-slate-800 p-8 md:p-12 border border-slate-200 rounded-2xl shadow-sm text-sm leading-relaxed max-w-4xl mx-auto font-sans print:p-0 print:border-none print:shadow-none print:text-[12px]">
      
      {/* Document Header */}
      <div className="text-center border-b border-slate-300 pb-6 mb-8">
        <h1 className="text-2xl font-bold uppercase tracking-tight text-slate-900 mb-2 font-display">
          Smlouva o nájmu dopravního prostředku
        </h1>
        <p className="text-xs text-slate-500 uppercase tracking-widest font-mono">
          uzavřená podle ustanovení § 2321 a násl. občanského zákoníku č. 89/2012 Sb.
        </p>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Landlord */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:p-0 print:border-none">
          <h2 className="font-bold text-slate-900 mb-3 uppercase tracking-wide text-xs border-b border-slate-200 pb-1">
            1. Pronajímatel
          </h2>
          <div className="space-y-1.5 font-mono text-xs">
            <p><span className="font-sans font-semibold text-slate-600">Jméno:</span> {settings.ownerName}</p>
            {settings.ownerId && <p><span className="font-sans font-semibold text-slate-600">IČO:</span> {settings.ownerId}</p>}
            <p><span className="font-sans font-semibold text-slate-600">Adresa:</span> {settings.ownerAddress}</p>
            <p><span className="font-sans font-semibold text-slate-600">Telefon:</span> {settings.ownerPhone}</p>
            <p><span className="font-sans font-semibold text-slate-600">E-mail:</span> {settings.ownerEmail}</p>
            <p><span className="font-sans font-semibold text-slate-600">Bank. účet:</span> {settings.ownerBank}</p>
          </div>
        </div>

        {/* Renter */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 print:bg-transparent print:p-0 print:border-none">
          <h2 className="font-bold text-slate-900 mb-3 uppercase tracking-wide text-xs border-b border-slate-200 pb-1">
            2. Nájemce
          </h2>
          <div className="space-y-1.5 font-mono text-xs">
            <p><span className="font-sans font-semibold text-slate-600">Jméno:</span> {contract.tenantName || '_______________'}</p>
            <p><span className="font-sans font-semibold text-slate-600">Dat. nar.:</span> {formatDate(contract.tenantBirthDate)}</p>
            <p><span className="font-sans font-semibold text-slate-600">Č. OP/Pasu:</span> {contract.tenantIdNumber || '_______________'}</p>
            <p><span className="font-sans font-semibold text-slate-600">Č. ŘP:</span> {contract.tenantDlNumber || '_______________'}</p>
            <p><span className="font-sans font-semibold text-slate-600">Adresa:</span> {contract.tenantAddress || '_______________'}</p>
            <p><span className="font-sans font-semibold text-slate-600">Telefon:</span> {contract.tenantPhone || '_______________'}</p>
            <p><span className="font-sans font-semibold text-slate-600">E-mail:</span> {contract.tenantEmail || '_______________'}</p>
          </div>
        </div>
      </div>

      {/* Contract clauses */}
      <div className="space-y-6 text-slate-700">
        
        {/* Section I */}
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Čl. I - Předmět nájmu</h3>
          <p>
            1. Pronajímatel prohlašuje, že je vlastníkem / oprávněným provozovatelem motorového vozidla značky{' '}
            <strong className="text-slate-900">{settings.brand} {settings.model}</strong>,{' '}
            rok výroby <strong className="text-slate-900">{settings.year}</strong>, registrační značky (SPZ){' '}
            <strong className="text-slate-900">{settings.plateNumber}</strong> (dále jen „Předmět nájmu“ nebo „vozidlo“).
          </p>
          <p className="mt-1">
            2. Pronajímatel touto smlouvou přenechává nájemci Předmět nájmu k dočasnému užívání a nájemce se zavazuje zaplatit za to pronajímateli nájemné a dodržovat podmínky stanovené touto smlouvou.
          </p>
        </div>

        {/* Section II */}
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Čl. II - Doba nájmu a předání vozidla</h3>
          <p>
            1. Nájemní poměr se uzavírá na dobu určitou od{' '}
            <strong className="text-slate-900">{formatDate(contract.startDate)}</strong> do{' '}
            <strong className="text-slate-900">{formatDate(contract.endDate)}</strong> (celkem{' '}
            <strong className="text-slate-900">{daysCount}</strong> {daysCount === 1 ? 'den' : (daysCount >= 2 && daysCount <= 4 ? 'dny' : 'dní')}).
          </p>
          <p className="mt-1">
            2. Místem předání a vrácení vozidla je sídlo pronajímatele, nebude-li písemně dohodnuto jinak. Vozidlo bude předáno s plnou nádrží paliva a ve stejném stavu musí být také vráceno.
          </p>
        </div>

        {/* Section III */}
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Čl. III - Nájemné, poplatky a kauce</h3>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 font-mono text-xs space-y-1.5 print:bg-transparent print:p-0 print:border-none print:mt-1">
            <p><span className="font-sans font-semibold text-slate-600">Denní nájemné:</span> {dailyPrice.toLocaleString('cs-CZ')} Kč</p>
            <p><span className="font-sans font-semibold text-slate-600">Počet dní nájmu:</span> {daysCount} x</p>
            <p><span className="font-sans font-semibold text-slate-600">Celkové nájemné:</span> {rentalTotal.toLocaleString('cs-CZ')} Kč</p>
            <p><span className="font-sans font-semibold text-slate-600">Servisní / úklidový poplatek:</span> {cleaningFee.toLocaleString('cs-CZ')} Kč</p>
            <div className="border-t border-slate-300 pt-1.5 my-1.5 flex justify-between font-bold text-slate-900 text-sm print:text-xs">
              <span className="font-sans">CELKEM K ÚHRADĚ:</span>
              <span>{grandTotal.toLocaleString('cs-CZ')} Kč</span>
            </div>
            <p className="text-slate-900 font-bold"><span className="font-sans font-semibold text-slate-600 text-slate-700">Vratná kauce (depozit):</span> {deposit.toLocaleString('cs-CZ')} Kč</p>
            <p><span className="font-sans font-semibold text-slate-600">Limit ujetých kilometrů:</span> {kmLimitText}</p>
            {kmLimit > 0 && <p><span className="font-sans font-semibold text-slate-600">Sazba za nadlimitní km:</span> {contract.kmOverLimitPrice ?? settings.kmOverLimitPrice} Kč / km</p>}
          </div>
          <p className="mt-2">
            1. Nájemce je povinen uhradit celkové nájemné a servisní poplatek nejpozději v den předání vozidla. Vratná kauce slouží k zajištění případných škod na vozidle, jeho vnitřním vybavení nebo nadlimitních kilometrech a skládá se nejpozději při předání vozidla.
          </p>
        </div>

        {/* Section IV */}
        <div>
          <h3 className="font-bold text-slate-900 mb-1">Čl. IV - Práva a povinnosti stran</h3>
          <p>
            1. Nájemce je povinen užívat vozidlo výhradně pro své osobní účely a dbát na to, aby nedošlo k poškození či nadměrnému opotřebení. Ve vozidle je přísně <strong className="text-slate-900">zakázáno kouření</strong> a převážení zvířat (pokud není dohodnuto jinak).
          </p>
          <p className="mt-1">
            2. Vozidlo je pojištěno zákonným i havarijním pojištěním na území Evropy se spoluúčastí ve výši kauce ({deposit.toLocaleString('cs-CZ')} Kč). V případě zaviněné nehody, poškození nebo krádeže vozidla se nájemce podílí na škodě do výše složené kauce. Poškození interiéru a kempingové výbavy se z havarijního pojištění nehradí a nájemce je povinen uhradit škodu v plné výši.
          </p>
          <p className="mt-1">
            3. Nájemce prohlašuje, že disponuje platným řidičským oprávněním skupiny B po dobu minimálně 3 let a je starší 21 let. Vozidlo nesmí řídit žádná jiná osoba než nájemce, pokud to není výslovně uvedeno v dodatku k této smlouvě.
          </p>
        </div>

        {/* Additional terms if present */}
        {contract.additionalTerms && (
          <div>
            <h3 className="font-bold text-slate-900 mb-1">Čl. V - Zvláštní ujednání</h3>
            <p className="whitespace-pre-line bg-yellow-50/50 p-4 rounded-xl border border-yellow-100 italic font-mono text-xs text-slate-800 print:bg-transparent print:p-0 print:border-none">
              {contract.additionalTerms}
            </p>
          </div>
        )}
      </div>

      {/* Signature area */}
      <div className="mt-12 pt-8 border-t border-slate-300">
        <p className="text-xs text-slate-500 mb-6 text-center italic">
          Smluvní strany prohlašují, že si smlouvu přečetly, s jejím obsahem souhlasí a na důkaz toho připojují své podpisy. Smlouva je uzavřena elektronicky.
        </p>
        
        <div className="grid grid-cols-2 gap-8 text-center">
          {/* Landlord signature */}
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Pronajímatel</span>
            <div className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden print:bg-transparent print:border-slate-300">
              {settings.ownerName && (
                <div className="absolute top-2 left-2 text-[10px] font-mono text-slate-400">
                  Digitálně schváleno majitelem
                </div>
              )}
              {/* Fallback text signature if owner hasn't uploaded drawing */}
              <div className="font-display italic text-lg text-primary select-none mt-2">
                {settings.ownerName}
              </div>
            </div>
            <div className="mt-2 text-xs font-mono text-slate-500">
              {settings.ownerName}<br />
              V Praze dne {formatDate(contract.createdAt || new Date().toISOString())}
            </div>
          </div>

          {/* Renter signature */}
          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-2">Nájemce</span>
            <div className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden print:bg-transparent print:border-slate-300">
              {contract.tenantSignature ? (
                <>
                  <img 
                    src={contract.tenantSignature} 
                    alt="Podpis nájemce" 
                    className="max-h-full max-w-full object-contain mix-blend-multiply" 
                  />
                  {contract.signedAt && (
                    <div className="absolute bottom-1 right-2 text-[8px] font-mono text-slate-400">
                      IP: {contract.signedIp || 'N/A'}
                    </div>
                  )}
                </>
              ) : (
                <span className="text-xs text-slate-400 italic">Čeká na podpis</span>
              )}
            </div>
            <div className="mt-2 text-xs font-mono text-slate-500">
              {contract.tenantName || '_______________'}<br />
              {contract.signedAt ? (
                <span>Podepsáno {formatDate(contract.signedAt)} v {format(new Date(contract.signedAt), 'HH:mm')}</span>
              ) : (
                <span>Datum podpisu: _______________</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
