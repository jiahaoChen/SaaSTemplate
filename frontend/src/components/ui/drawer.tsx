import { Drawer as AntdDrawer } from "antd"
import type { DrawerProps as AntdDrawerProps } from "antd"
import * as React from "react"
import { CloseButton } from "./close-button"

interface DrawerContentProps extends Omit<AntdDrawerProps, 'children'> {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  offset?: string | number
  children: React.ReactNode
}

export const DrawerContent = React.forwardRef<
  HTMLDivElement,
  DrawerContentProps
>(function DrawerContent(props, ref) {
  const { children, portalled = true, portalRef, offset, ...rest } = props
  return (
    <AntdDrawer
      getContainer={portalRef?.current || false}
      style={{ padding: offset }}
      {...rest}
    >
      <div ref={ref}>{children}</div>
    </AntdDrawer>
  )
})

interface DrawerCloseTriggerProps {
  onClick?: () => void
  children?: React.ReactNode
}

export const DrawerCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  DrawerCloseTriggerProps
>(function DrawerCloseTrigger(props, ref) {
  const { onClick, children, ...rest } = props
  return (
    <div
      style={{
        position: "absolute",
        top: "8px",
        right: "8px",
        zIndex: 1000
      }}
    >
      <CloseButton size="small" ref={ref} onClick={onClick} {...rest} />
    </div>
  )
})

// For compatibility, we'll create simple wrapper components
export const DrawerTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <div onClick={onClick}>{children}</div>
)

export const DrawerRoot: React.FC<{ children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ children }) => (
  <>{children}</>
)

export const DrawerFooter: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '16px 0 0 0', borderTop: '1px solid #f0f0f0' }}>
    {children}
  </div>
)

export const DrawerHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '0 0 16px 0', borderBottom: '1px solid #f0f0f0' }}>
    {children}
  </div>
)

export const DrawerBody: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ padding: '16px 0' }}>
    {children}
  </div>
)

export const DrawerBackdrop: React.FC<{ children?: React.ReactNode }> = ({ children }) => (
  <>{children}</>
)

export const DrawerDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ color: '#666', fontSize: '14px' }}>
    {children}
  </div>
)

export const DrawerTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
    {children}
  </h3>
)

export const DrawerActionTrigger: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <div onClick={onClick}>{children}</div>
)
