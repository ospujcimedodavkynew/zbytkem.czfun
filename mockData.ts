
import { Vehicle, Reservation, Customer, ReservationStatus, MaintenanceTask, InventoryItem } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v2',
    name: 'Ahorn TU Plus (Model 2022)',
    description: 'Moderní a prostorný polointegrovaný vůz na podvozku Renault Master s výkonným motorem 165 kW. Unikátní zadní sezení ve tvaru "U" nabízí maximální komfort pro relaxaci a společné chvíle. Vůz je homologován pro 5 osob na jízdu i spaní a nabízí špičkovou výbavu pro nezávislé cestování.',
    licensePlate: '7M53481',
    vin: 'VF1MA0000AHORNTU2022X',
    basePrice: 2900,
    minDays: 3,
    deposit: 25000,
    kmLimitPerDay: 300,
    extraKmPrice: 5,
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1513311068544-8347bc6140f3?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200'
    ],
    seasonalPricing: [
      { id: 's2026-1', name: 'Vedlejší sezóna', startDate: '2026-01-01', endDate: '2026-03-31', pricePerDay: 2500 },
      { id: 's2026-2', name: 'Střední sezóna', startDate: '2026-04-01', endDate: '2026-05-31', pricePerDay: 2900 },
      { id: 's2026-3', name: 'Hlavní sezóna', startDate: '2026-06-01', endDate: '2026-09-30', pricePerDay: 3400 },
      { id: 's2026-4', name: 'Pozdní sezóna', startDate: '2026-10-01', endDate: '2026-12-31', pricePerDay: 2700 }
    ],
    equipment: [
      'Zadní sezení ve tvaru "U" (unikátní prostor pro 6 osob)',
      'Dvě elektrické spouštěcí postele (pohodlné spaní pro 5 osob)',
      'Homologace pro 5 osob na jízdu i spaní',
      'Zvýšený výkon motoru na 165 kW',
      'Solární panel 140W (maximální energetická nezávislost)',
      'Satelitní systém a TV',
      'Navigace speciálně pro obytné vozy',
      'Elektrický nástupní schůdek',
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
    totalPrice: 34000,
    deposit: 25000,
    status: ReservationStatus.CONFIRMED,
    createdAt: '2026-01-15T10:00:00Z'
  }
];

export const MOCK_MAINTENANCE: MaintenanceTask[] = [
  {
    id: 'm1',
    vehicleId: 'v2',
    title: 'Výměna oleje a filtrů',
    description: 'Pravidelný servis po 30 000 km.',
    date: '2026-04-15',
    type: 'oil',
    status: 'pending',
    cost: 4500
  },
  {
    id: 'm2',
    vehicleId: 'v2',
    title: 'Revize plynu',
    description: 'Povinná revize plynového systému a topení.',
    date: '2026-05-10',
    type: 'gas',
    status: 'pending',
    cost: 1200
  }
];

export const MOCK_INVENTORY: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Paddleboard',
    totalQuantity: 2,
    availableQuantity: 2,
    category: 'sport',
    pricePerDay: 300,
    description: 'Nafukovací paddleboard s pádlem a pumpou.'
  },
  {
    id: 'i2',
    name: 'Jízdní kolo',
    totalQuantity: 4,
    availableQuantity: 4,
    category: 'sport',
    pricePerDay: 250,
    description: 'Horské kolo pro výlety v okolí kempu.'
  },
  {
    id: 'i3',
    name: 'Elektrický skateboard',
    totalQuantity: 2,
    availableQuantity: 2,
    category: 'sport',
    pricePerDay: 400,
    description: 'Výkonný elektrický skateboard pro rychlý přesun.'
  },
  {
    id: 'i4',
    name: 'Dovoz vozidla po Brně',
    totalQuantity: 1,
    availableQuantity: 1,
    category: 'service',
    pricePerDay: 500,
    isOneTimeFee: true,
    description: 'Přistavení a vyzvednutí vozidla na vaší adrese v Brně.'
  },
  {
    id: 'i5',
    name: 'Kempingová židle',
    totalQuantity: 8,
    availableQuantity: 4,
    category: 'camping',
    pricePerDay: 50
  }
];
