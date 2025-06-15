import { Button } from "@/components/ui/button"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useState } from "react"
import { useForm } from "react-hook-form"
import styled from 'styled-components'

import { type ApiError, UsersService } from "@/client"
import {
  DialogActionTrigger,
  DialogBody,
  DialogCloseTrigger,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogRoot,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import useAuth from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import useLanguage from "@/hooks/useLanguage"
import { handleError, renderHtmlTranslation } from "@/utils"

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
`

const MessageBox = styled.div`
  margin-bottom: 16px;
`

const DeleteConfirmation = () => {
  const [isOpen, setIsOpen] = useState(false)
  const queryClient = useQueryClient()
  const { showSuccessToast } = useCustomToast()
  const { t } = useLanguage()
  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm()
  const { logout } = useAuth()

  const mutation = useMutation({
    mutationFn: () => UsersService.deleteUserMe(),
    onSuccess: () => {
      showSuccessToast(t("settings.deleteAccount.success"))
      setIsOpen(false)
      logout()
    },
    onError: (err: ApiError) => {
      handleError(err)
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUser"] })
    },
  })

  const onSubmit = async () => {
    mutation.mutate()
  }

  // Convert translation with HTML tags to actual HTML
  const confirmMessage = renderHtmlTranslation(t("settings.deleteAccount.confirmMessage", {
    strongStart: "<strong>",
    strongEnd: "</strong>",
  }))

  return (
    <>
      <DialogRoot
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <DialogTrigger onClick={() => setIsOpen(true)}>
          <Button type="primary" danger style={{ marginTop: '16px' }}>
            {t("common.delete")}
          </Button>
        </DialogTrigger>

        <DialogContent
          open={isOpen}
          onCancel={() => setIsOpen(false)}
          title={t("settings.deleteAccount.confirmTitle")}
        >
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogCloseTrigger onClick={() => setIsOpen(false)} />
            <DialogHeader>
              <DialogTitle>{t("settings.deleteAccount.confirmTitle")}</DialogTitle>
            </DialogHeader>
            <DialogBody>
              <MessageBox 
                dangerouslySetInnerHTML={{ __html: confirmMessage }}
              />
            </DialogBody>

            <DialogFooter>
              <ButtonGroup>
                <DialogActionTrigger onClick={() => setIsOpen(false)}>
                  <Button
                    disabled={isSubmitting}
                  >
                    {t("common.cancel")}
                  </Button>
                </DialogActionTrigger>
                <Button
                  type="primary"
                  danger
                  htmlType="submit"
                  loading={isSubmitting}
                >
                  {t("common.delete")}
                </Button>
              </ButtonGroup>
            </DialogFooter>
          </form>
        </DialogContent>
      </DialogRoot>
    </>
  )
}

export default DeleteConfirmation
