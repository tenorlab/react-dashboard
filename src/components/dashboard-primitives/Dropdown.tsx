import React, { useRef, useMemo, useEffect, useState } from 'react'
import { ChevronDownIcon } from './icons'
import type { ReactNode } from 'react'

interface TProps {
  testid?: string
  label?: string
  hideLabel?: boolean
  showChevron?: boolean
  hide?: boolean
  enabled: boolean
  isMenuOpen: boolean
  toggleOpen: (open: boolean) => void
  icon?: ReactNode
  children?: ReactNode
}

export const Dropdown: React.FC<TProps> = ({
  testid = 'not-set',
  label = '',
  hideLabel = false,
  showChevron = false,
  hide = false,
  enabled,
  isMenuOpen,
  toggleOpen,
  icon,
  children,
}) => {
  const refDropdown = useRef<HTMLDivElement>(null)

  // We use a local state to handle the "mount" status so the
  // transition has time to play before the element is removed.
  const [shouldRender, setShouldRender] = useState(isMenuOpen)

  useEffect(() => {
    if (isMenuOpen) setShouldRender(true)
  }, [isMenuOpen])

  const handleTransitionEnd = () => {
    if (!isMenuOpen) setShouldRender(false)
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (refDropdown.current && !refDropdown.current.contains(event.target as Node)) {
        toggleOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [toggleOpen])

  const buttonCss = useMemo(
    () =>
      `
    group max-w-xs p-1 sm:p-2 rounded-full flex items-center text-sm 
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary 
    content-topbar ${enabled ? 'hover:text-primary cursor-pointer' : 'opacity-50'}
  `.trim(),
    [enabled],
  )

  const popupContainerCss = `
    absolute flex flex-col right-0 z-50 mt-2 w-56 origin-top-right
    rounded-md shadow-md ring-1 ring-black ring-opacity-5 focus:outline-none
    bg-formfield content-formfield transition transform duration-100
    ${isMenuOpen ? 'ease-out opacity-100 scale-100' : 'ease-in opacity-0 scale-95 pointer-events-none'}
  `.trim()

  if (hide) return null

  return (
    <div ref={refDropdown} className="relative inline-block text-left" data-testid={testid}>
      <button
        type="button"
        className={buttonCss}
        onClick={(e) => {
          e.stopPropagation()
          toggleOpen(!isMenuOpen)
        }}
      >
        {icon}
        <span className={hideLabel ? 'sr-only' : 'hidden ml-3 text-sm font-medium lg:block'}>
          {label}
        </span>
        {showChevron && <ChevronDownIcon className="hidden shrink-0 ml-1 size-4 lg:block" />}
      </button>

      {/* Render if open OR if the closing animation is still running */}
      {(isMenuOpen || shouldRender) && (
        <div
          className={popupContainerCss}
          onTransitionEnd={handleTransitionEnd}
          role="menu"
          tabIndex={-1}
        >
          <div className="form-dropdown-menu overflow-clip flex flex-col grow rounded-md justify-center w-full h-full bg-sidebar content-sidebar bg-opacity-95 p-0">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
