import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useFonts } from 'expo-font';
import {
  EBGaramond_400Regular,
  EBGaramond_500Medium,
  EBGaramond_600SemiBold,
  EBGaramond_700Bold,
  EBGaramond_800ExtraBold,
} from '@expo-google-fonts/eb-garamond';
import {
  CrimsonText_400Regular,
  CrimsonText_400Regular_Italic,
  CrimsonText_600SemiBold,
} from '@expo-google-fonts/crimson-text';

import OnboardingNavigator from './src/navigation/OnboardingNavigator';
import MainNavigator from './src/navigation/MainNavigator';
import { requestNotificationPermission } from './src/utils/notifications';
import { STORAGE_KEYS, COLOR } from './src/utils/tokens';
import { RSVPProvider } from './src/context/RSVPContext';
import { ThemeProvider } from './src/context/ThemeContext';
import { MW_LAYOUT } from './src/utils/mywarwickTokens';

// Navigation theme — set the container background to the MyWarwick purple base so
// overscroll bounce never reveals a white backdrop behind gradient screens.
const NAV_THEME: Theme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: MW_LAYOUT.purple },
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [onboarded, setOnboarded] = useState(false);

  const [fontsLoaded] = useFonts({
    EBGaramond_400Regular,
    EBGaramond_500Medium,
    EBGaramond_600SemiBold,
    EBGaramond_700Bold,
    EBGaramond_800ExtraBold,
    CrimsonText_400Regular,
    CrimsonText_400Regular_Italic,
    CrimsonText_600SemiBold,
  });

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEYS.PROFILE);
        if (raw) {
          const profile = JSON.parse(raw);
          setOnboarded(profile.onboardingComplete === true);
        }
      } catch (e) {
        console.warn('Error reading profile', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleOnboardingComplete = async () => {
    await requestNotificationPermission();
    setOnboarded(true);
  };

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={COLOR.accent} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RSVPProvider>
          <NavigationContainer theme={NAV_THEME}>
            {onboarded ? (
              <MainNavigator onLogout={() => setOnboarded(false)} />
            ) : (
              <OnboardingNavigator onComplete={handleOnboardingComplete} />
            )}
          </NavigationContainer>
        </RSVPProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: COLOR.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
