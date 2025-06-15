import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"
import { FaSitemap } from "react-icons/fa"
import styled from "styled-components"

import { type ApiError, LoginService, type NewPassword } from "@/client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

// Styled components
const PageContainer = styled.div`
  min-height: 100vh;
  padding: 48px 16px;
`

const FormContainer = styled.form`
  max-width: 450px;
  margin: 0 auto;
  padding: 40px;
  border-radius: 10px;
  background: white;
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

const StyledHeading = styled.h1<{
  level?: number
  fontSize?: string
  fontWeight?: string
  mb?: number
}>`
  font-size: ${props => props.fontSize || (props.level === 1 ? '1.8rem' : '1.5rem')};
  font-weight: ${props => props.fontWeight || '700'};
  margin: 0;
  margin-bottom: ${props => props.mb ? `${props.mb * 8}px` : '0'};
`

const StyledText = styled.span<{
  fontWeight?: string
  mb?: number
  color?: string
  fontSize?: string
}>`
  font-weight: ${props => props.fontWeight || 'normal'};
  margin-bottom: ${props => props.mb ? `${props.mb * 8}px` : '0'};
  color: ${props => props.color || 'inherit'};
  font-size: ${props => props.fontSize || 'inherit'};
  display: ${props => props.mb ? 'block' : 'inline'};
`

const StackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FieldContainer = styled.div``

const PasswordStrengthContainer = styled.div`
  margin-top: 8px;
`

const PasswordStrengthBars = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 4px;
`

const PasswordStrengthBar = styled.div`
  flex: 1;
  height: 5px;
  border-radius: 5px;
  background-color: #e5e7eb;
`

const PasswordRequirements = styled.div`
  background-color: #f9fafb;
  padding: 12px;
  border-radius: 10px;
  font-size: 0.9rem;
  color: #6b7280;
`

const RequirementsList = styled.ul`
  padding-left: 20px;
  margin: 8px 0 0 0;
`

const RequirementItem = styled.li`
  margin-bottom: 4px;
`

const CenteredContainer = styled.div`
  text-align: center;
  margin-top: 24px;
`

export const Route = createFileRoute("/reset-password")({
  component: ResetPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function ResetPassword() {
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = useForm<NewPasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      new_password: "",
    },
  })
  const { showSuccessToast } = useCustomToast()
  const navigate = useNavigate()

  const resetPassword = async (data: NewPassword) => {
    const token = new URLSearchParams(window.location.search).get("token")
    if (!token) return
    await LoginService.resetPassword({
      requestBody: { new_password: data.new_password, token: token },
    })
  }

  const mutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      showSuccessToast("密碼更新成功")
      reset()
      navigate({ to: "/login" })
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<NewPasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  // Colors based on the prototype
  const primaryColor = "#7856ff"
  const primaryDarkColor = "#6040e0"

  return (
    <PageContainer>
      <FormContainer onSubmit={handleSubmit(onSubmit)}>
        <FlexContainer direction="column" align="center" mb={8}>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <FlexContainer align="center" mb={6}>
              <FaSitemap color={primaryColor} size="1.8rem" style={{ marginRight: '10px' }} />
              <StyledHeading level={2} fontSize="1.5rem" fontWeight="700">
                YouTube MindMap
              </StyledHeading>
            </FlexContainer>
          </RouterLink>
          <StyledHeading level={1} fontSize="1.8rem" mb={2}>
            設定新密碼
          </StyledHeading>
          <StyledText color="#6b7280" style={{ textAlign: 'center' }}>
            請輸入您的新密碼
          </StyledText>
        </FlexContainer>

        <StackContainer>
          <FieldContainer>
            <StyledText fontWeight="500" mb={2}>
              新密碼
            </StyledText>
            <PasswordInput
              startElement={<FiLock />}
              type="new_password"
              errors={errors}
              {...register("new_password", passwordRules())}
              placeholder="設定新密碼（至少8位字符）"
              style={{ borderRadius: '10px' }}
            />
            <PasswordStrengthContainer>
              <PasswordStrengthBars>
                <PasswordStrengthBar />
                <PasswordStrengthBar />
                <PasswordStrengthBar />
                <PasswordStrengthBar />
              </PasswordStrengthBars>
              <StyledText fontSize="0.85rem" color="#6b7280">
                密碼強度: <StyledText>弱</StyledText>
              </StyledText>
            </PasswordStrengthContainer>
          </FieldContainer>

          <FieldContainer>
            <StyledText fontWeight="500" mb={2}>
              確認密碼
            </StyledText>
            <PasswordInput
              startElement={<FiLock />}
              type="confirm_password"
              errors={errors}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="再次輸入新密碼"
              style={{ borderRadius: '10px' }}
            />
          </FieldContainer>

          <PasswordRequirements>
            <StyledText fontWeight="500" mb={2}>密碼須符合以下要求：</StyledText>
            <RequirementsList>
              <RequirementItem>至少 8 個字符</RequirementItem>
              <RequirementItem>包含至少一個大寫字母</RequirementItem>
              <RequirementItem>包含至少一個小寫字母</RequirementItem>
              <RequirementItem>包含至少一個數字</RequirementItem>
              <RequirementItem>包含至少一個特殊字符（如 !@#$%^&*）</RequirementItem>
            </RequirementsList>
          </PasswordRequirements>

          <Button 
            htmlType="submit"
            loading={mutation.isPending}
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
            更新密碼
          </Button>
        </StackContainer>

        <CenteredContainer>
          <RouterLink to="/login" style={{ color: primaryColor, textDecoration: 'none', fontWeight: '500' }}>
            返回登入
          </RouterLink>
        </CenteredContainer>
      </FormContainer>
    </PageContainer>
  )
}
