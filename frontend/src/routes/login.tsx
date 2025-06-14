import {
  Box,
  Container,
  Flex,
  Heading,
  Input,
  Stack,
  Text,
} from "@chakra-ui/react"
import {
  Link as RouterLink,
  createFileRoute,
  redirect,
  // useNavigate,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiMail } from "react-icons/fi"
import { useTranslation } from "react-i18next"
import { useState } from "react"

import type { Body_login_login_access_token as AccessToken } from "@/client"
import { Button } from "@/components/ui/button"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import useAuth, { isLoggedIn } from "@/hooks/useAuth"
import { emailPattern, passwordRules } from "../utils"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AuthError } from "@/components/ui/auth-error"
import useAnalytics from "@/hooks/useAnalytics"
// import { LoginService } from "@/client"

export const Route = createFileRoute("/login")({
  component: Login,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

function Login() {
  const { loginMutation, error: authError, resetError } = useAuth()
  const [apiError, setApiError] = useState<any>(null)
  const { t } = useTranslation()
  const { trackLogin } = useAnalytics()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AccessToken>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      username: "",
      password: "",
    },
  })
  // const navigate = useNavigate()

  // const mutation = useMutation({
  //   mutationFn: (data: AccessToken) => LoginService.loginAccessToken({ formData: data }),
  //   onSuccess: (data) => {
  //     console.log("Login successful:", data);
  //     navigate({ to: "/" });
  //   },
  //   onError: (error) => {
  //     console.error("Login failed:", error);
  //   },
  // })

  const onSubmit: SubmitHandler<AccessToken> = async (data) => {
    if (isSubmitting) return

    resetError()
    setApiError(null)

    try {
      await loginMutation.mutateAsync(data)
      trackLogin('email') // Track successful login
    } catch (err: any) {
      console.error("Login error details:", err)
      setApiError(err)
    }
  }

  // Colors with dark mode support
  const primaryColor = "#7856ff"
  const primaryDarkColor = "#6040e0"
  
  // Dynamic colors for dark mode
  const bgColor = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.500", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  
  return (
    <Box minH="100vh" py={12} px={4} bg={useColorModeValue("gray.50", "gray.900")}>
      <Container 
        as="form" 
        onSubmit={handleSubmit(onSubmit)}
        maxW="450px"
        boxShadow="md"
        p={10}
        borderRadius="10px"
        bg={bgColor}
        borderColor={borderColor}
        borderWidth="1px"
      >
        <Flex justifyContent="flex-end" mb={6} gap={2}>
          <ColorModeButton />
          <LanguageSwitcher />
        </Flex>
        
        <Flex direction="column" align="center" mb={8}>
          <RouterLink to="/" style={{ textDecoration: 'none' }}>
            <Flex align="center" mb={6}>
              <Box mr={2}>
                <img 
                  src="/assets/images/logo1.png" 
                  alt="YouTube MindMap Logo"
                  width="32"
                  height="32"
                  style={{ display: 'inline-block' }}
                />
              </Box>
              <Heading as="h2" fontSize="1.5rem" fontWeight="700" color={textColor}>
                YouTube MindMap
              </Heading>
            </Flex>
          </RouterLink>
          <Heading as="h1" fontSize="1.8rem" mb={2} color={textColor}>
            {t('auth.login')}
          </Heading>
          <Text color={mutedTextColor}>
            {t('auth.welcomeBack')}
          </Text>
        </Flex>

        <Stack gap={5}>
          <Box>
            <Text fontWeight="500" mb={2} color={textColor}>
              {t('auth.email')}
            </Text>
            <Field
              invalid={!!errors.username}
              errorText={errors.username?.message || !!apiError || !!authError}
            >
              <InputGroup w="100%" startElement={<FiMail color={useColorModeValue("gray.500", "gray.400")} />}>
                <Input
                  id="username"
                  {...register("username", {
                    required: t('validation.emailRequired'),
                    pattern: emailPattern,
                  })}
                  placeholder={t('auth.email')}
                  type="email"
                  size="md"
                  borderRadius="10px"
                  borderColor={borderColor}
                  color={textColor}
                  _placeholder={{ color: mutedTextColor }}
                />
              </InputGroup>
            </Field>
          </Box>

          <Box>
            <Flex justify="space-between" mb={2}>
              <Text fontWeight="500" color={textColor}>{t('auth.password')}</Text>
              <RouterLink to="/recover-password" style={{ color: primaryColor, textDecoration: 'none', fontSize: '0.9rem' }}>
                {t('auth.forgotPassword')}
              </RouterLink>
            </Flex>
            <PasswordInput
              type="password"
              startElement={<FiLock color={useColorModeValue("gray.500", "gray.400")} />}
              {...register("password", passwordRules(t('validation.passwordRequired')))}
              placeholder={t('auth.password')}
              errors={errors}
              borderRadius="10px"
              borderColor={borderColor}
              color={textColor}
              _placeholder={{ color: mutedTextColor }}
            />
          </Box>

          {/* <Checkbox color={primaryColor}>
            {t('auth.rememberMe')}
          </Checkbox> */}

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
            {t('auth.login')}
          </Button>
        </Stack>

        <AuthError error={apiError || authError} t={t} />

        {/* <Box textAlign="center" my={6}>
          <Text color={mutedTextColor} mb={4}>
            {t('auth.loginWith')}
          </Text>
          <Flex justify="center" gap={4}>
            <Flex 
              align="center" 
              justify="center" 
              w="50px" 
              h="50px" 
              borderRadius="10px" 
              border="1px" 
              borderColor={borderColor}
              cursor="pointer"
              color="#4267B2"
              transition="all 0.3s ease"
              _hover={{ bg: hoverBg }}
            >
              <FaFacebookF size="1.3rem" />
            </Flex>
            <Flex 
              align="center" 
              justify="center" 
              w="50px" 
              h="50px" 
              borderRadius="10px" 
              border="1px" 
              borderColor={borderColor}
              cursor="pointer"
              color="#DB4437"
              transition="all 0.3s ease"
              _hover={{ bg: hoverBg }}
            >
              <FaGoogle size="1.3rem" />
            </Flex>
            <Flex 
              align="center" 
              justify="center" 
              w="50px" 
              h="50px" 
              borderRadius="10px" 
              border="1px" 
              borderColor={borderColor}
              cursor="pointer"
              color="#0072b1"
              transition="all 0.3s ease"
              _hover={{ bg: hoverBg }}
            >
              <FaLinkedinIn size="1.3rem" />
            </Flex>
          </Flex>
        </Box> */}

        <Box textAlign="center">
          <Text color={mutedTextColor}>
            {t('auth.doNotHaveAccount')}{" "}
            <RouterLink to="/signup" style={{ color: primaryColor, textDecoration: 'none', fontWeight: 'bold' }}>
              {t('auth.signup')}
            </RouterLink>
          </Text>
        </Box>
      </Container>
    </Box>
  )
}

export default Login
