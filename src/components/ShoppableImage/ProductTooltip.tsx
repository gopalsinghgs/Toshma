/**
 * @file ProductTooltip.tsx
 * @description Inline tooltip callout that appears directly above a hotspot dot
 *   when it is selected, showing the product name, type, and price.
 *
 * Visual structure (mirrors the IKEA HTML `role="tooltip"` popup):
 *
 *   ┌──────────────────┐
 *   │ FÄRJKARL         │
 *   │ Cabinet          │
 *   │ €149             │
 *   └────────▲─────────┘
 *             ●  ← dot below
 *
 * The tooltip flips left/right based on `anchorX` to stay within screen bounds.
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Colors, FontSize, FontWeight, Spacing } from '../../constants';
import type { ProductTooltipProps } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const TOOLTIP_WIDTH = 160;
const CARET_SIZE = 8;

// ─── Component ────────────────────────────────────────────────────────────────

const ProductTooltip: React.FC<ProductTooltipProps> = ({
  product,
  visible,
  anchorX,
}) => {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(6)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: visible ? 1 : 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: visible ? 0 : 6,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  }, [visible, opacity, translateY]);

  if (!visible) return null;

  // Flip the tooltip horizontally if the dot is in the right 60% of the image
  const isRightAligned = anchorX > 60;

  return (
    <Animated.View
      style={[
        styles.container,
        isRightAligned ? styles.alignRight : styles.alignLeft,
        { opacity, transform: [{ translateY }] },
      ]}
      accessibilityRole="none"
      accessible
      accessibilityLabel={`${product.name}, ${product.type}, ${product.price}`}
      pointerEvents="none"
    >
      {/* Card body */}
      <View style={styles.card}>
        <Text style={styles.productName} numberOfLines={1}>
          {product.name}
        </Text>
        <Text style={styles.productType} numberOfLines={2}>
          {product.type}
        </Text>
        <Text style={styles.productPrice}>{product.price}</Text>
      </View>

      {/* Downward-pointing caret */}
      <View
        style={[
          styles.caret,
          isRightAligned ? styles.caretRight : styles.caretLeft,
        ]}
      />
    </Animated.View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: '100%',
    marginBottom: CARET_SIZE + 4,
    width: TOOLTIP_WIDTH,
    alignItems: 'center',
    zIndex: 20,
  },

  alignLeft: {
    left: -(TOOLTIP_WIDTH / 2) + 11, // centre over the dot
  },

  alignRight: {
    right: -(TOOLTIP_WIDTH / 2) + 11,
  },

  card: {
    width: TOOLTIP_WIDTH,
    backgroundColor: Colors.neutral[0],
    borderRadius: 10,
    padding: Spacing[3],
    // iOS shadow
    shadowColor: Colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    // Android shadow
    elevation: 8,
  },

  productName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    marginBottom: 2,
  },

  productType: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing[1.5],
  },

  productPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },

  // Caret (CSS triangle trick in RN)
  caret: {
    width: 0,
    height: 0,
    borderLeftWidth: CARET_SIZE,
    borderRightWidth: CARET_SIZE,
    borderTopWidth: CARET_SIZE,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.neutral[0],
  },

  caretLeft: {
    alignSelf: 'flex-start',
    marginLeft: TOOLTIP_WIDTH / 2 - CARET_SIZE,
  },

  caretRight: {
    alignSelf: 'flex-end',
    marginRight: TOOLTIP_WIDTH / 2 - CARET_SIZE,
  },
});

export default ProductTooltip;
