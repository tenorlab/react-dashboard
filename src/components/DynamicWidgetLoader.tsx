// file: src/components/DynamicWidgetLoader.tsx
import React, { Suspense, useMemo } from 'react'
import { parseContainerTitle } from '@tenorlab/dashboard-core'
import type {
  IChildWidgetConfigEntry,
  IWidgetSavedProps,
  TDashboardWidgetKey,
} from '@tenorlab/dashboard-core'
import type { TDashboardWidgetCatalog, TWidgetErrorExtraProps } from './interfaces'
import { WidgetErrorWrapper } from './WidgetErrorWrapper'

type TDynamicWidgetLoaderProps<TExtraProps = any> = {
  index: number
  maxIndex: number
  widgetKey: TDashboardWidgetKey
  parentWidgetKey?: TDashboardWidgetKey
  targetContainerKey?: TDashboardWidgetKey
  childWidgetsConfig?: IChildWidgetConfigEntry[]
  savedProps?: IWidgetSavedProps[]
  widgetCatalog: TDashboardWidgetCatalog
  isEditing: boolean
  // for additional props passed to all widget from the dashboard through the DynamicWidgetLoader:
  extraProps?: TExtraProps
  onRemoveClick?: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => void
  onMoveClick?: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => void
  selectContainer?: (containerKey: TDashboardWidgetKey) => void
  savedPropsChanged: (value: IWidgetSavedProps) => any
}

/**
 * Compares two version strings (e.g., "19.2.0" and "19.2.3")
 * Returns true if the widget version is compatible with the host.
 * Logic: Host must be >= Widget version for major/minor.
 */
export const _isVersionCompatible = (hostVer: string, widgetVer: string): boolean => {
  const clean = (v: string) => v.replace(/[^0-9.]/g, '')
  const h = clean(hostVer).split('.').map(Number)
  const w = clean(widgetVer).split('.').map(Number)

  // Basic check: If Major is different, incompatible.
  if (h[0] !== w[0]) return false

  // If Host Minor is less than Widget Minor, might be missing features
  if (h[1] < w[1]) return false

  return true
}

function SpinnerComponent(props: { title: string }) {
  return (
    <div className="dashboard-widget">
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center">
        <div className="w-full absolute opacity-100 text-primary">{props.title}</div>
        <div className="animate-ping rounded-full h-32 w-32 border-8 border-white"></div>
      </div>
    </div>
  )
}

/**
 * Component to safely load and render dynamic widgets.
 * This ensures the widget component (and its hooks) is called consistently.
 * @param {object} props
 * @param {string} props.widgetKey
 * @param {(key: string) => Promise<void>} props.onRemoveClick
 */
