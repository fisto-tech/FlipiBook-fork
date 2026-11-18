import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Icon } from '@iconify/react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Format date as "11 Nov, 2026"
 */
function formatDisplayDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate();
  const month = SHORT_MONTHS[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month}, ${year}`;
}

/**
 * Custom Date Range Picker Component
 * Props:
 * - startDate: Date | null
 * - endDate: Date | null
 * - onChange: ({ startDate, endDate }) => void
 */
export default function AnalyticsDatePicker({
  startDate = new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
  endDate = new Date(),
  onChange,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Temporary selection state when popover is open
  const [tempStart, setTempStart] = useState(startDate);
  const [tempEnd, setTempEnd] = useState(endDate);
  const [hoverDate, setHoverDate] = useState(null);

  // Current calendar view (month and year)
  const [viewMonth, setViewMonth] = useState((startDate || new Date()).getMonth());
  const [viewYear, setViewYear] = useState((startDate || new Date()).getFullYear());

  // Keep in sync with incoming props
  useEffect(() => {
    setTempStart(startDate);
    setTempEnd(endDate);
    if (startDate) {
      setViewMonth(startDate.getMonth());
      setViewYear(startDate.getFullYear());
    }
  }, [startDate, endDate]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Generate calendar grid
  const daysInMonth = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const totalDays = new Date(viewYear, viewMonth + 1, 0).getDate();
    const prevMonthDays = new Date(viewYear, viewMonth, 0).getDate();

    const cells = [];

    // Previous month filler
    for (let i = firstDay - 1; i >= 0; i--) {
      cells.push({
        day: prevMonthDays - i,
        date: new Date(viewYear, viewMonth - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        day: i,
        date: new Date(viewYear, viewMonth, i),
        isCurrentMonth: true,
      });
    }

    // Next month filler
    const remaining = (7 - (cells.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        day: i,
        date: new Date(viewYear, viewMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return cells;
  }, [viewMonth, viewYear]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(y => y - 1);
    } else {
      setViewMonth(m => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(y => y + 1);
    } else {
      setViewMonth(m => m + 1);
    }
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  const isInRange = (d) => {
    if (!tempStart) return false;
    const targetTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const startTime = new Date(tempStart.getFullYear(), tempStart.getMonth(), tempStart.getDate()).getTime();

    if (tempEnd) {
      const endTime = new Date(tempEnd.getFullYear(), tempEnd.getMonth(), tempEnd.getDate()).getTime();
      return targetTime >= Math.min(startTime, endTime) && targetTime <= Math.max(startTime, endTime);
    }

    if (hoverDate) {
      const hoverTime = new Date(hoverDate.getFullYear(), hoverDate.getMonth(), hoverDate.getDate()).getTime();
      return targetTime >= Math.min(startTime, hoverTime) && targetTime <= Math.max(startTime, hoverTime);
    }

    return false;
  };

  const handleDayClick = (cellDate) => {
    if (!tempStart || (tempStart && tempEnd)) {
      setTempStart(cellDate);
      setTempEnd(null);
    } else if (tempStart && !tempEnd) {
      if (cellDate < tempStart) {
        setTempStart(cellDate);
        setTempEnd(tempStart);
      } else {
        setTempEnd(cellDate);
      }
    }
  };

  const applyRange = () => {
    if (tempStart && !tempEnd) {
      onChange && onChange({ startDate: tempStart, endDate: tempStart });
    } else if (tempStart && tempEnd) {
      const s = tempStart <= tempEnd ? tempStart : tempEnd;
      const e = tempStart <= tempEnd ? tempEnd : tempStart;
      onChange && onChange({ startDate: s, endDate: e });
    }
    setIsOpen(false);
  };

  const applyPreset = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - (days - 1));
    setTempStart(start);
    setTempEnd(end);
    setViewMonth(start.getMonth());
    setViewYear(start.getFullYear());
    onChange && onChange({ startDate: start, endDate: end });
    setIsOpen(false);
  };

  const displayLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
    }
    if (startDate) return formatDisplayDate(startDate);
    return 'Select Date Range';
  }, [startDate, endDate]);

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button className="cursor-pointer"
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-[0.45vw] px-[0.65vw] py-[0.35vw] bg-white border border-slate-200/90 rounded-[0.45vw] text-[0.72vw] text-slate-700 hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs transition-all cursor-pointer select-none"
      >
        <div className="w-[1vw] h-[1vw] flex items-center justify-center text-[#F05338]">
          <Icon icon="solar:calendar-date-bold" className="w-[0.95vw] h-[0.95vw]" />
        </div>
        <span className="font-medium text-slate-800 tracking-tight">{displayLabel}</span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`w-[0.65vw] h-[0.65vw] text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-slate-700' : ''
          }`}
        />
      </button>

      {/* Popover Calendar Dropdown */}
      {isOpen && (
        <div className="absolute left-0 mt-[0.3vw] z-[120] w-[15.5vw] min-w-[215px] max-w-[245px] bg-white border border-slate-200/90 rounded-[0.6vw] shadow-[0_8px_24px_rgba(0,0,0,0.08)] p-[0.65vw] text-slate-800 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Controls */}
          <div className="flex items-center justify-between pb-[0.4vw] border-b border-slate-100">
            <span className="text-[0.7vw] font-semibold text-slate-900 tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-[0.1vw]">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-[0.2vw] rounded-[0.25vw] text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Previous Month"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="w-[0.65vw] h-[0.65vw]" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-[0.2vw] rounded-[0.25vw] text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer transition-colors"
                title="Next Month"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="w-[0.65vw] h-[0.65vw]" />
              </button>
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-[0.2vw] py-[0.35vw] border-b border-slate-100 text-[0.56vw]">
            {[
              { label: 'Today', days: 1 },
              { label: 'Last 7 Days', days: 7 },
              { label: 'Last 30 Days', days: 30 },
              { label: 'Last 90 Days', days: 90 },
            ].map(p => (
              <button className="cursor-pointer"
                key={p.label}
                type="button"
                onClick={() => applyPreset(p.days)}
                className="px-[0.35vw] py-[0.15vw] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-[0.25vw] font-medium transition-colors cursor-pointer"
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-[0.1vw] pt-[0.35vw] text-center text-[0.56vw] font-medium text-slate-400">
            {DAYS.map(d => (
              <div key={d} className="py-[0.08vw]">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-[0.1vw] pt-[0.1vw]">
            {daysInMonth.map((cell, idx) => {
              const isStart = isSameDay(cell.date, tempStart);
              const isEnd = isSameDay(cell.date, tempEnd);
              const inRange = isInRange(cell.date);
              const isToday = isSameDay(cell.date, new Date());

              return (
                <button className="cursor-pointer"
                  key={idx}
                  type="button"
                  onClick={() => handleDayClick(cell.date)}
                  onMouseEnter={() => !tempEnd && setHoverDate(cell.date)}
                  className={`relative h-[1.45vw] min-h-[21px] rounded-[0.28vw] text-[0.6vw] font-medium flex items-center justify-center transition-all cursor-pointer select-none ${
                    !cell.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'
                  } ${
                    inRange && !isStart && !isEnd ? 'bg-orange-50 text-[#F05338] rounded-none' : ''
                  } ${
                    isStart || isEnd
                      ? 'bg-[#F05338] text-white shadow-xs font-semibold z-10'
                      : 'hover:bg-slate-100'
                  } ${isToday && !isStart && !isEnd ? 'ring-1 ring-[#F05338]/40 font-semibold' : ''}`}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-[0.45vw] mt-[0.35vw] border-t border-slate-100 text-[0.58vw]">
            <span className="text-slate-500 font-normal truncate max-w-[55%]">
              {tempStart ? formatDisplayDate(tempStart) : 'Start'} → {tempEnd ? formatDisplayDate(tempEnd) : 'End'}
            </span>
            <div className="flex items-center gap-[0.25vw]">
              <button className="cursor-pointer"
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-[0.4vw] py-[0.18vw] text-slate-600 hover:text-slate-900 rounded-[0.25vw] font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={applyRange}
                className="px-[0.55vw] py-[0.18vw] bg-[#F05338] hover:bg-[#d9442a] text-white rounded-[0.25vw] font-medium shadow-xs transition-colors cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
