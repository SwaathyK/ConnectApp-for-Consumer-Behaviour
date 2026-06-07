import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Text, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import FeedScreen from '../screens/main/FeedScreen';
import EventDetailScreen from '../screens/main/EventDetailScreen';
import SavedScreen from '../screens/main/SavedScreen';
import ProfileScreen from '../screens/main/ProfileScreen';
import NotificationScreen from '../screens/main/NotificationScreen';
import PeopleScreen from '../screens/main/PeopleScreen';
import { MainTabParamList, FeedStackParamList } from '../types';
import { COLOR, FONTS, TYPE } from '../utils/tokens';
import { MW_COLOR } from '../utils/mywarwickTokens';
import { useTheme } from '../context/ThemeContext';

const Tab = createBottomTabNavigator<MainTabParamList>();
const FeedStack = createNativeStackNavigator<FeedStackParamList>();

function FeedNavigator() {
  return (
    <FeedStack.Navigator screenOptions={{ headerShown: false }}>
      <FeedStack.Screen name="EventFeed" component={FeedScreen} />
      <FeedStack.Screen name="EventDetail" component={EventDetailScreen} />
    </FeedStack.Navigator>
  );
}

function StubScreen({ label }: { label: string }) {
  return (
    <SafeAreaView style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text style={{ color: '#999', fontSize: 14 }}>{label} — coming soon</Text>
    </SafeAreaView>
  );
}

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

const TAB_ICONS_OUTLINE: Record<string, IoniconsName> = {
  Home:    'home-outline',
  Events:  'calendar-outline',
  People:  'people-outline',
  Alerts:  'notifications-outline',
  Profile: 'person-outline',
};

const TAB_ICONS_FILLED: Record<string, IoniconsName> = {
  Home:    'home',
  Events:  'calendar',
  People:  'people',
  Alerts:  'notifications',
  Profile: 'person',
};

type Props = { onLogout: () => void };

export default function MainNavigator({ onLogout }: Props) {
  const { isMyWarwick } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: isMyWarwick ? mwTabBar : edTabBar,
        tabBarLabel: ({ focused }) => (
          <Text style={isMyWarwick
            ? [mwStyles.tabLabel, focused && mwStyles.tabLabelActive]
            : [edStyles.tabLabel, focused && edStyles.tabLabelActive]
          }>
            {route.name}
          </Text>
        ),
        tabBarIcon: ({ focused }) => (
          isMyWarwick ? (
            <Ionicons
              name={focused ? (TAB_ICONS_FILLED[route.name] ?? 'ellipse') : (TAB_ICONS_OUTLINE[route.name] ?? 'ellipse-outline')}
              size={22}
              color={focused ? MW_COLOR.tabActive : MW_COLOR.tabInactive}
            />
          ) : (
            <View style={[edStyles.tabDot, focused && edStyles.tabDotActive]} />
          )
        ),
      })}
    >
      <Tab.Screen
        name="Home"
        component={FeedNavigator}
        options={({ route }) => {
          // Hide the floating tab bar on the Event Detail screen so its RSVP grid has full room.
          const routeName = getFocusedRouteNameFromRoute(route) ?? 'EventFeed';
          if (routeName === 'EventDetail') {
            return { tabBarStyle: { display: 'none' } };
          }
          return { tabBarStyle: isMyWarwick ? mwTabBar : edTabBar };
        }}
      />
      <Tab.Screen name="Events" component={SavedScreen} />
      <Tab.Screen name="People" component={PeopleScreen} />
      <Tab.Screen name="Alerts" component={NotificationScreen} />
      <Tab.Screen
        name="Profile"
        children={() => <ProfileScreen onLogout={onLogout} />}
      />
    </Tab.Navigator>
  );
}

// ── MyWarwick tab bar — floating pill style ───────────────────────────────────
const mwTabBar: object = {
  backgroundColor: MW_COLOR.tabBar,
  borderTopWidth: 0,
  borderRadius: 28,
  marginHorizontal: 20,
  marginBottom: 24,
  height: 64,
  paddingBottom: 8,
  paddingTop: 8,
  position: 'absolute',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
};

const mwStyles = StyleSheet.create({
  tabLabel: { fontSize: 10, color: MW_COLOR.tabInactive, marginTop: 2 },
  tabLabelActive: { color: MW_COLOR.tabActive, fontWeight: '600' },
});

// ── Editorial tab bar ─────────────────────────────────────────────────────────
const edTabBar: object = {
  backgroundColor: COLOR.surface,
  borderTopColor: COLOR.borderSubtle,
  borderTopWidth: 1,
  height: 72,
  paddingBottom: 12,
  paddingTop: 8,
};

const edStyles = StyleSheet.create({
  tabLabel: { fontFamily: FONTS.body, fontSize: TYPE.xs, color: COLOR.textDisabled, letterSpacing: 0.5, marginTop: 4 },
  tabLabelActive: { color: COLOR.accent, fontFamily: FONTS.bodySemi },
  tabDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: 'transparent' },
  tabDotActive: { backgroundColor: COLOR.accent },
});
