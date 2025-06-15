import {
  Link as RouterLink,
  createFileRoute,
  redirect,
  useNavigate,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiUser, FiMail } from "react-icons/fi"
import { useMutation } from "@tanstack/react-query"
import { UsersService } from "@/client"
import { useTranslation } from "react-i18next"
import { useState } from "react"
import { Input } from "antd"
import styled from "styled-components"

import type { UserRegister } from "@/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import { emailPattern, passwordRules, confirmPasswordRules } from "@/utils"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AuthError } from "@/components/ui/auth-error"
import useAnalytics from "@/hooks/useAnalytics"

// Styled components
const PageContainer = styled.div<{ bg?: string }>`
  min-height: 100vh;
  padding: 48px 16px;
  background: ${props => props.bg || '#f9fafb'};
`

const FormContainer = styled.form<{
  maxW?: string
  bg?: string
  borderColor?: string
}>`
  max-width: ${props => props.maxW || '450px'};
  margin: 0 auto;
  padding: 40px;
  border-radius: 10px;
  background: ${props => props.bg || 'white'};
  border: 1px solid ${props => props.borderColor || '#e5e7eb'};
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`

const FlexContainer = styled.div<{
  direction?: string
  align?: string
  justify?: string
  mb?: number
  gap?: number
}>`
  display: flex;
  flex-direction: ${props => props.direction || 'row'};
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  margin-bottom: ${props => props.mb ? `${props.mb * 8}px` : '0'};
  gap: ${props => props.gap ? `${props.gap * 8}px` : '0'};
`

const LogoContainer = styled.div`
  margin-right: 8px;
`

const StyledHeading = styled.h1<{
  level?: number
  fontSize?: string
  fontWeight?: string
  mb?: number
  color?: string
}>`
  font-size: ${props => props.fontSize || (props.level === 1 ? '1.8rem' : '1.5rem')};
  font-weight: ${props => props.fontWeight || '700'};
  margin: 0;
  margin-bottom: ${props => props.mb ? `${props.mb * 8}px` : '0'};
  color: ${props => props.color || 'inherit'};
`

const StyledText = styled.span<{
  fontWeight?: string
  mb?: number
  color?: string
  fontSize?: string
  textAlign?: string
}>`
  font-weight: ${props => props.fontWeight || 'normal'};
  margin-bottom: ${props => props.mb ? `${props.mb * 8}px` : '0'};
  color: ${props => props.color || 'inherit'};
  font-size: ${props => props.fontSize || 'inherit'};
  text-align: ${props => props.textAlign || 'inherit'};
  display: ${props => props.mb || props.textAlign ? 'block' : 'inline'};
`

const StackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FieldContainer = styled.div``

const CheckboxContainer = styled.div`
  margin-bottom: 8px;
`

