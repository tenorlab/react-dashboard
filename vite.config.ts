/// <reference types="vite/client" />

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'
import path from 'path'
import { name } from './package.json'
const projectName = name.replace('@tenorlab/', '').trim().toLowerCase()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({
      rollupTypes: true, // This merges all types into one index.d.ts
      tsconfigPath: './tsconfig.json',
      insertTypesEntry: true,
      // Forces the inclusion of types from your devDependency
      bundledPackages: ['@tenorlab/dashboard-core'],
      compilerOptions: {
        noEmit: false // Override the tsconfig noEmit for the plugin
      }
    })
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
