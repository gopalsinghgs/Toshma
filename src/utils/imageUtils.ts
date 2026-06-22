/**
 * @file imageUtils.ts
 * @description Utility functions for working with responsive image assets.
 *
 * Mirrors the browser's `srcset` selection algorithm:
 * Pick the smallest CDN variant whose width is >= the requested render width,
 * falling back to the largest available variant if none qualifies.
 */

import { Dimensions, PixelRatio } from 'react-native';
import type { ResponsiveImage } from '../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * Selects the most appropriate CDN URL from a list of responsive image variants.
 *
 * @param variants  - Array of `ResponsiveImage` entries sorted by width descending.
 * @param targetPx  - Desired render width in physical pixels (default: screen width × pixel ratio).
 * @returns The URL of the best-fit variant, or `undefined` if the array is empty.
 *
 * @example
 * const url = selectResponsiveUrl(scene.image.responsiveImages);
 * // On a 390pt × 3x device → targetPx = 1170
 * // Picks the "sg" (1600w) variant — the smallest that covers 1170px.
 */
export function selectResponsiveUrl(
  variants: ResponsiveImage[],
  targetPx: number = Math.round(SCREEN_WIDTH * PixelRatio.get()),
): string | undefined {
  if (!variants || variants.length === 0) return undefined;

  // Sort ascending by width so we can find the first one that covers targetPx
  const sorted = [...variants].sort((a, b) => a.width - b.width);

  // First variant whose width >= targetPx
  const best = sorted.find((v) => v.width >= targetPx);

  // If none covers the target (very large screen), use the widest available
  return (best ?? sorted[sorted.length - 1]).url;
}
