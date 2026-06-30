import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import {
  RootStackParamList,
  AuthStackParamList,
  AppTabParamList,
} from './types';
import { Colors, NavigationTokens, FontFamily, FontSize } from '../constants/tokens';

// ---------------------------------------------------------------------------
// Placeholder screens — replaced with real implementations in Sprint 2+
// ---------------------------------------------------------------------------
import { View, Text, StyleSheet } from 'react-native';

function PlaceholderScreen({ name }: { name: string }): React.JSX.Element {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  placeholder: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.backgroundDefault },
  placeholderText: { fontSize: FontSize.headingMedium, color: Colors.textMuted, fontFamily: FontFamily.body },
});

// ---------------------------------------------------------------------------
// Navigators
// ---------------------------------------------------------------------------

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppTab = createBottomTabNavigator<AppTabParamList>();

function AuthNavigator(): React.JSX.Element {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen
        name="Login"
        component={() => <PlaceholderScreen name="Login — Sprint 2" />}
      />
    </AuthStack.Navigator>
  );
}

function AppTabNavigator(): React.JSX.Element {
  return (
    <AppTab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          height: NavigationTokens.tabBarHeight,
          backgroundColor: Colors.backgroundDefault,
          borderTopWidth: 1,
          borderTopColor: Colors.borderDefault,
        },
        tabBarActiveTintColor: NavigationTokens.tabBarActiveTintColor,
        tabBarInactiveTintColor: NavigationTokens.tabBarInactiveTintColor,
        tabBarLabelStyle: {
          fontSize: FontSize.captionLarge,
          fontFamily: FontFamily.bodySemiBold,
          marginBottom: 6,
        },
      }}
    >
      <AppTab.Screen
        name="Dashboard"
        component={() => <PlaceholderScreen name="Dashboard — Sprint 2" />}
        options={{ tabBarLabel: 'Home' }}
      />
      <AppTab.Screen
        name="Catalog"
        component={() => <PlaceholderScreen name="Catalog — Sprint 3" />}
        options={{ tabBarLabel: 'Products' }}
      />
      <AppTab.Screen
        name="Orders"
        component={() => <PlaceholderScreen name="Orders — Sprint 5" />}
        options={{ tabBarLabel: 'Orders' }}
      />
      <AppTab.Screen
        name="Ledger"
        component={() => <PlaceholderScreen name="Ledger — Sprint 6" />}
        options={{ tabBarLabel: 'Ledger' }}
      />
      <AppTab.Screen
        name="Profile"
        component={() => <PlaceholderScreen name="Profile — Sprint 2" />}
        options={{ tabBarLabel: 'Profile' }}
      />
    </AppTab.Navigator>
  );
}

/**
 * AppNavigator — Root navigation controller.
 *
 * DEV_SHOW_TABS: Bypasses auth check in development so you can preview
 * all tab screens without logging in. Set to false to test the login flow.
 * This constant is REMOVED in Sprint 2 when real JWT auth is implemented.
 *
 * In production: reads isAuthenticated() from the auth store to decide
 * whether to show Auth flow or App tabs. React Navigation re-renders
 * automatically when the store value changes.
 */

// ⚠️  SPRINT 1 DEV ONLY — set to false to see the Login screen instead
const DEV_SHOW_TABS = true;

export function AppNavigator(): React.JSX.Element {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  // In dev mode, always show tabs so we can preview the full UI
  const showTabs = DEV_SHOW_TABS || isAuthenticated;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {showTabs ? (
        <RootStack.Screen name="App" component={AppTabNavigator} />
      ) : (
        <RootStack.Screen name="Auth" component={AuthNavigator} />
      )}
    </RootStack.Navigator>
  );
}
