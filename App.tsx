
import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import PublicHome from './components/PublicHome';
import BookingFlow from './components/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import ConfirmationPage from './components/ConfirmationPage';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import Logo from './components/Logo';
import { MOCK_VEHICLES, MOCK_RESERVATIONS, MOCK_CUSTOMERS } from './mockData';
import { Vehicle, Reservation, ReservationStatus, Customer, SavedContract, HandoverProtocol, ReturnProtocol } from './types';
import { supabase } from './lib/supabase';

const App: React.FC = () => {
  const [view, setView] = useState<'home' | 'admin' | 'booking' | 'confirmation' | 'widget' | 'calendar'>('home');
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
  const [handoverProtocols, setHandoverProtocols] = useState<HandoverProtocol[]>([]);
  const [returnProtocols, setReturnProtocols] = useState<ReturnProtocol[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const embedded = urlParams.get('embedded') === 'true' || urlParams.get('view') === 'widget';
    
    if (embedded) {
      setIsEmbedded(true);
      // Add a class to body for embedded view to handle scrollbars better
      document.body.classList.add('is-embedded');
    }

    // Report height to parent for iframe resizing
    const reportHeight = () => {
      if (embedded) {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage({ type: 'obytkem-resize', height }, '*');
      }
    };

    const resizeObserver = new ResizeObserver(reportHeight);
    resizeObserver.observe(document.body);

    const viewParam = urlParams.get('view');
    const vehicleIdParam = urlParams.get('vehicleId');

    if (viewParam === 'widget') {
      setView('widget');
      if (vehicleIdParam) {
        setSelectedVehicleId(vehicleIdParam);
      }
    } else if (viewParam === 'calendar') {
      setView('calendar');
    }
    
    // Load from localStorage first (for demo mode persistence)
    const savedVehicles = localStorage.getItem('obytkem_vehicles_v2');
    if (savedVehicles) {
      try {
        setVehicles(JSON.parse(savedVehicles));
      } catch (e) {
        console.error("Chyba při načítání vozů z localStorage", e);
      }
    }

    const savedReservations = localStorage.getItem('obytkem_reservations_v2');
    if (savedReservations) {
      try {
        setReservations(JSON.parse(savedReservations));
      } catch (e) {
        console.error("Chyba při načítání rezervací z localStorage", e);
      }
    }

    const saved = localStorage.getItem('obytkem_last_booking');
    if (saved) {
      try {
        setLastBooking(JSON.parse(saved));
      } catch (e) {
        console.error("Chyba při načítání poslední rezervace z localStorage", e);
      }
    }

    fetchData();
  }, []);

  const fetchData = async () => {
    if (!supabase) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: vData } = await supabase.from('vehicles').select('*');
      const { data: rData } = await supabase.from('reservations').select('*').order('created_at', { ascending: false });
      const { data: cData } = await supabase.from('customers').select('*');
      const { data: hData } = await supabase.from('handover_protocols').select('*');
      const { data: retData } = await supabase.from('return_protocols').select('*');

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

      if (hData) {
        setHandoverProtocols(hData.map(h => ({
          id: h.id,
          reservationId: h.reservation_id,
          date: h.date,
          time: h.time,
          mileage: h.mileage,
          fuelLevel: h.fuel_level,
          cleanliness: h.cleanliness,
          damages: h.damages,
          notes: h.notes
        })));
      }

      if (retData) {
        setReturnProtocols(retData.map(r => ({
          id: r.id,
          reservationId: r.reservation_id,
          date: r.date,
          time: r.time,
          mileage: r.mileage,
          fuelLevel: r.fuel_level,
          cleanliness: r.cleanliness,
          damages: r.damages,
          notes: r.notes,
          returnMileage: r.return_mileage,
          returnFuelLevel: r.return_fuel_level,
          returnDamages: r.return_damages,
          extraKmCharge: r.extra_km_charge
        })));
      }
    } catch (error: any) {
      console.warn("Demo mód aktivní.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveHandover = async (protocol: HandoverProtocol) => {
    if (supabase) {
      const { error } = await supabase.from('handover_protocols').insert({
        reservation_id: protocol.reservationId,
        date: protocol.date,
        time: protocol.time,
        mileage: protocol.mileage,
        fuel_level: protocol.fuelLevel,
        cleanliness: protocol.cleanliness,
        damages: protocol.damages,
        notes: protocol.notes
      });
      if (error) console.error("Chyba při ukládání předání:", error.message);
    }
    setHandoverProtocols(prev => [...prev, protocol]);
  };

  const handleSaveReturn = async (protocol: ReturnProtocol) => {
    if (supabase) {
      const { error } = await supabase.from('return_protocols').insert({
        reservation_id: protocol.reservationId,
        date: protocol.date,
        time: protocol.time,
        mileage: protocol.mileage,
        fuel_level: protocol.fuelLevel,
        cleanliness: protocol.cleanliness,
        damages: protocol.damages,
        notes: protocol.notes,
        return_mileage: protocol.returnMileage,
        return_fuel_level: protocol.returnFuelLevel,
        return_damages: protocol.returnDamages,
        extra_km_charge: protocol.extraKmCharge
      });
      if (error) console.error("Chyba při ukládání vrácení:", error.message);
    }
    setReturnProtocols(prev => [...prev, protocol]);
  };

  const handleBookingComplete = async (data: any) => {
    localStorage.setItem('obytkem_last_booking', JSON.stringify({
      name: data.firstName,
      date: new Date().toISOString()
    }));
    setLastBooking({ name: data.firstName, date: new Date().toISOString() });
    setIsLoading(true);

    const newReservation: Reservation = {
      id: `res-${Date.now()}`,
      vehicleId: data.vehicleId,
      customerId: `cust-${Date.now()}`,
      startDate: data.startDate,
      endDate: data.endDate,
      totalPrice: data.totalPrice,
      deposit: 25000,
      status: ReservationStatus.PENDING,
      createdAt: new Date().toISOString(),
      customerNote: data.note
    };

    // Update local state and localStorage immediately for demo mode
    const updatedReservations = [newReservation, ...reservations];
    setReservations(updatedReservations);
    localStorage.setItem('obytkem_reservations_v2', JSON.stringify(updatedReservations));

    if (!supabase) {
      setTimeout(() => { setIsLoading(false); setView('confirmation'); }, 1500);
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
      console.error("DB error:", err.message);
      setView('confirmation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    if (supabase) await supabase.from('reservations').update({ status }).eq('id', id);
    const updated = reservations.map(res => res.id === id ? { ...res, status } : res);
    setReservations(updated);
    localStorage.setItem('obytkem_reservations_v2', JSON.stringify(updated));
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Smazat rezervaci?')) return;
    if (supabase) await supabase.from('reservations').delete().eq('id', id);
    const updated = reservations.filter(res => res.id !== id);
    setReservations(updated);
    localStorage.setItem('obytkem_reservations_v2', JSON.stringify(updated));
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
    }
    const updated = vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
    setVehicles(updated);
    localStorage.setItem('obytkem_vehicles_v2', JSON.stringify(updated));
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

  return (
    <div className={`${isEmbedded ? 'min-h-0' : 'min-h-screen'} flex flex-col ${isEmbedded ? 'bg-transparent' : 'bg-slate-50'}`}>
      {view === 'home' && lastBooking && !isAdmin && (
        <div className="bg-slate-900 text-white py-3 px-4 animate-in slide-in-from-top duration-700">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-xs font-bold uppercase tracking-widest">
            <span>👋 Vítejte zpět, {lastBooking.name}! Máte u nás rozpracovanou rezervaci.</span>
            <button onClick={() => setView('confirmation')} className="text-orange-400 hover:text-white transition-colors">Zobrazit stav →</button>
          </div>
        </div>
      )}

      {!isEmbedded && (
        <Navigation 
          isAdmin={isAdmin} 
          onScrollTo={handleScrollTo} 
          onLogout={() => { setIsAdmin(false); setView('home'); }} 
          onNavigate={(v) => { 
            if (v === 'admin' && !isAdmin) {
              setIsLoginModalOpen(true);
            } else {
              setView(v);
            }
          }} 
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
            {view === 'widget' && (
              <div className={`${isEmbedded ? 'p-2' : 'p-4 md:p-8'} animate-in fade-in duration-700`}>
                <div className="max-w-4xl mx-auto mb-8 flex justify-end">
                  <button 
                    onClick={() => setView('calendar')}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                    Zobrazit kalendář dostupnosti
                  </button>
                </div>
                {selectedVehicleId ? (
                  <BookingFlow 
                    vehicle={vehicles.find(v => v.id === selectedVehicleId) || vehicles[0]} 
                    allReservations={reservations}
                    onCancel={() => setSelectedVehicleId(null)} 
                    onComplete={handleBookingComplete} 
                    isEmbedded={true}
                  />
                ) : (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="text-center py-12">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3">Rezervace vozu</h2>
                      <p className="text-slate-500 font-medium max-w-md mx-auto">Vyberte si jeden z našich prémiových vozů a vyrazte na cestu za dobrodružstvím.</p>
                    </div>
                    <div className="grid gap-8">
                      {vehicles.filter(v => v.isActive).map(vehicle => (
                        <div key={vehicle.id} className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-premium flex flex-col lg:flex-row gap-10 items-center group hover:border-orange-200 transition-all duration-500">
                          <div className="relative overflow-hidden rounded-3xl w-full lg:w-80 h-48 shrink-0 bg-slate-100">
                            <img 
                              src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://picsum.photos/seed/camper/800/600'} 
                              alt={vehicle.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-grow text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                              <h3 className="text-3xl font-black text-slate-900">{vehicle.name}</h3>
                              <span className="inline-flex items-center px-3 py-1 bg-orange-50 text-orange-600 text-[10px] font-black uppercase tracking-widest rounded-full w-fit mx-auto lg:mx-0">
                                Skladem
                              </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-6">{vehicle.description}</p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                              {vehicle.equipment.slice(0, 3).map(eq => (
                                <span key={eq} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">{eq}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-center lg:items-end gap-4 min-w-[200px] w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <div className="text-3xl font-black text-orange-600">
                              {vehicle.basePrice} Kč
                              <span className="text-xs text-slate-400 font-bold uppercase tracking-widest ml-2">/ den</span>
                            </div>
                            <button 
                              onClick={() => { setSelectedVehicleId(vehicle.id); }}
                              className="w-full px-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-orange-600 transition-all shadow-xl shadow-slate-200 hover:shadow-orange-200"
                            >
                              Rezervovat vůz
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {view === 'calendar' && (
              <div className={`${isEmbedded ? 'p-0' : 'p-4 md:p-8'} animate-in fade-in duration-700`}>
                {!isEmbedded && (
                  <div className="max-w-4xl mx-auto mb-8">
                    <button 
                      onClick={() => setView('widget')}
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 flex items-center gap-2 transition-colors"
                    >
                      ← Zpět na výběr vozů
                    </button>
                  </div>
                )}
                <AvailabilityCalendar vehicles={vehicles} reservations={reservations} isEmbedded={isEmbedded} />
              </div>
            )}
            {view === 'home' && <PublicHome vehicles={vehicles} reservations={reservations} onBookNow={handleBookNow} onScrollTo={handleScrollTo} />}
            {view === 'booking' && selectedVehicle && (
              <BookingFlow 
                vehicle={selectedVehicle} 
                allReservations={reservations}
                onCancel={() => setView('home')} 
                onComplete={handleBookingComplete} 
                isEmbedded={isEmbedded}
              />
            )}
            {view === 'admin' && (
              <AdminDashboard 
                reservations={reservations} 
                vehicles={vehicles} 
                customers={customers} 
                savedContracts={savedContracts} 
                handoverProtocols={handoverProtocols}
                returnProtocols={returnProtocols}
                onSaveHandover={handleSaveHandover}
                onSaveReturn={handleSaveReturn}
                onSaveContract={(c) => setSavedContracts(prev => [...prev, c])} 
                onUpdateStatus={handleUpdateStatus} 
                onDeleteReservation={handleDeleteReservation} 
                onUpdateVehicle={handleUpdateVehicle}
                onRefresh={fetchData} 
              />
            )}
            {view === 'confirmation' && (
              <ConfirmationPage 
                onBackHome={() => setView('home')} 
                isEmbedded={isEmbedded} 
              />
            )}
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
