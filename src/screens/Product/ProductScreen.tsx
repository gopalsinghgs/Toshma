/**
 * @file ProductScreen.tsx
 * @description Product discovery screen — three IKEA shoppable image carousel
 *   slides with hotspot dots, tooltips, and a product detail bottom sheet.
 *
 * Architecture (v2 — SlideState anti-pattern removed):
 *
 *   Problem with the previous SlideState approach:
 *   ─────────────────────────────────────────────
 *   SlideState called `onStateChange` (a parent setState-equivalent)
 *   SYNCHRONOUSLY during its own render. React forbids mutating parent state
 *   during a child's render phase. The result was:
 *     • slideStates.current was empty on the first carousel render pass
 *     • All handleHotspotPress callbacks fell back to `() => {}` (no-ops)
 *     • State updates from SlideState never triggered carousel re-renders
 *     • Hotspot dots were completely non-interactive
 *
 *   Solution:
 *   ─────────
 *   Each slide is now its own self-contained component (ShoppableSlide) that
 *   calls useShoppableImage internally. State lives where it is consumed —
 *   inside the slide — so there is no cross-component state synchronisation
 *   needed at all. The modal is also owned by the slide, rendered via a
 *   React Portal equivalent (Modal is always full-screen regardless of
 *   where in the tree it is rendered).
 *
 *   Layout:
 *   ───────
 *   <SafeAreaView flex:1>
 *     <ScrollView vertical>
 *       Header
 *       <View height={IMAGE_HEIGHT}>          ← fixed-height carousel container
 *         <ScrollView horizontal pagingEnabled>
 *           <ShoppableSlide scene={scenes[0]} />   ← owns its own state + modal
 *           <ShoppableSlide scene={scenes[1]} />
 *           <ShoppableSlide scene={scenes[2]} />
 *         </ScrollView>
 *       </View>
 *       DotIndicator
 *       Legend
 *     </ScrollView>
 *   </SafeAreaView>
 */

