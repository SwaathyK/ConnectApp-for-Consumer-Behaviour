import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RSVPMap, RSVPStatus } from '../types';
import { STORAGE_KEYS } from '../utils/tokens';

const RSVP_KEY = STORAGE_KEYS.RSVP;

export function useRSVP() {
  const [rsvpMap, setRsvpMap] = useState<RSVPMap>({});

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem(RSVP_KEY);
      if (raw) setRsvpMap(JSON.parse(raw));
    })();
  }, []);

  const setRSVP = useCallback(async (eventId: string, status: RSVPStatus) => {
    const next = { ...rsvpMap, [eventId]: status };
    setRsvpMap(next);
    await AsyncStorage.setItem(RSVP_KEY, JSON.stringify(next));
  }, [rsvpMap]);

  const getStatus = useCallback(
    (eventId: string): RSVPStatus => rsvpMap[eventId] ?? null,
    [rsvpMap],
  );

  const savedEvents = useCallback(() => {
    return Object.entries(rsvpMap)
      .filter(([, v]) => v === 'interested' || v === 'confirmed' || v === 'saved')
      .map(([k]) => k);
  }, [rsvpMap]);

  return { rsvpMap, setRSVP, getStatus, savedEvents };
}
