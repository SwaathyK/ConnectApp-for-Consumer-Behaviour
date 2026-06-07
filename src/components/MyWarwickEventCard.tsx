import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Event, RSVPStatus } from '../types';
import { getRelativeDay, formatShortTime } from '../utils/format';
import { getEventImage } from '../data/eventImages';

// ── Card theme palettes ────────────────────────────────────────────────────────

type ThemeKey = Event['cardTheme'];

interface ThemePalette {
  imageBg: string;
  accent: string;
  proofBg: string;
  avatarShades: string[]; // tonal variations of the accent — cohesive, not rainbow
}

const THEMES: Record<ThemeKey, ThemePalette> = {
  purple: { imageBg: '#EDE8FF', accent: '#6B4FA8', proofBg: 'rgba(107,79,168,0.09)', avatarShades: ['#6B4FA8', '#8268BD', '#54397F'] },
  green:  { imageBg: '#E6F5EE', accent: '#2D7D52', proofBg: 'rgba(45,125,82,0.09)',  avatarShades: ['#2D7D52', '#46996B', '#1F5C3B'] },
  warm:   { imageBg: '#FFF0E6', accent: '#C4714A', proofBg: 'rgba(196,113,74,0.09)', avatarShades: ['#C4714A', '#D78A65', '#A35A39'] },
};

// ── Avatar helpers ─────────────────────────────────────────────────────────────

const AVATAR_POOL = ['JL','SK','MR','CW','NP','RL','TP','AL','AM','KT','BK','PO'];

function makeAvatars(count: number, seed: number, shades: string[]) {
  const shown = Math.min(3, count);
  const overflow = count > 3 ? count - 3 : 0;
  return {
    avatars: Array.from({ length: shown }, (_, i) => ({
      initials: AVATAR_POOL[(seed + i) % AVATAR_POOL.length],
      color:    shades[i % shades.length],
    })),
    overflow,
  };
}

// ── Category placeholder icons ─────────────────────────────────────────────────

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

// ── Sub-components ─────────────────────────────────────────────────────────────

function AvatarStack({ count, seed, shades }: { count: number; seed: number; shades: string[] }) {
  const { avatars, overflow } = makeAvatars(count, seed, shades);
  return (
    <View style={s.avatarRow}>
      {avatars.map((a, i) => (
        <View
          key={i}
          style={[s.avatar, { backgroundColor: a.color, marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i }]}
        >
          <Text style={s.avatarText}>{a.initials}</Text>
        </View>
      ))}
      {overflow > 0 && (
        <View style={[s.avatar, s.avatarOverflow, { marginLeft: -8, zIndex: 0 }]}>
          <Text style={[s.avatarText, { color: '#666' }]}>+{overflow}</Text>
        </View>
      )}
    </View>
  );
}

