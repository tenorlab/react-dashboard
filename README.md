# @tenorlab/react-dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
[![Template: Pro](https://img.shields.io/badge/Template-Pro--Available-gold.svg)](https://www.tenorlab.com)
[![Framework: React](https://img.shields.io/badge/Framework-React-blue.svg)](https://react.dev/)

Foundation components for creating user-configurable, high-performance dashboards in React.

## Relationship to Core

This package extends **@tenorlab/dashboard-core**. It provides the React implementation of the core logic, including specialized hooks, state management via **Zustand**, and a suite of UI components.

> **Note**: This package re-exports all types and utilities from `@tenorlab/dashboard-core`. You do not need to install the core package separately.


## Pro Template Demos
  - [React Demo](https://react.tenorlab.com) (built with @tenorlab/react-dashboard)
  - [Vue Demo](https://vue.tenorlab.com) (built with @tenorlab/vue-dashboard)
  - [Nuxt Demo](https://nuxt.tenorlab.com) (built with @tenorlab/vue-dashboard)


## ✨ Features

  - **Type-Safe:** Deep integration with TypeScript 5.8+ for full IDE support.
  - **State Management:** Built-in `useDashboardStore` and `useDashboardUndoService`.
  - **User Configurable:** Ready-to-use components for adding, removing, and dragging widgets.
  - **Themeable:** Native support for CSS Variables and Tailwind CSS.
  - **Vite Optimized:** Full ESM support and tree-shakeable.

## 🚀 Quick Start

### Installation

### Installation

```bash
npm i @tenorlab/react-dashboard

# with pnpm
pnpm add @tenorlab/react-dashboard
```

### 1. Global Styles

Import the base styles in your entry file (e.g., `main.tsx`):

```TypeScript
import '@tenorlab/react-dashboard/styles.css'
```

------

## 🛠 Developer Guide

### 1. Creating a Widget

Widgets should be organized by their loading strategy.

  - **Bundled Widgets**: Place in `src/bundled-widgets/` (loaded immediately).
  - **Async Widgets**: Place in `src/async-widgets/` (lazy-loaded).

*(NOTE: These directory names are suggestions; you can use different names, or put the widgets under src/components if you prefer)*


Each widget requires a sub-directory using the `widget-name-here` convention.

#### Example: `WidgetTotalOrders`

Directory name `widget-total-orders`, files:
  - WidgetTotalOrders.tsx
  - meta.ts
  - index.ts


File: src/bundled-widgets/widget-total-orders/WidgetTotalOrders.tsx:
```react
import { IDashboardWidgetProps } from '@tenorlab/react-dashboard'
import { DashboardWidgetBase } from '@tenorlab/react-dashboard'

export function WidgetTotalOrders(props: IDashboardWidgetProps) {
  return (
    <DashboardWidgetBase {...props}>
      <div className="w-full flex flex-col gap-2 items-end">
        <div className="dashboard-number number-xl text-primary">1,250</div>
        <div className="text-sm">Orders this month</div>
      </div>
    </DashboardWidgetBase>
  )
}
```

File: src/bundled-widgets/widget-total-orders/meta.ts:
```typescript
import type { TWidgetMetaInfo } from '@tenorlab/react-dashboard'
import { ReceiptIcon as ComponentIcon } from 'lucide-react'

// Define the metadata object for the plugin
export const WidgetTotalOrdersMeta: TWidgetMetaInfo = {
  name: 'Total Orders',
  categories: ['Widget'],
  icon: ComponentIcon,
  noDuplicatedWidgets: true,
  description: 'Displays information about your total orders.',
  externalDependencies: [],
}
```

File: src/bundled-widgets/widget-total-orders/index.ts:
```typescript
import { WidgetTotalOrders } from './WidgetTotalOrders'
export default WidgetTotalOrders
```

### 2. Creating the Widgets Catalog

Create `src/widgets-catalog.tsx` in your project root. This file manages how widgets are discovered (locally via Vite's `import.meta.glob` or remotely via CDN).

File: src/widgets-catalog.ts:
```typescript
import { WidgetContainerColumn, WidgetContainerLarge, WidgetContainerRow } from '@tenorlab/react-dashboard'
import {
  createStaticEntry,
  localWidgetDiscovery,
  remoteWidgetDiscovery,
} from '@tenorlab/react-dashboard/core'

// other static widgets
import {
  WidgetSmallCardSample,
} from './other-widgets/other-widgets'
import { otherWidgetsMetaMap } from './other-widgets/other-widgets-meta'
import type {
  IDynamicWidgetCatalogEntry,
  TDashboardWidgetCatalog,
  TWidgetMetaInfoBase,
  TWidgetFactory,
} from '@tenorlab/react-dashboard'

const bundledWidgetsSrcPath = '/src/bundled-widgets'
const asyncWidgetsSrcPath = '/src/async-widgets'

// Use Vite's Glob Import
// This creates an object where the keys are file paths, and the values are the TWidgetFactory functions.
// We target the 'index.ts' files within the widgets subdirectories.
type TGlobModuleMap = Record<string, TWidgetFactory>

// Eagerly loaded (Non-lazy / Bundled):
const bundledWidgetModules = import.meta.glob('/src/bundled-widgets/*/index.ts', {
  eager: true /* we load this immediately */,
}) as TGlobModuleMap

// Lazy loaded (Code-split / Plugins):
const asyncWidgetModules = import.meta.glob('/src/async-widgets/*/index.ts') as TGlobModuleMap

// Meta modules (Always eager so titles/icons are available immediately)
const allMetaModules = import.meta.glob('/src/**/widget-*/meta.ts', {
  eager: true,
}) as Record<string, Record<string, TWidgetMetaInfoBase>>

const hasPermission = (_user_: any, _permission: string) => true

export const getWidgetCatalog = async (user: any | null): Promise<TDashboardWidgetCatalog> => {
  // A. Register Static Core Components
  const catalogMapEntries: [string, IDynamicWidgetCatalogEntry][] = [
    // everyone has access to the containers:
    createStaticEntry('WidgetContainer', WidgetContainerColumn, otherWidgetsMetaMap['WidgetContainer']),
    createStaticEntry('WidgetContainerRow', WidgetContainerRow, otherWidgetsMetaMap['WidgetContainerRow']),
    createStaticEntry(
      'WidgetContainerLarge',
      WidgetContainerLarge,
      otherWidgetsMetaMap['WidgetContainerLarge'],
    ),
  ]

  // B. Optional: Register Business Static Widgets manually:
  // we could filter further by permissions and user type if needed
  if (hasPermission(user, 'some-permission')) {
    // i.e.:
    // catalogMapEntries.push(
    //   createStaticEntry(
    //     'WidgetThatRequiresPermissions',
    //     WidgetThatRequiresPermissions,
    //     otherWidgetsMetaMap['WidgetThatRequiresPermissions'],
    //   ),
    // )
    catalogMapEntries.push(
      createStaticEntry(
        'WidgetSmallCardSample',
        WidgetSmallCardSample,
        otherWidgetsMetaMap['WidgetSmallCardSample'],
      ),
    )
  }

  // C. Register widgets automatically with the localWidgetDiscovery helper:
  // (bundled widgets are included always, non-lazy)
  catalogMapEntries.push(
    ...localWidgetDiscovery(
      bundledWidgetsSrcPath,
      bundledWidgetModules,
      allMetaModules,
      false, // lazy: false
    )
  )

  // D. Register "lazy" widgets automatically with the localWidgetDiscovery helper:
  // (async widgets are not incuded, they are lazy loaded at run time)
  catalogMapEntries.push(
    ...localWidgetDiscovery(
      asyncWidgetsSrcPath,
      asyncWidgetModules,
      allMetaModules,
      true, // lazy: true
    )
  )

  // E. Optional: Remote discovery of -pre-built widgets hosted on a CDN (requires advance importMaps setup and other configuration)
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

File: src/dashboard-defaults.ts:
```typescript
import { blankDashboardConfig, cssSettingsCatalog } from '@tenorlab/react-dashboard/core'
import { getWidgetCatalog } from './widgets-catalog'
import type {
  TDashboardWidgetKey,
  IChildWidgetConfigEntry,
  IDashboardConfig,
  TDashboardWidgetCatalog,
} from '@tenorlab/react-dashboard'

// reserved identifier to be used only for the default dashboard
const DEFAULT_DASHBOARD_ID = 'default' as const
const DEFAULT_DASHBOARD_NAME = 'Default' as const

// default dashboard config for Regular user type
const getDefaultDashboardForRegularUser = (
  user: any,
  clientAppKey: string,
  availableWidgetKeys: TDashboardWidgetKey[],
): IDashboardConfig => {
  const userID = user.userID || 0
  return {
    userID,
    clientAppKey,
    dashboardId: DEFAULT_DASHBOARD_ID,
    dashboardName: DEFAULT_DASHBOARD_NAME,
    zoomScale: 1,
    responsiveGrid: true,
    widgets: [
      'WidgetContainer_container1', // will contain other widgets specified in the childWidgetsConfig secitno below
      'WidgetBarGradients',
      ],
    childWidgetsConfig: [
      // two widgets go into container1:
      { 
        parentWidgetKey: 'WidgetContainer_container1', 
        widgetKey: 'WidgetTotalOrders' 
      },
      { 
        parentWidgetKey: 'WidgetContainer_container1', 
        widgetKey: 'WidgetTotalOrders' 
      }
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

  if (!user) {
    return {
      dashboardConfig: blankDashboardConfig,
      widgetsCatalog,
    }
  }

  return {
    // Optional, you could use different routines depending on user role:
    dashboardConfig: getDefaultDashboardForRegularUser(user, clientAppKey, [...widgetsCatalog.keys()]),
    widgetsCatalog
  }
}
```

### 4. Implementation Example: Read-Only Dashboard

Use this for a simplified, non-editable view of the dashboard.

File: src/views/DashboardReadonly.tsx:
```react
import { useEffect, useState } from 'react'
import { useDashboardStore } from '@tenorlab/react-dashboard'
import {
  blankDashboardConfig,
  cssVarsUtils,
  useDashboardStorageService,
} from '@tenorlab/react-dashboard/core'
import { DynamicWidgetLoader, DashboardGrid } from '@tenorlab/react-dashboard'
import { getDashboardDefaults } from '../dashboard-defaults'
import type { IDashboardConfig, TDashboardWidgetCatalog } from '@tenorlab/react-dashboard'


export function DashboardReadonly() {
  const clientAppKey = 'myclientapp'
  const user = { id: 1234 }
  const userId = user.id
  const dashboardStore = useDashboardStore()
  const dashboardStorageService = useDashboardStorageService()

  const { isLoading, currentDashboardConfig } = dashboardStore
  const getTargetContainerKey = () => dashboardStore.targetContainerKey

  // default dashboard config
  const [_defaultDashboardConfig, setDefaultDashboardConfig] =
    useState<IDashboardConfig>(blankDashboardConfig)
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
        // show default dashboard or first dashboard
        const activeConfig = savedConfigs[0] || defaults.dashboardConfig
        dashboardStore.setCurrentDashboardConfig(activeConfig)
        setWidgetsCatalog(defaults.widgetsCatalog)
        setDefaultDashboardConfig(defaults.dashboardConfig)
        cssVarsUtils.restoreCssVarsFromSettings(activeConfig.cssSettings || [])
      } finally {
        dashboardStore.setIsLoading(false)
      }
    }
    initDashboard()
  }, [])

  return (
    <div className="relative flex flex-col h-full">
      {isLoading && <div>Loading</div>}
      {!isLoading && (
        <DashboardGrid
          isEditing={false}
          zoomScale={Number(currentDashboardConfig.zoomScale)}
          responsiveGrid={currentDashboardConfig.responsiveGrid}
        >
          {currentDashboardConfig.widgets.map((widgetKey, index) => (
            <DynamicWidgetLoader
              key={`${widgetKey}_${index}`}
              widgetKey={widgetKey}
              parentWidgetKey={undefined}
              targetContainerKey={getTargetContainerKey()}
              index={index}
              maxIndex={currentDashboardConfig.widgets.length - 1}
              childWidgetsConfig={currentDashboardConfig.childWidgetsConfig}
              widgetCatalog={widgetsCatalog as any}
              isEditing={false}
              onRemoveClick={() => {}}
              onMoveClick={() => {}}
              selectContainer={() => {}}
            />
          ))}
        </DashboardGrid>
      )}
    </div>
  )
}
```


#### 5. Full Editable Dashboard

For editable dashboard examples, including **Undo/Redo**, **Zooming**, **Catalog Flyouts**, and **Multiple Dashboards**, please refer to the [Pro Template](https://www.tenorlab.com).


------

## 🧩 Components & Services

### UI Components

- **`DashboardGrid`**: The main dashboard layout that position widgets within a responsive grid.
- **`WidgetContainer`**: A special "widget" that is a container for other widgets.
- **`WidgetsCatalogFlyout`**: A slide-out panel for users to browse and add new widgets on editable dashboards.
- **`DynamicWidgetLoader`**: The core lazy-loading widget loader that renders the widgets within the grid.

### Hooks & State

- **`useDashboardStore`**: Access the underlying reactive store to manage widget state, layout, and configuration.
- **`useDashboardUndoService`**: Provides `undo` and `redo` functionality for user layout changes in editable dashboard (optional).


------


## Links

### Open source core packages
 - [@tenorlab/react-dashboard](https://www.npmjs.com/package/@tenorlab/react-dashboard): React-specific components
 - [@tenorlab/vue-dashboard](https://www.npmjs.com/package/@tenorlab/vue-dashboard): Vue-specific components

### Pro Template Demos
 - [React Demo](https://react.tenorlab.com) (built with @tenorlab/react-dashboard)
 - [Vue Demo](https://vue.tenorlab.com) (built with @tenorlab/vue-dashboard)
 - [Nuxt Demo](https://nuxt.tenorlab.com) (built with @tenorlab/vue-dashboard)

### Others
 - [Buy a License](https://payhip.com/b/gPBpo)
 - [Follow on BlueSky](https://bsky.app/profile/tenorlab.bsky.social)
 - [Official Website](https://www.tenorlab.com)


------


## ⚖️ Licensing & Usage

**@tenorlab/vue-dashboard** is [MIT licensed](https://opensource.org/licenses/MIT). 

It provides the foundational components and logic for building dashboards. You are free to use it in any project, personal or commercial.

## ⚡️ Go Pro and Save Time: Tenorlab App Template

A commercial license for a full-blown professional app template is available for purchase [**here**](https://www.tenorlab.com) and comes with:

* **Full Application Shell:** A clean, optimized Vite + TypeScript project structure (with either React, Vue or Nuxt).
* **Dashboard Management:** Production-ready logic for creating, listing, renaming, and deleting multiple user-defined dashboards.
* **Implementation Examples:** Best patterns for both "Read-Only" (Analyst view) and "User-Editable" (Admin view) dashboard modes, a dynamic dashboard menu, etc.
* **Tenorlab Theme Engine:** A sophisticated Tailwind-based system supporting multiple custom themes (not just Light/Dark mode).
