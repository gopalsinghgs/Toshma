/**
 * @file assets/index.ts
 * @description Single registry for all static assets.
 *
 * Screens import from here, never via raw relative require paths.
 * If an asset moves or is renamed, only this file needs updating.
 */

export const Images = {
  toshmaLabsLogo: require('./images/ToshmaLabs_Logo.png') as number,
} as const;
