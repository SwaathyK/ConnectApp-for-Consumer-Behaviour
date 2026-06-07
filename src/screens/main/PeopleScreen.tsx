import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  StatusBar, TouchableOpacity, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_EVENTS } from '../../data/mockEvents';
import { useRSVPContext as useRSVP } from '../../context/RSVPContext';
import { MW_LAYOUT } from '../../utils/mywarwickTokens';

// ── Data helpers ──────────────────────────────────────────────────────────────

const AVATAR_POOL = ['JL','SK','MR','CW','NP','RL','TP','AL','AM','KT','BK','PO'];

const NAME_MAP: Record<string, string> = {
  JL: 'Jamie L.',  SK: 'Sam K.',    MR: 'Maya R.',
  CW: 'Chris W.',  NP: 'Nadia P.',  RL: 'Ryan L.',
  TP: 'Tasha P.',  AL: 'Alex L.',   AM: 'Amir M.',
  KT: 'Kai T.',    BK: 'Ben K.',    PO: 'Priya O.',
};

const CARD_THEMES = {
  purple: { accent: '#6B4FA8', bg: 'rgba(107,79,168,0.07)', avatarShades: ['#6B4FA8', '#8268BD', '#54397F'] },
  green:  { accent: '#2D7D52', bg: 'rgba(45,125,82,0.07)',  avatarShades: ['#2D7D52', '#46996B', '#1F5C3B'] },
  warm:   { accent: '#C4714A', bg: 'rgba(196,113,74,0.07)', avatarShades: ['#C4714A', '#D78A65', '#A35A39'] },
} as const;

const PURPLE = '#6B4FA8';

// ── Types ─────────────────────────────────────────────────────────────────────

interface PersonEntry {
  id: string;
  initials: string;
  color: string;
  name: string;
  eventTitle: string;
  cardTheme: 'purple' | 'green' | 'warm';
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function PeopleScreen() {
  const { rsvpMap } = useRSVP();
  const insets = useSafeAreaInsets();

  const myEvents = MOCK_EVENTS.filter(
    (e) => rsvpMap[e.id] === 'interested' || rsvpMap[e.id] === 'confirmed',
  );

  // Generate 3 people per RSVP'd event from the social proof data
  const people: PersonEntry[] = myEvents.flatMap((event) => {
    const seed = parseInt(event.id, 10) || 0;
    const count = Math.min(3, event.coursemateCount);
    const shades = CARD_THEMES[event.cardTheme].avatarShades;
    return Array.from({ length: count }, (_, i) => {
      const initials = AVATAR_POOL[(seed + i) % AVATAR_POOL.length];
      return {
        id: `${event.id}-${i}`,
        initials,
        color: shades[i % shades.length],
        name: NAME_MAP[initials] ?? 'A Student',
        eventTitle: event.title,
        cardTheme: event.cardTheme,
      };
    });
  });

  const handleSayHi = (name: string, eventTitle: string) => {
    Alert.alert(
      'Coming soon',
      `Direct messaging will be available when Connect launches. ${name} and others going to "${eventTitle}" can already see you might attend.`,
      [{ text: 'Got it' }],
    );
  };

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple header */}
      <SafeAreaView edges={['top']} style={s.headerSafe}>
        <View style={s.header}>
          <Text style={s.title}>People</Text>
          <Text style={s.sub}>
            {myEvents.length > 0
              ? 'From events you might attend'
              : 'RSVP to events to see who else is going'}
          </Text>
        </View>
      </SafeAreaView>

      {/* Body */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: MW_LAYOUT.tabBarClearance + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {people.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <Text style={s.sectionLabel}>GOING TO YOUR EVENTS</Text>
            {people.map((person) => (
              <PersonCard
                key={person.id}
                person={person}
                onSayHi={() => handleSayHi(person.name, person.eventTitle)}
              />
            ))}

            {/* Concept note */}
            <View style={s.conceptNote}>
              <Text style={s.conceptIcon}>🔒</Text>
              <Text style={s.conceptText}>
                Names are only visible when someone opts in to sharing.
                Everyone still counts toward the "going" total anonymously.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

// ── Person card ───────────────────────────────────────────────────────────────

function PersonCard({
  person, onSayHi,
}: { person: PersonEntry; onSayHi: () => void }) {
  return (
    <View style={pc.card}>
      <View style={[pc.avatar, { backgroundColor: person.color }]}>
        <Text style={pc.avatarText}>{person.initials}</Text>
      </View>

      <View style={pc.info}>
        <Text style={pc.name}>{person.name}</Text>
        <Text style={pc.event} numberOfLines={1}>
          Also going to {person.eventTitle}
        </Text>
      </View>

      <TouchableOpacity
        style={pc.sayHiBtn}
        onPress={onSayHi}
        activeOpacity={0.75}
        accessibilityRole="button"
        accessibilityLabel={`Say hi to ${person.name}`}
      >
        <Text style={pc.sayHiText}>Say hi</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <View style={es.container}>
      <Ionicons name="people-outline" size={52} color="#9B8BC0" style={es.icon} />
      <Text style={es.title}>No one here yet</Text>
      <Text style={es.sub}>
        Tap "I might go" on events in your feed and you'll see who else is going here.
      </Text>

      {/* Feature preview cards */}
      <View style={es.previewBox}>
        <Text style={es.previewLabel}>WHAT YOU'LL SEE</Text>
        {['Jamie L. · Postgrad Mixer', 'Sam K. · Board Game Night', 'Maya R. · Film Society'].map((item) => (
          <View key={item} style={es.previewRow}>
            <View style={es.previewDot} />
            <Text style={es.previewText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },
  headerSafe: { backgroundColor: PURPLE },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 4 },
  title: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  sub: { fontSize: 14, color: 'rgba(255,255,255,0.78)' },
  scroll: { flex: 1, backgroundColor: MW_LAYOUT.contentBg },
  scrollContent: { padding: 16 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  conceptNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
  },
  conceptIcon: { fontSize: 16, marginTop: 1 },
  conceptText: { flex: 1, fontSize: 13, color: '#666', lineHeight: 20 },
});

const pc = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarText: { fontSize: 14, fontWeight: '700', color: '#FFF' },
  info: { flex: 1, gap: 3 },
  name: { fontSize: 15, fontWeight: '600', color: '#1C1C1E' },
  event: { fontSize: 12, color: '#888' },
  sayHiBtn: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sayHiText: { fontSize: 13, fontWeight: '600', color: PURPLE },
});

const es = StyleSheet.create({
  container: { alignItems: 'center', paddingTop: 48, paddingHorizontal: 24, gap: 12 },
  icon: {},
  title: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', textAlign: 'center' },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  previewBox: {
    width: '100%',
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  previewLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#BBB',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  previewDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C3B9DC',
  },
  previewText: { fontSize: 14, color: '#8A8A8E' },
});
