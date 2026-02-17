
import React, { useState, useEffect, useRef } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract, SeasonPrice, HandoverProtocol, ReturnProtocol } from '../types';
import { formatCurrency, formatDate, getMonthName, calculateDays } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import Logo from './Logo';

interface AdminDashboardProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  savedContracts: SavedContract[];
  handoverProtocols: HandoverProtocol[];
  returnProtocols: ReturnProtocol[];
  onSaveContract: (contract: SavedContract) => void;
  onSaveHandover: (protocol: HandoverProtocol) => void;
  onSaveReturn: (protocol: ReturnProtocol) => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onDeleteReservation: (id: string) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
  onRefresh?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, 
  vehicles, 
  customers,
  savedContracts,
  handoverProtocols,
  returnProtocols,
  onSaveContract,
  onSaveHandover,
  onSaveReturn,
  onUpdateStatus,
  onDeleteReservation,
  onUpdateVehicle,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'fleet' | 'advisor' | 'protocols'>('reservations');
  const [generatingContract, setGeneratingContract] = useState<string | null>(null);
  const [viewingContract, setViewingContract] = useState<{content: string, customer: string} | null>(null);
  const [activeProtocolEdit, setActiveProtocolEdit] = useState<{type: 'handover' | 'return', reservationId: string} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, occupancyRate: string, recommendation: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
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

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vehicles.length > 0 && !editingVehicle) setEditingVehicle(vehicles[0]);
  }, [vehicles]);

  const stats = {
    totalRevenue: reservations.filter(r => r.status !== ReservationStatus.CANCELLED).reduce((acc, r) => acc + r.totalPrice, 0),
    activeBookings: reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
    pendingBookings: reservations.filter(r => r.status === ReservationStatus.PENDING).length
  };

  const getMonthlyRevenue = () => {
    const monthlyData = new Array(12).fill(0);
    reservations.filter(r => r.status !== ReservationStatus.CANCELLED).forEach(r => {
      monthlyData[new Date(r.startDate).getMonth()] += r.totalPrice;
    });
    return monthlyData;
  };

  const monthlyRevenue = getMonthlyRevenue();
  const maxMonthlyRevenue = Math.max(...monthlyRevenue, 1);

  const handlePrintProtocol = (type: 'handover' | 'return', resId: string) => {
    const res = reservations.find(r => r.id === resId);
    const customer = customers.find(c => c.id === res?.customerId);
    const vehicle = vehicles.find(v => v.id === res?.vehicleId);
    
    let content = "";
    if (type === 'handover') {
      const p = handoverProtocols.find(hp => hp.reservationId === resId);
      if (!p) return;
      content = `PROTOKOL O PŘEDÁNÍ VOZIDLA\n\nNÁJEMCE: ${customer?.firstName} ${customer?.lastName}\nVOZIDLO: ${vehicle?.name} (${vehicle?.licensePlate})\nTERMÍN: ${formatDate(res!.startDate)} - ${formatDate(res!.endDate)}\n\nSTAV TACHOMETRU: ${p.mileage} km\nSTAV PALIVA: ${p.fuelLevel} %\nČISTOTA: ${p.cleanliness}\nPOŠKOZENÍ: ${p.damages}\nPOZNÁMKY: ${p.notes}`;
    } else {
      const p = returnProtocols.find(rp => rp.reservationId === resId);
      const hp = handoverProtocols.find(hp => hp.reservationId === resId);
      if (!p || !hp) return;
      content = `PROTOKOL O VRÁCENÍ VOZIDLA\n\nNÁJEMCE: ${customer?.firstName} ${customer?.lastName}\nVOZIDLO: ${vehicle?.name} (${vehicle?.licensePlate})\n\nSTAV TACHOMETRU PŘI VRÁCENÍ: ${p.returnMileage} km (Ujeto: ${p.returnMileage - hp.mileage} km)\nSTAV PALIVA: ${p.returnFuelLevel} %\nPOŠKOZENÍ: ${p.returnDamages}\nDOPLATEK ZA NADLIMITNÍ KM: ${formatCurrency(p.extraKmCharge)}`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html><head><title>Protokol</title><style>body{font-family:sans-serif;padding:50px;line-height:1.6;}h1{border-bottom:2px solid orange;}pre{white-space:pre-wrap;}</style></head>
      <body><h1>obytkem.cz</h1><pre>${content}</pre><div style="margin-top:100px;display:flex;justify-content:space-between;"><p>Podpis pronajímatele: _______________</p><p>Podpis nájemce: _______________</p></div></body></html>
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
    const driven = protocolFormData.returnMileage - hp.mileage;
    const extra = Math.max(0, driven - limit);
    return extra * 5;
  };

  const handleSaveProtocol = () => {
    if (!activeProtocolEdit) return;
    
    if (activeProtocolEdit.type === 'handover') {
      const protocol: HandoverProtocol = {
        id: `hp-${Date.now()}`,
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
        id: `rp-${Date.now()}`,
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
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Administrace</h1>
          <p className="text-slate-500 font-medium">Správa půjčovny Milan Gula</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit border border-slate-200">
        {(['reservations', 'protocols', 'fleet', 'advisor'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
            {tab === 'reservations' ? 'Rezervace' : tab === 'protocols' ? 'Protokoly' : tab === 'fleet' ? 'Vozový park' : 'AI Poradce'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {activeTab === 'reservations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-100 text-left">
                <tr>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Klient</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Termín</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Protokoly</th>
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
                      <td className="px-8 py-6 font-black">{customer?.firstName} {customer?.lastName}</td>
                      <td className="px-8 py-6 text-sm">{formatDate(res.startDate)} - {formatDate(res.endDate)}</td>
                      <td className="px-8 py-6 flex gap-2">
                        {!hp ? (
                          <button onClick={() => setActiveProtocolEdit({type: 'handover', reservationId: res.id})} className="text-[10px] font-black text-orange-600 uppercase">+ Předání</button>
                        ) : !rp ? (
                          <button onClick={() => setActiveProtocolEdit({type: 'return', reservationId: res.id})} className="text-[10px] font-black text-purple-600 uppercase">+ Vrácení</button>
                        ) : (
                          <span className="text-[10px] font-black text-green-600 uppercase">✓ Hotovo</span>
                        )}
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        {hp && <button onClick={() => handlePrintProtocol('handover', res.id)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase">Předání.pdf</button>}
                        {rp && <button onClick={() => handlePrintProtocol('return', res.id)} className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase">Vrácení.pdf</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'protocols' && (
          <div className="p-10">
             <h2 className="text-xl font-black mb-6">Uložené protokoly</h2>
             <div className="grid md:grid-cols-2 gap-4">
               {returnProtocols.map(p => {
                 const res = reservations.find(r => r.id === p.reservationId);
                 const customer = customers.find(c => c.id === res?.customerId);
                 return (
                   <div key={p.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200">
                     <div className="flex justify-between items-start mb-4">
                       <div>
                         <h3 className="font-black">{customer?.firstName} {customer?.lastName}</h3>
                         <p className="text-[10px] font-black text-slate-400 uppercase">Ujeto: {p.returnMileage - p.mileage} km</p>
                       </div>
                       {p.extraKmCharge > 0 && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black">DOPLATEK {formatCurrency(p.extraKmCharge)}</span>}
                     </div>
                     <button onClick={() => handlePrintProtocol('return', p.reservationId)} className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100 transition-all">Tisk protokolu</button>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </div>

      {activeProtocolEdit && (
        <div className="fixed inset-0 z-[300] bg-slate-900/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-black mb-8 uppercase tracking-tight">
              {activeProtocolEdit.type === 'handover' ? 'Předávací protokol' : 'Protokol o vrácení'}
            </h2>
            
            <div className="space-y-4">
              {activeProtocolEdit.type === 'handover' ? (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Stav tachometru (km)</label>
                    <input type="number" value={protocolFormData.mileage} onChange={e => setProtocolFormData({...protocolFormData, mileage: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Palivo (%)</label>
                    <input type="range" min="0" max="100" value={protocolFormData.fuelLevel} onChange={e => setProtocolFormData({...protocolFormData, fuelLevel: e.target.value})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                    <div className="text-right text-xs font-black text-orange-600 mt-1">{protocolFormData.fuelLevel} %</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Poškození / Poznámky</label>
                    <textarea value={protocolFormData.notes} onChange={e => setProtocolFormData({...protocolFormData, notes: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl min-h-[100px]" placeholder="Popište stav vozu..."></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Stav tachometru při VRÁCENÍ (km)</label>
                    <input type="number" value={protocolFormData.returnMileage} onChange={e => setProtocolFormData({...protocolFormData, returnMileage: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl font-bold" />
                  </div>
                  {calculateExtraKm() > 0 && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl animate-in slide-in-from-top-2">
                       <p className="text-[10px] font-black text-red-700 uppercase mb-1">Pozor: Nadlimitní kilometry!</p>
                       <p className="text-lg font-black text-red-900">Doplatek: {formatCurrency(calculateExtraKm())}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Palivo při vrácení (%)</label>
                    <input type="range" min="0" max="100" value={protocolFormData.returnFuelLevel} onChange={e => setProtocolFormData({...protocolFormData, returnFuelLevel: e.target.value})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-purple-600" />
                    <div className="text-right text-xs font-black text-purple-600 mt-1">{protocolFormData.returnFuelLevel} %</div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-10 flex gap-4">
              <button onClick={handleSaveProtocol} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-orange-600 transition-all">Uložit a uzavřít</button>
              <button onClick={() => setActiveProtocolEdit(null)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-black uppercase text-xs">Zrušit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
