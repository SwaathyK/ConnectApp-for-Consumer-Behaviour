import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  StatusBar, Image,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_EVENTS } from '../../data/mockEvents';
import { useRSVPContext as useRSVP } from '../../context/RSVPContext';
import { useProfile } from '../../hooks/useProfile';
import { Event, RSVPStatus } from '../../types';
import { formatShortTime, todayISOString } from '../../utils/format';
import { scheduleMorningReminder } from '../../utils/notifications';
import { MW_LAYOUT } from '../../utils/mywarwickTokens';
import { getEventImage } from '../../data/eventImages';

// ── Theme palette ──────────────────────────────────────────────────────────────

const CARD_THEMES = {
  purple: { imageBg: '#EDE8FF', accent: '#6B4FA8', proofBg: 'rgba(107,79,168,0.09)' },
  green:  { imageBg: '#E6F5EE', accent: '#2D7D52', proofBg: 'rgba(45,125,82,0.09)'  },
  warm:   { imageBg: '#FFF0E6', accent: '#C4714A', proofBg: 'rgba(196,113,74,0.09)' },
} as const;

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const CAT_ICONS: Record<string, IoniconsName> = {
  social:       'people-outline',
  academic:     'book-outline',
  sports:       'barbell-outline',
  arts:         'film-outline',
  food:         'restaurant-outline',
  careers:      'briefcase-outline',
  wellbeing:    'leaf-outline',
  international:'globe-outline',
};

const AVATAR_POOL = ['JL','SK','MR','CW','NP','RL','TP','AL','AM','KT','BK','PO'];

// Tonal shades per accent — cohesive same-hue family, never rainbow
const AVATAR_SHADES: Record<string, string[]> = {
  '#6B4FA8': ['#6B4FA8', '#8268BD', '#54397F'],
  '#2D7D52': ['#2D7D52', '#46996B', '#1F5C3B'],
  '#C4714A': ['#C4714A', '#D78A65', '#A35A39'],
};

const PURPLE = '#6B4FA8';

