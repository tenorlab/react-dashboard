export function SvgBaseWrapper({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {children}
    </svg>
  )
}

type TIconProps = {
  className?: string
}

export function AddIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-circle-plus-icon lucide-circle-plus ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </SvgBaseWrapper>
  )
}

export function DeleteIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-trash2-icon lucide-trash-2 ${className}`}>
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M3 6h18" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </SvgBaseWrapper>
  )
}

export function EditIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-square-pen-icon lucide-square-pen ${className}`}>
      <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" />
    </SvgBaseWrapper>
  )
}

export function GridIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-grid3x3-icon lucide-grid-3x3 ${className}`}>
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M3 15h18" />
      <path d="M9 3v18" />
      <path d="M15 3v18" />
    </SvgBaseWrapper>
  )
}

export function MonitorIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-monitor-icon lucide-monitor ${className}`}>
      <rect width="20" height="14" x="2" y="3" rx="2" />
      <line x1="8" x2="16" y1="21" y2="21" />
      <line x1="12" x2="12" y1="17" y2="21" />
    </SvgBaseWrapper>
  )
}

export function MonitorSmartphoneIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper
      className={`lucide lucide-monitor-smartphone-icon lucide-monitor-smartphone ${className}`}
    >
      <path d="M18 8V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h8" />
      <path d="M10 19v-3.96 3.15" />
      <path d="M7 19h5" />
      <rect width="6" height="10" x="16" y="12" rx="2" />
    </SvgBaseWrapper>
  )
}

export function MoveLeftIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper
      className={`lucide lucide-circle-arrow-left-icon lucide-circle-arrow-left ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 8-4 4 4 4" />
      <path d="M16 12H8" />
    </SvgBaseWrapper>
  )
}

export function MoveRightIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper
      className={`lucide lucide-circle-arrow-right-icon lucide-circle-arrow-right ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m12 16 4-4-4-4" />
      <path d="M8 12h8" />
    </SvgBaseWrapper>
  )
}

export function SettingsIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-settings-icon lucide-settings ${className}`}>
      <path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" />
      <circle cx="12" cy="12" r="3" />
    </SvgBaseWrapper>
  )
}

export function TabletSmartphoneIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper
      className={`lucide lucide-tablet-smartphone-icon lucide-tablet-smartphone ${className}`}
    >
      <rect width="10" height="14" x="3" y="8" rx="2" />
      <path d="M5 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2h-2.4" />
      <path d="M8 18h.01" />
    </SvgBaseWrapper>
  )
}

export function XCircleIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-circle-x-icon lucide-circle-x ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </SvgBaseWrapper>
  )
}

export function ZoomInIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-zoom-in-icon lucide-zoom-in ${className}`}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="11" x2="11" y1="8" y2="14" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </SvgBaseWrapper>
  )
}

export function ZoomOutIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-zoom-out-icon lucide-zoom-out ${className}`}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" x2="16.65" y1="21" y2="16.65" />
      <line x1="8" x2="14" y1="11" y2="11" />
    </SvgBaseWrapper>
  )
}

export function TimerResetIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-timer-reset-icon lucide-timer-reset ${className}`}>
      <path d="M10 2h4" />
      <path d="M12 14v-4" />
      <path d="M4 13a8 8 0 0 1 8-7 8 8 0 1 1-5.3 14L4 17.6" />
      <path d="M9 17H4v5" />
    </SvgBaseWrapper>
  )
}

export function UndoIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-undo-icon lucide-undo ${className}`}>
      <path d="M3 7v6h6" />
      <path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13" />
    </SvgBaseWrapper>
  )
}

export function RedoIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-redo-icon lucide-redo ${className}`}>
      <path d="M21 7v6h-6" />
      <path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7" />
    </SvgBaseWrapper>
  )
}

export function HandIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-hand-icon lucide-hand ${className}`}>
      <path d="M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </SvgBaseWrapper>
  )
}

export function HandGrabIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-hand-grab-icon lucide-hand-grab ${className}`}>
      <path d="M18 11.5V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v1.4" />
      <path d="M14 10V8a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" />
      <path d="M10 9.9V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2v5" />
      <path d="M6 14a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
      <path d="M18 11a2 2 0 1 1 4 0v3a8 8 0 0 1-8 8h-4a8 8 0 0 1-8-8 2 2 0 1 1 4 0" />
    </SvgBaseWrapper>
  )
}

export function CrosshairIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-crosshair-icon lucide-crosshair ${className}`}>
      <line x1="22" x2="18" y1="12" y2="12" />
      <line x1="6" x2="2" y1="12" y2="12" />
      <line x1="12" x2="12" y1="6" y2="2" />
      <line x1="12" x2="12" y1="22" y2="18" />
    </SvgBaseWrapper>
  )
}

export function TargetIcon({ className }: TIconProps) {
  return (
    <SvgBaseWrapper className={`lucide lucide-target-icon lucide-target ${className}`}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </SvgBaseWrapper>
  )
}

export function CircleQuestionMark({ className }: TIconProps) {
  return (
    <SvgBaseWrapper
      className={`lucide lucide-file-question-mark-icon lucide-file-question-mark ${className}`}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </SvgBaseWrapper>
  )
}
