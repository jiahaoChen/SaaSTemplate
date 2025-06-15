import { Switch as AntdSwitch } from "antd"
import type { SwitchProps as AntdSwitchProps } from "antd"
import { forwardRef } from "react"

export interface SwitchProps extends AntdSwitchProps {
  rootRef?: React.Ref<HTMLLabelElement>
}

export const Switch = forwardRef<any, SwitchProps>(
  function Switch(props, ref) {
    const { rootRef, ...rest } = props
    
    return (
      <AntdSwitch 
        ref={ref}
        {...rest} 
      />
    )
  },
) 