const CenteredContainer = styled.div`
  text-align: center;
`

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  const { t } = useTranslation()
  const { trackSignUp } = useAnalytics()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })
  const navigate = useNavigate()
  
  // Update to store detailed error information
  const [signupError, setSignupError] = useState<any>(null)

  const mutation = useMutation({
    mutationFn: (data: UserRegisterForm) => UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      trackSignUp('email') // Track successful signup
      navigate({ to: "/login" })
    },
    onError: (error: any) => {
      console.error("Registration failed:", error)
      setSignupError(error)
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    setSignupError(null) // Clear previous errors
    mutation.mutate(data)
  }

  // Colors with dark mode support
  const primaryColor = "#7856ff"
  const primaryDarkColor = "#6040e0"
  
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
              <StyledHeading level={2} fontSize="1.5rem" fontWeight="700" color={textColor}>
                SaaS Template
              </StyledHeading>
            </FlexContainer>
          </RouterLink>
          <StyledHeading level={1} fontSize="1.8rem" mb={2} color={textColor}>
            {t('auth.createAccount')}
          </StyledHeading>
          <StyledText color={mutedTextColor}>
            {t('auth.joinUs')}
          </StyledText>
        </FlexContainer>

        <StackContainer>
          <FieldContainer>
            <StyledText fontWeight="500" mb={2} color={textColor}>
              {t('auth.name')}
            </StyledText>
            <Field errorText={errors.full_name?.message}>
              <InputGroup startElement={<FiUser color={useColorModeValue("gray.500", "gray.400")} />}>
                <Input
                  id="full_name"
                  minLength={3}
                  {...register("full_name", {
                    required: t('validation.nameRequired'),
                  })}
                  placeholder={t('auth.yourName')}
                  type="text"
                  size="large"
                  style={{
                    borderRadius: '10px',
                    borderColor: borderColor,
                    color: textColor,
                  }}
                />
              </InputGroup>
            </Field>
          </FieldContainer>

          <FieldContainer>
            <StyledText fontWeight="500" mb={2} color={textColor}>
              {t('auth.email')}
            </StyledText>
            <Field errorText={errors.email?.message}>
              <InputGroup startElement={<FiMail color={useColorModeValue("gray.500", "gray.400")} />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: t('validation.emailRequired'),
                    pattern: emailPattern,
                  })}
                  placeholder={t('auth.yourEmail')}
                  type="email"
                  size="large"
                  style={{
                    borderRadius: '10px',
                    borderColor: borderColor,
                    color: textColor,
                  }}
                />
              </InputGroup>
            </Field>
          </FieldContainer>

          <FieldContainer>
            <StyledText fontWeight="500" mb={2} color={textColor}>
              {t('auth.password')}
            </StyledText>
            <PasswordInput
              type="password"
              startElement={<FiLock color={useColorModeValue("gray.500", "gray.400")} />}
              {...register("password", passwordRules(t('validation.passwordRequired')))}
              placeholder={t('auth.setPassword')}
              errors={errors}
              style={{
                borderRadius: '10px',
                borderColor: borderColor,
                color: textColor,
              }}
            />
          </FieldContainer>

          <FieldContainer>
            <StyledText fontWeight="500" mb={2} color={textColor}>
              {t('auth.confirmPassword')}
            </StyledText>
            <PasswordInput
              type="password"
              startElement={<FiLock color={useColorModeValue("gray.500", "gray.400")} />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder={t('auth.confirmPassword')}
              errors={errors}
              style={{
                borderRadius: '10px',
                borderColor: borderColor,
                color: textColor,
              }}
            />
          </FieldContainer>

          <CheckboxContainer>
            <Checkbox style={{ color: primaryColor }}>
              <StyledText fontSize="0.9rem" color={textColor}>
                {t('auth.iAgree')} <StyledText style={{ color: primaryColor, textDecoration: 'none', cursor: 'pointer' }}>{t('auth.terms')}</StyledText> {t('auth.and')+ " "} 
                <StyledText style={{ color: primaryColor, textDecoration: 'none', cursor: 'pointer' }}>{t('auth.privacy')}</StyledText>
              </StyledText>
            </Checkbox>
          </CheckboxContainer>

          <Button 
            htmlType="submit" 
            loading={isSubmitting || mutation.isPending} 
            size="large"
            style={{
              backgroundColor: primaryColor,
              borderColor: primaryColor,
              color: 'white',
              borderRadius: '10px',
              height: '45px',
              fontSize: '14px',
              width: '100%'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = primaryDarkColor
              e.currentTarget.style.borderColor = primaryDarkColor
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = primaryColor
              e.currentTarget.style.borderColor = primaryColor
            }}
          >
            {t('auth.signup')}
          </Button>
        </StackContainer>

        <AuthError error={signupError} t={t} />

        <CenteredContainer>
          <StyledText textAlign="center" color={textColor}>
            {t('auth.alreadyHaveAccount')} {" "}
            <RouterLink to="/login" style={{ color: primaryColor, textDecoration: 'none', fontWeight: '500' }}>
              {t('auth.login')}
            </RouterLink>
          </StyledText>
        </CenteredContainer>
      </FormContainer>
    </PageContainer>
  )
}

export default SignUp
