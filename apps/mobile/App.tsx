import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';

import { ThemeProvider } from './src/theme/ThemeProvider';
import { AppNavigator } from './src/navigation/AppNavigator';
import { queryClient } from './src/services/queryClient';

/**
 * App — Root component.
 *
 * Provider hierarchy (outermost → innermost):
 * 1. GestureHandlerRootView — required by react-native-gesture-handler for swipe/drag
 * 2. SafeAreaProvider — supplies safe area insets to all descendant screens
 * 3. ThemeProvider — injects the design system tokens via context
 * 4. QueryClientProvider — provides the TanStack Query cache to all hooks
 * 5. NavigationContainer — React Navigation root
 * 6. AppNavigator — auth-aware route controller
 */
export default function App(): React.JSX.Element {
  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            <NavigationContainer>
              <StatusBar style="dark" />
              <AppNavigator />
            </NavigationContainer>
          </QueryClientProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
