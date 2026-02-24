/**
 * Utility to help convert web React components (from Builder.io/Figma) to React Native
 * 
 * Common conversions:
 * - div -> View
 * - span/p -> Text
 * - button -> TouchableOpacity or Pressable
 * - img -> Image
 * - input -> TextInput
 * - className -> style (StyleSheet)
 * - onClick -> onPress
 * - CSS -> StyleSheet
 */

export const webToRNMappings = {
  // HTML elements to React Native
  'div': 'View',
  'span': 'Text',
  'p': 'Text',
  'h1': 'Text',
  'h2': 'Text',
  'h3': 'Text',
  'button': 'TouchableOpacity',
  'img': 'Image',
  'input': 'TextInput',
  'textarea': 'TextInput',
  
  // Attributes
  'className': 'style',
  'onClick': 'onPress',
  'onChange': 'onChangeText',
  'src': 'source',
  'alt': 'accessibilityLabel',
  
  // CSS to StyleSheet
  'display: flex': 'flexDirection: row/column',
  'flex-direction': 'flexDirection',
  'justify-content': 'justifyContent',
  'align-items': 'alignItems',
  'padding': 'padding',
  'margin': 'margin',
  'width': 'width',
  'height': 'height',
  'background-color': 'backgroundColor',
  'color': 'color',
  'font-size': 'fontSize',
  'font-weight': 'fontWeight',
  'border-radius': 'borderRadius',
  'border': 'borderWidth, borderColor',
};

/**
 * Convert CSS styles to React Native StyleSheet format
 */
export function convertCSSToRN(cssString) {
  // This is a basic converter - you may need to adjust for complex CSS
  const styleMap = {
    'display': 'flex', // React Native is always flex
    'flexDirection': 'row', // default
    'justifyContent': 'flex-start',
    'alignItems': 'stretch',
  };
  
  // Add your CSS parsing logic here
  return styleMap;
}

/**
 * Example: Convert a web component structure to React Native
 */
export function convertComponent(webComponentCode) {
  // Replace common patterns
  let rnCode = webComponentCode
    .replace(/<div/g, '<View')
    .replace(/<\/div>/g, '</View>')
    .replace(/<span/g, '<Text')
    .replace(/<\/span>/g, '</Text>')
    .replace(/<p/g, '<Text')
    .replace(/<\/p>/g, '</Text>')
    .replace(/<button/g, '<TouchableOpacity')
    .replace(/<\/button>/g, '</TouchableOpacity>')
    .replace(/onClick=/g, 'onPress=')
    .replace(/className=/g, 'style=')
    .replace(/class=/g, 'style=');
  
  return rnCode;
}

