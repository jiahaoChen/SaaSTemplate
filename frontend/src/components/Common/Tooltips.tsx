import { Tooltip as AntdTooltip } from "antd"
import type { TooltipProps as AntdTooltipProps } from "antd"
import * as React from "react"

export interface TooltipProps extends Omit<AntdTooltipProps, 'title'> {
  showArrow?: boolean
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  content: React.ReactNode
  disabled?: boolean
  children: React.ReactNode
}

export const Tooltip = React.forwardRef<HTMLDivElement, TooltipProps>(
  function Tooltip(props, ref) {
    const {
      showArrow = true,
      children,
      disabled,
      portalled = true,
      content,
      portalRef,
      ...rest
    } = props

    if (disabled) return <>{children}</>

    return (
      <AntdTooltip
        title={content}
        arrow={showArrow}
        getPopupContainer={portalRef?.current ? () => portalRef.current! : undefined}
        {...rest}
      >
        <div ref={ref}>{children}</div>
      </AntdTooltip>
    )
  },
)
