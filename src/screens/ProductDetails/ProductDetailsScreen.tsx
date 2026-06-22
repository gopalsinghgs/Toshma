/**
 * @file ProductDetailsScreen.tsx
 * @description Full-page product detail screen — opened when a user taps a
 *   hotspot dot on the shoppable image.
 *
 * Layout (IKEA PIP-inspired):
 *   ┌────────────────────────────────────────┐
 *   │  ← Back button          ♡ Wishlist     │  ← header
 *   ├────────────────────────────────────────┤
 *   │  [Main product image]                  │
 *   │  ○ ○ ● ○   (dot pager)                 │
 *   ├────────────────────────────────────────┤
 *   │  FÄRJKARL                              │  ← product name
 *   │  Display cabinet, white               │  ← type
 *   │  ★★★★☆  (4.0)                          │  ← rating row
 *   │  €249                                  │  ← price
 *   ├────────────────────────────────────────┤
 *   │  Description paragraph                 │
 *   ├────────────────────────────────────────┤
 *   │  📦  Delivery — check availability     │
 *   │  🏬  Store  — check store availability │
 *   ├────────────────────────────────────────┤
 *   │  Article no. 40597644                  │
 *   ├────────────────────────────────────────┤
 *   │  [  –  ]  1  [  +  ]  [Add to Cart]   │  ← sticky footer
 *   └────────────────────────────────────────┘
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, FontSize, FontWeight, Spacing } from '../../constants';
import type { ProductDetailsScreenProps } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const IMAGE_HEIGHT = SCREEN_WIDTH; // 1:1 square, mirrors IKEA PIP

/**
 * Gallery images for the product detail page.
 * When a real product already has a thumbnailUrl we use it as the first image;
 * the remaining slots are filled with Unsplash placeholder images that are
 * visually appropriate for an e-commerce context.
 *
 * In a production app these would come from an API response keyed on
 * product.id.
 */
const GALLERY_PLACEHOLDERS = [
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80&fit=crop',
  'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&q=80&fit=crop',
];

// ─── Star rating row ──────────────────────────────────────────────────────────

interface StarRatingProps {
  rating: number; // 0–5, supports halves
  count: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating, count }) => {
  const stars = Array.from({ length: 5 }, (_, i) => {
    if (i < Math.floor(rating)) return 'full';
    if (i < rating) return 'half';
    return 'empty';
  });

  return (
    <View style={ratingStyles.row} accessibilityLabel={`Rating: ${rating} out of 5, ${count} reviews`}>
      {stars.map((type, i) => (
        <Text key={i} style={ratingStyles.star}>
          {type === 'full' ? '★' : type === 'half' ? '½' : '☆'}
        </Text>
      ))}
      <Text style={ratingStyles.count}>({count})</Text>
    </View>
  );
};

const ratingStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing[1],
    marginBottom: Spacing[3],
  },
  star: {
    fontSize: FontSize.base,
    color: '#F59E0B',
    marginRight: 1,
  },
  count: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginLeft: Spacing[1],
  },
});

// ─── Quantity stepper ─────────────────────────────────────────────────────────

interface QuantityStepperProps {
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
}

const QuantityStepper: React.FC<QuantityStepperProps> = ({
  value,
  onDecrement,
  onIncrement,
}) => (
  <View style={stepperStyles.container} accessibilityRole="spinbutton" accessibilityValue={{ now: value, min: 1, max: 99 }}>
    <TouchableOpacity
      style={[stepperStyles.btn, value <= 1 && stepperStyles.btnDisabled]}
      onPress={onDecrement}
      disabled={value <= 1}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Decrease quantity"
    >
      <Text style={stepperStyles.btnText}>−</Text>
    </TouchableOpacity>

    <Text style={stepperStyles.value}>{value}</Text>

    <TouchableOpacity
      style={[stepperStyles.btn, value >= 99 && stepperStyles.btnDisabled]}
      onPress={onIncrement}
      disabled={value >= 99}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Increase quantity"
    >
      <Text style={stepperStyles.btnText}>+</Text>
    </TouchableOpacity>
  </View>
);

const stepperStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutral[300],
    borderRadius: 8,
    overflow: 'hidden',
  },
  btn: {
    width: 44,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[50],
  },
  btnDisabled: {
    opacity: 0.35,
  },
  btnText: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.regular,
    color: Colors.text.primary,
    lineHeight: 28,
  },
  value: {
    width: 44,
    textAlign: 'center',
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
});

// ─── Availability row ─────────────────────────────────────────────────────────

interface AvailabilityRowProps {
  icon: string;
  label: string;
  sublabel: string;
  onPress: () => void;
}

