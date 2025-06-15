import { Typography, Input as AntdInput } from "antd"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"

import styled from "styled-components"

import {
  type ApiError,
  type UserPublic,
  type UserUpdateMe,
  UsersService,
} from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"
import { Field } from "../ui/field"

import useLanguage from "@/hooks/useLanguage"

import { Button } from "@/components/ui/button"

const Container = styled.div`
  max-width: 100%;
  padding: 0 1rem;
`

const StyledHeading = styled(Typography.Title)<{ fontWeight?: string }>`
  font-size: 1rem !important;
  padding: 20px 0 !important;
  margin-bottom: 0 !important;
  font-weight: ${props => props.fontWeight || 'bold'} !important;
`

const FormContainer = styled.form<{ w?: string }>`
  width: 100%;
  
  @media (min-width: 640px) {
    width: ${props => props.w === 'md' ? '448px' : props.w === 'lg' ? '512px' : '100%'};
  }
`

const StyledText = styled(Typography.Text)<{ 
  fontSize?: string
  color?: string
  truncate?: boolean
  maxW?: string
}>`
  font-size: ${props => props.fontSize || 'inherit'} !important;
  color: ${props => props.color} !important;
  display: block;
  padding: 8px 0;
  ${props => props.truncate && `
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  `}
  ${props => props.maxW && `max-width: ${props.maxW === 'full' ? '100%' : props.maxW};`}
`

const FlexContainer = styled.div<{ gap?: number }>`
  display: flex;
  margin-top: 16px;
  gap: ${props => props.gap ? `${props.gap * 4}px` : '0'};
`

// Extended UserPublic interface to include gemini_api_key
interface ExtendedUserPublic extends UserPublic {
  gemini_api_key?: string;
  preferred_gemini_model?: string; // Add this
}

// Extended UserPublic interface to include gemini_api_key and preferred_gemini_model
interface UserFormData extends Omit<UserPublic, 'id'> {
  id?: string;
  gemini_api_key?: string;
  preferred_gemini_model?: string; // Add this
}

const UserInformation = () => {
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const [editMode, setEditMode] = useState(false)

  const { user: currentUser } = useAuth() as { user: ExtendedUserPublic | null }
  const { t } = useLanguage()
  
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    formState: { isSubmitting, errors, isDirty },
  } = useForm<UserFormData>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      full_name: currentUser?.full_name,
      email: currentUser?.email,
      gemini_api_key: currentUser?.gemini_api_key,
      preferred_gemini_model: currentUser?.preferred_gemini_model,
    },
  })

  // TODO: Implement getAvailableGeminiModels in backend
  const availableModels = ['gemini-pro', 'gemini-pro-vision'] // Hardcoded for now

  // Set default model if none is selected and models are available
  useEffect(() => {
    if (availableModels?.length && !getValues("preferred_gemini_model") && editMode) {
      setValue("preferred_gemini_model", availableModels[0], { shouldDirty: true });
    }
  }, [availableModels, editMode, getValues, setValue]);

  const toggleEditMode = () => {
    setEditMode(!editMode)
    // When entering edit mode, set default model if none is selected
    if (!editMode && availableModels?.length && !getValues("preferred_gemini_model")) {
      setValue("preferred_gemini_model", availableModels[0], { shouldDirty: true });
    }
  }

  const mutation = useMutation({
    mutationFn: (data: UserUpdateMe) =>
      UsersService.updateUserMe({ requestBody: data }),
    onSuccess: () => {
      showSuccessToast(t("settings.userInformation.updateSuccess"))
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries()
    },
  })

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    // Ensure a model is selected before submitting
    if (!data.preferred_gemini_model && availableModels?.length) {
      data.preferred_gemini_model = availableModels[0];
    }
    mutation.mutate(data as UserUpdateMe)
  }

  const onCancel = () => {
    reset()
    toggleEditMode()
  }

  return (
    <>
      <Container>
        <StyledHeading level={3} fontWeight="bold">
          {t("settings.userInformation.title")}
        </StyledHeading>
        <FormContainer
          w="lg"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field label={t("settings.userInformation.fullName")}>
            {editMode ? (
              <AntdInput
                {...register("full_name", { maxLength: 30 })}
                type="text"
                size="middle"
                style={{ width: '100%' }}
              />
            ) : (
              <StyledText
                fontSize="14px"
                color={!currentUser?.full_name ? "gray" : "inherit"}
                truncate
                maxW="full"
              >
                {currentUser?.full_name || t("common.notApplicable")}
              </StyledText>
            )}
          </Field>
          <Field
            label={t("auth.email")}
            errorText={errors.email?.message}
            style={{ marginTop: '16px' }}
          >
            {editMode ? (
              <AntdInput
                {...register("email", {
                  required: t("validation.emailRequired"),
                  pattern: emailPattern,
                })}
                type="email"
                size="middle"
                style={{ width: '100%' }}
              />
            ) : (
              <StyledText fontSize="14px" truncate maxW="full">
                {currentUser?.email}
              </StyledText>
            )}
          </Field>
          <FlexContainer gap={3}>
            <Button
              onClick={toggleEditMode}
              htmlType={editMode ? "button" : "submit"}
              loading={editMode ? isSubmitting : false}
              disabled={editMode ? !isDirty || !getValues("email") : false}
            >
              {editMode ? t("common.save") : t("common.edit")}
            </Button>
            {editMode && (
              <Button
                style={{ background: 'transparent', color: '#666' }}
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
            )}
          </FlexContainer>
        </FormContainer>
      </Container>
    </>
  )
}

export default UserInformation
