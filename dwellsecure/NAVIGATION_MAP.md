# DwellSecure screen flow and navigation

## 1. Navigator hierarchy

```
AppNavigator (root; switches by isSignedIn / showOnboarding)
├── AuthStack (not logged in)
│   ├── Login
│   ├── SignUp
│   └── ForgotPassword
│
├── Onboarding (logged in, onboarding not complete)
│   ├── [phase welcome] OnboardingWelcomeScreen (no route name)
│   └── [phase add-property] Stack
│       ├── AddPropertyOnboarding  (AddPropertyScreen, onboardingMode: true)
│       ├── MapPicker
│       └── Success
│
└── RootStack (logged in, onboarding complete)
    ├── MainStack (main UI + bottom tabs)
    │   ├── Property  → PropertyStack (see below)
    │   ├── Reminders → RemindersScreen
    │   ├── AIAssistance
    │   └── Share
    │   + BottomNav (hidden on some screens)
    └── EmergencyMode
```

**PropertyStack** (stack inside the main "Property" tab):

```
PropertyStack
├── PropertyList       ← default home
├── Shutoffs           → ShutoffsStack (nested)
├── Utilities          → UtilitiesStack (nested)
├── PropertyDetail
├── ShutoffDetail
├── UtilityDetail
├── AddProperty
├── AddPerson
├── PersonDetail
├── EditProperty
├── AddEditShutoff
├── AddEditUtility
├── MapPicker
└── Success
```

**ShutoffsStack** (as a screen "Shutoffs" inside PropertyStack):

```
ShutoffsStack
├── ShutoffsList
├── AddEditShutoff
├── PropertyList
├── PropertyDetail
├── ShutoffDetail
├── AddProperty
├── AddPerson
└── EditProperty
(No MapPicker / Success; uses parent PropertyStack)
```

**UtilitiesStack** (as a screen "Utilities" inside PropertyStack):

```
UtilitiesStack
├── UtilitiesList
└── AddEditUtility
(No MapPicker; uses parent PropertyStack)
```

---

## 2. Screen navigation summary

| Location      | Screen                 | Navigate to                                                                 | Method            |
|--------------|------------------------|-----------------------------------------------------------------------------|-------------------|
| AuthStack    | Login                  | ForgotPassword, SignUp                                                     | navigate          |
| AuthStack    | SignUp                 | Login                                                                       | navigate          |
| AuthStack    | ForgotPassword         | Login, goBack                                                               | navigate / goBack |
| Onboarding   | OnboardingWelcomeScreen| (no route) → internal setOnboardingPhase('add-property')                    | state             |
| Onboarding   | AddPropertyScreen (onboarding) | MapPicker, Success; back → goBackToWelcome()                         | navigate / context|
| Onboarding   | SuccessScreen (onboardingMode) | no route → completeOnboarding() closes onboarding                    | context           |
| MainStack    | (911 FAB)              | EmergencyMode                                                               | navigate          |
| MainStack    | EmergencyModeScreen    | goBack                                                                      | goBack            |
| PropertyStack| PropertyListScreen     | PropertyDetail, AddProperty                                                 | navigate          |
| PropertyStack| PropertyDetailScreen   | PropertyList, goBack, EditProperty, UtilityDetail, ShutoffDetail, …        | navigate / goBack |
| PropertyStack| AddPropertyScreen (non-onboarding) | MapPicker, Success, AddPerson; step=1 back → goBack              | navigate / goBack  |
| PropertyStack| SuccessScreen (non-onboarding) | PropertyList (reset stack)                                        | reset             |
| PropertyStack| ShutoffDetailScreen    | AddEditShutoff, MapPicker, goBack                                           | navigate / goBack |
| PropertyStack| AddEditShutoffScreen   | goBack, MapPicker                                                           | goBack / navigate |
| PropertyStack| UtilityDetailScreen    | goBack, MapPicker                                                           | goBack / navigate |
| PropertyStack| AddEditUtilityScreen   | goBack, MapPicker                                                           | goBack / navigate |
| PropertyStack| AddPersonScreen        | goBack                                                                      | goBack            |
| PropertyStack| PersonDetailScreen     | AddPerson, goBack                                                           | navigate / goBack |
| PropertyStack| MapPickerScreen        | goBack (with params)                                                        | goBack            |
| ShutoffsStack| ShutoffsListScreen     | AddEditShutoff                                                              | navigate          |
| UtilitiesStack | UtilitiesListScreen  | AddEditUtility                                                              | navigate          |
| MainStack    | RemindersScreen        | ShutoffDetail                                                               | navigate          |
| BottomNav    | —                      | Property, Reminders, AIAssistance, Share                                    | navigate          |

