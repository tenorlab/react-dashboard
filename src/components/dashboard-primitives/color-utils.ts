// Helper function to resolve the current computed color for a given CSS class

// Resolve the current computed color using your existing CSS classes
export const resolveColorFromClass = (
  classNames: string | string[],
  property: 'color' | 'backgroundColor' = 'color',
): string => {
  if (typeof window === 'undefined') return '#FFFFFF' // Fallback for SSR

  const dummyElement = document.createElement('div')
  if (Array.isArray(classNames)) {
    classNames.forEach((cn) => dummyElement.classList.add(cn))
  } else {
    classNames.split(' ').forEach((cn) => dummyElement.classList.add(cn))
  }
  dummyElement.style.display = 'none'
  document.body.appendChild(dummyElement)

  // Get the computed style value (this resolves the oklch(var(--...)) into an actual RGB/HEX string)
  const color = window.getComputedStyle(dummyElement)[property]

  document.body.removeChild(dummyElement)

  return color
}

export const resolvedColors = {
  primary: resolveColorFromClass('text-primary', 'color'),
  secondary: resolveColorFromClass('text-secondary', 'color'),
  success: resolveColorFromClass('text-success', 'color'),
  danger: resolveColorFromClass('text-danger', 'color'),
  warning: resolveColorFromClass('text-warning', 'color'),
  info: resolveColorFromClass('text-info', 'color'),
  disabled: resolveColorFromClass('text-disabled', 'color'),
  neutral: resolveColorFromClass('text-neutral', 'color'),
  body: resolveColorFromClass('text-body', 'color'),
}
