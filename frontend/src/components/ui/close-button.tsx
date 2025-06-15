import { Button } from "antd"
import type { ButtonProps } from "antd"
import * as React from "react"
import { LuX } from "react-icons/lu"

export interface CloseButtonProps extends Omit<ButtonProps, 'children'> {
  children?: React.ReactNode
}

export const CloseButton = React.forwardRef<
  HTMLButtonElement,
  CloseButtonProps
>(function CloseButton(props, ref) {
  const { children, ...rest } = props
  
  return (
    <Button 
      type="text" 
      size="small" 
      icon={children ?? <LuX />}
      aria-label="Close" 
      ref={ref} 
      {...rest}
    />
  )
})
