export const getDistinctCssClasses = (defaultClasses: string, ...additionalClasses: string[]) => {
  // distinct css classes
  const result = [
    ...new Set(
      [defaultClasses || '', ...additionalClasses]
        .join(' ')
        .trim()
        .replace(/\n+/gi, ' ')
        .replace(/\s+/gi, ' ')
        .split(' '),
    ),
  ]
    .join(' ')
    .trim()
  return result
}
