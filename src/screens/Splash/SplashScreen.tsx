/**
 * @file SplashScreen.tsx
 * @description Entry screen shown on app launch.
 *
 * Layout mirrors the ToshmaLabs website header:
 *   [Logo image]  Toshma Labs   (flex-row, items-center, centered on screen)
 *
 * After SPLASH_DURATION_MS the navigator automatically replaces this screen
 * with the Product screen so the back-button cannot return to the splash.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Images } from '../../assets';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants';
import type { SplashScreenProps } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SPLASH_DURATION_MS = 4_000; // 4 seconds before navigating away
const FADE_IN_DURATION_MS = 800;
const LOGO_SIZE = 72; // matches lg:w-16 → xl:w-18 range on web, scaled for mobile

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// ─── Component ────────────────────────────────────────────────────────────────

const SplashScreen: React.FC<SplashScreenProps> = ({ navigation }) => {
  // Animated values for the entrance animation
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateX = useRef(new Animated.Value(-16)).current;

  useEffect(() => {
    // ── 1. Entrance animation ──────────────────────────────────────────────
    Animated.parallel([
      // Logo fades + scales up
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: FADE_IN_DURATION_MS,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
      // Brand text slides in from the left and fades
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: FADE_IN_DURATION_MS,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(textTranslateX, {
        toValue: 0,
        duration: FADE_IN_DURATION_MS,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // ── 2. Navigate to Product after SPLASH_DURATION_MS ────────────────────
    const timer = setTimeout(() => {
      navigation.replace('Product');
    }, SPLASH_DURATION_MS);

    return () => clearTimeout(timer);
  }, [navigation, logoOpacity, logoScale, textOpacity, textTranslateX]);

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.splash}
        translucent={false}
      />

      {/**
       * Brand lockup — logo + wordmark side by side, centred on screen.
       * Matches the <a class="flex items-center"> pattern from the website.
       */}
      <View style={styles.brandLockup}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrapper,
            { opacity: logoOpacity, transform: [{ scale: logoScale }] },
          ]}
        >
          <Image
            source={Images.toshmaLabsLogo}
            style={styles.logo}
            resizeMode="contain"
            accessibilityLabel="Toshma Labs Logo"
          />
        </Animated.View>

        {/* Wordmark — "Toshma Labs" */}
        <Animated.View
          style={{
            opacity: textOpacity,
            transform: [{ translateX: textTranslateX }],
          }}
        >
          <Text style={styles.brandText}>Toshma Labs</Text>
        </Animated.View>
      </View>

      {/* Tagline below lockup (optional, subtle) */}
      <Animated.Text style={[styles.tagline, { opacity: textOpacity }]}>
        Building the future, one product at a time.
      </Animated.Text>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.splash,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing[6],
  },

  /**
   * flex-row + items-center mirrors the website's
   * `class="flex items-center"` on the <a> wrapper.
   */
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: SCREEN_WIDTH * 0.75,
  },

  logoWrapper: {
    // Slight downward offset mirrors `translate-y-1` on the web logo
    marginTop: Spacing[1],
    marginRight: Spacing[2],
  },

  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },

  /**
   * font-extrabold text-primary-600 from the brand stylesheet.
   * On mobile we use a fixed xl size (24 sp) — readable on all screen sizes.
   */
  brandText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.brand, // #2563EB  ← text-primary-600
    letterSpacing: -0.4,
    includeFontPadding: false,
  },

  tagline: {
    marginTop: Spacing[4],
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    textAlign: 'center',
  },
});

export default SplashScreen;
