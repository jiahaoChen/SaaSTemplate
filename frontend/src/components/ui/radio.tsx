import { Radio as AntdRadio } from "antd"
import type { RadioProps as AntdRadioProps } from "antd"
import * as React from "react"

export interface RadioProps extends Omit<AntdRadioProps, 'children'> {
  rootRef?: React.Ref<HTMLDivElement>
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>
  children?: React.ReactNode
}

export const Radio = React.forwardRef<any, RadioProps>(
  function Radio(props, ref) {
    const { children, inputProps, rootRef, ...rest } = props
    
    return (
      <AntdRadio
        ref={ref}
        {...rest}
      >
        {children}
      </AntdRadio>
    )
  },
)

export const RadioGroup = AntdRadio.Group
