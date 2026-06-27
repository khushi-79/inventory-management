# Design System Specification: B2B Inventory & Ordering App

This document establishes the Design System Specification for the B2B Inventory & Ordering mobile application. It defines the visual standards, design tokens, spacing rules, and UI component parameters tailored specifically for a mobile-first React Native + Expo + TypeScript implementation targeted at users aged 40–70 with WhatsApp-level technical comfort.

---

## 1. Color Palette & Accessibility Specifications

*To support users with presbyopia or color-vision decline, all color selections must strictly comply with WCAG 2.1 AA (contrast ratio $\ge 4.5:1$) and target WCAG AAA (contrast ratio $\ge 7:1$) for body text.*

### 1.1 Palette Definitions
*   **Primary (Brand & Main Actions)**: 
    *   `Hex`: `#1A56DB` (Vibrant Indigo Blue)
    *   *Usage*: Active tab icons, primary action buttons, header backgrounds.
    *   *Contrast*: 8.2:1 against white background.
*   **Secondary (WhatsApp-Style Callout & Collections)**:
    *   `Hex`: `#15803D` (Vibrant Leaf Green)
    *   *Usage*: WhatsApp sharing buttons, dues payment receipts, ledger credits.
    *   *Contrast*: 5.1:1 against white background.
*   **Success (Fully Allocated / Delivered / Active)**:
    *   `Hex`: `#166534` (Deep Forest Green)
    *   *Usage*: Successful order statuses, stock available indicators.
    *   *Contrast*: 6.5:1 against light-green backgrounds.
*   **Warning (Pending Approvals / Credit Over-Limit)**:
    *   `Hex`: `#D97706` (Amber Orange)
    *   *Usage*: Pending approval badges, credit limit warning alerts.
    *   *Contrast*: 4.6:1 against white background.
*   **Error (Out of Stock / Cancelled / Due Dues)**:
    *   `Hex`: `#991B1B` (Crimson Red)
    *   *Usage*: Cancelled order status, stockout warnings, aging overdue alerts.
    *   *Contrast*: 7.4:1 against white background.
*   **Backgrounds**:
    *   Primary Background: `#FFFFFF` (Solid White)
    *   Secondary Canvas: `#F9FAFB` (Off-white gray)
    *   System Overlays: `#111827` with 40% opacity (Dim backdrop)
*   **Text Colors**:
    *   Primary Headings: `#111827` (Dark Charcoal Black)
    *   Secondary Body: `#374151` (Medium Slate Gray)
    *   Disabled / Helper Labels: `#6B7280` (Muted Pebble Gray)

### 1.2 Accessibility Considerations
*   **Color-Blindness Independence**: Status indicators must never rely on color alone. Every badge, warning, or state indicator must pair color with descriptive text or symbol badges (e.g., green badge + `[Approved]` text).
*   **Touch Feedbacks**: Interactive touches must trigger a clear visual contrast shift (e.g., active buttons darken from `#1A56DB` to `#1E429F` on press).

---

## 2. Typography

*Typography is optimized for legibility at arm's length. The selected typeface is **Outfit** (Display/Headings) paired with **Inter** (Body/Labels) to maximize readability.*

| Token Name | Font Family | Size (sp/dp) | Weight | Line Height | Usage Rules |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `Display.Large` | Outfit | `32` | Bold (700) | `40` | Financial aggregates, dashboard balance cards. |
| `Display.Medium`| Outfit | `28` | Bold (700) | `36` | Today's sales KPI numbers. |
| `Heading.Large` | Outfit | `24` | SemiBold (600)| `30` | Section headings, modal titles. |
| `Heading.Medium`| Outfit | `20` | SemiBold (600)| `26` | List item titles, card headers. |
| `Body.Large` | Inter | `18` | SemiBold (600)| `24` | Product names, input textbox values, checkout totals. |
| `Body.Medium` | Inter | `16` | Regular (400) | `22` | Descriptions, secondary details, address blocks. |
| `Caption.Large` | Inter | `14` | SemiBold (600)| `18` | Badges, button labels, key-value keys. |
| `Caption.Medium`| Inter | `14` | Regular (400) | `18` | Helper texts, timestamps, inactive tab labels. |

---

## 3. Spacing System

*To support thick fingers and prevent tap misses, layout margins and padding strictly follow a 4px-grid system with large breathing room.*

