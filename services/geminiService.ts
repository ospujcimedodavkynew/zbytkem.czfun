
import { GoogleGenAI } from "@google/genai";

/**
 * Zkontroluje, zda je AI klíč dostupný v prostředí
 */
export const isAiConfigured = () => {
  return !!process.env.API_KEY;
};

/**
 * AI analýza trendů rezervací s využitím modelu Gemini 3 Flash
 */
export const analyzeReservationTrends = async (reservations: any[]) => {
  if (!isAiConfigured()) {
    return {
      summary: "AI klíč nebyl nalezen v prostředí (process.env.API_KEY).",
      occupancyRate: "0 %",
      recommendation: "Pro aktivaci analýzy nastavte API klíč."
    };
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
        thinkingConfig: { thinkingBudget: 0 } 
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
  if (!isAiConfigured()) {
    return "Chyba: process.env.API_KEY není definován. Smlouvu nelze vygenerovat.";
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const prompt = `Jsi právní asistent pro půjčovnu obytných vozů v ČR. 
    Vytvoř profesionální, právně závaznou smlouvu o nájmu dopravního prostředku (obytného vozu) s těmito detaily:
    
    PRONAJÍMATEL: Milan Gula, Teslova Brno, IČO 07031653
    NÁJEMCE: ${details.customerName}, adresa: ${details.customerAddress}, email: ${details.customerEmail}
    VOZIDLO: ${details.vehicleName}, SPZ: ${details.licensePlate}
    TERMÍN: od ${details.startDate} do ${details.endDate}
    CENA: ${details.price}
    KAUCE: ${details.deposit}
    
    Smlouva musí obsahovat:
    - Jasné vymezení předmětu nájmu
    - Podmínky užívání (zákaz kouření, zákaz zvířat bez souhlasu)
    - Sankce za pozdní vrácení nebo nadměrné znečištění
    - Postup při nehodě
    - Místo předání: Brno - Bohunice
    
    Piš česky, formálně a strukturovaně.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "Vytvářej pouze text smlouvy bez úvodních řečí. Používej profesionální právní češtinu."
      }
    });
    
    return response.text || "Nepodařilo se vygenerovat text smlouvy.";
  } catch (error) {
    console.error("AI Contract error:", error);
    return "Chyba při generování smlouvy přes AI. Ověřte nastavení API_KEY.";
  }
};
