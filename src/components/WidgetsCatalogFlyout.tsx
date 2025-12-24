// file: src/components/WidgetsCatalogFlyout.tsx
import { useState, useEffect } from 'react'
import { getWidgetMetaFromCatalog } from './interfaces/'
import { dashboardSettingsUtils } from './dashboard-settings/'
import {
  HandIcon,
  HandGrabIcon,
  TimerResetIcon as ResetDashboardToDefaultIcon,
  SettingsIcon,
  UndoIcon,
  RedoIcon,
  CircleQuestionMark as UnknownWidgetIcon,
  Button,
  DraggablePanel,
  TextField,
  getDistinctCssClasses,
  parseContainerTitle,
} from './dashboard-primitives/'
import type {
  IDashboardConfig,
  IDashboardSettingEntry,
  TDashboardUndoStatus,
  TDashboardWidgetCatalog,
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
} from './interfaces/'

type TWidgetListItemProps = {
  widgetKey: TDashboardWidgetKey
  metaData: TWidgetMetaInfoBase
  alreadyAdded: boolean
  addWidget: () => void
}

function WidgetListItem({
  // widgetKey,
  metaData,
  alreadyAdded,
  addWidget,
}: TWidgetListItemProps) {
  const [showExternals, setShowExternals] = useState(false)
  const OptionIconComponent = metaData.icon || UnknownWidgetIcon
  const displayName = metaData.name || 'Unknown'
  const description = metaData.description || '---'
  // const categories = metaData.categories || [];
  const noDuplicatedWidgets = metaData.noDuplicatedWidgets || false
  const addNotAllowed = noDuplicatedWidgets && alreadyAdded
  const className = getDistinctCssClasses(`
    flex flex-row gap-2 p-2 rounded-md border text-sm bg-card content-card backdrop-opacity-100
    ${
      !addNotAllowed
        ? 'cursor-pointer border-primary fill-danger hover:fill-primary content-primary hover:brightness-110'
        : 'border-disabled fill-disabled text-disabled'
    }
  `)

  const onClicked = () => {
    if (addNotAllowed) {
      return
    }
    addWidget()
  }

  const onExternalsClicked = (ev: any) => {
    ev.stopPropagation()
    ev.preventDefault()
    setShowExternals(!showExternals)
  }

  return (
    <div className={className} style={{ width: 'calc(100% - 1rem)' }} onClick={onClicked}>
      <OptionIconComponent className="" />
      <div className="w-full">
        <div className="flex flex-row items-center gap-2 justify-between">
          <span className="font-bold">{displayName}</span>
          <div className="text-xs">{addNotAllowed ? '(Added)' : ''}</div>
        </div>
        <div className="flex flex-col text-xs">
          <div>{description}</div>
          <div className="mt-3 cursor-pointer" onClick={onExternalsClicked}>
            Externals:
          </div>
          {showExternals && (
            <dl className="ml-2 flex flex-col text-xs">
              {metaData.externalDependencies.map((dep, i) => (
                <dd key={i}>- {dep}</dd>
              ))}
            </dl>
          )}
        </div>
      </div>
    </div>
  )
}

type TSettingListItemProps = {
  item: IDashboardSettingEntry
  onSettingItemChanged: (item: IDashboardSettingEntry) => any
}

function SettingListItem({ item, onSettingItemChanged }: TSettingListItemProps) {
  // const OptionIconComponent = item.icon
  const displayName = item.name || 'Unknown'
  const description = item.description || '---'
  const className = getDistinctCssClasses(`
    flex flex-row gap-2 p-2 rounded-md border text-sm bg-card content-card backdrop-opacity-100
  `)

  // 1. Handler for keyboard events (runs on key press)
  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const keyboardKey = ev.key

    if (['ArrowUp', 'ArrowDown'].includes(keyboardKey)) {
      // Prevent the default cursor movement or page scrolling action
      ev.preventDefault()

      // increment/decrement entry value
      const updatedEntry = dashboardSettingsUtils.incrementOrDecrementValue(
        item,
        keyboardKey === 'ArrowUp' ? 1 : -1,
      )
      // invoke callback with updated entry
      onSettingItemChanged(updatedEntry)
    }
  }

  // 2. Handler for text input (runs only when text changes)
  const onInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    // When the user types text, use the standard onChange value
    onSettingItemChanged({
      ...item,
      value: ev.target.value || '',
    })
  }

  return (
    <div className={className} style={{ width: 'calc(100% - 1rem)' }}>
      {/* <OptionIconComponent className="" /> */}
      <div className="w-full">
        <div className="flex flex-row items-center gap-2 justify-between">
          <span className="font-bold">{displayName}</span>
        </div>
        <div className="flex flex-col gap-2 text-xs">
          <div>{description}</div>
        </div>
        <div>
          Value:
          <TextField
            label="Filter..."
            size="small"
            className="w-full"
            value={item.value}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
          />
        </div>
      </div>
    </div>
  )
}

