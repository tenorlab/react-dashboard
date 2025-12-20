// file: src/components/interfaces/core-react.interfaces.ts
import type {
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
  IDashboardWidgetPropsBase,
  IDashboardGridPropsBase,
  TWidgetFactoryBase,
  IDynamicWidgetCatalogEntryBase,
} from './core.base'
import type { ReactNode, ElementType, JSX } from 'react'

export type TWidgetMetaInfo = TWidgetMetaInfoBase<ElementType | undefined>

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

type TFrameworkComponentType = React.ComponentType<any>

export type TWidgetFactory = TWidgetFactoryBase<TFrameworkComponentType>
export interface IDynamicWidgetCatalogEntry extends IDynamicWidgetCatalogEntryBase<
  TWidgetMetaInfo,
  TWidgetFactory,
  TFrameworkComponentType
> {}

// Abstract Catalog Type:
// It is a Map where the keys are TDashboardWidgetKey
// and the values are TDashboardWidgetFn functions that accept props with key TDashboardWidgetKey.
// export type TDashboardWidgetFn = (props: IDashboardWidgetProps) => IDashboardWidget
// export type TDashboardWidgetCatalog = Map<TDashboardWidgetKey, TDashboardWidgetFn>
export type TDashboardWidgetCatalog = Map<TDashboardWidgetKey, IDynamicWidgetCatalogEntry>

/* end: support plugin architecture */
