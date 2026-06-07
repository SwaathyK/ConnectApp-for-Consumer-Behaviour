import React from 'react';
import { View, Text, StyleSheet, FlatList, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_EVENTS } from '../../data/mockEvents';
import { useRSVPContext as useRSVP } from '../../context/RSVPContext';
import { useTheme } from '../../context/ThemeContext';
import EventCard from '../../components/EventCard';
import MyWarwickEventCard from '../../components/MyWarwickEventCard';
import { Event, RSVPStatus } from '../../types';
import { COLOR, FONTS, TYPE } from '../../utils/tokens';
import { MW_COLOR, MW_LAYOUT, MW_GRADIENT } from '../../utils/mywarwickTokens';

type Props = { navigation: NativeStackNavigationProp<any> };

type ListItem =
  | { type: 'header'; label: string; sub?: string }
  | { type: 'event'; event: Event }
  | { type: 'empty'; message: string }
  | { type: 'spacer' };

export default function SavedScreen({ navigation }: Props) {
  const { rsvpMap, setRSVP } = useRSVP();
  const { isMyWarwick } = useTheme();
  const insets = useSafeAreaInsets();
  const C = isMyWarwick ? MW_COLOR : COLOR;

  const interested = MOCK_EVENTS.filter((e) => rsvpMap[e.id] === 'interested');
  const skipped    = MOCK_EVENTS.filter((e) => rsvpMap[e.id] === 'skipped');

  const handleRSVP = async (event: Event, status: RSVPStatus) => {
    await setRSVP(event.id, status);
  };

  const items: ListItem[] = [
    { type: 'header', label: 'INTERESTED', sub: interested.length > 0 ? `${interested.length} event${interested.length !== 1 ? 's' : ''}` : undefined },
    ...(interested.length > 0
      ? interested.map((e): ListItem => ({ type: 'event', event: e }))
      : [{ type: 'empty', message: 'Tap "I might go" on any event and it appears here.' } as ListItem]),
    ...(skipped.length > 0 ? [
      { type: 'header', label: 'SKIPPED', sub: 'tap undo to reconsider' } as ListItem,
      ...skipped.map((e): ListItem => ({ type: 'event', event: e })),
    ] : []),
    { type: 'spacer' },
  ];

  const list = (
    <FlatList
      data={items}
      keyExtractor={(item, i) => item.type === 'event' ? item.event.id : `${item.type}-${i}`}
      contentContainerStyle={[
        isMyWarwick ? mwStyles.list : edStyles.list,
        { paddingBottom: (isMyWarwick ? MW_LAYOUT.tabBarClearance : 80) + insets.bottom },
      ]}
      showsVerticalScrollIndicator={false}
      ListHeaderComponent={
        <View style={isMyWarwick ? mwStyles.pageHeader : edStyles.pageHeader}>
          {isMyWarwick ? (
            <Text style={mwStyles.heading}>Saved</Text>
          ) : (
            <>
              <View style={edStyles.mastheadRow}>
                <View style={edStyles.mastheadRule} />
                <Text style={edStyles.mastheadLabel}>CONNECT</Text>
                <View style={edStyles.mastheadRule} />
              </View>
              <Text style={edStyles.heading}>Saved</Text>
            </>
          )}
        </View>
      }
      renderItem={({ item }) => {
        if (item.type === 'header') return (
          <View style={isMyWarwick ? mwStyles.sectionHeader : edStyles.sectionHeader}>
            {isMyWarwick ? (
              <View style={mwStyles.sectionBand}>
                <Text style={mwStyles.sectionLabel}>{item.label}</Text>
                {item.sub && <Text style={mwStyles.sectionSub}>{item.sub}</Text>}
              </View>
            ) : (
              <>
                <Text style={edStyles.sectionLabel}>{item.label}</Text>
                {item.sub && <Text style={edStyles.sectionSub}>{item.sub}</Text>}
              </>
            )}
          </View>
        );
        if (item.type === 'empty') return (
          <Text style={[edStyles.emptyText, isMyWarwick && { color: MW_COLOR.textMuted }]}>
            {item.message}
          </Text>
        );
        if (item.type === 'spacer') return <View style={{ height: 80 }} />;

        const CardComponent = isMyWarwick ? MyWarwickEventCard : EventCard;
        return (
          <CardComponent
            event={item.event}
            rsvpStatus={rsvpMap[item.event.id] ?? null}
            onPress={() => navigation.navigate('EventDetail', { event: item.event })}
            onRSVP={(status) => handleRSVP(item.event, status)}
          />
        );
      }}
    />
  );

  if (isMyWarwick) {
    return (
      <LinearGradient colors={MW_GRADIENT} style={{ flex: 1 }} start={{ x: 0, y: 0 }} end={{ x: 0.3, y: 1 }}>
        <StatusBar barStyle="light-content" />
        <SafeAreaView edges={['top']} style={{ flex: 1 }}>{list}</SafeAreaView>
      </LinearGradient>
    );
  }

  return (
    <SafeAreaView style={edStyles.safe}>
      <StatusBar barStyle="dark-content" />
      {list}
    </SafeAreaView>
  );
}

// ── MyWarwick styles ─────────────────────────────────────────────────────────
const mwStyles = StyleSheet.create({
  list: { paddingBottom: 100 },
  pageHeader: { paddingHorizontal: 16, paddingTop: 20, paddingBottom: 8 },
  heading: { fontSize: 28, fontWeight: '700', color: MW_COLOR.textPrimary },
  sectionHeader: {},
  sectionBand: {
    backgroundColor: MW_COLOR.sectionBand,
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    marginTop: 8,
  },
  sectionLabel: { fontSize: 12, fontWeight: '700', color: MW_COLOR.textSecondary, letterSpacing: 1.2 },
  sectionSub: { fontSize: 12, color: MW_COLOR.textMuted, fontStyle: 'italic' },
  emptyText: { color: MW_COLOR.textMuted, fontSize: 15, padding: 16 },
});

// ── Editorial styles ─────────────────────────────────────────────────────────
const edStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  pageHeader: { paddingHorizontal: 4, paddingTop: 24, paddingBottom: 24, gap: 8 },
  mastheadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  mastheadRule: { flex: 1, height: 1, backgroundColor: COLOR.borderDefault },
  mastheadLabel: { fontFamily: FONTS.heading, fontSize: TYPE.xs, letterSpacing: 4, color: COLOR.textMuted },
  heading: { fontFamily: FONTS.heading, fontSize: TYPE['2xl'], color: COLOR.textPrimary, letterSpacing: -0.5 },
  sectionHeader: { flexDirection: 'row', alignItems: 'baseline', gap: 10, marginBottom: 12, marginTop: 8, paddingHorizontal: 4 },
  sectionLabel: { fontFamily: FONTS.body, fontSize: TYPE.xs, color: COLOR.textMuted, letterSpacing: 1.5 },
  sectionSub: { fontFamily: FONTS.bodyItalic, fontSize: TYPE.sm, color: COLOR.textDisabled },
  emptyText: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textMuted, paddingHorizontal: 4, lineHeight: 24, marginBottom: 20 },
});
