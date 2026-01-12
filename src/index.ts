// @tenorlab/react-dashboard
// file: src/index.ts

/**
 * @license
 * Copyright (c) 2026 Tenorlab. All rights reserved.
 * * This source code is licensed under a dual-license model:
 * 1. Non-Commercial: Polyform Non-Commercial License 1.0.0
 * 2. Commercial: Tenorlab Commercial License
 * * Commercial use or redistribution of this source code (original or modified)
 * is strictly prohibited without a valid Tenorlab Commercial License.
 * * Purchase/Inquiries: https://www.tenorlab.com
 */

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
