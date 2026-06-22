/**
 * @file shoppable.types.ts
 * @description Domain types for the IKEA-style shoppable image feature.
 *
 * Design principle: position data is decoupled from product data so the same
 * product can appear on multiple images at different coordinates without
 * duplicating product records (mirrors how IKEA's internal CMS works).
 */

// ─── Product ──────────────────────────────────────────────────────────────────

/** A single purchasable item. Sourced from a product catalogue / API. */
export interface ShoppableProduct {
  /** Unique product identifier (matches IKEA's article number format). */
  id: string;
  /** Short product series name, e.g. "FÄRJKARL". */
  name: string;
  /** Product type / category description, e.g. "Cabinet with 2 doors". */
  type: string;
  /** Formatted price string including currency symbol, e.g. "€149". */
  price: string;
  /** Raw numeric price for sorting / filtering. */
  priceValue: number;
  /** Currency code, e.g. "EUR". */
  currency: string;
  /** Optional thumbnail shown in the tooltip / detail sheet. */
  thumbnailUrl?: string;
  /** Deep-link or web URL to the full product page. */
  productUrl: string;
}

// ─── Hotspot ──────────────────────────────────────────────────────────────────

/**
 * A clickable dot overlaid on the shoppable image.
 * `x` and `y` are percentage values (0–100) relative to the image dimensions,
 * matching the CSS `left` / `top` percentages used in the original IKEA HTML.
 */
export interface Hotspot {
  /** Unique identifier for the hotspot (can differ from product.id). */
  id: string;
  /** Horizontal position as a percentage of image width (0–100). */
  x: number;
  /** Vertical position as a percentage of image height (0–100). */
  y: number;
  /** The product this hotspot points to. */
  product: ShoppableProduct;
}

// ─── Responsive Image ─────────────────────────────────────────────────────────

/**
 * A single entry from the `responsiveImages` array in the IKEA JSON payload.
 * Maps to the `srcset` entries in the original HTML component.
 */
export interface ResponsiveImage {
  /** Size label used by the CDN, e.g. "sg" | "xxxl" | "xxl". */
  size: string;
  /** Fully-qualified CDN URL for this resolution variant. */
  url: string;
  /** Pixel width this URL is optimised for. */
  width: number;
}

/**
 * Full image metadata block — mirrors the `image` object in the IKEA JSON.
 */
export interface SceneImage {
  /** Unique asset identifier from the DAM system. */
  id: string;
  /** Accessibility alt text (may be in the scene's locale language). */
  alt: string;
  /** Highest-resolution source URL. */
  originalUrl: string;
  /** Native pixel width of the original asset. */
  width: number;
  /** Native pixel height of the original asset. */
  height: number;
  /** Browser loading hint — "lazy" | "eager". */
  loading: 'lazy' | 'eager';
  /**
   * Sorted CDN variants for responsive loading.
   * Consumers call `selectResponsiveUrl()` to pick the best fit.
   */
  responsiveImages: ResponsiveImage[];
}

// ─── Shoppable Image ──────────────────────────────────────────────────────────

/** The complete data shape for one shoppable image scene. */
export interface ShoppableImageData {
  /** Unique scene identifier. */
  id: string;
  /** Scene title shown in the UI header. */
  title: string;
  /**
   * Structured image metadata (replaces the flat `imageUrl` string).
   * The component selects the appropriate CDN variant at render time.
   */
  image: SceneImage;
  /** All hotspots positioned within this scene. */
  hotspots: Hotspot[];
}

// ─── Component Props ──────────────────────────────────────────────────────────

/** Props accepted by the <ShoppableImage> presentational component. */
export interface ShoppableImageProps {
  data: ShoppableImageData;
  /** Called when the user taps a hotspot dot. */
  onHotspotPress: (hotspot: Hotspot) => void;
  /** Currently selected hotspot (controls tooltip visibility). */
  activeHotspotId: string | null;
  /** Height of the image container in logical pixels. */
  imageHeight?: number;
  /**
   * Target render width in pixels — used to pick the best responsive CDN URL.
   * Defaults to the device screen width.
   */
  targetWidth?: number;
}

/** Props for a single <HotspotDot>. */
export interface HotspotDotProps {
  hotspot: Hotspot;
  isActive: boolean;
  onPress: (hotspot: Hotspot) => void;
}

/** Props for the <ProductTooltip> inline callout. */
export interface ProductTooltipProps {
  product: ShoppableProduct;
  visible: boolean;
  /** Horizontal anchor percentage — used to decide whether to flip the tooltip. */
  anchorX: number;
}

/** Props for the <ProductDetailModal> bottom sheet. */
export interface ProductDetailModalProps {
  hotspot: Hotspot | null;
  visible: boolean;
  onClose: () => void;
  onBuyPress: (product: ShoppableProduct) => void;
}
