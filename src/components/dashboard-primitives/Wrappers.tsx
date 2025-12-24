// file: src/components/dashboard-primitives/Wrappers.tsx
import { getDistinctCssClasses } from './use-distinct-css-classes'

type TProps = {
  children: React.ReactNode
  addCssClasses?: string
}

export function WrapperColumnContent({ children, addCssClasses }: TProps) {
  const className = getDistinctCssClasses(
    'w-full h-full flex-1 flex flex-col',
    (addCssClasses || 'gap-2 items-end justify-end content-end').trim(),
  )
  return (
    <div
      className={className}
      style={{
        minHeight: '140px',
      }}
    >
      {children}
    </div>
  )
}

export function WrapperColumnContentListItem({ children, addCssClasses }: TProps) {
  const className = getDistinctCssClasses(
    'w-full flex flex-col',
    (addCssClasses || 'items-end').trim(),
  )
  return <div className={className}>{children}</div>
}
