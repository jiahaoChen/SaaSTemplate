import {
  Box,
  Button,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Input,
  Text,
  Spinner,
  Image,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import {
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaSitemap,
  FaExclamationTriangle,
  FaGlobe,
  FaUser,
} from "react-icons/fa"
import { Link as RouterLink } from "@tanstack/react-router"
import { MindmapsService, UsersService } from "../../../client/sdk.gen"
import type { MindMapPublic } from "../../../client/types.gen"
import { mindmapTheme } from "../../../theme/mindmap"
import { colors } from "../../../theme/tokens"
import { toaster } from "../../../components/ui/toaster"
import { useColorModeValue } from "../../../components/ui/color-mode"
import { useTranslation } from "react-i18next"
import { countMindmapNodes } from "../../../hooks/useMindmapNodeCount"

// Updated toast function using the Chakra UI toaster
const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
  toaster.create({
    title: message,
    type: type,
    duration: 3000,
  })
}

interface PublicMindMapCardProps {
  mindMap: MindMapPublic
}

const PublicMindMapCard = ({
  mindMap,
}: PublicMindMapCardProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const [publisherName, setPublisherName] = useState<string>("");
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'zh-TW', {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }
  
  // Fetch the publisher's name
  useEffect(() => {
    const fetchPublisherName = async () => {
      try {
        if (mindMap.user_id) {
          const user = await UsersService.readUserById({ userId: mindMap.user_id });
          setPublisherName(user.full_name || user.email);
        }
      } catch (error) {
        console.error("Error fetching publisher name:", error);
        setPublisherName(t("mindmap.anonymousUser", "Anonymous"));
      }
    };
    
    fetchPublisherName();
  }, [mindMap.user_id, t]);
  
  // Count nodes in the mindmap
  const nodeCount = countMindmapNodes(mindMap.markmap)
  
  const cardBg = useColorModeValue("white", "gray.800")
  const cardHoverBg = useColorModeValue("white", "gray.700")
  const cardShadow = useColorModeValue(mindmapTheme.shadow, "dark-lg")
  const cardHoverShadow = useColorModeValue("xl", "2xl")
  const headingColor = useColorModeValue(mindmapTheme.colors.dark, "white")
  const textColor = useColorModeValue(mindmapTheme.colors.grayDark, "gray.400")
  const bgThumbnail = useColorModeValue(mindmapTheme.colors.light, "gray.700")
  const iconColor = useColorModeValue(mindmapTheme.colors.primary, colors.primary[300])
  const publishedByColor = useColorModeValue("blue.500", "blue.300")

  return (
    <Box
      bg={cardBg}
      borderRadius={mindmapTheme.borderRadius}
      boxShadow={cardShadow}
      overflow="hidden"
      transition={mindmapTheme.transition}
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: cardHoverShadow,
        bg: cardHoverBg
      }}
    >
      {/* Thumbnail */}
      <RouterLink to="/mindmap/detail/$id" params={{ id: mindMap.id.toString() }}>
        <Box
          bg={bgThumbnail}
          height="160px"
          position="relative"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          {mindMap.thumbnail_url ? (
            <Image
              src={mindMap.thumbnail_url}
              alt={`${mindMap.video_title} thumbnail`}
              objectFit="cover"
              w="100%"
              h="100%"
            />
          ) : (
            <Icon
              as={FaSitemap}
              color={iconColor}
              boxSize="50px"
              opacity={0.7}
            />
          )}
        </Box>
      </RouterLink>

      {/* Content */}
      <Box p={4}>
        <Flex justify="space-between" align="center" mb={2}>
          <Heading
            as="h3"
            size="md"
            color={headingColor}
            textOverflow="ellipsis"
            overflow="hidden"
            whiteSpace="nowrap"
          >
            <RouterLink to="/mindmap/detail/$id" params={{ id: mindMap.id.toString() }}>{mindMap.video_title}</RouterLink>
          </Heading>
        </Flex>

        <Flex
          fontSize="sm"
          color={textColor}
          mb={2}
          align="center"
        >
          <Icon as={FaCalendarAlt} mr={1} />
          <Text>{t("mindmap.createdAt", "Created on")} {formatDate(mindMap.created_at)}</Text>
        </Flex>

        <Flex
          fontSize="sm"
          color={publishedByColor}
          mb={3}
          align="center"
        >
          <Icon as={FaUser} mr={1} />
          <Text>{t("mindmap.publishedBy", "Published by")} {publisherName || t("mindmap.anonymousUser", "Anonymous")}</Text>
        </Flex>

        <Flex justify="space-between" fontSize="sm" color={textColor}>
          <Text>{nodeCount} {t("mindmap.nodes", "nodes")}</Text>
          <Flex align="center">
            <Icon as={FaGlobe} mr={1} />
            <Text>{t("mindmap.public", "Public")}</Text>
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