export type TWidgetsCatalogFlyoutProps = {
  targetContainerKey?: TDashboardWidgetKey
  widgetsCatalog: TDashboardWidgetCatalog
  currentDashboardConfig: IDashboardConfig
  undoStatus: TDashboardUndoStatus
  addWidget: (widgetKey: TDashboardWidgetKey, parentWidgetKey?: TDashboardWidgetKey) => any
  addContainer: (widgetKey: TDashboardWidgetKey) => any
  onSettingItemsUpdated: (items: IDashboardSettingEntry[]) => any
  onResetToDefaultDashboardClick: () => any
  onUndoOrRedo: (operation: 'Undo' | 'Redo') => any
  onDoneClick: () => any
}

const isWidgetAlreadyAdded = (
  widgetKey: TDashboardWidgetKey,
  dashboardConfig: IDashboardConfig,
) => {
  const allExistingWidgets = [
    ...dashboardConfig.widgets.filter((x) => x.indexOf('Container') === -1),
    ...dashboardConfig.childWidgetsConfig.map((x) => x.widgetKey),
  ]
  return allExistingWidgets.includes(widgetKey)
}

export function WidgetsCatalogFlyout(props: TWidgetsCatalogFlyoutProps) {
  const {
    currentDashboardConfig,
    undoStatus,
    addContainer,
    onResetToDefaultDashboardClick,
    onUndoOrRedo,
    onDoneClick,
  } = props

  const [title, setTitle] = useState('Editing')
  const [tabValue, setTabValue] = useState(0)
  const [searchText, setSearchText] = useState('')

  // Get the array of available widget keys from the Map
  const widgetKeys: TDashboardWidgetKey[] = Array.from(props.widgetsCatalog.keys())

  // Filter out the container and map the remaining keys to their metadata
  const widgetsWithMeta: {
    widgetKey: TDashboardWidgetKey
    metaData: TWidgetMetaInfoBase
  }[] = widgetKeys.map((widgetKey) => ({
    widgetKey,
    metaData: getWidgetMetaFromCatalog(widgetKey, props.widgetsCatalog),
  }))

  const isTargetingContainer = !!props.targetContainerKey

  // const handleTabChange = (event: React.ChangeEvent<any>, newValue: number) => {
  //   setTabValue(newValue)
  // }

  const handleSearchTextChange = (event: any) => {
    setSearchText(event.target.value)
  }

  const matchSearchTextForWidget = (metaData: TWidgetMetaInfoBase): boolean => {
    const lowerCaseText = searchText.trim().toLowerCase()
    if (lowerCaseText.length < 1) {
      return true
    }
    return (
      metaData.name.trim().toLowerCase().includes(lowerCaseText) ||
      metaData.description.toLowerCase().includes(lowerCaseText)
    )
  }

  const matchSearchTextForSetting = (item: IDashboardSettingEntry): boolean => {
    const lowerCaseText = searchText.trim().toLowerCase()
    if (lowerCaseText.length < 1) {
      return true
    }
    return (
      item.name.trim().toLowerCase().includes(lowerCaseText) ||
      item.description.toLowerCase().includes(lowerCaseText)
    )
  }

  const getTabClassName = (tabNum: number) => {
    return getDistinctCssClasses(
      'px-4 py-2 font-medium cursor-pointer border-b-2 border-transparent hover:border-primary focus:outline-none',
      tabNum === tabValue ? 'text-primary border-primary' : '',
    )
  }

  const onAddWidgetClick = (widgetKey: TDashboardWidgetKey) => {
    if (!isTargetingContainer) {
      // targeting dashboard
      props.addWidget(widgetKey)
    } else {
      // targeting container
      props.addWidget(widgetKey, props.targetContainerKey)
    }
  }

  const onSettingItemChanged = (item: IDashboardSettingEntry) => {
    const updatedItems = (props.currentDashboardConfig.cssSettings || []).map((existingItem) => {
      if (existingItem.key === item.key) {
        return item
      }
      return existingItem
    })
    props.onSettingItemsUpdated(updatedItems)
  }

  const [isDragging, setIsDragging] = useState(false)
  const onDraggingChange = (value: boolean) => {
    setIsDragging(value)
  }

  useEffect(() => {
    if (!!props.targetContainerKey) {
      setTabValue(0)
      const containerTitle = parseContainerTitle(props.targetContainerKey)
      setTitle(`Editing ${containerTitle}`)
    } else {
      setTitle('Editing Dashboard')
    }
  }, [props.targetContainerKey])

  return (
    <DraggablePanel
      testId="dashboard-catalog-flyout"
      className="bg-body content-body bg-opacity-70 border-2 border-primary"
      style={{
        width: '360px',
        minWidth: '360px',
        maxWidth: '360px',
        minHeight: '360px',
        backdropFilter: 'blur(8px)',
      }}
      onDraggingChange={onDraggingChange}
    >
      <div className="flex flex-col gap-2 p-2">
        <div className="flex flex-row gap-2 justify-between">
          <div className="handle flex-1 flex gap-2 w-full hover:text-primary cursor-grab">
            {isDragging ? <HandGrabIcon className="size-5" /> : <HandIcon className="size-5" />}
            <h2
              className="flex-1 text-base margin-0 capitalize"
              title={
                isTargetingContainer
                  ? title
                  : `Editing dashboard: ${currentDashboardConfig.dashboardName}`
              }
            >
              {title}
            </h2>
          </div>

          <div className="flex flex-row gap-2 items-center">
            <Button
              data-testid="undo-dashboard-config-change"
              isIconButton={true}
              tooltip={{
                placement: 'bottom',
                title: 'Undo',
              }}
              disabled={undoStatus.isUndoDisabled}
              onClick={() => onUndoOrRedo('Undo')}
            >
              <UndoIcon className="size-5" />
            </Button>
            <Button
              data-testid="redo-dashboard-config-change"
              isIconButton={true}
              tooltip={{
                placement: 'bottom',
                title: 'Redo',
              }}
              disabled={undoStatus.isRedoDisabled}
              onClick={() => onUndoOrRedo('Redo')}
            >
              <RedoIcon className="size-5" />
            </Button>
            <Button
              data-testid="reset-dashboard-to-default"
              isIconButton={true}
              tooltip={{
                placement: 'bottom',
                title: 'Reset this dashboard to the default configuration',
              }}
              onClick={onResetToDefaultDashboardClick}
            >
              <ResetDashboardToDefaultIcon className="size-5" />
            </Button>
          </div>
        </div>

        {/* tabs */}
        <div className="flex border-b border-gray-200">
          <button onClick={() => setTabValue(0)} className={getTabClassName(0)}>
            Widgets
          </button>
          <button onClick={() => setTabValue(1)} className={getTabClassName(1)}>
            Charts
          </button>
          {!isTargetingContainer && (
            <button onClick={() => setTabValue(2)} className={getTabClassName(2)}>
              Containers
            </button>
          )}
          {!isTargetingContainer && (
            <button onClick={() => setTabValue(3)} className={getTabClassName(3)}>
              <SettingsIcon />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-1 w-full">
          <TextField
            label="Filter..."
            size="small"
            className="w-full"
            value={searchText}
            onChange={handleSearchTextChange}
          />
        </div>

        <div
          className="flex flex-col gap-2 overflow-x-hidden overflow-y-auto"
          style={{
            maxHeight: '360px',
          }}
        >
          {tabValue === 0 &&
            widgetsWithMeta
              .filter(
                (item) =>
                  item.metaData.categories.includes('Widget') &&
                  matchSearchTextForWidget(item.metaData),
              )
              .map((item) => (
                <WidgetListItem
                  key={item.widgetKey}
                  widgetKey={item.widgetKey}
                  metaData={item.metaData}
                  alreadyAdded={isWidgetAlreadyAdded(item.widgetKey, currentDashboardConfig)}
                  addWidget={() => onAddWidgetClick(item.widgetKey)}
                />
              ))}
          {tabValue === 1 &&
            widgetsWithMeta
              .filter(
                (item) =>
                  item.metaData.categories.includes('Chart') &&
                  matchSearchTextForWidget(item.metaData),
              )
              .map((item) => (
                <WidgetListItem
                  key={item.widgetKey}
                  widgetKey={item.widgetKey}
                  metaData={item.metaData}
                  alreadyAdded={isWidgetAlreadyAdded(item.widgetKey, currentDashboardConfig)}
                  addWidget={() => onAddWidgetClick(item.widgetKey)}
                />
              ))}
          {!isTargetingContainer &&
            tabValue === 2 &&
            widgetsWithMeta
              .filter((item) => item.metaData.categories.includes('Container'))
              .map((item) => (
                <WidgetListItem
                  key={item.widgetKey}
                  widgetKey={item.widgetKey}
                  metaData={item.metaData}
                  alreadyAdded={isWidgetAlreadyAdded(item.widgetKey, currentDashboardConfig)}
                  addWidget={() => addContainer(item.widgetKey)}
                />
              ))}
          {!isTargetingContainer &&
            tabValue === 3 &&
            (currentDashboardConfig.cssSettings || [])
              .filter(matchSearchTextForSetting)
              .map((item) => (
                <SettingListItem
                  key={item.key}
                  item={item}
                  onSettingItemChanged={onSettingItemChanged}
                />
              ))}
        </div>

        <div className="mt-4 w-full flex flex-row justify-end pt-1">
          <Button
            className="bg-opacity-100"
            tooltip={{
              placement: 'bottom',
              title: 'Click to exit edit mode',
            }}
            onClick={onDoneClick}
          >
            Done
          </Button>
        </div>
      </div>
    </DraggablePanel>
  )
}
