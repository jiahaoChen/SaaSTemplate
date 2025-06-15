import { Typography } from "antd"
import styled from 'styled-components'
import { useColorModeValue } from "./color-mode"
import { FiAlertCircle } from "react-icons/fi"

const { Text } = Typography

interface ErrorTheme {
  bg: string
  borderColor: string
  textColor: string
}

const ErrorContainer = styled.div<{ theme: ErrorTheme }>`
  margin-top: 16px;
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid;
  background-color: ${props => props.theme.bg};
  border-color: ${props => props.theme.borderColor};
  color: ${props => props.theme.textColor};
`

const ErrorIcon = styled(FiAlertCircle)`
  margin-right: 8px;
  font-size: 16px;
`

interface AuthErrorProps {
  error: any;
  message?: string;
  t?: (key: string) => string;
}

export function AuthError({ error, message, t }: AuthErrorProps) {
  const bgColor = useColorModeValue("rgba(255, 240, 240, 0.8)", "rgba(254, 178, 178, 0.16)")
  const textColor = useColorModeValue("#d32f2f", "#f48fb1")
  const borderColor = useColorModeValue("#ffcdd2", "#e57373")
  
  // If there's no error, don't render anything
  if (!error) return null
  
  // Get a readable error message
  const getErrorMessage = () => {
    if (message) return message
    
    if (typeof error === 'object') {
      // Handle API response with detail field
      if (error.response?.data?.detail) {
        // Check if the detail is a string
        if (typeof error.response.data.detail === 'string') {
          return error.response.data.detail
        }
        
        // Check if the detail has a specific message we can extract
        if (typeof error.response.data.detail === 'object') {
          if (error.response.data.detail.msg) return error.response.data.detail.msg
          if (error.response.data.detail.message) return error.response.data.detail.message
          if (error.response.data.detail.detail) return error.response.data.detail.detail
          // If it's an object but we can't extract a message field, stringify it
          return JSON.stringify(error.response.data.detail)
        }
      }
      
      // Handle specific HTTP status codes with translation if available
      if (error.response?.status === 401) 
        return t ? t('auth.invalidCredentials') : "Invalid email or password"
      if (error.response?.status === 409) 
        return t ? t('auth.emailExists') : "Email already exists"
      if (error.response?.status === 429) 
        return t ? t('auth.tooManyAttempts') : "Too many attempts. Please try again later"
    }
    
    // Default fallback message
    return t ? t('auth.generalError') : "An error occurred. Please try again"
  }
  
  const themeProps = {
    bg: bgColor,
    textColor: textColor,
    borderColor: borderColor
  }
  
  return (
    <ErrorContainer theme={themeProps}>
      <ErrorIcon />
      <Text style={{ fontWeight: 500, fontSize: '14px', color: textColor }}>
        {getErrorMessage()}
      </Text>
    </ErrorContainer>
  )
} 