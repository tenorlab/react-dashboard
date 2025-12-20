import {
  IDashboardConfig,
  TDashboardWidgetCatalog,
  IDashboardStorageService,
  TGetSavedDashboards,
  TSaveDashboards,
} from './interfaces'

const _getLocalStorageKey = (userID: number | string, clientAppKey: string): string => {
  return `dashboards_${clientAppKey}_${userID}`
}

const _getSavedDashboards: TGetSavedDashboards = async (
  userID: number | string,
  clientAppKey: string,
  widgetCatalog: TDashboardWidgetCatalog,
  defaultDashboardConfig: IDashboardConfig,
): Promise<IDashboardConfig[]> => {
  const rawStorageValue = localStorage.getItem(_getLocalStorageKey(userID, clientAppKey))
  if (rawStorageValue) {
    try {
      const results = JSON.parse(rawStorageValue) as IDashboardConfig[]

      if (results.length < 1) {
        // return default dashboard
        return [defaultDashboardConfig]
      }

      results.forEach((dashboardConfig) => {
        // ensure dashboardId has a value
        if (!dashboardConfig.dashboardId) {
          dashboardConfig.dashboardId = 'default'
        }
        if (!dashboardConfig.dashboardName) {
          dashboardConfig.dashboardName = `Dashboard ${dashboardConfig.dashboardId}`
        }
        dashboardConfig.responsiveGrid = dashboardConfig.responsiveGrid ?? false

        // Add validation of parsedConfig if needed
        if ((dashboardConfig.widgets || []).length < 1) {
          dashboardConfig.widgets = defaultDashboardConfig.widgets
        }
        // css setting entries (make sure we filter deprecated entries that were saved in local storage)
        const savedSettings = (dashboardConfig.cssSettings || []).filter((x) =>
          defaultDashboardConfig.cssSettings.some((defaultSetting) => defaultSetting.key === x.key),
        )

        if (savedSettings.length < 1) {
          dashboardConfig.cssSettings = [...defaultDashboardConfig.cssSettings]
        } else {
          // the settings from local storage might have missing properties that have been added in newer version
          savedSettings.forEach((setting) => {
            setting.value = (setting.value || '').replace(/NaN/g, '')
            // get default setting
            const defaultSetting = defaultDashboardConfig.cssSettings.find(
              (ds) => ds.key === setting.key,
            )
            if (defaultSetting) {
              // ensure all properties exist
              Object.keys(defaultSetting).forEach((propKey) => {
                if (!(propKey in setting)) {
                  // @ts-ignore
                  setting[propKey] = (defaultSetting as any)[propKey]
                }
              })

              // ensure some specific property have the correct defaults and steps:
              setting.step = defaultSetting.step
              setting.minValue = defaultSetting.minValue
              setting.defaultValue = defaultSetting.defaultValue
              setting.defaultUnit = defaultSetting.defaultUnit

              // in case bad data was saved, ensure value is valid number + unit
              if (/\d+/g.test(setting.value) === false) {
                setting.value = defaultSetting ? defaultSetting.value : '1.0rem'
              }
            }
          })
          // add all missing default setting entries
          const missingSettings = defaultDashboardConfig.cssSettings.filter((defaultSetting) => {
            return !savedSettings.some(
              (existingSetting) => existingSetting.key === defaultSetting.key,
            )
          })
          // update dashboard config settings
          dashboardConfig.cssSettings = [...savedSettings, ...missingSettings]
        }
        // also ensure that all widget keys are valid
        dashboardConfig.widgets = dashboardConfig.widgets.filter(
          (key) => key.includes('WidgetContainer') || widgetCatalog.has(key as any),
        )
        dashboardConfig.childWidgetsConfig = dashboardConfig.childWidgetsConfig.filter((entry) =>
          widgetCatalog.has(entry.widgetKey),
        )
        if (!dashboardConfig.zoomScale) {
          dashboardConfig.zoomScale = 1
        } else if (dashboardConfig.zoomScale < 0.7) {
          dashboardConfig.zoomScale = 0.7
        }
      })
      return results
    } catch (error) {
      console.warn('Error parsing saved dashboard config:', error)
    }
  }
  // Fall through to return default config
  return [defaultDashboardConfig]
}

const _saveDashboards: TSaveDashboards = async (
  userID: number | string,
  clientAppKey: string,
  dashboardConfigs: IDashboardConfig[],
  widgetCatalog: TDashboardWidgetCatalog,
) => {
  dashboardConfigs.forEach((dashboardConfig) => {
    // redundant from v1 when supporting only 1 dashboard:
    dashboardConfig.userID = userID
    dashboardConfig.clientAppKey = clientAppKey
    dashboardConfig.responsiveGrid = dashboardConfig.responsiveGrid ?? false

    // For demo purposes, save to localStorage, later will do backend API call etc.
    if (typeof dashboardConfig !== 'object') {
      throw new Error('Invalid dashboard configuration')
    }
    // ensure that all widget keys are valid
    dashboardConfig.widgets = dashboardConfig.widgets.filter(
      (key) => key.includes('WidgetContainer') || widgetCatalog.has(key as any),
    )
    dashboardConfig.childWidgetsConfig = dashboardConfig.childWidgetsConfig.filter((entry) =>
      widgetCatalog.has(entry.widgetKey),
    )
    if (!dashboardConfig.zoomScale) {
      dashboardConfig.zoomScale = 1
    } else if (dashboardConfig.zoomScale < 0.7) {
      dashboardConfig.zoomScale = 0.7
    }
  })

  const rawConfig = JSON.stringify(dashboardConfigs)
  localStorage.setItem(_getLocalStorageKey(userID, clientAppKey), rawConfig)
  return true
}

const _instance: IDashboardStorageService = {
  getSavedDashboards: _getSavedDashboards,
  saveDashboards: _saveDashboards,
}

export const useDashboardStorageService = (): IDashboardStorageService => {
  return _instance as any
}
