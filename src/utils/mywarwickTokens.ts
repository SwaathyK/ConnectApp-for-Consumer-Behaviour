/**
 * MyWarwick theme tokens
 * Matches the existing MyWarwick app visual language:
 * purple gradient background, white text, system font, blue accent.
 */

export const MW_COLOR = {
  // Backgrounds
  bg:            '#6B4FA8',   // base purple (LinearGradient starts here)
  bgEnd:         '#8B6FC0',   // gradient end
  surface:       'rgba(255,255,255,0.12)',
  surfaceRaised: 'rgba(255,255,255,0.18)',

  // Section header bands
  sectionBand:   'rgba(0,0,0,0.18)',

  // Borders
  borderSubtle:  'rgba(255,255,255,0.15)',
  borderDefault: 'rgba(255,255,255,0.25)',

  // Text — all white family
  textPrimary:   '#FFFFFF',
  textSecondary: 'rgba(255,255,255,0.82)',
  textMuted:     'rgba(255,255,255,0.70)',   // raised from 0.55 → meets AA on purple
  textDisabled:  'rgba(255,255,255,0.45)',

  // Accent — MyWarwick blue
  accent:        '#4A9EE8',
  accentSoft:    'rgba(74,158,232,0.20)',
  accentMuted:   '#7DBEF0',

  // Tab bar
  tabBar:        'rgba(255,255,255,0.95)',
  tabInactive:   '#9090A0',
  tabActive:     '#4A9EE8',

  // Semantic
  success:       '#4CAF82',
  danger:        '#E87070',
} as const;

// ── Shared layout constants ──────────────────────────────────────────────────
// MyWarwick visual language: purple base + light grey content surface
export const MW_LAYOUT = {
  purple:        '#6B4FA8',
  contentBg:     '#F2F2F7',
  screenGutter:  20,            // single horizontal gutter for every screen
  // Floating pill tab bar occupies height 64 + marginBottom 24 = 88; add breathing room.
  // Screens add this PLUS the bottom safe-area inset.
  tabBarClearance: 96,
} as const;

// Purple gradient used across MyWarwick screens
export const MW_GRADIENT = ['#5B3D96', '#7B5BB8', '#9B7BD0'] as const;

// MyWarwick uses system font — no custom fonts needed
export const MW_FONTS = {
  heading:       undefined,   // system default bold
  headingSemi:   undefined,
  headingMedium: undefined,
  body:          undefined,
  bodySemi:      undefined,
  bodyItalic:    undefined,
} as const;
