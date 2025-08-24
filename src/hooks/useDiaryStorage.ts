import { useState, useEffect } from 'react';

export interface DiaryEntry {
  date: string;
  title: string;
  content: string;
  media: string[];
  timestamp: number;
}

const STORAGE_KEY = 'nature_diary_entries';

export function useDiaryStorage() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem(STORAGE_KEY);
      if (storedEntries) {
        const parsed = JSON.parse(storedEntries);
        setEntries(parsed);
      }
    } catch (error) {
      console.error('Failed to load diary entries:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  const saveToStorage = (newEntries: DiaryEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newEntries));
      setEntries(newEntries);
    } catch (error) {
      console.error('Failed to save diary entries:', error);
      throw error;
    }
  };

  // Save or update an entry
  const saveEntry = (entry: DiaryEntry) => {
    const existingIndex = entries.findIndex(e => e.date === entry.date);
    let newEntries: DiaryEntry[];

    if (existingIndex >= 0) {
      // Update existing entry
      newEntries = [...entries];
      newEntries[existingIndex] = entry;
    } else {
      // Add new entry
      newEntries = [...entries, entry];
    }

    // Sort entries by date (newest first)
    newEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    saveToStorage(newEntries);
  };

  // Delete an entry
  const deleteEntry = (date: string) => {
    const newEntries = entries.filter(entry => entry.date !== date);
    saveToStorage(newEntries);
  };

  // Get entry by date
  const getEntry = (date: string): DiaryEntry | undefined => {
    return entries.find(entry => entry.date === date);
  };

  // Get entries for a specific month
  const getEntriesForMonth = (year: number, month: number): DiaryEntry[] => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === year && entryDate.getMonth() === month;
    });
  };

  // Get total word count across all entries
  const getTotalWordCount = (): number => {
    return entries.reduce((total, entry) => {
      const wordCount = entry.content.trim().split(/\s+/).filter(word => word.length > 0).length;
      return total + wordCount;
    }, 0);
  };

  // Get writing streak (consecutive days with entries)
  const getWritingStreak = (): number => {
    if (entries.length === 0) return 0;

    const sortedEntries = [...entries].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Check if there's an entry for today or yesterday
    const firstEntryDate = new Date(sortedEntries[0].date);
    firstEntryDate.setHours(0, 0, 0, 0);
    
    const daysDiff = Math.floor((currentDate.getTime() - firstEntryDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > 1) {
      // No entry for today or yesterday, streak is broken
      return 0;
    }

    // Start counting streak
    for (let i = 0; i < sortedEntries.length; i++) {
      const entryDate = new Date(sortedEntries[i].date);
      entryDate.setHours(0, 0, 0, 0);
      
      const expectedDate = new Date(currentDate);
      expectedDate.setDate(expectedDate.getDate() - streak);
      
      if (entryDate.getTime() === expectedDate.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  // Export all entries as JSON
  const exportEntries = (): string => {
    return JSON.stringify(entries, null, 2);
  };

  // Import entries from JSON
  const importEntries = (jsonData: string): void => {
    try {
      const importedEntries = JSON.parse(jsonData) as DiaryEntry[];
      
      // Validate entries structure
      const validEntries = importedEntries.filter(entry => 
        entry.date && 
        typeof entry.content === 'string' && 
        typeof entry.timestamp === 'number'
      );

      // Merge with existing entries, avoiding duplicates
      const mergedEntries = [...entries];
      
      validEntries.forEach(importedEntry => {
        const existingIndex = mergedEntries.findIndex(e => e.date === importedEntry.date);
        if (existingIndex >= 0) {
          // Update existing entry if imported one is newer
          if (importedEntry.timestamp > mergedEntries[existingIndex].timestamp) {
            mergedEntries[existingIndex] = importedEntry;
          }
        } else {
          mergedEntries.push(importedEntry);
        }
      });

      // Sort and save
      mergedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      saveToStorage(mergedEntries);
      
    } catch (error) {
      console.error('Failed to import diary entries:', error);
      throw new Error('Invalid diary data format');
    }
  };

  return {
    entries,
    loading,
    saveEntry,
    deleteEntry,
    getEntry,
    getEntriesForMonth,
    getTotalWordCount,
    getWritingStreak,
    exportEntries,
    importEntries
  };
}