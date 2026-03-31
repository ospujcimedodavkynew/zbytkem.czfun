
# obytkem.cz - Rezervační systém pro Ahorn TU Plus 2021

Tento systém je moderní webová aplikace pro správu pronájmu obytných vozů. Je postavena na technologiích React, Tailwind CSS a využívá Google Gemini API pro inteligentní funkce.

## 🚀 Funkce systému
- **Online rezervace**: Zákaznický portál s výpočtem ceny.
- **Admin Panel**: Přehled rezervací, zákazníků a statistik.
- **AI Contract Creator**: Automatické generování právně podložených smluv.
- **AI Business Advisor**: Analýza vytíženosti a doporučení cenotvorby.
- **Responzivní design**: Plně funkční na mobilech, tabletech i PC.

## 🛠 Instalace a spuštění
1. Systém běží jako statická webová aplikace (SPA).
2. Pro správnou funkci generování smluv a analýz je vyžadován `process.env.GEMINI_API_KEY` (Gemini API).
3. **Přístup do administrace**:
   - Tlačítko: "Vstup pro majitele" v navigaci.
   - Heslo: `admin`

## 📄 Struktura dat
- `types.ts`: Definice datových modelů (Vozidla, Rezervace, Zákazníci).
- `mockData.ts`: Ukázková data pro sezónu 2026.
- `services/geminiService.ts`: Logika pro AI funkce.

## 📍 Předání vozu
- **Místo**: Obytkem.cz parkoviště Teslova Brno, po pravé straně od vjezdu.
- **Vozidlo**: Ahorn TU Plus, model 2021.

## 📧 Automatizace
Systém simuluje odesílání emailů (potvrzení rezervace, zaslání smlouvy) do konzole prohlížeče. Pro produkční nasazení lze napojit na služby jako SendGrid nebo Mailgun.
