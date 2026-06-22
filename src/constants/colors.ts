/**
 * @file colors.ts
 * @description Design-system color tokens for ToshmaLabs.
 * Single source of truth — all screens and components reference this file.
 */

export const Colors = {
  // ─── Brand ───────────────────────────────────────────────────────────────
  primary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    //600: '#2563EB', // matches text-primary-600 from brand website
     600: '#3C3939',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // ─── Neutrals ─────────────────────────────────────────────────────────────
  neutral: {
    0: '#FFFFFF',
    50: '#F8FAFC',
    100: '#F1F5F9',
    200: '#E2E8F0',
    300: '#CBD5E1',
    400: '#94A3B8',
    500: '#64748B',
    600: '#475569',
    700: '#334155',
    800: '#1E293B',
    900: '#0F172A',
    1000: '#000000',
  },

  // ─── Semantic ─────────────────────────────────────────────────────────────
  success: '#22C55E',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // ─── Background ───────────────────────────────────────────────────────────
  background: {
    primary: '#FFFFFF',
    secondary: '#F8FAFC',
    splash: '#FFFFFF',
  },

  // ─── Text ─────────────────────────────────────────────────────────────────
  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
    inverse: '#FFFFFF',
    brand: '#2563EB',
  },
} as const;

export type ColorKeys = typeof Colors;
