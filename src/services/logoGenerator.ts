import { GoogleGenAI } from "@google/genai";

async function getLogo() {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview',
    contents: {
      parts: [
        {
          text: 'A professional, modern, minimalist logo for a van rental company named "PůjčímeDodávky.cz". The style should match "obytkem.cz": clean typography using a bold sans-serif font (like Inter or Montserrat), a simple stylized silhouette of a modern delivery van (like a Renault Master) integrated with the text. Colors: vibrant orange (#f97316) and deep dark blue (#0f172a). White background. High resolution, vector-style, flat design.',
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "4:3",
        imageSize: "1K"
      }
    },
  });

  const part = response.candidates[0].content.parts.find(p => p.inlineData);
  if (part && part.inlineData) {
    return part.inlineData.data;
  }
  return null;
}
