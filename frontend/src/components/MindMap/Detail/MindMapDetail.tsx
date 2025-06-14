import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Icon,
  Text,
  Spinner,
} from "@chakra-ui/react"
// import { useToast } from "@chakra-ui/toast"
import React, { useState, useEffect, useRef } from "react"
import {
  FaCalendarAlt,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaSitemap,
} from "react-icons/fa"
import MindMapLayout from "../Layout/MindMapLayout"
import { mindmapTheme } from "../../../theme/mindmap"
import MindMapViewer from "./MindMapViewer"
import MindMapSummary from "./MindMapSummary"
import VideoPlayer, { VideoPlayerRef } from "./VideoPlayer"
import { MindmapsService } from "../../../client/sdk.gen"
import type { MindMapPublic } from "../../../client/types.gen"
import { useColorModeValue } from "@/components/ui/color-mode"
import useLanguage from "@/hooks/useLanguage"
// import { LanguageSwitcher } from "@/components/ui/language-switcher"

// Extended interface for MindMap detail data
interface MindMapDetailType extends MindMapPublic {
  node_count?: number;
  view_count?: number;
  is_favorite?: boolean;
  tags?: string[];
}

interface MindMapDetailProps {
  id: string;
}

const MindMapDetail: React.FC<MindMapDetailProps> = ({ id }) => {
  const { t } = useLanguage()
  const mindmapId = id ? Number(id) : undefined
  const [mindMapData, setMindMapData] = useState<MindMapDetailType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const videoPlayerRef = useRef<VideoPlayerRef>(null)
  const [showMindMap, setShowMindMap] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  // Color mode values
  const eyeButtonBg = useColorModeValue("rgba(255, 255, 255, 0.7)", "rgba(0, 0, 0, 0.3)");
  const eyeButtonColor = useColorModeValue("inherit", "gray");

  useEffect(() => {
    const fetchMindMapData = async () => {
      try {
        if (!mindmapId) {
          setError(t("mindmap.error"))
          setIsLoading(false)
          return
        }

        setIsLoading(true)
        setError(null)
        const response = await MindmapsService.readMindmap({ mindmapId })
        const extendedData: MindMapDetailType = {
          ...response,
          is_favorite: false, // This should come from API
          node_count: 0, // This should come from API
          view_count: 0, // This should come from API
          tags: [], // This should come from API
        }
        setMindMapData(extendedData)
      } catch (err) {
        setError(t("mindmap.loadFailed"))
        console.error("Error fetching mindmap:", err)
      } finally {
        setIsLoading(false)
      }
    }

    if (mindmapId) {
      fetchMindMapData()
    }
  }, [mindmapId, t])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <MindMapLayout>
        <Container maxW="1200px" py={8}>
          <Flex justify="center" align="center" minH="400px">
            <Spinner size="xl" color="purple.500" />
          </Flex>
        </Container>
      </MindMapLayout>
    )
  }

  if (error || !mindMapData) {
    return (
      <MindMapLayout>
        <Container maxW="1200px" py={8}>
          <Box
            textAlign="center"
            py={12}
            px={6}
            bg="white"
            borderRadius={mindmapTheme.borderRadius}
            boxShadow={mindmapTheme.shadow}
          >
            <Icon
              as={FaSitemap}
              boxSize="50px"
              color="red.500"
              opacity={0.5}
              mb={4}
            />
            <Heading as="h3" size="lg" mb={2} color="red.500">
              {t("mindmap.loadFailed")}
            </Heading>
            <Text color={mindmapTheme.colors.grayDark} mb={6}>
              {error || t("mindmap.loadFailedDesc", "Unable to load mindmap data")}
            </Text>
            <Button
              colorScheme="purple"
              onClick={() => window.location.reload()}
            >
              {t("mindmap.retry")}
            </Button>
          </Box>
        </Container>
      </MindMapLayout>
    )
  }

  return (
    <Container maxW="1200px" py={8}>
      {/* Language Switcher */}
      {/* <Flex justifyContent="flex-end" mb={4}>
        <LanguageSwitcher />
      </Flex> */}
      
      {/* 頭部信息 */}
      <Box mb={8}>
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          mb={4}
        >
          <Heading as="h1" size="xl" color={mindmapTheme.colors.dark}>
            {mindMapData.video_title}
          </Heading>

          <Flex mt={{ base: 4, md: 0 }} gap={2}>
            {/* {<Button
              size="sm"
              colorScheme="purple"
              variant="solid"
              onClick={handleFavoriteToggle}
            >
              <Icon as={FaBookmark} mr={2} />
              {isFavorite ? t("mindmap.unfavorite") : t("mindmap.favorite")}
            </Button> */}
            {/*
            <Button
              size="sm"
              colorScheme="blue"
              variant="outline"
              onClick={handleRegenerateMindmap}
              disabled={isRegenerating}
            >
              {isRegenerating ? (
                <>
                  <Spinner size="xs" mr={2} />
                  {t("mindmap.regenerating")}
                </>
              ) : (
                <>
                  <Icon as={FaSync} mr={2} />
                  {t("mindmap.improvingTimestamps")}
                </>
              )}
            </Button>
            <Button
              size="sm"
              colorScheme="gray"
              variant="outline"
            >
              <Icon as={FaShare} mr={2} />
              {t("mindmap.share")}
            </Button> */}
            {/* <Button
              size="sm"
              colorScheme="gray"
              variant="outline"
            >
              <Icon as={FaDownload} mr={2} />
              {t("mindmap.download")}
            </Button> */}
            {/* <Button
              size="sm"
              colorScheme="purple"
            >
              <Icon as={FaPencilAlt} mr={2} />
              {t("common.edit")}
            </Button> */}
          </Flex>
        </Flex>

        <Flex
          wrap="wrap"
          gap={4}
          align="center"
          color={mindmapTheme.colors.grayDark}
          fontSize="sm"
        >
          <Flex align="center">
            <Icon as={FaCalendarAlt} mr={1} />
            <Text>{t("mindmap.createdAt")} {formatDate(mindMapData.created_at)}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaClock} mr={1} />
            <Text>{t("mindmap.lastEdited")} {formatDate(mindMapData.updated_at || mindMapData.created_at)}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaSitemap} mr={1} />
            <Text>{mindMapData.node_count || 0} {t("mindmap.nodes")}</Text>
          </Flex>
          <Flex align="center">
            <Icon as={FaEye} mr={1} />
            <Text>{mindMapData.view_count || 0} {t("mindmap.views")}</Text>
          </Flex>
          {mindMapData.tags && mindMapData.tags.length > 0 && (
            <Flex gap={2} ml="auto">
              {mindMapData.tags.map((tag, index) => (
                <Box
                  key={index}
                  as="span"
                  bg="purple.100"
                  color="purple.800"
                  px={2}
                  py={1}
                  borderRadius="md"
                  fontSize="sm"
                  mr={2}
                >
                  {tag}
                </Box>
              ))}
            </Flex>
          )}
        </Flex>
      </Box>

      {/* Video and MindMap Integration */}
      <Box 
        mb={8} 
        position="relative" 
        ref={containerRef}
        css={{
          '&:fullscreen': {
            padding: '20px',
            background: 'black',
          }
        }}
      >
        {/* MindMap Toggle Button */}
        <Flex 
          position="absolute" 
          top="10px" 
          right="10px" 
          zIndex="10" 
          bg={eyeButtonBg}
          p={2} 
          borderRadius="md"
          alignItems="center"
        >
          <Button
            size="sm"
            colorScheme="purple"
            variant="ghost"
            onClick={() => setShowMindMap(!showMindMap)}
            color={eyeButtonColor}
            aria-label={showMindMap ? t("mindmap.hideMindmap") : t("mindmap.showMindmap")}
          >
            {showMindMap ? <Icon as={FaEyeSlash} /> : <Icon as={FaEye} />}
          </Button>
        </Flex>
        
        {/* Overlapping Video and MindMap */}
        <Box position="relative">
          {/* Video Player */}
          <Box>
            <VideoPlayer ref={videoPlayerRef} mindMapData={mindMapData} />
          </Box>
          
          {/* Overlaid MindMap with visibility control instead of conditional rendering */}
          <Box 
            position="absolute" 
            top="0" 
            left="0" 
            width="100%" 
            height="100%" 
            bg="rgba(0, 0, 0, 0.1)" 
            zIndex="5"
            overflow="hidden"
            borderRadius={mindmapTheme.borderRadius}
            pointerEvents={showMindMap ? "auto" : "none"}
            opacity={showMindMap ? 1 : 0}
            visibility={showMindMap ? "visible" : "hidden"}
            transition="opacity 0.3s ease, visibility 0.3s ease"
            css={{
              ':fullscreen &': {
                background: 'rgba(0, 0, 0, 0.1)',
                width: '100%',
                height: '100%',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }
            }}
          >
            <MindMapViewer 
              mindMapData={mindMapData} 
              videoPlayerRef={videoPlayerRef} 
              parentContainerRef={containerRef}
            />
          </Box>
        </Box>
      </Box>
      
      <Box mb={8}>
        <MindMapSummary mindMapData={mindMapData} />
      </Box>
    </Container>
  )
}

export default MindMapDetail 