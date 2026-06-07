/**
 * Notification utilities — stubbed for Expo Go
 * ─────────────────────────────────────────────────────────────────────────────
 * expo-notifications requires a custom development build in Expo Go SDK 53+.
 * All functions are no-ops here so the rest of the app works in Expo Go.
 *
 * Nudge 3 (present bias) — morning-of reminders — will be wired up properly
 * when building the production / development build via `eas build`.
 */

import { Event } from '../types';

export async function requestNotificationPermission(): Promise<boolean> {
  return false;
}

export async function scheduleMorningReminder(
  _event: Event,
  _coursemateCount: number,
): Promise<string | null> {
  return null;
}

export async function cancelReminder(_notificationId: string): Promise<void> {
  // no-op in Expo Go
}
