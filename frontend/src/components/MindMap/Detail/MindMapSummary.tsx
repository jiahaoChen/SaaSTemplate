import {
  Box,
  Button,
  Flex,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react"
import React from "react"
import { FaCopy } from "react-icons/fa"
import { mindmapTheme } from "../../../theme/mindmap"
import { colors } from "../../../theme/tokens"
import { MindMapPublic } from "@/client/types.gen"
import { toaster } from "@/components/ui/toaster"
import { useColorModeValue } from "@/components/ui/color-mode"

interface MindMapSummaryProps {
  mindMapData: MindMapPublic
}

const MindMapSummary: React.FC<MindMapSummaryProps> = ({ mindMapData }) => {
  // Define colors based on color mode
  const boxBg = useColorModeValue("white", "gray.800")
  const boxShadow = useColorModeValue(mindmapTheme.shadow, "dark-lg")
  const headingColor = useColorModeValue(mindmapTheme.colors.dark, "white")
  const textColor = useColorModeValue(mindmapTheme.colors.grayDark, "gray.300")
  const contentBg = useColorModeValue(mindmapTheme.colors.light, "gray.700")
  const bulletColor = useColorModeValue(mindmapTheme.colors.primary, colors.primary[300])
  const pointTextColor = useColorModeValue(mindmapTheme.colors.dark, "white")
  
  const handleCopy = () => {
    const textToCopy = `${mindMapData.video_title}\n\n${mindMapData.one_sentence_summary || ''}\n\nTakeaways：\n${mindMapData.takeaways}`
    navigator.clipboard.writeText(textToCopy)
    // 這裡可以添加一個通知提示用戶已複製成功
    toaster.create({
      title: `Copy Success`,
      type: "success",
    })
  }

  // const handleDownload = () => {
  //   const textToDownload = `# ${mindMapData.video_title}\n\n${mindMapData.one_sentence_summary || ''}\n\n## 關鍵點：\n${mindMapData.takeaways.map((point) => `* ${point}`).join("\n") || ''}`
  //   const blob = new Blob([textToDownload], { type: "text/markdown" })
  //   const url = URL.createObjectURL(blob)
  //   const a = document.createElement("a")
  //   a.href = url
  //   a.download = `${mindMapData.video_title.replace(/\s+/g, "_")}_摘要.md`
  //   document.body.appendChild(a)
  //   a.click()
  //   document.body.removeChild(a)
  //   URL.revokeObjectURL(url)
  // }

  return (
    <Box
      bg={boxBg}
      borderRadius={mindmapTheme.borderRadius}
      boxShadow={boxShadow}
      p={6}
    >
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h2" size="lg" color={headingColor}>
          內容摘要
        </Heading>
        <Flex gap={2}>
          <Button
            size="sm"
            onClick={handleCopy}
            colorScheme="gray"
            variant="outline"
          >
            <Icon as={FaCopy} mr={2} />
            複製
          </Button>
          {/* <Button
            size="sm"
            onClick={handleDownload}
            colorScheme="purple"
          >
            <Icon as={FaDownload} mr={2} />
            下載 Markdown
          </Button> */}
        </Flex>
      </Flex>

      <Box mb={8}>
        <Heading as="h3" size="md" mb={2} color={headingColor}>
          概述
        </Heading>
        <Text color={textColor} whiteSpace="pre-line">
          {mindMapData.one_sentence_summary || '暫無摘要'}
        </Text>
      </Box>

      <Box>
        <Heading as="h3" size="md" mb={4} color={headingColor}>
          關鍵點
        </Heading>
        <Box
          bg={contentBg}
          p={4}
          borderRadius={mindmapTheme.borderRadius}
        >
          {mindMapData.takeaways?.split("\",").map((point, index) => {
            point = point.replace(/["{},]/g, '')
            return (
              <Flex key={index} mb={index < (mindMapData.takeaways?.length || 0) - 1 ? 3 : 0}>
                <Text
                  as="span"
                  color={bulletColor}
                  fontWeight="bold"
                  mr={2}
                >
                  •
                </Text>
                <Text color={pointTextColor}>{point}</Text>
              </Flex>
            )
          }) || <Text color={textColor}>暫無關鍵點</Text>}
        </Box>
      </Box>
    </Box>
  )
}

export default MindMapSummary 