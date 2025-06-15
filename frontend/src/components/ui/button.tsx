import { Button as AntdButton } from "antd"
import type { ButtonProps as AntdButtonProps } from "antd"
import * as React from "react"

interface ButtonLoadingProps {
  loading?: boolean
  loadingText?: React.ReactNode
}

export interface ButtonProps extends Omit<AntdButtonProps, 'loading'>, ButtonLoadingProps {
  // Extend with any custom props if needed
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(props, ref) {
    const { loading, disabled, loadingText, children, ...rest } = props
    
    return (
      <AntdButton
        loading={loading}
        disabled={loading || disabled}
        ref={ref}
        {...rest}
      >
        {loading && loadingText ? loadingText : children}
      </AntdButton>
    )
  },
)
