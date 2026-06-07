import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, StatusBar,
  ScrollView, TextInput, Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MOCK_EVENTS } from '../../data/mockEvents';
import { useRSVPContext as useRSVP } from '../../context/RSVPContext';
import { useProfile } from '../../hooks/useProfile';
import { useNudgeRanking, scoreEvent, RELEVANCE_THRESHOLD } from '../../hooks/useNudgeRanking';
import { useTheme } from '../../context/ThemeContext';
import EventCard from '../../components/EventCard';
import MyWarwickEventCard from '../../components/MyWarwickEventCard';
import { Event, RSVPStatus } from '../../types';
import { scheduleMorningReminder } from '../../utils/notifications';
import { COLOR, FONTS, TYPE } from '../../utils/tokens';
import { MW_LAYOUT } from '../../utils/mywarwickTokens';
import { getRelativeDay, formatShortTime, todayISOString } from '../../utils/format';

// ── Constants ─────────────────────────────────────────────────────────────────

const PURPLE = '#6B4FA8';
const TODAY_STR = todayISOString();

const FEED_FILTERS = ['All', 'My course', 'Interests', 'Tonight'] as const;
type FeedFilter = typeof FEED_FILTERS[number];

type SortMode = 'relevance' | 'date' | 'az';
const SORT_CYCLE: SortMode[] = ['relevance', 'date', 'az'];
const SORT_LABEL: Record<SortMode, string> = {
  relevance: '✦ For you',
  date:      '↑ By date',
  az:        'A–Z',
};

const ED_CATEGORIES = ['All', 'Social', 'Academic', 'Arts', 'Sports', 'Wellbeing', 'Careers', 'Food'];

