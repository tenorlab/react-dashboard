import { TDashboardWidgetKey } from '../interfaces'

export const parseContainerTitle = (containerWidgetKey: TDashboardWidgetKey): string => {
  const parts = `${containerWidgetKey}`.split('_')

  if (parts.length > 1) {
    // parts[1] is the string we need to format, e.g., 'Container1', 'Container12'

    // Use replace with a regular expression:
    // /(\D)(\d+)/
    // 1. (\D): Capture group 1 (any non-digit character, matching the last letter of 'Container')
    // 2. (\d+): Capture group 2 (one or more digit characters, matching the number)
    // 3. Replacement string is '$1 $2' (Capture Group 1, followed by a space, followed by Capture Group 2)
    return parts[1].replace(/(\D)(\d+)/, '$1 $2')
  }

  return 'Container'
}
