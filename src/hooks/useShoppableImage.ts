/**
 * @file useShoppableImage.ts
 * @description Custom hook that owns all stateful logic for the shoppable image
 *   component — selected hotspot, modal visibility, and action handlers.
 *
 * Separating state from UI is a core pattern at FAANG companies:
 *   - The hook is unit-testable without rendering any component.
 *   - The component becomes a pure render function.
 *   - Multiple components can share the same interaction logic.
 */

import { useCallback, useState } from 'react';
import type { Hotspot, ShoppableProduct } from '../types';

// ─── Return type ──────────────────────────────────────────────────────────────

export interface UseShoppableImageReturn {
  /** ID of the currently active (selected) hotspot, or null if none. */
  activeHotspotId: string | null;
  /** The full Hotspot object for the active hotspot (drives the detail modal). */
  activeHotspot: Hotspot | null;
  /** Whether the product detail bottom sheet is open. */
  isModalVisible: boolean;
  /** Call when the user taps a hotspot dot. */
  handleHotspotPress: (hotspot: Hotspot) => void;
  /** Call when the user dismisses the detail modal. */
  handleModalClose: () => void;
  /** Call when the user taps "Buy Now" inside the detail modal. */
  handleBuyPress: (product: ShoppableProduct) => void;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * @param onBuyPress - Optional external callback so the parent screen can
 *   handle deep-linking / analytics without coupling to this hook's internals.
 */
export const useShoppableImage = (
  onBuyPress?: (product: ShoppableProduct) => void,
): UseShoppableImageReturn => {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);

  /**
   * Tapping the same dot a second time closes the tooltip (toggle).
   * Tapping a different dot switches to the new product and opens the modal.
   */
  const handleHotspotPress = useCallback((hotspot: Hotspot): void => {
    setActiveHotspot((prev) => {
      if (prev?.id === hotspot.id) {
        // Toggle off — same dot tapped twice
        setIsModalVisible(false);
        return null;
      }
      setIsModalVisible(true);
      return hotspot;
    });
  }, []);

  const handleModalClose = useCallback((): void => {
    setIsModalVisible(false);
    setActiveHotspot(null);
  }, []);

  const handleBuyPress = useCallback(
    (product: ShoppableProduct): void => {
      onBuyPress?.(product);
    },
    [onBuyPress],
  );

  return {
    activeHotspotId: activeHotspot?.id ?? null,
    activeHotspot,
    isModalVisible,
    handleHotspotPress,
    handleModalClose,
    handleBuyPress,
  };
};
