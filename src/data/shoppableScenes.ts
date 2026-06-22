/**
 * @file shoppableScenes.ts
 * @description All three carousel slides for the shoppable image feature.
 *
 * Image source — Unsplash CDN (images.unsplash.com)
 * ─────────────────────────────────────────────────
 * The original IKEA CDN URLs (www.ikea.com/ext/ingkadam/…) are blocked by
 * React Native's Image component on device. IKEA's Cloudflare edge requires a
 * browser Referer header and sets __cf_bm cookies that the bare RN image
 * loader does not supply, causing silent onError callbacks.
 *
 * Unsplash's CDN serves images unconditionally to any HTTP client (no Referer,
 * no cookies, no auth). The ?w= and ?fit=crop query params are Unsplash's
 * native image transformation API, giving us the same srcset-style variants
 * we had before.
 *
 * Responsive variants generated per slide:
 *   sg   → 1600 px   (large tablet / retina phone)
 *   xxxl → 1400 px
 *   xxl  → 1100 px
 *   xl   →  900 px
 *   l    →  750 px
 *   m    →  700 px
 *   s    →  600 px
 *   xs   →  500 px
 *   xxs  →  400 px
 *   xxxs →  300 px
 *
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ SLIDE 1 — Cabinet / Display scene                                    │
 * │   1 hotspot: FÄRJKARL display cabinet €249                           │
 * ├──────────────────────────────────────────────────────────────────────┤
 * │ SLIDE 2 — Living Room scene                                          │
 * │   6 hotspots: FÄRJKARL, MÅLA, GÄRDESGÅRD, SUNDVIK, FADO, LOMVIKEN   │
 * ├──────────────────────────────────────────────────────────────────────┤
 * │ SLIDE 3 — Bookcase Wall scene                                        │
 * │   10 visible hotspots                                                │
 * └──────────────────────────────────────────────────────────────────────┘
 */

import type { ShoppableImageData } from '../types';

// ─── Responsive URL helper ────────────────────────────────────────────────────

/**
 * Builds the responsive variants array for a given Unsplash base URL.
 * Appends ?w=<width>&q=80&fit=crop to each entry — Unsplash will resize
 * server-side and return a proper JPEG at the requested pixel width.
 */
