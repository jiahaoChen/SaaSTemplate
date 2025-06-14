import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react"

import { Link as RouterLink } from "@tanstack/react-router"
import { mindmapTheme } from "../../../theme/mindmap"

const Hero = () => {
  return (
    <Box
      bg="linear-gradient(135deg, #f5f7fa 0%, #e6e0ff 100%)"
      py={{ base: 16, md: 24 }}
      position="relative"
      overflow="hidden"
    >
      <Container maxW="1200px">
        <Flex
          direction={{ base: "column", lg: "row" }}
          align="center"
          justify="space-between"
          gap={{ base: 10, lg: 0 }}
        >
          <VStack
            align={{ base: "center", lg: "flex-start" }}
            gap={6}
            maxW={{ base: "100%", lg: "50%" }}
            textAlign={{ base: "center", lg: "left" }}
          >
            <Heading
              as="h1"
              size="2xl"
              fontWeight="bold"
              lineHeight="1.2"
              color={mindmapTheme.colors.dark}
            >
              將 YouTube 影片轉換為
              <Box as="span" color={mindmapTheme.colors.primary}>
                {" "}
                思維導圖
              </Box>
            </Heading>

            <Text fontSize="xl" color={mindmapTheme.colors.grayDark}>
              透過我們的AI技術，自動將YouTube影片內容轉換為結構化的思維導圖，幫助您更有效地學習和理解複雜概念。
            </Text>

            <Flex
              gap={4}
              direction={{ base: "column", sm: "row" }}
              w={{ base: "100%", sm: "auto" }}
            >
              <RouterLink to="/signup">
                <Button
                  size="lg"
                  bg={mindmapTheme.colors.primary}
                  color="white"
                  _hover={{ bg: mindmapTheme.colors.primaryDark }}
                  px={8}
                >
                  免費試用
                </Button>
              </RouterLink>
              <Button
                size="lg"
                variant="outline"
                borderColor={mindmapTheme.colors.primary}
                color={mindmapTheme.colors.primary}
                _hover={{ bg: mindmapTheme.colors.primaryLight }}
                px={8}
                cursor="pointer"
              >
                了解更多
              </Button>
            </Flex>

            <Text fontSize="sm" color={mindmapTheme.colors.grayDark}>
              無需信用卡 · 14天免費試用 · 隨時取消
            </Text>
          </VStack>

          <Box
            maxW={{ base: "100%", lg: "45%" }}
            position="relative"
            zIndex={1}
          >
            <Image
              src="https://placehold.co/600x400/e6e0ff/333333/png?text=YouTube+MindMap+Demo"
              alt="YouTube MindMap 示範"
              borderRadius="lg"
              boxShadow={mindmapTheme.shadowLg}
            />
          </Box>
        </Flex>
      </Container>

      {/* 背景裝飾 */}
      <Box
        position="absolute"
        top="-10%"
        right="-10%"
        width="500px"
        height="500px"
        borderRadius="full"
        bg={`${mindmapTheme.colors.primaryLight}50`}
        zIndex={0}
      />
      <Box
        position="absolute"
        bottom="-20%"
        left="-10%"
        width="400px"
        height="400px"
        borderRadius="full"
        bg={`${mindmapTheme.colors.primaryLight}30`}
        zIndex={0}
      />
    </Box>
  )
}

export default Hero 