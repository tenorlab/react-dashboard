// file: src/components/interfaces/core-react.interfaces.ts
import type { ReactNode, JSX } from 'react'
import type {
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
  IDashboardWidgetPropsBase,
  IDashboardGridPropsBase,
  TWidgetFactoryBase,
  IDynamicWidgetCatalogEntryBase,
  TDashboardWidgetCatalogBase,
} from './core.base'

// framework specific component type and element type
type TFrameworkComponentType = React.ComponentType<any>
type TFrameworkElementType = React.ElementType

export type TWidgetMetaInfo = TWidgetMetaInfoBase<TFrameworkElementType | undefined>

export interface IDashboardGridProps extends IDashboardGridPropsBase {
  children?: ReactNode
}

export interface IDashboardWidgetProps extends IDashboardWidgetPropsBase {
  children?: ReactNode
  onRemoveClick?: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => void
  onMoveClick?: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => void
  selectContainer?: (containerKey?: TDashboardWidgetKey) => void
}

export interface IDashboardWidget extends JSX.Element {}

/* begin: support plugin architecture */

export type TWidgetFactory = TWidgetFactoryBase<TFrameworkComponentType>

// a single entry in the widget catalog
export interface IDynamicWidgetCatalogEntry extends IDynamicWidgetCatalogEntryBase<
  TFrameworkElementType,
  TFrameworkComponentType
> {}

// Abstract Catalog Type:
// It is a Map where the keys are TDashboardWidgetKey
// and the values are TDashboardWidgetFn functions that accept props with key TDashboardWidgetKey.
export type TDashboardWidgetCatalog = TDashboardWidgetCatalogBase<
  TFrameworkElementType,
  TFrameworkComponentType
>

/* end: support plugin architecture */
