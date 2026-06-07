import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, StatusBar, Switch, TextInput, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useProfile } from '../../hooks/useProfile';
import { useTheme } from '../../context/ThemeContext';
import { DEPARTMENTS, COUNTRIES, COUNTRY_FLAGS, INTERESTS } from '../../data/options';
import { COLOR, FONTS } from '../../utils/tokens';
import { MW_COLOR, MW_LAYOUT } from '../../utils/mywarwickTokens';

const PURPLE = '#6B4FA8';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const DEPT_ICONS: Record<string, IoniconsName> = {
  'Business':         'bar-chart-outline',
  'Economics':        'trending-up-outline',
  'Computer Science': 'code-slash-outline',
  'Sciences':         'flask-outline',
  'Arts & Humanities':'library-outline',
  'Other':            'ellipsis-horizontal-outline',
};

const INTEREST_ICONS: Record<string, IoniconsName> = {
  '🎬 Film':        'film-outline',
  '🎮 Gaming':      'game-controller-outline',
  '⚽ Sport':       'football-outline',
  '🍴 Food':        'restaurant-outline',
  '🎵 Music':       'musical-notes-outline',
  '✏️ Art':         'brush-outline',
  '📖 Reading':     'book-outline',
  '✈️ Travel':      'airplane-outline',
  '🏕 Outdoors':    'leaf-outline',
  '📷 Photography': 'camera-outline',
  '❤️ Wellness':    'heart-outline',
  '💻 Tech':        'laptop-outline',
};

const TILES = INTERESTS.map((str) => {
  const idx = str.indexOf(' ');
  return {
    key:      str,
    iconName: INTEREST_ICONS[str] ?? ('ellipse-outline' as IoniconsName),
    label:    str.slice(idx + 1),
  };
});

const interestLabel = (key: string) => {
  const idx = key.indexOf(' ');
  return idx >= 0 ? key.slice(idx + 1) : key;
};

type Props = { onLogout: () => void };

