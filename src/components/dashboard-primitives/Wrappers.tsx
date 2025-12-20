// file: src/components/dashboard-primitives/Wrappers.tsx
export function WrapperColumnContent({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="w-full h-full flex-1 flex flex-col gap-2 items-end justify-end content-end"
      style={{
        minHeight: '140px',
      }}
    >
      {children}
    </div>
  )
}

export function WrapperColumnContentListItem({ children }: { children: React.ReactNode }) {
  return <div className="w-full flex flex-col items-end">{children}</div>
}
