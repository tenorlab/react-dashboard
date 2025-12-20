import { CSSProperties } from 'react'
import { getDistinctCssClasses } from './use-distinct-css-classes'

export type TStackProps = {
  testId?: string
  classNames?: string
  direction?: 'row' | 'column'
  style?: CSSProperties
  children: React.ReactNode
}

const getCssClasses = (props: TStackProps) => {
  if (props.direction === 'row') {
    return getDistinctCssClasses(`flex flex-row items-center gap-2`, props.classNames || '')
  }
  return getDistinctCssClasses(`flex flex-col gap-2 w-full`, props.classNames || '')
}

export function Stack(props: TStackProps) {
  const { children, testId, classNames: _0, direction: _1, ...rest } = props

  // distinct css classes
  const cssClasses = getCssClasses(props)

  return (
    <div data-testid={testId || 'not-set'} className={cssClasses} {...rest}>
      {children}
    </div>
  )
}
