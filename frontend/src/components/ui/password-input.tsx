"use client"

import { Input } from "antd"
import type { InputRef } from "antd"
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons"
import { forwardRef } from "react"
import styled from 'styled-components'
import { Field } from "./field"

const StyledPasswordInput = styled(Input.Password)`
  height: 40px;
  border-radius: 6px;
`

const PasswordContainer = styled.div`
  width: 100%;
`

export interface PasswordVisibilityProps {
  defaultVisible?: boolean
  visible?: boolean
  onVisibleChange?: (visible: boolean) => void
  visibilityIcon?: { on: React.ReactNode; off: React.ReactNode }
}

export interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof Input.Password>, 'type'> {
  rootProps?: React.HTMLAttributes<HTMLDivElement>
  startElement?: React.ReactNode
  type: string
  errors: any
}

export const PasswordInput = forwardRef<InputRef, PasswordInputProps>(
  function PasswordInput(props, ref) {
    const {
      rootProps,
      startElement,
      type,
      errors,
      ...rest
    } = props

    const iconRender = (visible: boolean) => (
      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
    )

    return (
      <Field
        errorText={errors[type]?.message}
      >
        <PasswordContainer {...rootProps}>
          <StyledPasswordInput
            {...rest}
            ref={ref}
            iconRender={iconRender}
            prefix={startElement}
          />
        </PasswordContainer>
      </Field>
    )
  },
)

// Remove the PasswordStrengthMeter for now as it's complex and not immediately needed
// It can be added back later if required
