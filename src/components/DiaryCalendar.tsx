import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DiaryEntry {
  date: string;
  title: string;
  content: string;
  media: string[];
  timestamp: number;
}

interface DiaryCalendarProps {
  entries: DiaryEntry[];
  onDateSelect: (date: string) => void;
  selectedDate?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function DiaryCalendar({ entries, onDateSelect, selectedDate }: DiaryCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isVisible, setIsVisible] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  // Create calendar grid
  const calendarDays = [];
  
  // Previous month days
  for (let i = firstDay - 1; i >= 0; i--) {
    calendarDays.push({
      day: daysInPrevMonth - i,
      isCurrentMonth: false,
      isPrevMonth: true,
      date: new Date(year, month - 1, daysInPrevMonth - i)
    });
  }
  
  // Current month days
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: true,
      isPrevMonth: false,
      date: new Date(year, month, day)
    });
  }
  
  // Next month days to fill the grid
  const remainingDays = 42 - calendarDays.length;
  for (let day = 1; day <= remainingDays; day++) {
    calendarDays.push({
      day,
      isCurrentMonth: false,
      isPrevMonth: false,
      date: new Date(year, month + 1, day)
    });
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const hasEntry = (date: Date) => {
    const dateKey = formatDateKey(date);
    return entries.some(entry => entry.date === dateKey);
  };

  const handleDateClick = (date: Date, isCurrentMonth: boolean) => {
    if (!isCurrentMonth) return;
    
    const dateKey = formatDateKey(date);
    onDateSelect(dateKey);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return formatDateKey(date) === selectedDate;
  };

  return (
    <div className={cn(
      "glass-panel rounded-2xl p-8 w-full max-w-2xl mx-auto float-gentle",
      "transform transition-all duration-700 ease-out",
      isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-3 rounded-xl bg-golden-warm/10 hover:bg-golden-warm/20 
                   text-golden-warm hover:text-golden-glow transition-all duration-300
                   backdrop-blur-sm border border-golden-warm/20"
        >
          <ChevronLeft size={20} />
        </button>
        
        <h2 className="text-3xl font-bold text-golden-soft bg-gradient-to-r 
                      from-golden-warm to-golden-glow bg-clip-text text-transparent">
          {MONTHS[month]} {year}
        </h2>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-3 rounded-xl bg-golden-warm/10 hover:bg-golden-warm/20 
                   text-golden-warm hover:text-golden-glow transition-all duration-300
                   backdrop-blur-sm border border-golden-warm/20"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 mb-4">
        {DAYS.map(day => (
          <div 
            key={day} 
            className="text-center py-3 text-sm font-medium text-forest-mist"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((calendarDay, index) => {
          const hasEntryForDay = hasEntry(calendarDay.date);
          const isTodayDay = isToday(calendarDay.date);
          const isSelectedDay = isSelected(calendarDay.date);
          
          return (
            <button
              key={index}
              onClick={() => handleDateClick(calendarDay.date, calendarDay.isCurrentMonth)}
              disabled={!calendarDay.isCurrentMonth}
              className={cn(
                "relative h-12 w-12 rounded-xl text-sm font-medium transition-all duration-300",
                "hover:scale-105 hover:shadow-lg",
                calendarDay.isCurrentMonth 
                  ? "text-golden-soft hover:bg-golden-warm/20 cursor-pointer" 
                  : "text-forest-mist/40 cursor-not-allowed",
                isTodayDay && "ring-2 ring-golden-glow ring-opacity-50",
                isSelectedDay && "bg-golden-warm text-primary-foreground shadow-lg",
                hasEntryForDay && !isSelectedDay && "bg-forest-medium/30 text-golden-glow"
              )}
            >
              {calendarDay.day}
              
              {/* Entry indicator dot */}
              {hasEntryForDay && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 
                              w-1.5 h-1.5 rounded-full bg-firefly-glow firefly-glow" />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center mt-6 space-x-6 text-sm text-forest-mist">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-firefly-glow firefly-glow" />
          <span>Has entry</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full border-2 border-golden-glow" />
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}