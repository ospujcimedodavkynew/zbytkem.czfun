
import React, { useState, useEffect } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract, SeasonPrice } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends } from '../services/geminiService';
import { supabase } from '../lib/supabase';

interface AdminDashboardProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  savedContracts: SavedContract[];
  onSaveContract: (contract: SavedContract) => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onDeleteReservation: (id: string) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, 
  vehicles, 
  customers,
  savedContracts,
  onSaveContract,
  onUpdateStatus,
  onDeleteReservation,
  onUpdateVehicle
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'contracts' | 'fleet' | 'advisor' | 'system'>('reservations');
  const [generatingContract, setGeneratingContract] = useState<string | null>(null);
  const [viewingContract, setViewingContract] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, occupancyRate: string, recommendation: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  
  // State pro editaci vozidla
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(vehicles[0] || null);

  const stats = {
    totalRevenue: reservations.reduce((acc, r) => acc + r.totalPrice, 0),
    activeBookings: reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
    pendingBookings: reservations.filter(r => r.status === ReservationStatus.PENDING).length
  };

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
    setViewingContract(text);
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Správa půjčovny 2026</h1>
          <p className="text-slate-500 mt-1 font-medium">Vozidlo: {vehicles[0]?.name}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Obrat 2026</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Rezervace</p>
          <p className="mt-4 text-4xl font-black text-green-600">{reservations.length}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Žádosti</p>
          <p className="mt-4 text-4xl font-black text-orange-600">{stats.pendingBookings}</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto">
        {(['reservations', 'contracts', 'fleet', 'advisor', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
              ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'reservations' ? 'Rezervace' : 
             tab === 'contracts' ? 'Smlouvy' : 
             tab === 'fleet' ? 'Vozový park' :
             tab === 'advisor' ? 'Analýza' : 'Status'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'fleet' && editingVehicle && (
          <div className="p-10 space-y-10">
            <div>
              <h2 className="text-2xl font-black mb-6">Nastavení vozidla</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Název vozidla</label>
                  <input 
                    type="text" 
                    value={editingVehicle.name} 
                    onChange={e => setEditingVehicle({...editingVehicle, name: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">Základní cena / den (Kč)</label>
                  <input 
                    type="number" 
                    value={editingVehicle.basePrice} 
                    onChange={e => setEditingVehicle({...editingVehicle, basePrice: Number(e.target.value)})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black text-slate-400 uppercase">SPZ</label>
                  <input 
                    type="text" 
                    value={editingVehicle.licensePlate} 
                    onChange={e => setEditingVehicle({...editingVehicle, licensePlate: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:border-orange-500 font-bold"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black">Sezónní ceník</h3>
                <button 
                  onClick={addSeason}
                  className="px-4 py-2 bg-slate-100 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-200"
                >
                  + Přidat sezónu
                </button>
              </div>
              <div className="space-y-4">
                {editingVehicle.seasonalPricing.map((season, idx) => (
                  <div key={season.id} className="p-6 bg-slate-50 rounded-2xl border border-slate-200 grid md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Název</label>
                      <input 
                        type="text" 
                        value={season.name} 
                        onChange={e => {
                          const newSeasons = [...editingVehicle.seasonalPricing];
                          newSeasons[idx].name = e.target.value;
                          setEditingVehicle({...editingVehicle, seasonalPricing: newSeasons});
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Od</label>
                      <input 
                        type="date" 
                        value={season.startDate} 
                        onChange={e => {
                          const newSeasons = [...editingVehicle.seasonalPricing];
                          newSeasons[idx].startDate = e.target.value;
                          setEditingVehicle({...editingVehicle, seasonalPricing: newSeasons});
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase">Do</label>
                      <input 
                        type="date" 
                        value={season.endDate} 
                        onChange={e => {
                          const newSeasons = [...editingVehicle.seasonalPricing];
                          newSeasons[idx].endDate = e.target.value;
                          setEditingVehicle({...editingVehicle, seasonalPricing: newSeasons});
                        }}
                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1 space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase">Cena</label>
                        <input 
                          type="number" 
                          value={season.pricePerDay} 
                          onChange={e => {
                            const newSeasons = [...editingVehicle.seasonalPricing];
                            newSeasons[idx].pricePerDay = Number(e.target.value);
                            setEditingVehicle({...editingVehicle, seasonalPricing: newSeasons});
                          }}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-bold text-orange-600"
                        />
                      </div>
                      <button 
                        onClick={() => removeSeason(season.id)}
                        className="p-2 text-red-400 hover:text-red-600 bg-white rounded-lg border border-slate-200"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button 
                onClick={handleSaveVehicleChanges}
                className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold hover:bg-orange-700 shadow-xl shadow-orange-100 transition-all"
              >
                Uložit veškeré změny
              </button>
            </div>
          </div>
        )}

        {activeTab === 'reservations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Klient</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Termín</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Akce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-8 py-12 text-center text-slate-400 font-medium">Zatím žádné rezervace</td>
                  </tr>
                ) : (
                  reservations.map((res) => {
                    const customer = customers.find(c => c.id === res.customerId);
                    return (
                      <tr key={res.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-8 py-6">
                          <div className="font-black text-slate-900">{customer?.firstName} {customer?.lastName}</div>
                          <div className="text-xs text-slate-500 font-medium">{customer?.email}</div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="text-sm font-bold text-slate-700">{formatDate(res.startDate)}</div>
                          <div className="text-xs text-slate-400">do {formatDate(res.endDate)}</div>
                        </td>
                        <td className="px-8 py-6">
                          <select 
                            value={res.status}
                            onChange={(e) => onUpdateStatus(res.id, e.target.value as ReservationStatus)}
                            className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider outline-none border-none cursor-pointer
                              ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 
                                res.status === ReservationStatus.CANCELLED ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}
                          >
                            <option value={ReservationStatus.PENDING}>Čeká</option>
                            <option value={ReservationStatus.CONFIRMED}>Potvrzeno</option>
                            <option value={ReservationStatus.CANCELLED}>Zrušeno</option>
                            <option value={ReservationStatus.COMPLETED}>Dokončeno</option>
                          </select>
                        </td>
                        <td className="px-8 py-6 text-right space-x-2">
                          <button 
                            onClick={() => handleGenerateContract(res)}
                            disabled={generatingContract === res.id}
                            className="px-4 py-2 bg-slate-900 text-white text-xs rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                          >
                            {generatingContract === res.id ? 'Generuji...' : 'Smlouva'}
                          </button>
                          <button 
                            onClick={() => onDeleteReservation(res.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                            title="Smazat rezervaci"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'contracts' && (
          <div className="p-10">
            {savedContracts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 font-medium">Zatím nebyly vygenerovány žádné smlouvy.</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {savedContracts.map(contract => (
                  <div key={contract.id} className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                    <div>
                      <h3 className="font-bold text-slate-900">{contract.customerName}</h3>
                      <p className="text-xs text-slate-500">Vytvořeno: {formatDate(contract.createdAt)}</p>
                    </div>
                    <button 
                      onClick={() => setViewingContract(contract.content)}
                      className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold hover:bg-white transition-colors"
                    >
                      Zobrazit
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {/* Advisor and System tabs stay similar as before */}
        {activeTab === 'advisor' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-6">Analýza půjčovny</h2>
            {loadingAi ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                  <div className="space-y-2"><div className="h-4 bg-slate-200 rounded"></div><div className="h-4 bg-slate-200 rounded w-5/6"></div></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h4 className="font-black text-slate-400 text-xs uppercase mb-2">Souhrn</h4>
                  <p className="text-slate-700 font-medium">{aiAnalysis?.summary}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h4 className="font-black text-green-800 text-xs uppercase mb-2">Vytíženost</h4>
                    <p className="text-2xl font-black text-green-900">{aiAnalysis?.occupancyRate}</p>
                  </div>
                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                    <h4 className="font-black text-blue-800 text-xs uppercase mb-2">Doporučení</h4>
                    <p className="text-slate-700 text-sm">{aiAnalysis?.recommendation}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-6">Status systému</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Databáze Supabase</h3>
                  <p className="text-xs text-slate-500">Ukládání dat v cloudu</p>
                </div>
                {supabase ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase">Online</span>
                ) : (
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase">Demo</span>
                )}
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Generování smluv</h3>
                  <p className="text-xs text-slate-500">Lokální engine obytkem.cz</p>
                </div>
                <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase">Aktivní</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {viewingContract && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 print:p-0">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-12 relative shadow-2xl print:max-h-none print:shadow-none print:rounded-none">
            <button 
              onClick={() => setViewingContract(null)}
              className="fixed top-8 right-8 bg-white p-3 rounded-full shadow-xl text-slate-400 hover:text-slate-900 print:hidden transition-transform hover:scale-110"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-[13px] border-none bg-transparent p-0">{viewingContract}</pre>
            </div>
            <div className="mt-12 flex justify-center gap-4 print:hidden">
              <button onClick={() => window.print()} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-100 hover:scale-105 transition-all">Tisk smlouvy</button>
              <button onClick={() => setViewingContract(null)} className="px-10 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold hover:bg-slate-50 transition-all">Zavřít</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
