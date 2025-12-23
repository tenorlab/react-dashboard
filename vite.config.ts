/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { name } from './package.json'
const projectName = name.replace('@tenorlab/', '').trim().toLowerCase()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react()
  ],
  envDir: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/')
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      name: projectName,
      fileName: (format) => `${projectName}.${format}.js`,
    },
    rollupOptions: {
      // THIS IS VITAL: The SDK must not contain React code
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          react: 'React',
        },
      },
    },
  },
})
