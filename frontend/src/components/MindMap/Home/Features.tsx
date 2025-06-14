import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react"
import React from "react"
import {
  FaBrain,
  FaChartLine,
  FaCloudDownloadAlt,
  FaEdit,
  FaRobot,
  FaShareAlt,
} from "react-icons/fa"
import { mindmapTheme } from "../../../theme/mindmap"

interface FeatureCardProps {
  icon: React.ElementType
  title: string
  description: string
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
  return (
    <Box
      bg="white"
      p={6}
      borderRadius={mindmapTheme.borderRadius}
      boxShadow={mindmapTheme.shadow}
      transition={mindmapTheme.transition}
      _hover={{ transform: "translateY(-5px)", boxShadow: mindmapTheme.shadowLg }}
    >
      <Flex direction="column" align="flex-start">
        <Box
          bg={`${mindmapTheme.colors.primaryLight}`}
          p={3}
          borderRadius="full"
          mb={4}
        >
          <Icon as={icon} boxSize={6} color={mindmapTheme.colors.primary} />
        </Box>
        <Heading as="h3" size="md" mb={3} color={mindmapTheme.colors.dark}>
          {title}
        </Heading>
        <Text color={mindmapTheme.colors.grayDark}>{description}</Text>
      </Flex>
    </Box>
  )
}

const Features: React.FC = () => {
  const features = [
    {
      icon: FaRobot,
      title: "AI 自動分析",
      description: "我們的AI技術自動分析YouTube影片內容，提取關鍵概念和結構。",
    },
    {
      icon: FaBrain,
      title: "智能結構化",
      description: "將雜亂的影片內容轉換為有條理的思維導圖，突出重點和關聯。",
    },
    {
      icon: FaEdit,
      title: "自訂編輯",
      description: "靈活編輯生成的思維導圖，添加自己的想法和筆記。",
    },
    {
      icon: FaShareAlt,
      title: "一鍵分享",
      description: "輕鬆分享思維導圖給朋友、同學或同事，促進協作學習。",
    },
    {
      icon: FaCloudDownloadAlt,
      title: "多種格式導出",
      description: "支持多種格式導出，包括PNG、PDF、SVG等，方便整合到您的工作流程。",
    },
    {
      icon: FaChartLine,
      title: "學習進度追蹤",
      description: "追蹤您的學習進度，分析知識掌握程度，提升學習效率。",
    },
  ]

  return (
    <Box py={16} bg="white">
      <Container maxW="1200px">
        <Box textAlign="center" mb={16}>
          <Heading
            as="h2"
            size="xl"
            mb={4}
            color={mindmapTheme.colors.dark}
          >
            強大功能，提升學習效率
          </Heading>
          <Text
            fontSize="lg"
            color={mindmapTheme.colors.grayDark}
            maxW="700px"
            mx="auto"
          >
            YouTube MindMap 提供一系列強大功能，幫助您更有效地從影片中獲取和組織知識
          </Text>
        </Box>

        <Grid
          templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
          gap={8}
        >
          {features.map((feature, index) => (
            <GridItem key={index}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
              />
            </GridItem>
          ))}
        </Grid>
      </Container>
    </Box>
  )
}

export default Features 