
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateContractTemplate = async (reservationDetails: any) => {
  try {
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
        1. ABSOLUTNÍ ZÁKAZ KOUŘENÍ: Ve vozidle je přísně zakázáno kouřit (vč. elektronických cigaret). Porušení se trestá smluvní pokutou 10 000 Kč a úhradou nákladů na ozonové čištění.
        2. ČISTOTA: Vozidlo musí být vráceno v původním stavu. Za nadměrné znečištění interiéru (skvrny na čalounění, zápach) bude účtován poplatek od 5 000 Kč.
        3. ZÁKAZ ZVÍŘAT: Bez předchozího písemného souhlasu je zákaz přepravy zvířat.
        4. ŠKODY A POJIŠTĚNÍ: Nájemce odpovídá za spoluúčast na pojištění a za veškeré škody nehrazené pojišťovnou.
        5. POHONNÉ HMOTY A PLYN: Pravidla pro vrácení s plnou nádrží.
        6. REZERVAČNÍ POPLATKY A STORNO: Jasně definované storno podmínky.
        7. KAUCE: Pravidla pro započtení škod proti složené kauci 25 000 Kč.

        Formát: Dokument začíná "SMLOUVA O NÁJMU", má jasné očíslované články (I. až X.), na konci jsou podpisová pole pro obě strany. Vygeneruj text dvakrát (jako vyhotovení č. 1 a vyhotovení č. 2 na jeden list pro tisk).`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini contract generation failed:", error);
    return "Nepodařilo se vygenerovat smlouvu. Kontaktujte prosím správce.";
  }
};

export const analyzeReservationTrends = async (reservations: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyzuj následující JSON data o rezervacích a napiš stručný souhrn pro majitele půjčovny (v češtině): ${JSON.stringify(reservations)}`,
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
    return { summary: "Analýza nedostupná", occupancyRate: "N/A", recommendation: "" };
  }
}
