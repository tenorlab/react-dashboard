// file: src/components/DashboardGrid.tsx
import { forwardRef, CSSProperties } from 'react'
import { 
  getDistinctCssClasses,
  ensureZoomScaleIsWithinRange,
} from '@tenorlab/dashboard-core'
import type { IDashboardGridProps } from './interfaces/core-react.interfaces'

interface CustomCSSProperties extends CSSProperties {
  '--bwj-dashboard-transform-scale': number
  '--bwj-dashboard-add-cols': number
}

const computedAdditionalColumns = (transformScale: number): number => {
  if (transformScale < 0.8) {
    return 1
  } else if (transformScale <= 1) {
    return 0
  } else if (transformScale > 1) {
    return -1
  }
  return 0
}

export const DashboardGrid = forwardRef<HTMLDivElement, IDashboardGridProps>((props, _ref) => {
  // ensure we dont go outside range:
  let transformScale = ensureZoomScaleIsWithinRange(Number(props.zoomScale || 0))
  const responsiveGrid = props.responsiveGrid || false
  const isEditing = props.isEditing || false

  const style: CustomCSSProperties = {
    '--bwj-dashboard-transform-scale': transformScale,
    '--bwj-dashboard-add-cols': computedAdditionalColumns(transformScale),
  }

  const className = getDistinctCssClasses(
    `dashboard-main-grid w-full`,
    isEditing ? 'editing' : '',
    responsiveGrid ? 'responsive-grid' : '',
    `border border-dashed ${isEditing ? 'border-primary border-opacity-50' : 'border-transparent'}`,
  )

  return (
    <div className={className} style={style}>
      {props.children}
    </div>
  )
})
