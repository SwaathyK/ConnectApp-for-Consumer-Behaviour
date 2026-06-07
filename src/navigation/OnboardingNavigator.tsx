import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import NameScreen from '../screens/onboarding/NameScreen';
import CourseScreen from '../screens/onboarding/CourseScreen';
import CountryScreen from '../screens/onboarding/CountryScreen';
import InterestsScreen from '../screens/onboarding/InterestsScreen';

const Stack = createNativeStackNavigator();

type Props = { onComplete: () => void };

export default function OnboardingNavigator({ onComplete }: Props) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingName" component={NameScreen} />
      <Stack.Screen name="OnboardingCourse" component={CourseScreen} />
      <Stack.Screen name="OnboardingCountry" component={CountryScreen} />
      <Stack.Screen
        name="OnboardingInterests"
        children={(props) => (
          <InterestsScreen {...props} onOnboardingComplete={onComplete} />
        )}
      />
    </Stack.Navigator>
  );
}
