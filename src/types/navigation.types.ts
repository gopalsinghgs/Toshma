/**
 * @file navigation.types.ts
 * @description Centralised navigation type definitions.
 *
 * Every route in the app is declared here so TypeScript can enforce
 * correct screen params at every call site (navigate, push, pop, etc.).
 * This pattern is identical to what is used in large-scale RN codebases
 * at companies like Meta, Airbnb, and Shopify.
 */

import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { ShoppableProduct } from './shoppable.types';

// ─── Root Stack ───────────────────────────────────────────────────────────────

/**
 * Param map for the root stack navigator.
 * `undefined` means the route accepts no params.
 */
export type RootStackParamList = {
  Splash: undefined;
  Product: undefined;
  /** Full-page product detail screen — receives a product object from the hotspot. */
  ProductDetails: {
    product: ShoppableProduct;
  };
};

// ─── Per-screen prop types (convenience re-exports) ───────────────────────────

export type SplashScreenProps = NativeStackScreenProps<RootStackParamList, 'Splash'>;
export type ProductScreenProps = NativeStackScreenProps<RootStackParamList, 'Product'>;
export type ProductDetailsScreenProps = NativeStackScreenProps<RootStackParamList, 'ProductDetails'>;

// ─── Global navigation declaration (enables useNavigation() typing) ───────────

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
