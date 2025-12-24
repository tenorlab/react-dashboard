// file: src/components/interfaces/core.base.ts

// Since external widgets will use arbitrary strings, use a simple key type:
export type TDashboardWidgetKey = string

export type TWidgetCategory = 'Widget' | 'Chart' | 'Container'

export type TWidgetMetaInfoBase<TFrameworkElementType = any> = {
  displayName: string
  description: string
  categories: TWidgetCategory[]
  noDuplicatedWidgets?: boolean // if true, we do not allow to add the same widget twice
  icon: TFrameworkElementType | undefined
  externalDependencies: string[] // list of external dependencies (e.g., ['react@19.2.3', '@tenorlab/react-dashboard@1.1.3'])
}

export interface IDashboardGridPropsBase {
  isEditing: boolean
  zoomScale: number
  responsiveGrid: boolean
}

export type TWidgetSize = 'default' | 'large' | 'xlarge'
export type TWidgetDirection = 'row' | 'column'

export interface IDashboardWidgetPropsBase<TExtraProps = any> {
  index: number
  maxIndex: number
  widgetKey: TDashboardWidgetKey
  parentWidgetKey?: TDashboardWidgetKey
  isEditing: boolean
  highlight?: boolean
  testId?: string
  title?: string
  size?: TWidgetSize
  borderCssClasses?: string
  backgroundCssClasses?: string
  hideTitle?: boolean
  noShadow?: boolean
  noBorder?: boolean
  noPadding?: boolean
  direction?: TWidgetDirection // for containers only

  // for additional props passed to all widget from the dashboard through the DynamicWidgetLoader:
  extraProps?: TExtraProps
}

/* support plugin architecture: */
/**
 * 1. Define the Async Loader type
 * Type for the function that performs the asynchronous dynamic import.
 * It must return a promise that resolves to the module containing the widget component
 * as its default export (or a named export if you change the loading strategy).
 *
 * TFrameworkComponent could be "React.ComponentType<any>"" or "VueComponent" etc
 */
export type TWidgetFactoryBase<TFrameworkComponent = any> = () => Promise<{
  default: TFrameworkComponent
}>

/**
 * 2. Define the flexible Catalog Entry
 * Definition of a single widget or container in the catalog.
 * It must have EITHER a direct 'component' reference OR a 'loader' function.
 *
 * TFrameworkElementType: see TWidgetMetaInfoBase
 * TFrameworkComponentType: i.e. React.ComponentType<any> (see TWidgetFactoryBase)
 */
export interface IDynamicWidgetCatalogEntryBase<
  TFrameworkElementType = any,
  TFrameworkComponentType = any,
> {
  // A unique identifier used in the saved configuration JSON
  key: TDashboardWidgetKey
  title: string
  isContainer?: boolean
  meta?: TWidgetMetaInfoBase<TFrameworkElementType> // i.e. TWidgetMetaInfo

  // OPTIONAL Property A: The direct React component reference (for static, core widgets)
  component?: TFrameworkComponentType

  // OPTIONAL Property B: The function to asynchronously load the component (for dynamic plugins)
  loader?: TWidgetFactoryBase<TFrameworkComponentType> // i.e. TWidgetFactory
}

export type TDashboardWidgetCatalogBase<
  TFrameworkElementType = any,
  TFrameworkComponentType = any,
> = Map<
  TDashboardWidgetKey,
  IDynamicWidgetCatalogEntryBase<TFrameworkElementType, TFrameworkComponentType>
>

/* begin: core utils */
export type TGetDefaultWidgetMetaFromKeyOptions = {
  title?: string
  description?: string
}
export type TGetDefaultWidgetMetaFromKey = (
  widgetKey: TDashboardWidgetKey,
  options?: TGetDefaultWidgetMetaFromKeyOptions,
) => TWidgetMetaInfoBase<any>
/* end */

export type TManifestEntry = {
  url: string
  meta: TWidgetMetaInfoBase
}