// Compact row theme colours (mirrors MyWarwickEventCard THEMES)
const CARD_THEMES = {
  purple: { imageBg: '#EDE8FF', accent: '#6B4FA8' },
  green:  { imageBg: '#E6F5EE', accent: '#2D7D52' },
  warm:   { imageBg: '#FFF0E6', accent: '#C4714A' },
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

// ── FlatList row union type ───────────────────────────────────────────────────

type FeedRow =
  | { kind: 'sectionHeader'; label: string; star: boolean }
  | { kind: 'card';    event: Event }
  | { kind: 'compact'; event: Event };

// ── Screen ────────────────────────────────────────────────────────────────────

type Props = { navigation: NativeStackNavigationProp<any> };

export default function FeedScreen({ navigation }: Props) {
  const { profile }         = useProfile();
  const { setRSVP, getStatus, rsvpMap } = useRSVP();
  const { isMyWarwick }     = useTheme();
  const insets              = useSafeAreaInsets();

  // Skipped events sink to the bottom of their section (kept, not hidden)
  const sinkSkipped = (arr: Event[]): Event[] => [
    ...arr.filter((e) => rsvpMap[e.id] !== 'skipped'),
    ...arr.filter((e) => rsvpMap[e.id] === 'skipped'),
  ];

  const [mwFilter, setMwFilter] = useState<FeedFilter>('All');
  const [sort, setSort]         = useState<SortMode>('relevance');
  const [edFilter, setEdFilter] = useState('All');
  const [search, setSearch]     = useState('');

  const ranked     = useNudgeRanking(MOCK_EVENTS, profile);
  const matchCount = useMemo(
    () => ranked.filter((e) => scoreEvent(e) >= RELEVANCE_THRESHOLD).length,
    [ranked],
  );

  // ── Build MyWarwick feed rows ───────────────────────────────────────────────
  const feedRows = useMemo((): FeedRow[] => {
    // 1. Search
    let list = search.trim()
      ? ranked.filter((e) => e.title.toLowerCase().includes(search.toLowerCase().trim()))
      : ranked;

    // 2. Filter chip
    switch (mwFilter) {
      case 'My course':  list = list.filter((e) => e.coursemateCount >= 5);    break;
      case 'Interests':  list = list.filter((e) => e.interestMatchCount >= 5); break;
      case 'Tonight':    list = list.filter((e) => e.date === TODAY_STR);      break;
    }

    // 3. Sort
    switch (sort) {
      case 'date': list = [...list].sort((a, b) => a.date.localeCompare(b.date));  break;
      case 'az':   list = [...list].sort((a, b) => a.title.localeCompare(b.title)); break;
    }

    // 4. Sectioned view — only in default (All filter + relevance sort)
    if (sort === 'relevance' && mwFilter === 'All') {
      const top  = sinkSkipped(list.filter((e) => scoreEvent(e) >= RELEVANCE_THRESHOLD));
      const rest = sinkSkipped(list.filter((e) => scoreEvent(e) < RELEVANCE_THRESHOLD));
      return [
        { kind: 'sectionHeader', label: 'MOST RELEVANT TO YOU', star: true },
        ...top.map((e): FeedRow => ({ kind: 'card', event: e })),
        ...(rest.length > 0 ? [
          { kind: 'sectionHeader', label: 'EVERYTHING ELSE', star: false } as FeedRow,
          ...rest.map((e): FeedRow => ({ kind: 'compact', event: e })),
        ] : []),
      ];
    }

    // Non-sectioned: rich cards (skipped still sink to the bottom)
    return sinkSkipped(list).map((e): FeedRow => ({ kind: 'card', event: e }));
  }, [ranked, search, mwFilter, sort, rsvpMap]);

  // ── Editorial filter ────────────────────────────────────────────────────────
  const edFiltered = edFilter === 'All'
    ? ranked
    : ranked.filter((e) => e.category.toLowerCase() === edFilter.toLowerCase());

  const handleRSVP = async (event: Event, status: RSVPStatus) => {
    await setRSVP(event.id, status);
    if (status === 'interested') await scheduleMorningReminder(event, event.coursemateCount);
  };

  const cycleSort = () => {
    setSort((prev) => {
      const i = SORT_CYCLE.indexOf(prev);
      return SORT_CYCLE[(i + 1) % SORT_CYCLE.length];
    });
  };

  // ── MyWarwick render ────────────────────────────────────────────────────────
  if (isMyWarwick) {
    return (
      <View style={mw.root}>
        <StatusBar barStyle="light-content" />
        {/* Fixed header — stays put so top overscroll never reveals a mismatched colour */}
        <MWHeader
          name={profile.name}
          matchCount={matchCount}
          search={search}
          setSearch={setSearch}
          activeFilter={mwFilter}
          setFilter={(f) => { setMwFilter(f); setSort('relevance'); }}
          sort={sort}
          onCycleSort={cycleSort}
        />
        <FlatList
          style={mw.list}
          contentContainerStyle={[mw.listContent, { paddingBottom: MW_LAYOUT.tabBarClearance + insets.bottom }]}
          data={feedRows}
          keyExtractor={(item, i) => {
            if (item.kind === 'sectionHeader') return `hdr-${item.label}`;
            return item.event.id + '-' + item.kind;
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            if (item.kind === 'sectionHeader') {
              return <SectionHeader label={item.label} star={item.star} />;
            }
            if (item.kind === 'compact') {
              return (
                <CompactEventRow
                  event={item.event}
                  onPress={() => navigation.navigate('EventDetail', { event: item.event })}
                />
              );
            }
            return (
              <MyWarwickEventCard
                event={item.event}
                rsvpStatus={getStatus(item.event.id)}
                onPress={() => navigation.navigate('EventDetail', { event: item.event })}
                onRSVP={(status) => handleRSVP(item.event, status)}
                onChat={() => Alert.alert(
                  `Chat — ${item.event.title}`,
                  'Group chat launches with Connect. Tapping "I might go" already makes you visible to others going to this event.',
                  [{ text: 'Got it' }],
                )}
              />
            );
          }}
          ListEmptyComponent={
            <Text style={mw.empty}>No events match this filter right now.</Text>
          }
        />
      </View>
    );
  }

  // ── Editorial render ────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={ed.safe}>
      <StatusBar barStyle="dark-content" />
      <FlatList
        data={edFiltered}
        keyExtractor={(e) => e.id}
        contentContainerStyle={ed.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <EditorialHeader
            profile={profile}
            activeFilter={edFilter}
            setActiveFilter={setEdFilter}
          />
        }
        renderItem={({ item }) => (
          <EventCard
            event={item}
            rsvpStatus={getStatus(item.id)}
            onPress={() => navigation.navigate('EventDetail', { event: item })}
            onRSVP={(status) => handleRSVP(item, status)}
          />
        )}
        ListEmptyComponent={
          <Text style={ed.empty}>Nothing in this category right now.</Text>
        }
      />
    </SafeAreaView>
  );
}

