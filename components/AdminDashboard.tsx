
import React, { useState } from 'react';
import { Reservation, Vehicle, ReservationStatus, Customer, SavedContract } from '../types';
import { formatCurrency, formatDate } from '../utils/format';
import { generateContractTemplate, analyzeReservationTrends } from '../services/geminiService';
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
  const [activeTab, setActiveTab] = useState<'reservations' | 'contracts' | 'advisor' | 'vehicles' | 'assets'>('reservations');
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

  // Funkce pro stažení KOMPLETNÍHO LOGA (Ikona + Text) jako čisté SVG
  const downloadFullLogo = (variant: 'dark' | 'light') => {
    const isLight = variant === 'light';
    const orange = isLight ? '#fb923c' : '#ea580c';
    const primary = isLight ? '#ffffff' : '#0f172a';
    const secondary = isLight ? '#94a3b8' : '#64748b';
    const circle = isLight ? 'rgba(255,255,255,0.1)' : '#e2e8f0';

    const svgString = `
      <svg width="400" height="120" viewBox="0 0 400 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <g transform="translate(10, 10)">
          <circle cx="50" cy="50" r="48" stroke="${circle}" stroke-width="1" />
          <path d="M20 65 L40 45 L55 60 L80 30" stroke="${orange}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M25 75 H75 V55 Q75 45 65 45 H35 Q25 45 25 55 Z" stroke="${primary}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="35" cy="75" r="3" fill="${orange}" />
          <circle cx="65" cy="75" r="3" fill="${orange}" />
        </g>
        <text x="125" y="65" font-family="Arial, sans-serif" font-weight="900" font-size="32" letter-spacing="-1" fill="${primary}">
          OBYTKEM<tspan fill="${orange}">.CZ</tspan>
        </text>
        <text x="127" y="85" font-family="Arial, sans-serif" font-weight="700" font-size="10" letter-spacing="4" fill="${secondary}">
          PREMIUM CAMPER RENTAL
        </text>
      </svg>
    `.trim();

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `obytkem-logo-full-${variant}.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-4xl font-black text-slate-900">Správa půjčovny 2026</h1>
          <p className="text-slate-500 mt-1 font-medium">Vozidlo: Laika Kreos 7010 (Model 2016)</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={runAiAnalysis}
            className="px-6 py-2.5 bg-orange-50 text-orange-700 rounded-xl font-bold border border-orange-200 flex items-center gap-2 hover:bg-orange-100 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            AI Business Advisor
          </button>
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
        {(['reservations', 'contracts', 'advisor', 'vehicles', 'assets'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap
              ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab === 'reservations' ? 'Rezervace' : 
             tab === 'contracts' ? 'Složka Smlouvy' : 
             tab === 'advisor' ? 'AI Analýza' : 
             tab === 'assets' ? 'Podklady' : 'Vozidla'}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        {activeTab === 'assets' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-4">Branding & Podklady</h2>
            <p className="text-slate-500 mb-8">Stáhněte si profesionální logo ve vysokém rozlišení. SVG formát je ideální pro web i tisk.</p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 border rounded-3xl flex flex-col items-center">
                <div className="mb-8 p-6 bg-slate-50 rounded-2xl flex items-center justify-center min-h-[160px] w-full">
                  <Logo />
                </div>
                <h3 className="font-bold text-slate-900 mb-2 text-center">Tmavá varianta</h3>
                <p className="text-sm text-slate-400 mb-6 text-center">Pro bílé a světlé podklady</p>
                <button 
                  onClick={() => downloadFullLogo('dark')}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Stáhnout kompletní logo
                </button>
              </div>

              <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl flex flex-col items-center">
                <div className="mb-8 p-6 bg-slate-800/50 rounded-2xl flex items-center justify-center min-h-[160px] w-full">
                  <Logo light />
                </div>
                <h3 className="font-bold text-white mb-2 text-center">Světlá varianta</h3>
                <p className="text-sm text-slate-500 mb-6 text-center">Pro černé a tmavé podklady</p>
                <button 
                  onClick={() => downloadFullLogo('light')}
                  className="w-full py-4 bg-white text-slate-900 rounded-2xl font-bold hover:bg-orange-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  Stáhnout kompletní logo
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'advisor' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
              <span className="p-2 bg-orange-100 rounded-lg text-orange-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
              </span>
              Strategický poradce Gemini (Kreos 7010)
            </h2>
            
            {!aiAnalysis && !loadingAi && (
              <div className="text-center py-20">
                <p className="text-slate-500 mb-6">Nechte AI analyzovat vaše data a navrhnout vylepšení strategie pro rok 2026.</p>
                <button onClick={runAiAnalysis} className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold">Spustit analýzu</button>
              </div>
            )}

            {loadingAi && (
              <div className="text-center py-20">
                <div className="animate-spin w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-slate-500 font-bold">Analyzuji data...</p>
              </div>
            )}

            {aiAnalysis && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <h3 className="font-bold text-slate-900 mb-2">Výkon modelu Kreos</h3>
                  <p className="text-slate-600 leading-relaxed">{aiAnalysis.summary}</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="p-6 bg-green-50 rounded-2xl border border-green-100">
                    <h3 className="font-bold text-green-900 mb-2">Obsazenost</h3>
                    <p className="text-3xl font-black text-green-600">{aiAnalysis.occupancyRate}</p>
                  </div>
                  <div className="p-6 bg-orange-50 rounded-2xl border border-orange-100">
                    <h3 className="font-bold text-orange-900 mb-2">Doporučení</h3>
                    <p className="text-slate-700 italic">"{aiAnalysis.recommendation}"</p>
                  </div>
                </div>
              </div>
            )}
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
        
        {activeTab === 'contracts' && (
          <div className="p-10">
            <h2 className="text-2xl font-black mb-8 text-slate-900">Archiv smluv 2026</h2>
            <div className="grid gap-4">
              {savedContracts.map(c => (
                <div key={c.id} className="p-6 border rounded-2xl flex justify-between items-center hover:border-orange-200 transition-all bg-white shadow-sm">
                  <div>
                    <div className="font-black text-slate-900">{c.customerName}</div>
                    <div className="text-xs text-slate-400 font-medium">Uloženo: {new Date(c.createdAt).toLocaleString('cs-CZ')}</div>
                  </div>
                  <button 
                    onClick={() => setViewingContract(c.content)}
                    className="p-3 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                  >
                    <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path></svg>
                  </button>
                </div>
              ))}
              {savedContracts.length === 0 && (
                <p className="text-center py-10 text-slate-400 italic">V sezóně 2026 nebyly zatím vygenerovány žádné smlouvy.</p>
              )}
            </div>
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
              <pre className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-[13px] border-none">
                {viewingContract}
              </pre>
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
