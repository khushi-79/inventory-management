import {
  Colors,
  FontFamily,
  FontSize,
  FontWeight,
  LineHeight,
  Spacing,
  BorderRadius,
  BorderWidth,
  TouchTarget,
  Shadow,
  NavigationTokens,
} from '../constants/tokens';

/**
 * AppTheme is the typed shape of the global theme object.
 * All components receive this via useTheme() — never import tokens directly
 * in component files; always go through the theme hook.
 *
 * Dark mode is DEFERRED to V2 per design_system_specification.md.
 * The theme structure is designed to accept a future dark variant seamlessly.
 */
export interface AppTheme {
  colors: typeof Colors;
  fontFamily: typeof FontFamily;
  fontSize: typeof FontSize;
  fontWeight: typeof FontWeight;
  lineHeight: typeof LineHeight;
  spacing: typeof Spacing;
  borderRadius: typeof BorderRadius;
  borderWidth: typeof BorderWidth;
  touchTarget: typeof TouchTarget;
  shadow: typeof Shadow;
  navigation: typeof NavigationTokens;
}

export const lightTheme: AppTheme = {
  colors: Colors,
  fontFamily: FontFamily,
  fontSize: FontSize,
  fontWeight: FontWeight,
  lineHeight: LineHeight,
  spacing: Spacing,
  borderRadius: BorderRadius,
  borderWidth: BorderWidth,
  touchTarget: TouchTarget,
  shadow: Shadow,
  navigation: NavigationTokens,
};
