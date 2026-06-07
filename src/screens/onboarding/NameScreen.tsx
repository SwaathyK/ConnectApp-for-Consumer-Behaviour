import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  StatusBar, TextInput, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import ProgressDots from '../../components/ProgressDots';

const PURPLE = '#6B4FA8';

type Props = {
  navigation: NativeStackNavigationProp<any>;
  route: RouteProp<any>;
};

export default function NameScreen({ navigation, route }: Props) {
  const draft = route.params?.draft ?? {};
  const insets = useSafeAreaInsets();
  const [name, setName] = useState<string>(draft.name ?? '');

  const trimmed = name.trim();

  const goNext = () => {
    if (!trimmed) return;
    navigation.navigate('OnboardingCourse', { draft: { ...draft, name: trimmed } });
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      {/* Purple header */}
      <SafeAreaView edges={['top']} style={styles.header}>
        <ProgressDots total={5} current={1} />
        <View style={styles.headerContent}>
          <Text style={styles.eyebrow}>Your name</Text>
          <Text style={styles.heading}>What should we call you?</Text>
        </View>
      </SafeAreaView>

      {/* White body */}
      <KeyboardAvoidingView
        style={styles.body}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.bodyInner}>
          <Text style={styles.subheading}>
            First name is enough — it's how you'll appear to others, only if you choose to share it.
          </Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Your first name"
            placeholderTextColor="#AAA"
            autoFocus
            autoCapitalize="words"
            autoCorrect={false}
            returnKeyType="next"
            maxLength={30}
            onSubmitEditing={goNext}
            accessibilityLabel="Your first name"
          />
        </View>

        <View style={[styles.footer, { paddingBottom: insets.bottom + 16 }]}>
          <TouchableOpacity
            style={[styles.button, !trimmed && styles.buttonDisabled]}
            disabled={!trimmed}
            onPress={goNext}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityState={{ disabled: !trimmed }}
          >
            <Text style={styles.buttonText}>Next</Text>
          </TouchableOpacity>
          <Text style={styles.caption}>You can change this anytime in settings</Text>
        </View>
      </KeyboardAvoidingView>
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
  bodyInner: { flex: 1, paddingHorizontal: 20, paddingTop: 24 },
  subheading: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 17,
    color: '#1C1C1E',
  },

  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
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
