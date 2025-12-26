// file: vite.config.ts
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
      rollupTypes: true,
      bundledPackages: ['@tenorlab/dashboard-core'],
      // This ensures the plugin looks at the root of your project 
      // and follows the devDependencies into node_modules
      compilerOptions: {
        moduleResolution: 100, // Bundler
        noEmit: false,
      },
      // Sometimes the plugin needs to be told exactly which 
      // files to include for the rollup process
      afterDiagnostic: (diagnostics) => {
        // This helps debug if TS is failing to find the core types
        if (diagnostics.length > 0) {
          console.log('TS Diagnostics found during dts generation')
        }
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
      // Switching to object syntax for multiple outputs
      entry: {
        'react-dashboard': path.resolve(__dirname, 'src/index.ts'),
        'core': path.resolve(__dirname, 'src/core.ts')
      },
      formats: ['es'],
      name: projectName,
      fileName: (format) => `${projectName}.${format}.js`,
    },
    rollupOptions: {
      // THIS IS VITAL: The SDK must not contain React code
      external: ['react', 'react-dom', 'react/jsx-runtime', 'zustand'],
      output: {
        // Provide global variables to use in the UMD build
        // Add external deps here
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM'
        },
        // This ensures your main file is named react-dashboard.es.js 
        // and core is named core.es.js
        entryFileNames: (chunkInfo) => {
          // Matches the key in your lib.entry object
          return chunkInfo.name === 'react-dashboard' 
            ? 'react-dashboard.es.js' 
            : '[name].es.js'
        },
        // If shared code is split out, name it something recognizable
        chunkFileNames: 'chunks/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const name = assetInfo.names?.[0] ?? assetInfo.name
          if (name && name.endsWith('.css')) {
            return 'styles.css'
          }
          return '[name][extname]'
        },
      },
    },
  },
})
