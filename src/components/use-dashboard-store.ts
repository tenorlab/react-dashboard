import { create } from 'zustand'
import { StateCreator } from 'zustand'
import {
  IDashboardConfig,
  TDashboardWidgetKey,
  blankDashboardConfig,
  ensureContainersSequence,
} from './interfaces'

type TAddWidgetResponse = {
  success: boolean
  message?: string
  updatedDashboardConfig: IDashboardConfig
  allUpdatedDashboardConfigs: IDashboardConfig[]
}
type TRemoveWidgetResponse = TAddWidgetResponse
type TMoveWidgetResponse = TAddWidgetResponse

type TDashboardSlice = {
  isLoading: boolean
  isEditing: boolean
  allDashboardConfigs: IDashboardConfig[]
  currentDashboardConfig: IDashboardConfig
  targetContainerKey?: TDashboardWidgetKey | undefined
  getNextContainerKey: (containerWidgetKey: TDashboardWidgetKey) => TDashboardWidgetKey
  setIsLoading: (value: boolean) => boolean
  setIsEditing: (value: boolean) => boolean
  setTargetContainerKey: (value: TDashboardWidgetKey | undefined) => TDashboardWidgetKey | undefined
  setAllDashboardConfigs: (value: IDashboardConfig[]) => IDashboardConfig[]
  setCurrentDashboardConfig: (value: IDashboardConfig) => IDashboardConfig[]
  addDashboardConfig: (value: IDashboardConfig) => IDashboardConfig[]
  deleteDashboardConfigById: (value: string) => IDashboardConfig[]
  selectDashboardById: (dashboardId: string) => IDashboardConfig | undefined
  addWidget: (params: {
    widgetKey: TDashboardWidgetKey
    parentWidgetKey?: TDashboardWidgetKey
    noDuplicatedWidgets?: boolean
  }) => TAddWidgetResponse
  removeWidget: (
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => TRemoveWidgetResponse
  moveWidget: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ) => TRemoveWidgetResponse
}

const _getNextContainerName = (dashboardConfig: IDashboardConfig) => {
  // get next container id
  const containersIds = dashboardConfig.widgets
    .filter((x) => x.includes('WidgetContainer'))
    .map((x) => Number(x.split('_')[1].replace('container', '')))
  let nextId = containersIds.length > 0 ? Math.max(...containersIds) + 1 : 1
  return `container${nextId}`
}

const _getNextContainerKey = (
  dashboardConfig: IDashboardConfig,
  containerWidgetKey: TDashboardWidgetKey,
): TDashboardWidgetKey => {
  const containerName = _getNextContainerName(dashboardConfig)
  const widgetKey: TDashboardWidgetKey = `${containerWidgetKey}_${containerName}` as any
  return widgetKey
}

const _addWidget = (params: {
  dashboardConfig: IDashboardConfig
  widgetKey: TDashboardWidgetKey
  parentWidgetKey?: TDashboardWidgetKey
  noDuplicatedWidgets?: boolean
}): Omit<TAddWidgetResponse, 'allUpdatedDashboardConfigs'> => {
  const { dashboardConfig, widgetKey, parentWidgetKey, noDuplicatedWidgets } = params

  if (parentWidgetKey) {
    // if adding to parent container
    // if noDuplicatedWidgets is true, do not allow to add duplicated widgets:
    if (
      noDuplicatedWidgets &&
      dashboardConfig.childWidgetsConfig.find(
        (x) => x.parentWidgetKey === parentWidgetKey && x.widgetKey === widgetKey,
      )
    ) {
      return {
        success: false,
        message: `DashboardStore: addWidget: Widget already added (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }
    const newChildWidgetsConfig = [
      ...dashboardConfig.childWidgetsConfig,
      { parentWidgetKey, widgetKey }, // new entry
    ]
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        childWidgetsConfig: newChildWidgetsConfig,
      },
    }
  } else {
    // add root level widget
    // if noDuplicatedWidgets is true, do not allow to add duplicated widgets:
    if (noDuplicatedWidgets && dashboardConfig.widgets.includes(widgetKey)) {
      return {
        success: false,
        message: `DashboardStore: addWidget: Widget already added (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }
    const newWidgets = [...dashboardConfig.widgets, widgetKey]
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        widgets: newWidgets,
      },
    }
  }
}