const PublicMindMapLibrary = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState("")
  const [mindMaps, setMindMaps] = useState<MindMapPublic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 9
  
  // Dark mode color values
  const bgColor = useColorModeValue("#f8fafc", "gray.800")
  const cardBg = useColorModeValue("white", "gray.800")
  const headingColor = useColorModeValue("gray.800", "white")
  const textColor = useColorModeValue(mindmapTheme.colors.grayDark, "gray.400")
  const inputBg = useColorModeValue("white", "gray.700")
  const inputBorder = useColorModeValue("gray.200", "gray.600")

  // Fetch public mindmaps
  const fetchPublicMindmaps = async (currentPage = page) => {
    try {
      setIsLoading(true)
      setError(null)
      const skip = (currentPage - 1) * itemsPerPage
      
      // First try with public_only parameter
      try {
        const response = await MindmapsService.readMindmaps({
          skip,
          limit: itemsPerPage,
          public_only: true
        })
        
        setMindMaps(response.data)
        setTotalCount(response.count)
      } catch (err) {
        // If public_only fails, fall back to client-side filtering
        console.warn("Public_only parameter failed, falling back to client-side filtering");
        const response = await MindmapsService.readMindmaps({
          skip,
          limit: itemsPerPage
        })
        
        // Filter for only public mindmaps
        const publicMindmaps = response.data.filter(mindmap => mindmap.is_public === true)
        setMindMaps(publicMindmaps)
        
        // Adjust the count to reflect only public mindmaps - rough estimate
        setTotalCount(Math.round(response.count * (publicMindmaps.length / response.data.length) || 0))
      }
    } catch (err) {
      setError("Failed to load public mindmaps")
      showToast(t("mindmap.loadFailed", "Failed to load"), "error")
      console.error("Error loading public mindmaps:", err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchPublicMindmaps()
  }, [page])

  // Filter mindmaps based on search query
  const filteredMindMaps = mindMaps.filter((mindMap) =>
    mindMap.video_title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Calculate total nodes across all filtered mindmaps
  const totalNodes = filteredMindMaps.reduce((sum, mindMap) => 
    sum + countMindmapNodes(mindMap.markmap), 0
  )

  // Calculate total pages
  const totalPages = Math.ceil(totalCount / itemsPerPage)

  if (isLoading) {
    return (
      <Flex justify="center" align="center" h="400px">
        <Spinner size="xl" color={colors.primary[500]} />
      </Flex>
    )
  }

  if (mindMaps.length === 0 && !searchQuery) {
    return (
      <Flex direction="column" align="center" justify="center" minH="70vh" p={8}>
        <Icon
          as={FaGlobe}
          boxSize={20}
          color={useColorModeValue(colors.primary[100], "gray.700")}
          mb={6}
        />
        <Heading size="lg" textAlign="center" mb={4}>
          {t("mindmap.noPublicMindmaps", "No Public Mind Maps")}
        </Heading>
        <Text textAlign="center" maxW="400px" mb={8} color={useColorModeValue("gray.600", "gray.400")}>
          {t("mindmap.noPublicMindmapsDesc", "There are no public mind maps available. Create and share your own mind maps to contribute to the community.")}
        </Text>
        <RouterLink to="/mindmap/create">
          <Button 
            colorScheme="purple"
            size="lg"
          >
            <Flex align="center">
              <Icon as={FaPlus} mr={2} />
              {t("mindmap.createAndShare", "Create and Share Mind Map")}
            </Flex>
          </Button>
        </RouterLink>
      </Flex>
    )
  }

  if (mindMaps.length === 0 && searchQuery) {
    return (
      <Flex direction="column" align="center" py={10}>
        <Icon
          as={FaSearch}
          boxSize={12}
          color={useColorModeValue("gray.300", "gray.600")}
          mb={4}
        />
        <Heading size="md" mb={2}>{t("mindmap.noMatchingPublicMindmaps", "No Matching Public Mind Maps")}</Heading>
        <Text>{t("mindmap.tryDifferentSearch", "Try different search terms or adjust your search criteria.")}</Text>
        <Button
          mt={6}
          onClick={() => {
            setSearchQuery("");
            fetchPublicMindmaps(1);
          }}
        >
          <Flex align="center">
            <Icon as={FaSearch} mr={2} />
            {t("mindmap.retry", "Retry")}
          </Flex>
        </Button>
      </Flex>
    )
  }

  return (
    <Box bg={bgColor} minHeight="100vh" py={10}>
      <Container maxW="1200px">
        <Box mb={10}>
          <Flex justify="space-between" align="center" mb={5} wrap={{ base: "wrap", md: "nowrap" }}>
            <Heading as="h1" size="xl" mb={{ base: 4, md: 0 }} color={headingColor}>
              <Flex align="center">
                <Icon as={FaGlobe} mr={2} color={colors.primary[500]} />
                {t("mindmap.publicLibraryTitle", "Public Mind Map Library")}
              </Flex>
            </Heading>
          </Flex>
          
          <Flex justifyContent="space-between" mb={8} wrap={{ base: "wrap", md: "nowrap" }} gap={4}>
            <Flex flex={{ base: "100%", md: 1 }} position="relative" maxW={{ base: "100%", md: "300px" }}>
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1}>
                <Icon as={FaSearch} color={textColor} />
              </Box>
              <Input
                placeholder={t("mindmap.searchPublicPlaceholder", "Search public mind maps...")}
                pl={10}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={inputBg}
                borderColor={inputBorder}
                _hover={{ borderColor: "blue.300" }}
                _focus={{ borderColor: mindmapTheme.colors.primary }}
              />
            </Flex>
            
            {filteredMindMaps.length > 0 && (
              <Flex align="center" color={textColor} fontSize="sm">
                <Text mr={4}>
                  {t("mindmap.totalPublicCount", "Total {{count}} public mind maps", { count: filteredMindMaps.length })}
                </Text>
                <Text>
                  {t("mindmap.totalNodes", "Total {{count}} nodes", { count: totalNodes })}
                </Text>
              </Flex>
            )}
          </Flex>
          
          {isLoading ? (
            <Flex justify="center" py={10}>
              <Spinner size="xl" color={mindmapTheme.colors.primary} />
            </Flex>
          ) : error ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={cardBg}
              borderRadius={mindmapTheme.borderRadius}
              boxShadow={useColorModeValue(mindmapTheme.shadow, "dark-lg")}
            >
              <Icon as={FaExclamationTriangle} color="red.500" fontSize="5xl" mb={4} />
              <Heading size="md" mb={2} color={headingColor}>{t("mindmap.loadFailed", "Failed to Load")}</Heading>
              <Text color={textColor}>{error}</Text>
              <Button mt={4} onClick={() => fetchPublicMindmaps()}>{t("mindmap.retry", "Retry")}</Button>
            </Flex>
          ) : (
            <Grid
              templateColumns={{
                base: "1fr",
                md: "repeat(2, 1fr)",
                lg: "repeat(3, 1fr)",
              }}
              gap={6}
              mb={8}
            >
              {filteredMindMaps.map((mindMap) => (
                <PublicMindMapCard
                  key={mindMap.id}
                  mindMap={mindMap}
                />
              ))}
            </Grid>
          )}
          
          {/* Pagination */}
          {totalPages > 1 && (
            <Flex justify="center" mt={8}>
              <Button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                mr={2}
              >
                {t("common.previous", "Previous")}
              </Button>
              
              <Text mx={4} alignSelf="center">
                {t("common.page", "Page")} {page} {t("common.of", "of")} {totalPages}
              </Text>
              
              <Button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                ml={2}
              >
                {t("common.next", "Next")}
              </Button>
            </Flex>
          )}
        </Box>
      </Container>
    </Box>
  )
}

export default PublicMindMapLibrary 