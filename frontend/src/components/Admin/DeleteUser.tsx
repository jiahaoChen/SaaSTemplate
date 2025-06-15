import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { FaTrash } from "react-icons/fa"
import styled from "styled-components"

import { type UserPublic, UsersService } from "@/client"
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
import { Text } from "../ui/styled"

const StyledDialogTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: inherit;
`

const FormContainer = styled.form`
  width: 100%;
`

interface DeleteUserProps {
  user: UserPublic
}

const DeleteUser = ({ user }: DeleteUserProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()

  const mutation = useMutation({
    mutationFn: (id: string) => UsersService.deleteUser({ userId: id }),
    onSuccess: () => {
      showSuccessToast("User deleted successfully.")
      setIsOpen(false)
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
    },
  })

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    mutation.mutate(user.id)
  }

  return (
    <DialogRoot
      open={isOpen}
      onOpenChange={setIsOpen}
    >
      <DialogTrigger onClick={() => setIsOpen(true)}>
        <Button variant="outlined" size="small">
          <FaTrash fontSize="16px" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <FormContainer onSubmit={onSubmit}>
          <DialogHeader>
            <StyledDialogTitle>Delete User</StyledDialogTitle>
          </DialogHeader>
          <DialogBody>
            <Text>
              Are you sure you want to delete the user "{user.full_name || user.email}"?
              This action cannot be undone.
            </Text>
          </DialogBody>
          <DialogFooter>
            <DialogCloseTrigger onClick={() => setIsOpen(false)}>
              <Button variant="outlined">Cancel</Button>
            </DialogCloseTrigger>
            <Button
              htmlType="submit"
              danger
              loading={mutation.isPending}
            >
              Delete
            </Button>
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </DialogRoot>
  )
}

export default DeleteUser