const _removeWidget = (
  dashboardConfig: IDashboardConfig,
  widgetKey: TDashboardWidgetKey,
  parentWidgetKey?: TDashboardWidgetKey,
): Omit<TRemoveWidgetResponse, 'allUpdatedDashboardConfigs'> => {
  if ((parentWidgetKey || '').trim().length > 0) {
    // if removing from parent container:
    // save the other containers's widgets:
    const othersChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey !== parentWidgetKey,
    )
    // remove current widget from the container matching the parentWidhetKey argument
    const updateContainerChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey === parentWidgetKey && entry.widgetKey !== widgetKey,
    )
    // update
    const newChildWidgetsConfig = [...othersChildWidgets, ...updateContainerChildWidgets]
    let updatedDashboardConfig = {
      ...dashboardConfig,
      childWidgetsConfig: newChildWidgetsConfig,
    }

    // if removing container, ensure correct container sequence but keep original order
    const isContainer = `${widgetKey}`.includes('Container')
    if (isContainer) {
      updatedDashboardConfig = ensureContainersSequence(updatedDashboardConfig)
    }

    return {
      success: true,
      updatedDashboardConfig,
    }
  } else {
    // remove the root level widget
    const updatedWidgets = dashboardConfig.widgets.filter((key) => key !== widgetKey)
    // if the widget bring remove is a container, remove also all its childWidgets
    const updatedChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey !== widgetKey,
    )
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        widgets: updatedWidgets,
        childWidgetsConfig: updatedChildWidgets,
      },
    }
  }
}

