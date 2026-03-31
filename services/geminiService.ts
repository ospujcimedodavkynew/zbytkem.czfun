
import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const getApiKey = () => {
  // Zkusíme všechny možné zdroje klíče
  // V produkčním buildu Vite jsou tyto hodnoty nahrazeny během buildu
  const key = (typeof process !== 'undefined' && process.env.GEMINI_API_KEY) || 
              import.meta.env.VITE_GEMINI_API_KEY || 
              (typeof process !== 'undefined' && process.env.API_KEY) ||
              (typeof window !== 'undefined' && (window as any).process?.env?.GEMINI_API_KEY) ||
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
    status: r.status,
    destination: r.destination,
    mileage: r.estimatedMileage
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
    TERMÍN: od ${details.startDate} v ${details.pickupTime} do ${details.endDate} v ${details.returnTime}
    CENA: ${details.price}
    KAUCE: ${details.deposit}
    DOPLŇKOVÉ SLUŽBY: ${details.selectedItems || 'Žádné'}
    CÍL CESTY: ${details.destination || 'Neuveden'}
    PŘEDPOKLÁDANÝ NÁJEZD (informace od nájemce): ${details.estimatedMileage || 'Neuveden'} km
    SMLUVNÍ LIMIT KM: 300 km / den (nad tento limit se doplácí dle ceníku)
    
    Smlouva musí obsahovat:
    - Jasné vymezení předmětu nájmu
    - Podmínky užívání (zákaz kouření, zákaz zvířat bez souhlasu)
    - Smluvní limit kilometrů: 300 km na každý den nájmu. Celkový limit za dobu nájmu je počet dní x 300 km.
    - Sankce za překročení limitu kilometrů, pozdní vrácení nebo nadměrné znečištění
    - Postup při nehodě
    - Místo předání: Obytkem.cz parkoviště Teslova Brno, po pravé straně od vjezdu.
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
    
    if (!response.text) {
      throw new Error("Model vrátil prázdnou odpověď.");
    }
    
    return response.text;
  } catch (error: any) {
    console.error("AI Contract error details:", error);
    if (error.message?.includes("API_KEY_INVALID")) {
      return "Chyba: Neplatný API klíč Gemini. Zkontrolujte nastavení v prostředí.";
    }
    return `Chyba při generování smlouvy přes AI: ${error.message || 'Neznámá chyba'}. Ověřte nastavení GEMINI_API_KEY.`;
  }
};
