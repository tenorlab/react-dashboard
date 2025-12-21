// file: src/components/interfaces/core.utils.ts
import { cssSettingsCatalog } from '../dashboard-settings'
import type {
  TDashboardWidgetKey,
  TWidgetCategory,
  TWidgetMetaInfoBase,
  TDashboardWidgetCatalogBase,
  TGetDefaultWidgetMetaFromKey,
  TWidgetFactoryBase,
  IDynamicWidgetCatalogEntryBase,
  TManifestEntry,
} from './core.base'
import type { IDashboardConfig } from './core.interfaces'

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

/* catalog utils */

export const getDefaultWidgetMetaFromKey: TGetDefaultWidgetMetaFromKey = (
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
export const getDefaultWidgetMetaFromMap = <TFrameworkElementType = any>(
  widgetKey: TDashboardWidgetKey,
  defaultWidgetMetaMap: Record<TDashboardWidgetKey, TWidgetMetaInfoBase<TFrameworkElementType>>,
  options?: {
    title?: string
    description?: string
  },
): TWidgetMetaInfoBase<TFrameworkElementType> => {
  const metaData = defaultWidgetMetaMap[widgetKey]
  if (metaData) {
    return metaData
  }
  return getDefaultWidgetMetaFromKey(widgetKey, options)
}

/**
 * @name getWidgetMetaFromCatalog
 * @description Helper to get widget meta info from the catalog by key.
 */
export const getWidgetMetaFromCatalog = <
  TFrameworkElementType = any,
  TFrameworkComponentType = any,
>(
  widgetKey: TDashboardWidgetKey,
  widgetsCatalog: TDashboardWidgetCatalogBase<TFrameworkElementType, TFrameworkComponentType>,
): TWidgetMetaInfoBase<TFrameworkElementType> => {
  const entry = widgetsCatalog.get(widgetKey)
  const metaData = entry?.meta
  if (metaData) {
    return metaData
  }
  return getDefaultWidgetMetaFromKey(widgetKey)
}

/**
 * @name createStaticEntry
 * Helper function to create static entries
 * This helps keep the catalog registration clean
 */
export const createStaticEntry = <TFrameworkComponentType = any>(
  key: string,
  component: TFrameworkComponentType,
  metaData?: TWidgetMetaInfoBase,
): [string, IDynamicWidgetCatalogEntryBase] => {
  const meta = metaData || getDefaultWidgetMetaFromKey(key)
  return [
    key,
    {
      key,
      title: meta.displayName,
      isContainer: `${key}`.includes('Container'),
      meta,
      component,
    },
  ]
}
/**
 * @name createDynamicEntry
 * Helper function to create dynamic entries
 * This helps keep the catalog registration clean
 */
export const createDynamicEntry = (
  key: string,
  loader: TWidgetFactoryBase,
  metaData: TWidgetMetaInfoBase,
): [string, IDynamicWidgetCatalogEntryBase] => {
  const meta = metaData || getDefaultWidgetMetaFromKey(key)
  return [
    key,
    {
      key,
      title: meta.displayName,
      isContainer: false,
      meta,
      loader,
    },
  ]
}

// Helper function to derive key and title from the widget file path
export const parseKeyAndTitleFromFilePath = (
  path: string,
): { key: TDashboardWidgetKey; title: string; folder: string } | null => {
  const match = path.match(/\/widget-([a-zA-Z0-9-]+)\/index\.ts$/)
  if (match && match[1]) {
    const folderName = match[1]
    const key = `Widget${folderName
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join('')}` as TDashboardWidgetKey
    const title = folderName
      .split('-')
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(' ')
    return { key, title, folder: folderName }
  }
  return null
}

export const getMetaInfoFromFile = (
  metaModules: Record<string, Record<string, TWidgetMetaInfoBase>>,
  baseSrcPath: string, // i.e. '/src/plugins' or '/src/static-widgets'
  folderName: string, // i.e. widget-outstanding-balance
): TWidgetMetaInfoBase | undefined => {
  // The path to the meta file should be: /src/widgets/widget-folder/widget-folder.meta.ts
  const metaLookupPath = `${baseSrcPath}/${folderName}/${folderName}.meta.ts`
  // The eagerly loaded module is stored in metaModules[path]
  const metaModule = metaModules[metaLookupPath]
  // 3. Determine the final metadata: Use the specific named export from the meta file,
  // or fall back to the dynamic default/static lookup.
  // let finalMeta: TWidgetMetaInfo
  // @ts-ignore
  if (metaModule && metaModule[`${key}Meta`]) {
    // Found the synchronous meta data exported as WidgetForexRatesMeta, etc.
    // @ts-ignore
    return metaModule[`${key}Meta`]
  }

  return undefined
}

export const localWidgetDiscovery = async (
  baseSrcPath: string, // i.e. "/src/static-widgets
  widgetModules: Record<string, TWidgetFactoryBase>,
  widgetMetaModules: Record<string, Record<string, TWidgetMetaInfoBase>>,
) => {
  // Dynamic Widget discovery
  const catalogMapEntries: [string, IDynamicWidgetCatalogEntryBase][] = []
  for (const loaderPath in widgetModules) {
    const loader = widgetModules[loaderPath]
    const pathData = parseKeyAndTitleFromFilePath(loaderPath)

    if (pathData && loader) {
      const { key, title, folder } = pathData
      console.log('widgets-catalog: registering dynamic plugins', key, title, folder)

      let widgetMeta = getMetaInfoFromFile(
        //key,
        widgetMetaModules,
        baseSrcPath,
        folder,
      )
      if (!widgetMeta) {
        // default metadata (computed from key)
        widgetMeta = getDefaultWidgetMetaFromKey(key, {
          title,
          description: `Dynamic plugin widget`,
        })
      }

      // 4. Register the final entry
      catalogMapEntries.push(createDynamicEntry(key, loader, widgetMeta))
    }
  }

  return catalogMapEntries
}

export const remoteWidgetDiscovery = async (
  manifestUrl: string,
): Promise<{
  entries: [string, IDynamicWidgetCatalogEntryBase][]
  message: string
  details: string
}> => {
  return new Promise(async (resolve, reject) => {
    const catalogMapEntries: [string, IDynamicWidgetCatalogEntryBase][] = []
    try {
      // 1. Fetch the manifest from your Bucket/CDN
      const response = await fetch(`${manifestUrl}?${Math.random()}`)
      const remoteManifest: Record<string, TManifestEntry> = await response.json()

      for (const key in remoteManifest) {
        const remote = remoteManifest[key]

        // 2. Define the loader using native ESM import
        // Vite will ignore this URL and let the browser handle it at runtime
        const remoteLoader: TWidgetFactoryBase = () => import(/* @vite-ignore */ remote.url)

        // 3. Construct the meta object (ensure it matches TWidgetMetaInfo)
        const remoteMeta: TWidgetMetaInfoBase = {
          displayName: remote.meta.displayName,
          description: remote.meta.description || 'Remote Plugin',
          categories: remote.meta.categories || ['Widget'],
          noDuplicatedWidgets: remote.meta.noDuplicatedWidgets ?? true,
          icon: undefined, // Or a logic to map a string name to a Lucide component
        }

        // 4. USE YOUR HELPER!
        // This ensures the remote widget is structured exactly like a local one
        catalogMapEntries.push(createDynamicEntry(key, remoteLoader, remoteMeta))
      }
      resolve({
        entries: catalogMapEntries,
        message: '',
        details: '',
      })
    } catch (err) {
      console.error('Remote plugin discovery failed:', err)
      reject({
        entries: [],
        message: 'Remote plugin discovery failed:',
        details: (typeof err === 'object' ? JSON.stringify(err) : err) as any,
      })
    }
  })
}
