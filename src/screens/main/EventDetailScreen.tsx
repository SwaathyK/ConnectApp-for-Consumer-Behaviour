import React from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, StatusBar,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { useRSVPContext as useRSVP } from '../../context/RSVPContext';
import { useTheme } from '../../context/ThemeContext';
import { Event, RSVPStatus } from '../../types';
import { scheduleMorningReminder } from '../../utils/notifications';
import { COLOR, FONTS, TYPE } from '../../utils/tokens';
import { formatDateLong, getRelativeDay, formatShortTime } from '../../utils/format';
import { getEventImage } from '../../data/eventImages';

// ── Theme palette (mirrors MyWarwickEventCard) ────────────────────────────────

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

// ── Types ─────────────────────────────────────────────────────────────────────

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<{ EventDetail: { event: Event } }, 'EventDetail'>;
};

// ── Sub-components ────────────────────────────────────────────────────────────

function AvatarProofRow({
  count, seed, label, color, proofBg,
}: { count: number; seed: number; label: string; color: string; proofBg: string }) {
  const shown = Math.min(3, count);
  const overflow = count > 3 ? count - 3 : 0;
  const shades = AVATAR_SHADES[color] ?? [color];
  return (
    <View style={[av.box, { backgroundColor: proofBg }]}>
      <View style={av.stack}>
        {Array.from({ length: shown }).map((_, i) => (
          <View
            key={i}
            style={[av.avatar, {
              backgroundColor: shades[i % shades.length],
              marginLeft: i === 0 ? 0 : -8,
              zIndex: 10 - i,
            }]}
          >
            <Text style={av.avatarText}>{AVATAR_POOL[(seed + i) % AVATAR_POOL.length]}</Text>
          </View>
        ))}
        {overflow > 0 && (
          <View style={[av.avatar, { backgroundColor: '#ECECEC', marginLeft: -8, zIndex: 0 }]}>
            <Text style={[av.avatarText, { color: '#666' }]}>+{overflow}</Text>
          </View>
        )}
      </View>
      <Text style={[av.label, { color }]}>{count} {label}</Text>
    </View>
  );
}

// ── 4-button RSVP grid ────────────────────────────────────────────────────────

const RSVP_BUTTONS: Array<{
  label: string;
  sub: string;
  target: RSVPStatus;
}> = [
  { label: 'I might go',    sub: 'Currently selected', target: 'interested' },
  { label: "I'm going",     sub: 'Confirm your spot',  target: 'confirmed'  },
  { label: 'Not for me',    sub: 'Skip this one',      target: 'skipped'    },
  { label: 'Save for later',sub: 'Remind me again',    target: 'saved'      },
];

