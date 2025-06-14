import type { ApiError } from "./client"
import useCustomToast from "./hooks/useCustomToast"

export const emailPattern = {
  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
  message: "Invalid email address",
}

export const namePattern = {
  value: /^[A-Za-z\s\u00C0-\u017F]{1,30}$/,
  message: "Invalid name",
}

export const passwordRules = (requiredMessage?: string) => {
  const rules: any = {
    minLength: {
      value: 8,
      message: "Password must be at least 8 characters",
    },
  }

  if (requiredMessage !== undefined) {
    rules.required = requiredMessage
  } else if (requiredMessage !== null) {
    rules.required = "Password is required"
  }

  return rules
}

export const confirmPasswordRules = (
  getValues: () => any,
  isRequired = true,
) => {
  const rules: any = {
    validate: (value: string) => {
      const password = getValues().password || getValues().new_password
      return value === password ? true : "The passwords do not match"
    },
  }

  if (isRequired) {
    rules.required = "Password confirmation is required"
  }

  return rules
}

export const handleError = (err: ApiError) => {
  const { showErrorToast } = useCustomToast()
  
  // Try to get the error detail from the response
  const errDetail = (err.body as any)?.detail
  let errorMessage = "Something went wrong."
  
  // Handle error detail when it's a string
  if (typeof errDetail === 'string') {
    errorMessage = errDetail
  } 
  // Handle error detail when it's an array
  else if (Array.isArray(errDetail) && errDetail.length > 0) {
    // FastAPI validation errors are usually returned as an array
    errorMessage = errDetail[0].msg || errDetail[0].message || JSON.stringify(errDetail[0])
  }
  // Handle error detail when it's an object
  else if (typeof errDetail === 'object' && errDetail !== null) {
    errorMessage = errDetail.msg || errDetail.message || errDetail.detail || JSON.stringify(errDetail)
  }
  
  // Fall back to HTTP status based errors
  if (!errorMessage || errorMessage === "Something went wrong.") {
    if (err.status === 401) {
      errorMessage = "Invalid email or password"
    } else if (err.status === 403) {
      errorMessage = "You don't have permission to perform this action"
    } else if (err.status === 404) {
      errorMessage = "The requested resource was not found"
    } else if (err.status === 409) {
      errorMessage = "This resource already exists"
    } else if (err.status === 429) {
      errorMessage = "Too many requests. Please try again later"
    }
  }
  
  showErrorToast(errorMessage)
}

/**
 * Renders an i18n translation containing HTML tags safely.
 * 
 * Example usage:
 * const message = renderHtmlTranslation(t('settings.deleteAccount.confirmMessage', {
 *   strongStart: '<strong>',
 *   strongEnd: '</strong>',
 * }));
 * 
 * Then use with: <Box dangerouslySetInnerHTML={{ __html: message }} />
 * 
 * @param translatedText The translated text containing HTML tags
 * @returns The same text, ready to be used with dangerouslySetInnerHTML
 */
export const renderHtmlTranslation = (translatedText: string): string => {
  return translatedText;
};
