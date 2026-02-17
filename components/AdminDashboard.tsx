
import React, { useState, useEffect, useRef } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract, SeasonPrice, HandoverProtocol, ReturnProtocol } from '../types';
import { formatCurrency, formatDate, getMonthName, calculateDays } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends, isAiConfigured } from '../services/geminiService';
import { supabase } from '../lib/supabase';

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
  const [generatingContractId, setGeneratingContractId] = useState<string | null>(null);
  const [viewingContract, setViewingContract] = useState<{content: string, customer: string, resId: string} | null>(null);
  const [activeProtocolEdit, setActiveProtocolEdit] = useState<{type: 'handover' | 'return', reservationId: string} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, occupancyRate: string, recommendation: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
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

  const handleGenerateContract = async (res: Reservation) => {
    setGeneratingContractId(res.id);
    const customer = customers.find(c => c.id === res.customerId);
    const vehicle = vehicles.find(v => v.id === res.vehicleId);

    try {
      const contractText = await generateContractTemplate({
        customerName: `${customer?.firstName} ${customer?.lastName}`,
        customerAddress: customer?.address || 'Neuvedena',
        customerEmail: customer?.email || '',
        vehicleName: vehicle?.name || 'Obytný vůz',
        licensePlate: vehicle?.licensePlate || '',
        startDate: formatDate(res.startDate),
        endDate: formatDate(res.endDate),
        price: formatCurrency(res.totalPrice),
        deposit: formatCurrency(res.deposit)
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
      <style>body{font-family:sans-serif;padding:40px;line-height:1.5;font-size:12px;}h1{color:orange;}pre{white-space:pre-wrap;font-family:inherit;}</style></head>
      <body><h1>Smlouva o nájmu - obytkem.cz</h1><pre>${viewingContract.content}</pre></body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  // Fix: Added missing handlePrintProtocol function
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
      <style>body{font-family:sans-serif;padding:40px;line-height:1.5;font-size:12px;}h1{color:orange;}pre{white-space:pre-wrap;font-family:inherit;}</style></head>
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
          <p className="text-slate-500 font-medium">Vítejte, Milan Gula</p>
        </div>
        {onRefresh && (
          <button onClick={onRefresh} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors">
            <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          </button>
        )}
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
                        <div className="font-black text-slate-900">{customer?.firstName} {customer?.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{customer?.email}</div>
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
                              res.status === ReservationStatus.PENDING ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}
                        >
                          {Object.values(ReservationStatus).map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button 
                          disabled={generatingContractId === res.id}
                          onClick={() => handleGenerateContract(res)}
                          className="text-[10px] font-black text-orange-600 hover:text-orange-800 uppercase"
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
               <h2 className="text-2xl font-black">Správa vozu: {editingVehicle.name}</h2>
               <button onClick={() => onUpdateVehicle(editingVehicle)} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black uppercase text-xs hover:bg-orange-600 transition-all">Uložit změny</button>
             </div>

             <div className="grid md:grid-cols-2 gap-8">
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Základní cena mimo sezónu (Kč/den)</label>
                 <input type="number" value={editingVehicle.basePrice} onChange={e => setEditingVehicle({...editingVehicle, basePrice: Number(e.target.value)})} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold focus:border-orange-500 outline-none" />
               </div>
               <div className="space-y-4">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">SPZ vozidla</label>
                 <input type="text" value={editingVehicle.licensePlate} onChange={e => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})} className="w-full px-5 py-3 border-2 border-slate-100 rounded-2xl font-bold focus:border-orange-500 outline-none" />
               </div>
             </div>

             <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Popis vozidla pro web</label>
               <textarea value={editingVehicle.description} onChange={e => setEditingVehicle({...editingVehicle, description: e.target.value})} className="w-full px-5 py-4 border-2 border-slate-100 rounded-2xl min-h-[150px] font-medium focus:border-orange-500 outline-none" />
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
                     <input type="number" className="w-24 bg-white border border-slate-200 rounded-lg px-2 py-1 font-black text-orange-600 text-right" value={s.pricePerDay} onChange={e => {
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
                 {!aiAnalysis ? (
                   <button 
                     onClick={handleRunAiAnalysis} 
                     disabled={loadingAi}
                     className="px-8 py-4 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all flex items-center gap-3 disabled:opacity-50"
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
                          <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Vytíženost</div>
                          <div className="text-4xl font-black">{aiAnalysis.occupancyRate}</div>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                          <div className="text-[10px] font-black text-orange-500 uppercase tracking-widest mb-1">Stav trhu</div>
                          <div className="text-sm font-bold mt-2">{aiAnalysis.summary}</div>
                        </div>
                     </div>
                     <div className="p-8 bg-orange-600 rounded-[2rem] text-white">
                        <h4 className="text-xs font-black uppercase tracking-widest mb-3">Doporučení AI:</h4>
                        <p className="font-medium text-lg leading-relaxed italic">"{aiAnalysis.recommendation}"</p>
                     </div>
                     <button onClick={() => setAiAnalysis(null)} className="text-xs font-bold text-slate-500 hover:text-white transition-colors">Zkusit novou analýzu</button>
                   </div>
                 )}
               </div>
               {/* Dekorace */}
               <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-orange-600/20 blur-[100px] rounded-full"></div>
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
                       {hp && <button onClick={() => handlePrintProtocol('handover', res.id)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">Předání</button>}
                       {rp && <button onClick={() => handlePrintProtocol('return', res.id)} className="flex-1 py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase hover:bg-slate-100">Vrácení</button>}
                     </div>
                   </div>
                 );
               })}
             </div>
          </div>
        )}
      </div>

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
            <div className="flex gap-4">
              <button onClick={handlePrintContract} className="flex-1 py-5 bg-orange-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-700 transition-all shadow-xl shadow-orange-100">Vytisknout Smlouvu</button>
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
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Stav tachometru (km)</label>
                    <input type="number" value={protocolFormData.mileage} onChange={e => setProtocolFormData({...protocolFormData, mileage: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-xl font-bold focus:border-orange-500 outline-none" placeholder="Např. 124500" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Palivo (%)</label>
                    <input type="range" min="0" max="100" value={protocolFormData.fuelLevel} onChange={e => setProtocolFormData({...protocolFormData, fuelLevel: e.target.value})} className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-600" />
                    <div className="text-right text-xs font-black text-orange-600 mt-1">{protocolFormData.fuelLevel} %</div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Čistota a poškození</label>
                    <textarea value={protocolFormData.notes} onChange={e => setProtocolFormData({...protocolFormData, notes: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-xl min-h-[100px] font-medium outline-none focus:border-orange-500" placeholder="Záznam o vnějším i vnitřním stavu..."></textarea>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block tracking-widest">Stav tachometru při VRÁCENÍ (km)</label>
                    <input type="number" value={protocolFormData.returnMileage} onChange={e => setProtocolFormData({...protocolFormData, returnMileage: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-50 rounded-xl font-bold outline-none focus:border-purple-500" />
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
              <button onClick={handleSaveProtocol} className="flex-1 py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-orange-600 transition-all">Uložit Protokol</button>
              <button onClick={() => setActiveProtocolEdit(null)} className="px-6 py-5 bg-slate-100 text-slate-400 rounded-2xl font-black uppercase text-xs">Zrušit</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
