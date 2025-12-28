// @tenorlab/react-dashboard
// file: src/components/interfaces/core-react.interfaces.ts
import type {
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
  IDashboardWidgetPropsBase,
  IDashboardGridPropsBase,
  TWidgetFactoryBase,
  IDynamicWidgetCatalogEntryBase,
  TDashboardWidgetCatalogBase,
} from '@tenorlab/dashboard-core'
import type { ReactNode, JSX } from 'react'

// framework specific component type and element type
/**
 * @name TFrameworkComponentType
 * @description A type representing a React component type.
 */
type TFrameworkComponentType = React.ComponentType<any>

/**
 * @name TFrameworkElementType
 * @description A type representing a React element type.
 */
type TFrameworkElementType = React.ElementType

/**
 * @name TWidgetMetaInfo
 * @description Widget meta information type specific to React framework.
 * This type extends the base widget meta information type with React-specific element type.
 */
export type TWidgetMetaInfo = TWidgetMetaInfoBase<TFrameworkElementType | undefined>

/**
 * @name IDashboardGridProps
 * @description Dashboard grid properties interface specific to React framework.
 * This interface extends the base dashboard grid properties interface with optional children.
 */
export interface IDashboardGridProps extends IDashboardGridPropsBase {
  children?: ReactNode
}

/**
 * @name IDashboardWidgetProps
 * @description Dashboard widget properties interface specific to React framework.
 * This interface extends the base dashboard widget properties interface with additional React-specific properties.
 * @template TExtraProps - Additional properties specific to the widget.
 */
export interface IDashboardWidgetProps<
  TExtraProps = any,
> extends IDashboardWidgetPropsBase<TExtraProps> {
  children?: ReactNode
  onRemoveClick?: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => void
  onMoveClick?: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => void
  selectContainer?: (containerKey?: TDashboardWidgetKey) => void
}

/**
 * @name IDashboardWidget
 * @description A type representing a React dashboard widget element.
 * This type is defined as a JSX.Element.
 */
export interface IDashboardWidget extends JSX.Element {}

/* begin: support plugin architecture */

/**
 * @name TWidgetFactory
 * @description A type representing a widget factory function specific to React framework.
 * This type extends the base widget factory type with React-specific component type.
 * @template TFrameworkComponentType - The React component type.
 */
export type TWidgetFactory = TWidgetFactoryBase<TFrameworkComponentType>

/**
 * @name IDynamicWidgetCatalogEntry
 * @description Dynamic widget catalog entry interface specific to React framework.
 * This interface extends the base dynamic widget catalog entry interface with React-specific element and component types.
 * @template TFrameworkElementType - The React element type.
 * @template TFrameworkComponentType - The React component type.
 */
export interface IDynamicWidgetCatalogEntry extends IDynamicWidgetCatalogEntryBase<
  TFrameworkElementType,
  TFrameworkComponentType
> {}

/**
 * @name TDashboardWidgetCatalog
 * @description Dashboard widget catalog type specific to React framework.
 * This type extends the base dashboard widget catalog type with React-specific element and component types.
 * @template TFrameworkElementType - The React element type.
 * @template TFrameworkComponentType - The React component type.
 */
export type TDashboardWidgetCatalog = TDashboardWidgetCatalogBase<
  TFrameworkElementType,
  TFrameworkComponentType
>

/* end: support plugin architecture */
