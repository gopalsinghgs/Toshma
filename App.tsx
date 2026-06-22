/**
 * @file App.tsx
 * @description Application composition root.
 *
 * This file is intentionally minimal — its only job is to mount
 * infrastructure providers (NavigationContainer, SafeAreaProvider, etc.)
 * and hand off to the navigator.
 *
 * Following the "smart shell / dumb tree" pattern used at Meta/Google:
 *   App.tsx  →  providers only
 *   RootNavigator  →  route declarations only
 *   Screens  →  UI + local state only
 *   Services / Store  →  business logic only
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { RootNavigator } from './src/navigation';

const App: React.FC = () => {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
