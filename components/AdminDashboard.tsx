
import React, { useState, useEffect, useRef } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract, SeasonPrice } from '../types';
import { formatCurrency, formatDate, getMonthName } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends, isAiConfigured } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import { jsPDF } from 'jspdf';
import Logo from './Logo';

interface AdminDashboardProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  savedContracts: SavedContract[];
  onSaveContract: (contract: SavedContract) => void;
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
  onSaveContract,
  onUpdateStatus,
  onDeleteReservation,
  onUpdateVehicle,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'contracts' | 'fleet' | 'advisor' | 'system'>('reservations');
  const [generatingContract, setGeneratingContract] = useState<string | null>(null);
  const [viewingContract, setViewingContract] = useState<{content: string, customer: string} | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, occupancyRate: string, recommendation: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(vehicles[0] || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (vehicles.length > 0 && !editingVehicle) {
      setEditingVehicle(vehicles[0]);
    }
  }, [vehicles]);

  const stats = {
    totalRevenue: reservations.filter(r => r.status !== ReservationStatus.CANCELLED).reduce((acc, r) => acc + r.totalPrice, 0),
    activeBookings: reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
    pendingBookings: reservations.filter(r => r.status === ReservationStatus.PENDING).length
  };

  const getMonthlyRevenue = () => {
    const monthlyData = new Array(12).fill(0);
    reservations.filter(r => r.status !== ReservationStatus.CANCELLED).forEach(r => {
      const month = new Date(r.startDate).getMonth();
      monthlyData[month] += r.totalPrice;
    });
    return monthlyData;
  };

  const monthlyRevenue = getMonthlyRevenue();
  const maxMonthlyRevenue = Math.max(...monthlyRevenue, 1);

  useEffect(() => {
    if (activeTab === 'advisor' && !aiAnalysis) {
      runAnalysis();
    }
  }, [activeTab]);

  const runAnalysis = async () => {
    setLoadingAi(true);
    const data = await analyzeReservationTrends(reservations);
    setAiAnalysis(data);
    setLoadingAi(false);
  };

  const downloadPDF = (content: string, customerName: string) => {
    const doc = new jsPDF();
    
    // Hlavička dokumentu
    doc.setFontSize(22);
    doc.setTextColor(234, 88, 12); // Orange-600
    doc.text('obytkem.cz', 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139); // Slate-500
    doc.text('PRÉMIOVÝ PRONÁJEM OBYTNÝCH VOZŮ', 20, 26);
    doc.text(`Datum generování: ${new Date().toLocaleDateString('cs-CZ')}`, 20, 31);
    
    doc.line(20, 35, 190, 35);

    // Obsah smlouvy
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // Slate-900
    doc.setFont('helvetica', 'normal');
    
    // Rozdělení textu na řádky pro PDF
    const splitText = doc.splitTextToSize(content, 170);
    doc.text(splitText, 20, 45);
    
    // Uložení
    const fileName = `Smlouva_obytkem_${customerName.replace(/\s+/g, '_')}.pdf`;
    doc.save(fileName);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !editingVehicle || !supabase) return;
    
    setUploadingImage(true);
    const file = e.target.files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `${editingVehicle.id}-${Date.now()}.${fileExt}`;
    const filePath = `vehicle-photos/${fileName}`;

    try {
      const { error: uploadError } = await supabase.storage
        .from('vehicles')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('vehicles')
        .getPublicUrl(filePath);

      if (data.publicUrl) {
        setEditingVehicle({
          ...editingVehicle,
          images: [...(editingVehicle.images || []), data.publicUrl]
        });
      }
    } catch (error: any) {
      alert(`Chyba: ${error.message}`);
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeImage = (index: number) => {
    if (!editingVehicle) return;
    const newImages = [...editingVehicle.images];
    newImages.splice(index, 1);
    setEditingVehicle({ ...editingVehicle, images: newImages });
  };

  const handleGenerateContract = async (res: Reservation) => {
    setGeneratingContract(res.id);
    const vehicle = vehicles.find(v => v.id === res.vehicleId);
    const customer = customers.find(c => c.id === res.customerId);
    
    const details = {
      vehicleName: vehicle?.name || "Laika Kreos 7010",
      licensePlate: vehicle?.licensePlate || "7BM 2026",
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : "Neznámý zákazník",
      customerAddress: customer?.address || "neuvedena",
      customerEmail: customer?.email || "neuveden",
      startDate: formatDate(res.startDate),
      endDate: formatDate(res.endDate),
      price: formatCurrency(res.totalPrice),
      deposit: formatCurrency(res.deposit || 25000)
    };
    
    const text = await generateContractTemplate(details);
    
    const newContract: SavedContract = {
      id: `cnt-${Date.now()}`,
      reservationId: res.id,
      customerName: details.customerName,
      createdAt: new Date().toISOString(),
      content: text
    };

    onSaveContract(newContract);
    setViewingContract({ content: text, customer: details.customerName });
    setGeneratingContract(null);
  };

  const handleSaveVehicleChanges = () => {
    if (editingVehicle) {
      onUpdateVehicle(editingVehicle);
    }
  };

  const addSeason = () => {
    if (!editingVehicle) return;
    const newSeason: SeasonPrice = {
      id: `s-${Date.now()}`,
      name: 'Nová sezóna',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      pricePerDay: 3500
    };
    setEditingVehicle({
      ...editingVehicle,
      seasonalPricing: [...editingVehicle.seasonalPricing, newSeason]
    });
  };

  const removeSeason = (id: string) => {
    if (!editingVehicle) return;
    setEditingVehicle({
      ...editingVehicle,
      seasonalPricing: editingVehicle.seasonalPricing.filter(s => s.id !== id)
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Administrace</h1>
          <div className="flex items-center gap-3 mt-1">
             <p className="text-slate-500 font-medium">Správa půjčovny Milan Gula</p>
             {onRefresh && (
               <button onClick={onRefresh} className="text-[10px] font-black uppercase text-orange-600 hover:text-orange-700 flex items-center gap-1">
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                 Synchronizovat databázi
               </button>
             )}
          </div>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-full border border-purple-100">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
          </span>
          <span className="text-[10px] font-black text-purple-700 uppercase tracking-widest">AI Engine Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
        <div className="lg:col-span-3 bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
           <div className="flex justify-between items-center mb-8">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Obrat sezóny (CZK)</h3>
           </div>
           <div className="flex items-end justify-between h-48 gap-2">
              {monthlyRevenue.map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-slate-100 group-hover:bg-orange-500/20 rounded-t-lg transition-all duration-500 cursor-help flex flex-col justify-end"
                      style={{ height: `${(val / maxMonthlyRevenue) * 100}%`, minHeight: val > 0 ? '4px' : '0' }}
                    >
                       <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          {formatCurrency(val)}
                       </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-black text-slate-400 uppercase">{getMonthName(i)}</span>
                </div>
              ))}
           </div>
        </div>
        
        <div className="space-y-4">
          <div className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 text-white">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Celkové příjmy</p>
            <p className="mt-4 text-3xl font-black text-orange-500">{formatCurrency(stats.totalRevenue)}</p>
          </div>
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Počet rezervací</p>
            <div className="mt-4 flex items-end gap-2">
              <p className="text-3xl font-black text-slate-900">{reservations.length}</p>
              <p className="text-xs font-bold text-orange-600 mb-1">+{stats.pendingBookings}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto border border-slate-200">
        {(['reservations', 'contracts', 'fleet', 'advisor', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
              ${activeTab === tab ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'reservations' ? 'Rezervace' : 
             tab === 'contracts' ? 'Smlouvy' : 
             tab === 'fleet' ? 'Vozový park' :
             tab === 'advisor' ? 'AI Poradce' : 'Systém'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {activeTab === 'fleet' && editingVehicle && (
          <div className="p-10 space-y-10 animate-in slide-in-from-bottom-4 duration-500">
            <div>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-black">Galerie fotografií</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase mt-1">Nahrané fotografie se ihned zobrazují klientům</p>
                </div>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-6 py-3 bg-orange-600 text-white rounded-xl text-xs font-black uppercase hover:bg-orange-700 transition-all shadow-lg disabled:opacity-50"
                >
                  {uploadingImage ? 'Nahrávám...' : '+ Nová fotografie'}
                </button>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {editingVehicle.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-slate-200">
                    <img src={img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button onClick={() => removeImage(idx)} className="p-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-slate-100 w-full"></div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Název vozu</label>
                <input type="text" value={editingVehicle.name} onChange={e => setEditingVehicle({...editingVehicle, name: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase">Základní cena (CZK/den)</label>
                <input type="number" value={editingVehicle.basePrice} onChange={e => setEditingVehicle({...editingVehicle, basePrice: Number(e.target.value)})} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold" />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Sezónní ceník</h3>
                <button onClick={addSeason} className="text-xs font-black text-orange-600 uppercase">+ Přidat sezónu</button>
              </div>
              <div className="grid gap-4">
                {editingVehicle.seasonalPricing.map((season, idx) => (
                  <div key={season.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid md:grid-cols-4 gap-4 items-end">
                    <input type="text" value={season.name} onChange={e => { const s = [...editingVehicle.seasonalPricing]; s[idx].name = e.target.value; setEditingVehicle({...editingVehicle, seasonalPricing: s}); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold" />
                    <input type="date" value={season.startDate} onChange={e => { const s = [...editingVehicle.seasonalPricing]; s[idx].startDate = e.target.value; setEditingVehicle({...editingVehicle, seasonalPricing: s}); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="date" value={season.endDate} onChange={e => { const s = [...editingVehicle.seasonalPricing]; s[idx].endDate = e.target.value; setEditingVehicle({...editingVehicle, seasonalPricing: s}); }} className="px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <div className="flex gap-2">
                      <input type="number" value={season.pricePerDay} onChange={e => { const s = [...editingVehicle.seasonalPricing]; s[idx].pricePerDay = Number(e.target.value); setEditingVehicle({...editingVehicle, seasonalPricing: s}); }} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm font-black text-orange-600" />
                      <button onClick={() => removeSeason(season.id)} className="p-2 text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button onClick={handleSaveVehicleChanges} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs hover:bg-orange-600 shadow-xl transition-all">Uložit změny</button>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-left">
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Klient</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Termín</th>
                  <th className="px-8 py-5 text-xs font-black text-slate-400 uppercase tracking-widest">Stav</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => {
                  const customer = customers.find(c => c.id === res.customerId);
                  return (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="font-black text-slate-900">{customer?.firstName} {customer?.lastName}</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{customer?.phone}</div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="text-sm font-bold text-slate-700">{formatDate(res.startDate)} - {formatDate(res.endDate)}</div>
                        <div className="text-[10px] font-black text-orange-600 uppercase mt-1">{formatCurrency(res.totalPrice)}</div>
                      </td>
                      <td className="px-8 py-6">
                        <select 
                          value={res.status}
                          onChange={(e) => onUpdateStatus(res.id, e.target.value as ReservationStatus)}
                          className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider outline-none cursor-pointer
                            ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}
                        >
                          <option value={ReservationStatus.PENDING}>Čeká</option>
                          <option value={ReservationStatus.CONFIRMED}>Potvrzeno</option>
                          <option value={ReservationStatus.CANCELLED}>Zrušeno</option>
                        </select>
                      </td>
                      <td className="px-8 py-6 text-right space-x-2">
                        <button 
                          onClick={() => handleGenerateContract(res)}
                          disabled={generatingContract === res.id}
                          className="px-4 py-2 bg-purple-600 text-white text-[10px] rounded-xl font-black uppercase hover:bg-purple-700 transition-all disabled:opacity-50"
                        >
                          {generatingContract === res.id ? 'Generuji...' : 'Smlouva PDF'}
                        </button>
                        <button onClick={() => onDeleteReservation(res.id)} className="p-2 text-slate-300 hover:text-red-500"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="p-10">
            <div className="grid md:grid-cols-2 gap-6">
              {savedContracts.map(contract => (
                <div key={contract.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-200">
                  <div>
                    <h3 className="font-black text-slate-900">{contract.customerName}</h3>
                    <p className="text-[10px] text-slate-400 font-black uppercase mt-1">Generováno: {formatDate(contract.createdAt)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setViewingContract({ content: contract.content, customer: contract.customerName })} className="px-4 py-2 bg-white border border-slate-300 rounded-xl text-[10px] font-black uppercase">Náhled</button>
                    <button onClick={() => downloadPDF(contract.content, contract.customerName)} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-[10px] font-black uppercase">Stáhnout PDF</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'advisor' && (
          <div className="p-10 animate-in zoom-in-95 duration-500">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black">AI Podnikatelský poradce</h2>
              <button onClick={runAnalysis} className="text-[10px] font-black uppercase text-purple-600 hover:text-purple-800 flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
                Přepočítat analýzu
              </button>
            </div>
            {loadingAi ? (
              <div className="h-48 bg-slate-50 rounded-3xl animate-pulse flex items-center justify-center text-purple-500 font-bold">AI analyzuje trh...</div>
            ) : (
              <div className="space-y-6">
                <div className="p-10 bg-purple-50 rounded-[2.5rem] border border-purple-100 shadow-inner">
                  <h4 className="font-black text-purple-400 text-[10px] uppercase tracking-widest mb-4">Strategický souhrn</h4>
                  <p className="text-slate-800 font-medium leading-relaxed text-lg italic">"{aiAnalysis?.summary || "Doplňte data pro analýzu sezóny."}"</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-10 bg-green-50 rounded-[2.5rem] border border-green-100">
                    <h4 className="font-black text-green-800 text-[10px] uppercase tracking-widest mb-3">Odhad vytíženosti</h4>
                    <p className="text-5xl font-black text-green-900">{aiAnalysis?.occupancyRate || '0%'}</p>
                  </div>
                  <div className="p-10 bg-blue-50 rounded-[2.5rem] border border-blue-100">
                    <h4 className="font-black text-blue-800 text-[10px] uppercase tracking-widest mb-3">Obchodní tip</h4>
                    <p className="text-slate-700 text-sm font-bold leading-relaxed">{aiAnalysis?.recommendation || 'Zadejte API klíč pro doporučení.'}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-8">Systémové napojení</h2>
            <div className="grid gap-6">
              <div className="flex items-center justify-between p-8 bg-slate-50 rounded-[2rem] border border-slate-200">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg text-blue-500">
                    <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                  </div>
                  <div><h3 className="text-lg font-black text-slate-900">Database Supabase</h3><p className="text-xs text-slate-500 font-medium">Ukládání dat v reálném čase</p></div>
                </div>
                <span className="px-5 py-2 bg-green-100 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">Aktivní</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewingContract && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-md p-4">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[2.5rem] p-12 relative shadow-2xl">
            <button onClick={() => setViewingContract(null)} className="fixed top-8 right-8 bg-white p-3 rounded-full text-slate-400 hover:text-slate-900 transition-all hover:scale-110"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></button>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-serif text-slate-800 leading-loose text-[14px] border-none bg-transparent p-0">{viewingContract.content}</pre>
            </div>
            <div className="mt-16 flex justify-center gap-4">
              <button onClick={() => downloadPDF(viewingContract.content, viewingContract.customer)} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-2xl shadow-orange-200 hover:bg-orange-700 transition-all">Stáhnout PDF Smlouvu</button>
              <button onClick={() => setViewingContract(null)} className="px-10 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all">Zavřít náhled</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
