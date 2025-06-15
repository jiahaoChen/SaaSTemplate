import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Controller, type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import { FaExchangeAlt } from "react-icons/fa"
import { Input as AntdInput } from "antd"
import styled from "styled-components"

import { type UserPublic, type UserUpdate, UsersService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { emailPattern, handleError } from "@/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "../ui/checkbox"
import {
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTrigger,
} from "../ui/dialog"
import { Field } from "../ui/field"
import { VStack, Text } from "../ui/styled"

const StyledDialogTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: inherit;
`

const FormContainer = styled.form`
  width: 100%;
`

const CheckboxContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`

interface EditUserProps {
  user: UserPublic
}

interface UserUpdateForm extends UserUpdate {
  confirm_password?: string
}

const EditUser = ({ user }: EditUserProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserUpdateForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: user,
  })

  const mutation = useMutation({
    mutationFn: (data: UserUpdateForm) =>
      UsersService.updateUser({ userId: user.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("User updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit: SubmitHandler<UserUpdateForm> = async (data) => {
    if (data.password === "") {
      data.password = undefined
    }
    mutation.mutate(data)
  }

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger onClick={() => setIsOpen(true)}>
        <Button variant="outlined" size="small">
          <FaExchangeAlt fontSize="16px" style={{ marginRight: '4px' }} />
          Edit User
        </Button>
      </DialogTrigger>
      <DialogContent>
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <StyledDialogTitle>Edit User</StyledDialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the user details below.</Text>
            <VStack gap={4}>
              <Field
                required
                errorText={errors.email?.message}
                label="Email"
              >
                <AntdInput
                  id="email"
                  {...register("email", {
                    required: "Email is required",
                    pattern: emailPattern,
                  })}
                  placeholder="Email"
                  type="email"
                  size="middle"
                />
              </Field>

              <Field
                errorText={errors.full_name?.message}
                label="Full Name"
              >
                <AntdInput
                  id="name"
                  {...register("full_name")}
                  placeholder="Full name"
                  type="text"
                  size="middle"
                />
              </Field>

              <Field
                errorText={errors.password?.message}
                label="Set Password"
              >
                <AntdInput.Password
                  id="password"
                  {...register("password", {
                    minLength: {
                      value: 8,
                      message: "Password must be at least 8 characters",
                    },
                  })}
                  placeholder="Password"
                  size="middle"
                />
              </Field>

              <Field
                errorText={errors.confirm_password?.message}
                label="Confirm Password"
              >
                <AntdInput.Password
                  id="confirm_password"
                  {...register("confirm_password", {
                    validate: (value) =>
                      value === getValues().password ||
                      "The passwords do not match",
                  })}
                  placeholder="Password"
                  size="middle"
                />
              </Field>
            </VStack>

            <CheckboxContainer>
              <Controller
                control={control}
                name="is_superuser"
                render={({ field }) => (
                  <Field>
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      Is superuser?
                    </Checkbox>
                  </Field>
                )}
              />
              <Controller
                control={control}
                name="is_active"
                render={({ field }) => (
                  <Field>
                    <Checkbox
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    >
                      Is active?
                    </Checkbox>
                  </Field>
                )}
              />
            </CheckboxContainer>
          </DialogBody>

          <DialogFooter>
            <DialogCloseTrigger onClick={() => setIsOpen(false)}>
              <Button variant="outlined">Cancel</Button>
            </DialogCloseTrigger>
            <Button
              htmlType="submit"
              loading={isSubmitting}
            >
              Update User
            </Button>
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </DialogRoot>
  )
}

export default EditUser
