
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const getApiKey = () => {
  // Zkusíme všechny možné zdroje klíče
  // V produkčním buildu Vite jsou tyto hodnoty nahrazeny během buildu
  const key = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || 
              import.meta.env.VITE_GEMINI_API_KEY || 
              (typeof process !== 'undefined' && process.env.API_KEY) ||
              '';
  return key;
};

/**
 * Zkontroluje, zda je AI klíč dostupný v prostředí
 */
export const isAiConfigured = () => {
  const key = getApiKey();
  if (!key) {
    console.warn("GEMINI_API_KEY is not defined in any environment source");
  } else {
    console.log("GEMINI_API_KEY is defined (starts with: " + key.substring(0, 4) + "...)");
  }
  return !!key;
};

/**
 * AI analýza trendů rezervací s využitím modelu Gemini 3 Flash
 */
export const analyzeReservationTrends = async (reservations: any[]) => {
  const key = getApiKey();
  if (!key) {
    return {
      summary: "AI klíč nebyl nalezen v prostředí. Nastavte GEMINI_API_KEY v nastavení.",
      occupancyRate: "0 %",
      recommendation: "Pro aktivaci analýzy nastavte API klíč."
    };
  }

  const ai = new GoogleGenAI({ apiKey: key });
  const resData = (reservations || []).map(r => ({
    start: r.startDate,
    end: r.endDate,
    price: r.totalPrice,
    status: r.status
  }));

  const prompt = `Analyzuj tyto rezervace obytného vozu pro sezónu 2026 a vrať odpověď v JSON formátu:
    ${JSON.stringify(resData)}
    
    Požadovaný formát JSON:
    {
      "summary": "krátký textový souhrn stavu (česky)",
      "occupancyRate": "procento vytíženosti jako řetězec",
      "recommendation": "konkrétní doporučení pro majitele co se týče cen a marketingu (česky)"
    }`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: { 
        responseMimeType: "application/json",
        thinkingConfig: { thinkingLevel: ThinkingLevel.LOW } 
      }
    });
    
    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Analysis error:", error);
    return {
      summary: "Chyba při komunikaci s Gemini API.",
      occupancyRate: "N/A",
      recommendation: "Zkontrolujte platnost API klíče v nastavení prostředí."
    };
  }
};

/**
 * Generování smlouvy na míru přes AI s modelem Gemini 3 Flash
 */
export const generateContractTemplate = async (details: any) => {
  const key = getApiKey();
  if (!key) {
    return "Chyba: GEMINI_API_KEY není definován v prostředí. Smlouvu nelze vygenerovat.";
  }

  const ai = new GoogleGenAI({ apiKey: key });

  const prompt = `Jsi právní asistent pro půjčovnu obytných vozů v ČR. 
    Vytvoř profesionální, právně závaznou smlouvu o nájmu dopravního prostředku (obytného vozu) s těmito detaily:
    
    PRONAJÍMATEL: Milan Gula, Teslova Brno, IČO 07031653
    NÁJEMCE: ${details.customerName}, adresa: ${details.customerAddress}, email: ${details.customerEmail}, telefon: ${details.customerPhone}, číslo OP/Pas: ${details.idNumber}
    VOZIDLO: ${details.vehicleName}, SPZ: ${details.licensePlate}, Délka: 6980 cm
    TERMÍN: od ${details.startDate} do ${details.endDate}
    CENA: ${details.price}
    KAUCE: ${details.deposit}
    DOPLŇKOVÉ SLUŽBY: ${details.selectedItems || 'Žádné'}
    
    Smlouva musí obsahovat:
    - Jasné vymezení předmětu nájmu
    - Podmínky užívání (zákaz kouření, zákaz zvířat bez souhlasu)
    - Sankce za pozdní vrácení nebo nadměrné znečištění
    - Postup při nehodě
    - Místo předání: Brno - Bohunice
    - Seznam doplňkových služeb a jejich ceny (pokud jsou vybrány)
    
    Piš česky, formálně a strukturovaně.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Vytvářej pouze text smlouvy bez úvodních řečí. Používej profesionální právní češtinu. Důležité: Vždy používej přesný název vozu uvedený v zadání (Ahorn TU Plus), nikdy nepoužívej název 'Laika'."
      }
    });
    
    return response.text || "Nepodařilo se vygenerovat text smlouvy.";
  } catch (error) {
    console.error("AI Contract error:", error);
    return "Chyba při generování smlouvy přes AI. Ověřte nastavení GEMINI_API_KEY.";
  }
};
