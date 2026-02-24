# Quick Conversion Reference

## Where is your Builder.io code?

The Builder.io dev tools might have:
- Generated files in a `components/` folder
- Copied code to your clipboard
- Created files with names like `Component.tsx` or `BuilderComponent.jsx`

## Quick Conversions:

### 1. Imports
```javascript
// Web React (Builder.io)
import React from 'react';

// React Native
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
```

### 2. HTML Elements
```javascript
// Web
<div> → <View>
<span>, <p>, <h1> → <Text>
<button> → <TouchableOpacity>
<img> → <Image>
<input> → <TextInput>
```

### 3. Styling
```javascript
// Web
<div className="card" style={{ padding: 20 }}>

// React Native
<View style={styles.card}>
// Then in StyleSheet:
const styles = StyleSheet.create({
  card: { padding: 20 }
});
```

### 4. Events
```javascript
// Web
onClick={handleClick}
onChange={handleChange}

// React Native
onPress={handleClick}
onChangeText={handleChange}  // for TextInput
```

## Next Steps:

1. **Find your generated code** - Check:
   - Project root folder
   - `components/` folder
   - Your clipboard
   - Builder.io output location

2. **Share it with me** - I'll convert it automatically

3. **Or tell me**:
   - What component was generated?
   - What screen should it go on?
   - Any specific features needed?

