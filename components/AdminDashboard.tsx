
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract, SeasonPrice, HandoverProtocol, ReturnProtocol, Message, MaintenanceTask, InventoryItem } from '../types';
import { DEFAULT_SEASONS } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import MessageManager from '../src/components/MessageManager';
import { formatCurrency, formatDate, getMonthName, calculateDays } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends, isAiConfigured } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { 
  format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, 
  addMonths, subMonths, isWithinInterval, parseISO, startOfDay 
} from 'date-fns';
import { cs } from 'date-fns/locale';
import SignatureCanvas from 'react-signature-canvas';

interface AdminDashboardProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  savedContracts: SavedContract[];
  handoverProtocols: HandoverProtocol[];
  returnProtocols: ReturnProtocol[];
  messages: Message[];
  maintenanceTasks: MaintenanceTask[];
  inventoryItems: InventoryItem[];
  onSaveContract: (contract: SavedContract) => void;
  onSaveHandover: (protocol: HandoverProtocol) => void;
  onSaveReturn: (protocol: ReturnProtocol) => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdateMessageStatus: (id: string, status: Message['status']) => void;
  onDeleteMessage: (id: string) => void;
  onDeleteReservation: (id: string) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onUpdateInventoryItem: (item: InventoryItem) => void;
  onAddInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  onDeleteInventoryItem: (id: string) => void;
  onLogout: () => void;
  onViewContract: (id: string) => void;
  onRefresh?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, 
  vehicles, 
  customers,
  savedContracts,
  handoverProtocols,
  returnProtocols,
  messages,
  maintenanceTasks,
  inventoryItems,
  onSaveContract,
  onSaveHandover,
  onSaveReturn,
  onUpdateStatus,
  onUpdateMessageStatus,
  onDeleteMessage,
  onDeleteReservation,
  onUpdateVehicle,
  onUpdateInventoryItem,
  onAddInventoryItem,
  onDeleteInventoryItem,
  onLogout,
  onViewContract,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'fleet' | 'advisor' | 'protocols' | 'widget' | 'calendar' | 'stats' | 'messages' | 'maintenance' | 'inventory' | 'pricing' | 'customers' | 'contracts'>('reservations');
  const [generatingContractId, setGeneratingContractId] = useState<string | null>(null);
  const [viewingContract, setViewingContract] = useState<{content: string, customer: string, resId: string} | null>(null);
  const [viewingReservationId, setViewingReservationId] = useState<string | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [activeProtocolEdit, setActiveProtocolEdit] = useState<{type: 'handover' | 'return', reservationId: string} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, occupancyRate: string, recommendation: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const adminSignatureRef = useRef<SignatureCanvas>(null);
  
  // --- Stats Calculations ---
  const statsData = useMemo(() => {
    const months = ['Led', 'Úno', 'Bře', 'Dub', 'Kvě', 'Čer', 'Čec', 'Srp', 'Zář', 'Říj', 'Lis', 'Pro'];
    const revenueByMonth = new Array(12).fill(0);
    
    reservations.filter(r => r.status !== ReservationStatus.CANCELLED).forEach(res => {
      const date = parseISO(res.startDate);
      revenueByMonth[date.getMonth()] += res.totalPrice;
    });

    const barData = months.map((name, index) => ({
      name,
      revenue: revenueByMonth[index]
    }));

    const totalPossibleDays = vehicles.length * 30; // Simplified for current month
    const currentMonth = new Date().getMonth();
    const bookedDays = reservations
      .filter(r => r.status !== ReservationStatus.CANCELLED && parseISO(r.startDate).getMonth() === currentMonth)
      .reduce((acc, res) => acc + calculateDays(res.startDate, res.endDate), 0);
    
    const utilizationData = [
      { name: 'Obsazeno', value: bookedDays },
      { name: 'Volno', value: Math.max(0, totalPossibleDays - bookedDays) }
    ];

    return { barData, utilizationData };
  }, [reservations, vehicles]);

  // --- Calendar Logic ---
  const [calendarDate, setCalendarDate] = useState(new Date());
  const calendarDays = useMemo(() => {
    return eachDayOfInterval({
      start: startOfMonth(calendarDate),
      end: endOfMonth(calendarDate)
    });
  }, [calendarDate]);

  const getReservationForDay = (vehicleId: string, day: Date) => {
    return reservations.find(res => 
      res.vehicleId === vehicleId && 
      res.status !== ReservationStatus.CANCELLED &&
      isWithinInterval(startOfDay(day), {
        start: startOfDay(parseISO(res.startDate)),
        end: startOfDay(parseISO(res.endDate))
      })
    );
  };

  const COLORS = ['#0f172a', '#e2e8f0'];

  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const [protocolFormData, setProtocolFormData] = useState<any>({
    mileage: 0,
    fuelLevel: 100,
    cleanliness: 'Výborná',
    damages: 'Žádná',
    notes: '',
    returnMileage: 0,
    returnFuelLevel: 100,
    returnDamages: 'Žádná'
  });

  useEffect(() => {
    if (vehicles.length > 0 && !editingVehicle) setEditingVehicle(vehicles[0]);
  }, [vehicles]);

  const handleRunAiAnalysis = async () => {
    setLoadingAi(true);
    try {
      const result = await analyzeReservationTrends(reservations);
      setAiAnalysis(result);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const openProtocolModal = (type: 'handover' | 'return', resId: string) => {
    const res = reservations.find(r => r.id === resId);
    const hp = handoverProtocols.find(p => p.reservationId === resId);
    
    if (type === 'handover') {
      setProtocolFormData({
        mileage: hp?.mileage || 124500, // Default nebo existující
        fuelLevel: hp?.fuelLevel || 100,
        cleanliness: hp?.cleanliness || 'Výborná',
        damages: hp?.damages || 'Žádná',
        notes: hp?.notes || ''
      });
    } else {
      setProtocolFormData({
        mileage: hp?.mileage || 0,
        fuelLevel: hp?.fuelLevel || 0,
        returnMileage: hp?.mileage || 0,
        returnFuelLevel: 100,
        returnDamages: 'Žádná',
        notes: ''
      });
    }
    setActiveProtocolEdit({ type, reservationId: resId });
  };

  const handleGenerateContract = async (res: Reservation) => {
    setGeneratingContractId(res.id);
    const customer = customers.find(c => c.id === res.customerId);
    const vehicle = vehicles.find(v => v.id === res.vehicleId);

    const selectedItemsText = res.selectedAddOns?.map(addon => {
      const item = inventoryItems.find(i => i.id === addon.itemId);
      return item ? `${item.name} (${addon.quantity}x) - ${formatCurrency(item.pricePerDay * addon.quantity)}` : '';
    }).filter(Boolean).join(', ') || 'Žádné';

    try {
      const contractText = await generateContractTemplate({
        customerName: `${customer?.firstName} ${customer?.lastName}`,
        customerAddress: customer?.address || 'Neuvedena',
        customerEmail: customer?.email || '',
        customerPhone: customer?.phone || 'Neuveden',
        idNumber: customer?.idNumber || 'Neuvedeno',
        vehicleName: vehicle?.name || 'Obytný vůz',
        licensePlate: vehicle?.licensePlate || '',
        startDate: formatDate(res.startDate),
        endDate: formatDate(res.endDate),
        pickupTime: res.pickupTime || '09:00',
        returnTime: res.returnTime || '17:00',
        destination: res.destination || 'Neuveden',
        estimatedMileage: res.estimatedMileage || 'Neuveden',
        price: formatCurrency(res.totalPrice),
        deposit: formatCurrency(res.deposit),
        selectedItems: selectedItemsText
      });

      setViewingContract({
        content: contractText,
        customer: `${customer?.firstName} ${customer?.lastName}`,
        resId: res.id
      });
    } catch (err) {
      alert("Chyba při generování smlouvy.");
    } finally {
      setGeneratingContractId(null);
    }
  };

  const handlePrintContract = () => {
    if (!viewingContract) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Smlouva - ${viewingContract.customer}</title>
      <style>body{font-family:sans-serif;padding:40px;line-height:1.5;font-size:12px;}h1{color:#0f172a;}pre{white-space:pre-wrap;font-family:inherit;}</style></head>
      <body><h1>Smlouva o nájmu - obytkem.cz</h1><pre>${viewingContract.content}</pre></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handlePrintProtocol = (type: 'handover' | 'return', resId: string) => {
    const res = reservations.find(r => r.id === resId);
    const customer = customers.find(c => c.id === res?.customerId);
    const vehicle = vehicles.find(v => v.id === res?.vehicleId);
    
    let title = '';
    let content = '';
    
    if (type === 'handover') {
      const p = handoverProtocols.find(hp => hp.reservationId === resId);
      if (!p) return;
      title = 'Předávací protokol';
      content = `
        Datum a čas: ${p.date} ${p.time}
        Stav tachometru: ${p.mileage} km
        Stav paliva: ${p.fuelLevel} %
        Čistota: ${p.cleanliness}
        Poškození: ${p.damages}
        Poznámky: ${p.notes}
      `;
    } else {
      const p = returnProtocols.find(rp => rp.reservationId === resId);
      if (!p) return;
      title = 'Protokol o vrácení';
      content = `
        Datum a čas: ${p.date} ${p.time}
        Stav tachometru při vrácení: ${p.returnMileage} km
        Stav paliva při vrácení: ${p.returnFuelLevel} %
        Vrácené poškození: ${p.returnDamages}
        Doplatek za km: ${formatCurrency(p.extraKmCharge)}
        
        Původní stav při předání:
        Stav tachometru: ${p.mileage} km
        Stav paliva: ${p.fuelLevel} %
        Čistota: ${p.cleanliness}
        Poškození: ${p.damages}
      `;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>${title} - ${customer?.firstName} ${customer?.lastName}</title>
      <style>body{font-family:sans-serif;padding:40px;line-height:1.5;font-size:12px;}h1{color:#0f172a;}pre{white-space:pre-wrap;font-family:inherit;}</style></head>
      <body>
        <h1>${title} - obytkem.cz</h1>
        <p><strong>Vozidlo:</strong> ${vehicle?.name} (${vehicle?.licensePlate})</p>
        <p><strong>Zákazník:</strong> ${customer?.firstName} ${customer?.lastName}</p>
        <p><strong>Termín rezervace:</strong> ${res ? formatDate(res.startDate) : ''} - ${res ? formatDate(res.endDate) : ''}</p>
        <hr/>
        <pre>${content}</pre>
        <br/><br/>
        <div style="display:flex; justify-content: space-between; margin-top: 50px;">
          <div>__________________________<br/>Podpis pronajímatele</div>
          <div>__________________________<br/>Podpis nájemce</div>
        </div>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const calculateExtraKm = () => {
    if (!activeProtocolEdit) return 0;
    const res = reservations.find(r => r.id === activeProtocolEdit.reservationId);
    if (!res) return 0;
    const hp = handoverProtocols.find(p => p.reservationId === res.id);
    if (!hp) return 0;
    
    const days = calculateDays(res.startDate, res.endDate);
    const limit = days * 300;
    const driven = (Number(protocolFormData.returnMileage) || 0) - hp.mileage;
    const extra = Math.max(0, driven - limit);
    return extra * 5;
  };

  const handleSaveProtocol = () => {
    if (!activeProtocolEdit) return;
    
    if (activeProtocolEdit.type === 'handover') {
      const protocol: HandoverProtocol = {
        id: crypto.randomUUID(),
        reservationId: activeProtocolEdit.reservationId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        mileage: Number(protocolFormData.mileage),
        fuelLevel: Number(protocolFormData.fuelLevel),
        cleanliness: protocolFormData.cleanliness,
        damages: protocolFormData.damages,
        notes: protocolFormData.notes
      };
      onSaveHandover(protocol);
    } else {
      const hp = handoverProtocols.find(p => p.reservationId === activeProtocolEdit.reservationId);
      const protocol: ReturnProtocol = {
        id: crypto.randomUUID(),
        reservationId: activeProtocolEdit.reservationId,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString(),
        mileage: hp?.mileage || 0,
        fuelLevel: hp?.fuelLevel || 0,
        cleanliness: hp?.cleanliness || '',
        damages: hp?.damages || '',
        notes: hp?.notes || '',
        returnMileage: Number(protocolFormData.returnMileage),
        returnFuelLevel: Number(protocolFormData.returnFuelLevel),
        returnDamages: protocolFormData.returnDamages,
        extraKmCharge: calculateExtraKm()
      };
      onSaveReturn(protocol);
    }
    setActiveProtocolEdit(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-10">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Administrace</h1>
          <p className="text-slate-500 font-medium">Vítejte, Milan Gula</p>
        </div>
        <div className="flex items-center gap-4">
          {onRefresh && (
            <button onClick={onRefresh} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors" title="Obnovit data">
              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
            </button>
          )}
          <button 
            onClick={onLogout} 
            className="flex items-center gap-2 px-6 py-3 bg-red-50 text-red-600 border border-red-100 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-100 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Odhlásit
          </button>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200 overflow-x-auto">
        {(['reservations', 'calendar', 'customers', 'contracts', 'stats', 'messages', 'protocols', 'fleet', 'pricing', 'maintenance', 'inventory', 'advisor', 'widget'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'reservations' ? 'Rezervace' : 
             tab === 'calendar' ? 'Kalendář' :
             tab === 'customers' ? 'Zákazníci' :
             tab === 'contracts' ? 'Smlouvy' :
             tab === 'stats' ? 'Statistiky' :
             tab === 'messages' ? (
               <div className="flex items-center gap-2">
                 Zprávy
                 {messages.filter(m => m.status === 'new').length > 0 && (
                   <span className="bg-brand-primary text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full">
                     {messages.filter(m => m.status === 'new').length}
                   </span>
                 )}
               </div>
             ) :
             tab === 'protocols' ? 'Protokoly' : 
             tab === 'fleet' ? 'Vozový park' : 
             tab === 'pricing' ? 'Ceník & Služby' :
             tab === 'maintenance' ? 'Servis' :
             tab === 'inventory' ? 'Sklad' :
             tab === 'advisor' ? 'AI Poradce' : 'Widget'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {activeTab === 'calendar' && (
          <div className="p-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Plán obsazenosti</h2>
              <div className="flex items-center gap-4 bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button onClick={() => setCalendarDate(subMonths(calendarDate, 1))} className="p-2 hover:bg-white rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
                <span className="px-4 font-black text-sm uppercase tracking-widest">
                  {format(calendarDate, 'LLLL yyyy', { locale: cs })}
                </span>
                <button onClick={() => setCalendarDate(addMonths(calendarDate, 1))} className="p-2 hover:bg-white rounded-lg transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-3xl">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest sticky left-0 bg-slate-50 z-10 w-48 border-r border-slate-200">Vůz</th>
                    {calendarDays.map(day => (
                      <th key={day.toString()} className={`p-2 text-center text-[10px] font-black border-r border-slate-100 min-w-[40px] ${format(day, 'i') === '6' || format(day, 'i') === '7' ? 'bg-slate-100 text-slate-900' : 'text-slate-400'}`}>
                        {format(day, 'd')}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map(vehicle => (
                    <tr key={vehicle.id} className="border-b border-slate-100 hover:bg-slate-50/30 transition-colors">
                      <td className="p-4 font-black text-xs text-slate-900 sticky left-0 bg-white z-10 border-r border-slate-200 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">
                        {vehicle.name}
                        <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{vehicle.licensePlate}</div>
                      </td>
                      {calendarDays.map(day => {
                        const res = getReservationForDay(vehicle.id, day);
                        const isStart = res && isSameDay(parseISO(res.startDate), day);
                        const isEnd = res && isSameDay(parseISO(res.endDate), day);
                        
                        return (
                          <td key={day.toString()} className={`p-0 border-r border-slate-100 relative h-14 ${format(day, 'i') === '6' || format(day, 'i') === '7' ? 'bg-slate-50/50' : ''}`}>
                            {res && (
                              <div className={`absolute inset-y-2 inset-x-0 bg-slate-900 flex items-center justify-center overflow-hidden
                                ${isStart ? 'rounded-l-lg ml-1' : ''} 
                                ${isEnd ? 'rounded-r-lg mr-1' : ''}
                                ${!isStart && !isEnd ? '' : ''}
                              `}>
                                {isStart && (
                                  <span className="text-[8px] font-black text-white uppercase whitespace-nowrap px-2 z-20">
                                    {customers.find(c => c.id === res.customerId)?.lastName}
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-8 flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-900 rounded-sm"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rezervováno</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-slate-100 border border-slate-200 rounded-sm"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volno</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maintenance' && (
          <div className="p-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Servisní kniha</h2>
              <button className="btn-ultimate-primary px-6 py-3 text-[10px]">Přidat záznam</button>
            </div>
            <div className="grid gap-6">
              {maintenanceTasks.map(task => {
                const vehicle = vehicles.find(v => v.id === task.vehicleId);
                return (
                  <div key={task.id} className="p-6 bg-slate-50 rounded-3xl border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                        <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{vehicle?.name} • {task.type}</div>
                        <div className="font-black text-slate-900">{task.title}</div>
                        <div className="text-xs text-slate-500 font-medium">{task.description}</div>
                        <div className="text-xs text-slate-400 font-bold mt-1">{formatDate(task.date)} • {task.mileage || 0} km</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Náklady</div>
                        <div className="font-black text-slate-900">{formatCurrency(task.cost || 0)}</div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${task.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {task.status === 'completed' ? 'Hotovo' : 'Plánováno'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div className="p-10 animate-in fade-in duration-500">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">Sklad doplňků</h2>
              <button 
                onClick={() => onAddInventoryItem({
                  name: 'Nová položka',
                  totalQuantity: 1,
                  availableQuantity: 1,
                  category: 'equipment',
                  pricePerDay: 0,
                  description: 'Popis položky...'
                })}
                className="btn-ultimate-primary px-6 py-3 text-[10px]"
              >
                Přidat položku
              </button>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inventoryItems.map(item => (
                <div key={item.id} className="p-6 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.category}</div>
                      <div className="font-black text-slate-900">{item.name}</div>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Skladem / Celkem</span>
                      <span className="font-black text-slate-900">{item.availableQuantity} / {item.totalQuantity}</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-primary" style={{ width: `${(item.availableQuantity / item.totalQuantity) * 100}%` }}></div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cena / den</span>
                      <span className="font-black text-brand-primary">{formatCurrency(item.pricePerDay)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      setActiveTab('pricing');
                      // Scroll to the inventory section in pricing tab would be nice but let's just switch tab
                    }}
                    className="w-full py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all"
                  >
                    Upravit položku
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'pricing' && editingVehicle && (
          <div className="p-10 space-y-12 animate-in fade-in duration-500">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-black">Ceník a doplňkové služby</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Správa cen, sezón a příplatků</p>
              </div>
              <button 
                onClick={() => {
                  onUpdateVehicle(editingVehicle);
                  alert('Změny ve vozidle a ceníku byly uloženy.');
                }} 
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs hover:bg-slate-800 transition-all"
              >
                Uložit vše
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Základní cena (mimo sezónu)</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={editingVehicle.basePrice} onChange={e => setEditingVehicle({...editingVehicle, basePrice: Number(e.target.value)})} className="w-full px-5 py-3 border-2 border-white rounded-2xl font-black text-xl text-brand-primary outline-none" />
                  <span className="font-black text-slate-400">Kč</span>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Denní limit km</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={editingVehicle.kmLimitPerDay} onChange={e => setEditingVehicle({...editingVehicle, kmLimitPerDay: Number(e.target.value)})} className="w-full px-5 py-3 border-2 border-white rounded-2xl font-black text-xl text-slate-900 outline-none" />
                  <span className="font-black text-slate-400">km</span>
                </div>
              </div>
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 space-y-4">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Cena za km nad limit</label>
                <div className="flex items-center gap-3">
                  <input type="number" value={editingVehicle.extraKmPrice} onChange={e => setEditingVehicle({...editingVehicle, extraKmPrice: Number(e.target.value)})} className="w-full px-5 py-3 border-2 border-white rounded-2xl font-black text-xl text-slate-900 outline-none" />
                  <span className="font-black text-slate-400">Kč</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Sezónní úpravy cen
              </h3>
              <div className="grid gap-4">
                {editingVehicle.seasonalPricing.map((s, idx) => (
                  <div key={s.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-grow space-y-3">
                      <input className="w-full bg-transparent font-black text-slate-900 text-lg outline-none" value={s.name} onChange={e => {
                        const newPricing = [...editingVehicle.seasonalPricing];
                        newPricing[idx].name = e.target.value;
                        setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                      }} />
                      <div className="flex items-center gap-4">
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Od</label>
                          <input type="date" value={s.startDate} onChange={e => {
                            const newPricing = [...editingVehicle.seasonalPricing];
                            newPricing[idx].startDate = e.target.value;
                            setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                          }} className="text-[10px] font-bold text-slate-600 bg-slate-50 border-0 p-1 rounded outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest block">Do</label>
                          <input type="date" value={s.endDate} onChange={e => {
                            const newPricing = [...editingVehicle.seasonalPricing];
                            newPricing[idx].endDate = e.target.value;
                            setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                          }} className="text-[10px] font-bold text-slate-600 bg-slate-50 border-0 p-1 rounded outline-none" />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
                      <input type="number" className="w-32 bg-white border border-slate-200 rounded-xl px-4 py-2 font-black text-brand-primary text-xl text-right outline-none" value={s.pricePerDay} onChange={e => {
                        const newPricing = [...editingVehicle.seasonalPricing];
                        newPricing[idx].pricePerDay = Number(e.target.value);
                        setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                      }} />
                      <span className="font-black text-slate-400 pr-2">Kč / den</span>
                    </div>
                    <button 
                      onClick={() => {
                        const newPricing = editingVehicle.seasonalPricing.filter((_, i) => i !== idx);
                        setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                      }}
                      className="p-2 text-red-400 hover:text-red-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                    </button>
                  </div>
                ))}
                <div className="flex gap-4">
                  <button 
                    onClick={() => {
                      const newSeason: SeasonPrice = {
                        id: crypto.randomUUID(),
                        name: 'Nová sezóna',
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        pricePerDay: editingVehicle.basePrice
                      };
                      setEditingVehicle({
                        ...editingVehicle,
                        seasonalPricing: [...editingVehicle.seasonalPricing, newSeason]
                      });
                    }}
                    className="flex-grow py-4 border-2 border-dashed border-slate-200 rounded-3xl text-[10px] font-black uppercase text-slate-400 hover:border-slate-900 hover:text-slate-900 transition-all"
                  >
                    + Přidat novou sezónu
                  </button>
                  <button 
                    onClick={() => {
                      if (confirm('Opravdu chcete tyto sezóny nastavit pro VŠECHNY vozy?')) {
                        vehicles.forEach(v => {
                          onUpdateVehicle({
                            ...v,
                            seasonalPricing: editingVehicle.seasonalPricing
                          });
                        });
                        alert('Sezóny byly nastaveny pro všechny vozy.');
                      }
                    }}
                    className="px-6 py-4 border-2 border-brand-primary/20 rounded-3xl text-[10px] font-black uppercase text-brand-primary hover:bg-brand-primary/5 transition-all"
                  >
                    Použít pro všechny vozy
                  </button>
                  <button 
                    onClick={() => {
                      setEditingVehicle({
                        ...editingVehicle,
                        seasonalPricing: DEFAULT_SEASONS
                      });
                    }}
                    className="px-6 py-4 border-2 border-slate-200 rounded-3xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-50 transition-all"
                  >
                    Resetovat na výchozí
                  </button>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-3">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Doplňkové služby a vybavení
                </h3>
                <button onClick={() => onAddInventoryItem({
                  name: 'Nová služba',
                  totalQuantity: 1,
                  availableQuantity: 1,
                  category: 'sport',
                  pricePerDay: 0,
                  description: 'Popis služby...',
                  isOneTimeFee: false
                })} className="text-[10px] font-black text-brand-primary uppercase tracking-widest hover:underline">+ Přidat službu</button>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {inventoryItems.filter(i => i.category === 'sport' || i.category === 'service' || i.pricePerDay > 0).map(item => (
                  <div key={item.id} className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-grow">
                        <input 
                          className="w-full bg-transparent font-black text-slate-900 outline-none mb-1" 
                          value={item.name} 
                          onChange={e => onUpdateInventoryItem({...item, name: e.target.value})}
                        />
                        <input 
                          className="w-full bg-transparent text-[10px] font-bold text-slate-400 outline-none" 
                          value={item.description || ''} 
                          onChange={e => onUpdateInventoryItem({...item, description: e.target.value})}
                          placeholder="Krátký popis..."
                        />
                      </div>
                      <button onClick={() => onDeleteInventoryItem(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                    <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                      <div className="flex-grow flex items-center gap-2">
                        <input 
                          type="number" 
                          className="w-20 bg-slate-50 border border-slate-100 rounded-lg px-3 py-1 font-black text-brand-primary outline-none" 
                          value={item.pricePerDay} 
                          onChange={e => onUpdateInventoryItem({...item, pricePerDay: Number(e.target.value)})}
                        />
                        <span className="text-[10px] font-black text-slate-400 uppercase">Kč</span>
                        <select 
                          className="bg-transparent text-[10px] font-black text-slate-400 uppercase outline-none cursor-pointer"
                          value={item.isOneTimeFee ? 'once' : 'daily'}
                          onChange={e => onUpdateInventoryItem({...item, isOneTimeFee: e.target.value === 'once'})}
                        >
                          <option value="daily">/ den</option>
                          <option value="once">/ jednorázově</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Skladem:</span>
                        <input 
                          type="number" 
                          className="w-12 bg-slate-50 border border-slate-100 rounded-lg px-2 py-1 font-black text-slate-900 text-center outline-none" 
                          value={item.totalQuantity} 
                          onChange={e => onUpdateInventoryItem({...item, totalQuantity: Number(e.target.value), availableQuantity: Number(e.target.value)})}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="p-10 space-y-10 animate-in fade-in duration-500">
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-slate-50 rounded-[2.5rem] p-10 border border-slate-100">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Měsíční tržby (Kč)</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statsData.barData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 900, fill: '#94a3b8'}} tickFormatter={(value) => `${value/1000}k`} />
                      <Tooltip 
                        cursor={{fill: '#f1f5f9'}} 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', padding: '12px'}}
                        itemStyle={{fontWeight: 900, fontSize: '12px'}}
                        labelStyle={{fontWeight: 900, fontSize: '10px', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px'}}
                      />
                      <Bar dataKey="revenue" fill="#0f172a" radius={[6, 6, 0, 0]} barSize={32} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white flex flex-col">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-8">Vytíženost flotily</h3>
                <div className="h-[250px] w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statsData.utilizationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statsData.utilizationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-3xl font-black">
                      {Math.round((statsData.utilizationData[0].value / (statsData.utilizationData[0].value + statsData.utilizationData[1].value)) * 100)}%
                    </span>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Aktuálně</span>
                  </div>
                </div>
                <div className="mt-auto space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-white"></div>
                      <span className="text-xs font-bold text-slate-300">Obsazené dny</span>
                    </div>
                    <span className="font-black">{statsData.utilizationData[0].value}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-slate-700"></div>
                      <span className="text-xs font-bold text-slate-300">Volné dny</span>
                    </div>
                    <span className="font-black">{statsData.utilizationData[1].value}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Celkový obrat</div>
                <div className="text-3xl font-black text-slate-900">
                  {formatCurrency(reservations.filter(r => r.status !== ReservationStatus.CANCELLED).reduce((acc, r) => acc + r.totalPrice, 0))}
                </div>
              </div>
              <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Počet rezervací</div>
                <div className="text-3xl font-black text-slate-900">
                  {reservations.filter(r => r.status !== ReservationStatus.CANCELLED).length}
                </div>
              </div>
              <div className="p-8 bg-white border border-slate-200 rounded-3xl shadow-sm">
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Průměrná cena</div>
                <div className="text-3xl font-black text-slate-900">
                  {formatCurrency(reservations.length > 0 ? reservations.reduce((acc, r) => acc + r.totalPrice, 0) / reservations.length : 0)}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'messages' && (
          <div className="p-10">
            <MessageManager 
              messages={messages} 
              onUpdateStatus={onUpdateMessageStatus} 
              onDelete={onDeleteMessage} 
            />
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="p-10 space-y-8 animate-in fade-in duration-500">
            {selectedCustomerId ? (
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <button onClick={() => setSelectedCustomerId(null)} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                  </button>
                  <h2 className="text-2xl font-black">Detail zákazníka</h2>
                </div>
                
                {(() => {
                  const customer = customers.find(c => c.id === selectedCustomerId);
                  const customerReservations = reservations.filter(r => r.customerId === selectedCustomerId);
                  
                  if (!customer) return <div>Zákazník nenalezen.</div>;
                  
                  return (
                    <div className="grid lg:grid-cols-3 gap-8">
                      <div className="lg:col-span-1 space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                          <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <span className="text-2xl font-black text-slate-400">{customer.firstName[0]}{customer.lastName[0]}</span>
                          </div>
                          <h3 className="text-xl font-black text-slate-900 mb-1">{customer.firstName} {customer.lastName}</h3>
                          <p className="text-slate-400 font-bold text-sm mb-6">{customer.email}</p>
                          
                          <div className="space-y-4 pt-6 border-t border-slate-50">
                            <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Telefon</div>
                              <div className="flex items-center justify-between">
                                <span className="font-bold text-slate-900">{customer.phone}</span>
                                <a href={`tel:${customer.phone}`} className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-all">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path></svg>
                                </a>
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Adresa</div>
                              <div className="font-bold text-slate-900">{customer.address}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="lg:col-span-2 space-y-6">
                        <div className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm">
                          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-6">Historie rezervací</h3>
                          <div className="space-y-4">
                            {customerReservations.length > 0 ? (
                              customerReservations.map(res => (
                                <div key={res.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-center">
                                  <div>
                                    <div className="font-black text-slate-900">{formatDate(res.startDate)} - {formatDate(res.endDate)}</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase">{res.vehicleId} • {formatCurrency(res.totalPrice)}</div>
                                  </div>
                                  <div className={`text-[10px] font-black px-3 py-1 rounded-full uppercase ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                    {res.status}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-slate-400 font-medium italic">Žádné rezervace.</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-2xl font-black">Seznam zákazníků</h2>
                <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                  <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100 text-left">
                      <tr>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Jméno</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</th>
                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefon</th>
                        <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Akce</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {customers.map(customer => (
                        <tr key={customer.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-8 py-6 font-black text-slate-900">{customer.firstName} {customer.lastName}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500">{customer.email}</td>
                          <td className="px-8 py-6 text-sm font-bold text-slate-500">{customer.phone}</td>
                          <td className="px-8 py-6 text-right">
                            <button 
                              onClick={() => setSelectedCustomerId(customer.id)}
                              className="text-[10px] font-black text-brand-primary hover:underline uppercase tracking-widest"
                            >
                              Detail
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="p-10 space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-black">Uložené smlouvy</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedContracts.length > 0 ? (
                savedContracts.map(contract => (
                  <div key={contract.id} className="p-8 bg-white border border-slate-200 rounded-[2.5rem] shadow-sm flex flex-col">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h3 className="font-black text-slate-900">{contract.customerName}</h3>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{formatDate(contract.createdAt)}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                      </div>
                    </div>
                    <div className="mt-auto flex gap-3">
                      <button 
                        onClick={() => setViewingContract({
                          content: contract.content,
                          customer: contract.customerName,
                          resId: contract.reservationId
                        })}
                        className="flex-1 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-slate-800 transition-all"
                      >
                        Zobrazit
                      </button>
                      <button 
                        onClick={() => {
                          const blob = new Blob([contract.content], { type: 'text/plain' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `smlouva-${contract.customerName}-${contract.reservationId}.txt`;
                          a.click();
                        }}
                        className="p-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full p-20 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-center">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-2">Zatím žádné smlouvy</h3>
                  <p className="text-slate-400 font-medium max-w-xs">Vygenerujte smlouvu u konkrétní rezervace a uložte ji pro pozdější nahlédnutí.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 text-left">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Klient</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Termín</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => {
                  const customer = customers.find(c => c.id === res.customerId);
                  const hp = handoverProtocols.find(p => p.reservationId === res.id);
                  const rp = returnProtocols.find(p => p.reservationId === res.id);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50">
                      <td className="px-8 py-6">
                        <div 
                          className="font-black text-slate-900 cursor-pointer hover:text-brand-primary"
                          onClick={() => {
                            setSelectedCustomerId(res.customerId);
                            setActiveTab('customers');
                          }}
                        >
                          {customer?.firstName} {customer?.lastName}
                        </div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{customer?.email}</div>
                        {res.deliveryAddress && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] text-brand-primary font-black uppercase">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                            Dovoz: {res.deliveryAddress} ({res.deliveryTime})
                          </div>
                        )}
                        {res.destination && (
                          <div className="mt-1 flex items-center gap-1 text-[9px] text-slate-500 font-black uppercase">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A2 2 0 013 15.483V6a2 2 0 011.223-1.842l5-2.5a2 2 0 011.554 0l5 2.5A2 2 0 0117 6v9.483a2 2 0 01-1.223 1.842L10.33 20a2 2 0 01-1.33 0z"></path></svg>
                            Cíl: {res.destination}
                          </div>
                        )}
                      </td>
                      <td className="px-8 py-6 text-sm font-medium">
                        {formatDate(res.startDate)} - {formatDate(res.endDate)}
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={res.status} 
                          onChange={(e) => onUpdateStatus(res.id, e.target.value as ReservationStatus)}
                          className={`text-[10px] font-black px-3 py-1.5 rounded-full border-0 uppercase tracking-wider
                            ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 
                              res.status === ReservationStatus.PENDING ? 'bg-slate-100 text-slate-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {Object.values(ReservationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right space-x-3">
                        {res.status === ReservationStatus.CONFIRMED && !hp && (
                          <button onClick={() => openProtocolModal('handover', res.id)} className="text-[10px] font-black text-green-600 hover:text-green-800 uppercase">Předat vůz</button>
                        )}
                        {hp && !rp && (
                          <button onClick={() => openProtocolModal('return', res.id)} className="text-[10px] font-black text-purple-600 hover:text-purple-800 uppercase">Vrátit vůz</button>
                        )}
                        <button 
                          onClick={() => setViewingReservationId(res.id)}
                          className="text-[10px] font-black text-brand-primary hover:text-brand-primary/80 uppercase"
                        >
                          Detail
                        </button>
                        <button 
                          disabled={generatingContractId === res.id}
                          onClick={() => handleGenerateContract(res)}
                          className="text-[10px] font-black text-slate-600 hover:text-slate-800 uppercase"
                        >
                          {generatingContractId === res.id ? 'Generuji...' : 'Smlouva AI'}
                        </button>
                        <button onClick={() => onDeleteReservation(res.id)} className="text-[10px] font-black text-red-400 hover:text-red-600 uppercase">Smazat</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'fleet' && editingVehicle && (
          <div className="p-10 space-y-8 animate-in fade-in duration-500">
             <div className="flex justify-between items-end">
               <h2 className="text-2xl font-black">Správa vozu</h2>
               <button 
                onClick={() => {
                  onUpdateVehicle(editingVehicle);
                  alert('Změny ve vozu byly uloženy.');
                }} 
                className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs hover:bg-slate-800 transition-all"
               >
                 Uložit změny
               </button>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Název vozidla</label>
                 <input type="text" value={editingVehicle.name} onChange={e => setEditingVehicle({...editingVehicle, name: e.target.value})} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold focus:border-slate-900 outline-none" />
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SPZ vozidla</label>
                 <input type="text" value={editingVehicle.licensePlate} onChange={e => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold focus:border-slate-900 outline-none" />
               </div>
             </div>

             <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Základní cena mimo sezónu (Kč/den)</label>
               <input type="number" value={editingVehicle.basePrice} onChange={e => setEditingVehicle({...editingVehicle, basePrice: Number(e.target.value)})} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold focus:border-slate-900 outline-none" />
             </div>

             <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Popis vozidla pro web</label>
               <textarea value={editingVehicle.description} onChange={e => setEditingVehicle({...editingVehicle, description: e.target.value})} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl min-h-[150px] font-medium focus:border-slate-900 outline-none" />
              </div>

              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Fotogalerie vozu</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-6">
                  {editingVehicle.images?.map((img, idx) => (
                    <div key={idx} className="relative aspect-video rounded-xl overflow-hidden group border border-slate-200">
                      <img src={img} className="w-full h-full object-cover" alt={`Vůz ${idx + 1}`} />
                      <button 
                        onClick={() => {
                          const newImages = [...(editingVehicle.images || [])];
                          newImages.splice(idx, 1);
                          setEditingVehicle({...editingVehicle, images: newImages});
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                      </button>
                    </div>
                  ))}
                  <label className="aspect-video rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center cursor-pointer hover:border-slate-900 hover:bg-slate-50 transition-all group">
                    <svg className="w-6 h-6 text-slate-300 group-hover:text-slate-900 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path></svg>
                    <span className="text-[10px] font-black text-slate-400 uppercase group-hover:text-slate-900">Přidat foto</span>
                    <input 
                      type="file" 
                      className="hidden" 
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            const base64String = reader.result as string;
                            setEditingVehicle({
                              ...editingVehicle, 
                              images: [...(editingVehicle.images || []), base64String]
                            });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </label>
                </div>
             </div>

             <div>
               <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Sezónní ceník</h3>
               <div className="space-y-3">
                 {editingVehicle.seasonalPricing.map((s, idx) => (
                   <div key={s.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                     <input className="bg-transparent font-bold text-slate-700 outline-none flex-grow" value={s.name} onChange={e => {
                        const newPricing = [...editingVehicle.seasonalPricing];
                        newPricing[idx].name = e.target.value;
                        setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                     }} />
                     <div className="text-sm text-slate-400">{formatDate(s.startDate)} - {formatDate(s.endDate)}</div>
                     <input type="number" className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-slate-900 text-right" value={s.pricePerDay} onChange={e => {
                        const newPricing = [...editingVehicle.seasonalPricing];
                        newPricing[idx].pricePerDay = Number(e.target.value);
                        setEditingVehicle({...editingVehicle, seasonalPricing: newPricing});
                     }} />
                     <span className="text-xs font-bold text-slate-400">Kč</span>
                   </div>
                 ))}
               </div>
             </div>
          </div>
        )}

        {activeTab === 'advisor' && (
          <div className="p-10 animate-in fade-in duration-500">
             <div className="bg-slate-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden">
               <div className="relative z-10 max-w-2xl">
                 <h2 className="text-3xl font-black mb-4">AI Business Poradce</h2>
                 <p className="text-slate-400 font-medium mb-8 leading-relaxed">
                   Váš osobní analytik poháněný modelem Gemini 3 Flash. Analyzuje vaše stávající rezervace a navrhuje strategii pro maximalizaci zisku.
                 </p>
                 {!isAiConfigured() && (
                   <div className="p-6 bg-white/5 border border-white/10 rounded-[2rem] flex items-center gap-4 mb-8">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-sm shrink-0">
                       <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                     </div>
                     <div>
                       <div className="font-black text-white text-sm">AI klíč není nastaven</div>
                       <p className="text-xs text-slate-400 font-medium">Pro fungování analýzy a generování smluv je nutné nastavit <code className="bg-white/10 px-1 rounded text-white">GEMINI_API_KEY</code> v prostředí Vercel a provést nový Deploy.</p>
                     </div>
                   </div>
                 )}

                 {!aiAnalysis ? (
                   <button 
                     onClick={handleRunAiAnalysis} 
                     disabled={loadingAi}
                     className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all flex items-center gap-3 disabled:opacity-50"
                   >
                     {loadingAi ? (
                       <div className="w-4 h-4 border-2 border-white border-t-transparent animate-spin rounded-full"></div>
                     ) : (
                       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                     )}
                     Analyzovat sezónu 2026
                   </button>
                 ) : (
                   <div className="space-y-8">
                     <div className="grid md:grid-cols-2 gap-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vytíženost</div>
                          <div className="text-4xl font-black">{aiAnalysis.occupancyRate}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stav trhu</div>
                          <div className="text-sm font-bold mt-2">{aiAnalysis.summary}</div>
                        </div>
                     </div>
                     <div className="p-8 bg-slate-900 rounded-[2rem] text-white">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3">Doporučení AI:</h4>
                        <p className="font-medium text-lg leading-relaxed italic">"{aiAnalysis.recommendation}"</p>
                     </div>
                     <button onClick={() => setAiAnalysis(null)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Zkusit novou analýzu</button>
                   </div>
                 )}
               </div>
               {/* Dekorace */}
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-slate-900/10 blur-[100px] rounded-full"></div>
             </div>
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="p-10 space-y-6">
             <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black">Historie předání a vrácení</h2>
             </div>
             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {reservations.map(res => {
                 const hp = handoverProtocols.find(p => p.reservationId === res.id);
                 const rp = returnProtocols.find(p => p.reservationId === res.id);
                 const customer = customers.find(c => c.id === res.customerId);
                 if (!hp && !rp) return null;
                 return (
                   <div key={res.id} className="p-6 bg-slate-50 rounded-[2rem] border border-slate-200">
                     <h3 className="font-black text-slate-900 mb-4">{customer?.firstName} {customer?.lastName}</h3>
                     <div className="space-y-3 mb-6">
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                         <span className="text-slate-400 tracking-widest">Předání:</span>
                         <span className={hp ? 'text-green-600' : 'text-slate-300'}>{hp ? '✓ ANO' : '– NE'}</span>
                       </div>
                       <div className="flex justify-between items-center text-[10px] font-black uppercase">
                         <span className="text-slate-400 tracking-widest">Vrácení:</span>
                         <span className={rp ? 'text-purple-600' : 'text-slate-300'}>{rp ? '✓ ANO' : '– NE'}</span>
                       </div>
                     </div>
                     <div className="flex gap-2">
                       {hp && <button onClick={() => handlePrintProtocol('handover', res.id)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">Tisk Předání</button>}
                       {rp && <button onClick={() => handlePrintProtocol('return', res.id)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">Tisk Vrácení</button>}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="p-10 space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black">Uložené smlouvy</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Správa a odesílání nájemních smluv</p>
              </div>
            </div>

            <div className="grid gap-6">
              {savedContracts.length === 0 ? (
                <div className="p-20 text-center bg-slate-50 rounded-[3rem] border border-dashed border-slate-200">
                  <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-sm mx-auto mb-6">
                    <svg className="w-10 h-10 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 mb-2">Zatím žádné smlouvy</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto">Smlouvy se vygenerují automaticky v detailu rezervace.</p>
                </div>
              ) : (
                savedContracts.map(contract => {
                  const reservation = reservations.find(r => r.id === contract.reservationId);
                  const customer = customers.find(c => c.id === (reservation?.customerId || ''));
                  const publicUrl = `${window.location.origin}/?view=contract&contractId=${contract.id}`;

                  return (
                    <div key={contract.id} className="p-8 bg-slate-50 rounded-[2.5rem] border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 group hover:bg-white hover:shadow-xl transition-all duration-500">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:bg-brand-primary group-hover:text-white transition-colors">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <div>
                          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Smlouva ze dne {formatDate(contract.createdAt)}</div>
                          <div className="font-black text-slate-900 text-lg">{contract.customerName}</div>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="text-xs text-slate-500 font-bold">Rezervace: {contract.reservationId}</div>
                            {contract.customerSignature ? (
                              <div className="px-2 py-0.5 bg-green-50 text-green-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-green-100 flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                Podepsáno
                              </div>
                            ) : (
                              <div className="px-2 py-0.5 bg-amber-50 text-amber-600 rounded-md text-[8px] font-black uppercase tracking-widest border border-amber-100">
                                Čeká na podpis
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 w-full md:w-auto">
                        <button 
                          onClick={() => onViewContract(contract.id)}
                          className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                        >
                          Zobrazit / Podepsat
                        </button>
                        <button 
                          onClick={() => {
                            const mailtoUrl = `mailto:${customer?.email || ''}?subject=Nájemní smlouva - Obytkem.cz&body=Dobrý den, v příloze nebo na odkazu níže naleznete vaši nájemní smlouvu k nahlédnutí a podpisu.%0D%0A%0D%0AOdkaz na smlouvu: ${publicUrl}%0D%0A%0D%0AS pozdravem,%0D%0AObytkem.cz`;
                            window.location.href = mailtoUrl;
                          }}
                          className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                          Odeslat e-mailem
                        </button>
                        <button 
                          onClick={() => {
                            navigator.clipboard.writeText(publicUrl);
                            alert('Odkaz na smlouvu byl zkopírován do schránky.');
                          }}
                          className="flex-1 md:flex-none px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-50 transition-all"
                          title="Kopírovat odkaz pro zákazníka"
                        >
                          Kopírovat odkaz
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {activeTab === 'widget' && (
          <div className="p-10 space-y-10 animate-in fade-in duration-500">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-black text-slate-900 mb-4">Propojení s vaším webem</h2>
              <p className="text-slate-500 font-medium leading-relaxed">
                Tento rezervační systém můžete snadno vložit do svých stránek (např. WordPress, Wix nebo vlastní HTML). 
                Stačí zkopírovat kód níže a vložit jej jako HTML blok.
              </p>
            </div>

            <div className="grid gap-8">
              <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kód pro vložení všech vozů</h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase">Doporučeno</span>
                </div>
                <div className="bg-slate-900 rounded-2xl p-6 relative group">
                  <code className="text-slate-400 text-sm font-mono break-all">
                    {`<iframe src="${window.location.origin}/?view=widget" width="100%" height="800px" frameborder="0"></iframe>`}
                  </code>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(`<iframe src="${window.location.origin}/?view=widget" width="100%" height="800px" frameborder="0"></iframe>`);
                      alert('Kód zkopírován!');
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Kódy pro konkrétní vozy</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {vehicles.map(v => (
                    <div key={v.id} className="p-6 bg-white border border-slate-200 rounded-2xl shadow-sm">
                      <div className="font-black text-slate-900 mb-2">{v.name}</div>
                      <div className="bg-slate-100 p-3 rounded-xl mb-4 overflow-hidden">
                        <code className="text-[10px] text-slate-600 font-mono truncate block">
                          {`<iframe src="${window.location.origin}/?view=widget&vehicleId=${v.id}" ...`}
                        </code>
                      </div>
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(`<iframe src="${window.location.origin}/?view=widget&vehicleId=${v.id}" width="100%" height="800px" frameborder="0"></iframe>`);
                          alert(`Kód pro ${v.name} zkopírován!`);
                        }}
                        className="w-full py-2 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase hover:bg-slate-800 transition-all"
                      >
                        Kopírovat kód
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                Tip pro integraci (Bez druhého posuvníku)
              </h4>
              <p className="text-sm text-slate-700 font-medium leading-relaxed mb-4">
                Pro automatické přizpůsobení výšky (aby se na mobilu neobjevoval druhý posuvník), vložte na svůj web pod iframe tento skript:
              </p>
              <div className="bg-slate-900 rounded-2xl p-6 relative group">
                <code className="text-slate-400 text-[10px] font-mono whitespace-pre-wrap">
{`<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'obytkem-resize') {
      const iframes = document.getElementsByTagName('iframe');
      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].src.includes(window.location.host) || iframes[i].src.includes('run.app')) {
          iframes[i].style.height = e.data.height + 'px';
        }
      }
    }
  });
</script>`}
                </code>
                  <button 
                    onClick={() => {
                      const script = `<script>
  window.addEventListener('message', function(e) {
    if (e.data.type === 'obytkem-resize') {
      const iframes = document.getElementsByTagName('iframe');
      for (let i = 0; i < iframes.length; i++) {
        if (iframes[i].src.includes(window.location.host) || iframes[i].src.includes('run.app')) {
          iframes[i].style.height = e.data.height + 'px';
        }
      }
    }
  });
</script>`;
                      navigator.clipboard.writeText(script);
                      alert('Skript zkopírován!');
                    }}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                </button>
              </div>
            </div>

            <div className="bg-slate-50 rounded-[2rem] p-8 border border-slate-200">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Samostatný kalendář dostupnosti</h3>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-[10px] font-black uppercase">Novinka</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Tento kód vloží pouze kalendář obsazenosti bez možnosti přímé rezervace. Ideální pro informační přehled.</p>
              <div className="bg-slate-900 rounded-2xl p-6 relative group">
                <code className="text-blue-400 text-sm font-mono break-all">
                  {`<iframe src="${window.location.origin}/?view=calendar" width="100%" height="600px" frameborder="0"></iframe>`}
                </code>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`<iframe src="${window.location.origin}/?view=calendar" width="100%" height="600px" frameborder="0"></iframe>`);
                    alert('Kód kalendáře zkopírován!');
                  }}
                  className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-all opacity-0 group-hover:opacity-100"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reservation Detail Modal */}
      {viewingReservationId && (
        <div className="fixed inset-0 z-[450] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] shadow-2xl w-full max-w-3xl overflow-hidden animate-in zoom-in-95 duration-300"
          >
            {(() => {
              const res = reservations.find(r => r.id === viewingReservationId);
              if (!res) return null;
              const customer = customers.find(c => c.id === res.customerId);
              const vehicle = vehicles.find(v => v.id === res.vehicleId);
              
              return (
                <div className="p-12 space-y-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-3xl font-black tracking-tight">Detail rezervace</h2>
                      <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">ID: {res.id}</p>
                    </div>
                    <button onClick={() => setViewingReservationId(null)} className="p-3 hover:bg-slate-100 rounded-full transition-colors">
                      <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Zákazník</label>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="font-black text-slate-900 text-lg">{customer?.firstName} {customer?.lastName}</div>
                          <div className="text-sm text-slate-500 font-medium mt-1">{customer?.email}</div>
                          <div className="text-sm text-slate-500 font-medium">{customer?.phone}</div>
                          <div className="text-sm text-slate-500 font-medium mt-2">{customer?.address}</div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Vozidlo a termín</label>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="font-black text-slate-900">{vehicle?.name}</div>
                          <div className="text-sm text-slate-500 font-medium">{vehicle?.licensePlate}</div>
                          <div className="mt-3 pt-3 border-t border-slate-200 flex justify-between items-center">
                            <div className="font-black text-brand-primary">
                              {formatDate(res.startDate)} ({res.pickupTime || '09:00'}) - {formatDate(res.endDate)} ({res.returnTime || '17:00'})
                            </div>
                            <div className="text-[10px] font-black bg-slate-200 px-2 py-0.5 rounded text-slate-600 uppercase">{calculateDays(res.startDate, res.endDate)} dní</div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Cíl a nájezd</label>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cíl cesty:</span>
                            <span className="font-black text-slate-900">{res.destination || 'Neuveden'}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Předpokládaný nájezd:</span>
                            <span className="font-black text-slate-900">{res.estimatedMileage ? `${res.estimatedMileage} km` : 'Neuveden'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-8">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Doplňkové služby a dovoz</label>
                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                          {res.selectedAddOns && res.selectedAddOns.length > 0 ? (
                            <div className="space-y-2">
                              {res.selectedAddOns.map(addon => {
                                const item = inventoryItems.find(i => i.id === addon.itemId);
                                return (
                                  <div key={addon.itemId} className="flex justify-between text-xs font-bold">
                                    <span className="text-slate-600">{item?.name}</span>
                                    <span className="text-slate-900">{addon.quantity}x</span>
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="text-xs text-slate-400 italic">Žádné doplňkové služby</div>
                          )}

                          {res.deliveryAddress && (
                            <div className="pt-4 border-t border-slate-200">
                              <div className="text-[9px] font-black text-brand-primary uppercase tracking-widest mb-1">Dovoz na adresu</div>
                              <div className="font-black text-slate-900 text-sm leading-tight">{res.deliveryAddress}</div>
                              <div className="text-xs text-slate-500 font-bold mt-1">Čas: {res.deliveryTime}</div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Finanční souhrn</label>
                        <div className="p-5 bg-slate-900 rounded-2xl text-white">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-slate-400">Celková cena:</span>
                            <span className="text-2xl font-black text-brand-primary">{formatCurrency(res.totalPrice)}</span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                            <span className="text-xs font-bold text-slate-400">Vratná kauce:</span>
                            <span className="text-sm font-black text-white">{formatCurrency(res.deposit)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t border-slate-100 flex justify-end gap-4">
                    <button 
                      onClick={() => setViewingReservationId(null)}
                      className="px-10 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Zavřít
                    </button>
                    {!isAiConfigured() && (
                      <div className="flex-1 p-4 bg-orange-50 border border-orange-100 rounded-2xl flex items-center gap-3">
                        <svg className="w-5 h-5 text-orange-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg>
                        <p className="text-[10px] font-bold text-orange-700 leading-tight">AI není nastaveno. Pro generování smluv nastavte GEMINI_API_KEY v nastavení prostředí (Vercel/Cloud Run).</p>
                      </div>
                    )}
                    <button 
                      onClick={() => {
                        handleGenerateContract(res);
                        setViewingReservationId(null);
                      }}
                      disabled={!isAiConfigured() || generatingContractId === res.id}
                      className={`px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100 ${(!isAiConfigured() || generatingContractId === res.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {generatingContractId === res.id ? 'Generuji...' : 'Generovat smlouvu'}
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </div>
      )}

      {/* Contract Viewer Modal */}
      {viewingContract && (
        <div className="fixed inset-0 z-[400] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] p-12 max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-2xl font-black">Náhled smlouvy</h2>
                <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-1">Klient: {viewingContract.customer}</p>
              </div>
              <button onClick={() => setViewingContract(null)} className="p-2 text-slate-400 hover:text-slate-600"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            </div>
            <div className="flex-grow overflow-y-auto bg-slate-50 p-10 rounded-3xl border border-slate-100 mb-8 font-serif leading-relaxed text-slate-700 whitespace-pre-wrap">
              {viewingContract.content}
            </div>

            {/* Admin Signature Pad */}
            <div className="mb-8 p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 text-center">Váš podpis (Milan Gula)</h3>
              <div className="bg-white rounded-2xl border border-slate-200 mb-4 overflow-hidden shadow-inner">
                <SignatureCanvas 
                  ref={adminSignatureRef}
                  penColor="#0f172a"
                  canvasProps={{
                    className: "w-full h-32 cursor-crosshair"
                  }}
                />
              </div>
              <div className="text-center">
                <button 
                  onClick={() => adminSignatureRef.current?.clear()}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                >
                  Vymazat podpis
                </button>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={handlePrintContract} className="flex-1 py-5 bg-slate-100 text-slate-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-200 transition-all">Vytisknout Smlouvu</button>
              <button 
                onClick={() => {
                  const adminSig = adminSignatureRef.current?.isEmpty() ? undefined : adminSignatureRef.current?.getTrimmedCanvas().toDataURL('image/png');
                  
                  onSaveContract({
                    id: crypto.randomUUID(),
                    reservationId: viewingContract.resId,
                    customerName: viewingContract.customer,
                    createdAt: new Date().toISOString(),
                    content: viewingContract.content,
                    adminSignature: adminSig
                  });
                  setViewingContract(null);
                  alert('Smlouva byla uložena s vaším podpisem.');
                }}
                className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-100"
              >
                Uložit a podepsat
              </button>
              <button onClick={() => setViewingContract(null)} className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Zavřít</button>
            </div>
          </div>
        </div>
      )}

      {/* Protocol Edit Modal */}
      {activeProtocolEdit && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">
              {activeProtocolEdit.type === 'handover' ? 'Předávací protokol' : 'Protokol o vrácení'}
            </h2>
            
            <div className="space-y-6">
              {activeProtocolEdit.type === 'handover' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Aktuální stav tachometru (km)</label>
                    <input type="number" value={protocolFormData.mileage} onChange={e => setProtocolFormData({...protocolFormData, mileage: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-xl font-bold focus:border-slate-900 outline-none" placeholder="Např. 124500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Stav paliva (%)</label>
                    <input type="range" min="0" max="100" value={protocolFormData.fuelLevel} onChange={e => setProtocolFormData({...protocolFormData, fuelLevel: e.target.value})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-slate-900" />
                    <div className="text-right text-xs font-black text-slate-900 mt-1">{protocolFormData.fuelLevel} %</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Záznam o stavu a poškození</label>
                    <textarea value={protocolFormData.notes} onChange={e => setProtocolFormData({...protocolFormData, notes: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-xl min-h-[100px] font-medium outline-none focus:border-slate-900" placeholder="Záznam o vnějším i vnitřním stavu..."></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 bg-slate-50 rounded-2xl mb-4 text-[10px] font-bold text-slate-400">
                    STAV PŘI PŘEDÁNÍ: {protocolFormData.mileage} KM
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Stav tachometru při VRÁCENÍ (km)</label>
                    <input type="number" autoFocus value={protocolFormData.returnMileage} onChange={e => setProtocolFormData({...protocolFormData, returnMileage: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-xl font-bold outline-none focus:border-purple-500" />
                  </div>
                  {calculateExtraKm() > 0 && (
                    <div className="p-6 bg-red-50 border border-red-100 rounded-3xl animate-in slide-in-from-top-2">
                       <p className="text-[10px] font-black text-red-700 uppercase mb-1 tracking-widest">Nadlimitní kilometry!</p>
                       <p className="text-2xl font-black text-red-900">Doplatek: {formatCurrency(calculateExtraKm())}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Palivo při vrácení (%)</label>
                    <input type="range" min="0" max="100" value={protocolFormData.returnFuelLevel} onChange={e => setProtocolFormData({...protocolFormData, returnFuelLevel: e.target.value})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    <div className="text-right text-xs font-black text-purple-600 mt-1">{protocolFormData.returnFuelLevel} %</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={handleSaveProtocol} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-slate-800 transition-all">Uložit Protokol</button>
              <button onClick={() => setActiveProtocolEdit(null)} className="px-6 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">Zrušit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
