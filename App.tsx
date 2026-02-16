
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import PublicHome from './components/PublicHome';
import BookingFlow from './components/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import Logo from './components/Logo';
import { MOCK_VEHICLES, MOCK_RESERVATIONS, MOCK_CUSTOMERS } from './mockData';
import { Vehicle, Reservation, ReservationStatus, Customer, SavedContract } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'booking'>('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // Funkce pro načítání dat z DB
  const fetchData = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: vData } = await supabase.from('vehicles').select('*');
      const { data: rData } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      const { data: cData } = await supabase.from('customers').select('*');

      if (vData && vData.length > 0) {
        setVehicles(vData.map(v => ({
          id: v.id,
          name: v.name,
          description: v.description,
          licensePlate: v.license_plate,
          vin: v.vin,
          basePrice: Number(v.base_price),
          minDays: v.min_days,
          deposit: Number(v.deposit),
          kmLimitPerDay: v.km_limit_per_day,
          images: v.images || [],
          isActive: v.is_active,
          seasonalPricing: v.seasonal_pricing || []
        })));
      }

      if (rData) {
        setReservations(rData.map(r => ({
          id: r.id,
          vehicleId: r.vehicle_id,
          customerId: r.customer_id,
          startDate: r.start_date,
          endDate: r.end_date,
          totalPrice: Number(r.total_price),
          deposit: Number(r.deposit),
          status: r.status as ReservationStatus,
          createdAt: r.created_at,
          customerNote: r.customer_note
        })));
      }

      if (cData) {
        setCustomers(cData.map(c => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          idNumber: c.id_number || ''
        })));
      }
    } catch (error) {
      console.error("Chyba při načítání dat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingComplete = async (data: any) => {
    setIsLoading(true);
    
    if (supabase) {
      try {
        // 1. Uložit zákazníka
        const { data: newCustomerData, error: cErr } = await supabase.from('customers').insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address
        }).select().single();
        
        if (cErr) throw cErr;

        if (newCustomerData) {
          // Přidat zákazníka do lokálního stavu
          const mappedCustomer: Customer = {
            id: newCustomerData.id,
            firstName: newCustomerData.first_name,
            lastName: newCustomerData.last_name,
            email: newCustomerData.email,
            phone: newCustomerData.phone,
            address: newCustomerData.address,
            idNumber: ''
          };
          setCustomers(prev => [...prev, mappedCustomer]);

          // 2. Uložit rezervaci
          const { data: newResData, error: rErr } = await supabase.from('reservations').insert({
            vehicle_id: data.vehicleId,
            customer_id: newCustomerData.id,
            start_date: data.startDate,
            end_date: data.endDate,
            total_price: data.totalPrice,
            deposit: 25000,
            status: ReservationStatus.PENDING,
            customer_note: data.note
          }).select().single();
          
          if (rErr) throw rErr;

          if (newResData) {
            // Přidat rezervaci do lokálního stavu
            const mappedRes: Reservation = {
              id: newResData.id,
              vehicleId: newResData.vehicle_id,
              customerId: newResData.customer_id,
              startDate: newResData.start_date,
              endDate: newResData.end_date,
              totalPrice: Number(newResData.total_price),
              deposit: Number(newResData.deposit),
              status: newResData.status as ReservationStatus,
              createdAt: newResData.created_at,
              customerNote: newResData.customer_note
            };
            setReservations(prev => [mappedRes, ...prev]);
          }
        }
        
        alert(`Rezervace byla úspěšně odeslána.`);
      } catch (err) {
        console.error("Chyba při ukládání:", err);
        alert("Chyba při odesílání rezervace.");
      }
    } else {
      // Demo režim fallback
      const tempId = `c${Date.now()}`;
      setCustomers(prev => [...prev, { id: tempId, firstName: data.firstName, lastName: data.lastName, email: data.email, phone: data.phone, address: data.address, idNumber: '' }]);
      setReservations(prev => [{ 
        id: `r${Date.now()}`, 
        vehicleId: data.vehicleId, 
        customerId: tempId, 
        startDate: data.startDate, 
        endDate: data.endDate, 
        totalPrice: data.totalPrice, 
        deposit: 25000, 
        status: ReservationStatus.PENDING, 
        createdAt: data.createdAt 
      }, ...prev]);
      alert(`DEMO: Rezervace byla uložena lokálně.`);
    }
    
    setIsLoading(false);
    setView('home');
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    if (supabase) {
      await supabase.from('reservations').update({ status }).eq('id', id);
    }
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status } : res));
  };

  const handleBookNow = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollTo = (sectionId: string) => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      el?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'admin') {
      setIsAdmin(true);
      setView('admin');
      setIsLoginModalOpen(false);
      setLoginPassword('');
      setLoginError('');
    } else {
      setLoginError('Nesprávné heslo.');
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  if (isLoading && view === 'home' && supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full"></div>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Aktualizuji data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation 
        isAdmin={isAdmin} 
        onScrollTo={handleScrollTo}
        onLogout={() => { setIsAdmin(false); setView('home'); }}
        onNavigate={(v) => {
          if (v === 'admin') {
            if (isAdmin) setView('admin');
            else setIsLoginModalOpen(true);
          } else setView(v);
        }} 
      />

      <main className="flex-grow">
        {view === 'home' && (
          <PublicHome 
            vehicles={vehicles} 
            reservations={reservations}
            onBookNow={handleBookNow} 
            onScrollTo={handleScrollTo}
          />
        )}

        {view === 'booking' && selectedVehicle && (
          <BookingFlow 
            vehicle={selectedVehicle} 
            onCancel={() => setView('home')} 
            onComplete={handleBookingComplete}
          />
        )}

        {view === 'admin' && (
          <AdminDashboard 
            reservations={reservations} 
            vehicles={vehicles} 
            customers={customers}
            savedContracts={savedContracts}
            onSaveContract={(c) => setSavedContracts(prev => [...prev, c])}
            onUpdateStatus={handleUpdateStatus}
            onUpdateVehicle={(uv) => setVehicles(prev => prev.map(v => v.id === uv.id ? uv : v))}
          />
        )}
      </main>

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-900">Administrace</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input 
                type="password" autoFocus required value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl outline-none focus:border-orange-500"
                placeholder="Zadejte heslo (admin)"
              />
              {loginError && <p className="text-red-500 text-xs font-bold">{loginError}</p>}
              <button type="submit" className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold hover:bg-orange-600 transition-colors">Vstoupit</button>
            </form>
          </div>
        </div>
      )}

      <footer className="bg-slate-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Logo light className="justify-center mb-6" />
          <p className="text-slate-500 text-sm">© 2026 obytkem.cz | Gula Milan | Brno</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
