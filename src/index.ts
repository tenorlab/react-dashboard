// file: src/index.ts
// import dashboard-core styles.css so we can re-export as part of this package
import '@tenorlab/dashboard-core/styles.css'
// Re-export ONLY types from core for developer convenience
export type * from '@tenorlab/dashboard-core'
// export components and react-specific code
export * from './components/'
