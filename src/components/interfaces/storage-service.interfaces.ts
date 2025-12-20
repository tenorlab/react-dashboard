// file: src/components/interfaces/storage-service.interfaces.ts
import type { TDashboardWidgetCatalog, IDashboardConfig } from './core.interfaces'

/* begin: storage service interfaces */
export type TGetSavedDashboards = (
  userID: number | string,
  clientAppKey: string,
  widgetCatalog: TDashboardWidgetCatalog,
  defaultDashboardConfig: IDashboardConfig,
) => Promise<IDashboardConfig[]>

export type TSaveDashboards = (
  userID: number | string,
  clientAppKey: string,
  dashboardConfigs: IDashboardConfig[],
  widgetCatalog: TDashboardWidgetCatalog,
) => Promise<boolean>

export interface IDashboardStorageService {
  getSavedDashboards: TGetSavedDashboards
  saveDashboards: TSaveDashboards
}
/* end: storage service interfaces */
