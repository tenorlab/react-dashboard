// file: src/components/DashboardWidgetBase.tsx
import { forwardRef } from 'react'
import { Button } from './dashboard-primitives/'
import {
  XCircleIcon as RemoveWidgetIcon,
  MoveLeftIcon,
  MoveRightIcon,
} from './dashboard-primitives/'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps } from './interfaces/core-react.interfaces'

const defaultActionIconSize = 'size-5'

// 1. Define the generic functional component (pre-forwardRef)
const DashboardWidgetBaseFn = (
  props: IDashboardWidgetProps,
  _ref: React.ForwardedRef<HTMLDivElement>,
) => {
  const hideTitle = props.hideTitle && !props.isEditing
  const noBorder = props.noBorder

  let cssClass = `dashboard-widget ${props.isEditing ? 'editing' : ''} border border-solid`

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
    cssClass = `${cssClass} ${props.backgroundCssClasses}`
  } else {
    cssClass = `${cssClass} bg-card content-card`
  }

  if (['large', 'xlarge'].indexOf(props.size || '') > -1) {
    cssClass = `${cssClass} ${props.size}-widget`
  }

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
        <div className="widget-title-wrapper w-full flex flex-row gap-2 items-center justify-between">
          <h2 className="widget-title">
            {props.title} {/*[{props.parentWidgetKey}]*/}
          </h2>
          <div></div>
        </div>
        <div data-testid="collapse-and-other-actions">
          <div className="actions-inner">
            <div>
              <span className="hidden">Widget{/* <span>Widget: {props.title}</span> */}</span>
            </div>
            <div className="actions-buttons-container">
              <Button
                data-testid={`move-widget-left_${props.title}`}
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
                data-testid={`move-widget-right_${props.title}`}
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
                data-testid={`remove-container_${props.title}`}
                isIconButton={true}
                tooltip={{
                  placement: 'top',
                  title: 'Remove Widget',
                }}
                onClick={() => onRemoveClick()}
              >
                <RemoveWidgetIcon className={defaultActionIconSize} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div className="widget-inner">{props.children}</div>
    </div>
  )
}

// 2. Apply forwardRef and assert the component type to retain the generics
// This is necessary because forwardRef loses the generic signature.
export const DashboardWidgetBase = forwardRef(DashboardWidgetBaseFn) as (
  props: IDashboardWidgetProps & { ref?: React.ForwardedRef<HTMLDivElement> },
) => React.ReactElement | null
