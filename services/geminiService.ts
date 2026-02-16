
import { GoogleGenAI, Type } from "@google/genai";

// Funkce pro bezpečné získání klíče
const getApiKey = () => process.env.API_KEY || '';

export const isAiConfigured = () => {
  const key = getApiKey();
  return key.length > 10 && !key.includes('vase_gemini');
};

export const generateContractTemplate = async (reservationDetails: any) => {
  const apiKey = getApiKey();
  
  if (!isAiConfigured()) {
    return "CHYBA: Google AI klíč není nastaven. Smlouvu nelze vygenerovat automaticky. Vložte prosím API_KEY do nastavení Vercelu.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Jsi špičkový český právník specializující se na nájemní právo. Vygeneruj PROFESIONÁLNÍ SMLOUVU O NÁJMU DOPRAVNÍHO PROSTŘEDKU (obytného vozu) v češtině.

        Smluvní strany:
        PRONAJÍMATEL:
        Gula Milan, Parkoviště Teslova, 625 00 Brno - Bohunice, IČO: 07031653, Email: obytkem@gmail.com, Tel: +420 776 333 301.

        NÁJEMCE:
        ${reservationDetails.customerName}, Adresa: ${reservationDetails.customerAddress}, Email: ${reservationDetails.customerEmail}

        Předmět nájmu:
        Vozidlo: ${reservationDetails.vehicleName}, SPZ: ${reservationDetails.licensePlate}, Kauce: 25 000 Kč.
        Termín: ${reservationDetails.dates}. Celková cena: ${reservationDetails.price}.
        Místo předání a vrácení: Parkoviště Teslova, Brno - Bohunice.

        SMLOUVA MUSÍ OBSAHOVAT TYTO STRIKTNÍ PODMÍNKY:
        1. ABSOLUTNÍ ZÁKAZ KOUŘENÍ: Ve vozidle je přísně zakázáno kouřit.
        2. ČISTOTA: Vozidlo musí být vráceno v původním stavu.
        3. ZÁKAZ ZVÍŘAT: Bez souhlasu zákaz přepravy zvířat.
        4. ŠKODY A POJIŠTĚNÍ: Nájemce odpovídá za spoluúčast.
        5. KAUCE: Kauce 25 000 Kč na krytí škod.

        Formát: Dokument začíná "SMLOUVA O NÁJMU", má jasné očíslované články. Vygeneruj text dvakrát (vyhotovení 1 a 2).`,
    });
    return response.text;
  } catch (error) {
    console.error("Gemini failed:", error);
    return "Nepodařilo se spojit s Google AI. Zkontrolujte platnost API klíče.";
  }
};

export const analyzeReservationTrends = async (reservations: any[]) => {
  if (!isAiConfigured()) return null;

  try {
    const ai = new GoogleGenAI({ apiKey: getApiKey() });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyzuj tyto rezervace a napiš stručný souhrn v češtině: ${JSON.stringify(reservations)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            occupancyRate: { type: Type.STRING },
            recommendation: { type: Type.STRING }
          },
          required: ["summary", "occupancyRate", "recommendation"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { summary: "Analýza nedostupná kvůli chybě API.", occupancyRate: "N/A", recommendation: "" };
  }
}
