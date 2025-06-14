import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react"
import { useState } from "react"
import { FaArrowRight } from "react-icons/fa"
import { Link as RouterLink } from "@tanstack/react-router"
import { mindmapTheme } from "../../../theme/mindmap"

const CTA = () => {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setIsSubmitting(true)
    // Simulate API request
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSubmitted(true)
      setEmail("")
    }, 1500)
  }

  return (
    <Box
      py={20}
      bg={`linear-gradient(135deg, ${mindmapTheme.colors.primary} 0%, ${mindmapTheme.colors.secondary} 100%)`}
      color="white"
    >
      <Container maxW="1200px">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={10}
        >
          <Box flex="1" textAlign={{ base: "center", lg: "left" }}>
            <Heading as="h2" size="xl" mb={4}>
              準備好提升您的學習體驗了嗎？
            </Heading>
            <Text fontSize="lg" mb={6} opacity={0.9}>
              立即註冊，開始將YouTube影片轉換為思維導圖，提高學習效率和記憶力。
            </Text>
            <Flex gap={4} direction={{ base: "column", md: "row" }} justify={{ base: "center", lg: "flex-start" }}>
              <RouterLink to="/signup">
                <Button
                  size="lg"
                  bg="white"
                  color={mindmapTheme.colors.primary}
                  _hover={{ bg: "gray.100" }}
                  px={8}
                >
                  免費註冊
                </Button>
              </RouterLink>
              <Button
                size="lg"
                variant="outline"
                borderColor="white"
                _hover={{ bg: "rgba(255,255,255,0.1)" }}
                px={8}
                cursor="pointer"
              >
                了解更多
              </Button>
            </Flex>
          </Box>

          <Box
            flex="1"
            bg="rgba(255,255,255,0.1)"
            p={8}
            borderRadius={mindmapTheme.borderRadius}
            backdropFilter="blur(10px)"
          >
            <Heading as="h3" size="md" mb={4} textAlign="center">
              訂閱我們的電子報
            </Heading>
            <Text fontSize="sm" mb={6} textAlign="center" opacity={0.9}>
              獲取最新的功能更新、使用技巧和獨家優惠
            </Text>

            {isSubmitted ? (
              <Box
                textAlign="center"
                p={4}
                bg="rgba(255,255,255,0.2)"
                borderRadius={mindmapTheme.borderRadius}
              >
                <Text fontWeight="bold">感謝您的訂閱！</Text>
                <Text fontSize="sm" mt={2}>
                  我們已將確認郵件發送至您的信箱
                </Text>
              </Box>
            ) : (
              <form onSubmit={handleSubmit}>
                <Flex>
                  <Input
                    type="email"
                    placeholder="您的電子郵件"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    bg="white"
                    color="gray.800"
                    _placeholder={{ color: "gray.400" }}
                    borderRadius={mindmapTheme.borderRadius}
                    required
                  />
                  <Button
                    h="1.75rem"
                    size="sm"
                    type="submit"
                    disabled={isSubmitting}
                    bg={mindmapTheme.colors.secondary}
                    _hover={{ bg: mindmapTheme.colors.primary }}
                    borderRadius="full"
                    ml={2}
                  >
                    <FaArrowRight />
                  </Button>
                </Flex>
              </form>
            )}

            <Text fontSize="xs" mt={4} textAlign="center" opacity={0.7}>
              我們尊重您的隱私，不會向第三方分享您的資訊
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}

export default CTA