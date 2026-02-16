
import { ReservationStatus } from "../types";

// Funkce pro analýzu trendů - nyní vrací základní statistiku bez AI
export const analyzeReservationTrends = async (reservations: any[]) => {
  const total = reservations.length;
  const confirmed = reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length;
  const rate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return {
    summary: `Aktuálně evidujeme ${total} rezervací, z toho ${confirmed} je potvrzených.`,
    occupancyRate: `${rate} %`,
    recommendation: confirmed > 5 ? "Vytíženost je vysoká, zvažte navýšení cen pro top sezónu." : "Dostatek volných termínů. Doporučujeme podpořit marketing."
  };
};

export const isAiConfigured = () => false; // Vždy vracíme false, protože používáme lokální generátor

export const generateContractTemplate = async (details: any) => {
  // Simulace krátkého zpoždění pro lepší UX (aby uživatel viděl, že se něco děje)
  await new Promise(resolve => setTimeout(resolve, 600));

  const contractText = `
SMLOUVA O NÁJMU DOPRAVNÍHO PROSTŘEDKU
(Obytný vůz Laika Kreos 7010)

I. SMLUVNÍ STRANY

PRONAJÍMATEL:
Milan Gula
Sídlo: Parkoviště Teslova, 625 00 Brno - Bohunice
IČO: 07031653
Email: obytkem@gmail.com
Tel: +420 776 333 301
(dále jen „pronajímatel“)

NÁJEMCE:
Jméno a příjmení: ${details.customerName}
Adresa: ${details.customerAddress}
Email: ${details.customerEmail}
(dále jen „nájemce“)

II. PŘEDMĚT NÁJMU

1. Předmětem nájmu je obytný automobil:
   Značka a model: ${details.vehicleName}
   Registrační značka (SPZ): ${details.licensePlate}
   
2. Vozidlo je předáváno v dobrém technickém stavu, čisté a s plnou nádrží pohonných hmot (pokud není dohodnuto jinak).

III. DOBA NÁJMU A CENA

1. Nájem se sjednává na dobu určitou:
   Od: ${details.startDate}
   Do: ${details.endDate}
   
2. Celková cena za pronájem: ${details.price}
3. Vratná kauce: ${details.deposit}
   Kauce slouží k úhradě případných škod na vozidle nebo jeho vybavení, které nejsou kryty pojistným plněním, nebo k úhradě spoluúčasti.

IV. PODMÍNKY UŽÍVÁNÍ

1. PŘÍSNÝ ZÁKAZ KOUŘENÍ: Ve všech prostorách vozidla platí absolutní zákaz kouření. Porušení se trestá pokutou 10.000 Kč.
2. ZÁKAZ ZVÍŘAT: Přeprava zvířat je možná pouze po předchozím písemném souhlasu pronajímatele.
3. ÚKLID: Vozidlo musí být vráceno čisté (vnitřní úklid, vyprázdněná kazeta WC, vyprázdněná nádrž na šedou vodu). Za nadměrné znečištění bude účtován poplatek za úklid.
4. JÍZDA: Vozidlo smí řídit pouze osoby uvedené ve smlouvě (nebo příloze), které splňují zákonné podmínky pro řízení dané skupiny vozidel.

V. OSTATNÍ UESTANOVENÍ

1. Nájemce potvrzuje, že byl seznámen s obsluhou vozidla a jeho příslušenstvím.
2. V případě nehody nebo poruchy je nájemce povinen neprodleně kontaktovat pronajímatele.

V Brně, dne ${new Date().toLocaleDateString('cs-CZ')}


..........................................          ..........................................
      Podpis pronajímatele                                Podpis nájemce

-----------------------------------------------------------------------------------------
Tato smlouva byla vygenerována systémem obytkem.cz. Vyhotoveno ve dvou kopiích.
  `;

  return contractText.trim();
};
