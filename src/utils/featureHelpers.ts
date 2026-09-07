import { ContractData, CampervanSettings, HandoverProtocol, ExtraAddon } from '../types';
import { format } from 'date-fns';
import { cs } from 'date-fns/locale';
import { calculateRentalDays, DEFAULT_ADDONS } from './contractUtils';

export const EXTRA_ADDONS_CATALOG: ExtraAddon[] = DEFAULT_ADDONS;

/**
 * Generates an iCalendar (.ics) formatted string for a rental contract or all confirmed contracts
 */
export function generateICalFeed(contracts: ContractData[], settings: CampervanSettings): string {
  const formatICSDate = (dateStr: string, timeStr: string = '10:00'): string => {
    try {
      const [h, m] = (timeStr || '10:00').split(':').map(Number);
      const d = new Date(dateStr);
      d.setHours(h || 10, m || 0, 0, 0);
      return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    } catch {
      return '';
    }
  };

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Obytkem.cz//Campervan Rental Calendar//CS',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Obytkem.cz - Rezervace obytného vozu',
    'X-WR-TIMEZONE:Europe/Prague'
  ];

  for (const contract of contracts) {
    if (!contract.startDate || !contract.endDate) continue;
    const startICS = formatICSDate(contract.startDate, contract.startTime || '10:00');
    const endICS = formatICSDate(contract.endDate, contract.endTime || '10:00');
    if (!startICS || !endICS) continue;

    const summary = `🚐 Pronájem: ${contract.tenantName || 'Zákazník'} (${settings.brand} ${settings.model})`;
    const description = `Pronájem vozu ${settings.brand} ${settings.model} (SPZ: ${settings.plateNumber})\\nNájemce: ${contract.tenantName}\\nTelefon: ${contract.tenantPhone || 'Neuveden'}\\nEmail: ${contract.tenantEmail || 'Neuveden'}\\nStav smlouvy: ${contract.isSigned ? 'Podepsáno' : 'Čeká na podpis'}`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:obytkem-${contract.id}@obytkem.cz`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')}`,
      `DTSTART:${startICS}`,
      `DTEND:${endICS}`,
      `SUMMARY:${summary}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${settings.ownerAddress}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Downloads a file to the user's browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/plain') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Message templates generator for WhatsApp & Email
 */
export interface CommunicationTemplate {
  id: string;
  title: string;
  description: string;
  getSubject: (contract: Partial<ContractData>, settings: CampervanSettings) => string;
  getBody: (contract: Partial<ContractData>, settings: CampervanSettings, contractUrl?: string) => string;
  getWhatsApp: (contract: Partial<ContractData>, settings: CampervanSettings, contractUrl?: string) => string;
}

export const COMMUNICATION_TEMPLATES: CommunicationTemplate[] = [
  {
    id: 'contract_signing',
    title: '✍️ Odkaz na elektronický podpis smlouvy',
    description: 'Zašlete nájemci odkaz, kde si může zkontrolovat údaje a přímo v mobilu smlouvu podepsat.',
    getSubject: (contract, settings) => `Podpis nájemní smlouvy - Obytný vůz ${settings.brand} ${settings.model}`,
    getBody: (contract, settings, url) => `Dobrý den, ${contract.tenantName || 'pane/paní'},

děkujeme za Vaši rezervaci obytného vozu ${settings.brand} ${settings.model} (SPZ: ${settings.plateNumber}) v termínu od ${contract.startDate} (${contract.startTime || '10:00'}) do ${contract.endDate} (${contract.endTime || '10:00'}).

Nájemní smlouvu jsme pro Vás připravili k elektronickému podpisu. Otevřete prosím následující odkaz:
${url || window.location.href}

Ve formuláři prosím zkontrolujte Vaše osobní údaje a připojte svůj podpis přímo na displeji mobilu nebo myší.

V případě dotazů jsem Vám k dispozici na tel. ${settings.ownerPhone}.

S pozdravem,
${settings.ownerName}
${settings.ownerPhone} | ${settings.ownerEmail}`,
    getWhatsApp: (contract, settings, url) => `Dobrý den ${contract.tenantName || ''}, zasílám odkaz k elektronickému podpisu nájemní smlouvy na obytný vůz ${settings.brand} v termínu ${contract.startDate} - ${contract.endDate}: ${url || window.location.href} . S pozdravem ${settings.ownerName} (${settings.ownerPhone})`
  },
  {
    id: 'deposit_instructions',
    title: '💳 Instrukce k úhradě a složení kauce',
    description: 'Platební údaje k nájemnému a kauci včetně čísla účtu a variabilního symbolu.',
    getSubject: (contract, settings) => `Platební instrukce a kauce - Obytný vůz ${settings.brand}`,
    getBody: (contract, settings) => {
      const deposit = contract.deposit || settings.deposit;
      return `Dobrý den, ${contract.tenantName || 'pane/paní'},

zasíláme platební údaje k Vašemu pronájmu obytného vozu ${settings.brand} ${settings.model}:

Bankovní spojení: ${settings.ownerBank}
Částka vratné kauce: ${deposit.toLocaleString('cs-CZ')} Kč
Zpráva pro příjemce: Kauce - ${contract.tenantName || 'Pronájem'}

Vratná kauce je splatná před převzetím vozu (bankovním převodem s doložením potvrzení, případně v hotovosti při předání). Kauce Vám bude vrácena ihned po řádném vrácení vozu.

Těšíme se na Vás!
${settings.ownerName}
${settings.ownerPhone}`;
    },
    getWhatsApp: (contract, settings) => `Dobrý den ${contract.tenantName || ''}, zasílám platební údaje pro úhradu kauce ${(contract.deposit || settings.deposit).toLocaleString('cs-CZ')} Kč: Účet: ${settings.ownerBank}, zpráva: Kauce ${contract.tenantName || ''}. Těšíme se na předání! ${settings.ownerName}`
  },
  {
    id: 'departure_guide',
    title: '🎒 Instrukce a tipy před odjezdem (Checklist)',
    description: 'Praktické rady pro posádku – co si zabalit, adresa předání, parkování osobního auta.',
    getSubject: (contract, settings) => `Praktické informace a tipy před odjezdem - Obytkem.cz`,
    getBody: (contract, settings) => `Dobrý den, ${contract.tenantName || 'cestovatelé'},

Váš výlet obytným vozem se blíží! Zde je několik praktických informací pro hladké předání:

📍 Místo předání: ${settings.ownerAddress}
⏰ Čas předání: ${contract.startDate} v ${contract.startTime || '10:00'} hod.
🚗 Vaše osobní auto: Po dobu pronájmu můžete bezplatně a bezpečně zaparkovat u nás na pozemku.

Co si nezapomenout:
• Občanský průkaz a řidičský průkaz sk. B (min. 3 roky praxe)
• Osobní lůžkoviny (prostěradla, polštáře/deky nebo spacáky), pokud jste neobjednali balíček výbavy
• Osobní hygienické potřeby a oblíbené potraviny

Předání a podrobné zaškolení (ovládání topení, plynu, vody, markýzy a toalety) trvá přibližně 30-45 minut.

Šťastnou cestu přeje,
${settings.ownerName}
${settings.ownerPhone}`,
    getWhatsApp: (contract, settings) => `Ahoj ${contract.tenantName || ''}, těšíme se na Vás v ${contract.startDate} v ${contract.startTime || '10:00'} na adrese ${settings.ownerAddress}. Své osobní auto můžete nechat zaparkované u nás. Nezapomeňte si ŘP + OP! ${settings.ownerName} (${settings.ownerPhone})`
  }
];
