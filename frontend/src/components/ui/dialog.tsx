import { Modal, Typography } from "antd"
import type { ModalProps } from "antd"
import * as React from "react"
import { CloseButton } from "./close-button"
import styled from 'styled-components'

const { Title, Paragraph } = Typography

const DialogHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const DialogBody = styled.div`
  margin-bottom: 16px;
`

const DialogFooter = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  margin-top: 16px;
`

interface DialogContentProps extends ModalProps {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  backdrop?: boolean
}

export const DialogContent = React.forwardRef<
  HTMLDivElement,
  DialogContentProps
>(function DialogContent(props, ref) {
  const {
    children,
    portalled = true,
    portalRef,
    backdrop = true,
    open,
    onCancel,
    ...rest
  } = props

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      closable={false}
      destroyOnClose
      {...rest}
    >
      <div ref={ref}>
        {children}
      </div>
    </Modal>
  )
})

interface DialogCloseTriggerProps {
  onClick?: () => void
  children?: React.ReactNode
}

export const DialogCloseTrigger = React.forwardRef<
  HTMLButtonElement,
  DialogCloseTriggerProps
>(function DialogCloseTrigger(props, ref) {
  return (
    <CloseButton 
      ref={ref}
      onClick={props.onClick}
      style={{ position: 'absolute', top: 8, right: 8 }}
    >
      {props.children}
    </CloseButton>
  )
})

// Simple wrapper for state management
interface DialogRootProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export const DialogRoot: React.FC<DialogRootProps> = ({ children, open, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(open || false)
  
  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])
  
  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen)
    onOpenChange?.(newOpen)
  }
  
  return (
    <div>
      {React.Children.map(children, child => 
        React.isValidElement(child) 
          ? React.cloneElement(child as React.ReactElement<any>, { 
              open: isOpen, 
              onCancel: () => handleOpenChange(false),
              onOpenChange: handleOpenChange 
            })
          : child
      )}
    </div>
  )
}

export { DialogHeader, DialogFooter, DialogBody }

// Simple title and description components
export const DialogTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Title level={4} style={{ margin: 0 }}>{children}</Title>
)

export const DialogDescription: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Paragraph style={{ margin: '8px 0 0 0', color: 'rgba(0, 0, 0, 0.65)' }}>{children}</Paragraph>
)

// Trigger components
export const DialogTrigger: React.FC<{ 
  children: React.ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => (
  <div onClick={onClick} style={{ display: 'inline-block' }}>
    {children}
  </div>
)

export const DialogActionTrigger: React.FC<{ 
  children: React.ReactNode
  onClick?: () => void
}> = ({ children, onClick }) => (
  <div onClick={onClick} style={{ display: 'inline-block' }}>
    {children}
  </div>
)

// Backdrop component (Modal handles this internally)
export const DialogBackdrop: React.FC = () => null
