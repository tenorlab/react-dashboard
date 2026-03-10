// @tenorlab/react-dashboard
// file: src/components/use-dashboard-store.ts

import { create } from 'zustand'
import { StateCreator } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { blankDashboardConfig, dashboardStoreUtils } from '@tenorlab/dashboard-core'
import type {
  IDashboardConfig,
  TDashboardWidgetKey,
  TAddWidgetResponse,
  TRemoveWidgetResponse,
  TMoveWidgetResponse,
} from '@tenorlab/dashboard-core'

/* zustand specific: */
type TDashboardSlice = {
  isLoading: boolean
  isEditing: boolean
  allDashboardConfigs: IDashboardConfig[]
  currentDashboardConfig: IDashboardConfig
  targetContainerKey?: TDashboardWidgetKey | undefined
  getNextContainerKey: (containerWidgetKey: TDashboardWidgetKey) => TDashboardWidgetKey

  getCurrentDashboardConfig: () => IDashboardConfig
  getCurrentDashboardId: () => string
  getIsResponsive: () => boolean
  getTargetContainerKey: () => TDashboardWidgetKey | undefined

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
    dashboardStoreUtils.getNextContainerKey(get().currentDashboardConfig, containerWidgetKey),

  getCurrentDashboardConfig: (): IDashboardConfig => get().currentDashboardConfig,
  getCurrentDashboardId: (): string => get().currentDashboardConfig.dashboardId,
  getIsResponsive: (): boolean => get().currentDashboardConfig.responsiveGrid || false,
  getTargetContainerKey: (): TDashboardWidgetKey | undefined => get().targetContainerKey,

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
    const resp = dashboardStoreUtils.addWidget({
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
    const resp = dashboardStoreUtils.removeWidget(
      state.currentDashboardConfig,
      widgetKey,
      parentWidgetKey,
    )
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
  ): TMoveWidgetResponse => {
    const state = get()
    const resp = dashboardStoreUtils.moveWidget(
      state.currentDashboardConfig,
      direction,
      widgetKey,
      parentWidgetKey,
    )
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

// export const useDashboardStore = create<TDashboardStore>()((...state) => ({
//   ...createDashboardSlice(...state),
// }))
export const useDashboardStore = create<TDashboardStore>()(
  subscribeWithSelector((...state) => ({
    ...createDashboardSlice(...state),
  })),
)
