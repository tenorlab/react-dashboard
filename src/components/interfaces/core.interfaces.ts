// file: src/components/interfaces/core.interfaces.ts
import type { TDashboardWidgetKey } from './core.base'

// for saving dash config as json:
export interface IChildWidgetConfigEntry {
  parentWidgetKey: TDashboardWidgetKey
  widgetKey: TDashboardWidgetKey
}

export interface IDashboardSettingEntry {
  key: string
  name: string
  description: string
  cssProperty: string
  step: number
  defaultUnit: string
  minValue: number
  defaultValue: string
  value: string
}

export interface IDashboardConfig {
  userID: number | string
  clientAppKey: string
  dashboardId: string
  dashboardName: string
  zoomScale: number
  responsiveGrid: boolean
  widgets: TDashboardWidgetKey[]
  childWidgetsConfig: IChildWidgetConfigEntry[]
  cssSettings: IDashboardSettingEntry[]

  // these are for unit tests only
  _version?: number
  _stateDescription?: string
}

/* begin: undo history */
export type TUndoHistoryEntry = {
  undoIndex: number
  config: IDashboardConfig
}

export type TDashboardUndoStatus = {
  isUndoDisabled: boolean
  isRedoDisabled: boolean

  // these for debugging only (and unit tests)
  _currentIndex?: number
  _historyLength?: number
}
/* end: undo history */
