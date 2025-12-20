import { ReactNode, forwardRef } from 'react'
import { Stack, TStackProps } from './Stack'
import { getDistinctCssClasses } from './use-distinct-css-classes'

export const ListItem = forwardRef<HTMLDivElement, TStackProps & { innerClass?: string }>(
  (props, _ref) => {
    const { classNames, innerClass, ...rest } = props

    const cssClasses = getDistinctCssClasses(classNames || '', 'w-full')

    const innerWrapperCss = getDistinctCssClasses(
      `w-full flex overflow-hidden justify-between items-center gap-0 
      rounded-md border`,
      innerClass || '',
    )

    return (
      <Stack direction="row" classNames={cssClasses} {...rest}>
        <div className={innerWrapperCss}>{props.children}</div>
      </Stack>
    )
  },
)

// child items
type TListItemChildProps = {
  testId?: string
  className?: string
  children?: ReactNode
}

export const ListItemLeftChild = forwardRef<HTMLDivElement, TListItemChildProps>((props, _ref) => {
  return (
    <div
      data-testid={props.testId || 'not-set'}
      className="flex items-center justify-center"
      style={{
        flexShrink: 0,
        padding: '0.75rem 0 0.75rem 0.75rem',
      }}
    >
      {props.children}
    </div>
  )
})

export const ListItemMiddleChild = forwardRef<HTMLDivElement, TListItemChildProps>(
  (props, _ref) => {
    return (
      <div
        data-testid={props.testId || 'not-set'}
        className="flex-1 flex flex-col gap-0 truncate p-2"
      >
        {props.children}
      </div>
    )
  },
)

export const ListItemRightChild = forwardRef<HTMLDivElement, TListItemChildProps>((props, _ref) => {
  return (
    <div
      data-testid={props.testId || 'not-set'}
      className="flex flex-row items-center justify-between gap-1 h-full"
      style={{
        flexShrink: 0,
        paddingRight: '0.65rem',
      }}
    >
      {props.children}
    </div>
  )
})