function RSVPGrid({
  status, onRSVP, accent,
}: { status: RSVPStatus; onRSVP: (s: RSVPStatus) => void; accent: string }) {
  return (
    <View style={rg.grid}>
      {[0, 1].map((row) => (
        <View key={row} style={rg.row}>
          {[0, 1].map((col) => {
            const btn = RSVP_BUTTONS[row * 2 + col];
            const isSelected = status === btn.target;
            return (
              <TouchableOpacity
                key={btn.label}
                style={[rg.btn, isSelected && { borderColor: accent, borderWidth: 2 }]}
                onPress={() => onRSVP(isSelected ? null : btn.target)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
                accessibilityLabel={`${btn.label}. ${btn.sub}.`}
              >
                <Text style={[rg.label, isSelected && { color: accent }]}>{btn.label}</Text>
                <Text style={[rg.sub, isSelected && { color: accent, opacity: 0.8 }]}>{btn.sub}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Screen ────────────────────────────────────────────────────────────────────

export default function EventDetailScreen({ navigation, route }: Props) {
  const { event }          = route.params;
  const { getStatus, setRSVP } = useRSVP();
  const { isMyWarwick }    = useTheme();
  const insets             = useSafeAreaInsets();
  const status             = getStatus(event.id);
  const tc                 = CARD_THEMES[event.cardTheme];

  const handleRSVP = async (s: RSVPStatus) => {
    await setRSVP(event.id, s);
    if (s === 'interested' || s === 'confirmed') {
      await scheduleMorningReminder(event, event.coursemateCount);
    }
  };

  // ── MyWarwick detail ──────────────────────────────────────────────────────
  if (isMyWarwick) {
    const dayLabel  = getRelativeDay(event.date);
    const timeLabel = formatShortTime(event.time);
    const metaLine  = `${dayLabel} · ${timeLabel} · ${event.location}${event.isFree ? ' · Free' : ''}`;
    const seed      = parseInt(event.id, 10) || 0;
    const showCountry = event.badge.toLowerCase().includes('country') && event.countryMatchCount > 0;

    return (
      <View style={mw.root}>
        <StatusBar barStyle="light-content" />

        {/* Accent-coloured top bar — extends into the status-bar area */}
        <SafeAreaView edges={['top']} style={[mw.topBar, { backgroundColor: tc.accent }]}>
          <TouchableOpacity
            style={mw.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <View style={mw.backInner}>
              <Ionicons name="arrow-back" size={20} color="#FFF" />
              <Text style={mw.backText}>Back</Text>
            </View>
          </TouchableOpacity>
        </SafeAreaView>

        {/* Scrollable content */}
        <ScrollView
          style={mw.scroll}
          contentContainerStyle={mw.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Image area */}
          <View style={[mw.imageArea, { backgroundColor: tc.imageBg }]}>
            {getEventImage(event.id) ? (
              <Image source={getEventImage(event.id)!} style={mw.image} resizeMode="cover" />
            ) : (
              <Ionicons
                name={CAT_ICONS[event.category] ?? 'ellipse-outline'}
                size={56}
                color={tc.accent}
                style={mw.imageIcon}
              />
            )}
          </View>

          <View style={mw.body}>
            {/* Badge */}
            <View style={[mw.badge, { backgroundColor: tc.accent }]}>
              <Text style={mw.badgeText}>{event.badge}</Text>
            </View>

            {/* Title */}
            <Text style={mw.title}>{event.title}</Text>

            {/* Meta */}
            <View style={mw.metaRow}>
          <Ionicons name="time-outline" size={14} color="#888" />
          <Text style={mw.meta}>{metaLine}</Text>
        </View>

            {/* Social proof */}
            {showCountry ? (
              <AvatarProofRow
                count={event.countryMatchCount} seed={seed + 2}
                label="from your country are going" color={tc.accent} proofBg={tc.proofBg}
              />
            ) : (
              <>
                {event.coursemateCount > 0 && (
                  <AvatarProofRow
                    count={event.coursemateCount} seed={seed}
                    label="from your course are going" color={tc.accent} proofBg={tc.proofBg}
                  />
                )}
                {event.interestMatchCount > 0 && (
                  <AvatarProofRow
                    count={event.interestMatchCount} seed={seed + 5}
                    label="share your interests" color={tc.accent} proofBg={tc.proofBg}
                  />
                )}
              </>
            )}

            {/* Description */}
            <Text style={mw.description}>{event.description}</Text>

            {/* Organiser */}
            <Text style={mw.organiser}>Organised by {event.organiser}</Text>
          </View>
        </ScrollView>

        {/* Fixed RSVP footer — tab bar is hidden on this screen, so only clear the home indicator */}
        <View style={[mw.footer, { paddingBottom: insets.bottom + 12 }]}>
          <RSVPGrid status={status} onRSVP={handleRSVP} accent={tc.accent} />
        </View>
      </View>
    );
  }

  // ── Editorial detail ──────────────────────────────────────────────────────
  const isInterested = status === 'interested';

  return (
    <SafeAreaView style={ed.safe}>
      <ScrollView contentContainerStyle={ed.scroll} showsVerticalScrollIndicator={false}>

        <TouchableOpacity
          style={ed.backBtn}
          onPress={() => navigation.goBack()}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={ed.backText}>Back</Text>
        </TouchableOpacity>

        <View style={ed.categoryRow}>
          <View style={[ed.categoryDot, { backgroundColor: event.coverColor }]} />
          <Text style={ed.category}>{event.category.toUpperCase()}</Text>
        </View>
        <Text style={ed.title}>{event.title}</Text>
        <Text style={ed.organiser}>by {event.organiser}</Text>

        <View style={ed.rule} />

        <View style={ed.metaBlock}>
          <View style={ed.metaRow}>
            <Text style={ed.metaLabel}>When</Text>
            <Text style={ed.metaValue}>{formatDateLong(event.date)}, {event.time}</Text>
          </View>
          <View style={ed.metaRow}>
            <Text style={ed.metaLabel}>Where</Text>
            <Text style={ed.metaValue}>{event.location}</Text>
          </View>
        </View>

        <View style={ed.rule} />

        <Text style={ed.description}>{event.description}</Text>

        <View style={ed.rule} />

        {(event.coursemateCount > 0 || event.interestMatchCount > 0) && (
          <View style={ed.socialBlock}>
            <Text style={ed.socialLabel}>WHO IS GOING</Text>
            {event.coursemateCount > 0 && (
              <Text style={ed.socialLine}>
                <Text style={ed.socialHighlight}>{event.coursemateCount} people</Text>
                {' from your course are going'}
              </Text>
            )}
            {event.interestMatchCount > 0 && (
              <Text style={ed.socialLine}>
                <Text style={ed.socialHighlight}>{event.interestMatchCount} people</Text>
                {' who share your interests are going'}
              </Text>
            )}
            <Text style={ed.anonNote}>Attendance is anonymous by default.</Text>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky footer */}
      <View style={ed.footer}>
        {status !== 'skipped' ? (
          <View style={ed.footerInner}>
            <TouchableOpacity
              style={[ed.primaryBtn, isInterested && ed.primaryBtnActive]}
              onPress={() => handleRSVP(isInterested ? null : 'interested')}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityState={{ selected: isInterested }}
            >
              <Text style={[ed.primaryBtnText, isInterested && ed.primaryBtnTextActive]}>
                I might go
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={ed.skipBtn}
              onPress={() => handleRSVP('skipped')}
              accessibilityRole="button"
            >
              <Text style={ed.skipBtnText}>Not for me</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={ed.skipBtn} onPress={() => handleRSVP(null)}>
            <Text style={ed.skipBtnText}>Skipped  ·  undo</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

// ── Avatar proof row styles ───────────────────────────────────────────────────

const av = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    padding: 10,
    gap: 10,
  },
  stack: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  avatarText: { fontSize: 9, fontWeight: '700', color: '#FFF', letterSpacing: -0.3 },
  label: { fontSize: 14, fontWeight: '600', flex: 1 },
});

// ── RSVP grid styles ──────────────────────────────────────────────────────────

const rg = StyleSheet.create({
  grid: { gap: 10 },
  row: { flexDirection: 'row', gap: 10 },
  btn: {
    flex: 1,
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
    gap: 3,
  },
  label: { fontSize: 14, fontWeight: '700', color: '#1C1C1E', textAlign: 'center' },
  sub: { fontSize: 12, color: '#888', textAlign: 'center' },
});

// ── MyWarwick styles ──────────────────────────────────────────────────────────

const mw = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#FFF' },
  topBar: { paddingBottom: 4 },
  backBtn: { paddingHorizontal: 16, paddingVertical: 10 },
  backInner: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  backText: { fontSize: 15, color: '#FFF', fontWeight: '500' },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },

  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 200 },

  imageArea: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: { width: '100%', height: '100%' },
  imageIcon: { opacity: 0.55 },

  body: { padding: 20, gap: 12 },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginBottom: 2,
  },
  badgeText: { fontSize: 11, fontWeight: '700', color: '#FFF', letterSpacing: 0.2 },
  title: { fontSize: 22, fontWeight: '800', color: '#1C1C1E', lineHeight: 28, letterSpacing: -0.3 },
  meta: { fontSize: 14, color: '#666', lineHeight: 20 },
  description: { fontSize: 15, color: '#444', lineHeight: 24, marginTop: 4 },
  organiser: { fontSize: 13, color: '#999', fontStyle: 'italic' },

  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#EBEBEB',
    padding: 16,
  },
});

// ── Editorial styles ──────────────────────────────────────────────────────────

const ed = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  scroll: { padding: 24, paddingBottom: 40 },
  backBtn: { marginBottom: 28 },
  backText: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textMuted },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 12 },
  categoryDot: { width: 7, height: 7, borderRadius: 3.5 },
  category: { fontFamily: FONTS.body, fontSize: TYPE.xs, color: COLOR.textMuted, letterSpacing: 1.5 },
  title: { fontFamily: FONTS.heading, fontSize: TYPE['2xl'], color: COLOR.textPrimary, letterSpacing: -0.5, lineHeight: 40, marginBottom: 6 },
  organiser: { fontFamily: FONTS.bodyItalic, fontSize: TYPE.base, color: COLOR.textMuted, marginBottom: 24 },
  rule: { height: 1, backgroundColor: COLOR.borderSubtle, marginVertical: 24 },
  metaBlock: { gap: 14 },
  metaRow: { flexDirection: 'row', gap: 20 },
  metaLabel: { fontFamily: FONTS.body, fontSize: TYPE.xs, color: COLOR.textMuted, textTransform: 'uppercase', letterSpacing: 0.8, width: 48, paddingTop: 2 },
  metaValue: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textSecondary, flex: 1, lineHeight: 24 },
  description: { fontFamily: FONTS.body, fontSize: TYPE.md, color: COLOR.textSecondary, lineHeight: 28 },
  socialBlock: { gap: 10 },
  socialLabel: { fontFamily: FONTS.body, fontSize: TYPE.xs, color: COLOR.textMuted, letterSpacing: 1.5, marginBottom: 4 },
  socialLine: { fontFamily: FONTS.body, fontSize: TYPE.md, color: COLOR.textSecondary, lineHeight: 26 },
  socialHighlight: { fontFamily: FONTS.bodySemi, color: COLOR.textPrimary },
  anonNote: { fontFamily: FONTS.bodyItalic, fontSize: TYPE.sm, color: COLOR.textMuted, marginTop: 8 },
  footer: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: COLOR.bg, borderTopWidth: 1, borderTopColor: COLOR.borderSubtle, padding: 20 },
  footerInner: { gap: 4 },
  primaryBtn: { borderRadius: 4, paddingVertical: 16, alignItems: 'center', borderWidth: 1, borderColor: COLOR.borderDefault },
  primaryBtnActive: { borderColor: COLOR.accent, backgroundColor: COLOR.accentSoft },
  primaryBtnText: { fontFamily: FONTS.bodySemi, fontSize: TYPE.md, color: COLOR.textMuted },
  primaryBtnTextActive: { color: COLOR.accent },
  skipBtn: { paddingVertical: 12, alignItems: 'center' },
  skipBtnText: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textDisabled },
});
