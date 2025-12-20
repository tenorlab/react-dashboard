import type { IDashboardSettingEntry } from '../interfaces'

export const cssVarsUtils = {
  getCssVariableValue: (cssPropertyName: string): string | null => {
    const rootElement: HTMLElement = document.documentElement
    const styles = getComputedStyle(rootElement)
    return styles.getPropertyValue(cssPropertyName).trim() || null
  },
  setCssVariableValue: (cssPropertyName: string, value: string): void => {
    const rootElement: HTMLElement = document.documentElement
    rootElement.style.setProperty(cssPropertyName, value)
  },
  restoreCssVarsFromSettings: (settings: IDashboardSettingEntry[]): void => {
    const rootElement: HTMLElement = document.documentElement
    settings.forEach((item) => {
      rootElement.style.setProperty(item.cssProperty, item.value)
    })
  },
}
