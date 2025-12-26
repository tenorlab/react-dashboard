// file: src/index.ts
// import dashboard-core styles.css so we can re-export as part of this package
import '@tenorlab/dashboard-core/styles.css'
// Re-export ONLY types from core for developer convenience
export type {
  IChildWidgetConfigEntry,
  IDashboardConfig,
  IDashboardGridPropsBase,
  IDashboardSettingEntry,
  IDashboardStorageService,
  IDashboardWidgetPropsBase,
  IDynamicWidgetCatalogEntryBase,
  TDashboardUndoStatus,
  TDashboardWidgetCatalogBase,
  TDashboardWidgetKey,
  TManifestEntry,
  TUndoHistoryEntry,
  TWidgetCategory,
  TWidgetDirection,
  TWidgetFactoryBase,
  TWidgetMetaInfoBase,
  TWidgetSize,
} from '@tenorlab/dashboard-core'

// export components and react-specific code
export * from './components/'
