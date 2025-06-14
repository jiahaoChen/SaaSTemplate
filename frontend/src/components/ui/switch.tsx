import { Box } from "@chakra-ui/react"
import { forwardRef } from "react"

export interface SwitchProps {
  rootRef?: React.Ref<HTMLLabelElement>
  [key: string]: any
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  function Switch(props, _ref) {
    const { rootRef, ...rest } = props
    // Fallback implementation using a simple checkbox styled as switch
    return (
      <Box as="label" ref={rootRef}>
        <input 
          type="checkbox" 
          style={{
            appearance: 'none',
            width: '48px',
            height: '24px',
            backgroundColor: '#ccc',
            borderRadius: '12px',
            position: 'relative',
            cursor: 'pointer',
            outline: 'none',
            transition: 'background-color 0.2s'
          }}
          {...rest} 
        />
      </Box>
    )
  },
) 