import React, { useCallback, useRef, useState } from 'react';
import {
  Dimensions,
  Image,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { Images } from '../../assets';
import { ShoppableImage, ProductDetailModal } from '../../components';
import { Colors, FontSize, FontWeight, Spacing } from '../../constants';
import { SHOPPABLE_SCENES } from '../../data';
import { useShoppableImage } from '../../hooks';
import type {
  Hotspot,
  ProductScreenProps,
  RootStackParamList,
  ShoppableImageData,
  ShoppableProduct,
} from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * 4:5 aspect ratio (IKEA pub__aspect-ratio-box--4-5).
 * An explicit height on the carousel container is what makes the horizontal
 * scroll visible — without it RN collapses the scroll view to zero height.
 */
const IMAGE_HEIGHT = Math.round(SCREEN_WIDTH * (5 / 4));

// ─── ShoppableSlide ───────────────────────────────────────────────────────────

/**
 * One self-contained carousel slide.
 *
 * KEY FIX: useShoppableImage is called HERE — inside the slide — not in a
 * phantom "SlideState" child component. This means:
 *   • State is owned where it's consumed (no stale ref lookups)
 *   • handleHotspotPress is always the live closure, never a no-op
 *   • Re-renders are scoped to the individual slide — touching slide 2 never
 *     re-renders slides 1 or 3
 *   • The modal is rendered by the slide that owns the selection state, so
 *     it always has the correct hotspot data
 *
 * React.Modal renders in a full-screen layer above the entire app regardless
 * of where in the component tree it appears, so nesting it inside a slide
 * causes zero clipping or z-index issues.
 */
interface ShoppableSlideProps {
  scene: ShoppableImageData;
}

const ShoppableSlide: React.FC<ShoppableSlideProps> = React.memo(({ scene }) => {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // ── Buy handler — navigates to the full ProductDetailsScreen ──────────────
  const handleBuyPress = useCallback(
    (product: ShoppableProduct) => {
      navigation.navigate('ProductDetails', { product });
    },
    [navigation],
  );

  // ── Shoppable image state — owns the whole interaction lifecycle ───────────
  const {
    activeHotspotId,
    activeHotspot,
    isModalVisible,
    handleHotspotPress,
    handleModalClose,
    handleBuyPress: handleBuyPressFromHook,
  } = useShoppableImage(handleBuyPress);

  return (
    // overflow:'visible' so hotspot dots near image edges paint outside
    <View style={styles.slideWrapper}>
      <ShoppableImage
        data={scene}
        onHotspotPress={handleHotspotPress}
        activeHotspotId={activeHotspotId}
        imageHeight={IMAGE_HEIGHT}
      />

      {/*
       * Modal lives here — inside the slide that owns the state.
       * React Native's Modal always renders in a full-screen layer, so this
       * is NOT clipped by the slide wrapper's bounds.
       */}
      <ProductDetailModal
        hotspot={activeHotspot}
        visible={isModalVisible}
        onClose={handleModalClose}
        onBuyPress={handleBuyPressFromHook}
      />
    </View>
  );
});

// ─── DotIndicator ─────────────────────────────────────────────────────────────

interface DotIndicatorProps {
  count: number;
  activeIndex: number;
  onPress: (index: number) => void;
}

const DotIndicator: React.FC<DotIndicatorProps> = ({
  count,
  activeIndex,
  onPress,
}) => (
  <View style={styles.dotRow} accessibilityRole="tablist">
    {Array.from({ length: count }).map((_, i) => (
      <TouchableOpacity
        key={i}
        onPress={() => onPress(i)}
        accessibilityRole="tab"
        accessibilityLabel={`Slide ${i + 1}`}
        accessibilityState={{ selected: i === activeIndex }}
        hitSlop={{ top: 10, bottom: 10, left: 8, right: 8 }}
      >
        <View
          style={[
            styles.dot,
            i === activeIndex ? styles.dotActive : styles.dotIdle,
          ]}
        />
      </TouchableOpacity>
    ))}
  </View>
);

// ─── LegendRow ────────────────────────────────────────────────────────────────

interface LegendRowProps {
  hotspot: Hotspot;
  index: number;
}

const LegendRow: React.FC<LegendRowProps> = ({ hotspot, index }) => (
  <TouchableOpacity
    style={styles.legendRow}
    activeOpacity={0.7}
    onPress={() => Linking.openURL(hotspot.product.productUrl)}
    accessibilityRole="link"
    accessibilityLabel={`${hotspot.product.name}, ${hotspot.product.type}, ${hotspot.product.price}`}
  >
    <View style={styles.legendBadge}>
      <Text style={styles.legendBadgeText}>{index + 1}</Text>
    </View>
    <View style={styles.legendInfo}>
      <Text style={styles.legendName} numberOfLines={1}>
        {hotspot.product.name}
      </Text>
      <Text style={styles.legendType} numberOfLines={1}>
        {hotspot.product.type}
      </Text>
    </View>
    <View style={styles.legendRight}>
      <Text style={styles.legendPrice}>{hotspot.product.price}</Text>
      <Text style={styles.legendChevron}>›</Text>
    </View>
  </TouchableOpacity>
);

// ─── ProductScreen ────────────────────────────────────────────────────────────

const ProductScreen: React.FC<ProductScreenProps> = () => {
  const insets = useSafeAreaInsets();
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const carouselScrollRef = useRef<ScrollView>(null);

  // ── Detect active slide from horizontal scroll position ───────────────────
  const handleCarouselScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const index = Math.round(
        e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
      );
      setActiveSlideIndex((prev) => (index !== prev ? index : prev));
    },
    [],
  );

  // ── Dot indicator → scroll to slide ──────────────────────────────────────
  const scrollToSlide = useCallback((index: number) => {
    carouselScrollRef.current?.scrollTo({
      x: SCREEN_WIDTH * index,
      animated: true,
    });
    setActiveSlideIndex(index);
  }, []);

  const activeScene = SHOPPABLE_SCENES[activeSlideIndex];

  return (
    <View
      style={[
        styles.safeArea,
        {
          paddingTop: insets.top,
          paddingBottom: insets.bottom,
          paddingLeft: insets.left,
          paddingRight: insets.right,
        },
      ]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={Colors.background.primary}
      />

      {/* ── Outer vertical scroll ──────────────────────────────────────── */}
      <ScrollView
        style={styles.outerScroll}
        contentContainerStyle={styles.outerScrollContent}
        showsVerticalScrollIndicator={false}
        bounces
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <View style={styles.brandLockup}>
            <Image
              source={Images.toshmaLabsLogo}
              style={styles.brandLogo}
              resizeMode="contain"
              accessibilityLabel="Toshma Labs Logo"
            />
            <Text style={styles.brandName}>Toshma Labs</Text>
          </View>
          <Text style={styles.screenTitle}>{activeScene.title}</Text>
          <Text style={styles.screenSubtitle}>
            Tap the <Text style={styles.subtitleHighlight}>●</Text> dots on
            the image to explore products.
          </Text>
        </View>

        {/*
         * ── Carousel container ──────────────────────────────────────────
         *
         * The explicit `height: IMAGE_HEIGHT` is what makes slides visible.
         * Without a concrete height, the horizontal ScrollView collapses to
         * zero and shows nothing (or a loader, since ShoppableImage fills
         * its given height with an ActivityIndicator skeleton).
         *
         * overflow:'visible' lets hotspot dots near edges paint outside.
         */}
        <View style={styles.carouselContainer}>
          <ScrollView
            ref={carouselScrollRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={handleCarouselScroll}
            scrollEventThrottle={16}
            decelerationRate="fast"
            bounces={false}
            style={styles.carouselScroll}
            accessibilityRole="none"
            accessibilityLabel="Product inspiration carousel"
          >
            {SHOPPABLE_SCENES.map((scene) => (
              /*
               * ShoppableSlide is self-contained:
               *   - owns useShoppableImage state
               *   - owns ProductDetailModal
               *   - no prop drilling of handlers from the screen level
               */
              <ShoppableSlide key={scene.id} scene={scene} />
            ))}
          </ScrollView>
        </View>

        {/* ── Slide dot indicators ─────────────────────────────────────── */}
        <DotIndicator
          count={SHOPPABLE_SCENES.length}
          activeIndex={activeSlideIndex}
          onPress={scrollToSlide}
        />

        {/* ── Product legend for the active slide ─────────────────────── */}
        <View style={styles.legendContainer}>
          <Text style={styles.legendTitle}>
            Products in this room
            <Text style={styles.legendCount}>
              {'  '}
              {activeScene.hotspots.length} items
            </Text>
          </Text>
          {activeScene.hotspots.map((hs: Hotspot, i: number) => (
            <LegendRow key={hs.id} hotspot={hs} index={i} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.secondary,
  },

  // ── Outer scroll ───────────────────────────────────────────────────────────
  outerScroll: {
    flex: 1,
  },
  outerScrollContent: {
    paddingBottom: Spacing[12],
  },

  // ── Header ─────────────────────────────────────────────────────────────────
  header: {
    backgroundColor: Colors.background.primary,
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[5],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[200],
  },
  brandLockup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing[4],
  },
  brandLogo: {
    width: 28,
    height: 28,
    marginRight: Spacing[2],
    marginTop: Spacing[0.5],
  },
  brandName: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.brand,
    letterSpacing: -0.3,
  },
  screenTitle: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    marginBottom: Spacing[1],
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.text.secondary,
  },
  subtitleHighlight: {
    color: Colors.primary[600],
    fontWeight: FontWeight.bold,
  },

  // ── Carousel ───────────────────────────────────────────────────────────────
  /**
   * CRITICAL: explicit height keeps the horizontal ScrollView from
   * collapsing to zero inside the outer vertical ScrollView.
   * overflow:'visible' lets hotspot dots near image edges paint outside.
   */
  carouselContainer: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    overflow: 'visible',
  },
  carouselScroll: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
  },
  /**
   * Each slide must be exactly SCREEN_WIDTH × IMAGE_HEIGHT.
   * overflow:'visible' lets hotspot pulse rings bleed slightly outside.
   */
  slideWrapper: {
    width: SCREEN_WIDTH,
    height: IMAGE_HEIGHT,
    overflow: 'visible',
  },

  // ── Dot indicator ──────────────────────────────────────────────────────────
  dotRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    backgroundColor: Colors.background.primary,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[100],
    gap: Spacing[1],
  },
  dot: {
    height: 8,
    borderRadius: 4,
  },
  dotIdle: {
    width: 8,
    backgroundColor: Colors.neutral[300],
  },
  dotActive: {
    width: 20,
    backgroundColor: Colors.primary[600],
  },

  // ── Legend ─────────────────────────────────────────────────────────────────
  legendContainer: {
    backgroundColor: Colors.background.primary,
    marginTop: Spacing[4],
    paddingHorizontal: Spacing[5],
    paddingTop: Spacing[5],
    paddingBottom: Spacing[4],
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.neutral[200],
  },
  legendTitle: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.extraBold,
    color: Colors.text.primary,
    marginBottom: Spacing[4],
  },
  legendCount: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.regular,
    color: Colors.text.secondary,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing[3],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.neutral[100],
  },
  legendBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary[50],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing[3],
    flexShrink: 0,
  },
  legendBadgeText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.primary[600],
  },
  legendInfo: {
    flex: 1,
  },
  legendName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.text.primary,
  },
  legendType: {
    fontSize: FontSize.xs,
    color: Colors.text.secondary,
    marginTop: 1,
  },
  legendRight: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing[2],
  },
  legendPrice: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.extraBold,
    color: Colors.primary[600],
  },
  legendChevron: {
    fontSize: FontSize.lg,
    color: Colors.neutral[400],
    marginLeft: Spacing[1],
    lineHeight: 22,
  },
});

export default ProductScreen;
