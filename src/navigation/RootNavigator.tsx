/**
 * @file RootNavigator.tsx
 * @description Root stack navigator for the ToshmaLabs app.
 *
 * Responsibilities:
 *  - Declares all top-level routes.
 *  - Sets global screen options (header hidden on Splash, visible on Product).
 *  - Initial route is always Splash; the splash screen itself drives the
 *    timed replace() to Product so no back-navigation to splash is possible.
 *
 * This file is intentionally thin — it wires routes to screens only.
 * Business logic lives inside each screen or its associated hooks/services.
 */

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { SplashScreen, ProductScreen, ProductDetailsScreen } from '../screens';
import { Colors } from '../constants';
import type { RootStackParamList } from '../types';

// ─── Navigator instance ───────────────────────────────────────────────────────

const Stack = createNativeStackNavigator<RootStackParamList>();

// ─── Component ────────────────────────────────────────────────────────────────

const RootNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        // Disable the default back-gesture on Android for Splash
        gestureEnabled: false,
        // Smooth cross-fade between Splash → Product
        animation: 'fade',
        contentStyle: {
          backgroundColor: Colors.background.primary,
        },
      }}
    >
      {/* ── Splash ──────────────────────────────────────────────────────── */}
      <Stack.Screen
        name="Splash"
        component={SplashScreen}
        options={{
          headerShown: false, // Full-screen splash — no header chrome
          gestureEnabled: false,
        }}
      />

      {/* ── Product ─────────────────────────────────────────────────────── */}
      <Stack.Screen
        name="Product"
        component={ProductScreen}
        options={{
          headerShown: false, // Product screen renders its own branded header
          gestureEnabled: false, // Cannot swipe back to Splash
        }}
      />

      {/* ── ProductDetails ──────────────────────────────────────────────── */}
      <Stack.Screen
        name="ProductDetails"
        component={ProductDetailsScreen}
        options={{
          headerShown: false,  // Screen renders its own header bar
          gestureEnabled: true, // Allow swipe-back to Product
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
};

export default RootNavigator;
