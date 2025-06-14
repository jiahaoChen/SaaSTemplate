import {
  Box,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import { useMutation } from "@tanstack/react-query"
import { Link as RouterLink, createFileRoute, redirect } from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiMail } from "react-icons/fi"
import { FaSitemap } from "react-icons/fa"

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
            重設密碼
          </Heading>
          <Text color="gray.500" textAlign="center">
            請輸入您的註冊電子郵件，我們將發送重設密碼連結
          </Text>
        </Flex>

        <Stack gap={5}>
          <Box>
            <Text fontWeight="500" mb={2}>
              電子郵件
            </Text>
            <Field invalid={!!errors.email} errorText={errors.email?.message}>
              <InputGroup w="100%" startElement={<FiMail />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: "請輸入電子郵件",
                    pattern: emailPattern,
                  })}
                  placeholder="您的註冊電子郵件地址"
                  type="email"
                  size="md"
                  borderRadius="10px"
                />
              </InputGroup>
            </Field>
          </Box>

          <Button 
            variant="solid" 
            type="submit" 
            loading={isSubmitting}
            size="md"
            bg={primaryColor}
            color="white"
            _hover={{ bg: primaryDarkColor }}
            borderRadius="10px"
            h="45px"
            fontSize="md"
            w="100%"
          >
            發送重設連結
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
