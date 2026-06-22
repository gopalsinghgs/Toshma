/**
 * @file typography.ts
 * @description Typography scale and font weight tokens.
 * Mirrors the responsive text sizes used on the ToshmaLabs web brand.
 */

import { Platform } from 'react-native';

// ─── Font Families ───────────────────────────────────────────────────────────
export const FontFamily = {
  regular: Platform.select({ ios: 'System', android: 'Roboto', default: 'System' }),
  medium: Platform.select({ ios: 'System', android: 'Roboto-Medium', default: 'System' }),
  bold: Platform.select({ ios: 'System', android: 'Roboto-Bold', default: 'System' }),
  extraBold: Platform.select({ ios: 'System', android: 'Roboto-Black', default: 'System' }),
} as const;

// ─── Font Weights ─────────────────────────────────────────────────────────────
export const FontWeight = {
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
  extraBold: '800', // font-extrabold equivalent
  black: '900',
} as const;

// ─── Font Sizes (mirrors Tailwind xs → 3xl scale) ─────────────────────────────
export const FontSize = {
  xs: 12,
  sm: 14,
  base: 16,
  md: 18,
  lg: 20,
  xl: 24,
  '2xl': 28,
  '3xl': 32,
  '4xl': 36,
  '5xl': 48,
  display: 56,
} as const;

// ─── Line Heights ─────────────────────────────────────────────────────────────
export const LineHeight = {
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const;

// ─── Letter Spacing ───────────────────────────────────────────────────────────
export const LetterSpacing = {
  tighter: -0.8,
  tight: -0.4,
  normal: 0,
  wide: 0.4,
  wider: 0.8,
  widest: 1.6,
} as const;
