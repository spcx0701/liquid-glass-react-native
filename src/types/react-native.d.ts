// The runtime resolves 'react-native' to react-native-web (see vite.config.ts).
// react-native-web is typed with Flow, not TypeScript, so this ambient module
// keeps the editor and tsc happy without pulling the entire react-native
// package in as a devDependency. Vite's esbuild pipeline strips types and
// never typechecks, so this has no runtime effect.
declare module 'react-native' {
  export const View: any
  export const Text: any
  export const TextInput: any
  export const ScrollView: any
  export const Pressable: any
  export const Animated: any
  export const Easing: any
  export const StyleSheet: any
  export const PanResponder: any
  export const Platform: any
  export const AppRegistry: any
  export const useWindowDimensions: any
}
