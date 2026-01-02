// file: src/components/WidgetErrorWrapper.tsx
import type { IDashboardWidget, IDashboardWidgetProps, TWidgetErrorExtraProps } from './interfaces'
import { DashboardWidgetBase } from './DashboardWidgetBase'

export function WidgetErrorWrapper(props: IDashboardWidgetProps): IDashboardWidget {
  const { widgetKey, parentWidgetKey, index, maxIndex, isEditing, onRemoveClick, onMoveClick } =
    props

  const extraProps: TWidgetErrorExtraProps = props.extraProps

  return (
    <DashboardWidgetBase
      widgetKey={widgetKey}
      title="Widget Error"
      parentWidgetKey={parentWidgetKey}
      index={index}
      maxIndex={maxIndex}
      isEditing={isEditing}
      onRemoveClick={onRemoveClick}
      onMoveClick={onMoveClick}
    >
      <div className="p-4 border border-dashed border-danger">
        <span className="font-bold">Failed to load "{widgetKey}"</span>
        {extraProps?.versionMismatch && (
          <div className="flex flex-col">
            <span className="font-bold text-sm">Version Mismatch: {widgetKey}</span>
            <div className="flex flex-col text-xs">
              <span>Widget requires: Vue {extraProps?.requiredVer}.</span>
              <span>Host version: {extraProps?.hostVer}.</span>
            </div>
            <div className="flex flex-col mt-3">
              <h5>Externals:</h5>
              <dl className="ml-2 flex flex-col text-xs">
                {extraProps?.externalDependencies.map((dep, i) => (
                  <dd key={`dep-${i}`}>- {dep}</dd>
                ))}
              </dl>
            </div>
          </div>
        )}
        {!extraProps?.versionMismatch && (
          <div className="flex flex-col">
            <div className="flex flex-col text-xs italic">
              <span>The remote plugin is unavailable.</span>
            </div>
            <span className="font-bold text-sm">Error Details:</span>
            <div className="flex flex-col mt-3">
              <h5>Details:</h5>
              <div className="text-xs break-all">
                {extraProps?.errorMessage || 'Unknown error occurred.'}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardWidgetBase>
  )
}
