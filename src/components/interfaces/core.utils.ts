// file: src/components/interfaces/core.utils.ts
import type { TDashboardWidgetKey, TWidgetCategory } from './core.base'
import type { IDashboardConfig, TWidgetMetaInfo, TDashboardWidgetCatalog } from './core.interfaces'
import { cssSettingsCatalog } from '../dashboard-settings'

// blank dashboard configuratino
export const blankDashboardConfig: IDashboardConfig = {
  userID: 0,
  clientAppKey: '',
  dashboardId: 'default',
  dashboardName: 'Default',
  zoomScale: 1,
  responsiveGrid: false,
  widgets: [],
  childWidgetsConfig: [],
  cssSettings: [...cssSettingsCatalog],
}

// zoom scale must be range bound between min and max:
export const DashboardMinZoomScale = 0.7 as const
export const DashboardMaxZoomScale = 1.0 as const
export const DashboardZoomStep = 0.05 as const

export const ensureZoomScaleIsWithinRange = (value: number): number => {
  let result = Number(value || 0)
  if (result < DashboardMinZoomScale) {
    result = DashboardMinZoomScale
  }
  if (result > DashboardMaxZoomScale) {
    result = DashboardMaxZoomScale
  }
  return result
}

export const getNewZoomScaleWithinRange = (currentZoomScale: number, direction: -1 | 1): number => {
  let factor = Number(Number((DashboardZoomStep * direction).toFixed(2)).toFixed(2))
  let result = Number((Number(currentZoomScale) + factor).toFixed(2))
  return ensureZoomScaleIsWithinRange(result)
}

const _getDefaultWidgetMetaFromKey = (
  widgetKey: TDashboardWidgetKey,
  options?: {
    title?: string
    description?: string
  },
) => {
  const isContainer = `${widgetKey}`.includes('Container')
  const categories: TWidgetCategory[] = isContainer ? ['Container'] : ['Widget']
  const title = options?.title || widgetKey
  const description = options?.description || (isContainer ? 'Container' : 'Unknown')
  return {
    title,
    displayName: widgetKey,
    description,
    categories,
    noDuplicatedWidgets: true,
    icon: undefined,
  }
}

/**
 * @name getDefaultWidgetMetaFromMap
 * @description Helper to get widget meta info from the catalog by key.
 */
export const getDefaultWidgetMetaFromMap = (
  widgetKey: TDashboardWidgetKey,
  defaultWidgetMetaMap: Record<TDashboardWidgetKey, TWidgetMetaInfo>,
  options?: {
    title?: string
    description?: string
  },
): TWidgetMetaInfo => {
  const metaData = defaultWidgetMetaMap[widgetKey]
  if (metaData) {
    return metaData
  }
  return _getDefaultWidgetMetaFromKey(widgetKey, options)
}

/**
 * @name getWidgetMetaFromCatalog
 * @description Helper to get widget meta info from the catalog by key.
 */
export const getWidgetMetaFromCatalog = (
  widgetKey: TDashboardWidgetKey,
  widgetsCatalog: TDashboardWidgetCatalog,
): TWidgetMetaInfo => {
  const entry = widgetsCatalog.get(widgetKey)
  const metaData = entry?.meta
  if (metaData) {
    return metaData
  }
  return _getDefaultWidgetMetaFromKey(widgetKey)
}

export const removeEmptyContainers = (dashboardConfig: IDashboardConfig): IDashboardConfig => {
  let updatedDashboardConfig = {
    ...dashboardConfig,
  }
  updatedDashboardConfig.widgets = updatedDashboardConfig.widgets.filter((widgetKey) => {
    if (`${widgetKey}`.includes('WidgetContainer')) {
      const childWidgets = updatedDashboardConfig.childWidgetsConfig.filter(
        (x) => x.parentWidgetKey === widgetKey,
      )
      if (!childWidgets || childWidgets.length === 0) {
        // remove empty container
        updatedDashboardConfig.widgets = updatedDashboardConfig.widgets.filter(
          (x) => x !== widgetKey,
        )
        return false
      }
    }
    return true
  })
  return updatedDashboardConfig
}

/**
 * @name ensureContainersSequence
 * @description
 * Ensures that the container widgets are numbered sequentially in the dashboardConfig, but the original order is preserved.
 */
export const ensureContainersSequence = (dashboardConfig: IDashboardConfig): IDashboardConfig => {
  // 1. Filter Keys and Create the Key Remap (No Sorting!)
  // This array contains the container keys in their original order.
  const allContainerKeysInOrder = dashboardConfig.widgets.filter((key) =>
    key.includes('WidgetContainer'),
  )

  // Iterate through the order-preserved keys to build the map sequentially
  const keyRemap: Record<string, string> = {}
  allContainerKeysInOrder.forEach((oldKey, index) => {
    const parts = oldKey.split('_container')
    const componentName = parts[0]

    // index + 1 ensures the numbering starts at 1
    const newKey = `${componentName}_container${index + 1}`

    // Store the mapping: e.g., 'container4' -> 'container1', 'container1' -> 'container2'
    keyRemap[oldKey] = newKey
  })

  // 2. Update dashboardConfig.widgets using the map
  // We use .map() on the original array to preserve the non-container elements
  // (like 'Other') and the overall order.
  dashboardConfig.widgets = dashboardConfig.widgets.map((key) => {
    // Look up the key in the map; if it exists, use the new key, otherwise, keep the original key
    return keyRemap[key] || key
  })

  // 3. Update dashboardConfig.childWidgetsConfig using the map
  // This ensures all child elements still point to the correct (newly named) parent.
  dashboardConfig.childWidgetsConfig = dashboardConfig.childWidgetsConfig.map((entry) => {
    const oldParentKey = entry.parentWidgetKey
    const newParentKey = keyRemap[oldParentKey]

    return {
      ...entry,
      // If a new key exists, use it. If not, keep the original key.
      parentWidgetKey: newParentKey || oldParentKey,
    }
  })

  return dashboardConfig
}
