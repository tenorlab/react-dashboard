import { CSSProperties, forwardRef, useRef } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'

type DraggablePanelProps = {
  testId?: string
  className: string
  style?: CSSProperties
  onDraggingChange?: (isDragging: boolean) => void
  children: React.ReactNode
}

// We keep forwardRef if consumers might still need a ref to the component's root,
// but for the Draggable logic, we use an internal ref.
export const DraggablePanel = forwardRef<HTMLDivElement, DraggablePanelProps>((props, _ref) => {
  // The styles needed to make it float
  const defaultFloatingStyles: React.CSSProperties = {
    // 1. Take it out of the document flow
    position: 'fixed',
    // 2. Set initial viewport position (e.g., top right)
    top: '6rem',
    right: '1rem',
    // 3. Ensure it stacks above other content
    zIndex: 1,

    // Add your layout/appearance styles
    width: '360px',
    minHeight: '360px',
    borderStyle: 'solid',
    borderWidth: '3px',
    boxShadow: 'rgba(0, 0, 0, 0.5) 7px 7px 10px 0px',
  }

  const mergedStyles = {
    ...defaultFloatingStyles,
    ...(props.style || {}),
  }

  const testId = props.testId || 'not-set'
  const className = props.className || 'panel'

  // 2. Create the internal ref for the draggable element
  const nodeRef = useRef<HTMLDivElement>(null)

  // 2. Handler to set isDragging to true when dragging starts
  const handleStart = (_e: DraggableEvent, _data: DraggableData) => {
    props.onDraggingChange?.(true) // Notify parent component if needed
  }

  // 3. Handler to set isDragging to false when dragging stops
  const handleStop = (_e: DraggableEvent, _data: DraggableData) => {
    // Use a small timeout to allow Tooltip to clear before re-enabling
    setTimeout(() => {
      props.onDraggingChange?.(false) // Notify parent component if needed
    }, 100)
  }

  return (
    // 3. Pass the internal ref to the Draggable component via 'nodeRef'
    <Draggable
      nodeRef={nodeRef}
      data-testid={testId}
      axis="both" // Allow dragging on both x and y axis
      handle=".handle" // Specify a handle element for dragging
      //defaultPosition={{ x: 0, y: 0 }} // Initial position
      //bounds="parent" // Confine dragging within the parent element
      onStart={handleStart}
      onStop={handleStop}
    >
      {/* 4. Attach the ref to the root DOM element you want to drag */}
      <div ref={nodeRef} className={className} style={mergedStyles}>
        {/* On the child component, have a h2 or element with "handle" class for the grabbing part, i.e. <div className="handle">Drag Me <GrabIcon /> </div> */}
        {props.children}
      </div>
    </Draggable>
  )
})
