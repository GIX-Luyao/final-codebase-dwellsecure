## DwellSecure – Recent Changes by Cherry

This document summarizes the main changes made to the DwellSecure project during the latest iteration.

---

## 1. Git / Repository Setup

- Initialized a local Git repository in `dwellsecure`.
- Added remote: `https://github.com/SyHilichurl/psdwell` as `origin`.
- Created an initial commit on `main` and prepared it for pushing to remote branches (`Cherry`, `dwellsecure-initial`).

---

## 2. Web Admin Dashboard & Preview

### Admin Dashboard UI Polish

- Unified a **dark theme** with a slate/blue palette:
  - Background, surface, and elevated surface colors.
  - Focus border and primary blue with subtle glow.
- Introduced **design tokens**:
  - Border radii (`sm`, `md`, `lg`, `full`).
  - Shadows for cards and buttons.
  - A shared transition token.
- Improved **header & branding**:
  - Shield-style logo block with gradient and glow.
  - “Dwell Secure · Admin” title and user-count badge.
- Refined **cards and forms**:
  - Larger radius, subtle shadows, and focus-ring behavior.
  - Login screen: clearer copy, error alert box with background + border.
  - Inputs: consistent hover/focus states and placeholder colors.
- Table improvements:
  - Bordered, rounded wrapper with darker background.
  - Uppercase header row, clear hover states.
  - User IDs styled as monospace chips.
  - Distinct empty and loading states (icon + copy, spinner).

### Web Preview Page (`preview.html`)

- Brought **web preview** in line with the mobile theme:
  - CSS variables for `--primary`, `--primary-dark`, `--bg`, `--surface`, `--border`, `--text`, `--text-muted`.
  - DM Sans typography and improved layout/spacing.
  - Stat cards with icon circles and hover effects.
  - Primary buttons with hover states and consistent styling.
  - Bottom navigation with active state.
- Updated copy to match the app:
  - “Dwell Secure”, “Emergency preparedness”, “Quick actions”, etc.
- Added:
  - `theme-color` and proper viewport meta tags.
  - A **“Launch in Expo Go”** block with QR code + `exp://...:8081` URL.

---

## 3. Design System & Theming (Mobile App)

- Centralized theming (e.g. `src/constants/theme.js`):
  - Primary: `#0ea5e9` with light/dark variants.
  - Semantic colors: `error`, `success`, `warning`, `emergency`.
  - Utility-specific accents: `accentGas`, `accentElectric`, `accentWater`.
  - Shared shadows: `card`, `cardHover`, `button`, `fab`.

Applied consistently across:

- **HomeScreen**
  - Themed header (“Dwell Secure” + “Emergency preparedness”).
  - Stat cards with icon circles and card shadows.
  - Quick action buttons with primary/primaryDark and themed shadows.

- **AppNavigator**
  - Themed 911 modal (text, background, border).
  - Emergency FAB uses `colors.emergency` and `shadows.fab`.

- **OnboardingScreen**
  - All steps use theme tokens for background, text, borders, and placeholders.
  - CTA buttons (arrows, Continue/Done/Get Started) use `primary` colors.
  - Success state uses `success` + `successLight`.

- **PropertyCard**
  - Card backgrounds, placeholder states, text, and progress indicators all use theme colors and shadows.

- **ShutoffCard**
  - Uses type-specific accents (gas/electric/water).
  - Edit/delete actions use `primary`/`error`.
  - Verified/unverified chips use `success`/`warning` with light backgrounds.

- **ShutoffsListScreen**
  - Themed header, error banner, emergency badge, empty state, and spacing.

- **ShareScreen**
  - Removed hard-coded greys; now uses `textMuted` and other theme colors.

---

## 4. Finder / AI Assistance Screen (AIAssistanceScreen)

- Rebuilt the **Finder** (AI Assistance) screen to match **Reminders** and **Share** screens.

### Header & Layout

- Uses `SafeAreaView` (`edges={['top']}`) and shared `container` background.
- Header pattern now:
  - Left-aligned **title**: “Finder”.
  - Left-aligned **subtitle**: “Ask here or send an image to identify shutoffs” (or similar), sharing the same font sizes and colors as Reminders/Share.
  - Reused screen padding (`spacing.screenPadding`).
- Removed the previous custom row with centered title and back arrow to avoid overlap issues.
- Ensured content starts below the status bar and header with proper spacing.

### Body

- Chat area and bottom message/input section:
  - Keep existing functionality.
  - Updated backgrounds, borders, and padding to use the shared theme.

---

## 5. Emergency Floating Button (FAB) Behavior

All changes live in the main navigation (e.g. `AppNavigator`).

### Dragging Improvements

- Replaced manual `setState` updates with **`Animated.ValueXY` + `Animated.event`**:
  - Smoother drag interactions.
  - Less jank and better responsiveness.

### Bounds & Snapping

- On release, the FAB now:
  - **Clamps within screen bounds**.
  - **Snaps to the nearest left or right edge**, so it can’t stay floating mid-screen.
- Added vertical constraints:
  - **`topGutter`**: keeps the FAB **below the header**.
  - **`bottomGutter`**: keeps the FAB **above the bottom navigation bar**.
- Result: the emergency button always floats in a sensible, usable band of the screen and does not overlap the header or nav bar.

---

## 6. Detail & Edit Flows

### Shutoff Detail Screen

- Fixed hero-image edit button:
  - Previously called a non-existent `pickMedia('photo')`, causing an error.
  - Now calls the existing `handleEdit` function.
  - `handleEdit` navigates to `AddEditShutoff` with the current shutoff, opening the proper **edit page** for that utility.

### Property Edit Flow

- Updated property detail edit icon so that:
  - `navigation.navigate('EditProperty', { property })` is used.
  - The full `property` object is passed into `EditProperty`/`AddPropertyScreen`.
- `AddPropertyScreen` reads `route.params.property` and uses it to:
  - Pre-fill address, city, state, ZIP, property type, people count, image, and other fields.
- Result: when editing from the property detail page, the **second screen loads with all details pre-filled**.

---

## 7. Onboarding Bug Investigation (Instrumentation)

> Note: These changes were for debugging and can be removed once the issue is resolved.

Added logging (instrumentation only) around the onboarding state:

- **`src/services/storage.js`**
  - `isOnboardingComplete`: logs the raw value read from AsyncStorage (H2/H3).
  - `setOnboardingComplete`: logs successful writes to the onboarding flag (H2).

- **`src/screens/OnboardingScreen.js`**
  - `handleComplete`: logs when the completion handler runs and basic non-PII flags about entered data (H1).

- **`src/navigation/AppNavigator.js`**
  - `checkOnboarding`: logs the initial decision about whether to show onboarding (H3).
  - An interval effect: logs when it forces onboarding back on because `completed === false` (H3).

These logs are sent to a local debug endpoint and were used to gather evidence about why onboarding might reappear on a second login.

---

## 8. Dev & Run Instructions (Expo)

- App is configured for **Expo**:
  - Run in native/dev mode:
    - `npx expo start`
  - Run in web mode:
    - `npm run web`
    - or `npx expo start --web`
- For **Expo Go**:
  - Start server in a normal terminal: `npx expo start` (or `CI=false npx expo start` to ensure QR/menu is visible).
  - Scan the QR code from the terminal or from the `preview.html` QR section.

