import React from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import ProgressDots from '../../components/ProgressDots';

const PURPLE = '#6B4FA8';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const PRIVACY_ROWS: { icon: IoniconsName; text: string }[] = [
  { icon: 'lock-closed-outline',      text: 'Your profile is private by default' },
  { icon: 'eye-outline',              text: 'You choose what others can see' },
  { icon: 'shield-checkmark-outline', text: 'No data shared externally' },
];

type Props = { navigation: NativeStackNavigationProp<any> };

export default function WelcomeScreen({ navigation }: Props) {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple header — extends into the status-bar area on both platforms */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <ProgressDots total={5} current={0} />
      </SafeAreaView>

      {/* White body */}
      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome icon */}
        <View style={styles.iconBox}>
          <Ionicons name="sparkles-outline" size={30} color={PURPLE} />
        </View>

        <Text style={styles.heading}>Welcome to Connect</Text>
        <Text style={styles.sub}>
          Tell us a little about yourself so we can show you events where you'll actually know people.
        </Text>

        {/* Privacy assurances */}
        <View style={styles.privacyBox}>
          {PRIVACY_ROWS.map(({ icon, text }) => (
            <View key={text} style={styles.privacyRow}>
              <Ionicons name={icon} size={16} color={PURPLE} style={styles.privacyIcon} />
              <Text style={styles.privacyText}>{text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('OnboardingName', { draft: {} })}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel="Let's go"
        >
          <Text style={styles.buttonText}>Let's go</Text>
        </TouchableOpacity>

        <Text style={styles.caption}>Takes less than a minute</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: PURPLE },
  header: { backgroundColor: PURPLE },
  body: { flex: 1, backgroundColor: '#FFFFFF' },
  bodyContent: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 52,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: 'rgba(107,79,168,0.10)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1C1C1E',
    textAlign: 'center',
    marginBottom: 12,
  },
  sub: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 28,
    maxWidth: 300,
  },
  privacyBox: {
    backgroundColor: '#F5F5F8',
    borderRadius: 14,
    padding: 16,
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  privacyRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  privacyIcon: { width: 22, textAlign: 'center' },
  privacyText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  button: {
    backgroundColor: PURPLE,
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
  },
  buttonText: { color: '#FFF', fontSize: 16, fontWeight: '600' },
  caption: { fontSize: 13, color: '#999', textAlign: 'center' },
});
