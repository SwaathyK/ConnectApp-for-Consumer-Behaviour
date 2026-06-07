import React from 'react';
import { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { DEPARTMENTS } from '../../data/options';
import ProgressDots from '../../components/ProgressDots';

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

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function CourseScreen({ navigation, route }: Props) {
  const draft = route.params?.draft ?? {};
  const insets = useSafeAreaInsets();
  const [selected, setSelected] = useState<string>(draft.course ?? '');

  const goNext = () => {
    if (!selected) return;
    navigation.navigate('OnboardingCountry', { draft: { ...draft, course: selected } });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <ProgressDots total={5} current={2} />
        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>Your course</Text>
          <Text style={styles.heading}>What are you studying?</Text>
        </View>
      </SafeAreaView>

      {/* White body */}
      <View style={styles.body}>
        <Text style={styles.subheading}>Select your department</Text>

        <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
          {DEPARTMENTS.map((dept) => {
            const isSelected = selected === dept;
            return (
              <TouchableOpacity
                key={dept}
                style={[styles.row, isSelected && styles.rowActive]}
                onPress={() => setSelected(dept)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityState={{ selected: isSelected }}
              >
                <View style={[styles.iconBox, isSelected && styles.iconBoxActive]}>
                  <Ionicons
                    name={DEPT_ICONS[dept] ?? 'ellipse-outline'}
                    size={18}
                    color={isSelected ? PURPLE : '#666'}
                  />
                </View>
                <Text style={[styles.deptName, isSelected && styles.deptNameActive]}>
                  {dept}
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
            style={[styles.button, !selected && styles.buttonDisabled]}
            disabled={!selected}
            onPress={goNext}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: !selected }}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
          <Text style={styles.caption}>You can change this anytime in settings</Text>
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

  body: { flex: 1, backgroundColor: '#FFF', paddingTop: 20 },
  subheading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1C1C1E',
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  list: { flex: 1, paddingHorizontal: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E8E8EC',
    gap: 12,
  },
  rowActive: {
    backgroundColor: 'rgba(107,79,168,0.07)',
    borderColor: PURPLE,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#F0F0F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBoxActive: { backgroundColor: 'rgba(107,79,168,0.15)' },
  deptName: { flex: 1, fontSize: 15, color: '#1C1C1E', fontWeight: '500' },
  deptNameActive: { color: PURPLE, fontWeight: '600' },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#CCC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: PURPLE, backgroundColor: PURPLE },
  radioCheck: { color: '#FFF', fontSize: 12, fontWeight: '700' },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 36,
    gap: 10,
    backgroundColor: '#FFF',
  },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
  },
  buttonDisabled: { backgroundColor: '#D6D2E0' },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, color: '#999', textAlign: 'center' },
});
