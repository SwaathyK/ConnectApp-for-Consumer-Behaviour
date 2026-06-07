# Connect

A mobile-app prototype for the University of Warwick, built to tackle **student loneliness** by nudging first-year and postgraduate students to attend social events. Connect is designed as a section within the existing Warwick SU app — not a standalone product.

> Built for a Consumer Behaviour group project. It demonstrates three behavioural nudges in a working React Native app.

---

## The idea

Universities run dozens of events a week that go half-empty — not because students don't know about them, but because of psychological barriers (social uncertainty, choice overload, present bias). Connect lowers those barriers with three nudges:

| Nudge | Barrier | How the app addresses it |
|-------|---------|--------------------------|
| **1 — Social proof** | Social uncertainty | Shows "34 from your course are going · 11 share your interests" so peer behaviour is visible |
| **2 — Personalised ranking** | Choice overload | Ranks and groups events by social relevance, so the app does the sorting |
| **3 — Soft RSVP + reminder** | Present bias | A low-effort "I might go" tap, plus a morning-of notification that shortens the distance to the payoff |

The full reasoning behind every screen and component is in [`design-rationale.txt`](./design-rationale.txt).

---

## Features

- **5-step onboarding** — collects only what the nudges need (department, country, interests), privacy-first
- **Personalised feed** — ranked + sectioned ("Most relevant to you" / "Everything else"), with a sort toggle so nothing is ever hidden
- **Rich event cards** — photo, social proof with avatar stacks, momentum signal ("8 joined today"), and a soft RSVP
- **Soft RSVP states** — "I might go" / "I'm going" / "Not for me" / "Save for later"
- **Morning notification screen** — the present-bias nudge
- **People tab** — see who's going (contact is opt-in)
- **Profile** — edit details/interests, privacy toggles (name sharing & messaging, both off by default)
- **Two themes** — *MyWarwick* (primary; purple, system font) and *Editorial* (backup; serif), switchable in Profile
- **Anxiety-safe by design** — no scarcity countdowns, leaderboards, visible flaking, or raw crowd sizes

---

## Tech stack

- **Expo** SDK 54 / **React Native** 0.77 / **TypeScript**
- **React Navigation** (bottom tabs + native stack)
- **AsyncStorage** for local persistence (profile, RSVPs, theme)
- **@expo/vector-icons** (Ionicons) for all iconography
- **expo-linear-gradient** for card/image gradients

This is a front-end prototype — all data is local mock data; there is no backend.

---

## Getting started

**Prerequisites:** [Node.js](https://nodejs.org/) (LTS) and the Expo tooling (`npx` is enough; no global install required). To run on a device, install **Expo Go** from the App Store / Play Store.

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npm start          # or: npx expo start
```

Then scan the QR code with Expo Go, or launch a simulator:

```bash
npm run ios        # iOS simulator (macOS)
npm run android    # Android emulator
npm run web        # web preview
```

---

## Project structure

```
ConnectApp/
├── App.tsx                     # Root: fonts, providers, navigation
├── assets/
│   └── events/                 # Event photos (1.jpg … 22.jpg) + image prompts
├── src/
│   ├── components/             # MyWarwickEventCard, EventCard, ProgressDots
│   ├── context/                # ThemeContext, RSVPContext
│   ├── data/                   # mockEvents, options, eventImages
│   ├── hooks/                  # useProfile, useRSVP, useNudgeRanking
│   ├── navigation/             # OnboardingNavigator, MainNavigator
│   ├── screens/
│   │   ├── onboarding/         # Welcome, Name, Course, Country, Interests
│   │   └── main/               # Feed, EventDetail, Notification, People, Saved, Profile
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # tokens, mywarwickTokens, format, notifications
└── design-rationale.txt        # Why each feature exists (nudges + design principles)
```

---

## Data & persistence

- **Events:** 22 mock events in `src/data/mockEvents.ts`, each with social-proof counts, a badge, and a category.
- **Ranking:** `src/hooks/useNudgeRanking.ts` scores events by coursemate count, interest match, country match, and time proximity.
- **Storage:** profile, RSVP state, and theme choice are saved to AsyncStorage and restored on launch.

---

## Notes & limitations

- **Prototype only** — mock data, no server, no real authentication.
- **Notifications** are stubbed for Expo Go; the morning-of nudge is shown as an in-app screen (the *Alerts* tab) rather than a real push.
- **Chat / messaging** is intentionally a stub — the UI hooks exist, but the feature is out of scope for this prototype.

---

## Credits

University of Warwick — Consumer Behaviour group project. App prototype by the team.