export default function ProfileScreen({ onLogout }: Props) {
  const { profile, saveProfile, clearProfile } = useProfile();
  const { isMyWarwick, toggleTheme } = useTheme();
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollPad = { paddingBottom: MW_LAYOUT.tabBarClearance + insets.bottom };

  // ── Theme tokens ────────────────────────────────────────────────────────────
  const headerBg   = isMyWarwick ? PURPLE : COLOR.surface;
  const bodyBg     = isMyWarwick ? MW_LAYOUT.contentBg : COLOR.bg;
  const cardBg     = isMyWarwick ? '#FFFFFF' : COLOR.surface;
  const cardBorder = isMyWarwick ? '#ECECEC' : COLOR.borderSubtle;
  const onHeader   = isMyWarwick ? '#FFFFFF' : COLOR.textPrimary;
  const onHeaderSub= isMyWarwick ? 'rgba(255,255,255,0.82)' : COLOR.textMuted;
  const cardLabel  = isMyWarwick ? '#8A8A8E' : COLOR.textMuted;
  const cardTitle  = isMyWarwick ? '#1C1C1E' : COLOR.textPrimary;
  const cardSub    = isMyWarwick ? '#666666' : COLOR.textSecondary;
  const fontH      = isMyWarwick ? undefined : FONTS.heading;
  const fontB      = isMyWarwick ? undefined : FONTS.body;

  // ── Edit state ──────────────────────────────────────────────────────────────
  const [isEditing, setIsEditing]         = useState(false);
  const [editName, setEditName]           = useState('');
  const [editCourse, setEditCourse]       = useState('');
  const [editCountry, setEditCountry]     = useState('');
  const [editInterests, setEditInterests] = useState<string[]>([]);
  const [countrySearch, setCountrySearch] = useState('');

  const enterEdit = () => {
    setEditName(profile.name ?? '');
    setEditCourse(profile.course ?? '');
    setEditCountry(profile.countryOfOrigin ?? '');
    setEditInterests([...(profile.interests ?? [])]);
    setCountrySearch('');
    setIsEditing(true);
  };

  const handleSave = async () => {
    await saveProfile({
      name:            editName.trim(),
      course:          editCourse,
      countryOfOrigin: editCountry,
      interests:       editInterests,
    });
    setIsEditing(false);
  };

  const toggleInterest = (key: string) =>
    setEditInterests((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key],
    );

  const handleReset = () => {
    Alert.alert(
      'Reset profile?',
      'This will clear your profile and take you back to onboarding.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: async () => { await clearProfile(); onLogout(); } },
      ],
    );
  };

  const filteredCountries = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(countrySearch.toLowerCase()),
  );

  // 3 per row: width − body padding(16×2) − card padding(16×2) − 2 gaps(8×2), with a safety px
  const tileSize = Math.floor((width - 32 - 32 - 16 - 2) / 3);

  // ── Header ──────────────────────────────────────────────────────────────────
  const header = (
    <SafeAreaView edges={['top']} style={{ backgroundColor: headerBg }}>
      <View style={st.header}>
        <View style={st.headerTopRow}>
          <Text style={[st.headerTitle, { color: onHeader, fontFamily: fontH }]}>
            {isEditing ? 'Edit profile' : 'Profile'}
          </Text>
          {isEditing ? (
            <TouchableOpacity
              style={[st.pill, { backgroundColor: isMyWarwick ? 'rgba(255,255,255,0.18)' : 'transparent', borderColor: isMyWarwick ? 'transparent' : COLOR.borderDefault, borderWidth: isMyWarwick ? 0 : 1 }]}
              onPress={() => setIsEditing(false)}
              accessibilityRole="button"
              accessibilityLabel="Cancel editing"
            >
              <Text style={[st.pillText, { color: isMyWarwick ? '#FFF' : COLOR.textSecondary, fontFamily: fontB }]}>Cancel</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[st.pill, st.pillRow, { backgroundColor: isMyWarwick ? 'rgba(255,255,255,0.18)' : 'transparent', borderColor: isMyWarwick ? 'transparent' : COLOR.borderDefault, borderWidth: isMyWarwick ? 0 : 1 }]}
              onPress={enterEdit}
              accessibilityRole="button"
              accessibilityLabel="Edit profile"
            >
              <Ionicons name="create-outline" size={15} color={isMyWarwick ? '#FFF' : COLOR.accent} />
              <Text style={[st.pillText, { color: isMyWarwick ? '#FFF' : COLOR.accent, fontFamily: fontB }]}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {!isEditing && (
          <View style={st.identity}>
            <Text style={[st.name, { color: onHeader, fontFamily: fontH }]}>
              {profile.name || 'No name set'}
            </Text>
            <Text style={[st.courseLine, { color: onHeaderSub, fontFamily: isMyWarwick ? undefined : FONTS.bodyItalic }]}>
              {profile.course || 'No course set'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );

  // ── Read body ───────────────────────────────────────────────────────────────
  const readBody = (
    <>
      {/* Details */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>DETAILS</Text>
        {[
          { label: 'From',   value: profile.countryOfOrigin || 'Not set' },
          { label: 'Course', value: profile.course          || 'Not set' },
        ].map((row, i) => (
          <View key={row.label} style={[st.detailRow, i > 0 && { borderTopWidth: 1, borderTopColor: cardBorder }]}>
            <Text style={[st.detailLabel, { color: cardLabel, fontFamily: fontB }]}>{row.label}</Text>
            <Text style={[st.detailValue, { color: cardTitle, fontFamily: fontB }]}>{row.value}</Text>
          </View>
        ))}
      </View>

      {/* Interests */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>INTERESTS</Text>
        {profile.interests.length > 0 ? (
          <View style={st.chipWrap}>
            {profile.interests.map((i) => (
              <View key={i} style={[st.chip, { backgroundColor: isMyWarwick ? 'rgba(107,79,168,0.08)' : COLOR.surfaceRaised }]}>
                <Text style={[st.chipText, { color: isMyWarwick ? PURPLE : COLOR.textSecondary, fontFamily: fontB }]}>
                  {interestLabel(i)}
                </Text>
              </View>
            ))}
          </View>
        ) : (
          <Text style={[st.hint, { color: cardSub, fontFamily: fontB }]}>None set — tap Edit to add some</Text>
        )}
      </View>

      {/* Privacy */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>PRIVACY</Text>
        <Text style={[st.privacyText, { color: cardSub, fontFamily: fontB }]}>
          Attendance is anonymous by default. No data is shared externally.
        </Text>
        <View style={st.toggleRow}>
          <View style={st.toggleText}>
            <Text style={[st.toggleTitle, { color: cardTitle, fontFamily: fontB }]}>Show my name to others</Text>
            <Text style={[st.toggleSub, { color: cardSub, fontFamily: fontB }]}>
              Your name appears in the attendee list on events you join
            </Text>
          </View>
          <Switch
            value={profile.showNameToOthers}
            onValueChange={(val) => saveProfile({ showNameToOthers: val })}
            trackColor={{ false: '#D8D8DE', true: PURPLE }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Show my name to others"
          />
        </View>
        <View style={[st.toggleRow, { borderTopWidth: 1, borderTopColor: cardBorder, paddingTop: 12 }]}>
          <View style={st.toggleText}>
            <Text style={[st.toggleTitle, { color: cardTitle, fontFamily: fontB }]}>Allow others to message me</Text>
            <Text style={[st.toggleSub, { color: cardSub, fontFamily: fontB }]}>
              People going to the same events can start a chat with you
            </Text>
          </View>
          <Switch
            value={profile.allowMessages}
            onValueChange={(val) => saveProfile({ allowMessages: val })}
            trackColor={{ false: '#D8D8DE', true: PURPLE }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Allow others to message me"
          />
        </View>
      </View>

      {/* Appearance */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>APPEARANCE</Text>
        <View style={st.toggleRow}>
          <View style={st.toggleText}>
            <Text style={[st.toggleTitle, { color: cardTitle, fontFamily: fontB }]}>
              {isMyWarwick ? 'MyWarwick style' : 'University Editorial style'}
            </Text>
            <Text style={[st.toggleSub, { color: cardSub, fontFamily: fontB }]}>
              {isMyWarwick ? 'Matches the existing MyWarwick app' : "Connect's editorial design"}
            </Text>
          </View>
          <Switch
            value={isMyWarwick}
            onValueChange={toggleTheme}
            trackColor={{ false: '#D8D8DE', true: PURPLE }}
            thumbColor="#FFFFFF"
            accessibilityLabel="Toggle theme"
          />
        </View>
      </View>

      {/* Reset */}
      <TouchableOpacity
        style={[st.resetBtn, { backgroundColor: cardBg, borderColor: isMyWarwick ? '#F0D8D8' : '#DEC8C8' }]}
        onPress={handleReset}
        accessibilityRole="button"
        accessibilityLabel="Reset profile"
      >
        <Ionicons name="refresh-outline" size={16} color="#C2403A" />
        <Text style={[st.resetText, { fontFamily: fontB }]}>Reset profile</Text>
      </TouchableOpacity>
    </>
  );

  // ── Edit body ───────────────────────────────────────────────────────────────
  const editBody = (
    <>
      {/* Name */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>NAME</Text>
        <TextInput
          style={[st.input, { color: cardTitle, borderColor: cardBorder }]}
          value={editName}
          onChangeText={setEditName}
          placeholder="Your first name"
          placeholderTextColor="#AAA"
          autoCapitalize="words"
          maxLength={30}
          accessibilityLabel="Name"
        />
      </View>

      {/* Department */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>DEPARTMENT</Text>
        <View style={{ gap: 6 }}>
          {DEPARTMENTS.map((dept) => {
            const sel = editCourse === dept;
            return (
              <TouchableOpacity
                key={dept}
                style={[st.optionRow, { borderColor: sel ? PURPLE : cardBorder, backgroundColor: sel ? 'rgba(107,79,168,0.07)' : 'transparent' }]}
                onPress={() => setEditCourse(dept)}
                activeOpacity={0.7}
              >
                <View style={[st.optionIcon, { backgroundColor: sel ? 'rgba(107,79,168,0.15)' : '#F0F0F5' }]}>
                  <Ionicons name={DEPT_ICONS[dept] ?? 'ellipse-outline'} size={16} color={sel ? PURPLE : '#666'} />
                </View>
                <Text style={[st.optionName, { color: sel ? PURPLE : cardTitle, fontWeight: sel ? '600' : '500' }]}>{dept}</Text>
                <View style={[st.radio, sel && { borderColor: PURPLE, backgroundColor: PURPLE }]}>
                  {sel && <Text style={st.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Country */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>COUNTRY</Text>
        <View style={[st.searchBox, { borderColor: cardBorder }]}>
          <Ionicons name="search-outline" size={15} color="#AAA" />
          <TextInput
            style={[st.searchInput, { color: cardTitle }]}
            value={countrySearch}
            onChangeText={setCountrySearch}
            placeholder="Search..."
            placeholderTextColor="#AAA"
            accessibilityLabel="Search countries"
          />
        </View>
        <View>
          {filteredCountries.map((country, i) => {
            const sel = editCountry === country;
            return (
              <TouchableOpacity
                key={country}
                style={[st.countryRow, i > 0 && { borderTopWidth: 1, borderTopColor: cardBorder }, sel && { backgroundColor: 'rgba(107,79,168,0.05)' }]}
                onPress={() => setEditCountry(sel ? '' : country)}
                activeOpacity={0.7}
              >
                <Text style={st.flag}>{COUNTRY_FLAGS[country] ?? '🌍'}</Text>
                <Text style={[st.countryName, { color: sel ? PURPLE : cardTitle, fontWeight: sel ? '600' : '400' }]}>{country}</Text>
                {sel && <Text style={[st.radioCheck, { color: PURPLE }]}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Interests */}
      <View style={[st.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
        <Text style={[st.cardLabel, { color: cardLabel }]}>INTERESTS</Text>
        <Text style={[st.hint, { color: cardSub, marginBottom: 12, fontFamily: fontB }]}>
          {editInterests.length > 0 ? `${editInterests.length} selected` : 'Pick as many as you like'}
        </Text>
        <View style={st.tilesGrid}>
          {TILES.map(({ key, iconName, label }) => {
            const active = editInterests.includes(key);
            return (
              <TouchableOpacity
                key={key}
                style={[st.tile, { width: tileSize, height: tileSize }, active && st.tileActive]}
                onPress={() => toggleInterest(key)}
                activeOpacity={0.75}
                accessibilityRole="button"
                accessibilityState={{ selected: active }}
                accessibilityLabel={label}
              >
                <Ionicons name={iconName} size={22} color={active ? PURPLE : '#888'} />
                <Text style={[st.tileLabel, active && { color: PURPLE, fontWeight: '600' }]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <TouchableOpacity style={st.saveBtn} onPress={handleSave} activeOpacity={0.85} accessibilityRole="button" accessibilityLabel="Save changes">
        <Text style={st.saveBtnText}>Save changes</Text>
      </TouchableOpacity>
      <TouchableOpacity style={st.cancelLink} onPress={() => setIsEditing(false)} accessibilityRole="button">
        <Text style={[st.cancelLinkText, { color: cardSub }]}>Cancel</Text>
      </TouchableOpacity>
    </>
  );

  return (
    <View style={{ flex: 1, backgroundColor: headerBg }}>
      <StatusBar barStyle={isMyWarwick ? 'light-content' : 'dark-content'} />
      {header}
      <ScrollView
        style={{ flex: 1, backgroundColor: bodyBg }}
        contentContainerStyle={[st.body, scrollPad]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isEditing ? editBody : readBody}
      </ScrollView>
    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const st = StyleSheet.create({
  // Header
  header: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 22 },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.3 },
  pill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, minHeight: 34, justifyContent: 'center' },
  pillRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillText: { fontSize: 14, fontWeight: '600' },
  identity: { marginTop: 18, gap: 4 },
  name: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6 },
  courseLine: { fontSize: 15 },

  // Body + cards
  body: { padding: 16, gap: 12 },
  card: { borderRadius: 16, padding: 16, borderWidth: 1, gap: 12 },
  cardLabel: { fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },

  // Details
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10 },
  detailLabel: { fontSize: 14 },
  detailValue: { fontSize: 15, fontWeight: '500', flexShrink: 1, textAlign: 'right' },

  // Interest chips
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 18 },
  chipText: { fontSize: 13, fontWeight: '600' },
  hint: { fontSize: 14, fontStyle: 'italic' },

  // Toggles
  privacyText: { fontSize: 14, lineHeight: 20 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  toggleText: { flex: 1, gap: 3 },
  toggleTitle: { fontSize: 15, fontWeight: '500' },
  toggleSub: { fontSize: 13, lineHeight: 18 },

  // Reset
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 15, borderRadius: 16, borderWidth: 1, marginTop: 4 },
  resetText: { fontSize: 15, fontWeight: '600', color: '#C2403A' },

  // Edit — inputs
  input: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  optionRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1 },
  optionIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  optionName: { flex: 1, fontSize: 15 },
  radio: { width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, borderColor: '#CCC', alignItems: 'center', justifyContent: 'center' },
  radioCheck: { color: '#FFF', fontSize: 11, fontWeight: '700' },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderRadius: 10, borderWidth: 1, paddingHorizontal: 12, paddingVertical: 9, gap: 8 },
  searchInput: { flex: 1, fontSize: 14 },
  countryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, gap: 10 },
  flag: { fontSize: 18, width: 26 },
  countryName: { flex: 1, fontSize: 14 },

  // Edit — interest tiles
  tilesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tile: { backgroundColor: '#F0F0F6', borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'transparent', gap: 4 },
  tileActive: { backgroundColor: 'rgba(107,79,168,0.12)', borderColor: PURPLE },
  tileLabel: { fontSize: 11, color: '#555', fontWeight: '500' },

  // Edit — save/cancel
  saveBtn: { backgroundColor: PURPLE, borderRadius: 28, paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  cancelLink: { paddingVertical: 14, alignItems: 'center' },
  cancelLinkText: { fontSize: 15 },
});
