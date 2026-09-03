---
name: ManakAI Authority
colors:
  surface: '#f8f9fa'
  surface-dim: '#d9dadb'
  surface-bright: '#f8f9fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f3f4f5'
  surface-container: '#edeeef'
  surface-container-high: '#e7e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#454652'
  inverse-surface: '#2e3132'
  inverse-on-surface: '#f0f1f2'
  outline: '#767683'
  outline-variant: '#c6c5d4'
  surface-tint: '#4c56af'
  primary: '#000666'
  on-primary: '#ffffff'
  primary-container: '#1a237e'
  on-primary-container: '#8690ee'
  inverse-primary: '#bdc2ff'
  secondary: '#2b5bb5'
  on-secondary: '#ffffff'
  secondary-container: '#759efd'
  on-secondary-container: '#00337c'
  tertiary: '#002103'
  on-tertiary: '#ffffff'
  tertiary-container: '#003909'
  on-tertiary-container: '#5aa958'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e0e0ff'
  primary-fixed-dim: '#bdc2ff'
  on-primary-fixed: '#000767'
  on-primary-fixed-variant: '#343d96'
  secondary-fixed: '#d9e2ff'
  secondary-fixed-dim: '#b0c6ff'
  on-secondary-fixed: '#001945'
  on-secondary-fixed-variant: '#00429c'
  tertiary-fixed: '#a3f69c'
  tertiary-fixed-dim: '#88d982'
  on-tertiary-fixed: '#002204'
  on-tertiary-fixed-variant: '#005312'
  background: '#f8f9fa'
  on-background: '#191c1d'
  surface-variant: '#e1e3e4'
  success-green: '#2E7D32'
  alert-red: '#C62828'
  bis-gold: '#B8860B'
  text-primary: '#121212'
  text-secondary: '#424242'
  border-subtle: '#E0E0E0'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
  code-sm:
    fontFamily: monospace
    fontSize: 13px
    fontWeight: '500'
    lineHeight: 18px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  gutter: 16px
  margin-mobile: 16px
  margin-desktop: 48px
  touch-target: 48px
  max-width-content: 1200px
---

## Brand & Style
The design system is engineered for "Government-grade trust," prioritizing institutional authority, regulatory clarity, and unwavering reliability. It moves away from ephemeral tech trends like glassmorphism or neon aesthetics, instead adopting a **Corporate / Modern** style that feels grounded and official.

The interface serves as a digital bridge between complex Bureau of Indian Standards (BIS) regulations and citizens/MSMEs. The visual language is utilitarian and "Deterministic," emphasizing evidence-based responses over conversational fluff. It uses a high-contrast, clean-surface approach to ensure that legal and technical information is legible for all users, including those in low-bandwidth or high-glare environments.

**Design Principles:**
- **Trust over Intelligence:** AI responses must always be anchored by visible, stable UI elements (badges, source drawers).
- **Institutional Weight:** Bold indigo tones and structured layouts communicate the backing of a national body.
- **Accessibility by Default:** Large touch targets and high-contrast ratios support a wide range of demographic abilities.

## Colors
The palette is dominated by **Professional Indigo** and **Trusted Blue**, colors traditionally associated with stability and government institutions. 

- **Primary (#1A237E):** Used for global navigation, headers, and primary branding elements.
- **Secondary (#0D47A1):** Used for interactive elements, links, and primary action buttons.
- **Success & Alert:** Reserved strictly for status verification. `success-green` signifies "Verified" or "Compliant" status, while `alert-red` indicates "Non-compliant" or "Action Required."
- **Neutral:** A very light grey (`#F8F9FA`) is used for page backgrounds to reduce eye strain while maintaining a "Clean White" aesthetic.
- **Borders:** Subtle grey borders (`#E0E0E0`) are used to define container boundaries in place of heavy shadows.

## Typography
**Inter** is the sole typeface, chosen for its exceptional legibility in both English and Indic scripts (when paired with compatible regional fonts).

- **Hierarchical Clarity:** Use `display-lg` for primary landing hero text.
- **Regulatory Weight:** Technical identifiers like IS Codes (e.g., IS 1293) should use a monospaced font or `label-md` with increased letter spacing to stand out from prose.
- **Body Text:** `body-md` is the standard for chat bubbles and regulatory snippets. Ensure a line height of at least 1.5x for readability of complex technical clauses.
- **Labels:** Status badges and "Mode" indicators use `label-md` in all-caps to denote their deterministic nature.

## Layout & Spacing
The layout follows a **Fluid Grid** model with strict maximum widths to prevent text lines from becoming too long and unreadable on desktop.

- **Grid:** A 12-column grid for desktop, transitioning to 4 columns for mobile.
- **Touch Accessibility:** Every interactive element (buttons, toggles, menu items) must adhere to a minimum `48px` touch target.
- **The Source Drawer:** On desktop, this appears as a 400px fixed-width right sidebar. On mobile, it transitions to a bottom-sheet that covers 90% of the screen height.
- **Mode Switching:** The navigation bar features a prominent toggle to switch between "Consumer" and "Industry" modes, which reconfigures the "Quick Action" card grid.

## Elevation & Depth
This system uses **Tonal Layers** and **Subtle Borders** rather than traditional drop shadows to create hierarchy.

- **Level 0 (Base):** The neutral `#F8F9FA` background.
- **Level 1 (Cards/Bubbles):** Clean white surfaces (`#FFFFFF`) with a 1px border (`#E0E0E0`).
- **Level 2 (Active/Floating):** Use a very soft, diffused shadow (0px 4px 12px rgba(0,0,0,0.05)) for floating action buttons or the active bottom-docked input bar.
- **Dividers:** Use 1px horizontal lines to separate technical clauses within the Source Drawer. Avoid shadows for internal separation.

## Shapes
The system uses **Soft (0.25rem)** roundedness to maintain a professional, slightly rigid government aesthetic. 

- **Standard Elements:** Buttons, input fields, and status badges use `rounded` (4px).
- **Containers:** Large evidence cards and chat bubbles use `rounded-lg` (8px).
- **Status Badges:** While corners remain slightly rounded, they never reach a full pill shape, maintaining a "stamped" or "certified" official look.

## Components
- **Buttons:** Primary buttons use `primary_color_hex` with white text. No gradients. Secondary buttons use a 1px border of `secondary_color_hex` with matching text.
- **Status Badges:** High-contrast background with white text. For "Verified," use `success-green`. For "Mandatory," use `bis-gold`.
- **Evidence Cards:** White cards with a subtle border. They must include a "Source Header" with the IS Code and a "Citations" footer.
- **Input Fields:** Large `48px` height with a clear label and focus state using `secondary_color_hex`.
- **Source Drawer:** A dedicated container for viewing PDFs or regulatory text. It uses a vertical stepper UI to show the "Evidence Trail" (e.g., Clause 4.2 -> Table 1 -> IS 1293).
- **Mode Toggle:** A segmented control at the top of the screen to switch the dashboard context between Industry and Consumer.