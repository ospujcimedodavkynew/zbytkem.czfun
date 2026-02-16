
import { Vehicle, Reservation, Customer, ReservationStatus } from './types';

export const MOCK_VEHICLES: Vehicle[] = [
  {
    id: 'v2',
    name: 'Laika Kreos 7010 (Model 2016)',
    description: 'Poctivá italská klasika z nejvyšší řady Kreos. Vůz vyniká nadstandardní izolací díky dvojité podlaze a špičkovým podvozkem AL-KO. Ideální volba pro ty, kteří hledají prověřenou kvalitu a maximální pohodlí i na dlouhých trasách.',
    licensePlate: '7BM 2026',
    vin: 'ZFA2016LAIKAKREOS7010X',
    basePrice: 3200,
    minDays: 3,
    deposit: 25000,
    kmLimitPerDay: 300,
    isActive: true,
    images: [
      'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?auto=format&fit=crop&q=80&w=1200',
      'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?auto=format&fit=crop&q=80&w=1200'
    ],
    seasonalPricing: [
      { id: 's2026-1', name: 'Hlavní letní sezóna 2026', startDate: '2026-06-01', endDate: '2026-08-31', pricePerDay: 4600 },
      { id: 's2026-2', name: 'Zářijové babí léto', startDate: '2026-09-01', endDate: '2026-09-30', pricePerDay: 3800 },
      { id: 's2026-3', name: 'Jarní expedice', startDate: '2026-04-01', endDate: '2026-05-31', pricePerDay: 3500 }
    ],
    equipment: [
      'Teplovodní topení ALDE (vhodné pro zimu)',
      'Solární panely 175W pro nezávislost',
      'Měnič napětí 12V / 230V (600W)',
      'Nádrž na čistou vodu 120L',
      'Vyhřívaná nádrž na odpadní vodu',
      'Prostorná lednice s mrazákem (160L)',
      'Plynová trouba a 3-plotýnkový vařič',
      'Markýza Thule 4.5m s LED osvětlením'
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
