import React, { useMemo } from 'react'
import { ITextFieldProps } from './interfaces'
import { getDistinctCssClasses } from './use-distinct-css-classes'

/**
 * A reusable, styled TextField component built with Tailwind CSS.
 */
export const TextField: React.FC<ITextFieldProps> = ({
  label,
  className,
  size = 'medium',
  value,
  onChange,
  onKeyDown,
  placeholder = '',
}) => {
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'small':
        // Smaller padding and text size
        return 'py-1.5 px-3 text-sm'
      case 'medium':
      default:
        // Default padding and text size
        return 'py-2.5 px-4 text-base'
    }
  }, [size])

  const cssClasses = getDistinctCssClasses(`flex flex-col mb-4`, className || '')

  // Base input styles
  // const inputBaseClasses =
  //   'border border-field rounded-sm ' +
  //   'focus:ring-4 focus:ring-primary focus:border-primary ' +
  //   'transition-all duration-200 ease-in-out ' +
  //   'shadow-sm hover:shadow-md'
  const inputBaseClasses = getDistinctCssClasses(`
    block w-full rounded-md px-3 py-1.5 text-base 
    bg-formfield content-formfield
    outline-1 -outline-offset-1 outline-primary 
    placeholder:text-disabled 
    focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-200 sm:text-sm/6
  `)

  // Combine all classes for the input element
  const inputClasses = `${inputBaseClasses} ${sizeClasses}`

  return (
    <div className={cssClasses}>
      <label htmlFor={label} className="block text-sm/6 font-medium mb-1.5">
        {label}
      </label>
      <input
        id={label}
        type="text"
        value={value}
        onChange={onChange}
        onKeyDown={(ev) => onKeyDown && onKeyDown(ev)}
        placeholder={placeholder}
        className={inputClasses}
        aria-label={label}
      />
    </div>
  )
}
