export interface ITooltipProps {
  placement: string
  title: string
}

export type TButtonType = 'normal' | 'ghost'
export type TButtonJustifyCss = 'justify-start' | 'justify-center' | 'justify-end'

export interface IButtonProps {
  disabled?: boolean
  className?: string
  tooltip?: ITooltipProps
  isIconButton?: boolean

  buttonType?: TButtonType // the button type (normal, ghost, etc
  category?: string // the button type (primary, secondary, danger etc)
  font?: string // bold etc
  border?: number
  borderHover?: number
  borderColor?: string
  px?: number // 0.4 etc (rem)
  py?: number // 0.4 etc (rem)
  justifyCss?: TButtonJustifyCss
  shadow?: string
  shadowHover?: string
  addCss?: string
  onClick: () => any
  children: React.ReactNode
}

export interface ITooltipProps {
  placement: string
  title: string
}

export interface IButtonProps {
  disabled?: boolean
  className?: string
  tooltip?: ITooltipProps
}

// Define the size types
type TSize = 'small' | 'medium'

export interface ITextFieldProps {
  /* The label displayed above the input field. */
  label: string
  /* Controls the size and padding of the input. */
  size?: TSize
  /* The current value of the input */
  value: string
  /* Custom classes for the outer wrapper. */
  className?: string
  /* Optional placeholder text for the input. */
  placeholder?: string
  /* Handler for the input change event. */
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void
}
