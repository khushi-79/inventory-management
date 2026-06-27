/**
 * Design Tokens — Single source of truth for all visual constants.
 *
 * Sourced directly from design_system_specification.md.
 * Every color, spacing value, font size, and border radius used in the app
 * must reference these tokens — never use inline magic numbers.
 *
 * Target audience: Users aged 40–70, WCAG 2.1 AA minimum (target AAA for body text).
 */

// =============================================================================
// COLORS
// =============================================================================
export const Colors = {
  // Brand
  primary: '#1A56DB',       // 8.2:1 contrast on white — primary actions, active tabs
  primaryDark: '#1E429F',   // Pressed state for primary buttons

  secondary: '#15803D',     // WhatsApp-style share buttons, ledger credits
  secondaryDark: '#166534', // Pressed state for secondary buttons

  // Semantic
  success: '#166534',
  successBackground: '#DCFCE7',

  warning: '#D97706',
  warningBackground: '#FEF3C7',

  error: '#991B1B',
  errorBackground: '#FEE2E2',

  // Backgrounds
  backgroundDefault: '#FFFFFF',
  backgroundCanvas: '#F9FAFB',
  backgroundOverlay: 'rgba(17, 24, 39, 0.4)',

  // Text
  textPrimary: '#111827',    // Dark charcoal — headings
  textSecondary: '#374151',  // Medium slate — body text
  textMuted: '#6B7280',      // Disabled / helper labels
  textOnPrimary: '#FFFFFF',  // White — text on colored buttons

  // Borders
  borderDefault: '#D1D5DB',
  borderStrong: '#4B5563',
} as const;

// =============================================================================
// TYPOGRAPHY
// =============================================================================
export const FontFamily = {
  display: 'Outfit-Bold',
  displaySemiBold: 'Outfit-SemiBold',
  body: 'Inter-Regular',
  bodySemiBold: 'Inter-SemiBold',
  bodyBold: 'Inter-Bold',
} as const;

export const FontSize = {
  displayLarge: 32,
  displayMedium: 28,
  headingLarge: 24,
  headingMedium: 20,
  bodyLarge: 18,
  bodyMedium: 16,
  captionLarge: 14,
  captionMedium: 14,
} as const;

export const FontWeight = {
  regular: '400' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  displayLarge: 40,
  displayMedium: 36,
  headingLarge: 30,
  headingMedium: 26,
  bodyLarge: 24,
  bodyMedium: 22,
  captionLarge: 18,
  captionMedium: 18,
} as const;

// =============================================================================
// SPACING (4px grid)
// =============================================================================
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

// =============================================================================
// BORDER RADIUS
// =============================================================================
export const BorderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  full: 9999,
} as const;

// =============================================================================
// BORDER WIDTH
// =============================================================================
export const BorderWidth = {
  thin: 1,
  medium: 1.5,
  thick: 2,
} as const;

// =============================================================================
// TOUCH TARGETS — Minimum 56dp for users aged 40–70
// =============================================================================
export const TouchTarget = {
  minimumHeight: 56,
  minimumWidth: 56,
} as const;

// =============================================================================
// SHADOWS
// =============================================================================
export const Shadow = {
  default: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
} as const;

// =============================================================================
// NAVIGATION
// =============================================================================
export const NavigationTokens = {
  tabBarHeight: 72,
  headerHeight: 64,
  tabBarActiveTintColor: Colors.primary,
  tabBarInactiveTintColor: Colors.textMuted,
  tabBarIndicatorThickness: 3,
} as const;
