// file: src/components/WidgetsCatalogFlyout.tsx
import { useState, useEffect, useMemo } from 'react'
import {
  getWidgetMetaFromCatalog,
  dashboardSettingsUtils,
  getDistinctCssClasses,
  parseContainerTitle,
} from '@tenorlab/dashboard-core'
import {
  HandIcon,
  HandGrabIcon,
  TimerResetIcon as ResetDashboardToDefaultIcon,
  SettingsIcon,
  PlusCircleIcon,
  MinusCircleIcon,
  ChevronDownIcon,
  UndoIcon,
  RedoIcon,
  CircleQuestionMark as UnknownWidgetIcon,
  Button,
  DraggablePanel,
  TextField,
  Dropdown,
} from './dashboard-primitives/'
import type {
  IDashboardConfig,
  IDashboardSettingEntry,
  TDashboardUndoStatus,
  TDashboardWidgetKey,
  TWidgetMetaInfoBase,
} from '@tenorlab/dashboard-core'
import type { TDashboardWidgetCatalog } from './interfaces/'

type TTabInfo = {
  id: number
  label: string
  hideLabel?: boolean
  icon?: React.ReactNode
}

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
        ? `cursor-pointer border-primary fill-danger hover:fill-primary content-primary hover:brightness-110`
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
          {showExternals && metaData.externalDependencies.length > 0 && (
            <div className="mt-3 cursor-pointer" onClick={onExternalsClicked}>
              Externals:
              <dl className="ml-2 flex flex-col text-xs">
                {metaData.externalDependencies.map((dep, i) => (
                  <dd key={i}>- {dep}</dd>
                ))}
              </dl>
            </div>
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
    flex flex-row gap-2 px-2 text-sm backdrop-opacity-100
  `)

  const incrementOrDecrement = (direction: 1 | -1) => {
    // increment/decrement entry value
    const updatedEntry = dashboardSettingsUtils.incrementOrDecrementValue(item, direction)
    // invoke callback with updated entry
    onSettingItemChanged(updatedEntry)
  }

  // 1. Handler for keyboard events (runs on key press)
  const onKeyDown = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    const keyboardKey = ev.key

    if (['ArrowUp', 'ArrowDown'].includes(keyboardKey)) {
      // Prevent the default cursor movement or page scrolling action
      ev.preventDefault()
      // increment/decrement entry value
      incrementOrDecrement(keyboardKey === 'ArrowUp' ? 1 : -1)
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
      <div className="w-full flex flex-col">
        <h6 className="font-bold">{displayName}</h6>
        <p className="flex flex-col text-xs">{description}</p>
        <div className="mt-1 flex flex-row gap-2 items-center">
          <TextField
            label=""
            size="small"
            className="w-full"
            value={item.value}
            onChange={onInputChange}
            onKeyDown={onKeyDown}
          />
          <Button
            data-testid={`setting-decrease_${item.key}`}
            isIconButton={true}
            tooltip={{
              placement: 'bottom',
              title: 'Decrease Value',
            }}
            onClick={() => incrementOrDecrement(-1)}
          >
            <MinusCircleIcon />
          </Button>
          <Button
            data-testid={`setting-increase_${item.key}`}
            isIconButton={true}
            tooltip={{
              placement: 'bottom',
              title: 'Increase Value',
            }}
            onClick={() => incrementOrDecrement(1)}
          >
            <PlusCircleIcon />
          </Button>
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
  zIndex?: number
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
  const [isDragging, setIsDragging] = useState(false)
  const [isTabsMenuOpen, setTabsMenuOpen] = useState(false)

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
      metaData.description.toLowerCase().includes(lowerCaseText) ||
      metaData.categories.some((c) => c.toLowerCase().includes(lowerCaseText))
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

  const getTabClassName = (tabNum: number, noBorderBottom?: boolean) => {
    return getDistinctCssClasses(
      'px-4 py-2 font-medium cursor-pointer',
      `${!noBorderBottom ? 'border-b-2' : ''} border-transparent hover:border-primary focus:outline-none`,
      tabNum === tabValue ? 'text-primary border-primary' : '',
    )
  }

  const getMobileTabClassName = (tabNum: number) => {
    return getDistinctCssClasses(
      `w-full flex items-center gap-2 px-2 py-1 text-left text-sm cursor-pointer border`,
      tabNum !== tabValue
        ? `border-transparent content-topbar hover:bg-primary hover:content-primary`
        : 'border-primary text-primary',
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

  const handleToggleTabsOpen = (value: boolean) => {
    setTabsMenuOpen(value)
  }
  const handleTabClick = (value: number) => {
    setTabValue(value)
    setTabsMenuOpen(false)
  }

  const onDraggingChange = (value: boolean) => {
    setIsDragging(value)
  }

  useEffect(() => {
    if (!!props.targetContainerKey) {
      handleTabClick(0)
      const containerTitle = parseContainerTitle(props.targetContainerKey)
      setTitle(`Editing ${containerTitle}`)
    } else {
      setTitle('Widget Catalog')
    }
  }, [props.targetContainerKey])

  const tabs = useMemo((): TTabInfo[] => {
    const results: TTabInfo[] = [
      {
        id: 0,
        label: 'Widgets',
      },
      {
        id: 1,
        label: 'Charts',
      },
    ]

    if (!isTargetingContainer) {
      results.push({
        id: 2,
        label: 'Containers',
      })
      results.push({
        id: 3,
        label: 'CSS Settings',
        hideLabel: true,
        icon: <SettingsIcon />,
      })
    }

    return results
  }, [isTargetingContainer])

  const currentCategory = useMemo((): string => {
    return tabs.find((x) => x.id === tabValue)?.label || 'Category...'
  }, [tabValue])

  return (
    <DraggablePanel
      testId="dashboard-catalog-flyout"
      className="bg-body content-body bg-opacity-70 border-2 border-primary max-w-72 sm:max-w-90"
      zIndex={props.zIndex}
      style={{
        // width: '360px',
        // minWidth: '360px',
        // maxWidth: '360px',
        // minHeight: '360px',
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

          <div className="flex flex-row items-center gap-2">
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
        <div className="hidden sm:flex sm:flex-row sm:items-center sm:gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={getTabClassName(tab.id, tab.id === 3)}
              onClick={() => handleTabClick(tab.id)}
            >
              <span className={tab.hideLabel ? 'sr-only' : ''}>{tab.label}</span>
              {tab.icon}
            </button>
          ))}
        </div>
        {/* tabs mobile */}
        <div className="flex flex-col gap-1 sm:hidden">
          <Dropdown
            enabled={true}
            showChevron={true}
            isMenuOpen={isTabsMenuOpen}
            toggleOpen={handleToggleTabsOpen}
            icon={
              <div className="group flex items-center gap-2 text-primary group-hover:text-primary-inverse">
                <h5 className="py-2 font-bold">{currentCategory}</h5>
                <ChevronDownIcon className="shrink-0 ml-1 size-4" />
              </div>
            }
          >
            <div className="p-2 rounded-md border border-primary">
              <h6 className="font-semibold">Category:</h6>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  className={getMobileTabClassName(tab.id)}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => handleTabClick(tab.id)}
                >
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </Dropdown>
        </div>

        <div className="sm:mt-2 flex flex-col gap-1 w-full">
          <TextField
            label=""
            placeholder="Find..."
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
          {tabValue === 3 && <div className="hidden px-2 w-full sm:flex">{currentCategory}:</div>}
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
