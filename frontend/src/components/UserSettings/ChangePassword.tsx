import { Typography } from "antd"
import { useMutation } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"
import styled from "styled-components"

import { type ApiError, type UpdatePassword, UsersService } from "@/client"
import useCustomToast from "@/hooks/useCustomToast"
import useLanguage from "@/hooks/useLanguage"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"
import { PasswordInput } from "../ui/password-input"
import { Button } from "@/components/ui/button"

const Container = styled.div`
  max-width: 100%;
  padding: 0 1rem;
`

const StyledHeading = styled(Typography.Title)`
  font-size: 0.875rem !important;
  padding: 16px 0 !important;
  margin-bottom: 0 !important;
`

const FormContainer = styled.form``

const VStackContainer = styled.div<{ w?: string }>`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: ${props => props.w || '100%'};
  
  @media (max-width: 768px) {
    width: 100%;
  }
  
  @media (min-width: 769px) {
    width: ${props => props.w === 'sm' ? '384px' : props.w || '100%'};
  }
`

interface UpdatePasswordForm extends UpdatePassword {
  confirm_password: string
}

const ChangePassword = () => {
  const { showSuccessToast } = useCustomToast()
  const { t } = useLanguage()
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isValid, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    mode: "onBlur",
    criteriaMode: "all",
  })

  const mutation = useMutation({
    mutationFn: (data: UpdatePassword) =>
      UsersService.updatePasswordMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(t("settings.changePassword.success"))
      reset()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
  })

  const onSubmit: SubmitHandler<UpdatePasswordForm> = async (data) => {
    mutation.mutate(data)
  }

  return (
    <>
      <Container>
        <StyledHeading level={4}>
          {t("settings.changePasswordText")}
        </StyledHeading>
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <VStackContainer w="sm">
            <PasswordInput
              type="current_password"
              startElement={<FiLock />}
              {...register("current_password", passwordRules())}
              placeholder={t("settings.currentPassword")}
              errors={errors}
            />
            <PasswordInput
              type="new_password"
              startElement={<FiLock />}
              {...register("new_password", passwordRules())}
              placeholder={t("settings.newPassword")}
              errors={errors}
            />
            <PasswordInput
              type="confirm_password"
              startElement={<FiLock />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder={t("settings.confirmNewPassword")}
              errors={errors}
            />
          </VStackContainer>
          <Button
            style={{ marginTop: '16px' }}
            htmlType="submit"
            loading={isSubmitting}
            disabled={!isValid}
          >
            {t("settings.updatePassword")}
          </Button>
        </FormContainer>
      </Container>
    </>
  )
}
export default ChangePassword