**Notes:**

- **Onboarding flow**: Welcome → Add Property (AddPropertyOnboarding) → (optional) MapPicker → Success → tap "Go home" calls `completeOnboarding()` and `setOnboardingComplete()`, then returns to RootStack.
- **Add Property (non-onboarding)**: PropertyList → AddProperty → MapPicker / Success → Success uses `navigation.reset({ routes: [{ name: 'PropertyList' }] })` to return to the property list.
- **Back button**: AddPropertyScreen at step=1: if `onboardingMode` then `goBackToWelcome()`, else `navigation.goBack()`.

---

## 3. Logic points that may need adjustment

1. **RemindersScreen → ShutoffDetail**  
   Reminders lives in MainStack, ShutoffDetail in PropertyStack. The app uses `navigation.navigate('ShutoffDetail', { shutoffId })`. If that fails at runtime, use nested navigation:  
   `navigation.navigate('Property', { screen: 'ShutoffDetail', params: { shutoffId } })`.

2. **SuccessScreen (non-onboarding) reset**  
   `navigation.reset({ index: 0, routes: [{ name: 'PropertyList' }] })` resets the **current** navigator. Success is only in PropertyStack, so it correctly resets to PropertyList. If Success is later used in other stacks, differentiate reset target by source stack.

3. **HomeScreen**  
   HomeScreen is not registered in AppNavigator and only exists as a file. If unused, remove it or expose via deep link; if used, register it in the right stack and add an entry.

4. **BottomNav visibility**  
   `hideNavScreens` includes AddProperty, AddPerson, EditProperty, EmergencyMode, MapPicker, Success, AddEditShutoff, AddEditUtility. Those screens do not show the bottom nav, matching the current design.

5. **Onboarding polling**  
   AppNavigator checks `isOnboardingComplete()` every 1s; if false it calls `setShowOnboarding(true)`. Onboarding completion must call `setOnboardingComplete()` (done in `handleOnboardingComplete`); otherwise the user is sent back to Welcome.

---

## 4. Entry/exit by flow

- **Login**: Login ⇄ SignUp, Login → ForgotPassword → Login.
- **Onboarding**: Welcome → Add Property → (MapPicker) → Success → completeOnboarding → main app.
- **Property**: PropertyList ⇄ PropertyDetail, AddProperty, EditProperty; AddProperty / EditProperty → MapPicker, Success; Success → reset to PropertyList.
- **Shutoffs**: ShutoffsList → AddEditShutoff, ShutoffDetail; AddEditShutoff / ShutoffDetail → MapPicker (parent stack).
- **Utilities**: UtilitiesList → AddEditUtility; AddEditUtility → MapPicker (parent stack).
- **Reminders**: Reminders → ShutoffDetail (use nested navigate if the direct navigate fails).
- **Bottom tabs**: Property | Reminders | AIAssistance | Share.
- **Emergency**: Any main screen (911 FAB) → EmergencyMode → goBack.

To change a specific navigation or behavior (e.g. Reminders → ShutoffDetail or Success reset), specify the screen and desired behavior and the exact code changes can be provided.
