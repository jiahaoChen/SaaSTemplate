import { useMutation, useQueryClient } from "@tanstack/react-query"
import { type SubmitHandler, useForm } from "react-hook-form"
import { useState } from "react"
import { FaExchangeAlt } from "react-icons/fa"
import { Input as AntdInput } from "antd"
import styled from "styled-components"

import { type ItemPublic, type ItemUpdate, ItemsService } from "@/client"
import type { ApiError } from "@/client/core/ApiError"
import useCustomToast from "@/hooks/useCustomToast"
import { handleError } from "@/utils"
import { Button } from "@/components/ui/button"
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

interface EditItemProps {
  item: ItemPublic
}

const EditItem = ({ item }: EditItemProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ItemUpdate>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: item,
  })

  const mutation = useMutation({
    mutationFn: (data: ItemUpdate) =>
      ItemsService.updateItem({ id: item.id, requestBody: data }),
    onSuccess: () => {
      showSuccessToast("Item updated successfully.")
      reset()
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const onSubmit: SubmitHandler<ItemUpdate> = async (data) => {
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
          Edit Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <FormContainer onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <StyledDialogTitle>Edit Item</StyledDialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text mb={4}>Update the item details below.</Text>
            <VStack gap={4}>
              <Field
                required
                errorText={errors.title?.message}
                label="Title"
              >
                <AntdInput
                  id="title"
                  {...register("title", {
                    required: "Title is required",
                  })}
                  placeholder="Title"
                  type="text"
                  size="middle"
                />
              </Field>

              <Field
                errorText={errors.description?.message}
                label="Description"
              >
                <AntdInput.TextArea
                  id="description"
                  {...register("description")}
                  placeholder="Description"
                  rows={4}
                  size="middle"
                />
              </Field>
            </VStack>
          </DialogBody>
          <DialogFooter>
            <DialogCloseTrigger onClick={() => setIsOpen(false)}>
              <Button variant="outlined">Cancel</Button>
            </DialogCloseTrigger>
            <Button
              htmlType="submit"
              loading={isSubmitting}
            >
              Update Item
            </Button>
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </DialogRoot>
  )
}

export default EditItem
