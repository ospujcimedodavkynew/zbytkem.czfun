
import React, { useState } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends, isAiConfigured } from '../services/geminiService';
import { supabase } from '../lib/supabase';
import Logo from './Logo';

interface AdminDashboardProps {
  reservations: Reservation[];
  vehicles: Vehicle[];
  customers: Customer[];
  savedContracts: SavedContract[];
  onSaveContract: (contract: SavedContract) => void;
  onUpdateStatus: (id: string, status: ReservationStatus) => void;
  onUpdateVehicle: (vehicle: Vehicle) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  reservations, 
  vehicles, 
  customers,
  savedContracts,
  onSaveContract,
  onUpdateStatus,
  onUpdateVehicle
}) => {
  const [activeTab, setActiveTab] = useState<'reservations' | 'contracts' | 'advisor' | 'vehicles' | 'assets' | 'system'>('reservations');
  const [generatingContract, setGeneratingContract] = useState<string | null>(null);
  const [viewingContract, setViewingContract] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<{summary: string, occupancyRate: string, recommendation: string} | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  const stats = {
    totalRevenue: reservations.reduce((acc, r) => acc + r.totalPrice, 0),
    activeBookings: reservations.filter(r => r.status === ReservationStatus.CONFIRMED).length,
    pendingBookings: reservations.filter(r => r.status === ReservationStatus.PENDING).length
  };

  const runAiAnalysis = async () => {
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
      customerAddress: customer?.address || "Brno",
      customerEmail: customer?.email || "obytkem@gmail.com",
      dates: `${formatDate(res.startDate)} - ${formatDate(res.endDate)}`,
      price: formatCurrency(res.totalPrice),
      deposit: "25 000 Kč"
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Správa půjčovny 2026</h1>
          <p className="text-slate-500 mt-1 font-medium">Vozidlo: Laika Kreos 7010</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Obrat 2026</p>
          <p className="mt-4 text-4xl font-black text-slate-900">{formatCurrency(stats.totalRevenue)}</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Vytíženost</p>
          <p className="mt-4 text-4xl font-black text-green-600">85 %</p>
        </div>
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
          <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Žádosti</p>
          <p className="mt-4 text-4xl font-black text-orange-600">{stats.pendingBookings}</p>
        </div>
      </div>

      <div className="flex space-x-2 mb-8 p-1 bg-slate-100 rounded-2xl w-fit overflow-x-auto">
        {(['reservations', 'contracts', 'advisor', 'system'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
              ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'reservations' ? 'Rezervace' : 
             tab === 'contracts' ? 'Smlouvy' : 
             tab === 'advisor' ? 'AI Analýza' : 'Status Systému'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'system' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-6">Diagnostika připojení</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Databáze Supabase</h3>
                  <p className="text-xs text-slate-500">Ukládání rezervací v cloudu</p>
                </div>
                {supabase ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase">Připojeno ✅</span>
                ) : (
                  <span className="px-4 py-2 bg-red-100 text-red-700 rounded-full text-xs font-black uppercase">DEMO REŽIM ❌</span>
                )}
              </div>
              <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <h3 className="font-bold text-slate-900">Google Gemini AI</h3>
                  <p className="text-xs text-slate-500">Generování smluv a analýzy</p>
                </div>
                {isAiConfigured() ? (
                  <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-xs font-black uppercase">Aktivní ✅</span>
                ) : (
                  <span className="px-4 py-2 bg-slate-200 text-slate-500 rounded-full text-xs font-black uppercase">Neaktivní</span>
                )}
              </div>
            </div>

            <div className="mt-10 grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <h4 className="font-black text-blue-900 text-sm uppercase mb-3">Kde najdu Supabase klíče?</h4>
                <ol className="text-xs text-blue-800 space-y-2 list-decimal ml-4">
                  <li>Otevřete projekt na <strong>supabase.com</strong></li>
                  <li>Klikněte na ikonu ⚙️ <strong>Settings</strong> dole vlevo</li>
                  <li>Vyberte <strong>API</strong></li>
                  <li>Zkopírujte <strong>Project URL</strong> a <strong>anon public</strong> key</li>
                </ol>
              </div>
              <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                <h4 className="font-black text-orange-900 text-sm uppercase mb-3">Kde najdu Google AI klíč?</h4>
                <ol className="text-xs text-orange-800 space-y-2 list-decimal ml-4">
                  <li>Jděte na <strong>aistudio.google.com</strong></li>
                  <li>Klikněte na 🔑 <strong>Get API key</strong></li>
                  <li>Vytvořte nový klíč (Create API key)</li>
                  <li>Zkopírujte kód začínající na <code>AIza...</code></li>
                </ol>
              </div>
            </div>
            
            <div className="mt-8 p-6 bg-slate-900 text-white rounded-2xl">
              <h4 className="font-black text-xs uppercase mb-2 text-slate-400">Jak to vložit na Vercel?</h4>
              <p className="text-sm">V administraci Vercelu jděte do <strong>Settings -> Environment Variables</strong> a přidejte proměnné: <code>SUPABASE_URL</code>, <code>SUPABASE_ANON_KEY</code> a <code>API_KEY</code>.</p>
            </div>
          </div>
        )}

        {/* ... zbytek dashboardu zůstává stejný ... */}
        {activeTab === 'reservations' && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Klient</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Termín</th>
                  <th className="px-8 py-5 text-left text-xs font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-right text-xs font-black text-slate-400 uppercase tracking-widest">Nástroje</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.map((res) => {
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
                        <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase tracking-wider
                          ${res.status === ReservationStatus.CONFIRMED ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                          {res.status === ReservationStatus.CONFIRMED ? 'Potvrzeno' : 'Čeká'}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button 
                          onClick={() => handleGenerateContract(res)}
                          disabled={generatingContract === res.id}
                          className="px-4 py-2 bg-slate-900 text-white text-xs rounded-xl font-bold hover:bg-orange-600 transition-colors disabled:opacity-50"
                        >
                          {generatingContract === res.id ? 'Generuji...' : 'Smlouva 📄'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {viewingContract && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/80 backdrop-blur-md p-4 print:p-0">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl p-12 relative shadow-2xl print:max-h-none print:shadow-none print:rounded-none">
            <button 
              onClick={() => setViewingContract(null)}
              className="fixed top-8 right-8 bg-white p-3 rounded-full shadow-xl text-slate-400 hover:text-slate-900 print:hidden"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
            <div className="prose max-w-none">
              <pre className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-[13px] border-none">{viewingContract}</pre>
            </div>
            <div className="mt-12 flex justify-center gap-4 print:hidden">
              <button onClick={() => window.print()} className="px-10 py-4 bg-orange-600 text-white rounded-2xl font-bold shadow-xl shadow-orange-100 hover:scale-105 transition-all">Tisk smlouvy</button>
              <button onClick={() => setViewingContract(null)} className="px-10 py-4 bg-white border border-slate-200 rounded-2xl text-slate-500 font-bold">Zavřít</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
