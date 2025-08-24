import React, { useState, useEffect } from 'react';
import NatureScene from '@/components/NatureScene';
import DiaryCalendar from '@/components/DiaryCalendar';
import DiaryPage from '@/components/DiaryPage';
import { useDiaryStorage } from '@/hooks/useDiaryStorage';
import { cn } from '@/lib/utils';

type ViewMode = 'calendar' | 'diary';

export default function Index() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const {
    entries,
    loading,
    saveEntry,
    deleteEntry,
    getEntry
  } = useDiaryStorage();

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setIsTransitioning(true);
    
    // Smooth transition to diary page
    setTimeout(() => {
      setViewMode('diary');
      setIsTransitioning(false);
    }, 300);
  };

  const handleBackToCalendar = () => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      setViewMode('calendar');
      setSelectedDate('');
      setIsTransitioning(false);
    }, 300);
  };

  const handleSaveEntry = (entry: any) => {
    saveEntry(entry);
    // Show a brief success state
    setTimeout(() => {
      handleBackToCalendar();
    }, 1200);
  };

  const handleDeleteEntry = () => {
    if (selectedDate) {
      deleteEntry(selectedDate);
    }
  };

  // Preload states for smooth transitions
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <NatureScene />
        <div className="glass-panel rounded-2xl p-8 float-gentle">
          <div className="text-golden-soft text-lg">
            Loading your peaceful sanctuary...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* 3D Nature Background */}
      <NatureScene />
      
      {/* Overlay for better text readability */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-transparent to-background/10 pointer-events-none" />
      
      {/* Main Content */}
      <div className={cn(
        "relative z-10 min-h-screen flex items-center justify-center p-4 transition-all duration-700",
        isTransitioning && "opacity-50 scale-95"
      )}>
        {viewMode === 'calendar' && (
          <div className="w-full flex flex-col items-center space-y-8">
            {/* Welcome Message */}
            <div className="text-center mb-8 animate-fade-in">
              <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-golden-warm via-golden-glow to-golden-soft bg-clip-text text-transparent">
                Nature Diary
              </h1>
              <p className="text-xl text-forest-mist max-w-2xl mx-auto leading-relaxed">
                Find peace in your thoughts. A private sanctuary where your daily reflections 
                are kept safe among the gentle sounds of nature.
              </p>
              
              {/* Stats */}
              {entries.length > 0 && (
                <div className="flex items-center justify-center space-x-8 mt-6 text-forest-mist">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-golden-warm">{entries.length}</div>
                    <div className="text-sm">{entries.length === 1 ? 'Entry' : 'Entries'}</div>
                  </div>
                  <div className="w-px h-8 bg-forest-mist/30" />
                  <div className="text-center">
                    <div className="text-2xl font-bold text-golden-warm">
                      {Math.floor(entries.reduce((total, entry) => 
                        total + entry.content.trim().split(/\s+/).filter(word => word.length > 0).length, 0
                      ) / 100) / 10}k
                    </div>
                    <div className="text-sm">Words</div>
                  </div>
                </div>
              )}
            </div>

            {/* Calendar */}
            <DiaryCalendar 
              entries={entries}
              onDateSelect={handleDateSelect}
              selectedDate={selectedDate}
            />
          </div>
        )}

        {viewMode === 'diary' && selectedDate && (
          <DiaryPage
            date={selectedDate}
            entry={getEntry(selectedDate)}
            onSave={handleSaveEntry}
            onDelete={handleDeleteEntry}
            onBack={handleBackToCalendar}
          />
        )}
      </div>

      {/* Floating particles for extra ambiance */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-1 h-1 bg-firefly-glow rounded-full opacity-60",
              "animate-drift firefly-glow"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 20}s`,
              animationDuration: `${20 + Math.random() * 10}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}