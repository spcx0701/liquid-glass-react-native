import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// React Native source is aliased onto react-native-web, the standard way to
// run RN component trees in a browser. The same src/ tree can be consumed by
// a Metro-based native app (Metro resolves 'react-native' natively; the
// engine's web adapter is isolated behind src/engine/platform).
export default defineConfig(({ mode }) => ({
  base: '/liquid-glass-react-native/',
  plugins: [react()],
  resolve: {
    alias: { 'react-native': 'react-native-web' },
    extensions: ['.web.tsx', '.web.ts', '.web.js', '.tsx', '.ts', '.js'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(mode !== 'production'),
    'process.env.NODE_ENV': JSON.stringify(mode === 'production' ? 'production' : 'development'),
  },
}))
