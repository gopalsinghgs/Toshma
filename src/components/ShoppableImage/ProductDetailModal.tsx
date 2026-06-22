/**
 * @file ProductDetailModal.tsx
 * @description Bottom-sheet modal that shows full product details when a
 *   hotspot is tapped — equivalent to clicking an IKEA product dot and seeing
 *   the expanded product card.
 *
 * Visual layout:
 *   ┌──────────────────────────────────┐
 *   │  ────  (drag handle)             │
 *   │                                  │
 *   │  [Product Image]                 │
 *   │                                  │
 *   │  FÄRJKARL                        │
 *   │  Mobile cabinet with 2 doors     │
 *   │                                  │
 *   │  €149                            │
 *   │                                  │
 *   │  [  Buy Now  ]  [  Close  ]      │
 *   └──────────────────────────────────┘
 */

import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { Colors, FontSize, FontWeight, Spacing } from '../../constants';
import type { ProductDetailModalProps } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const SHEET_HEIGHT = SCREEN_HEIGHT * 0.52;
const SLIDE_DURATION_MS = 300;

// ─── Component ────────────────────────────────────────────────────────────────

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  hotspot,
  visible,
  onClose,
  onBuyPress,
}) => {
  const slideY = useRef(new Animated.Value(SHEET_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: 0,
          duration: SLIDE_DURATION_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: SLIDE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: SHEET_HEIGHT,
          duration: SLIDE_DURATION_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: SLIDE_DURATION_MS,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideY, backdropOpacity]);

  const product = hotspot?.product;
  if (!product) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
      accessibilityViewIsModal
    >
      {/* Backdrop — tap to dismiss */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
      </Animated.View>

      {/* Bottom sheet */}
      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: slideY }] }]}
        accessibilityRole="none"
      >
        {/* Drag handle */}
        <View style={styles.handle} />

        {/* Product thumbnail */}
        {product.thumbnailUrl ? (
          <Image
            source={{ uri: product.thumbnailUrl }}
            style={styles.productImage}
            resizeMode="cover"
            accessibilityLabel={`${product.name} product image`}
          />
        ) : (
          <View style={[styles.productImage, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>📦</Text>
          </View>
        )}

        {/* Product info */}
        <View style={styles.infoContainer}>
          <View style={styles.nameRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productPrice}>{product.price}</Text>
          </View>
          <Text style={styles.productType}>{product.type}</Text>
          <Text style={styles.productId}>Article no. {product.id}</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          {/*
           * "View Details" navigates to the full ProductDetailsScreen.
           * The onBuyPress callback is wired in ShoppableSlide to call
           * navigation.navigate('ProductDetails', { product }) — so we
           * don't need navigation directly in this presentational component.
           */}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => onBuyPress(product)}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel={`View full details for ${product.name}`}
          >
            <Text style={styles.buyButtonText}>View Details</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.closeButton}
            onPress={onClose}
            activeOpacity={0.75}
            accessibilityRole="button"
            accessibilityLabel="Close product preview"
          >
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </Modal>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: SHEET_HEIGHT,
    backgroundColor: Colors.background.primary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    paddingHorizontal: Spacing[5],
    paddingBottom: Spacing[8],
  },

  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutral[300],
    alignSelf: 'center',
    marginTop: Spacing[2],
    marginBottom: Spacing[4],
  },

  productImage: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: Colors.neutral[100],
    marginBottom: Spacing[4],
  },

  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  placeholderText: {
    fontSize: 40,
  },

  infoContainer: {
    marginBottom: Spacing[5],
  },

  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing[1],
  },

  productName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    flex: 1,
    marginRight: Spacing[3],
  },

  productPrice: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extraBold,
    color: Colors.primary[600],
  },

  productType: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
    marginBottom: Spacing[1],
  },

  productId: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.text.disabled,
  },

  actionsRow: {
    flexDirection: 'row',
    gap: Spacing[3],
  },

  buyButton: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },

  buyButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.inverse,
  },

  closeButton: {
    flex: 1,
    height: 52,
    borderRadius: 10,
    backgroundColor: Colors.neutral[100],
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
});

export default ProductDetailModal;