function ProofRow({
  count, seed, label, color, shades,
}: { count: number; seed: number; label: string; color: string; shades: string[] }) {
  return (
    <View style={s.proofRow}>
      <AvatarStack count={count} seed={seed} shades={shades} />
      <Text style={[s.proofLabel, { color }]} numberOfLines={1}>
        {count} {label}
      </Text>
    </View>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

interface Props {
  event: Event;
  rsvpStatus: RSVPStatus;
  onPress: () => void;
  onRSVP: (status: RSVPStatus) => void;
  onChat?: () => void;
}

function MyWarwickEventCard({ event, rsvpStatus, onPress, onRSVP, onChat }: Props) {
  const tc = THEMES[event.cardTheme];
  const isInterested = rsvpStatus === 'interested' || rsvpStatus === 'confirmed';
  const isSkipped    = rsvpStatus === 'skipped';
  const seed = parseInt(event.id, 10) || 0;

  const dayLabel  = getRelativeDay(event.date);
  const timeLabel = formatShortTime(event.time);
  const metaLine  = `${dayLabel} · ${timeLabel} · ${event.location}`;

  const showCountry = event.badge.toLowerCase().includes('country') && event.countryMatchCount > 0;

  return (
    <TouchableOpacity
      style={[s.card, isSkipped && s.cardSkipped]}
      onPress={onPress}
      activeOpacity={0.95}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${timeLabel}. ${event.location}.`}
    >
      {/* Image area — badge + title overlaid to save vertical space */}
      <View style={[s.imageArea, { backgroundColor: tc.imageBg }]}>
        {getEventImage(event.id) ? (
          <Image source={getEventImage(event.id)!} style={s.image} resizeMode="cover" />
        ) : (
          <Ionicons
            name={CAT_ICONS[event.category] ?? 'ellipse-outline'}
            size={44}
            color={tc.accent}
            style={s.imageIcon}
          />
        )}

        {/* Badge — top-left over image */}
        <View style={[s.badge, { backgroundColor: tc.accent }]}>
          <Text style={s.badgeText}>{event.badge}</Text>
        </View>

        {/* Momentum — top-right glass pill */}
        {event.momentumCount > 0 && (
          <View style={s.momentumOverlay}>
            <Text style={s.momentumOverlayText}>{event.momentumCount} joined today</Text>
          </View>
        )}

        {/* Bottom scrim — title, free/paid, and meta overlaid */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.85)']}
          style={s.scrim}
          pointerEvents="none"
        >
          <View style={s.titleRow}>
            <Text style={s.titleOverlay} numberOfLines={1}>{event.title}</Text>
            <View style={s.pricePill}>
              <Text style={s.priceText}>{event.isFree ? 'Free' : 'Paid'}</Text>
            </View>
          </View>
          <View style={s.metaRowOverlay}>
            <Ionicons name="time-outline" size={12} color="rgba(255,255,255,0.85)" />
            <Text style={s.metaOverlay} numberOfLines={1}>{metaLine}</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Content */}
      <View style={s.content}>

        {/* Social proof — clean on white */}
        <View style={s.proofBox}>
          {showCountry ? (
            <ProofRow count={event.countryMatchCount} seed={seed + 2} label="from your country are going" color={tc.accent} shades={tc.avatarShades} />
          ) : (
            <>
              {event.coursemateCount > 0 && (
                <ProofRow count={event.coursemateCount} seed={seed} label="from your course are going" color={tc.accent} shades={tc.avatarShades} />
              )}
              {event.interestMatchCount > 0 && (
                <ProofRow count={event.interestMatchCount} seed={seed + 5} label="share your interests" color={tc.accent} shades={tc.avatarShades} />
              )}
            </>
          )}
        </View>

        {/* Actions */}
        {isSkipped ? (
          <View style={s.actionRow}>
            <Text style={s.skippedLabel}>Skipped</Text>
            <TouchableOpacity
              onPress={() => onRSVP(null)}
              hitSlop={{ top: 8, bottom: 8, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Undo skip"
            >
              <Text style={[s.undoText, { color: tc.accent }]}>Undo</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.actionRow}>
            {/* Primary — fills the row, secondary actions are compact icons */}
            <TouchableOpacity
              style={[s.rsvpBtn, { backgroundColor: isInterested ? tc.accent : tc.imageBg }]}
              onPress={() => onRSVP(isInterested ? null : 'interested')}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityState={{ selected: isInterested }}
              accessibilityLabel={isInterested ? 'Remove interest' : 'I might go'}
            >
              {isInterested && <Ionicons name="checkmark" size={17} color="#FFF" />}
              <Text style={[s.rsvpText, { color: isInterested ? '#FFF' : tc.accent }]}>I might go</Text>
            </TouchableOpacity>

            {/* Chat — icon */}
            <TouchableOpacity
              style={s.iconBtn}
              onPress={onChat}
              accessibilityRole="button"
              accessibilityLabel="Chat about this event"
            >
              <Ionicons name="chatbubble-outline" size={18} color="#666" />
            </TouchableOpacity>

            {/* Skip — icon */}
            <TouchableOpacity
              style={s.iconBtn}
              onPress={() => onRSVP('skipped')}
              accessibilityRole="button"
              accessibilityLabel="Skip this event"
            >
              <Ionicons name="close" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}

      </View>
    </TouchableOpacity>
  );
}

export default React.memo(MyWarwickEventCard);

// ── Styles ─────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardSkipped: { opacity: 0.45 },

  // Image area
  imageArea: {
    height: 150,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageIcon: {
    opacity: 0.6,
  },

  // Content
  content: {
    padding: 12,
    gap: 7,
  },

  // Badge — overlaid top-left of image
  badge: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: 0.2,
  },

  // Title + meta overlaid on image over a bottom scrim
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 12,
    paddingTop: 36,
    paddingBottom: 10,
    justifyContent: 'flex-end',
    gap: 3,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  titleOverlay: {
    flexShrink: 1,
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  pricePill: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  priceText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.3,
    color: 'rgba(255,255,255,0.92)',
  },
  metaRowOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaOverlay: {
    flex: 1,
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 16,
  },
  momentumOverlay: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  momentumOverlayText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Social proof — sits directly on the white card
  proofBox: {
    gap: 8,
    marginTop: 2,
  },
  proofRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  avatarOverflow: {
    backgroundColor: '#ECECEC',
  },
  avatarText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },
  proofLabel: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // Action buttons
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  rsvpBtn: {
    flex: 1,
    flexDirection: 'row',
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  rsvpText: {
    fontSize: 15,
    fontWeight: '700',
  },
  iconBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },

  // Skipped state
  skippedLabel: {
    fontSize: 13,
    color: '#999',
    fontStyle: 'italic',
    flex: 1,
  },
  undoText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
