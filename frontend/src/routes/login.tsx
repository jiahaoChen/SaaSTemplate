import { Typography } from "antd"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
  // useNavigate,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import styled from "styled-components"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { emailPattern, passwordRules } from "../utils"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AuthError } from "@/components/ui/auth-error"
import useAnalytics from "@/hooks/useAnalytics"
// import { LoginService } from "@/client"

const PageContainer = styled.div<{ bg?: string }>`
  min-height: 100vh;
  padding: 48px 16px;
  background: ${props => props.bg || '#f5f5f5'};
`

const FormContainer = styled.form<{ 
  maxW?: string
  bg?: string
  borderColor?: string
}>`
  max-width: ${props => props.maxW || '450px'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  padding: 40px;
  border-radius: 10px;
  background: ${props => props.bg || 'white'};
  border: 1px solid ${props => props.borderColor || '#e0e0e0'};
  margin: 0 auto;
`

const FlexContainer = styled.div<{
  direction?: string
  justify?: string
  align?: string
  mb?: number
  gap?: number
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  justify-content: ${props => props.justify || 'flex-start'};
  align-items: ${props => props.align || 'stretch'};
  margin-bottom: ${props => props.mb ? `${props.mb * 4}px` : '0'};
  gap: ${props => props.gap ? `${props.gap * 4}px` : '0'};
`

const LogoContainer = styled.div`
  margin-right: 8px;
`

const StyledHeading = styled(Typography.Title)<{ color?: string; mb?: number }>`
  color: ${props => props.color} !important;
  margin-bottom: ${props => props.mb ? `${props.mb * 4}px` : '0'} !important;
`

const StyledText = styled(Typography.Text)<{ 
  color?: string
  fontWeight?: string | number
  mb?: number
}>`
  color: ${props => props.color} !important;
  font-weight: ${props => props.fontWeight || 'normal'} !important;
  margin-bottom: ${props => props.mb ? `${props.mb * 4}px` : '0'};
  display: block;
`

const StackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FieldContainer = styled.div``

const PasswordFieldContainer = styled.div``

const StyledInput = styled.input<{
  borderRadius?: string
  borderColor?: string
  color?: string
}>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid ${props => props.borderColor || '#d9d9d9'};
  border-radius: ${props => props.borderRadius || '6px'};
  font-size: 14px;
  color: ${props => props.color || 'inherit'};
  transition: all 0.3s;
  
  &:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
    outline: none;
  }
  
  &::placeholder {
    color: ${props => props.color ? `${props.color}66` : '#999'};
  }
`

const CenteredContainer = styled.div`
  text-align: center;
`

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { loginMutation, error: authError, resetError } = useAuth()
  const [apiError, setApiError] = useState<any>(null)
  const { t } = useTranslation()
  const { trackLogin } = useAnalytics()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })
  // const navigate = useNavigate()

  // const mutation = useMutation({
  //   mutationFn: (data: AccessToken) => LoginService.loginAccessToken({ formData: data }),
  //   onSuccess: (data) => {
  //     console.log("Login successful:", data);
  //     navigate({ to: "/" });
  //   },
  //   onError: (error) => {
  //     console.error("Login failed:", error);
  //   },
  // })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()
    setApiError(null)

    try {
      await loginMutation.mutateAsync(data)
      trackLogin('email') // Track successful login
    } catch (err: any) {
      console.error("Login error details:", err)
      setApiError(err)
    }
  }

  // Colors with dark mode support
  const primaryColor = "#7856ff"
  // const primaryDarkColor = "#6040e0"
  
  // Dynamic colors for dark mode
  const bgColor = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.500", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  
  return (
    <PageContainer bg={useColorModeValue("gray.50", "gray.900")}>
      <FormContainer 
        onSubmit={handleSubmit(onSubmit)}
        maxW="450px"
        bg={bgColor}
        borderColor={borderColor}
      >
        <FlexContainer justify="flex-end" mb={6} gap={2}>
          <ColorModeButton />
          <LanguageSwitcher />
        </FlexContainer>
        
        <FlexContainer direction="column" align="center" mb={8}>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <FlexContainer align="center" mb={6}>
              <LogoContainer>
                <img 
                  src="/assets/images/logo1.png" 
                  alt="SaaS Template Logo"
                  width="32"
                  height="32"
                  style={{ display: 'inline-block' }}
                />
              </LogoContainer>
              <StyledHeading level={2} color={textColor}>
                SaaS Template
              </StyledHeading>
            </FlexContainer>
          </RouterLink>
          <StyledHeading level={1} color={textColor} mb={2}>
            {t('auth.login')}
          </StyledHeading>
          <StyledText color={mutedTextColor}>
            {t('auth.welcomeBack')}
          </StyledText>
        </FlexContainer>

        <StackContainer>
          <FieldContainer>
            <StyledText fontWeight="500" mb={2} color={textColor}>
              {t('auth.email')}
            </StyledText>
            <Field
              errorText={errors.username?.message || !!apiError || !!authError}
            >
              <InputGroup startElement={<FiMail color={useColorModeValue("gray.500", "gray.400")} />}>
                <StyledInput
                  id="username"
                  {...register("username", {
                    required: t('validation.emailRequired'),
                    pattern: emailPattern,
                  })}
                  placeholder={t('auth.email')}
                  type="email"
                  borderRadius="10px"
                  borderColor={borderColor}
                  color={textColor}
                />
              </InputGroup>
            </Field>
          </FieldContainer>

          <PasswordFieldContainer>
            <FlexContainer justify="space-between" mb={2}>
              <StyledText fontWeight="500" color={textColor}>{t('auth.password')}</StyledText>
              <RouterLink to="/recover-password" style={{ color: primaryColor, textDecoration: 'none', fontSize: '0.9rem' }}>
                {t('auth.forgotPassword')}
              </RouterLink>
            </FlexContainer>
            <PasswordInput
              type="password"
              startElement={<FiLock color={useColorModeValue("gray.500", "gray.400")} />}
              {...register("password", passwordRules(t('validation.passwordRequired')))}
              placeholder={t('auth.password')}
              errors={errors}
            />
          </PasswordFieldContainer>

          {/* <Checkbox color={primaryColor}>
            {t('auth.rememberMe')}
          </Checkbox> */}

          <Button 
            htmlType="submit" 
            loading={isSubmitting} 
            size="large"
            style={{
              background: primaryColor,
              borderColor: primaryColor,
              color: 'white',
              borderRadius: '10px',
              height: '45px',
              fontSize: '14px',
              width: '100%'
            }}
          >
            {t('auth.login')}
          </Button>
        </StackContainer>

        <AuthError error={apiError || authError} t={t} />

        {/* Social login buttons removed for simplicity */}

        <CenteredContainer>
          <StyledText color={mutedTextColor}>
            {t('auth.doNotHaveAccount')}{" "}
            <RouterLink to="/signup" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 'bold' }}>
              {t('auth.signup')}
            </RouterLink>
          </StyledText>
        </CenteredContainer>
      </FormContainer>
    </PageContainer>
  )
}

export default Login
