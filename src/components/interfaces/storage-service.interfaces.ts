// file: src/components/interfaces/storage-service.interfaces.ts
import type { TDashboardWidgetCatalogBase } from './core.base'
import type { IDashboardConfig } from './core.interfaces'

/* begin: storage service interfaces */
export type TGetSavedDashboards = (
  userID: number | string,
  clientAppKey: string,
  widgetCatalog: TDashboardWidgetCatalogBase,
  defaultDashboardConfig: IDashboardConfig,
) => Promise<IDashboardConfig[]>

export type TSaveDashboards = (
  userID: number | string,
  clientAppKey: string,
  dashboardConfigs: IDashboardConfig[],
  widgetCatalog: TDashboardWidgetCatalogBase,
) => Promise<boolean>

export interface IDashboardStorageService {
  getSavedDashboards: TGetSavedDashboards
  saveDashboards: TSaveDashboards
}
/* end: storage service interfaces */
