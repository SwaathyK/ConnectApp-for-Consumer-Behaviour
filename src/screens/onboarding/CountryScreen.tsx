import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COUNTRIES, COUNTRY_FLAGS } from '../../data/options';
import ProgressDots from '../../components/ProgressDots';

const GREEN = '#2D7D52';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function CountryScreen({ navigation, route }: Props) {
  const draft = route.params?.draft ?? {};
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>(draft.countryOfOrigin ?? '');
  const [search, setSearch] = useState('');

  const filtered = COUNTRIES.filter((c) =>
    c.toLowerCase().includes(search.toLowerCase())
  );

  const goNext = () => {
    navigation.navigate('OnboardingInterests', {
      draft: { ...draft, countryOfOrigin: selected },
    });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Green header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <ProgressDots total={5} current={3} />
        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>Your country</Text>
          <Text style={styles.heading}>Where are you from?</Text>
        </View>
      </SafeAreaView>

      {/* White body */}
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Text style={styles.subtitle}>
          This helps us connect you with students from home
        </Text>

        {/* Pinned selected country (shown above search when a selection exists) */}
        {!!selected && (
          <View style={styles.selectedRow}>
            <Text style={styles.flag}>{COUNTRY_FLAGS[selected] ?? '🌍'}</Text>
            <Text style={styles.selectedName}>{selected}</Text>
            <Text style={styles.selectedCheck}>✓</Text>
          </View>
        )}

        {/* Search input */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={16} color="#AAA" />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search your country..."
            placeholderTextColor="#AAA"
            returnKeyType="search"
            clearButtonMode="while-editing"
            accessibilityLabel="Search countries"
          />
        </View>

        {/* Country list */}
        <ScrollView
          style={styles.list}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {filtered.map((country) => {
            const isSelected = selected === country;
            return (
              <TouchableOpacity
                key={country}
                style={[styles.countryRow, isSelected && styles.countryRowActive]}
                onPress={() => setSelected(isSelected ? '' : country)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <Text style={styles.flag}>{COUNTRY_FLAGS[country] ?? '🌍'}</Text>
                <Text style={[styles.countryName, isSelected && styles.countryNameActive]}>
                  {country}
                </Text>
                <View style={[styles.radio, isSelected && styles.radioActive]}>
                  {isSelected && <Text style={styles.radioCheck}>✓</Text>}
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={styles.button}
            onPress={goNext}
            activeOpacity={0.85}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: GREEN },
  header: { backgroundColor: GREEN },
  headerContent: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 22 },
  eyebrow: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 6, fontWeight: '500' },
  heading: { fontSize: 26, fontWeight: '700', color: '#FFF', lineHeight: 32 },

  body: { flex: 1, backgroundColor: '#FFF', paddingTop: 16 },
  subtitle: {
    fontSize: 14,
    color: '#555',
    paddingHorizontal: 20,
    marginBottom: 12,
    lineHeight: 20,
  },
  selectedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 12,
    backgroundColor: 'rgba(45,125,82,0.08)',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: GREEN,
    gap: 10,
  },
  selectedName: { flex: 1, fontSize: 15, color: '#1C1C1E', fontWeight: '600' },
  selectedCheck: { fontSize: 16, color: GREEN, fontWeight: '700' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 6,
    backgroundColor: '#F5F5F8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: '#1C1C1E' },
  list: { flex: 1, paddingHorizontal: 16 },
  countryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 10,
  },
  countryRowActive: { backgroundColor: 'rgba(45,125,82,0.05)' },
  flag: { fontSize: 20, width: 28 },
  countryName: { flex: 1, fontSize: 15, color: '#333' },
  countryNameActive: { color: GREEN, fontWeight: '600' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: GREEN, backgroundColor: GREEN },
  radioCheck: { color: '#FFF', fontSize: 12, fontWeight: '700' },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: GREEN,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
});