// ── Helpers ────────────────────────────────────────────────────────────────────

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getCurrentTimeStr(): string {
  const now = new Date();
  const h = now.getHours();
  const m = now.getMinutes();
  const suffix = h >= 12 ? 'pm' : 'am';
  const h12 = h % 12 || 12;
  return m === 0 ? `${h12}${suffix}` : `${h12}:${String(m).padStart(2, '0')}${suffix}`;
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function NotificationCard({
  event, status, timeStr, onConfirm, onDismiss,
}: {
  event: Event;
  status: RSVPStatus;
  timeStr: string;
  onConfirm: () => void;
  onDismiss: () => void;
}) {
  const tc = CARD_THEMES[event.cardTheme];
  const isConfirmed = status === 'confirmed';
  const timeLabel   = formatShortTime(event.time);

  const message = isConfirmed
    ? `Tonight: ${event.title} at ${timeLabel}. You're going — ${event.coursemateCount} from your course will be there!`
    : `Tonight: ${event.title} at ${timeLabel}. You said you might go — ${event.coursemateCount} from your course are attending. Tap to confirm your spot.`;

  return (
    <View style={nc.card}>
      {/* Header row */}
      <View style={nc.cardHeader}>
        <Ionicons name="notifications" size={18} color="#6B4FA8" />
        <Text style={nc.appName}>Connect</Text>
        <Text style={nc.time}>{timeStr}</Text>
      </View>

      {/* Message */}
      <Text style={nc.message}>{message}</Text>

      {/* Actions */}
      {isConfirmed ? (
        <View style={[nc.confirmedBadge, { backgroundColor: tc.accent + '18' }]}>
          <Text style={[nc.confirmedText, { color: tc.accent }]}>✓ You're going!</Text>
        </View>
      ) : (
        <View style={nc.actions}>
          <TouchableOpacity
            style={[nc.confirmBtn, { backgroundColor: tc.accent }]}
            onPress={onConfirm}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Confirm I'm going"
          >
            <Text style={nc.confirmBtnText}>I'm going</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={nc.laterBtn}
            onPress={onDismiss}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Maybe later"
          >
            <Text style={nc.laterBtnText}>Maybe later</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function EventPreviewCard({
  event, onPress,
}: { event: Event; onPress: () => void }) {
  const tc   = CARD_THEMES[event.cardTheme];
  const seed = parseInt(event.id, 10) || 0;
  const shown = Math.min(3, event.coursemateCount);
  const overflow = event.coursemateCount > 3 ? event.coursemateCount - 3 : 0;
  const shades = AVATAR_SHADES[tc.accent] ?? [tc.accent];

  return (
    <TouchableOpacity
      style={ep.card}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`View details for ${event.title}`}
    >
      {/* Image area */}
      <View style={[ep.imageArea, { backgroundColor: tc.imageBg }]}>
        {getEventImage(event.id) ? (
          <Image source={getEventImage(event.id)!} style={ep.image} resizeMode="cover" />
        ) : (
          <Ionicons
            name={CAT_ICONS[event.category] ?? 'ellipse-outline'}
            size={44}
            color={tc.accent}
            style={ep.imageIcon}
          />
        )}
      </View>

      {/* Content */}
      <View style={ep.body}>
        <Text style={ep.title}>{event.title}</Text>
        <View style={ep.metaRow}>
          <Ionicons name="time-outline" size={13} color="#666" />
          <Text style={ep.meta}>Tonight · {formatShortTime(event.time)} · {event.location}{event.isFree ? ' · Free' : ''}</Text>
        </View>

        {/* Social proof row */}
        {event.coursemateCount > 0 && (
          <View style={[ep.proofRow, { backgroundColor: tc.proofBg }]}>
            <View style={ep.avatarStack}>
              {Array.from({ length: shown }).map((_, i) => (
                <View
                  key={i}
                  style={[ep.avatar, {
                    backgroundColor: shades[i % shades.length],
                    marginLeft: i === 0 ? 0 : -8,
                    zIndex: 10 - i,
                  }]}
                >
                  <Text style={ep.avatarText}>{AVATAR_POOL[(seed + i) % AVATAR_POOL.length]}</Text>
                </View>
              ))}
              {overflow > 0 && (
                <View style={[ep.avatar, { backgroundColor: '#ECECEC', marginLeft: -8, zIndex: 0 }]}>
                  <Text style={[ep.avatarText, { color: '#666' }]}>+{overflow}</Text>
                </View>
              )}
            </View>
            <Text style={[ep.proofLabel, { color: tc.accent }]}>
              {event.coursemateCount} from your course are going
            </Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <View style={es.container}>
      <Ionicons name="moon-outline" size={48} color="#999" style={es.icon} />
      <Text style={es.title}>All clear for tonight</Text>
      <Text style={es.sub}>
        No events you've said maybe to are happening today.
        Browse the feed to discover what's on.
      </Text>
      <TouchableOpacity
        style={es.btn}
        onPress={onBrowse}
        accessibilityRole="button"
        accessibilityLabel="Browse events"
      >
        <Text style={es.btnText}>Browse events →</Text>
      </TouchableOpacity>
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

type Props = { navigation: NativeStackNavigationProp<any> };

export default function NotificationScreen({ navigation }: Props) {
  const { rsvpMap, setRSVP } = useRSVP();
  const { profile }          = useProfile();
  const insets               = useSafeAreaInsets();
  const [dismissed, setDismissed] = useState<string[]>([]);

  const todayStr    = todayISOString();
  const timeStr     = getCurrentTimeStr();
  const greeting    = getGreeting();
  const firstName   = profile.name ? profile.name.split(' ')[0] : 'there';

  const todayEvents = MOCK_EVENTS.filter(
    (e) => e.date === todayStr
        && (rsvpMap[e.id] === 'interested' || rsvpMap[e.id] === 'confirmed')
        && !dismissed.includes(e.id),
  );

  const handleConfirm = async (event: Event) => {
    await setRSVP(event.id, 'confirmed');
    await scheduleMorningReminder(event, event.coursemateCount);
  };

  const handleDismiss = (eventId: string) => {
    setDismissed((prev) => [...prev, eventId]);
  };

  const goToDetail = (event: Event) => {
    navigation.navigate('Home', {
      screen: 'EventDetail',
      params: { event },
    });
  };

  const headerSub = todayEvents.length > 0
    ? `You have ${todayEvents.length} event${todayEvents.length > 1 ? 's' : ''} tonight you might be going to`
    : 'No events tonight — browse to find something';

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple header */}
      <SafeAreaView edges={['top']} style={s.headerSafe}>
        <View style={s.header}>
          <Text style={s.greeting}>{greeting}, {firstName}</Text>
          <Text style={s.headerSub}>{headerSub}</Text>
        </View>
      </SafeAreaView>

      {/* Body */}
      <ScrollView
        style={s.scroll}
        contentContainerStyle={[s.scrollContent, { paddingBottom: MW_LAYOUT.tabBarClearance + insets.bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {todayEvents.length === 0 ? (
          <EmptyState onBrowse={() => navigation.navigate('Home')} />
        ) : (
          todayEvents.map((event) => (
            <View key={event.id} style={s.eventGroup}>
              <NotificationCard
                event={event}
                status={rsvpMap[event.id] ?? null}
                timeStr={timeStr}
                onConfirm={() => handleConfirm(event)}
                onDismiss={() => handleDismiss(event.id)}
              />
              <EventPreviewCard
                event={event}
                onPress={() => goToDetail(event)}
              />
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },
  headerSafe: { backgroundColor: PURPLE },
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 24, gap: 6 },
  greeting: { fontSize: 26, fontWeight: '800', color: '#FFF', letterSpacing: -0.4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 20 },
  scroll: { flex: 1, backgroundColor: MW_LAYOUT.contentBg },
  scrollContent: { padding: 16 },
  eventGroup: { marginBottom: 24, gap: 10 },
});

// Notification card
const nc = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bell: { fontSize: 16 },
  appName: { flex: 1, fontSize: 14, fontWeight: '700', color: '#1C1C1E' },
  time: { fontSize: 13, color: '#999' },
  message: { fontSize: 14, color: '#333', lineHeight: 22 },
  actions: { flexDirection: 'row', gap: 10 },
  confirmBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmBtnText: { color: '#FFF', fontSize: 14, fontWeight: '700' },
  laterBtn: {
    flex: 1,
    minHeight: 44,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#C9C9D0',
  },
  laterBtnText: { color: '#555', fontSize: 14, fontWeight: '500' },
  confirmedBadge: {
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  confirmedText: { fontSize: 14, fontWeight: '700' },
});

// Event preview card
const ep = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  imageArea: {
    height: 130,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  imageIcon: { opacity: 0.55 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  body: { padding: 14, gap: 8 },
  title: { fontSize: 17, fontWeight: '700', color: '#1C1C1E' },
  meta: { fontSize: 13, color: '#666' },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    padding: 8,
    gap: 8,
  },
  avatarStack: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  avatarText: { fontSize: 8, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },
  proofLabel: { fontSize: 13, fontWeight: '600', flex: 1 },
});

// Empty state
const es = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 32,
    gap: 12,
  },
  icon: { marginBottom: 4 },
  title: { fontSize: 20, fontWeight: '700', color: '#1C1C1E', textAlign: 'center' },
  sub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
  btn: {
    marginTop: 8,
    backgroundColor: PURPLE,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  btnText: { color: '#FFF', fontSize: 15, fontWeight: '600' },
});
