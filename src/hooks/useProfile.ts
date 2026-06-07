import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../types';
import { STORAGE_KEYS } from '../utils/tokens';

const PROFILE_KEY = STORAGE_KEYS.PROFILE;

const DEFAULT_PROFILE: UserProfile = {
  id: '',
  name: '',
  course: '',
  countryOfOrigin: '',
  interests: [],
  onboardingComplete: false,
  showNameToOthers: false,
  allowMessages: false,
};

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(PROFILE_KEY);
        if (raw) setProfile(JSON.parse(raw));
      } catch (e) {
        console.warn('Failed to load profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const next = { ...profile, ...updates };
    setProfile(next);
    try {
      await AsyncStorage.setItem(PROFILE_KEY, JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to save profile', e);
    }
  }, [profile]);

  const clearProfile = useCallback(async () => {
    setProfile(DEFAULT_PROFILE);
    await AsyncStorage.removeItem(PROFILE_KEY);
  }, []);

  return { profile, loading, saveProfile, clearProfile };
}
