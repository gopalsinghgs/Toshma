/**
 * @file HotspotDot.tsx
 * @description An animated, accessible dot overlaid on the shoppable image.
 *
 * Fix applied (v2):
 *   The previous version had `position: 'absolute'` on the touchTarget style.
 *   The parent hotspotAnchor View is ALREADY absolutely positioned at the
 *   correct pixel coordinate. When HotspotDot also declared itself absolute,
 *   React Native ripped it out of the hotspotAnchor's layout context and
 *   placed it at (0,0) of the nearest positioned ancestor — the image
 *   container — making ALL dots stack on top of each other at the top-left.
 *
 *   Fix: remove `position: 'absolute'` from touchTarget. The parent handles
 *   placement; this component just needs to be centered over its anchor point
 *   using a negative margin transform.
 *
 * Behaviour:
 *  - Idle: pulsing ring animation draws the eye (matches IKEA's CSS animation).
 *  - Active: ring stops and the dot colour darkens to confirm selection.
 *  - Full accessibility: role="button", descriptive label, and minimum 44×44
 *    touch target size per WCAG 2.5.5 (Target Size).
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors } from '../../constants';
import type { HotspotDotProps } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const DOT_SIZE = 22;
const TOUCH_TARGET = 44; // WCAG minimum touch target
const PULSE_SCALE_MAX = 2.2;
const PULSE_DURATION_MS = 1400;

// ─── Component ────────────────────────────────────────────────────────────────

const HotspotDot: React.FC<HotspotDotProps> = ({ hotspot, isActive, onPress }) => {
  const pulseScale = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0.6)).current;
  const pulseAnimation = useRef<Animated.CompositeAnimation | null>(null);

  // ── Start / stop pulse based on active state ──────────────────────────────
  useEffect(() => {
    if (isActive) {
      pulseAnimation.current?.stop();
      Animated.parallel([
        Animated.spring(pulseScale, { toValue: 1, useNativeDriver: true }),
        Animated.timing(pulseOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
      return;
    }

    pulseAnimation.current = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: PULSE_SCALE_MAX,
            duration: PULSE_DURATION_MS,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0,
            duration: PULSE_DURATION_MS,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseScale, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(pulseOpacity, {
            toValue: 0.6,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ]),
    );
    pulseAnimation.current.start();

    return () => pulseAnimation.current?.stop();
  }, [isActive, pulseScale, pulseOpacity]);

  const handlePress = () => onPress(hotspot);

  return (
    /*
     * CRITICAL FIX: `position: 'absolute'` is REMOVED from touchTarget.
     *
     * The parent <View> in ShoppableImage already positions this component
     * at the correct pixel coordinate via:
     *   style={{ position: 'absolute', left: leftPx, top: topPx }}
     *
     * If we also declare position:'absolute' here, RN pulls HotspotDot out
     * of the hotspotAnchor flow and places all dots at (0,0) of the image.
     *
     * Centering over the anchor point is done with a negative margin
     * (shifting left and up by half the touch target size) so the dot's
     * visual centre sits exactly on the coordinate.
     */
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.85}
      style={styles.touchTarget}
      accessibilityRole="button"
      accessibilityLabel={`View ${hotspot.product.name}, ${hotspot.product.type}, ${hotspot.product.price}`}
      accessibilityHint="Double-tap to open product details"
    >
      {/* Pulsing ring (only visible when idle) */}
      {!isActive && (
        <Animated.View
          style={[
            styles.pulse,
            {
              transform: [{ scale: pulseScale }],
              opacity: pulseOpacity,
            },
          ]}
        />
      )}

      {/* Solid dot */}
      <View style={[styles.dot, isActive && styles.dotActive]} />
    </TouchableOpacity>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  touchTarget: {
    width: TOUCH_TARGET,
    height: TOUCH_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    /*
     * NO position: 'absolute' here — the parent hotspotAnchor View handles
     * absolute placement. We only need the negative margin to visually centre
     * the 44×44 touch target over the anchor point pixel.
     */
    marginLeft: -(TOUCH_TARGET / 2),
    marginTop: -(TOUCH_TARGET / 2),
  },

  pulse: {
    position: 'absolute',
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.neutral[0],
    borderWidth: 2,
    borderColor: Colors.neutral[0],
  },

  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: Colors.primary[600],
    borderWidth: 3,
    borderColor: Colors.neutral[0],
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },

  dotActive: {
    backgroundColor: Colors.primary[800],
    borderColor: Colors.primary[200],
  },
});

export default HotspotDot;