export function DynamicWidgetLoader({
  index,
  maxIndex,
  widgetKey,
  parentWidgetKey,
  targetContainerKey,
  childWidgetsConfig,
  savedProps,
  widgetCatalog,
  isEditing,
  // for additional props passed to all widget from the dashboard through the DynamicWidgetLoader:
  extraProps,
  onRemoveClick,
  onMoveClick,
  selectContainer,
  savedPropsChanged,
}: TDynamicWidgetLoaderProps) {
  // 1. --- Key Parsing and Catalog Lookup ---
  const parts = `${widgetKey}`.split('_')
  const isContainerInstance = parts.length > 1 // Is this a saved instance of a container?
  // Use the core key (e.g., 'WidgetContainerRow' or 'WidgetTotalOrders') for lookup.
  const parsedKey: TDashboardWidgetKey = isContainerInstance ? parts[0] : (widgetKey as any)

  const widgetCatalogEntry = widgetCatalog.get(parsedKey)

  if (!widgetCatalogEntry) {
    return (
      <div className="flex">
        <p>Widget not found in catalog: {parsedKey}</p>
      </div>
    )
  }

  // Determine the component to render (could be static or lazy)
  let WidgetToRender:
    | React.ComponentType<any>
    | React.LazyExoticComponent<React.ComponentType<any>>
    | null = null
  let requiresSuspense = false

  // 3. --- Prepare Props (Simplified for clarity) ---
  const isContainerType = !!widgetCatalogEntry.isContainer
  const parsedContainerTitle = isContainerInstance ? parseContainerTitle(widgetKey) : ''

  // Filter children for containers
  const childWidgetEntries = isContainerType
    ? (childWidgetsConfig || []).filter((a) => a.parentWidgetKey === widgetKey)
    : []

  const baseProps = {
    index,
    maxIndex,
    widgetKey,
    parentWidgetKey,
    isEditing,
    extraProps,
    title: isContainerInstance ? parsedContainerTitle : widgetCatalogEntry.title,
    onRemoveClick,
    onMoveClick,
    savedPropsChanged,
  }

  const getWidgetSavedProps = (
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey: TDashboardWidgetKey | undefined,
  ): IWidgetSavedProps | undefined => {
    // console.log('getWidgetSavedProps', widgetKey, parentWidgetKey, savedProps)
    if ((parentWidgetKey || '').trim().length > 0) {
      return (savedProps || []).find(
        (x) => x.parentWidgetKey === parentWidgetKey && x.widgetKey === widgetKey,
      )
    }
    return (savedProps || []).find(
      (x) => (x.parentWidgetKey || '').trim().length === 0 && x.widgetKey === widgetKey,
    )
  }

  // 2. --- Component Source Determination ---
  if (widgetCatalogEntry.component) {
    // A. Found a STATIC component (e.g., Container)
    WidgetToRender = widgetCatalogEntry.component
    requiresSuspense = false
  } else if (widgetCatalogEntry.loader) {
    // // B. Found a DYNAMIC loader (e.g., TotalOrders Plugin)
    // // Memoize the lazy component creation to prevent unnecessary re-runs.
    requiresSuspense = true
    WidgetToRender = useMemo(() => {
      if (!widgetCatalogEntry) return null

      // --- VERSION CHECK LOGIC ---
      // 1. Get host version from the injected define
      // prettier-ignore
      /* @ts-ignore */
      const hostVer = typeof __HOST_REACT_VERSION__ !== 'undefined' ? __HOST_REACT_VERSION__ : '19.2.3'
      // 2. Parse the externalDependencies
      const externalDependencies = widgetCatalogEntry.meta?.externalDependencies || []
      const reactReq = externalDependencies.find((d) => d.startsWith('react@'))
      if (reactReq) {
        const requiredVer = reactReq.split('@')[1]

        if (!_isVersionCompatible(hostVer, requiredVer)) {
          // 3. prepare extrProps with error information for the WidgetErrorWrapper component
          const errorInfo: TWidgetErrorExtraProps = {
            ...baseProps.extraProps,
            hostVer,
            requiredVer,
            externalDependencies,
            errorMessage: `Incompatible React version. Required: ${requiredVer}, Host: ${hostVer}`,
            versionMismatch: true,
          }
          baseProps.extraProps = {
            ...baseProps.extraProps,
            ...errorInfo,
          }

          return React.lazy(async () => ({
            default: () => <WidgetErrorWrapper {...baseProps} />,
          }))
        }

        // if (!_isVersionCompatible(hostVer, requiredVer)) {
        //   return React.lazy(async () => ({
        //     default: () => (
        //       <DashboardWidgetBase {...baseProps}>
        //         <div className="p-4 border border-dashed border-danger">
        //           <p className="font-bold">Failed to load "{widgetKey}"</p>
        //           <p className="text-xs italic">
        //             The remote plugin is unavailable or incompatible.
        //             <p className="font-bold text-sm">Version Mismatch: {widgetKey}</p>
        //             <p className="text-xs">
        //               Widget requires <strong>React {requiredVer}</strong>. Host is running{' '}
        //               <strong>{hostVer}</strong>.
        //             </p>
        //           </p>
        //           <div className="flex flex-col mt-3">
        //             <h5>Externals:</h5>
        //             <dl className="ml-2 flex flex-col text-xs">
        //               {externalDependencies.map((dep, i) => (
        //                 <dd key={i}>- {dep}</dd>
        //               ))}
        //             </dl>
        //           </div>
        //         </div>
        //       </DashboardWidgetBase>
        //     ),
        //   }))
        // }
      }
      // --- END VERSION CHECK ---

      if (widgetCatalogEntry.component) {
        return widgetCatalogEntry.component
      }

      if (widgetCatalogEntry.loader) {
        // Create a "Safe" loader that catches the import error
        const safeLoader = async () => {
          try {
            return await widgetCatalogEntry.loader!()
          } catch (err: any) {
            console.error(`Widget Load Error [${widgetKey}]:`, err)
            // Return a dummy component that displays the error
            // return {
            //   default: () => (
            //     <DashboardWidgetBase {...baseProps}>
            //       <div className="p-4 border border-dashed border-danger">
            //         <p className="font-bold">Failed to load "{widgetKey}"</p>
            //         <p className="text-xs italic">
            //           The remote plugin is unavailable or incompatible.
            //         </p>
            //         <pre className="text-xs overflow-hidden">
            //           {JSON.stringify(widgetCatalogEntry.meta || {}, null, 2)}
            //         </pre>
            //       </div>
            //     </DashboardWidgetBase>
            //   ),
            // }

            const errorInfo: TWidgetErrorExtraProps = {
              ...baseProps.extraProps,
              hostVer,
              requiredVer: reactReq ? reactReq.split('@')[1] : 'Unknown',
              externalDependencies,
              errorMessage: err.message,
              versionMismatch: false,
            }

            baseProps.extraProps = {
              ...baseProps.extraProps,
              ...errorInfo,
            }

            return {
              default: () => <WidgetErrorWrapper {...baseProps} />,
            }
          }
        }
        return React.lazy(safeLoader)
      }

      return null
    }, [widgetCatalogEntry, widgetKey])
  }

  if (!WidgetToRender) {
    return (
      <div className="flex">
        <p>Widget definition incomplete: {parsedKey}</p>
      </div>
    )
  }

  // Props specific to containers
  const containerProps = isContainerType
    ? {
        highlight: targetContainerKey === widgetKey,
        selectContainer: selectContainer,
        // The children prop is the recursive call back to DynamicWidgetLoader
        children: childWidgetEntries.map((entry, idx) => (
          <DynamicWidgetLoader
            key={`${entry.widgetKey}_${idx}`}
            index={idx}
            maxIndex={childWidgetEntries.length - 1}
            widgetKey={entry.widgetKey}
            parentWidgetKey={entry.parentWidgetKey}
            widgetCatalog={widgetCatalog}
            isEditing={isEditing}
            extraProps={extraProps}
            onRemoveClick={onRemoveClick}
            onMoveClick={onMoveClick}
            savedPropsChanged={savedPropsChanged}
            // Note: targetContainerKey and selectContainer are not passed down to children
          />
        )),
      }
    : {
        widgetSavedProps: getWidgetSavedProps(widgetKey, parentWidgetKey),
      }

  // 4. --- Conditional Render ---
  if (requiresSuspense) {
    return (
      <Suspense fallback={<SpinnerComponent title={`Loading ${widgetCatalogEntry.title}`} />}>
        <WidgetToRender {...baseProps} {...containerProps} />
      </Suspense>
    )
  } else {
    return <WidgetToRender {...baseProps} {...containerProps} />
  }
}
