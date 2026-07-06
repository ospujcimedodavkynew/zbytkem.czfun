-- ====================================================================
-- SUPABASE / POSTGRESQL DATABASE SCHEMA FOR OBYTKEM.CZ
-- ====================================================================
-- Tento skript vytvoří všechny potřebné tabulky, indexy, 
-- výchozí nastavení a nastaví Row-Level Security (RLS) pro Supabase.
-- Zkopírujte tento kód a vložte jej do "SQL Editoru" ve vašem Supabase projektu.
-- ====================================================================

-- Povolení rozšíření UUID (pokud ještě není povoleno)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. TABULKA: NASTAVENÍ OBYTNÉHO VOZU (campervan_settings)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.campervan_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Parametry vozidla
    brand TEXT NOT NULL DEFAULT 'Ahorn',
    model TEXT NOT NULL DEFAULT 'Canada TU Plus',
    plate_number TEXT NOT NULL DEFAULT '7AM 8243',
    year INTEGER NOT NULL DEFAULT 2023,
    
    -- Ceník a limity
    daily_price NUMERIC(10, 2) NOT NULL DEFAULT 3200.00,
    deposit NUMERIC(10, 2) NOT NULL DEFAULT 30000.00,
    cleaning_fee NUMERIC(10, 2) NOT NULL DEFAULT 1500.00,
    km_limit_per_day INTEGER NOT NULL DEFAULT 300,
    km_over_limit_price NUMERIC(10, 2) NOT NULL DEFAULT 6.00,
    
    -- Kontaktní údaje majitele (hostitele)
    owner_name TEXT NOT NULL DEFAULT 'Petr Svoboda',
    owner_id TEXT NOT NULL DEFAULT '12345678', -- IČO
    owner_address TEXT NOT NULL DEFAULT 'Slunečná 45, 100 00 Praha 10',
    owner_phone TEXT NOT NULL DEFAULT '+420 777 888 999',
    owner_email TEXT NOT NULL DEFAULT 'info@obytkem.cz',
    owner_bank TEXT NOT NULL DEFAULT '123456789/0100 (Komerční banka)'
);

-- Vložení výchozího řádku nastavení (pokud tabulka zrovna vznikla prázdná)
INSERT INTO public.campervan_settings (
    brand, model, plate_number, year, 
    daily_price, deposit, cleaning_fee, km_limit_per_day, km_over_limit_price,
    owner_name, owner_id, owner_address, owner_phone, owner_email, owner_bank
)
VALUES (
    'Ahorn', 'Canada TU Plus', '7AM 8243', 2023,
    3200.00, 30000.00, 1500.00, 300, 6.00,
    'Petr Svoboda', '12345678', 'Slunečná 45, 100 00 Praha 10', '+420 777 888 999', 'info@obytkem.cz', '123456789/0100 (Komerční banka)'
)
ON CONFLICT DO NOTHING;


-- ====================================================================
-- 2. TABULKA: NEZÁVAZNÉ POPTÁVKY (reservation_inquiries)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.reservation_inquiries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Údaje zájemce
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    
    -- Termín pronájmu
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Zpráva a stav
    message TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'converted', 'cancelled'))
);

-- Indexy pro rychlé vyhledávání termínů poptávek
CREATE INDEX IF NOT EXISTS idx_inquiries_dates ON public.reservation_inquiries (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_inquiries_status ON public.reservation_inquiries (status);


-- ====================================================================
-- 3. TABULKA: NÁJEMNÍ SMLOUVY (contracts)
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Údaje nájemce (tenant)
    tenant_name TEXT NOT NULL,
    tenant_birth_date DATE NOT NULL,
    tenant_id_number TEXT NOT NULL, -- Občanský průkaz / Pas
    tenant_dl_number TEXT NOT NULL, -- Řidičský průkaz
    tenant_address TEXT NOT NULL,
    tenant_phone TEXT NOT NULL,
    tenant_email TEXT NOT NULL,
    
    -- Termín pronájmu
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    
    -- Finanční parametry a limity platné v době podpisu
    daily_price NUMERIC(10, 2) NOT NULL,
    deposit NUMERIC(10, 2) NOT NULL,
    cleaning_fee NUMERIC(10, 2) NOT NULL,
    km_limit_per_day INTEGER NOT NULL,
    km_over_limit_price NUMERIC(10, 2) NOT NULL,
    
    -- Doplňující ujednání
    additional_terms TEXT,
    
    -- Podpisy a digitální stopa
    owner_signature TEXT,   -- Base64 nebo odkaz na SVG podpis pronajímatele
    tenant_signature TEXT,  -- Base64 podpis nájemce
    signed_at TIMESTAMP WITH TIME ZONE,
    signed_ip TEXT,
    is_signed BOOLEAN NOT NULL DEFAULT FALSE
);

-- Indexy pro vyhledávání smluv a kontrolu obsazenosti
CREATE INDEX IF NOT EXISTS idx_contracts_dates ON public.contracts (start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_contracts_signed ON public.contracts (is_signed);


-- ====================================================================
-- 4. ROW-LEVEL SECURITY (RLS) BEZPEČNOSTNÍ PRAVIDLA
-- ====================================================================

-- Povolení RLS na všech tabulkách
ALTER TABLE public.campervan_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservation_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

-- 4.1 Pravidla pro Nastavení vozu (campervan_settings)
-- Kdokoliv (i nepřihlášený návštěvník) si může přečíst nastavení (značku, denní cenu atd.)
CREATE POLICY "Umožnit všem číst parametry vozu" ON public.campervan_settings
    FOR SELECT USING (true);

-- Pouze přihlášený majitel/správce (authenticated) může nastavení upravovat
CREATE POLICY "Pouze přihlášení mohou editovat parametry vozu" ON public.campervan_settings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4.2 Pravidla pro Nezávazné poptávky (reservation_inquiries)
-- Kdokoliv na webu může poslat novou poptávku (INSERT)
CREATE POLICY "Kdokoliv může odeslat poptávku" ON public.reservation_inquiries
    FOR INSERT WITH CHECK (true);

-- Pouze přihlášený majitel (authenticated) může poptávky číst, upravovat či mazat
CREATE POLICY "Pouze přihlášení vidí a spravují poptávky" ON public.reservation_inquiries
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- 4.3 Pravidla pro Smlouvy (contracts)
-- Nájemce s unikátním odkazem (který obsahuje ID smlouvy) si může svou smlouvu zobrazit
-- Pro zjednodušení: Kdokoliv, kdo zná UUID smlouvy (ID), ji může zobrazit a podepsat (UPDATE)
CREATE POLICY "Přístup ke konkrétní smlouvě přes její ID" ON public.contracts
    FOR SELECT USING (true);

CREATE POLICY "Podepsání konkrétní smlouvy nájemcem" ON public.contracts
    FOR UPDATE USING (is_signed = false) WITH CHECK (true);

-- Pouze přihlášený majitel (authenticated) má plný přístup ke všem smlouvám (vytváření, čtení všech, smazání)
CREATE POLICY "Plná správa smluv pro přihlášeného hostitele" ON public.contracts
    FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- ====================================================================
-- 5. POMOCNÁ FUNKCE PRO AUTOMATICKÉ AKTUALIZACE ČASU (updated_at)
-- ====================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_campervan_settings_updated_at
    BEFORE UPDATE ON public.campervan_settings
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
