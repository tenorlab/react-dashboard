import { getDistinctCssClasses } from './use-distinct-css-classes'
import type { IButtonProps } from './interfaces'

const cssStrategy = new Map<string, string>([
  [
    'normal',
    `group bg-[category] content-[category] hover:bg-[category] group-hover:bg-[category] focus:outline-[category] focus:outline-offset-[category]`,
  ],
  [
    'ghost',
    `group bg-transparent border-[category] text-[category] hover:text-[category] group-hover:text-[category] focus:outline-[category] focus:outline-offset-[category]`,
  ],
])

export function Button(props: IButtonProps) {
  const {
    tooltip,
    disabled,
    isIconButton: isIconButton_,
    className: className_,
    buttonType: buttonType_,
    category: category_,
    px: px_,
    py: py_,
    children,
    ...rest
  } = props

  const cssClass = () => {
    const isIconButton = props.isIconButton || false
    const category = props.category || 'primary'
    const buttonType = props.buttonType || 'normal'
    const disabled = props.disabled || false
    const className = props.className || ''
    const font = props.font || 'semibold'
    const border = Number((props.border || 0) > 0 ? props.border : 0)
    let borderColor = (props.borderColor || '').trim()
    borderColor = borderColor.length > 0 ? borderColor : ''
    const borderHover = Number((props.borderHover || 0) > 0 ? props.borderHover : 0)
    const shadow = props.shadow || 'sm'
    const shadowHover = props.shadowHover || 'md'
    const addCss = (props.addCss || '').trim()
    const justifyCss = props.justifyCss || 'justify-center'

    if (isIconButton) {
      return getDistinctCssClasses(
        `flex flex-row items-center`,
        disabled ? 'text-disabled' : `text-${category} hover:brightness-110 cursor-pointer`,
        className || '',
      )
    }
    const result = [
      'relative cursor-pointer',
      'rounded-sm focus:outline-none focus:ring focus:ring-offset',
      `transition-all duration-150`,
      `text-sm`,
      `font-${font}`,
    ]

    if (disabled) {
      // these are the button CSS classes when disabled
      //result.push('bg-disabled content-disabled border-disabled opacity-50 cursor-not-allowed')
      if (buttonType === 'ghost') {
        result.push('text-disabled border-disabled cursor-not-allowed')
      } else {
        result.push('bg-disabled content-disabled border-disabled cursor-not-allowed')
      }
    } else {
      result.push('cursor-pointer')
      // these are the button CSS classes when enabled
      let template = ''
      if (cssStrategy.has(buttonType)) {
        template = `${cssStrategy.get(buttonType)}`
      } else {
        template = `${cssStrategy.get('normal')}`
      }

      if (border < 1) {
        template = template.replace('border-[category]', '')
      }

      const mainCss = template.replace(/\[category\]/g, category).trim()
      result.push(mainCss)
    }

    // by default we have a border that is transparent so always add with at least 1px

    if (border > 0) {
      result.push(`border-[${border}px]`)
      result.push(`border-${borderColor}`)
    } else {
      result.push(`border-[1px]`)
      result.push(`border-transparent`)
    }

    if (borderHover > 0) {
      result.push(`hover:border-[${borderHover}px] group-hover:border-[${borderHover}px]`)
      // apply color
      result.push(`hover:border-${borderColor} group-hover:border-${borderColor}`)
    } else {
      result.push(`hover:border-[1px] group-hover:border-[1px]`)
    }

    if (shadow) {
      result.push(`shadow-${shadow}`)
    }
    if (shadowHover) {
      result.push(`hover:shadow-${shadowHover} group-hover:shadow-${shadowHover}`)
    }

    // addCss will have additional CSS classes
    // we want to apply from where we consume this component
    if (addCss.length > 0) {
      result.push(addCss)
    }
    if (addCss.indexOf('hidden') === -1) {
      result.push('inline-flex')
    }

    result.push(justifyCss)
    return result.join(' ').trim()
  }

  const style = () => {
    const px = props.px || 0.7
    const py = props.py || 0.25
    return {
      padding: isIconButton_ ? 0 : `${py}rem ${px}rem `,
    }
  }

  return (
    <button type="button" disabled={disabled} className={cssClass()} style={style()} {...rest}>
      {children}
    </button>
  )
}
