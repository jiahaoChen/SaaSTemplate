import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiEye, FiEyeOff } from "react-icons/fi"

import {
  type ApiError,
  type UserPublic,
  type UserUpdateMe,
  UsersService,
  UtilsService,
} from "@/client"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"
import { Field } from "../ui/field"
import { InputGroup } from "../ui/input-group"
import useLanguage from "@/hooks/useLanguage"
import { useColorModeValue } from "@/components/ui/color-mode"

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
  const [showApiKey, setShowApiKey] = useState(false)
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

  const { data: availableModels, isLoading: isLoadingModels } = useQuery({
    queryKey: ["availableGeminiModels"],
    queryFn: () => UtilsService.getAvailableGeminiModels(), // Use the correct method name
    staleTime: Infinity, // These models don't change often
  })

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
      <Container maxW="full">
        <Heading size="md" py={5} fontWeight="bold">
          {t("settings.userInformation.title")}
        </Heading>
        <Box
          w={{ sm: "full", md: "md", lg: "lg" }}
          as="form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Field label={t("settings.userInformation.fullName")}>
            {editMode ? (
              <Input
                {...register("full_name", { maxLength: 30 })}
                type="text"
                size="md"
                width="full"
              />
            ) : (
              <Text
                fontSize="md"
                py={2}
                color={!currentUser?.full_name ? "gray" : "inherit"}
                truncate
                maxW="full"
              >
                {currentUser?.full_name || t("common.notApplicable")}
              </Text>
            )}
          </Field>
          <Field
            mt={4}
            label={t("auth.email")}
            invalid={!!errors.email}
            errorText={errors.email?.message}
          >
            {editMode ? (
              <Input
                {...register("email", {
                  required: t("validation.emailRequired"),
                  pattern: emailPattern,
                })}
                type="email"
                size="md"
                width="full"
              />
            ) : (
              <Text fontSize="md" py={2} truncate maxW="full">
                {currentUser?.email}
              </Text>
            )}
          </Field>
          <Flex mt={4} gap={3}>
            <Button
              variant="solid"
              onClick={toggleEditMode}
              type={editMode ? "button" : "submit"}
              loading={editMode ? isSubmitting : false}
              disabled={editMode ? !isDirty || !getValues("email") : false}
            >
              {editMode ? t("common.save") : t("common.edit")}
            </Button>
            {editMode && (
              <Button
                variant="subtle"
                colorScheme="gray"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                {t("common.cancel")}
              </Button>
            )}
          </Flex>
        </Box>
      </Container>
    </>
  )
}

export default UserInformation
