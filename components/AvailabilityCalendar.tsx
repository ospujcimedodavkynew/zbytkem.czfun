
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Vehicle, Reservation, ReservationStatus } from '../types';

interface AvailabilityCalendarProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  isEmbedded?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ vehicles, reservations, isEmbedded }) => {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 4, 1)); // Start with May 2026 for demo
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || '');

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const renderMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startOffset = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const days = [];
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(i);

    const getDayStatus = (day: number) => {
      if (!day) return 'empty';
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      
      const isReserved = reservations.some(r => 
        r.vehicleId === selectedVehicleId &&
        r.status !== ReservationStatus.CANCELLED &&
        dateStr >= r.startDate && 
        dateStr <= r.endDate
      );

      return isReserved ? 'reserved' : 'available';
    };

    return (
      <div className={`bg-white ${isEmbedded ? 'rounded-none border-none shadow-none' : 'rounded-[2rem] border border-slate-100 shadow-premium'} ${isEmbedded ? 'p-0' : 'p-6 md:p-8'} animate-in fade-in duration-500`}>
        <div className={`flex justify-between items-center ${isEmbedded ? 'mb-4' : 'mb-8'}`}>
          <h3 className={`${isEmbedded ? 'text-xs' : 'text-xl'} font-black text-slate-900 uppercase tracking-widest`}>
            {date.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <button onClick={prevMonth} className={`${isEmbedded ? 'p-1.5' : 'p-2'} hover:bg-slate-50 rounded-full transition-colors border border-slate-100`}>
              <ChevronLeft className={`${isEmbedded ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-slate-600`} />
            </button>
            <button onClick={nextMonth} className={`${isEmbedded ? 'p-1.5' : 'p-2'} hover:bg-slate-50 rounded-full transition-colors border border-slate-100`}>
              <ChevronRight className={`${isEmbedded ? 'w-3.5 h-3.5' : 'w-5 h-5'} text-slate-600`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
            <div key={d} className="text-[7px] text-center font-black text-slate-400 uppercase py-1 tracking-widest">{d}</div>
          ))}
          {days.map((day, idx) => {
            const status = getDayStatus(day || 0);
            return (
              <div 
                key={idx} 
                className={`aspect-square flex items-center justify-center text-[9px] rounded-lg transition-all relative group
                  ${!day ? 'bg-transparent' : 
                    status === 'reserved' 
                      ? 'bg-red-50 text-red-600 font-bold border border-red-100' 
                      : 'bg-green-50 text-green-700 font-medium border border-green-100'}`}
              >
                {day}
              </div>
            );
          })}
        </div>

        {!isEmbedded && (
          <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t border-slate-50">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-100 border border-green-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volno</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-100 border border-red-200" />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Obsazeno</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto ${isEmbedded ? 'p-0' : 'p-4 md:p-8'}`}>
      {!isEmbedded && (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <CalendarIcon className="w-8 h-8 text-slate-900" />
              Dostupnost vozů
            </h2>
            <p className="text-slate-500 font-medium mt-1">Podívejte se na volné termíny v sezóně 2026</p>
          </div>

          <div className="w-full md:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Vyberte vůz</label>
            <select 
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className="w-full md:w-64 px-4 py-3 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 outline-none focus:border-slate-900 transition-all shadow-sm"
            >
              {vehicles.map(v => (
                <option key={v.id} value={v.id}>{v.name}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {renderMonth(currentDate)}
      </div>

      {!isEmbedded && (
        <div className="mt-10 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 flex gap-4 items-start">
          <Info className="w-5 h-5 text-slate-900 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 font-medium leading-relaxed">
            Zobrazené termíny jsou orientační. Pro závaznou rezervaci klikněte na tlačítko "Rezervovat" v detailu vozu. 
            Minimální doba nájmu jsou 3 dny.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
