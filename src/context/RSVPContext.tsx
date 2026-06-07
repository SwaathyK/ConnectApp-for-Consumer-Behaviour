import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RSVPMap, RSVPStatus } from '../types';
import { STORAGE_KEYS } from '../utils/tokens';

interface RSVPContextValue {
  rsvpMap: RSVPMap;
  setRSVP: (eventId: string, status: RSVPStatus) => Promise<void>;
  getStatus: (eventId: string) => RSVPStatus;
}

const RSVPContext = createContext<RSVPContextValue | null>(null);

export function RSVPProvider({ children }: { children: React.ReactNode }) {
  const [rsvpMap, setRsvpMap] = useState<RSVPMap>({});

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.RSVP);
      if (raw) setRsvpMap(JSON.parse(raw));
    })();
  }, []);

  const setRSVP = useCallback(async (eventId: string, status: RSVPStatus) => {
    setRsvpMap((prev) => {
      const next = { ...prev, [eventId]: status };
      AsyncStorage.setItem(STORAGE_KEYS.RSVP, JSON.stringify(next));
      return next;
    });
  }, []);

  const getStatus = useCallback(
    (eventId: string): RSVPStatus => rsvpMap[eventId] ?? null,
    [rsvpMap],
  );

  return (
    <RSVPContext.Provider value={{ rsvpMap, setRSVP, getStatus }}>
      {children}
    </RSVPContext.Provider>
  );
}

export function useRSVPContext() {
  const ctx = useContext(RSVPContext);
  if (!ctx) throw new Error('useRSVPContext must be used inside RSVPProvider');
  return ctx;
}
