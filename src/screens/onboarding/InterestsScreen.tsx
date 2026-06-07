import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, useWindowDimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { INTERESTS } from '../../data/options';
import { useProfile } from '../../hooks/useProfile';
import ProgressDots from '../../components/ProgressDots';

const PURPLE = '#6B4FA8';
const H_PAD = 24;
const GAP = 8;

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const INTEREST_ICONS: Record<string, IoniconsName> = {
  '🎬 Film':         'film-outline',
  '🎮 Gaming':       'game-controller-outline',
  '⚽ Sport':        'football-outline',
  '🍴 Food':         'restaurant-outline',
  '🎵 Music':        'musical-notes-outline',
  '✏️ Art':          'brush-outline',
  '📖 Reading':      'book-outline',
  '✈️ Travel':       'airplane-outline',
  '🏕 Outdoors':     'leaf-outline',
  '📷 Photography':  'camera-outline',
  '❤️ Wellness':     'heart-outline',
  '💻 Tech':         'laptop-outline',
};

const TILES = INTERESTS.map((str) => {
  const idx = str.indexOf(' ');
  return {
    key:      str,
    iconName: INTEREST_ICONS[str] ?? ('ellipse-outline' as IoniconsName),
    label:    str.slice(idx + 1),
  };
});

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
  onOnboardingComplete: () => void;
};

export default function InterestsScreen({ route, onOnboardingComplete }: Props) {
  const draft = route.params?.draft ?? {};
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string[]>(draft.interests ?? []);
  const { saveProfile } = useProfile();
  const { width } = useWindowDimensions();

  const tileSize = Math.floor((width - H_PAD * 2 - GAP * 2) / 3);

  const toggle = (key: string) =>
    setSelected((prev) =>
      prev.includes(key) ? prev.filter((i) => i !== key) : [...prev, key]
    );

  const handleFinish = async () => {
    await saveProfile({
      ...draft,
      interests: selected,
      onboardingComplete: true,
      showNameToOthers: false,
      id: Date.now().toString(),
    });
    onOnboardingComplete();
  };

  const caption =
    selected.length > 0
      ? `${selected.length} selected · you can update these anytime`
      : 'you can update these anytime';

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple header — all 4 dashes active */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <ProgressDots total={5} current={4} />
        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>Your interests</Text>
          <Text style={styles.heading}>What are you into?</Text>
        </View>
      </SafeAreaView>

      {/* White body */}
      <View style={styles.body}>
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingHorizontal: H_PAD }]}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.subheading}>Pick as many as you like</Text>

          <View style={[styles.grid, { gap: GAP }]}>
            {TILES.map(({ key, iconName, label }) => {
              const isActive = selected.includes(key);
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tile,
                    { width: tileSize, height: tileSize },
                    isActive && styles.tileActive,
                  ]}
                  onPress={() => toggle(key)}
                  activeOpacity={0.75}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isActive }}
                  accessibilityLabel={label}
                >
                  <Ionicons
                    name={iconName}
                    size={26}
                    color={isActive ? PURPLE : '#888'}
                  />
                  <Text style={[styles.tileLabel, isActive && styles.tileLabelActive]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={handleFinish}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Finish and go to events"
          >
            <Text style={styles.buttonText}>Finish — take me to events</Text>
          </TouchableOpacity>
          <Text style={styles.caption}>{caption}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },
  header: { backgroundColor: PURPLE },
  headerContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 22 },
  eyebrow: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: '500' },
  heading: { fontSize: 26, fontWeight: '700', color: '#FFF', lineHeight: 32 },

  body: { flex: 1, backgroundColor: '#FFF' },
  scroll: { paddingTop: 20, paddingBottom: 16 },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    backgroundColor: '#F0F0F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: 'transparent',
    gap: 6,
  },
  tileActive: {
    backgroundColor: 'rgba(107,79,168,0.12)',
    borderColor: PURPLE,
  },
  tileLabel: { fontSize: 12, color: '#555', fontWeight: '500' },
  tileLabelActive: { color: PURPLE, fontWeight: '600' },

  footer: {
    paddingHorizontal: H_PAD,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 10,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: '#2A1F5C',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, color: '#999', textAlign: 'center' },
});
