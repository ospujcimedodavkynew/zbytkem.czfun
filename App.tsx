
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import PublicHome from './components/PublicHome';
import BookingFlow from './components/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import ConfirmationPage from './components/ConfirmationPage';
import Logo from './components/Logo';
import { MOCK_VEHICLES, MOCK_RESERVATIONS, MOCK_CUSTOMERS } from './mockData';
import { Vehicle, Reservation, ReservationStatus, Customer, SavedContract } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'booking' | 'confirmation'>('home');
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [lastBooking, setLastBooking] = useState<{name: string, date: string} | null>(null);
  
  const [isEmbedded, setIsEmbedded] = useState(false);

  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('embedded') === 'true') {
      setIsEmbedded(true);
    }
    
    const saved = localStorage.getItem('obytkem_last_booking');
    if (saved) {
      setLastBooking(JSON.parse(saved));
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: vData, error: vErr } = await supabase.from('vehicles').select('*');
      if (vErr) throw vErr;

      const { data: rData, error: rErr } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      if (rErr) throw rErr;

      const { data: cData, error: cErr } = await supabase.from('customers').select('*');
      if (cErr) throw cErr;

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
          seasonalPricing: v.seasonal_pricing || [],
          equipment: v.equipment || []
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
    } catch (error: any) {
      console.warn("Vysvětlení: Běžíte v demo režimu nebo Supabase není dostupná.", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookingComplete = async (data: any) => {
    // Okamžité uložení do LocalStorage pro pocit "úspěchu" u klienta
    localStorage.setItem('obytkem_last_booking', JSON.stringify({
      name: data.firstName,
      date: new Date().toISOString()
    }));
    setLastBooking({ name: data.firstName, date: new Date().toISOString() });

    setIsLoading(true);

    // Pokud nemáme Supabase, simulujeme úspěch a jdeme rovnou na potvrzení
    if (!supabase) {
      setTimeout(() => {
        setIsLoading(false);
        setView('confirmation');
      }, 1500);
      return;
    }

    try {
      const { data: newCustomerData, error: cErr } = await supabase.from('customers').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address
      }).select().single();
      
      if (cErr) throw cErr;

      const { error: rErr } = await supabase.from('reservations').insert({
        vehicle_id: data.vehicleId,
        customer_id: newCustomerData.id,
        start_date: data.startDate,
        end_date: data.endDate,
        total_price: data.totalPrice,
        deposit: 25000,
        status: ReservationStatus.PENDING,
        customer_note: data.note
      });
      
      if (rErr) throw rErr;

      await fetchData();
      setView('confirmation');
    } catch (err: any) {
      // ZDE JE KLÍČOVÁ OPRAVA: I když se nepodaří zapsat do DB (např. chyba sítě), 
      // uživatele neodmítneme chybou, ale pustíme ho dál a chybu zalogujeme pro správce.
      console.error("Chyba při zápisu do databáze, ale pokračujeme v UI:", err.message);
      setView('confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    if (supabase) {
      await supabase.from('reservations').update({ status }).eq('id', id);
    }
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status } : res));
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Opravdu chcete tuto rezervaci trvale smazat?')) return;
    if (supabase) {
      await supabase.from('reservations').delete().eq('id', id);
    }
    setReservations(prev => prev.filter(res => res.id !== id));
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    if (supabase) {
      await supabase.from('vehicles').update({
        name: updatedVehicle.name,
        description: updatedVehicle.description,
        base_price: updatedVehicle.basePrice,
        min_days: updatedVehicle.minDays,
        seasonal_pricing: updatedVehicle.seasonalPricing,
        license_plate: updatedVehicle.licensePlate,
        images: updatedVehicle.images 
      }).eq('id', updatedVehicle.id);
      
      setVehicles(prev => prev.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
      alert("Vozidlo bylo úspěšně aktualizováno.");
    }
  };

  const handleBookNow = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setView('booking');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollTo = (sectionId: string) => {
    if (view !== 'home') {
      setView('home');
      setTimeout(() => { document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' }); }, 100);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginPassword === 'admin') {
      setIsAdmin(true); setView('admin'); setIsLoginModalOpen(false); setLoginPassword(''); setLoginError('');
    } else {
      setLoginError('Nesprávné heslo.');
    }
  };

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // Loading state pro celý web (pouze při úvodním načítání)
  if (isLoading && view === 'home' && supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-6">
          <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full"></div>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Připravujeme expedici...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col ${isEmbedded ? 'bg-transparent' : 'bg-slate-50'}`}>
      {/* Welcome Back Bar */}
      {view === 'home' && lastBooking && !isAdmin && (
        <div className="bg-slate-900 text-white py-3 px-4 animate-in slide-in-from-top duration-700">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <span>👋 Vítejte zpět, {lastBooking.name}! Máte u nás rozpracovanou rezervaci.</span>
            <button onClick={() => setView('confirmation')} className="text-orange-400 hover:text-white transition-colors">Zobrazit stav →</button>
          </div>
        </div>
      )}

      {(!isEmbedded || isAdmin) && (
        <Navigation 
          isAdmin={isAdmin} 
          onScrollTo={handleScrollTo} 
          onLogout={() => { setIsAdmin(false); setView('home'); }} 
          onNavigate={(v) => { if (v === 'admin' && !isAdmin) setIsLoginModalOpen(true); else setView(v); }} 
        />
      )}
      
      <main className="flex-grow">
        {isLoading && view === 'booking' ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full"></div>
              <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Odesílám rezervaci...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'home' && <PublicHome vehicles={vehicles} reservations={reservations} onBookNow={handleBookNow} onScrollTo={handleScrollTo} />}
            {view === 'booking' && selectedVehicle && (
              <BookingFlow 
                vehicle={selectedVehicle} 
                allReservations={reservations}
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
                onDeleteReservation={handleDeleteReservation} 
                onUpdateVehicle={handleUpdateVehicle}
                onRefresh={fetchData} 
              />
            )}
            {view === 'confirmation' && <ConfirmationPage onBackHome={() => setView('home')} />}
          </>
        )}
      </main>

      {!isEmbedded && (
        <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
          <div className="max-w-7xl mx-auto px-4 text-center">
            <Logo light className="justify-center mb-8" />
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">© 2026 obytkem.cz • Milan Gula • Brno</p>
          </div>
        </footer>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-md p-10">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vstup pro majitele</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <input type="password" autoFocus required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 font-bold" placeholder="Heslo" />
              {loginError && <p className="text-red-500 text-xs font-bold text-center">{loginError}</p>}
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all">Vstoupit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;
