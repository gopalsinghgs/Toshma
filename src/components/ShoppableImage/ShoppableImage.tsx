/**
 * @file ShoppableImage.tsx
 * @description The core reusable "shoppable image" component.
 *
 * Fixes applied (v2):
 *
 * 1. overflow changed from 'hidden' → 'visible'
 *    The container was clipping all absolutely-positioned hotspot dots,
 *    making them completely invisible.
 *
 * 2. Percentage positioning converted to pixel values via onLayout
 *    React Native does NOT support percentage strings for `top`/`left` on
 *    absolute children. We now measure the container with onLayout and
 *    multiply: left = (x / 100) * containerWidth, top = (y / 100) * containerHeight.
 *
 * 3. Hotspot dots always rendered once image starts loading
 *    Previously hotspots were hidden while isLoading=true, so a slow CDN
 *    meant dots never appeared. Now dots render as soon as the container has
 *    valid dimensions — independent of image load state.
 *
 * 4. Image loading is now truly non-blocking
 *    The loading overlay fades over the image but dots are always visible.
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutChangeEvent,
  PixelRatio,
  StyleSheet,
  View,
} from 'react-native';

import HotspotDot from './HotspotDot';
import ProductTooltip from './ProductTooltip';
import { Colors } from '../../constants';
import { selectResponsiveUrl } from '../../utils';
import type { ShoppableImageProps } from '../../types';

// ─── Constants ────────────────────────────────────────────────────────────────

const SCREEN_WIDTH = Dimensions.get('window').width;

// ─── Component ────────────────────────────────────────────────────────────────

const ShoppableImage: React.FC<ShoppableImageProps> = ({
  data,
  onHotspotPress,
  activeHotspotId,
  imageHeight = 480,
  targetWidth,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  /**
   * Container dimensions measured via onLayout.
   * We MUST use real pixel values — RN does not accept '%' strings for
   * position: 'absolute' top/left.
   */
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setContainerSize({ width, height });
    }
  };

  // ── Responsive URL selection ──────────────────────────────────────────────
  const physicalWidth =
    targetWidth ?? Math.round(SCREEN_WIDTH * PixelRatio.get());

  const imageUrl =
    selectResponsiveUrl(data.image.responsiveImages, physicalWidth) ??
    data.image.originalUrl;

  return (
    <View
      style={[styles.container, { height: imageHeight }]}
      onLayout={handleLayout}
      accessibilityRole="image"
      accessibilityLabel={data.image.alt}
    >
      {/* ── Room / scene image ────────────────────────────────────────────── */}
      <Image
        source={{ uri: imageUrl }}
        style={styles.image}
        resizeMode="cover"
        accessible={false}
        onLoadStart={() => {
          setIsLoading(true);
          setHasError(false);
        }}
        onLoadEnd={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          setHasError(true);
        }}
      />

      {/* Loading skeleton — overlays the image but does NOT hide hotspot dots */}
      {isLoading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <ActivityIndicator size="large" color={Colors.primary[600]} />
        </View>
      )}

      {/* Error fallback */}
      {hasError && (
        <View style={styles.errorOverlay} pointerEvents="none" />
      )}

      {/*
       * ── Hotspot dots ───────────────────────────────────────────────────────
       *
       * Rendered as soon as we have valid container dimensions — INDEPENDENT
       * of image load state. A slow CDN should not block interactive dots.
       *
       * Position formula:
       *   left = (hotspot.x / 100) * containerWidth  - (DOT_CENTER_OFFSET)
       *   top  = (hotspot.y / 100) * containerHeight - (DOT_CENTER_OFFSET)
       *
       * The centering offset is handled inside HotspotDot via its own
       * transform, not here — we just pass the anchor point.
       */}
      {containerSize &&
        data.hotspots.map((hotspot) => {
          const isActive = hotspot.id === activeHotspotId;

          // Convert percentage to absolute pixel values
          const leftPx = (hotspot.x / 100) * containerSize.width;
          const topPx = (hotspot.y / 100) * containerSize.height;

          return (
            <View
              key={hotspot.id}
              style={[
                styles.hotspotAnchor,
                {
                  left: leftPx,
                  top: topPx,
                },
              ]}
            >
              {/* Tooltip floats above the dot */}
              <ProductTooltip
                product={hotspot.product}
                visible={isActive}
                anchorX={hotspot.x}
              />

              {/* Interactive pulsing dot */}
              <HotspotDot
                hotspot={hotspot}
                isActive={isActive}
                onPress={onHotspotPress}
              />
            </View>
          );
        })}
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    /**
     * CRITICAL FIX: was 'hidden' — that clipped every absolutely-positioned
     * hotspot dot, making them all invisible. 'visible' lets them paint freely.
     */
    overflow: 'visible',
    backgroundColor: Colors.neutral[100],
  },

  image: {
    width: '100%',
    height: '100%',
  },

  loadingOverlay: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutral[100],
  },

  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: Colors.neutral[200],
  },

  hotspotAnchor: {
    position: 'absolute',
    zIndex: 10,
  },
});

export default ShoppableImage;