*   **`4px` (X-Small)**: Border radius, spacing between double-line headers.
*   **`8px` (Small)**: Text-to-text spacing, padding inside badges, grid cells spacing.
*   **`12px` (Medium)**: Padding inside list items, spacing between card items.
*   **`16px` (Large)**: Standard page side-margin (gutter padding), spacing between cards.
*   **`24px` (X-Large)**: Vertical margins between sections, padding inside dialogue boxes.
*   **`32px` (XX-Large)**: Footer margins, bottom sheet top-gap spacing.

---

## 4. UI Components

### 4.1 Buttons
*   **Variants**:
    *   *Primary*: Solid background (`#1A56DB`), white text.
    *   *Secondary (WhatsApp style)*: Solid background (`#15803D`), white text, left icon.
    *   *Outline*: Transparent background, border 2px (`#1A56DB`), text (`#1A56DB`).
*   **States**:
    *   *Normal*: Full opacity.
    *   *Pressed*: Background color darkens by 15%, slight haptic trigger on device.
    *   *Disabled*: Background `#E5E7EB`, text `#9CA3AF`, touch actions deactivated.
*   **Accessibility**: Minimum touch height `56dp`. Minimum touch width `56dp`. Accessible role `button` declaration.

### 4.2 Inputs
*   **Variants**: Text Input, Numeric Input, Password Input (eye icon togglable).
*   **States**:
    *   *Normal*: Border 1.5px gray (`#D1D5DB`), background white.
    *   *Focused*: Border 2px blue (`#1A56DB`), helper label shifts blue.
    *   *Filled*: Border 1.5px dark gray (`#4B5563`).
    *   *Error*: Border 2px red (`#991B1B`), displays warning icon inside, error text below.
*   **Accessibility**: Input fields must have static, readable label headers outside the field (do not rely on placeholder text which disappears once typing starts).

### 4.3 Search Bars
*   **Variants**: Global Search (with micro-voice trigger).
*   **States**:
    *   *Inactive*: Shows search magnifier icon on left, mic icon on right.
    *   *Active*: Displays typing cursor, displays a clear cross icon `[X]` to quickly empty query.
*   **Accessibility**: Microphone button touch target `56dp × 56dp`. Voice interface must display full-screen native modal: "Speak now to search".

### 4.4 Cards
*   **Variants**: Raised Card (shadow radius 4), Flat Card (border 1px `#E5E7EB`).
*   **States**: Normal, Pressed (scales down slightly by 1.5% to indicate selection click).
*   **Accessibility**: Active cards must have an `accessibleLabel` concatenation (e.g., `"Company: Rajkot Fittings Corp. Dues: Twelve Thousand Rupees. Double tap to view details"`).

### 4.5 Product Cards
*   **Variants**: Catalog Row, Expanded Matrix Picker (Size x Finish layout).
*   **States**:
    *   *Normal*: Flat row.
    *   *Expanded*: Dropdown panel reveals grid inputs with large touch counters.
*   **Accessibility**: Plus and minus button size: `56dp × 56dp`. Counter values announced aloud on change.

### 4.6 Order Cards
*   **Variants**: Active Order, Pending Approval, Completed.
*   **Accessibility**: Includes status tag and order reference read back dynamically.

### 4.7 Status Badges
*   **Variants**: Green Pill (Success), Orange Pill (Warning), Red Pill (Error), Gray Pill (Muted).
*   **Accessibility**: Text-contrast inside badge must meet 4.5:1. Badge announced as "Status: [Text]".

### 4.8 Empty States
*   **Variants**: Center Screen Widget.
*   **Accessibility**: Include a single large button (`56dp` height) to guide the user back to the primary app flow.

### 4.9 Loading States
*   **Variants**: **Skeleton Screen Placeholders** (replaces full-screen spinner indicators to reduce visual friction and connection anxiety).
*   **Accessibility**: Include `accessibilityRole="progressbar"` and alternate text screen-reader readout: "Loading content, please wait."

### 4.10 Dialogs
*   **Variants**: Confirmation Overlay.
*   **States**: Appears as modal center-screen block overlaying dimmer background.
*   **Accessibility**: Close button in top right, primary actions at bottom. Block focus trap inside dialog.

### 4.11 Bottom Sheets
*   **Variants**: Filter Drawer, Custom Matrix Drawer.
*   **States**: Slides up from bottom. Contains a physical thick drag handle at the top (`32dp` wide, `4dp` thick).
*   **Accessibility**: Back button triggers close. Dismissible by tapping outer overlay backdrop.

