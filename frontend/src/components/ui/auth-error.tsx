import { Flex, Text } from "@chakra-ui/react"
import { useColorModeValue } from "./color-mode"
import { FiAlertCircle } from "react-icons/fi"

interface AuthErrorProps {
  error: any;
  message?: string;
  t?: (key: string) => string;
}

export function AuthError({ error, message, t }: AuthErrorProps) {
  const bgColor = useColorModeValue("red.50", "rgba(254, 178, 178, 0.16)")
  const textColor = useColorModeValue("red.600", "red.300")
  const borderColor = useColorModeValue("red.200", "red.500")
  
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
  
  return (
    <Flex 
      mt={4} 
      p={3}
      borderRadius="md"
      bg={bgColor}
      borderWidth="1px"
      borderColor={borderColor}
      color={textColor}
      alignItems="center"
    >
      <FiAlertCircle size="16px" style={{ marginRight: '8px' }} />
      <Text fontWeight="medium" fontSize="sm">
        {getErrorMessage()}
      </Text>
    </Flex>
  )
} 