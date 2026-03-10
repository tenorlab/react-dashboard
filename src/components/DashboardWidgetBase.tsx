// file: src/components/DashboardWidgetBase.tsx
import { forwardRef, useState } from 'react'
import {
  Button,
  MoveLeftIcon,
  MoveRightIcon,
  XCircleIcon as RemoveWidgetIcon,
  ChevronDownIcon,
  HandGrabIcon,
} from './dashboard-primitives/'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps } from './interfaces/core-react.interfaces'

const defaultActionIconSize = 'size-5'

const _getCssClasses = (props: IDashboardWidgetProps, isCollapsed: boolean): string => {
  // if overrideCssClasses is provided, we do not compute any css classes but use the ones provided:
  if ((props.overrideCssClasses || '').trim().length > 0) {
    return (props.overrideCssClasses || '').trim()
  }

  const flowDirection = props.direction || 'column'
  const noBorder = props.noBorder

  let cssClass = `dashboard-widget ${isCollapsed ? 'collapsed' : ''}`
  cssClass = `${cssClass} direction-${flowDirection} ${props.isEditing ? 'editing' : ''}`
  cssClass = `${cssClass} border border-solid`

  if (['large', 'xlarge'].indexOf(props.size || '') > -1) {
    cssClass = `${cssClass} ${props.size}-widget`
  }

  if (!noBorder) {
    if ((props.borderCssClasses || '').trim().length > 0) {
      cssClass = `${cssClass} ${props.borderCssClasses}`
    } else {
      cssClass = `${cssClass} border-card-invert border-opacity-20`
    }
  } else {
    cssClass = `${cssClass} border-transparent border-opacity-0`
  }

  if (!!props.noShadow) {
    cssClass = `${cssClass} no-shadow`
  }

  if (!!props.noPadding) {
    cssClass = `${cssClass} no-padding p-0`
  }

  if ((props.backgroundCssClasses || '').trim().length > 0) {
    cssClass = `${cssClass} ${props.backgroundCssClasses}`.trim()
  } else {
    cssClass = `${cssClass} bg-card content-card`
  }

  if ((props.addCssClasses || '').trim().length > 0) {
    cssClass = `${cssClass} ${props.addCssClasses}`.trim()
  }

  return cssClass
}

// 1. Define the generic functional component (pre-forwardRef)
const DashboardWidgetBaseFn = (
  props: IDashboardWidgetProps,
  _ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const hideTitle = props.hideTitle && !props.isEditing

  const getNoCollapse = () => {
    const metaNoCollapse = (props.meta as any)?.noCollapse
    // meta overrides prop
    if (typeof metaNoCollapse !== 'undefined') {
      return metaNoCollapse
    }
    return props.noCollapse || false
  }

  const [isCollapsed, setIsCollapsed] = useState(
    getNoCollapse() ? false : props.widgetSavedProps?.isCollapsed || false,
  )

  const cssClass = getDistinctCssClasses(_getCssClasses(props, isCollapsed))

  const onRemoveClick = () => {
    if (props.onRemoveClick && props.widgetKey) {
      props.onRemoveClick(props.widgetKey, props.parentWidgetKey)
    }
  }

  const onMoveClick = (direction: -1 | 1) => {
    if (props.onMoveClick && props.widgetKey) {
      props.onMoveClick(direction, props.widgetKey, props.parentWidgetKey)
    }
  }

  const emitSavedPropsChanged = () => {
    props.savedPropsChanged?.({
      parentWidgetKey: props.parentWidgetKey,
      widgetKey: props.widgetKey,
      isCollapsed: isCollapsed,
    })
  }

  const onCollapseExpand = () => {
    if (props.widgetKey) {
      setIsCollapsed(!isCollapsed)
      emitSavedPropsChanged()
    }
  }

  const widgetHeaderCssClass = getDistinctCssClasses(
    `widget-header`,
    hideTitle
      ? 'hidden'
      : `flex items-center justify-between border-b border-solid border-card-invert`,
    !hideTitle ? 'border-opacity-20' : 'border-opacity-0',
  )

  return (
    <div className={cssClass}>
      <div className={widgetHeaderCssClass}>
        <div className="widget-title-wrapper group w-full flex flex-row gap-2 items-center">
          <div className="drag-handle hidden cursor-pointer text-primary group-hover:flex hover:brightness-110 pointer-coarse:flex">
            <HandGrabIcon className="size-5" />
          </div>
          <div className="w-full flex flex-row gap-2 items-center justify-between">
            {props.titleNode || (
              <h2 className="widget-title cursor-pointer" onClick={() => onCollapseExpand()}>
                {props.title}
              </h2>
            )}
            {props.titleRightNode}
          </div>
        </div>

        <div data-testid={`collapse-and-other-actions_${props.widgetKey}_${props.index}`}>
          <div className="actions-inner">
            <div>
              <span className="hidden">Widget</span>
            </div>
            <div className="actions-buttons-container">
              <Button
                data-testid={`move-widget-left_${props.widgetKey}_${props.index}`}
                isIconButton={true}
                disabled={props.index < 1}
                tooltip={{
                  placement: 'top',
                  title: `${props.index < 1 ? 'Already at min position' : 'Move Widget to the left/up'}`,
                }}
                onClick={() => onMoveClick(-1)}
              >
                <MoveLeftIcon className={defaultActionIconSize} />
              </Button>
              <Button
                data-testid={`move-widget-right_${props.widgetKey}_${props.index}`}
                isIconButton={true}
                disabled={props.index >= props.maxIndex}
                tooltip={{
                  placement: 'top',
                  title: `${props.index >= props.maxIndex ? 'Already at max position' : 'Move Widget to the right/down'}`,
                }}
                onClick={() => onMoveClick(1)}
              >
                <MoveRightIcon className={defaultActionIconSize} />
              </Button>
              <Button
                data-testid={`remove-container_${props.widgetKey}_${props.index}`}
                isIconButton={true}
                tooltip={{
                  placement: 'top',
                  title: 'Remove Widget',
                }}
                onClick={() => onRemoveClick()}
              >
                <RemoveWidgetIcon className={defaultActionIconSize} />
              </Button>
              {!getNoCollapse() && (
                <Button
                  data-testid={`collapse-expand_${props.widgetKey}_${props.index}`}
                  className="collapse-button"
                  isIconButton={true}
                  tooltip={{
                    placement: 'top',
                    title: `${isCollapsed ? 'Expand Widget' : 'Collapse Widget'}`,
                  }}
                  onClick={() => onCollapseExpand()}
                >
                  <ChevronDownIcon
                    className={defaultActionIconSize}
                    style={{
                      transform: isCollapsed ? 'rotate(0deg)' : 'rotate(180deg)',
                      transition: 'transform 0.2s ease-in-out',
                    }}
                  />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div
        className="widget-inner transition-height duration-300 ease-in-out"
        data-collapsed={isCollapsed}
      >
        {props.children}
      </div>
    </div>
  )
}

// 2. Apply forwardRef and assert the component type to retain the generics
// This is necessary because forwardRef loses the generic signature.
export const DashboardWidgetBase = forwardRef(DashboardWidgetBaseFn) as (
  props: IDashboardWidgetProps & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement | null
