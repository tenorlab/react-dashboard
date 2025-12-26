// file: src/components/WidgetContainer.tsx
import { Button } from './dashboard-primitives'
import {
  XCircleIcon as RemoveWidgetIcon,
  MoveLeftIcon,
  MoveRightIcon,
  CrosshairIcon as ContainerTargetedIcon,
} from './dashboard-primitives'
import { getDistinctCssClasses } from '@tenorlab/dashboard-core'
import type { IDashboardWidgetProps, IDashboardWidget } from './interfaces/'
import type { JSX } from 'react'

const defaultActionIconSize = 'size-5'

function WidgetContainerBase(props: IDashboardWidgetProps): JSX.Element {
  const highlight = props.highlight || false
  const direction = props.direction || 'column'
  const hasChildren = (props.children as any).length > 0
  const isEditing = props.isEditing || false

  const highlightBorderClassName = 'border-transparent' //'border-primary'
  const defaultBorderClassName = 'border-card-invert'
  let borderColorClassName = highlight
    ? highlightBorderClassName
    : isEditing && !hasChildren
      ? defaultBorderClassName
      : 'border-transparent'

  const isGrid = ['large', 'xlarge'].includes(props.size || '')

  let sizeCssClass = ''
  if (['large', 'xlarge'].indexOf(props.size || '') > -1) {
    sizeCssClass = `${props.size}-widget`
  }

  let minHeight = ''
  if (direction === 'row' && !hasChildren) {
    minHeight = 'min-h-48'
  } else if (direction === 'column' && !hasChildren) {
    minHeight = 'min-h-96'
  }

  let cssClass = getDistinctCssClasses(
    `dashboard-widget-container relative `,
    !hasChildren ? 'has-no-children' : '',
    isEditing ? 'editing' : '',
    minHeight,
    sizeCssClass,
    isGrid ? 'widget-container-grid' : 'widget-container-flex',
    `direction-${direction}`,
    `border ${borderColorClassName}`,
    `${highlight ? 'highlight-container' : ''} ${borderColorClassName}`,
  )

  let containerActionsCssClass = `widget-container-header direction-${direction} flex items-center border-1 ${borderColorClassName}`

  const onRemoveClick = () => {
    if (props.onRemoveClick && props.widgetKey) {
      props.onRemoveClick(props.widgetKey)
    }
  }

  const onMoveClick = (direction: -1 | 1) => {
    if (props.onMoveClick && props.widgetKey) {
      props.onMoveClick(direction, props.widgetKey, props.parentWidgetKey)
    }
  }

  const selectContainer = () => {
    // opening from container so passing this widget key as the parentWidgetKey
    if (props.selectContainer && props.widgetKey) {
      props.selectContainer(props.widgetKey as any)
    }
  }

  return (
    <div data-testid={`container_${props.widgetKey}`} className={cssClass}>
      <div className={containerActionsCssClass}>
        <div
          className="widget-title-wrapper w-full flex whitespace-nowrap"
          onClick={selectContainer}
        >
          <span className="text-sm font-semibold capitalize">{props.title}</span>
        </div>
        <div data-testid="collapse-and-other-actions">
          <div className="actions-inner">
            <div className="actions-buttons-container">
              <Button
                data-testid={`open-widgets-catalog-from-container_${props.title}`}
                isIconButton={true}
                className="whitespace-nowrap"
                tooltip={{
                  placement: 'top',
                  title: 'Target this Container',
                }}
                onClick={selectContainer}
              >
                <ContainerTargetedIcon
                  className={`${defaultActionIconSize} ${highlight ? 'text-success' : 'text-disabled'}`}
                />
              </Button>
              <Button
                data-testid={`move-container-left_${props.title}`}
                isIconButton={true}
                disabled={props.index < 1}
                tooltip={{
                  placement: 'top',
                  title: `${props.index < 1 ? 'Already at min position' : 'Move Container to the left/up'}`,
                }}
                onClick={() => onMoveClick(-1)}
              >
                <MoveLeftIcon className={defaultActionIconSize} />
              </Button>
              <Button
                data-testid={`move-container-right_${props.title}`}
                isIconButton={true}
                disabled={props.index >= props.maxIndex}
                tooltip={{
                  placement: 'top',
                  title: `${props.index >= props.maxIndex ? 'Already at max position' : 'Move Container to the right/down'}`,
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
                  title: 'Remove Container',
                }}
                onClick={() => onRemoveClick()}
              >
                <RemoveWidgetIcon className={defaultActionIconSize} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <div data-testid={`childrenwrapper_${props.widgetKey}`} className="widget-container-inner">
        {props.children}
      </div>
    </div>
  )
}

/* default size */
export function WidgetContainerColumn(props: IDashboardWidgetProps): IDashboardWidget {
  const { direction: _, ...rest } = props
  return <WidgetContainerBase direction="column" {...rest} />
}

/* spans 2 columns */
export function WidgetContainerLarge(props: IDashboardWidgetProps): IDashboardWidget {
  const { size: _, ...rest } = props
  return <WidgetContainerBase size="large" {...rest} />
}

export function WidgetContainerRow(props: IDashboardWidgetProps): IDashboardWidget {
  const { direction: _, ...rest } = props
  return <WidgetContainerBase direction="row" {...rest} />
}
