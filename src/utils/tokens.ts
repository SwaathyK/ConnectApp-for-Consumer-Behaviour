/**
 * Design tokens — University Editorial
 * ─────────────────────────────────────────────────────────────────────────────
 * Light mode. Warm cream ground, deep indigo accent, serif-led typography.
 * Feels like a well-designed university publication, not a generic app.
 */

// ── Storage ────────────────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  PROFILE: '@connect_profile',
  RSVP:    '@connect_rsvp',
} as const;

// ── Colour palette ─────────────────────────────────────────────────────────
export const COLOR = {
  // Backgrounds — warm cream, not pure white
  bg:           '#F5F0E8',
  surface:      '#FEFCF8',
  surfaceRaised:'#EDE6D6',

  // Borders — warm tan
  borderSubtle: '#E2D9C5',
  borderDefault:'#C8BAA0',

  // Text — warm dark, not pure black
  textPrimary:  '#1C1710',
  textSecondary:'#5A4D3A',
  textMuted:    '#8C7D65',
  textDisabled: '#B8A888',

  // Accent — deep indigo (used for active state only)
  accent:       '#312E81',
  accentSoft:   '#312E8110',
  accentMuted:  '#4338CA',

  // Semantic
  success:      '#166534',
  danger:       '#991B1B',
} as const;

// ── Typography ─────────────────────────────────────────────────────────────
// Load via useFonts in App.tsx before using
export const FONTS = {
  heading:       'EBGaramond_700Bold',
  headingSemi:   'EBGaramond_600SemiBold',
  headingMedium: 'EBGaramond_500Medium',
  body:          'CrimsonText_400Regular',
  bodySemi:      'CrimsonText_600SemiBold',
  bodyItalic:    'CrimsonText_400Regular_Italic',
} as const;

// Type scale (px)
export const TYPE = {
  xs:   11,
  sm:   13,
  base: 16,
  md:   18,
  lg:   22,
  xl:   28,
  '2xl': 36,
  '3xl': 48,
} as const;
