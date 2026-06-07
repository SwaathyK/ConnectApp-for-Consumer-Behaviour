import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Event, RSVPStatus } from '../types';
import { COLOR, FONTS, TYPE } from '../utils/tokens';
import { formatDateShort } from '../utils/format';

interface Props {
  event: Event;
  rsvpStatus: RSVPStatus;
  onPress: () => void;
  onRSVP: (status: RSVPStatus) => void;
}

function EventCard({ event, rsvpStatus, onPress, onRSVP }: Props) {
  const isInterested = rsvpStatus === 'interested';
  const isSkipped = rsvpStatus === 'skipped';

  if (isSkipped) {
    return (
      <View style={styles.cardSkipped} accessibilityLabel={`${event.title}, skipped`}>
        <View style={styles.bodySkipped}>
          <View style={styles.topRow}>
            <Text style={styles.titleSkipped} numberOfLines={1}>{event.title}</Text>
          </View>
          <Text style={styles.metaSkipped}>{formatDateShort(event.date)}{'  ·  '}{event.time}</Text>
          <View style={styles.skippedFooter}>
            <Text style={styles.skippedState}>You skipped this</Text>
            <TouchableOpacity
              onPress={() => onRSVP(null)}
              accessibilityRole="button"
              accessibilityLabel={`Undo skip — mark ${event.title} as interested instead`}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.undoText}>I might go instead</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`${event.title}. ${formatDateShort(event.date)}, ${event.time}. ${event.location}.${event.coursemateCount > 0 ? ` ${event.coursemateCount} people from your course are going.` : ''}`}
    >
      <View style={styles.body}>
        {/* Category + interested state */}
        <View style={styles.topRow}>
          <View style={styles.categoryRow}>
            <View style={[styles.categoryDot, { backgroundColor: event.coverColor }]} />
            <Text style={styles.category}>{event.category.toUpperCase()}</Text>
          </View>
          {isInterested && <Text style={styles.goingLabel}>Going</Text>}
        </View>

        {/* Title */}
        <Text style={styles.title}>{event.title}</Text>

        {/* Meta */}
        <Text style={styles.meta}>
          {formatDateShort(event.date)}{'  ·  '}{event.time}{'  ·  '}{event.location}
        </Text>

        {/* Social proof */}
        {(event.coursemateCount > 0 || event.interestMatchCount > 0) && (
          <View style={styles.proofRow}>
            {event.coursemateCount > 0 && (
              <Text style={styles.proofText}>{event.coursemateCount} from your course</Text>
            )}
            {event.coursemateCount > 0 && event.interestMatchCount > 0 && (
              <Text style={styles.proofSep}> · </Text>
            )}
            {event.interestMatchCount > 0 && (
              <Text style={styles.proofText}>{event.interestMatchCount} share your interests</Text>
            )}
          </View>
        )}

        {/* RSVP row */}
        <View style={styles.rsvpRow}>
          <TouchableOpacity
            style={[styles.rsvpPrimary, isInterested && styles.rsvpPrimaryActive]}
            onPress={() => onRSVP(isInterested ? null : 'interested')}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={isInterested ? `Remove interest in ${event.title}` : `Mark ${event.title} as interested`}
            accessibilityState={{ selected: isInterested }}
          >
            <Text style={[styles.rsvpPrimaryText, isInterested && styles.rsvpPrimaryTextActive]}>
              I might go
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.rsvpSkip}
            onPress={() => onRSVP('skipped')}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={`Skip ${event.title}`}
          >
            <Text style={styles.rsvpSkipText}>Skip</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default React.memo(EventCard);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLOR.surface,
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLOR.borderSubtle,
  },
  cardSkipped: {
    backgroundColor: COLOR.bg,
    borderRadius: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLOR.borderSubtle,
    opacity: 0.6,
  },
  body: { padding: 16, gap: 8 },
  bodySkipped: { padding: 14, gap: 6 },

  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  categoryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  categoryDot: { width: 6, height: 6, borderRadius: 3 },
  category: {
    fontFamily: FONTS.body,
    fontSize: TYPE.xs,
    color: COLOR.textMuted,
    letterSpacing: 1.2,
  },
  goingLabel: {
    fontFamily: FONTS.bodySemi,
    fontSize: TYPE.xs,
    color: COLOR.accent,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },

  title: {
    fontFamily: FONTS.heading,
    fontSize: TYPE.lg,
    color: COLOR.textPrimary,
    lineHeight: 28,
    letterSpacing: -0.2,
  },
  titleSkipped: {
    fontFamily: FONTS.body,
    fontSize: TYPE.base,
    color: COLOR.textDisabled,
    flex: 1,
  },

  meta: { fontFamily: FONTS.body, fontSize: TYPE.sm, color: COLOR.textMuted, lineHeight: 20 },
  metaSkipped: { fontFamily: FONTS.body, fontSize: TYPE.sm, color: COLOR.textDisabled },

  proofRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
  proofText: { fontFamily: FONTS.bodySemi, fontSize: TYPE.sm, color: COLOR.accent },
  proofSep: { fontFamily: FONTS.body, fontSize: TYPE.sm, color: COLOR.textDisabled },

  rsvpRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 6 },
  rsvpPrimary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: COLOR.borderDefault,
    backgroundColor: 'transparent',
  },
  rsvpPrimaryActive: { borderColor: COLOR.accent, backgroundColor: COLOR.accentSoft },
  rsvpPrimaryText: { fontFamily: FONTS.bodySemi, fontSize: TYPE.base, color: COLOR.textMuted },
  rsvpPrimaryTextActive: { color: COLOR.accent },

  rsvpSkip: { paddingVertical: 8 },
  rsvpSkipText: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textDisabled },

  skippedFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLOR.borderSubtle,
  },
  skippedState: {
    fontFamily: FONTS.bodyItalic,
    fontSize: TYPE.sm,
    color: COLOR.textDisabled,
  },
  undoText: { fontFamily: FONTS.bodySemi, fontSize: TYPE.sm, color: COLOR.accent },
});
