import {
  Box,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute, redirect, useNavigate } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock } from "react-icons/fi"
import { FaSitemap } from "react-icons/fa"

import { type ApiError, LoginService, type NewPassword } from "@/client"
import { Button } from "@/components/ui/button"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import useCustomToast from "@/hooks/useCustomToast"
import { confirmPasswordRules, handleError, passwordRules } from "@/utils"

interface NewPasswordForm extends NewPassword {
  confirm_password: string
}

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
    <Box minH="100vh" py={12} px={4}>
      <Container 
        as="form" 
        onSubmit={handleSubmit(onSubmit)}
        maxW="450px"
        boxShadow="md"
        p={10}
        borderRadius="10px"
        bg="white"
      >
        <Flex direction="column" align="center" mb={8}>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Flex align="center" mb={6}>
              <FaSitemap color={primaryColor} size="1.8rem" style={{ marginRight: '10px' }} />
              <Heading as="h2" fontSize="1.5rem" fontWeight="700">
                YouTube MindMap
              </Heading>
            </Flex>
          </RouterLink>
          <Heading as="h1" fontSize="1.8rem" mb={2}>
            設定新密碼
          </Heading>
          <Text color="gray.500" textAlign="center">
            請輸入您的新密碼
          </Text>
        </Flex>

        <Stack gap={5}>
          <Box>
            <Text fontWeight="500" mb={2}>
              新密碼
            </Text>
            <PasswordInput
              startElement={<FiLock />}
              type="new_password"
              errors={errors}
              {...register("new_password", passwordRules())}
              placeholder="設定新密碼（至少8位字符）"
              borderRadius="10px"
            />
            <Box mt={2}>
              <Flex gap={1} mb={1}>
                <Box flex={1} h="5px" borderRadius="5px" bg="gray.200"></Box>
                <Box flex={1} h="5px" borderRadius="5px" bg="gray.200"></Box>
                <Box flex={1} h="5px" borderRadius="5px" bg="gray.200"></Box>
                <Box flex={1} h="5px" borderRadius="5px" bg="gray.200"></Box>
              </Flex>
              <Text fontSize="0.85rem" color="gray.500">密碼強度: <Text as="span">弱</Text></Text>
            </Box>
          </Box>

          <Box>
            <Text fontWeight="500" mb={2}>
              確認密碼
            </Text>
            <PasswordInput
              startElement={<FiLock />}
              type="confirm_password"
              errors={errors}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder="再次輸入新密碼"
              borderRadius="10px"
            />
          </Box>

          <Box bg="gray.50" p={3} borderRadius="10px" fontSize="0.9rem" color="gray.600">
            <Text fontWeight="500" mb={2}>密碼須符合以下要求：</Text>
            <Box as="ul" pl={5}>
              <Box as="li" mb={1}>至少 8 個字符</Box>
              <Box as="li" mb={1}>包含至少一個大寫字母</Box>
              <Box as="li" mb={1}>包含至少一個小寫字母</Box>
              <Box as="li" mb={1}>包含至少一個數字</Box>
              <Box as="li">包含至少一個特殊字符（如 !@#$%^&*）</Box>
            </Box>
          </Box>

          <Button 
            variant="solid" 
            type="submit"
            loading={mutation.isPending}
            size="md"
            bg={primaryColor}
            color="white"
            _hover={{ bg: primaryDarkColor }}
            borderRadius="10px"
            h="45px"
            fontSize="md"
            w="100%"
          >
            更新密碼
          </Button>
        </Stack>

        <Box textAlign="center" mt={6}>
          <RouterLink to="/login" style={{ color: primaryColor, textDecoration: 'none', fontWeight: '500' }}>
            返回登入
          </RouterLink>
        </Box>
      </Container>
    </Box>
  )
}
