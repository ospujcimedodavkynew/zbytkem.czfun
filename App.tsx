
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Navigation from './components/Navigation';
import PublicHome from './components/PublicHome';
import BookingFlow from './components/BookingFlow';
import AdminDashboard from './components/AdminDashboard';
import ConfirmationPage from './components/ConfirmationPage';
import AvailabilityCalendar from './components/AvailabilityCalendar';
import TravelBlog from './components/TravelBlog';
import VehicleDetail from './components/VehicleDetail';
import GuidesDetail from './components/GuidesDetail';
import Checklist from './components/Checklist';
import CostCalculator from './components/CostCalculator';
import PublicContractView from './components/PublicContractView';
import AIChatbot from './components/AIChatbot';
import InstallBanner from './components/InstallBanner';
import Logo from './components/Logo';
import { MOCK_VEHICLES, MOCK_RESERVATIONS, MOCK_CUSTOMERS, MOCK_MAINTENANCE, MOCK_INVENTORY } from './mockData';
import { Vehicle, Reservation, ReservationStatus, Customer, SavedContract, HandoverProtocol, ReturnProtocol, Message, MaintenanceTask, InventoryItem } from './types';
import { supabase } from './lib/supabase';
import SEO from './src/components/SEO';

export const DEFAULT_SEASONS = [
  { id: 's1', name: 'Vedlejší sezóna', startDate: '2026-01-01', endDate: '2026-03-31', pricePerDay: 2500 },
  { id: 's2', name: 'Střední sezóna', startDate: '2026-04-01', endDate: '2026-05-31', pricePerDay: 2900 },
  { id: 's3', name: 'Hlavní sezóna', startDate: '2026-06-01', endDate: '2026-09-30', pricePerDay: 3400 },
  { id: 's4', name: 'Pozdní sezóna', startDate: '2026-10-01', endDate: '2026-12-31', pricePerDay: 2700 }
];

