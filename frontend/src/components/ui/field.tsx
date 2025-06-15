import * as React from "react"
import styled from 'styled-components'

const FieldRoot = styled.div`
  margin-bottom: 16px;
`

const FieldLabel = styled.label`
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
  
  .dark & {
    color: rgba(255, 255, 255, 0.85);
  }
`

const RequiredIndicator = styled.span`
  color: #ff4d4f;
  margin-left: 4px;
  
  &::before {
    content: '*';
  }
`

const OptionalText = styled.span`
  color: rgba(0, 0, 0, 0.45);
  font-weight: normal;
  margin-left: 4px;
  
  .dark & {
    color: rgba(255, 255, 255, 0.45);
  }
`

const HelperText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  
  .dark & {
    color: rgba(255, 255, 255, 0.45);
  }
`

const ErrorText = styled.div`
  margin-top: 4px;
  font-size: 12px;
  color: #ff4d4f;
`

export interface FieldProps extends React.HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode
  helperText?: React.ReactNode
  errorText?: React.ReactNode
  optionalText?: React.ReactNode
  required?: boolean
}

export const Field = React.forwardRef<HTMLDivElement, FieldProps>(
  function Field(props, ref) {
    const { label, children, helperText, errorText, optionalText, required, ...rest } = props
    
    return (
      <FieldRoot ref={ref} {...rest}>
        {label && (
          <FieldLabel>
            {label}
            {required && <RequiredIndicator />}
            {!required && optionalText && <OptionalText>({optionalText})</OptionalText>}
          </FieldLabel>
        )}
        {children}
        {helperText && !errorText && <HelperText>{helperText}</HelperText>}
        {errorText && <ErrorText>{errorText}</ErrorText>}
      </FieldRoot>
    )
  },
)