const _moveWidget = (
  dashboardConfig: IDashboardConfig,
  direction: -1 | 1,
  widgetKey: TDashboardWidgetKey,
  parentWidgetKey?: TDashboardWidgetKey,
): Omit<TMoveWidgetResponse, 'allUpdatedDashboardConfigs'> => {
  if ((parentWidgetKey || '').trim().length > 0) {
    // if moving inside parent container:
    // save the other containers's widgets:
    const othersChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey !== parentWidgetKey,
    )
    // get this container widgets:
    let containerChildWidgets = dashboardConfig.childWidgetsConfig.filter(
      (entry) => entry.parentWidgetKey === parentWidgetKey,
    )
    const currentIndex = containerChildWidgets.indexOf(widgetKey as any)
    let newIndex = currentIndex + direction

    // Ensure the new index is within the array bounds
    // If moving left past the start (index 0), keep it at 0.
    newIndex = Math.max(0, newIndex)
    // If moving right past the end, keep it at the last index (containerChildWidgets.length - 1).
    newIndex = Math.min(containerChildWidgets.length - 1, newIndex)

    // If the new index is the same as the current index, return
    if (newIndex === currentIndex) {
      return {
        success: false,
        message: `DashboardStore: moveWidget: Widget already at min/max position (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }

    // update position
    const updatedWidgets = [...containerChildWidgets]
    // Remove the element from its current position
    // splice(start, deleteCount) returns an array of the deleted elements
    const [elementToMove] = updatedWidgets.splice(currentIndex, 1)
    // Insert the element into its new position
    // splice(start, deleteCount, item1)
    updatedWidgets.splice(newIndex, 0, elementToMove)

    // return updated config
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        childWidgetsConfig: [...othersChildWidgets, ...updatedWidgets],
      },
    }
  } else {
    // move root level widget
    const allWidgets = dashboardConfig.widgets || []
    const currentIndex = allWidgets.indexOf(widgetKey)
    let newIndex = currentIndex + direction

    // Ensure the new index is within the array bounds
    // If moving left past the start (index 0), keep it at 0.
    newIndex = Math.max(0, newIndex)
    // If moving right past the end, keep it at the last index (allWidgets.length - 1).
    newIndex = Math.min(allWidgets.length - 1, newIndex)

    // If the new index is the same as the current index, return
    if (newIndex === currentIndex) {
      return {
        success: false,
        message: `DashboardStore: moveWidget: Widget already at min/max position (${widgetKey})`,
        updatedDashboardConfig: dashboardConfig,
      }
    }

    // update position
    const updatedWidgets = [...allWidgets]
    // Remove the element from its current position
    // splice(start, deleteCount) returns an array of the deleted elements
    const [elementToMove] = updatedWidgets.splice(currentIndex, 1)
    // Insert the element into its new position
    // splice(start, deleteCount, item1)
    updatedWidgets.splice(newIndex, 0, elementToMove)
    return {
      success: true,
      updatedDashboardConfig: {
        ...dashboardConfig,
        widgets: updatedWidgets,
      },
    }
  }
}

const createDashboardSlice: StateCreator<TDashboardSlice, [], [], TDashboardSlice> = (
  set,
  get,
) => ({
  isLoading: false,
  isEditing: false,
  allDashboardConfigs: [blankDashboardConfig],
  currentDashboardConfig: blankDashboardConfig,
  targetContainerKey: undefined,
  getNextContainerKey: (containerWidgetKey: TDashboardWidgetKey): TDashboardWidgetKey =>
    _getNextContainerKey(get().currentDashboardConfig, containerWidgetKey),
  setIsLoading: (value): boolean => {
    set(() => ({ isLoading: value }))
    return value
  },
  setIsEditing: (value): boolean => {
    let currentTargetContainerKey = get().targetContainerKey
    if (!value) {
      currentTargetContainerKey = undefined
    }
    set(() => ({ isEditing: value, targetContainerKey: currentTargetContainerKey }))
    return value
  },
  setTargetContainerKey: (value): TDashboardWidgetKey | undefined => {
    set(() => ({ targetContainerKey: value }))
    return value
  },
  setAllDashboardConfigs: (value): IDashboardConfig[] => {
    set(() => ({ allDashboardConfigs: value }))
    return get().allDashboardConfigs
  },
  setCurrentDashboardConfig: (value): IDashboardConfig[] => {
    const state = get()
    const updatedList = [
      ...state.allDashboardConfigs.filter((x) => x.dashboardId !== value.dashboardId),
      value,
    ]
    set(() => {
      return {
        ...state,
        allDashboardConfigs: updatedList,
        currentDashboardConfig: value,
      }
    })
    return updatedList
  },

  addDashboardConfig: (value): IDashboardConfig[] => {
    const state = get()
    const updatedList = [
      ...state.allDashboardConfigs.filter((x) => x.dashboardId !== value.dashboardId),
      value,
    ]
    set(() => {
      return {
        ...state,
        allDashboardConfigs: updatedList,
        currentDashboardConfig: value,
      }
    })
    return updatedList
  },

  deleteDashboardConfigById: (dashboardId): IDashboardConfig[] => {
    const state = get()
    const updatedList = [...state.allDashboardConfigs.filter((x) => x.dashboardId !== dashboardId)]
    set(() => {
      return {
        ...state,
        allDashboardConfigs: updatedList,
        currentDashboardConfig: updatedList[0] || blankDashboardConfig,
      }
    })
    return updatedList
  },

  selectDashboardById: (dashboardId) => {
    set(() => {
      const state = get()
      const item = state.allDashboardConfigs.find((x) => x.dashboardId === dashboardId)
      if (item) {
        return {
          currentDashboardConfig: item,
        }
      }
      return {
        ...state,
      }
    })
    return get().currentDashboardConfig
  },

  addWidget: (params: {
    widgetKey: TDashboardWidgetKey
    parentWidgetKey?: TDashboardWidgetKey
    noDuplicatedWidgets?: boolean
  }): TAddWidgetResponse & {
    allUpdatedDashboardConfigs: IDashboardConfig[]
  } => {
    const state = get()
    const resp = _addWidget({
      dashboardConfig: state.currentDashboardConfig,
      ...params,
    })
    const allUpdatedDashboardConfigs = [
      ...state.allDashboardConfigs.filter(
        (x) => x.dashboardId !== resp.updatedDashboardConfig.dashboardId,
      ),
      resp.updatedDashboardConfig,
    ]
    if (resp.success) {
      set(() => ({
        allDashboardConfigs: allUpdatedDashboardConfigs,
        currentDashboardConfig: resp.updatedDashboardConfig,
      }))
    }
    return {
      ...resp,
      allUpdatedDashboardConfigs,
    }
  },
  removeWidget: (
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): TRemoveWidgetResponse => {
    const state = get()
    const resp = _removeWidget(state.currentDashboardConfig, widgetKey, parentWidgetKey)
    const allUpdatedDashboardConfigs = [
      ...state.allDashboardConfigs.filter(
        (x) => x.dashboardId !== resp.updatedDashboardConfig.dashboardId,
      ),
      resp.updatedDashboardConfig,
    ]
    if (resp.success) {
      set(() => ({
        allDashboardConfigs: allUpdatedDashboardConfigs,
        currentDashboardConfig: resp.updatedDashboardConfig,
      }))
    }
    return {
      ...resp,
      allUpdatedDashboardConfigs,
    }
  },
  moveWidget: (
    direction: -1 | 1,
    widgetKey: TDashboardWidgetKey,
    parentWidgetKey?: TDashboardWidgetKey,
  ): TRemoveWidgetResponse => {
    const state = get()
    const resp = _moveWidget(state.currentDashboardConfig, direction, widgetKey, parentWidgetKey)
    const allUpdatedDashboardConfigs = [
      ...state.allDashboardConfigs.filter(
        (x) => x.dashboardId !== resp.updatedDashboardConfig.dashboardId,
      ),
      resp.updatedDashboardConfig,
    ]
    if (resp.success) {
      set(() => ({
        allDashboardConfigs: allUpdatedDashboardConfigs,
        currentDashboardConfig: resp.updatedDashboardConfig,
      }))
    }
    return {
      ...resp,
      allUpdatedDashboardConfigs,
    }
  },
})

type TDashboardStore = TDashboardSlice

export const useDashboardStore = create<TDashboardStore>()((...state) => ({
  ...createDashboardSlice(...state),
}))
