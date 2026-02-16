
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

  const fetchData = async () => {
    if (!supabase) {
      console.warn("Spouštím demo režim - chybí připojení k Supabase.");
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
      console.error("Chyba při načítání dat ze Supabase:", error.message);
      alert("Chyba databáze: " + error.message + ". Ujistěte se, že jste v Supabase spustili SQL skript.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookingComplete = async (data: any) => {
    if (!supabase) {
      alert("Chyba: Aplikace není napojena na databázi (Demo režim). Rezervaci nelze uložit.");
      setView('home');
      return;
    }

    setIsLoading(true);
    try {
      // 1. Vložení zákazníka
      const { data: newCustomerData, error: cErr } = await supabase.from('customers').insert({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        address: data.address
      }).select().single();
      
      if (cErr) throw cErr;

      // 2. Vložení rezervace
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

      // 3. Obnova dat
      await fetchData();
      alert(`Rezervace byla úspěšně odeslána. Brzy vás budeme kontaktovat.`);
      setView('home');
    } catch (err: any) {
      alert(`Kritická chyba při ukládání: ${err.message}. \n\nUjistěte se, že jste v Supabase editoru spustili SQL příkaz pro vytvoření tabulek.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    if (supabase) {
      const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
      if (error) alert("Chyba při aktualizaci: " + error.message);
    }
    setReservations(prev => prev.map(res => res.id === id ? { ...res, status } : res));
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Opravdu chcete tuto rezervaci trvale smazat?')) return;
    if (supabase) {
      const { error } = await supabase.from('reservations').delete().eq('id', id);
      if (error) alert("Chyba při mazání: " + error.message);
    }
    setReservations(prev => prev.filter(res => res.id !== id));
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    if (supabase) {
      const { error } = await supabase.from('vehicles').update({
        name: updatedVehicle.name,
        description: updatedVehicle.description,
        base_price: updatedVehicle.basePrice,
        min_days: updatedVehicle.minDays,
        seasonal_pricing: updatedVehicle.seasonalPricing,
        license_plate: updatedVehicle.licensePlate,
        images: updatedVehicle.images 
      }).eq('id', updatedVehicle.id);

      if (error) {
        alert(`Chyba při ukládání vozidla: ${error.message}`);
        return;
      }
      
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

  if (isLoading && view === 'home' && supabase) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full"></div>
          <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Ověřuji spojení...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation isAdmin={isAdmin} onScrollTo={handleScrollTo} onLogout={() => { setIsAdmin(false); setView('home'); }} onNavigate={(v) => { if (v === 'admin' && !isAdmin) setIsLoginModalOpen(true); else setView(v); }} />
      <main className="flex-grow">
        {view === 'home' && <PublicHome vehicles={vehicles} reservations={reservations} onBookNow={handleBookNow} onScrollTo={handleScrollTo} />}
        {view === 'booking' && selectedVehicle && <BookingFlow vehicle={selectedVehicle} onCancel={() => setView('home')} onComplete={handleBookingComplete} />}
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
      </main>
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vstup pro majitele</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Administrátorské heslo</label>
                <input type="password" autoFocus required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl outline-none focus:border-orange-500 transition-all font-bold" placeholder="••••••••" />
              </div>
              {loginError && <p className="text-red-500 text-xs font-bold uppercase tracking-widest text-center">{loginError}</p>}
              <button type="submit" className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-orange-600 transition-all shadow-xl">Ověřit a vstoupit</button>
            </form>
          </div>
        </div>
      )}
      <footer className="bg-slate-900 text-white py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <Logo light className="justify-center mb-8" />
          <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em]">© 2026 obytkem.cz • Milan Gula • Brno</p>
        </div>
      </footer>
    </div>
  );
};

export default App;