// ── MyWarwick header ──────────────────────────────────────────────────────────

interface MWHeaderProps {
  name: string;
  matchCount: number;
  search: string;
  setSearch: (s: string) => void;
  activeFilter: FeedFilter;
  setFilter: (f: FeedFilter) => void;
  sort: SortMode;
  onCycleSort: () => void;
}

function MWHeader({
  name, matchCount, search, setSearch,
  activeFilter, setFilter, sort, onCycleSort,
}: MWHeaderProps) {
  const firstName = name ? name.split(' ')[0] : 'there';
  const subtitle = sort === 'relevance'
    ? `${matchCount} events match your vibe today`
    : sort === 'date' ? 'Sorted by date' : 'Sorted A–Z';

  return (
    <View style={mw.headerWrap}>
      <SafeAreaView edges={['top']} style={mw.headerSafe}>
        <View style={mw.headerInner}>
          <Text style={mw.greeting}>Hey {firstName}!</Text>
          <Text style={mw.greetingSub}>{subtitle}</Text>
          <View style={mw.searchBar}>
            <Ionicons name="search-outline" size={16} color="rgba(255,255,255,0.6)" />
            <TextInput
              style={mw.searchInput}
              value={search}
              onChangeText={setSearch}
              placeholder="Search events..."
              placeholderTextColor="rgba(255,255,255,0.5)"
              returnKeyType="search"
              clearButtonMode="while-editing"
              accessibilityLabel="Search events"
            />
          </View>
        </View>
      </SafeAreaView>

      {/* Filter chips + sort toggle */}
      <View style={mw.filterStrip}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={mw.filterRow}
          style={{ flex: 1 }}
        >
          {FEED_FILTERS.map((f) => (
            <TouchableOpacity
              key={f}
              style={[mw.chip, activeFilter === f && mw.chipActive]}
              onPress={() => setFilter(f)}
              activeOpacity={0.75}
            >
              <Text style={[mw.chipText, activeFilter === f && mw.chipTextActive]}>
                {f}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Sort toggle — always accessible (ethics constraint: full list reachable) */}
        <TouchableOpacity
          style={[mw.sortBtn, sort !== 'relevance' && mw.sortBtnActive]}
          onPress={onCycleSort}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Sort mode: ${SORT_LABEL[sort]}. Tap to change.`}
        >
          <Text style={[mw.sortText, sort !== 'relevance' && mw.sortTextActive]}>
            {SORT_LABEL[sort]}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ── Section header ────────────────────────────────────────────────────────────

function SectionHeader({ label, star }: { label: string; star: boolean }) {
  return (
    <View style={sh.row}>
      {star && <Ionicons name="star" size={11} color="#6B4FA8" />}
      <Text style={sh.label}>{label}</Text>
    </View>
  );
}

// ── Compact event row (for "Everything else" section) ─────────────────────────

function CompactEventRow({ event, onPress }: { event: Event; onPress: () => void }) {
  const tc = CARD_THEMES[event.cardTheme];
  return (
    <TouchableOpacity
      style={cr.row}
      onPress={onPress}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={event.title}
    >
      <View style={[cr.icon, { backgroundColor: tc.imageBg }]}>
        <Ionicons
          name={CAT_ICONS[event.category] ?? 'ellipse-outline'}
          size={22}
          color={tc.accent}
        />
      </View>
      <View style={cr.content}>
        <Text style={cr.title} numberOfLines={1}>{event.title}</Text>
        <Text style={cr.meta}>
          {getRelativeDay(event.date)} · {formatShortTime(event.time)} · {event.location}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

// ── Editorial header ──────────────────────────────────────────────────────────

function EditorialHeader({ profile, activeFilter, setActiveFilter }: any) {
  return (
    <>
      <View style={ed.header}>
        <View style={ed.mastheadRow}>
          <View style={ed.rule} />
          <Text style={ed.wordmark}>CONNECT</Text>
          <View style={ed.rule} />
        </View>
        <Text style={ed.heading}>
          {profile.name ? `Good evening, ${profile.name}.` : "What's on."}
        </Text>
        <Text style={ed.subheading}>This week at Warwick</Text>
      </View>
      <FlatList
        horizontal
        data={ED_CATEGORIES}
        keyExtractor={(c) => c}
        contentContainerStyle={ed.filterRow}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity style={ed.filterItem} onPress={() => setActiveFilter(item)}>
            <Text style={[ed.filterText, activeFilter === item && ed.filterTextActive]}>
              {item}
            </Text>
            {activeFilter === item && <View style={ed.filterUnderline} />}
          </TouchableOpacity>
        )}
      />
      <View style={ed.divider} />
    </>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const mw = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },
  headerWrap: { backgroundColor: PURPLE },
  list: { flex: 1, backgroundColor: MW_LAYOUT.contentBg },
  listContent: { paddingTop: 12 },

  headerSafe: { backgroundColor: PURPLE },
  headerInner: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20, gap: 6 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#FFF', letterSpacing: -0.5 },
  greetingSub: { fontSize: 14, color: 'rgba(255,255,255,0.78)', marginBottom: 4 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    marginTop: 4,
  },
  searchIcon: { fontSize: 14 },
  searchInput: { flex: 1, fontSize: 14, color: '#FFF' },

  filterStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: MW_LAYOUT.contentBg,
    paddingVertical: 10,
    paddingRight: 12,
  },
  filterRow: { paddingLeft: 16, gap: 8, paddingRight: 4 },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: '#E8E8EE' },
  chipActive: { backgroundColor: PURPLE },
  chipText: { fontSize: 13, fontWeight: '500', color: '#555' },
  chipTextActive: { color: '#FFF', fontWeight: '600' },

  sortBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#E8E8EE',
    marginLeft: 4,
    flexShrink: 0,
  },
  sortBtnActive: { backgroundColor: '#1C1C2E' },
  sortText: { fontSize: 12, fontWeight: '600', color: '#555' },
  sortTextActive: { color: '#FFF' },

  empty: { fontSize: 14, color: '#999', textAlign: 'center', padding: 32 },
});

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 10,
  },
  star: { fontSize: 11, color: '#6B4FA8' },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: '#888',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});

const cr = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    backgroundColor: '#FFF',
    marginHorizontal: 16,
    marginBottom: 8,
    borderRadius: 12,
    opacity: 0.6,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconEmoji: { fontSize: 22 },
  content: { flex: 1, gap: 3 },
  title: { fontSize: 14, fontWeight: '600', color: '#1C1C1E' },
  meta: { fontSize: 12, color: '#888' },
  pill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EBEBEB',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginTop: 2,
  },
  pillText: { fontSize: 11, color: '#888', fontWeight: '500' },
});

const ed = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLOR.bg },
  listContent: { paddingHorizontal: 16, paddingBottom: 100 },
  header: { paddingHorizontal: 4, paddingTop: 24, paddingBottom: 20, gap: 8 },
  mastheadRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 },
  rule: { flex: 1, height: 1, backgroundColor: COLOR.borderDefault },
  wordmark: { fontFamily: FONTS.heading, fontSize: TYPE.xs, letterSpacing: 4, color: COLOR.textMuted },
  heading: { fontFamily: FONTS.heading, fontSize: TYPE['2xl'], color: COLOR.textPrimary, letterSpacing: -0.5, lineHeight: 40 },
  subheading: { fontFamily: FONTS.bodyItalic, fontSize: TYPE.base, color: COLOR.textMuted },
  filterRow: { gap: 0, paddingHorizontal: 4 },
  filterItem: { paddingHorizontal: 12, paddingVertical: 10, alignItems: 'center', position: 'relative' },
  filterText: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textMuted },
  filterTextActive: { color: COLOR.textPrimary, fontFamily: FONTS.bodySemi },
  filterUnderline: { position: 'absolute', bottom: 0, left: 12, right: 12, height: 1.5, backgroundColor: COLOR.accent },
  divider: { height: 1, backgroundColor: COLOR.borderSubtle, marginBottom: 16, marginHorizontal: 4 },
  empty: { fontFamily: FONTS.body, fontSize: TYPE.base, color: COLOR.textMuted, paddingHorizontal: 4 },
});
