import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute, redirect } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiMail } from "react-icons/fi"
import { FaSitemap } from "react-icons/fa"
import { Input } from "antd"
import styled from "styled-components"

import { type ApiError, LoginService } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"

interface FormData {
  email: string
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
}>`
  font-weight: ${props => props.fontWeight || 'normal'};
  margin-bottom: ${props => props.mb ? `${props.mb * 8}px` : '0'};
  color: ${props => props.color || 'inherit'};
  display: ${props => props.mb ? 'block' : 'inline'};
`

const StackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

const FieldContainer = styled.div``

const CenteredContainer = styled.div`
  text-align: center;
  margin-top: 24px;
`

export const Route = createFileRoute("/recover-password")({
  component: RecoverPassword,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function RecoverPassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>()
  const { showSuccessToast } = useCustomToast()

  const recoverPassword = async (data: FormData) => {
    await LoginService.recoverPassword({
      email: data.email,
    })
  }

  const mutation = useMutation({
    mutationFn: recoverPassword,
    onSuccess: () => {
      showSuccessToast("重設密碼連結已發送到您的電子郵件")
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<FormData> = async (data) => {
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
            重設密碼
          </StyledHeading>
          <StyledText color="#6b7280" style={{ textAlign: 'center' }}>
            請輸入您的註冊電子郵件，我們將發送重設密碼連結
          </StyledText>
        </FlexContainer>

        <StackContainer>
          <FieldContainer>
            <StyledText fontWeight="500" mb={2}>
              電子郵件
            </StyledText>
            <Field errorText={errors.email?.message}>
              <InputGroup startElement={<FiMail />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: "請輸入電子郵件",
                    pattern: emailPattern,
                  })}
                  placeholder="您的註冊電子郵件地址"
                  type="email"
                  size="large"
                  style={{ borderRadius: '10px' }}
                />
              </InputGroup>
            </Field>
          </FieldContainer>

          <Button 
            htmlType="submit" 
            loading={isSubmitting}
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
            發送重設連結
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
