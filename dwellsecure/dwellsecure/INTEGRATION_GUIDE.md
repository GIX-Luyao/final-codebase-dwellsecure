# Builder.io / Figma to React Native Integration Guide

## If Builder.io generated code in a different location:

1. **Find the generated files** - They might be in:
   - A `components/` folder in the project root
   - A `builder/` or `figma/` folder
   - Your clipboard (if you copied them)

2. **Share the generated code** - You can:
   - Paste the code here and I'll convert it
   - Tell me the file path where the code was generated
   - Share the component names

## Common Conversions Needed:

### HTML to React Native:
- `<div>` → `<View>`
- `<span>`, `<p>`, `<h1>` → `<Text>`
- `<button>` → `<TouchableOpacity>` or `<Pressable>`
- `<img>` → `<Image>`
- `<input>` → `<TextInput>`

### CSS to StyleSheet:
- `className` → `style={styles.className}`
- CSS properties → StyleSheet objects
- Flexbox works similarly but syntax differs

### Event Handlers:
- `onClick` → `onPress`
- `onChange` → `onChangeText` (for TextInput)

## Steps to Integrate:

1. **Copy the generated component code**
2. **Convert HTML elements to React Native components**
3. **Convert CSS to StyleSheet**
4. **Update imports** (add React Native imports)
5. **Place in `src/components/` folder**
6. **Import and use in your screens**

## Example Conversion:

**Web React (from Builder.io):**
```jsx
<div className="card" onClick={handleClick}>
  <h2>Title</h2>
  <p>Description</p>
</div>
```

**React Native:**
```jsx
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

<TouchableOpacity style={styles.card} onPress={handleClick}>
  <Text style={styles.title}>Title</Text>
  <Text style={styles.description}>Description</Text>
</TouchableOpacity>

const styles = StyleSheet.create({
  card: { /* converted CSS */ },
  title: { /* converted CSS */ },
  description: { /* converted CSS */ },
});
```

## Need Help?

If you have the generated code, share it with me and I'll:
1. Convert it to React Native
2. Integrate it into your app
3. Make sure it works with your existing navigation and data flow

