import {
  Box,
  Container,
  Flex,
  Heading,
  Icon,
  Image,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react"
import React from "react"
import { FaLink, FaRobot, FaSitemap } from "react-icons/fa"
import { mindmapTheme } from "../../../theme/mindmap"

const steps = [
  {
    title: "貼上YouTube連結",
    description: "只需複製並貼上您想要分析的YouTube影片連結",
    icon: FaLink,
  },
  {
    title: "AI自動處理",
    description: "我們的AI會自動分析影片內容，提取關鍵概念和結構",
    icon: FaRobot,
  },
  {
    title: "獲取思維導圖",
    description: "幾分鐘內，您就能獲得結構化的思維導圖，幫助理解和記憶",
    icon: FaSitemap,
  },
]

const HowItWorks: React.FC = () => {
  const orientation = useBreakpointValue({ base: "vertical", md: "horizontal" })

  return (
    <Box py={16} bg={mindmapTheme.colors.light}>
      <Container maxW="1200px">
        <Box textAlign="center" mb={16}>
          <Heading
            as="h2"
            size="xl"
            mb={4}
            color={mindmapTheme.colors.dark}
          >
            如何使用
          </Heading>
          <Text
            fontSize="lg"
            color={mindmapTheme.colors.grayDark}
            maxW="700px"
            mx="auto"
          >
            只需簡單三步，即可將YouTube影片轉換為思維導圖
          </Text>
        </Box>

        <Flex direction={orientation} gap={4} mb={16}>
          {steps.map((step, index) => (
            <Box key={index} borderWidth={1} borderRadius="md" p={4} flex="1">
              <Icon as={step.icon} boxSize={6} color={mindmapTheme.colors.primary} />
              <Heading as="h3" size="md" color={mindmapTheme.colors.dark}>
                {step.title}
              </Heading>
              <Text color={mindmapTheme.colors.grayDark}>{step.description}</Text>
            </Box>
          ))}
        </Flex>

        <Box
          bg="white"
          p={6}
          borderRadius={mindmapTheme.borderRadius}
          boxShadow={mindmapTheme.shadow}
          overflow="hidden"
        >
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <Box flex="1">
              <Heading as="h3" size="lg" mb={4} color={mindmapTheme.colors.dark}>
                實際案例展示
              </Heading>
              <Text color={mindmapTheme.colors.grayDark} mb={4}>
                查看我們如何將一個關於人工智能的TED演講轉換為清晰的思維導圖，幫助用戶快速理解和記憶關鍵概念。
              </Text>
              <Text color={mindmapTheme.colors.grayDark}>
                思維導圖不僅提取了演講中的主要觀點，還展示了它們之間的關聯，讓複雜的內容變得簡單易懂。
              </Text>
            </Box>
            <Box flex="1">
              <Image
                src="https://placehold.co/800x500/e6e0ff/333333/png?text=MindMap+Example"
                alt="思維導圖示例"
                borderRadius={mindmapTheme.borderRadius}
                boxShadow={mindmapTheme.shadow}
              />
            </Box>
          </Flex>
        </Box>
      </Container>
    </Box>
  )
}

export default HowItWorks 