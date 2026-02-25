# DwellSecure 屏幕连接与跳转说明

## 一、导航器层级结构

```
AppNavigator (根，根据 isSignedIn / showOnboarding 切换)
├── AuthStack (未登录)
│   ├── Login
│   ├── SignUp
│   └── ForgotPassword
│
├── Onboarding (已登录且 onboarding 未完成)
│   ├── [阶段 welcome] OnboardingWelcomeScreen（无路由名）
│   └── [阶段 add-property] Stack
│       ├── AddPropertyOnboarding  (AddPropertyScreen, onboardingMode: true)
│       ├── MapPicker
│       └── Success
│
└── RootStack (已登录且 onboarding 已完成)
    ├── MainStack (主界面 + 底部 Tab)
    │   ├── Property  → PropertyStack（见下）
    │   ├── Reminders → RemindersScreen
    │   ├── AIAssistance
    │   └── Share
    │   + BottomNav（隐藏于部分屏幕）
    └── EmergencyMode
```

**PropertyStack**（主 Tab「Property」内的栈）：

```
PropertyStack
├── PropertyList       ← 默认首页
├── Shutoffs           → ShutoffsStack（嵌套）
├── Utilities          → UtilitiesStack（嵌套）
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

**ShutoffsStack**（作为 PropertyStack 的一个 screen「Shutoffs」）：

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
（无 MapPicker / Success，依赖父栈 PropertyStack）
```

**UtilitiesStack**（作为 PropertyStack 的一个 screen「Utilities」）：

```
UtilitiesStack
├── UtilitiesList
└── AddEditUtility
（无 MapPicker，依赖父栈 PropertyStack）
```

---

## 二、各 Screen 的跳转方式汇总

| 所在位置 | Screen | 跳转目标 | 方式 |
|----------|--------|----------|------|
| AuthStack | Login | ForgotPassword, SignUp | navigate |
| AuthStack | SignUp | Login | navigate |
| AuthStack | ForgotPassword | Login, goBack | navigate / goBack |
| Onboarding | OnboardingWelcomeScreen | （无路由）→ 内部 setOnboardingPhase('add-property') | 状态切换 |
| Onboarding | AddPropertyScreen (onboarding) | MapPicker, Success；返回 → goBackToWelcome() | navigate / context |
| Onboarding | SuccessScreen (onboardingMode) | 无路由 → completeOnboarding() 关闭 onboarding | context |
| MainStack | （911 浮钮） | EmergencyMode | navigate |
| MainStack | EmergencyModeScreen | goBack | goBack |
| PropertyStack | PropertyListScreen | PropertyDetail, AddProperty | navigate |
| PropertyStack | PropertyDetailScreen | PropertyList, goBack, EditProperty, UtilityDetail, AddEditUtility, ShutoffDetail, AddEditShutoff, PersonDetail, AddPerson | navigate / goBack |
| PropertyStack | AddPropertyScreen (非 onboarding) | MapPicker, Success, AddPerson；step=1 返回 → goBack | navigate / goBack |
| PropertyStack | SuccessScreen (非 onboarding) | PropertyList（重置栈） | reset |
| PropertyStack | ShutoffDetailScreen | AddEditShutoff, MapPicker, goBack | navigate / goBack |
| PropertyStack | AddEditShutoffScreen | goBack, MapPicker | goBack / navigate |
| PropertyStack | UtilityDetailScreen | goBack, MapPicker | goBack / navigate |
| PropertyStack | AddEditUtilityScreen | goBack, MapPicker | goBack / navigate |
| PropertyStack | AddPersonScreen | goBack | goBack |
| PropertyStack | PersonDetailScreen | AddPerson, goBack | navigate / goBack |
| PropertyStack | MapPickerScreen | goBack（带 params 回传） | goBack |
| ShutoffsStack | ShutoffsListScreen | AddEditShutoff | navigate |
| UtilitiesStack | UtilitiesListScreen | AddEditUtility | navigate |
| MainStack | RemindersScreen | ShutoffDetail | navigate |
| BottomNav | — | Property, Reminders, AIAssistance, Share | navigate |

**说明：**

- **Onboarding 流程**：Welcome → Add Property（AddPropertyOnboarding）→（可选）MapPicker → Success → 点「Go home」调用 `completeOnboarding()`，并写入 `setOnboardingComplete()`，关闭 onboarding，回到 RootStack。
- **非 Onboarding 的 Add Property**：PropertyList → AddProperty → MapPicker / Success → Success 里 `navigation.reset({ routes: [{ name: 'PropertyList' }] })` 回到物业列表。
- **返回键逻辑**：AddPropertyScreen 在 step=1 时，若 `onboardingMode` 则 `goBackToWelcome()`，否则 `navigation.goBack()`。

---

## 三、可能需要矫正的逻辑点

1. **RemindersScreen → ShutoffDetail**  
   Reminders 在 MainStack，ShutoffDetail 在 PropertyStack 内。当前使用 `navigation.navigate('ShutoffDetail', { shutoffId })`。若实际运行时无法跳到 ShutoffDetail，需改为嵌套：  
   `navigation.navigate('Property', { screen: 'ShutoffDetail', params: { shutoffId } })`。

2. **SuccessScreen（非 onboarding）的 reset**  
   当前 `navigation.reset({ index: 0, routes: [{ name: 'PropertyList' }] })` 会重置**当前 navigator**。Success 只在 PropertyStack 中注册，因此会重置 PropertyStack 到 PropertyList，逻辑正确。若将来 Success 也在其他栈中注册，需要按来源栈区分 reset 目标。

3. **HomeScreen**  
   HomeScreen 未在 AppNavigator 中注册，仅存在文件。若已不用，可考虑删除或改为从某处（如深链）打开；若仍要用，需在合适栈中注册并接好入口。

4. **BottomNav 隐藏规则**  
   `hideNavScreens` 包含 AddProperty, AddPerson, EditProperty, EmergencyMode, MapPicker, Success, AddEditShutoff, AddEditUtility。这些界面不显示底部导航，与当前设计一致。

5. **Onboarding 轮询**  
   AppNavigator 中每 1 秒检查 `isOnboardingComplete()`；若为 false 则 `setShowOnboarding(true)`。完成 onboarding 时必须调用 `setOnboardingComplete()`（已在 `handleOnboardingComplete` 中实现），否则会再次被拉回 Welcome。

---

## 四、按流程归纳的入口/出口

- **登录流**：Login ⇄ SignUp, Login → ForgotPassword → Login。
- **Onboarding 流**：Welcome → Add Property →（MapPicker）→ Success → completeOnboarding → 主应用。
- **主应用 Property**：PropertyList ⇄ PropertyDetail, AddProperty, EditProperty；AddProperty / EditProperty → MapPicker, Success；Success → reset 到 PropertyList。
- **主应用 Shutoffs**：ShutoffsList → AddEditShutoff, ShutoffDetail；AddEditShutoff / ShutoffDetail → MapPicker（父栈）。
- **主应用 Utilities**：UtilitiesList → AddEditUtility；AddEditUtility → MapPicker（父栈）。
- **Reminders**：Reminders → ShutoffDetail（若跳不到需用嵌套 navigate）。
- **底部 Tab**：Property | Reminders | AIAssistance | Share。
- **Emergency**：任意主界面（911 浮钮）→ EmergencyMode → goBack。

如需我根据这份地图**具体改某一条跳转或某一块逻辑**（例如 Reminders → ShutoffDetail 或 Success 的 reset），可以说出屏幕名和目标行为，我按文件给出修改片段。
