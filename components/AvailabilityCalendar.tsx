
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info } from 'lucide-react';
import { Vehicle, Reservation, ReservationStatus } from '../types';

interface AvailabilityCalendarProps {
  vehicles: Vehicle[];
  reservations: Reservation[];
  isEmbedded?: boolean;
  initialVehicleId?: string;
  onDateClick?: (date: string) => void;
  startDate?: string;
  endDate?: string;
  onRangeSelect?: (start: string, end: string) => void;
  isDarkMode?: boolean;
}

const AvailabilityCalendar: React.FC<AvailabilityCalendarProps> = ({ 
  vehicles, 
  reservations, 
  isEmbedded, 
  initialVehicleId, 
  onDateClick,
  startDate,
  endDate,
  onRangeSelect,
  isDarkMode = false
}) => {
  const [currentDate, setCurrentDate] = useState(new Date()); // Start with current date
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(initialVehicleId || vehicles[0]?.id || '');

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleDayClick = (day: number) => {
    if (!day) return;
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    // Check if it's available
    const isReserved = reservations.some(r => 
      r.vehicleId === selectedVehicleId &&
      r.status !== ReservationStatus.CANCELLED &&
      dateStr >= r.startDate && 
      dateStr <= r.endDate
    );

    if (isReserved) return;

    if (onDateClick) {
      onDateClick(dateStr);
    }

    if (onRangeSelect) {
      if (!startDate || (startDate && endDate)) {
        onRangeSelect(dateStr, '');
      } else {
        if (dateStr < startDate) {
          onRangeSelect(dateStr, '');
        } else {
          // Check if any reservation exists between startDate and dateStr
          const hasOverlap = reservations.some(r => 
            r.vehicleId === selectedVehicleId &&
            r.status !== ReservationStatus.CANCELLED &&
            ((r.startDate >= startDate && r.startDate <= dateStr) ||
             (r.endDate >= startDate && r.endDate <= dateStr) ||
             (startDate >= r.startDate && startDate <= r.endDate))
          );

          if (!hasOverlap) {
            onRangeSelect(startDate, dateStr);
          } else {
            onRangeSelect(dateStr, '');
          }
        }
      }
    }
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

      if (isReserved) return 'reserved';

      if (startDate && dateStr === startDate) return 'selected-start';
      if (endDate && dateStr === endDate) return 'selected-end';
      if (startDate && endDate && dateStr > startDate && dateStr < endDate) return 'selected-range';

      return 'available';
    };

    return (
      <div className={`${isEmbedded ? 'rounded-none border-none shadow-none' : 'p-6 md:p-8 rounded-[2rem] border transition-all'} ${isEmbedded ? 'p-0' : isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl'} animate-in fade-in duration-500`}>
        <div className={`flex justify-between items-center ${isEmbedded ? 'mb-4' : 'mb-8'}`}>
          <h3 className={`${isEmbedded ? 'text-[10px]' : 'text-xl'} font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {date.toLocaleString('cs-CZ', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                prevMonth();
              }} 
              className={`p-2 rounded-full transition-colors border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
            >
              <ChevronLeft className={`${isEmbedded ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                nextMonth();
              }} 
              className={`p-2 rounded-full transition-colors border shadow-sm ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-100 text-slate-600 hover:bg-slate-50'}`}
            >
              <ChevronRight className={`${isEmbedded ? 'w-3.5 h-3.5' : 'w-5 h-5'}`} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'].map(d => (
            <div key={d} className="text-[7px] text-center font-black text-slate-400 uppercase py-1 tracking-widest">{d}</div>
          ))}
          {days.map((day, idx) => {
            const status = getDayStatus(day || 0);
            const isSelected = status.startsWith('selected');
            
            return (
              <div 
                key={idx} 
                onClick={() => handleDayClick(day || 0)}
                className={`aspect-square flex items-center justify-center text-[9px] rounded-lg transition-all relative group
                  ${!day ? 'bg-transparent' : 
                    status === 'reserved' 
                      ? isDarkMode ? 'bg-red-900/20 text-red-400 font-bold border border-red-900/30 cursor-not-allowed' : 'bg-red-50 text-red-600 font-bold border border-red-100 cursor-not-allowed' 
                      : isSelected
                        ? 'bg-brand-primary text-white font-black shadow-lg shadow-brand-primary/30 scale-105 z-10'
                        : isDarkMode 
                          ? 'bg-emerald-900/20 text-emerald-400 font-medium border border-emerald-900/30 cursor-pointer hover:bg-brand-primary/20 hover:scale-110 shadow-sm'
                          : 'bg-emerald-50 text-emerald-700 font-medium border border-emerald-100 cursor-pointer hover:bg-brand-primary/10 hover:scale-110 shadow-sm'}`}
              >
                {day}
                {status === 'selected-range' && (
                  <div className="absolute inset-0 bg-brand-primary/20 -z-10 rounded-none" />
                )}
              </div>
            );
          })}
        </div>

        {!isEmbedded && (
          <div className={`mt-8 flex flex-wrap gap-6 pt-6 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-emerald-900/40 border-emerald-800' : 'bg-emerald-100 border-emerald-200'}`} />
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Volno</span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full border ${isDarkMode ? 'bg-red-900/40 border-red-800' : 'bg-red-100 border-red-200'}`} />
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
            <h2 className={`text-3xl font-black tracking-tight flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <CalendarIcon className="w-8 h-8 text-brand-primary" />
              Dostupnost vozů
            </h2>
            <p className={`font-medium mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Podívejte se na volné termíny v sezóně 2026</p>
          </div>

          <div className="w-full md:w-auto">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block ml-1">Vyberte vůz</label>
            <select 
              value={selectedVehicleId}
              onChange={(e) => setSelectedVehicleId(e.target.value)}
              className={`w-full md:w-64 px-4 py-3 rounded-xl border font-bold text-sm transition-all outline-none ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-white focus:border-brand-primary' 
                  : 'bg-white border-slate-100 text-slate-900 focus:border-brand-primary shadow-sm'
              }`}
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
        <div className={`mt-10 p-6 rounded-[2rem] border flex gap-4 items-start transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl'}`}>
          <Info className="w-5 h-5 text-brand-primary shrink-0 mt-0.5" />
          <p className={`text-sm font-medium leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Zobrazené termíny jsou orientační. Pro závaznou rezervaci klikněte na tlačítko "Rezervovat" v detailu vozu. 
            Minimální doba nájmu jsou 3 dny.
          </p>
        </div>
      )}
    </div>
  );
};

export default AvailabilityCalendar;
