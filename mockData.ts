
import { Vehicle, Reservation, Customer, ReservationStatus } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v2',
    name: 'Ahorn TU Plus (Model 2021)',
    description: 'Moderní a prostorný polointegrovaný vůz na podvozku Renault Master. Unikátní zadní sezení ve tvaru "U" nabízí maximální komfort pro relaxaci a společné chvíle. Vůz je vybaven výkonným motorem 145 HP a nabízí špičkovou výbavu pro nezávislé cestování.',
    licensePlate: '8BM 2021',
    vin: 'VF1MA0000AHORNTU2021X',
    basePrice: 2900,
    minDays: 3,
    deposit: 25000,
    kmLimitPerDay: 300,
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1513311068544-8347bc6140f3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200'
    ],
    seasonalPricing: [
      { id: 's2026-1', name: 'Hlavní letní sezóna 2026', startDate: '2026-06-01', endDate: '2026-08-31', pricePerDay: 4200 },
      { id: 's2026-2', name: 'Zářijové babí léto', startDate: '2026-09-01', endDate: '2026-09-30', pricePerDay: 3400 },
      { id: 's2026-3', name: 'Jarní expedice', startDate: '2026-04-01', endDate: '2026-05-31', pricePerDay: 3100 }
    ],
    equipment: [
      'Zadní sezení ve tvaru "U" (unikátní prostor pro 6 osob)',
      'Elektrické spouštěcí lůžko (pohodlné spaní bez přestavby)',
      'Solární panel 140W (maximální energetická nezávislost)',
      'Nástavbová klimatizace (komfort i v největších vedrech)',
      'Velká lednice 141L s mrazákem (automatický trojkombinační režim)',
      'Markýza Thule s LED osvětlením (večerní posezení venku)',
      'Nosič na 4 jízdní kola (ideální pro rodinné výlety)',
      'Couvací kamera a senzory (snadná manipulace)',
      'Kompletní kuchyňská výbava (nádobí, příbory, hrnce)',
      'Kempingový nábytek (stůl + 4 židle)',
      'Dálniční známka ČR v ceně'
    ]
  }
];

export const MOCK_CUSTOMERS: Customer[] = [
  {
    id: 'c1',
    firstName: 'Jan',
    lastName: 'Novák',
    email: 'jan.novak@email.cz',
    phone: '+420 777 123 456',
    address: 'Václavské náměstí 1, Praha 110 00',
    idNumber: '123456789'
  }
];

export const MOCK_RESERVATIONS: Reservation[] = [
  {
    id: 'r1',
    vehicleId: 'v2',
    customerId: 'c1',
    startDate: '2026-07-10',
    endDate: '2026-07-20',
    totalPrice: 46000,
    deposit: 25000,
    status: ReservationStatus.CONFIRMED,
    createdAt: '2026-01-15T10:00:00Z'
  }
];
