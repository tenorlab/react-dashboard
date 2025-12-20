// file: src/components/interfaces/index.ts
export * from './core.base'
export * from './core.interfaces'
export * from './storage-service.interfaces'
export * from './core.utils'

/* begin: support plugin architecture */
import type { TDashboardWidgetKey } from './core.base'
import type { IDynamicWidgetCatalogEntry } from './core-react.interfaces'

// Abstract Catalog Type:
// It is a Map where the keys are TDashboardWidgetKey
// and the values are TDashboardWidgetFn functions that accept props with key TDashboardWidgetKey.
// export type TDashboardWidgetFn = (props: IDashboardWidgetProps) => IDashboardWidget
// export type TDashboardWidgetCatalog = Map<TDashboardWidgetKey, TDashboardWidgetFn>
export type TDashboardWidgetCatalog = Map<TDashboardWidgetKey, IDynamicWidgetCatalogEntry>

/* end: support plugin architecture */
