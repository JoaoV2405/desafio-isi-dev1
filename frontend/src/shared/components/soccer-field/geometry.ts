/** Shared coordinate reference for the SVG backgrounds and HTML overlays. */
export const SOCCER_FIELD_GEOMETRY = {
  lineup: {
    width: 40,
    height: 52,
    boundary: { x: 3.5, y: 3.5, width: 33, height: 45 },
  },
  match: {
    width: 104,
    height: 68,
    boundary: { x: 4, y: 4, width: 96, height: 60 },
    // Keep attacking markers clear of the halfway line at x = 52.
    homeAttackLimit: 48,
  },
} as const
