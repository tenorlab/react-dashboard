# @tenorlab/react-dashboard

Foundation components for creating user-configurable, high-performance dashboards in React. Built on top of **@tenorlab/dashboard-core**.

## 🏗 Relationship to Core

This package extends **@tenorlab/dashboard-core**. It provides the React implementation of the core logic, including specialized hooks, state management via **Zustand**, and a suite of UI components.

> **Note**: This package re-exports all types and utilities from `@tenorlab/dashboard-core`. You do not need to install the core package separately.


## Demos
-- [React Demo](https://react.tenorlab.com) (built with @tenorlab/react-dashboard)
-- [Vue Demo](https://vue.tenorlab.com) (built with @tenorlab/vue-dashboard)


## ✨ Features

- **Type-Safe:** Deep integration with TypeScript 5.8+ for full IDE support.
- **State Management:** Built-in `useDashboardStore` (Zustand) and `useDashboardUndoService`.
- **User Configurable:** Ready-to-use components for adding, removing, and dragging widgets.
- **Themeable:** Native support for CSS Variables and Tailwind CSS.
- **Vite Optimized:** Full ESM support and tree-shakeable.

## 🚀 Quick Start

### Installation

Bash

```
# with npm
npm i @tenorlab/react-dashboard

# with pnpm
pnpm add @tenorlab/react-dashboard
```

### 1. Global Styles

Import the base styles in your entry file (e.g., `main.tsx`):

TypeScript

```
import '@tenorlab/react-dashboard/styles.css'
```

------

## 🛠 Developer Guide

### 1. Creating a Widget

Widgets should be organized by their loading strategy.

- **Bundled Widgets**: Place in `src/bundled-widgets/` (loaded immediately).
- **Async Widgets**: Place in `src/async-widgets/` (lazy-loaded).

Each widget requires a sub-directory using the `widget-name-here` convention.

#### Example: `WidgetTotalOrders`

TypeScript

```
// file: src/bundled-widgets/widget-total-orders/WidgetTotalOrders.tsx
import {
  IDashboardWidget,
  IDashboardWidgetProps,
  TDashboardWidgetKey,
  DashboardWidgetBase, 
  WrapperColumnContent
} from '@tenorlab/react-dashboard'

export function WidgetTotalOrders(props: IDashboardWidgetProps): IDashboardWidget {
  return (
    <DashboardWidgetBase
      widgetKey="WidgetTotalOrders"
      title="Total Orders"
      {...props}
    >
      <WrapperColumnContent>
        <div className="dashboard-number number-xl text-primary">1,250</div>
        <div className="text-sm">Orders this month</div>
      </WrapperColumnContent>
    </DashboardWidgetBase>
  )
}
```

TypeScript

```
// file: src/bundled-widgets/widget-total-orders/meta.ts
import type { TWidgetMetaInfo } from '@tenorlab/react-dashboard'
import { MonitorIcon as ComponentIcon } from '@tenorlab/react-dashboard'

export const WidgetTotalOrdersMeta: TWidgetMetaInfo = {
  name: 'Total Orders',
  categories: ['Widget'],
  icon: ComponentIcon,
  noDuplicatedWidgets: true,
  description: 'Displays information about your total orders.',
  externalDependencies: []
}
```

TypeScript

```
// file: src/bundled-widgets/widget-total-orders/index.ts
import { WidgetTotalOrders } from './WidgetTotalOrders'
export default WidgetTotalOrders
```

### 2. Creating the Widgets Catalog

Create `src/widgets-catalog.tsx` in your project root. This file manages how widgets are discovered (locally via Vite's `import.meta.glob` or remotely via CDN).

TypeScript

```
// file: src/widgets-catalog.tsx
import {
  IDynamicWidgetCatalogEntry,
  TDashboardWidgetCatalog,
  TWidgetMetaInfoBase,
  WidgetContainerColumn,
  WidgetContainerLarge,
  WidgetContainerRow,
  TWidgetFactory,
} from '@tenorlab/react-dashboard'
import {
  createStaticEntry,
  localWidgetDiscovery,
  remoteWidgetDiscovery,
} from '@tenorlab/react-dashboard/core'

import { WidgetRecentPaymentInfo } from './other-widgets/WidgetRecentPaymentInfo'
//import { getWidgetsManifestUrl } from '@/utils'

const bundledWidgetsSrcPath = '/src/bundled-widgets'
const asyncWidgetsSrcPath = '/src/async-widgets'

type TGlobModuleMap = Record<string, TWidgetFactory>

const bundledWidgetModules = import.meta.glob('/src/bundled-widgets/*/index.ts', {
  eager: true
}) as TGlobModuleMap

const asyncWidgetModules = import.meta.glob('/src/async-widgets/*/index.ts') as TGlobModuleMap

const allMetaModules = import.meta.glob('/src/**/widget-*/meta.ts', {
  eager: true,
}) as Record<string, Record<string, TWidgetMetaInfoBase>>

const hasPermission = (_user_: any, _permission: string) => true

export const getWidgetCatalog = async (user: any | null): Promise<TDashboardWidgetCatalog> => {
  const catalogMapEntries: [string, IDynamicWidgetCatalogEntry][] = [
    createStaticEntry('WidgetContainer', WidgetContainerColumn),
    createStaticEntry('WidgetContainerRow', WidgetContainerRow),
    createStaticEntry('WidgetContainerLarge', WidgetContainerLarge),
  ]

  if (hasPermission(user, 'some-permission')) {
    catalogMapEntries.push(createStaticEntry('WidgetRecentPaymentInfo', WidgetRecentPaymentInfo))
  }

  // add bundled widgets (non-lazy)
  catalogMapEntries.push(...localWidgetDiscovery(
    bundledWidgetsSrcPath,
    bundledWidgetModules,
    allMetaModules,
    false, // lazy: false
  ))

  // add async-widgets (lazy)
  catalogMapEntries.push(...localWidgetDiscovery(
    asyncWidgetsSrcPath,
    asyncWidgetModules,
    allMetaModules,
    true, // lazy: true
  ))

  // Optional: Remote discovery of -pre-built widgets hosted on a CDN
  /*const manifestUrl = getWidgetsManifestUrl()
  if (manifestUrl.length > 0) {
    const remoteResponse = await remoteWidgetDiscovery(manifestUrl)
    if (!remoteResponse.message) {
      catalogMapEntries.push(...(remoteResponse.entries || []))
    }
  }*/

  return new Map(catalogMapEntries)
}
```

### 3. Defining Dashboard Defaults

Use a `dashboard-defaults.ts` file to define initial layouts based on user roles.

TypeScript

```
// file: src/dashboard-defaults.ts
import {
  TDashboardWidgetKey,
  IChildWidgetConfigEntry,
  IDashboardConfig,
  TDashboardWidgetCatalog,
} from '@tenorlab/react-dashboard'
import { blankDashboardConfig, cssSettingsCatalog } from '@tenorlab/react-dashboard/core'
import { getWidgetCatalog } from './widgets-catalog'

const DEFAULT_DASHBOARD_ID = 'default' as const
const DEFAULT_DASHBOARD_NAME = 'Default' as const

const getDefaultDashboardForCustomerUser = (
  user: any,
  clientAppKey: string,
  availableWidgetKeys: TDashboardWidgetKey[]
): IDashboardConfig => {
  const userID = user.userID || 0
  return {
    userID,
    clientAppKey,
    dashboardId: DEFAULT_DASHBOARD_ID,
    dashboardName: DEFAULT_DASHBOARD_NAME,
    zoomScale: 1,
    responsiveGrid: false,
    widgets: ['WidgetContainer_container1'],
    childWidgetsConfig: [
      { parentWidgetKey: 'WidgetContainer_container1', widgetKey: 'WidgetRecentPaymentInfo' }
    ],
    cssSettings: [...cssSettingsCatalog]
  }
}

export const getDashboardDefaults = async (
  user: any | null,
  clientAppKey: string
): Promise<{
  dashboardConfig: IDashboardConfig
  widgetsCatalog: TDashboardWidgetCatalog
}> => {
  const widgetsCatalog = await getWidgetCatalog(user)

  if (!user) return { dashboardConfig: blankDashboardConfig, widgetsCatalog }

  return {
    dashboardConfig: getDefaultDashboardForCustomerUser(user, clientAppKey, [...widgetsCatalog.keys()]),
    widgetsCatalog
  }
}
```

### 4. Implementation Example: Read-Only Dashboard

Use this for a simplified, non-editable view of the dashboard.

TypeScript

```
// file: src/views/DashboardReadonly.tsx
import { useEffect, useState } from 'react'
import {
  IDashboardConfig,
  TDashboardWidgetCatalog,
  useDashboardStore,
  DynamicWidgetLoader, 
  DashboardGrid
} from '@tenorlab/react-dashboard'
import {
  blankDashboardConfig,
  cssVarsUtils,
  useDashboardStorageService,
} from '@tenorlab/react-dashboard/core'
import { getDashboardDefaults } from '../dashboard-defaults'

export function DashboardReadonly() {
  const clientAppKey = 'myclientapp'
  const user = { id: 1234 }
  const dashboardStore = useDashboardStore()
  const dashboardStorageService = useDashboardStorageService()
  const { isLoading, currentDashboardConfig } = dashboardStore

  const [widgetsCatalog, setWidgetsCatalog] = useState<TDashboardWidgetCatalog>(new Map())

  useEffect(() => {
    async function initDashboard() {
      dashboardStore.setIsLoading(true)
      try {
        const defaults = await getDashboardDefaults(user, clientAppKey)
        const savedConfigs = await dashboardStorageService.getSavedDashboards(
          user.id,
          clientAppKey,
          defaults.widgetsCatalog,
          defaults.dashboardConfig
        )

        dashboardStore.setAllDashboardConfigs(savedConfigs)
        const activeConfig = savedConfigs[0] || defaults.dashboardConfig
        dashboardStore.setCurrentDashboardConfig(activeConfig)
        setWidgetsCatalog(defaults.widgetsCatalog)
        cssVarsUtils.restoreCssVarsFromSettings(activeConfig.cssSettings || [])
      } finally {
        dashboardStore.setIsLoading(false)
      }
    }
    initDashboard()
  }, [])

  return (
    <div className="relative flex flex-col h-full">
      {isLoading ? <div>Loading</div> : (
        <DashboardGrid
          isEditing={false}
          zoomScale={Number(currentDashboardConfig.zoomScale)}
          responsiveGrid={currentDashboardConfig.responsiveGrid}
        >
          {currentDashboardConfig.widgets.map((widgetKey, index) => (
            <DynamicWidgetLoader
              key={`${widgetKey}_${index}`}
              widgetKey={widgetKey}
              index={index}
              maxIndex={currentDashboardConfig.widgets.length - 1}
              childWidgetsConfig={currentDashboardConfig.childWidgetsConfig}
              widgetCatalog={widgetsCatalog as any}
              isEditing={false}
            />
          ))}
        </DashboardGrid>
      )}
    </div>
  )
}
```



#### 5. Full Editable Dashboard

For a complete example including **Undo/Redo**, **Zooming**, **Catalog Flyouts**, and **Multiple Dashboards**, please refer to the [Full Implementation Example](https://github.com/tenorlab/react-dashboard-sample/blob/main/views/DashboardFullExample.tsx).



------

## 🧩 Components & Services

### UI Components

- **`DashboardGrid`**: The main layout engine for positioning widgets.
- **`WidgetContainer`**: Wrapper providing common widget UI (headers, actions, loading states).
- **`WidgetsCatalogFlyout`**: A slide-out panel for users to browse and add new widgets.
- **`DynamicWidgetLoader`**: Lazy-loading utility for high-performance dashboards.

### Hooks & State

- **`useDashboardStore`**: Access the underlying Zustand store to manage widget state, layout, and configuration.
- **`useDashboardUndoService`**: Provides `undo` and `redo` functionality for user layout changes.


------


## Links
 - [@tenorlab/react-dashboard](https://www.npmjs.com/package/@tenorlab/react-dashboard): React-specific components
 - [@tenorlab/vue-dashboard](https://www.npmjs.com/package/@tenorlab/vue-dashboard): Vue-specific components
 - [Official Website](https://www.tenorlab.com)
 - [React Demo](https://react.tenorlab.com) (built with @tenorlab/react-dashboard)
 - [Vue Demo](https://vue.tenorlab.com) (built with @tenorlab/vue-dashboard)
 - [Buy a License](https://payhip.com/b/gPBpo)
 - [Follow on BlueSky](https://bsky.app/profile/tenorlab.bsky.social)


------


## ⚖️ Licensing

This project is dual-licensed:

1. **Non-Commercial / Personal Use:** Licensed under the [Polyform Non-Commercial 1.0.0](https://polyformproject.org/licenses/non-commercial/1.0.0/). Free for students, hobbyists, and open-source projects.
2. **Commercial Use:** Requires a **Tenorlab Commercial License**.

If you are using this library to build a revenue-generating product or within a commercial entity, please visit [https://payhip.com/b/gPBpo](https://payhip.com/b/gPBpo) to purchase a license.

