
import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'motion/react';
import { FileText, Printer, Download, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { SavedContract, Reservation, Customer, Vehicle } from '../types';
import { supabase } from '../lib/supabase';
import { formatDate, formatCurrency } from '../utils/format';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PublicContractViewProps {
  contractId: string;
  onBack?: () => void;
}

const PublicContractView: React.FC<PublicContractViewProps> = ({ contractId, onBack }) => {
  const [contract, setContract] = useState<SavedContract | null>(null);
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const contractRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContractData = async () => {
      if (!supabase) {
        setError("Databáze není k dispozici.");
        setLoading(false);
        return;
      }

      try {
        const { data: contractData, error: contractError } = await supabase
          .from('saved_contracts')
          .select('*')
          .eq('id', contractId)
          .single();

        if (contractError) throw contractError;
        if (!contractData) throw new Error("Smlouva nebyla nalezena.");

        setContract({
          id: contractData.id,
          reservationId: contractData.reservation_id,
          customerName: contractData.customer_name,
          createdAt: contractData.created_at,
          content: contractData.content
        });

        // Fetch reservation and related data
        const { data: resData } = await supabase
          .from('reservations')
          .select('*, customers(*), vehicles(*)')
          .eq('id', contractData.reservation_id)
          .single();

        if (resData) {
          setReservation(resData);
          setCustomer(resData.customers);
          setVehicle(resData.vehicles);
        }
      } catch (err: any) {
        console.error("Error fetching contract:", err);
        setError(err.message || "Nepodařilo se načíst smlouvu.");
      } finally {
        setLoading(false);
      }
    };

    fetchContractData();
  }, [contractId]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!contract || !contractRef.current) return;
    
    setLoading(true); // Show loader while generating
    try {
      const element = contractRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight
      });
      
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }
      
      pdf.save(`Smlouva_Obytkem_${contract.customerName.replace(/\s+/g, '_')}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-primary animate-spin mx-auto mb-4" />
          <p className="text-slate-500 font-black uppercase tracking-widest text-xs">Načítám smlouvu...</p>
        </div>
      </div>
    );
  }

  if (error || !contract) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="max-w-md w-full bg-white rounded-[2.5rem] p-10 shadow-xl border border-slate-200 text-center">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <FileText size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Chyba</h2>
          <p className="text-slate-500 mb-8">{error || "Smlouva nebyla nalezena."}</p>
          {onBack && (
            <button onClick={onBack} className="btn-ultimate-primary w-full py-4">
              Zpět na hlavní stránku
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 print:bg-white print:py-0 print:px-0">
      <div className="max-w-4xl mx-auto">
        {/* Header Actions - Hidden on Print */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8 print:hidden">
          {onBack && (
            <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-black uppercase tracking-widest text-[10px] transition-colors">
              <ArrowLeft size={16} />
              Zpět
            </button>
          )}
          <div className="flex gap-3">
            <button onClick={handlePrint} className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all shadow-sm">
              <Printer size={16} />
              Vytisknout
            </button>
            <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 transition-all shadow-lg">
              <Download size={16} />
              Stáhnout PDF
            </button>
          </div>
        </div>

        {/* Contract Content */}
        <motion.div 
          ref={contractRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-slate-200 print:shadow-none print:border-none print:p-0"
        >
          {/* Logo & Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 pb-12 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-brand-primary rounded-xl flex items-center justify-center text-white">
                  <FileText size={24} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Smlouva o nájmu</h1>
              </div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Obytkem.cz • Brno</p>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Datum vystavení</div>
              <div className="font-black text-slate-900">{formatDate(contract.createdAt)}</div>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
            <div>
              <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Pronajímatel</h3>
              <div className="space-y-1 text-sm">
                <p className="font-black text-slate-900">Milan Gula - Obytkem.cz</p>
                <p className="text-slate-500">Teslova, Brno</p>
                <p className="text-slate-500">IČO: 09477033</p>
                <p className="text-slate-500">Tel: +420 776 333 301</p>
                <p className="text-slate-500">Email: pujcimedodavky@gmail.com</p>
              </div>
            </div>
            <div>
              <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-widest mb-4">Nájemce</h3>
              <div className="space-y-1 text-sm">
                <p className="font-black text-slate-900">{contract.customerName}</p>
                {customer && (
                  <>
                    <p className="text-slate-500">{customer.address}</p>
                    <p className="text-slate-500">Tel: {customer.phone}</p>
                    <p className="text-slate-500">Email: {customer.email}</p>
                    <p className="text-slate-500">OP/Pas: {customer.idNumber}</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-sm md:text-base">
              {contract.content}
            </div>
          </div>

          {/* Signatures */}
          <div className="mt-24 grid grid-cols-2 gap-12 pt-12 border-t border-slate-100">
            <div className="text-center">
              <div className="h-24 border-b border-slate-200 mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Podpis pronajímatele</p>
            </div>
            <div className="text-center">
              <div className="h-24 border-b border-slate-200 mb-4"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Podpis nájemce</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <CheckCircle2 size={12} className="text-green-500" />
              Tato smlouva byla vygenerována systémem Obytkem.cz
            </div>
          </div>
        </motion.div>

        {/* Print Footer */}
        <div className="hidden print:block mt-8 text-center text-[8px] text-slate-400 uppercase tracking-widest">
          Obytkem.cz • Parkoviště Teslova, Brno • +420 776 333 301 • pujcimedodavky@gmail.com
        </div>
      </div>
    </div>
  );
};

export default PublicContractView;