const App: React.FC = () => {
  console.log("App component rendering...");
  const [view, setView] = useState<'home' | 'admin' | 'booking' | 'confirmation' | 'widget' | 'calendar' | 'blog' | 'vehicle-detail' | 'guides' | 'checklist' | 'calculator' | 'contract-public'>('home');
  const [selectedContractId, setSelectedContractId] = useState<string | null>(null);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [initialStartDate, setInitialStartDate] = useState<string | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [loginEmail, setLoginEmail] = useState('pujcimedodavky@gmail.com');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const [lastBooking, setLastBooking] = useState<{name: string, date: string} | null>(null);
  const [isEmbedded, setIsEmbedded] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [savedContracts, setSavedContracts] = useState<SavedContract[]>([]);
  const [handoverProtocols, setHandoverProtocols] = useState<HandoverProtocol[]>([]);
  const [returnProtocols, setReturnProtocols] = useState<ReturnProtocol[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(MOCK_MAINTENANCE);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>(MOCK_INVENTORY);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleUpdateMessageStatus = async (id: string, status: Message['status']) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('messages').update({ status }).eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    } catch (e) {
      console.error('Error updating message status:', e);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Opravdu chcete tuto zprávu smazat?')) return;
    if (!supabase) return;
    try {
      const { error } = await supabase.from('messages').delete().eq('id', id);
      if (error) throw error;
      setMessages(prev => prev.filter(m => m.id !== id));
    } catch (e) {
      console.error('Error deleting message:', e);
    }
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialViewParam = urlParams.get('view');
    const embedded = urlParams.get('embedded') === 'true' || initialViewParam === 'widget' || initialViewParam === 'calendar';
    
    if (embedded) {
      setIsEmbedded(true);
      document.body.classList.add('is-embedded');
    }

    const reportHeight = () => {
      if (embedded) {
        const height = document.documentElement.scrollHeight;
        window.parent.postMessage({ type: 'obytkem-resize', height }, '*');
      }
    };

    const resizeObserver = new ResizeObserver(reportHeight);
    resizeObserver.observe(document.body);

    // Initial session check
    if (supabase) {
      console.log("Supabase inicializován, kontroluji relaci...");
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          console.log("Relace nalezena:", session.user.email);
          setUser(session.user);
          setIsAdmin(true);
        } else {
          console.log("Relace nenalezena.");
        }
      }).catch(err => {
        console.warn("Chyba při získávání relace:", err);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        if (session) {
          setUser(session.user);
          setIsAdmin(true);
        } else {
          setUser(null);
          setIsAdmin(false);
          if (view === 'admin') setView('home');
        }
      });

      return () => {
        subscription.unsubscribe();
        resizeObserver.disconnect();
      };
    }

    const vehicleIdParam = urlParams.get('vehicleId');
    const contractIdParam = urlParams.get('contractId');
    
    if (initialViewParam === 'widget') {
      setView('widget');
      if (vehicleIdParam) setSelectedVehicleId(vehicleIdParam);
    } else if (initialViewParam === 'calendar') {
      setView('calendar');
    } else if (initialViewParam === 'contract' && contractIdParam) {
      setSelectedContractId(contractIdParam);
      setView('contract-public');
    }
    
    return () => resizeObserver.disconnect();
  }, []);

  // Separate effect for data fetching
  useEffect(() => {
    console.log("Spouštím fetchData, isAdmin:", isAdmin);
    
    // Safety timeout - absolute maximum wait time
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.warn("Načítání trvá příliš dlouho (8s), vynucuji ukončení načítací obrazovky.");
        setIsLoading(false);
      }
    }, 8000);

    fetchData().catch(err => {
      console.error("fetchData failed with unhandled error:", err);
      setIsLoading(false);
    }).finally(() => {
      console.log("fetchData dokončeno.");
      clearTimeout(timeoutId);
      setIsLoading(false);
    });
  }, [isAdmin]);

  const fetchData = async () => {
    console.log("fetchData start...");
    if (!supabase) {
      console.log("Supabase není k dispozici, zůstávám v demo režimu.");
      setIsLoading(false);
      return;
    }

    try {
      console.log("Načítám veřejná data...");
      // Public data - always fetch
      const [
        { data: vData, error: vError },
        { data: maintData, error: maintError },
        { data: invData, error: invError },
        { data: rDataPublic, error: rErrorPublic }
      ] = await Promise.all([
        supabase.from('vehicles').select('*'),
        supabase.from('maintenance_tasks').select('*'),
        supabase.from('inventory_items').select('*'),
        supabase.from('reservations').select('*') // Načítáme vše pro kalendář
      ]);

      if (vError) console.warn("Chyba při načítání vozů:", vError.message);
      if (maintError) console.warn("Chyba při načítání údržby:", maintError.message);
      if (invError) console.warn("Chyba při načítání inventáře:", invError.message);
      if (rErrorPublic) console.warn("Chyba při načítání rezervací (veřejné):", rErrorPublic.message);

      if (vData && vData.length > 0) {
        // ... mapping logic ...
        const mappedVehicles = vData.map(v => ({
          id: v.id,
          name: v.name?.includes('Laika') ? 'Ahorn TU Plus (Model 2022)' : (v.name || 'Obytný vůz'),
          description: v.description?.includes('Laika') ? 'Moderní a prostorný polointegrovaný vůz na podvozku Renault Master s výkonným motorem 165 kW. Unikátní zadní sezení ve tvaru "U" nabízí maximální komfort pro relaxaci a společné chvíle. Vůz je homologován pro 5 osob na jízdu i spaní.' : (v.description || ''),
          licensePlate: v.license_plate || '',
          vin: v.vin || '',
          basePrice: Number(v.base_price || 0),
          minDays: v.min_days || 3,
          deposit: Number(v.deposit || 0),
          kmLimitPerDay: v.km_limit_per_day || 300,
          extraKmPrice: Number(v.extra_km_price || 0),
          images: v.images || [],
          isActive: v.is_active !== false,
          seasonalPricing: (v.seasonal_pricing && v.seasonal_pricing.length > 0) ? v.seasonal_pricing : DEFAULT_SEASONS,
          equipment: v.equipment || []
        }));
        setVehicles(mappedVehicles);
      }

      if (rDataPublic) {
        setReservations(rDataPublic.map(r => ({
          id: r.id,
          vehicleId: r.vehicle_id,
          customerId: r.customer_id,
          startDate: r.start_date,
          endDate: r.end_date,
          totalPrice: Number(r.total_price),
          deposit: Number(r.deposit),
          status: r.status as ReservationStatus,
          createdAt: r.created_at,
          customerNote: r.customer_note,
          deliveryAddress: r.delivery_address,
          deliveryTime: r.delivery_time,
          pickupTime: r.pickup_time,
          returnTime: r.return_time,
          estimatedMileage: r.estimated_mileage,
          destination: r.destination,
          selectedAddOns: r.selected_add_ons || []
        })));
      }

      if (maintData) {
        setMaintenanceTasks(maintData.map(m => ({
          id: m.id,
          vehicleId: m.vehicle_id,
          title: m.title,
          type: m.type,
          description: m.description,
          date: m.date,
          cost: Number(m.cost),
          status: m.status,
          mileage: m.mileage
        })));
      }

      if (invData) {
        if (invData.length > 0) {
          console.log("Inventory columns:", Object.keys(invData[0]));
        }
        setInventoryItems(invData.map(i => ({
          id: i.id,
          name: i.name,
          category: i.category,
          totalQuantity: i.total_quantity,
          availableQuantity: i.available_quantity,
          pricePerDay: Number(i.price_per_day),
          description: i.description,
          image: i.image,
          isOneTimeFee: i.is_one_time_fee
        })));
      }

      // VÝZNAMNÁ ZMĚNA: Ukončíme načítání hned po veřejných datech
      // Admin data se mohou načítat na pozadí
      console.log("Veřejná data načtena, uvolňuji UI...");
      setIsLoading(false);

      // Admin data - only fetch if authenticated
      if (isAdmin) {
        console.log("Načítám administrátorská data na pozadí...");
        const [
          { data: cData, error: cError },
          { data: hData, error: hError },
          { data: retData, error: retError },
          { data: mData, error: mError },
          { data: sContracts, error: sError }
        ] = await Promise.all([
          supabase.from('customers').select('*'),
          supabase.from('handover_protocols').select('*'),
          supabase.from('return_protocols').select('*'),
          supabase.from('messages').select('*').order('created_at', { ascending: false }),
          supabase.from('saved_contracts').select('*').order('created_at', { ascending: false })
        ]);

        if (cData) setCustomers(cData.map(c => ({
          id: c.id,
          firstName: c.first_name,
          lastName: c.last_name,
          email: c.email,
          phone: c.phone,
          address: c.address,
          idNumber: c.id_number || ''
        })));

        if (hData) setHandoverProtocols(hData.map(h => ({
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

        if (retData) setReturnProtocols(retData.map(r => ({
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

        if (mData) setMessages(mData.map(m => ({
          id: m.id,
          createdAt: m.created_at,
          name: m.name,
          email: m.email,
          phone: m.phone,
          subject: m.subject,
          message: m.message,
          status: m.status
        })));

        if (sContracts) setSavedContracts(sContracts.map(s => ({
          id: s.id,
          reservationId: s.reservation_id,
          customerName: s.customer_name,
          createdAt: s.created_at,
          content: s.content
        })));
      }
    } catch (error: any) {
      console.error("Kritická chyba při fetchData:", error?.message || error);
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
    setIsSubmitting(true);

    const newReservation: Reservation = {
      id: crypto.randomUUID(),
      vehicleId: data.vehicleId,
      customerId: crypto.randomUUID(),
      startDate: data.startDate,
      endDate: data.endDate,
      totalPrice: data.totalPrice,
      deposit: 25000,
      status: ReservationStatus.PENDING,
      createdAt: new Date().toISOString(),
      customerNote: data.note,
      selectedAddOns: data.selectedAddOns,
      deliveryAddress: data.deliveryAddress,
      deliveryTime: data.deliveryTime,
      pickupTime: data.pickupTime,
      returnTime: data.returnTime,
      estimatedMileage: Number(data.estimatedMileage),
      destination: data.destination
    };

    // Update local state and localStorage immediately for demo mode
    const updatedReservations = [newReservation, ...reservations];
    setReservations(updatedReservations);
    localStorage.setItem('obytkem_reservations_v3', JSON.stringify(updatedReservations));

    if (!supabase) {
      setTimeout(() => { setIsSubmitting(false); setView('confirmation'); }, 1500);
      return;
    }

    try {
      console.log("Kontrola existujícího zákazníka...");
      let customerId;
      
      // Zkusíme najít zákazníka podle emailu
      const { data: existingCustomer, error: findErr } = await supabase
        .from('customers')
        .select('id')
        .eq('email', data.email)
        .maybeSingle();

      if (findErr) {
        console.warn("Chyba při hledání zákazníka:", findErr);
      }

      if (existingCustomer) {
        customerId = existingCustomer.id;
        console.log("Nalezen existující zákazník, ID:", customerId);
        
        // Volitelně můžeme aktualizovat údaje zákazníka
        await supabase.from('customers').update({
          first_name: data.firstName,
          last_name: data.lastName,
          phone: data.phone,
          address: data.address,
          id_number: data.idNumber
        }).eq('id', customerId);
      } else {
        console.log("Vytvářím nového zákazníka...");
        const { data: newCustomerData, error: cErr } = await supabase.from('customers').insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          address: data.address,
          id_number: data.idNumber
        }).select().single();
        
        if (cErr) {
          console.error("Chyba při ukládání zákazníka:", cErr);
          throw new Error(`Nepodařilo se uložit údaje o zákazníkovi: ${cErr.message}`);
        }
        customerId = newCustomerData.id;
        console.log("Nový zákazník vytvořen, ID:", customerId);
      }

      console.log("Odesílám rezervaci do Supabase...");

      const { error: rErr } = await supabase.from('reservations').insert({
        vehicle_id: data.vehicleId,
        customer_id: customerId,
        start_date: data.startDate,
        end_date: data.endDate,
        total_price: data.totalPrice,
        deposit: 25000,
        status: ReservationStatus.PENDING,
        customer_note: data.note,
        selected_add_ons: data.selectedAddOns,
        delivery_address: data.deliveryAddress || null,
        delivery_time: data.deliveryTime || null,
        pickup_time: data.pickupTime || null,
        return_time: data.returnTime || null,
        estimated_mileage: data.estimatedMileage ? Number(data.estimatedMileage) : null,
        destination: data.destination || null
      });
      
      if (rErr) {
        console.error("Chyba při ukládání rezervace:", rErr);
        throw new Error(`Nepodařilo se uložit rezervaci: ${rErr.message}`);
      }

      console.log("Rezervace úspěšně uložena do DB.");
      await fetchData();
      setView('confirmation');
    } catch (err: any) {
      console.error("KRITICKÁ CHYBA DB:", err);
      alert("Omlouváme se, ale rezervaci se nepodařilo uložit do databáze. Prosím kontaktujte nás telefonicky. Detail chyby: " + (err.message || "Neznámá chyba"));
      // V případě chyby neukazujeme potvrzení, ale zůstáváme na formuláři, aby uživatel mohl zkusit znovu nebo nás kontaktovat
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateStatus = async (id: string, status: ReservationStatus) => {
    if (supabase) await supabase.from('reservations').update({ status }).eq('id', id);
    const updated = reservations.map(res => res.id === id ? { ...res, status } : res);
    setReservations(updated);
    localStorage.setItem('obytkem_reservations_v3', JSON.stringify(updated));
  };

  const handleDeleteReservation = async (id: string) => {
    if (!confirm('Smazat rezervaci?')) return;
    if (supabase) await supabase.from('reservations').delete().eq('id', id);
    const updated = reservations.filter(res => res.id !== id);
    setReservations(updated);
    localStorage.setItem('obytkem_reservations_v3', JSON.stringify(updated));
  };

  const handleUpdateVehicle = async (updatedVehicle: Vehicle) => {
    console.log("Updating vehicle:", updatedVehicle.id);
    try {
      if (supabase) {
        const { error } = await supabase.from('vehicles').update({
          name: updatedVehicle.name,
          description: updatedVehicle.description,
          base_price: updatedVehicle.basePrice,
          min_days: updatedVehicle.minDays,
          seasonal_pricing: updatedVehicle.seasonalPricing,
          license_plate: updatedVehicle.licensePlate,
          vin: updatedVehicle.vin,
          deposit: updatedVehicle.deposit,
          km_limit_per_day: updatedVehicle.kmLimitPerDay,
          extra_km_price: updatedVehicle.extraKmPrice,
          images: updatedVehicle.images,
          equipment: updatedVehicle.equipment
        }).eq('id', updatedVehicle.id);
        
        if (error) {
          console.error("Supabase update error:", error.message);
          alert("Chyba při ukládání do databáze: " + error.message);
        } else {
          console.log("Supabase update successful");
        }
      }
      const updated = vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v);
      setVehicles(updated);
      localStorage.setItem('obytkem_vehicles_v3', JSON.stringify(updated));
    } catch (err: any) {
      console.error("Critical error in handleUpdateVehicle:", err);
      alert("Kritická chyba při ukládání: " + err.message);
    }
  };

  const handleUpdateInventoryItem = async (updatedItem: InventoryItem) => {
    console.log("Updating inventory item:", updatedItem.id);
    try {
      if (supabase) {
        const { error } = await supabase.from('inventory_items').update({
          name: updatedItem.name,
          category: updatedItem.category,
          total_quantity: updatedItem.totalQuantity,
          available_quantity: updatedItem.availableQuantity,
          price_per_day: updatedItem.pricePerDay,
          description: updatedItem.description,
          image: updatedItem.image,
          is_one_time_fee: updatedItem.isOneTimeFee
        }).eq('id', updatedItem.id);
        
        if (error) {
          console.error("Supabase inventory update error:", error.message);
        }
      }
      const updated = inventoryItems.map(item => item.id === updatedItem.id ? updatedItem : item);
      setInventoryItems(updated);
      localStorage.setItem('obytkem_inventory_v3', JSON.stringify(updated));
    } catch (err: any) {
      console.error("Error in handleUpdateInventoryItem:", err);
    }
  };

  const handleAddInventoryItem = async (newItem: Omit<InventoryItem, 'id'>) => {
    console.log("Adding inventory item:", newItem.name);
    const id = crypto.randomUUID();
    const itemWithId = { ...newItem, id };
    
    try {
      if (supabase) {
        const { error } = await supabase.from('inventory_items').insert({
          id,
          name: newItem.name,
          category: newItem.category,
          total_quantity: newItem.totalQuantity,
          available_quantity: newItem.availableQuantity,
          price_per_day: newItem.pricePerDay,
          description: newItem.description,
          image: newItem.image,
          is_one_time_fee: newItem.isOneTimeFee
        });
        
        if (error) {
          console.error("Supabase inventory insert error:", error.message);
          alert("Chyba při přidávání do databáze: " + error.message);
        }
      }
      
      const updated = [...inventoryItems, itemWithId];
      setInventoryItems(updated);
      localStorage.setItem('obytkem_inventory_v3', JSON.stringify(updated));
    } catch (err: any) {
      console.error("Error in handleAddInventoryItem:", err);
      alert("Kritická chyba při přidávání: " + err.message);
    }
  };

  const handleDeleteInventoryItem = async (id: string) => {
    if (!confirm('Opravdu chcete tuto položku smazat?')) return;
    
    if (supabase) {
      await supabase.from('inventory_items').delete().eq('id', id);
    }
    
    const updated = inventoryItems.filter(item => item.id !== id);
    setInventoryItems(updated);
    localStorage.setItem('obytkem_inventory_v3', JSON.stringify(updated));
  };

  const handleSaveContract = async (contract: SavedContract) => {
    if (supabase) {
      const { error } = await supabase.from('saved_contracts').insert({
        id: contract.id,
        reservation_id: contract.reservationId,
        customer_name: contract.customerName,
        content: contract.content
      });
      if (error) console.error("Chyba při ukládání smlouvy:", error.message);
    }
    setSavedContracts(prev => [...prev, contract]);
  };

  const handleBookNow = (vehicleId: string, startDate?: string) => {
    setSelectedVehicleId(vehicleId);
    setInitialStartDate(startDate || null);
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

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!supabase) {
      setLoginError('Databáze není připojena.');
      return;
    }

    if (!loginEmail || !loginPassword) {
      setLoginError('Zadejte prosím e-mail i heslo.');
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      if (error) throw error;

      setIsAdmin(true);
      setView('admin');
      setIsLoginModalOpen(false);
      setLoginPassword('');
      // Ponecháme email pro příští přihlášení
    } catch (err: any) {
      if (err.message === 'Invalid login credentials') {
        setLoginError('Nesprávný e-mail nebo heslo.');
      } else if (err.message === 'Email not confirmed') {
        setLoginError('E-mail nebyl potvrzen. Zkontrolujte svou schránku.');
      } else {
        setLoginError(err.message);
      }
    }
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    setIsAdmin(false);
    setUser(null);
    setView('home');
  };

  const handleAdminClick = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    } else {
      setView('admin');
    }
  };

  const handleNavigate = (newView: typeof view) => {
    if (newView === 'admin') {
      handleAdminClick();
    } else {
      setView(newView);
    }
  };

  // Expose admin trigger to window for footer access
  useEffect(() => {
    (window as any).openAdmin = handleAdminClick;
    return () => { delete (window as any).openAdmin; };
  }, [isAdmin]);

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  // SEO Metadata mapping
  const getSEOMetadata = () => {
    switch (view) {
      case 'home':
        return { title: 'Půjčovna obytných vozů Brno', description: 'Pronájem moderních obytných vozů Ahorn Canada v Brně. Cestujte svobodně a komfortně po celé Evropě. Online rezervace.' };
      case 'booking':
        return { title: 'Rezervace vozu', description: 'Zarezervujte si svůj termín pro nezapomenutelnou dovolenou v obytném voze.' };
      case 'calendar':
        return { title: 'Kalendář obsazenosti', description: 'Přehled volných termínů pro naše obytné vozy.' };
      case 'blog':
        return { title: 'Cestovatelský blog', description: 'Inspirace, tipy na cesty a rady pro život v karavanu.' };
      case 'vehicle-detail':
        return { title: selectedVehicle?.name || 'Náš obytný vůz', description: 'Detailní informace o voze Ahorn Canada TU Plus. Vybavení, technické parametry a fotogalerie.' };
      case 'calculator':
        return { title: 'Kalkulačka ceny', description: 'Spočítejte si přesnou cenu pronájmu včetně všech doplňků a pojištění.' };
      case 'checklist':
        return { title: 'Checklist na cesty', description: 'Seznam věcí, které si nezapomenout vzít s sebou na cestu obytným vozem.' };
      default:
        return { title: 'Půjčovna obytných vozů', description: 'Pronájem moderních obytných vozů Ahorn Canada.' };
    }
  };

  const seo = getSEOMetadata();

  return (
    <div className={`${isEmbedded ? 'min-h-0' : 'min-h-screen'} flex flex-col ${isEmbedded ? 'bg-transparent' : 'bg-slate-50'} overflow-x-hidden`}>
      <SEO title={seo.title} description={seo.description} />
      
      {!isOnline && (
        <div className="bg-red-600 text-white py-1 px-4 text-center text-[10px] font-black uppercase tracking-widest animate-pulse">
          Pracujete v offline režimu. Některé funkce mohou být omezené.
        </div>
      )}

      {view === 'home' && lastBooking && !isAdmin && (
        <div className="bg-slate-900 text-white py-3 px-4 animate-in slide-in-from-top duration-700 border-b border-white/5">
          <div className="max-w-7xl mx-auto flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
              Vítejte zpět, {lastBooking.name}! Máte u nás rozpracovanou rezervaci.
            </span>
            <button onClick={() => setView('confirmation')} className="text-brand-primary hover:text-white transition-colors">Zobrazit stav →</button>
          </div>
        </div>
      )}

      {!isEmbedded && (
        <Navigation 
          isAdmin={isAdmin} 
          onNavigate={handleNavigate} 
          onScrollTo={handleScrollTo} 
          onLogout={handleLogout} 
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      )}
      
      {!isEmbedded && !isAdmin && <AIChatbot />}
      {!isEmbedded && !isAdmin && <InstallBanner />}
      
      <main className={`flex-grow overflow-x-hidden ${!isEmbedded ? 'pt-32' : ''}`}>
        {isLoading ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-ping w-12 h-12 border-4 border-brand-primary/20 rounded-full"></div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Načítám data...</p>
                <button 
                  onClick={() => setIsLoading(false)}
                  className="text-[9px] font-bold text-brand-primary/60 hover:text-brand-primary uppercase tracking-widest transition-colors mt-4"
                >
                  Přeskočit a zkusit demo verzi
                </button>
              </div>
            </div>
          </div>
        ) : isSubmitting && view === 'booking' ? (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="animate-spin w-12 h-12 border-4 border-brand-primary border-t-transparent rounded-full"></div>
                <div className="absolute inset-0 animate-ping w-12 h-12 border-4 border-brand-primary/20 rounded-full"></div>
              </div>
              <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Odesílám rezervaci...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'widget' && (
              <div className={`${isEmbedded ? 'p-2' : 'p-4 md:p-8'} animate-in fade-in duration-700`}>
                <div className="max-w-4xl mx-auto mb-8 flex justify-end">
                  <button 
                    onClick={() => setView('calendar')}
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary flex items-center gap-2 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z"></path></svg>
                    Zobrazit kalendář dostupnosti
                  </button>
                </div>
                {selectedVehicleId ? (
                  <BookingFlow 
                    vehicle={vehicles.find(v => v.id === selectedVehicleId) || vehicles[0]} 
                    allReservations={reservations}
                    inventoryItems={inventoryItems}
                    onCancel={() => setSelectedVehicleId(null)} 
                    onComplete={handleBookingComplete} 
                    isEmbedded={true}
                  />
                ) : (
                  <div className="max-w-4xl mx-auto space-y-10">
                    <div className="text-center py-12">
                      <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-3 gradient-text">Rezervace vozu</h2>
                      <p className="text-slate-500 font-medium max-w-md mx-auto">Vyberte si jeden z našich prémiových vozů a vyrazte na cestu za dobrodružstvím.</p>
                    </div>
                    <div className="grid gap-8">
                      {vehicles.filter(v => v.isActive).map(vehicle => (
                        <div key={vehicle.id} className="card-ultimate p-8 shadow-ultimate flex flex-col lg:flex-row gap-10 items-center group">
                          <div className="relative overflow-hidden rounded-3xl w-full lg:w-80 h-48 shrink-0 bg-slate-100">
                            <img 
                              src={vehicle.images && vehicle.images.length > 0 ? vehicle.images[0] : 'https://picsum.photos/seed/camper/800/600'} 
                              alt={vehicle.name} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="flex-grow text-center lg:text-left">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
                              <h3 className="text-2xl font-black text-slate-900">{vehicle.name}</h3>
                              <span className="inline-flex items-center px-3 py-1 bg-brand-primary/10 text-brand-primary text-[10px] font-black uppercase tracking-widest rounded-full w-fit mx-auto lg:mx-0">
                                Skladem
                              </span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2 mb-6">{vehicle.description}</p>
                            <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                              {vehicle.equipment.slice(0, 3).map(eq => (
                                <span key={eq} className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-100">{eq}</span>
                              ))}
                            </div>
                          </div>
                          <div className="flex flex-col items-center lg:items-end gap-4 min-w-[200px] w-full lg:w-auto pt-6 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                            <div className="text-2xl font-black text-brand-primary">
                              {vehicle.basePrice} Kč
                              <span className="text-xs text-slate-400 font-black uppercase tracking-widest ml-2">/ den</span>
                            </div>
                            <button 
                              onClick={() => { setSelectedVehicleId(vehicle.id); }}
                              className="btn-ultimate-primary w-full px-10 py-5 text-xs"
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
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-brand-primary flex items-center gap-2 transition-colors"
                    >
                      ← Zpět na výběr vozů
                    </button>
                  </div>
                )}
                <AvailabilityCalendar 
                  vehicles={vehicles} 
                  reservations={reservations} 
                  isEmbedded={isEmbedded} 
                  initialVehicleId={selectedVehicleId || vehicles[0]?.id}
                  onDateClick={(date) => handleBookNow(selectedVehicleId || vehicles[0]?.id, date)}
                />
              </div>
            )}
            {view === 'blog' && <TravelBlog onBack={() => setView('home')} />}
            {view === 'checklist' && <Checklist onBack={() => setView('home')} />}
            {view === 'calculator' && <CostCalculator onBack={() => setView('home')} />}
            {view === 'vehicle-detail' && selectedVehicle && (
              <VehicleDetail 
                vehicle={selectedVehicle} 
                onBack={() => setView('home')} 
                onBook={() => setView('booking')} 
              />
            )}
            {view === 'guides' && <GuidesDetail onBack={() => setView('home')} />}
            {view === 'home' && (
              <PublicHome 
                vehicles={vehicles} 
                reservations={reservations} 
                onBookNow={handleBookNow} 
                onScrollTo={handleScrollTo} 
                onNavigate={handleNavigate} 
                isDarkMode={isDarkMode}
                setIsDarkMode={setIsDarkMode}
              />
            )}
            {view === 'booking' && selectedVehicle && (
              <BookingFlow 
                vehicle={selectedVehicle} 
                allReservations={reservations}
                inventoryItems={inventoryItems}
                initialStartDate={initialStartDate || undefined}
                onCancel={() => { setView('home'); setInitialStartDate(null); }} 
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
                messages={messages}
                maintenanceTasks={maintenanceTasks}
                inventoryItems={inventoryItems}
                onSaveHandover={handleSaveHandover}
                onSaveReturn={handleSaveReturn}
                onSaveContract={handleSaveContract} 
                onUpdateStatus={handleUpdateStatus} 
                onUpdateMessageStatus={handleUpdateMessageStatus}
                onDeleteMessage={handleDeleteMessage}
                onDeleteReservation={handleDeleteReservation} 
                onUpdateVehicle={handleUpdateVehicle}
                onUpdateInventoryItem={handleUpdateInventoryItem}
                onAddInventoryItem={handleAddInventoryItem}
                onDeleteInventoryItem={handleDeleteInventoryItem}
                onLogout={handleLogout}
                onRefresh={fetchData} 
              />
            )}
            {view === 'confirmation' && (
              <ConfirmationPage 
                onBackHome={() => setView('home')} 
                isEmbedded={isEmbedded} 
              />
            )}
            {view === 'contract-public' && selectedContractId && (
              <PublicContractView 
                contractId={selectedContractId} 
                onBack={() => {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('view');
                  url.searchParams.delete('contractId');
                  window.history.pushState({}, '', url);
                  setView('home');
                }} 
              />
            )}
          </>
        )}
      </main>

      {!isEmbedded && (
        <footer className={`py-20 border-t relative overflow-hidden transition-colors duration-500 ${isDarkMode ? 'bg-slate-950 border-white/5 text-white' : 'bg-slate-900 border-white/5 text-white'}`}>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-px bg-gradient-to-r from-transparent via-brand-primary/50 to-transparent"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-16 mb-16">
              <div className="flex flex-col items-center md:items-start gap-6">
                <Logo light className="justify-center md:justify-start scale-110 origin-left" />
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] max-w-xs text-center md:text-left leading-loose">
                  Půjčovna obytných vozů v Brně.<br />Svoboda na čtyřech kolech.
                </p>
              </div>
              
              <div className="flex flex-wrap justify-center gap-10 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <button onClick={() => handleScrollTo('fleet')} className="hover:text-brand-primary transition-colors">Naše vozy</button>
                <button onClick={() => handleScrollTo('pricing')} className="hover:text-brand-primary transition-colors">Ceník</button>
                <button onClick={() => handleScrollTo('faq')} className="hover:text-brand-primary transition-colors">FAQ</button>
                <button onClick={() => handleScrollTo('guides')} className="hover:text-brand-primary transition-colors">Návody</button>
                <button onClick={() => setView('admin')} className="hover:text-brand-primary transition-colors">Administrace</button>
              </div>

              <div className="flex flex-col items-center md:items-end gap-4">
                <div className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-1">Sesterské projekty</div>
                <a 
                  href="https://www.pujcimedodavky.cz" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-4 px-8 py-4 rounded-2xl border transition-all group shadow-ultimate ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                >
                  <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white font-black text-xs shadow-lg shadow-brand-primary/20">PD</div>
                  <div className="text-left">
                    <div className="text-[10px] font-black text-white uppercase tracking-widest">Půjčíme dodávky</div>
                    <div className="text-[9px] text-slate-500 font-bold">Přejít na web PD.cz</div>
                  </div>
                </a>
              </div>
            </div>
            
            <div className="pt-10 border-t border-white/5 text-center">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">
                © 2026 OBYTKEM.CZ • MILAN GULA • BRNO
              </p>
            </div>
          </div>
        </footer>
      )}

      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="card-ultimate shadow-ultimate w-full max-w-md p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-primary"></div>
            <div className="flex justify-between items-center mb-10">
              <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Vstup pro majitele</h2>
              <button onClick={() => setIsLoginModalOpen(false)} className="w-10 h-10 rounded-full glass flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
            <form onSubmit={handleAdminLogin} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-mail administrátora</label>
                <input 
                  type="email" 
                  required 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                  className="input-ultimate w-full px-6 py-5" 
                  placeholder="admin@obytkem.cz" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Přístupové heslo</label>
                <input 
                  type="password" 
                  required 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                  className="input-ultimate w-full px-6 py-5" 
                  placeholder="••••••••" 
                />
              </div>
              {loginError && <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">{loginError}</p>}
              <button type="submit" className="btn-ultimate-primary w-full py-5 text-xs">
                Vstoupit do administrace
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default App;