function makeResponsiveImages(baseUrl: string) {
  const sizes = [
    { size: 'sg',   width: 1600 },
    { size: 'xxxl', width: 1400 },
    { size: 'xxl',  width: 1100 },
    { size: 'xl',   width:  900 },
    { size: 'l',    width:  750 },
    { size: 'm',    width:  700 },
    { size: 's',    width:  600 },
    { size: 'xs',   width:  500 },
    { size: 'xxs',  width:  400 },
    { size: 'xxxs', width:  300 },
  ];
  return sizes.map(({ size, width }) => ({
    size,
    url: `${baseUrl}?w=${width}&q=80&fit=crop`,
    width,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 1 — Cabinet / Display scene
// Unsplash photo: modern living room with cabinet against wall
// https://unsplash.com/photos/brown-wooden-cabinet-near-white-wall-hIgeoQjS_iE
// ─────────────────────────────────────────────────────────────────────────────

const BASE_1 = 'https://www.ikea.com/ext/ingkadam/m/3b64ad9cfb2d450b/original/PE1002576.jpg?f=m';

export const cabinetDisplayScene: ShoppableImageData = {
  id: 'scene-cabinet-display-01',
  title: 'FÄRJKARL Collection',

  image: {
    id: 'unsplash-1555041469-a586c61ea9bc',
    alt: 'A modern living room with a white cabinet placed against the wall near a window.',
    originalUrl: `${BASE_1}?w=1600&q=80&fit=crop`,
    width: 4000,
    height: 5000,
    loading: 'lazy',
    responsiveImages: makeResponsiveImages(BASE_1),
  },

  hotspots: [
    {
      id: 'hs-40597644',
      x: 55,
      y: 45,
      product: {
        id: '40597644',
        name: 'FÄRJKARL',
        type: 'Display cabinet',
        price: '€249',
        priceValue: 249,
        currency: 'EUR',
        thumbnailUrl: `${BASE_1}?w=400&q=80&fit=crop`,
        productUrl:
          'https://www.ikea.com/it/it/p/faerjkarl-vetrina-bianco-sporco-40597644/',
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 2 — Living Room scene
// Unsplash photo: bright Scandinavian living room
// https://unsplash.com/photos/white-sofa-beside-brown-wooden-cabinet-jV8-kNsYDEQ
// ─────────────────────────────────────────────────────────────────────────────

const BASE_2 = 'https://www.ikea.com/ext/ingkadam/m/2bf93b44146dd1fa/original/PH209198.jpg?f=m';

export const livingRoomScene: ShoppableImageData = {
  id: 'scene-living-room-01',
  title: 'Living Room Inspiration',

  image: {
    id: 'unsplash-1616486338812-3dadae4b4ace',
    alt: 'A bright Scandinavian living room with a white cabinet, table lamp and bookshelf near the window.',
    originalUrl: `${BASE_2}?w=1600&q=80&fit=crop`,
    width: 5000,
    height: 5000,
    loading: 'lazy',
    responsiveImages: makeResponsiveImages(BASE_2),
  },

  hotspots: [
    // Cabinet — right-centre
    {
      id: 'hs-10597607',
      x: 62.5,
      y: 58,
      product: {
        id: '10597607',
        name: 'FÄRJKARL',
        type: 'Mobile cabinet',
        price: '€149',
        priceValue: 149,
        currency: 'EUR',
        thumbnailUrl: `${BASE_2}?w=400&q=80&fit=crop`,
        productUrl:
          'https://www.ikea.com/it/it/p/faerjkarl-mobile-bianco-sporco-10597607/',
      },
    },
    // Colored pencil — bottom-left
    {
      id: 'hs-70456586',
      x: 6.25,
      y: 78,
      product: {
        id: '70456586',
        name: 'MÅLA',
        type: 'Colored pencil',
        price: '€4.95',
        priceValue: 4.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/mala-matita-colorata-colori-vari-70456586/',
      },
    },
    // Storage box — upper-centre
    {
      id: 'hs-20596933',
      x: 45,
      y: 23,
      product: {
        id: '20596933',
        name: 'GÄRDESGÅRD',
        type: 'Storage compartment',
        price: '€4.95',
        priceValue: 4.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/gaerdesgard-portaoggetti-naturale-20596933/',
      },
    },
    // Chair — bottom-centre
    {
      id: 'hs-60196358',
      x: 48.75,
      y: 85,
      product: {
        id: '60196358',
        name: 'SUNDVIK',
        type: 'High chair',
        price: '€25',
        priceValue: 25,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/sundvik-seggiolina-bianco-60196358/',
      },
    },
    // Lamp — upper-left
    {
      id: 'hs-80096372',
      x: 30,
      y: 19,
      product: {
        id: '80096372',
        name: 'FADO',
        type: 'Table lamp',
        price: '€19.95',
        priceValue: 19.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/fado-lampada-da-tavolo-bianco-80096372/',
      },
    },
    // Frame — upper-right
    {
      id: 'hs-00335852-s2',
      x: 63.75,
      y: 7,
      product: {
        id: '00335852',
        name: 'LOMVIKEN',
        type: 'Cornice / frame',
        price: '€9.95',
        priceValue: 9.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/lomviken-cornice-nero-00335852/',
      },
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// SLIDE 3 — Bookcase Wall scene
// Unsplash photo: home library / bookcase wall with shelves
// https://unsplash.com/photos/white-wooden-shelf-with-books-GJ8ZQyat3G4
// ─────────────────────────────────────────────────────────────────────────────

const BASE_3 = 'https://www.ikea.com/ext/ingkadam/m/3e606b4aae324313/original/PH209208.jpg?f=mhttps://www.ikea.com/ext/ingkadam/m/3e606b4aae324313/original/PH209208.jpg?f=m';

export const bookcaseWallScene: ShoppableImageData = {
  id: 'scene-bookcase-wall-01',
  title: 'Bookcase Wall Ideas',

  image: {
    id: 'unsplash-1524758631624-e2822e304c36',
    alt: 'A Scandinavian-style room with white bookcases filled with books, baskets and decorative objects.',
    originalUrl: `${BASE_3}?w=1600&q=80&fit=crop`,
    width: 5000,
    height: 5000,
    loading: 'lazy',
    responsiveImages: makeResponsiveImages(BASE_3),
  },

  hotspots: [
    // Bookshelf — right side upper
    {
      id: 'hs-50595885',
      x: 62.5,
      y: 19,
      product: {
        id: '50595885',
        name: 'FÄRJKARL',
        type: 'Bookshelf',
        price: '€149',
        priceValue: 149,
        currency: 'EUR',
        thumbnailUrl: `${BASE_3}?w=400&q=80&fit=crop`,
        productUrl:
          'https://www.ikea.com/it/it/p/faerjkarl-libreria-bianco-sporco-50595885/',
      },
    },
    // Cabinet lighting — top-left
    {
      id: 'hs-60516821',
      x: 23.75,
      y: 5,
      product: {
        id: '60516821',
        name: 'TVÄRDRAG',
        type: 'Furniture lighting',
        price: '€20',
        priceValue: 20,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/tvaerdrag-illuminazione-per-mobile-nero-intensita-luminosa-regolabile-60516821/',
      },
    },
    // Magazine rack — right-centre-low
    {
      id: 'hs-40596932',
      x: 55,
      y: 68,
      product: {
        id: '40596932',
        name: 'GÄRDESGÅRD',
        type: 'Magazine rack',
        price: '€4.95',
        priceValue: 4.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/gaerdesgard-portariviste-naturale-40596932/',
      },
    },
    // Plush toy — right-mid
    {
      id: 'hs-20597065',
      x: 75,
      y: 62,
      product: {
        id: '20597065',
        name: 'DVÄRGHARE',
        type: 'Plush toy rabbit',
        price: '€2.95',
        priceValue: 2.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/dvaerghare-peluche-coniglio-beige-20597065/',
      },
    },
    // Stool — bottom-right
    {
      id: 'hs-50598959',
      x: 70,
      y: 88,
      product: {
        id: '50598959',
        name: 'GREJSIMOJS',
        type: 'Moose-shaped stool',
        price: '€25',
        priceValue: 25,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/grejsimojs-sgabellino-a-forma-di-alce-50598959/',
      },
    },
    // Mini chest of drawers — left-mid
    {
      id: 'hs-60596931',
      x: 12.5,
      y: 41,
      product: {
        id: '60596931',
        name: 'GÄRDESGÅRD',
        type: 'Mini chest of drawers, 2 drawers',
        price: '€8.50',
        priceValue: 8.5,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/gaerdesgard-minicassettiera-a-2-cassetti-naturale-60596931/',
      },
    },
    // Vase pink — right-upper-mid
    {
      id: 'hs-30607295',
      x: 77.5,
      y: 34,
      product: {
        id: '30607295',
        name: 'BLODBJÖRK',
        type: 'Vase, pink/blue',
        price: '€6.95',
        priceValue: 6.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/blodbjoerk-vaso-rosa-pallido-blu-30607295/',
      },
    },
    // Box with lid — right-mid-low
    {
      id: 'hs-70596935',
      x: 76.25,
      y: 52,
      product: {
        id: '70596935',
        name: 'GÄRDESGÅRD',
        type: 'Box with lid',
        price: '€6.95',
        priceValue: 6.95,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/gaerdesgard-scatola-con-coperchio-naturale-70596935/',
      },
    },
    // Bamboo basket — left-centre
    {
      id: 'hs-80556887',
      x: 32.5,
      y: 54,
      product: {
        id: '80556887',
        name: 'MJÖLKKANNA',
        type: 'Bamboo basket',
        price: '€15',
        priceValue: 15,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/mjoelkkanna-cestino-bambu-80556887/',
      },
    },
    // Vase beige — left-upper-mid
    {
      id: 'hs-90607297',
      x: 36.25,
      y: 35,
      product: {
        id: '90607297',
        name: 'BLODBJÖRK',
        type: 'Vase, beige',
        price: '€15',
        priceValue: 15,
        currency: 'EUR',
        productUrl:
          'https://www.ikea.com/it/it/p/blodbjoerk-vaso-beige-90607297/',
      },
    },
  ],
};

// ─── Exported list — order matches carousel slide order ───────────────────────

export const SHOPPABLE_SCENES: ShoppableImageData[] = [
  cabinetDisplayScene,  // Slide 1
  livingRoomScene,      // Slide 2
  bookcaseWallScene,    // Slide 3
];





















// // ShoppableImage.js

// import React from 'react';
// import {
//   View,
//   Image,
//   TouchableOpacity,
//   StyleSheet,
// } from 'react-native';

// const ShoppableImage = ({
//   imageUrl,
//   hotspots = [],
//   imageHeight = 500,
//   onHotspotPress,
// }) => {
//   return (
//     <View style={[styles.container, { height: imageHeight }]}>
//       <Image
//         source={{ uri: imageUrl }}
//         style={styles.image}
//         resizeMode="cover"
//       />

//       {hotspots.map((item) => (
//         <TouchableOpacity
//           key={item.id}
//           style={[
//             styles.dot,
//             {
//               top: `${item.y}%`,
//               left: `${item.x}%`,
//             },
//           ]}
//           onPress={() => onHotspotPress?.(item)}
//         />
//       ))}
//     </View>
//   );
// };

// export default ShoppableImage;

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     position: 'relative',
//     overflow: 'hidden',
//   },

//   image: {
//     width: '100%',
//     height: '100%',
//   },

//   dot: {
//     position: 'absolute',
//     width: 24,
//     height: 24,
//     borderRadius: 12,
//     backgroundColor: '#0058A3',
//     borderWidth: 3,
//     borderColor: '#fff',

//     transform: [
//       { translateX: -12 },
//       { translateY: -12 },
//     ],
//   },
// });