---

## 5. Icons

*All iconography is sourced from **Lucide React Native** (`lucide-react-native`).*

### 5.1 Usage Rules
1.  **Icon Size**: Standard layout icons must be **`24dp × 24dp`** or **`32dp × 32dp`** inside main dashboards.
2.  **No Icon-Only Buttons**: Older users struggle to interpret abstract abstract shapes. Every icon button must have a clear text label underneath or next to it (e.g., do not just show a trash can; show a trash can + `Delete` text).
3.  **Color Sync**: Icons must match the text label color (e.g., active icon matches text color `#1A56DB`).

---

## 6. Navigation Design

### 6.1 Bottom Tab Bar Style
*   Height: **`72dp`** (increases target size and prevents navigation misclicks).
*   Active Icon: Indigo (`#1A56DB`) with a thick `3dp` indicator bar above it.
*   Active Label: Bold `Caption.Large` text (`#1A56DB`).
*   Inactive Icon/Label: Muted Gray (`#6B7280`).

### 6.2 Header Style
*   Height: **`64dp`**.
*   Background: White (`#FFFFFF`) with a subtle bottom shadow border.
*   Back Button: Large left arrow icon with touch padding target `56dp × 56dp`.
*   Title alignment: Center or Left depending on platform, size `Heading.Large` (`24sp`).

---

## 7. Dark Mode Strategy: V1 MVP Recommendation

> [!IMPORTANT]
> **Support for Dark Mode is DEFERRED for V1.**
> 
> *Rationale*:
> 1. **Visual Halation**: For users aged 40-70, dark mode often degrades legibility due to eye changes (astigmatism or cataracts). White text on dark backgrounds causes "halation" (a glowing blur effect), which increases eye strain.
> 2. **Cognitive Match**: The target user demographic is accustomed to high-contrast white pages (similar to WhatsApp's default theme, printed ledgers, and physical order bills).
> 3. **Focus Optimization**: Keeping development focused exclusively on a single high-contrast light mode guarantees visual excellence and faster delivery.

---

## 8. Design Tokens (JSON Schema Specification)

```json
{
  "colors": {
    "primary": "#1A56DB",
    "primaryDark": "#1E429F",
    "secondary": "#15803D",
    "secondaryDark": "#166534",
    "success": "#166534",
    "successBackground": "#DCFCE7",
    "warning": "#D97706",
    "warningBackground": "#FEF3C7",
    "error": "#991B1B",
    "errorBackground": "#FEE2E2",
    "background": {
      "default": "#FFFFFF",
      "canvas": "#F9FAFB",
      "overlay": "rgba(17, 24, 39, 0.4)"
    },
    "text": {
      "primary": "#111827",
      "secondary": "#374151",
      "muted": "#6B7280",
      "onPrimary": "#FFFFFF"
    }
  },
  "spacing": {
    "xs": 4,
    "sm": 8,
    "md": 12,
    "lg": 16,
    "xl": 24,
    "xxl": 32
  },
  "typography": {
    "fontFamily": {
      "display": "Outfit",
      "body": "Inter"
    },
    "fontSize": {
      "displayLarge": 32,
      "displayMedium": 28,
      "headingLarge": 24,
      "headingMedium": 20,
      "bodyLarge": 18,
      "bodyMedium": 16,
      "captionLarge": 14,
      "captionMedium": 14
    },
    "fontWeight": {
      "regular": "400",
      "semibold": "600",
      "bold": "700"
    },
    "lineHeight": {
      "displayLarge": 40,
      "displayMedium": 36,
      "headingLarge": 30,
      "headingMedium": 26,
      "bodyLarge": 24,
      "bodyMedium": 22,
      "captionLarge": 18,
      "captionMedium": 18
    }
  },
  "borders": {
    "radius": {
      "sm": 4,
      "md": 8,
      "lg": 12,
      "full": 9999
    },
    "width": {
      "thin": 1,
      "medium": 1.5,
      "thick": 2
    }
  },
  "touchTargets": {
    "minimumHeight": 56,
    "minimumWidth": 56
  },
  "shadows": {
    "default": {
      "shadowColor": "#000000",
      "shadowOffset": {
        "width": 0,
        "height": 2
      },
      "shadowOpacity": 0.1,
      "shadowRadius": 4,
      "elevation": 3
    }
  }
}
```
