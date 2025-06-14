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
  useNavigate,
} from "@tanstack/react-router"
import { type SubmitHandler, useForm } from "react-hook-form"
import { FiLock, FiUser, FiMail } from "react-icons/fi"
import { useMutation } from "@tanstack/react-query"
import { UsersService } from "@/client"
import { useTranslation } from "react-i18next"
import { useState } from "react"

import type { UserRegister } from "@/client"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Field } from "@/components/ui/field"
import { InputGroup } from "@/components/ui/input-group"
import { PasswordInput } from "@/components/ui/password-input"
import { isLoggedIn } from "@/hooks/useAuth"
import { emailPattern, passwordRules, confirmPasswordRules } from "@/utils"
import { ColorModeButton, useColorModeValue } from "@/components/ui/color-mode"
import { LanguageSwitcher } from "@/components/ui/language-switcher"
import { AuthError } from "@/components/ui/auth-error"
import useAnalytics from "@/hooks/useAnalytics"

export const Route = createFileRoute("/signup")({
  component: SignUp,
  beforeLoad: async () => {
    if (isLoggedIn()) {
      throw redirect({
        to: "/",
      })
    }
  },
})

interface UserRegisterForm extends UserRegister {
  confirm_password: string
}

function SignUp() {
  // const { signUpMutation } = useAuth()
  const { t } = useTranslation()
  const { trackSignUp } = useAnalytics()
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UserRegisterForm>({
    mode: "onBlur",
    criteriaMode: "all",
    defaultValues: {
      email: "",
      full_name: "",
      password: "",
      confirm_password: "",
    },
  })
  const navigate = useNavigate()
  
  // Update to store detailed error information
  const [signupError, setSignupError] = useState<any>(null)

  const mutation = useMutation({
    mutationFn: (data: UserRegisterForm) => UsersService.registerUser({ requestBody: data }),
    onSuccess: () => {
      trackSignUp('email') // Track successful signup
      navigate({ to: "/login" })
    },
    onError: (error: any) => {
      console.error("Registration failed:", error)
      setSignupError(error)
    },
  })

  const onSubmit: SubmitHandler<UserRegisterForm> = (data) => {
    setSignupError(null) // Clear previous errors
    mutation.mutate(data)
  }

  // Colors with dark mode support
  const primaryColor = "#7856ff"
  const primaryDarkColor = "#6040e0"
  
  // Dynamic colors for dark mode
  const bgColor = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedTextColor = useColorModeValue("gray.500", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  // const hoverBg = useColorModeValue("gray.50", "gray.700")

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
                  alt="SaaS Template Logo"
                  width="32"
                  height="32"
                  style={{ display: 'inline-block' }}
                />
              </Box>
              <Heading as="h2" fontSize="1.5rem" fontWeight="700" color={textColor}>
                SaaS Template
              </Heading>
            </Flex>
          </RouterLink>
          <Heading as="h1" fontSize="1.8rem" mb={2} color={textColor}>
            {t('auth.createAccount')}
          </Heading>
          <Text color={mutedTextColor}>
            {t('auth.joinUs')}
          </Text>
        </Flex>

        <Stack gap={5}>
          <Box>
            <Text fontWeight="500" mb={2} color={textColor}>
              {t('auth.name')}
            </Text>
            <Field
              invalid={!!errors.full_name}
              errorText={errors.full_name?.message}
            >
              <InputGroup w="100%" startElement={<FiUser color={useColorModeValue("gray.500", "gray.400")} />}>
                <Input
                  id="full_name"
                  minLength={3}
                  {...register("full_name", {
                    required: t('validation.nameRequired'),
                  })}
                  placeholder={t('auth.yourName')}
                  type="text"
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
            <Text fontWeight="500" mb={2} color={textColor}>
              {t('auth.email')}
            </Text>
            <Field invalid={!!errors.email} errorText={errors.email?.message}>
              <InputGroup w="100%" startElement={<FiMail color={useColorModeValue("gray.500", "gray.400")} />}>
                <Input
                  id="email"
                  {...register("email", {
                    required: t('validation.emailRequired'),
                    pattern: emailPattern,
                  })}
                  placeholder={t('auth.yourEmail')}
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
            <Text fontWeight="500" mb={2} color={textColor}>
              {t('auth.password')}
            </Text>
            <PasswordInput
              type="password"
              startElement={<FiLock color={useColorModeValue("gray.500", "gray.400")} />}
              {...register("password", passwordRules(t('validation.passwordRequired')))}
              placeholder={t('auth.setPassword')}
              errors={errors}
              borderRadius="10px"
              borderColor={borderColor}
              color={textColor}
              _placeholder={{ color: mutedTextColor }}
            />
          </Box>

          <Box>
            <Text fontWeight="500" mb={2} color={textColor}>
              {t('auth.confirmPassword')}
            </Text>
            <PasswordInput
              type="password"
              startElement={<FiLock color={useColorModeValue("gray.500", "gray.400")} />}
              {...register("confirm_password", confirmPasswordRules(getValues))}
              placeholder={t('auth.confirmPassword')}
              errors={errors}
              borderRadius="10px"
              borderColor={borderColor}
              color={textColor}
              _placeholder={{ color: mutedTextColor }}
            />
          </Box>

          <Box mb={2}>
            <Checkbox color={primaryColor}>
              <Text fontSize="0.9rem" color={textColor}>
                {t('auth.iAgree')} <Text as="span" style={{ color: primaryColor, textDecoration: 'none', cursor: 'pointer' }}>{t('auth.terms')}</Text> {t('auth.and')+ " "} 
                <Text as="span" style={{ color: primaryColor, textDecoration: 'none', cursor: 'pointer' }}>{t('auth.privacy')}</Text>
              </Text>
            </Checkbox>
          </Box>

          <Button 
            variant="solid" 
            type="submit" 
            loading={isSubmitting || mutation.isPending} 
            size="md"
            bg={primaryColor}
            color="white"
            _hover={{ bg: primaryDarkColor }}
            borderRadius="10px"
            h="45px"
            fontSize="md"
            w="100%"
          >
            {t('auth.signup')}
          </Button>
        </Stack>

        <AuthError error={signupError} t={t} />

        {/* <Box textAlign="center" my={6}>
          <Text color={mutedTextColor} mb={4}>
            {t('auth.orSignupWith')}
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

        <Text textAlign="center" color={textColor}>
          {t('auth.alreadyHaveAccount')} {" "}
          <RouterLink to="/login" style={{ color: primaryColor, textDecoration: 'none', fontWeight: '500' }}>
            {t('auth.login')}
          </RouterLink>
        </Text>
      </Container>
    </Box>
  )
}

export default SignUp
