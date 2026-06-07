// ─── User / Profile ──────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  course: string;           // department e.g. 'Computer Science'
  countryOfOrigin: string;
  interests: string[];
  onboardingComplete: boolean;
  showNameToOthers: boolean; // anonymity toggle — false by default
  allowMessages: boolean;    // "can choose to be contacted" — false by default
}

// ─── Events ──────────────────────────────────────────────────────────────────

export type RSVPStatus = 'interested' | 'confirmed' | 'skipped' | 'saved' | null;

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;          // ISO string
  time: string;          // e.g. "6:00 PM"
  location: string;
  category: EventCategory;
  coverColor: string;    // fallback background colour
  organiser: string;
  isFree: boolean;

  // Nudge data
  totalAttendees: number;
  coursemateCount: number;     // Nudge 1: social proof by course
  interestMatchCount: number;  // Nudge 1: social proof by interest
  countryMatchCount: number;   // Nudge 1: social proof by country
  momentumCount: number;       // "X joined today" signal
  relevanceScore: number;      // Nudge 2: ranking score (0–1)

  // Display
  badge: string;               // e.g. "Top pick for you", "Popular tonight"
  cardTheme: 'purple' | 'green' | 'warm';
  imageUri?: string;           // asset URI once images are provided
}

export type EventCategory =
  | 'social'
  | 'academic'
  | 'sports'
  | 'arts'
  | 'food'
  | 'careers'
  | 'wellbeing'
  | 'international';

// ─── RSVP Store ──────────────────────────────────────────────────────────────

export type RSVPMap = Record<string, RSVPStatus>;

// ─── Navigation ──────────────────────────────────────────────────────────────

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Events: undefined;
  People: undefined;
  Alerts: undefined;
  Profile: undefined;
};

export type FeedStackParamList = {
  EventFeed: undefined;
  EventDetail: { event: Event };
};