const AvailabilityRow: React.FC<AvailabilityRowProps> = ({
  icon,
  label,
  sublabel,
  onPress,
}) => (
  <TouchableOpacity
    style={availStyles.row}
    onPress={onPress}
    activeOpacity={0.7}
    accessibilityRole="button"
    accessibilityLabel={`${label}: ${sublabel}`}
  >
    <Text style={availStyles.icon}>{icon}</Text>
    <View style={availStyles.textBlock}>
      <Text style={availStyles.label}>{label}</Text>
      <Text style={availStyles.sublabel}>{sublabel}</Text>
    </View>
    <Text style={availStyles.chevron}>›</Text>
  </TouchableOpacity>
);

const availStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[200],
  },
  icon: {
    fontSize: 22,
    marginRight: Spacing[3],
    width: 30,
    textAlign: 'center',
  },
  textBlock: {
    flex: 1,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  sublabel: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 2,
  },
  chevron: {
    fontSize: FontSize.xl,
    color: Colors.neutral[400],
    lineHeight: 24,
  },
});

// ─── Image gallery dot indicator ──────────────────────────────────────────────

interface GalleryDotsProps {
  count: number;
  activeIndex: number;
}

const GalleryDots: React.FC<GalleryDotsProps> = ({ count, activeIndex }) => (
  <View style={galleryDotsStyles.row} accessibilityElementsHidden>
    {Array.from({ length: count }).map((_, i) => (
      <View
        key={i}
        style={[
          galleryDotsStyles.dot,
          i === activeIndex
            ? galleryDotsStyles.dotActive
            : galleryDotsStyles.dotIdle,
        ]}
      />
    ))}
  </View>
);

const galleryDotsStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[2],
    gap: 5,
  },
  dot: {
    borderRadius: 4,
    height: 7,
  },
  dotIdle: {
    width: 7,
    backgroundColor: Colors.neutral[300],
  },
  dotActive: {
    width: 18,
    backgroundColor: Colors.primary[600],
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

const ProductDetailsScreen: React.FC<ProductDetailsScreenProps> = ({
  route,
  navigation,
}) => {
  const { product } = route.params;
  const insets = useSafeAreaInsets();

  // ── Build gallery images ──────────────────────────────────────────────────
  const galleryImages: string[] = product.thumbnailUrl
    ? [product.thumbnailUrl, ...GALLERY_PLACEHOLDERS.slice(1)]
    : GALLERY_PLACEHOLDERS;

  // ── Gallery scroll state ──────────────────────────────────────────────────
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveImageIndex(viewableItems[0].index);
      }
    },
  ).current;
  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  // ── Quantity stepper state ────────────────────────────────────────────────
  const [quantity, setQuantity] = useState(1);
  const decrement = useCallback(
    () => setQuantity((q) => Math.max(1, q - 1)),
    [],
  );
  const increment = useCallback(
    () => setQuantity((q) => Math.min(99, q + 1)),
    [],
  );

  // ── Wishlist state (local toggle, no persistence needed for the demo) ─────
  const [isWishlisted, setIsWishlisted] = useState(false);
  const toggleWishlist = useCallback(
    () => setIsWishlisted((v) => !v),
    [],
  );

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = useCallback(() => {
    Alert.alert(
      'Added to cart',
      `${quantity} × ${product.name} (${product.price}) added to your cart.`,
      [{ text: 'OK' }],
    );
  }, [quantity, product]);

  // ── Open product URL in browser ───────────────────────────────────────────
  const handleOpenProductUrl = useCallback(async () => {
    const canOpen = await Linking.canOpenURL(product.productUrl);
    if (canOpen) {
      await Linking.openURL(product.productUrl);
    } else {
      Alert.alert('Cannot open link', product.productUrl);
    }
  }, [product.productUrl]);

  return (
    <View
      style={[
        styles.root,
        {
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background.primary} />

      {/* ── Sticky header (back + wishlist) ─────────────────────────────── */}
      <View style={[styles.headerBar, { paddingTop: insets.top + Spacing[2] }]}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Text style={styles.headerBtnText}>←</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={toggleWishlist}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Text style={[styles.headerBtnText, isWishlisted && styles.wishlisted]}>
            {isWishlisted ? '♥' : '♡'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* ── Scrollable body ─────────────────────────────────────────────── */}
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Image gallery ─────────────────────────────────────────────── */}
        <View style={styles.galleryContainer}>
          <FlatList
            data={galleryImages}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            bounces={false}
            decelerationRate="fast"
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            renderItem={({ item }) => (
              <Image
                source={{ uri: item }}
                style={styles.galleryImage}
                resizeMode="cover"
                accessibilityLabel={`${product.name} product image`}
              />
            )}
          />
          <GalleryDots count={galleryImages.length} activeIndex={activeImageIndex} />
        </View>

        {/* ── Product info block ────────────────────────────────────────── */}
        <View style={styles.infoBlock}>
          {/* Name + type */}
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productType}>{product.type}</Text>

          {/* Star rating — using a demo value; a real app would pass this
              in the product object from the API */}
          <StarRating rating={4.0} count={1} />

          {/* Price */}
          <Text style={styles.productPrice}>{product.price}</Text>
        </View>

        {/* ── Description ───────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About this product</Text>
          <Text style={styles.descriptionText}>
            A well-designed piece from the {product.name} collection. Perfect
            for modern living spaces, it combines functionality with
            Scandinavian aesthetics. Durable materials ensure long-lasting use
            while keeping your home looking its best.
          </Text>
          <Text style={styles.articleNo}>
            Article no. {product.id}
          </Text>
        </View>

        {/* ── Availability section ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to get it</Text>
          <AvailabilityRow
            icon="🚚"
            label="Delivery"
            sublabel="Check delivery availability"
            onPress={handleOpenProductUrl}
          />
          <AvailabilityRow
            icon="🏬"
            label="Store"
            sublabel="Check in-store availability"
            onPress={handleOpenProductUrl}
          />
        </View>

        {/* ── Product details accordion rows ───────────────────────────── */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.accordionRow}
            onPress={handleOpenProductUrl}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.accordionLabel}>Product details</Text>
            <Text style={styles.accordionChevron}>›</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.accordionRow}
            onPress={handleOpenProductUrl}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Text style={styles.accordionLabel}>Measurements</Text>
            <Text style={styles.accordionChevron}>›</Text>
          </TouchableOpacity>
        </View>

        {/* Bottom padding so content clears the sticky footer */}
        <View style={styles.footerSpacer} />
      </ScrollView>

      {/* ── Sticky footer — quantity + add to cart ──────────────────────── */}
      <View
        style={[
          styles.footer,
          {
            paddingBottom: Math.max(insets.bottom, Spacing[4]),
            borderTopColor: Colors.neutral[200],
          },
        ]}
      >
        <QuantityStepper
          value={quantity}
          onDecrement={decrement}
          onIncrement={increment}
        />

        <TouchableOpacity
          style={styles.addToCartBtn}
          onPress={handleAddToCart}
          activeOpacity={0.85}
          accessibilityRole="button"
          accessibilityLabel={`Add ${quantity} ${product.name} to cart for ${product.price} each`}
        >
          <Text style={styles.addToCartText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background.primary,
  },

  // ── Header bar ─────────────────────────────────────────────────────────────
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing[2],
    paddingBottom: Spacing[2],
    backgroundColor: Colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[200],
    zIndex: 10,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 2 },
    }),
  },
  headerBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBtnText: {
    fontSize: FontSize.xl,
    color: Colors.text.primary,
    lineHeight: 28,
  },
  wishlisted: {
    color: '#E53E3E',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },

  // ── Scroll ─────────────────────────────────────────────────────────────────
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing[4],
  },

  // ── Gallery ────────────────────────────────────────────────────────────────
  galleryContainer: {
    backgroundColor: Colors.neutral[100],
  },
  galleryImage: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },

  // ── Info block ─────────────────────────────────────────────────────────────
  infoBlock: {
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[2],
    backgroundColor: Colors.background.primary,
  },
  productName: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    letterSpacing: -0.5,
  },
  productType: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    marginTop: Spacing[1],
    fontWeight: FontWeight.regular,
  },
  productPrice: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    marginTop: Spacing[1],
  },

  // ── Sections ───────────────────────────────────────────────────────────────
  section: {
    marginTop: Spacing[4],
    paddingHorizontal: Spacing[5],
    paddingVertical: Spacing[4],
    backgroundColor: Colors.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.neutral[200],
  },
  sectionTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    marginBottom: Spacing[3],
  },
  descriptionText: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
    lineHeight: 22,
  },
  articleNo: {
    fontSize: FontSize.xs,
    color: Colors.text.disabled,
    marginTop: Spacing[3],
  },

  // ── Accordion rows ─────────────────────────────────────────────────────────
  accordionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[100],
  },
  accordionLabel: {
    flex: 1,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  accordionChevron: {
    fontSize: FontSize.xl,
    color: Colors.neutral[400],
    lineHeight: 24,
  },

  // ── Footer spacer ──────────────────────────────────────────────────────────
  footerSpacer: {
    height: Spacing[20],
  },

  // ── Sticky footer ──────────────────────────────────────────────────────────
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing[3],
    paddingTop: Spacing[3],
    paddingHorizontal: Spacing[5],
    backgroundColor: Colors.background.primary,
    borderTopWidth: StyleSheet.hairlineWidth,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutral[900],
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 8 },
    }),
  },
  addToCartBtn: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: Colors.primary[600],
    alignItems: 'center',
    justifyContent: 'center',
  },
  addToCartText: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.bold,
    color: Colors.neutral[0],
    letterSpacing: 0.2,
  },
});

export default ProductDetailsScreen;
