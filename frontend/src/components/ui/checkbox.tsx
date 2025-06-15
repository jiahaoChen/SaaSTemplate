import { Checkbox as AntdCheckbox } from "antd"
import type { CheckboxProps as AntdCheckboxProps } from "antd"
import * as React from "react"

export interface CheckboxProps extends Omit<AntdCheckboxProps, 'children'> {
  icon?: React.ReactNode
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  rootRef?: React.Ref<HTMLLabelElement>
  children?: React.ReactNode
}

export const Checkbox = React.forwardRef<any, CheckboxProps>(
  function Checkbox(props, ref) {
    const { icon, children, inputProps, rootRef, ...rest } = props
    
    return (
      <AntdCheckbox
        ref={ref}
        {...rest}
      >
        {children}
      </AntdCheckbox>
    )
  },
)
