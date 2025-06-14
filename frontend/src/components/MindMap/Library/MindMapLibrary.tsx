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
import { useState, useEffect, useRef } from "react"
import {
  FaCalendarAlt,
  FaPlus,
  FaSearch,
  FaSitemap,
  FaTrash,
  FaExclamationTriangle,
  FaShareAlt,
} from "react-icons/fa"
import { Link as RouterLink } from "@tanstack/react-router"
import { MindmapsService } from "../../../client/sdk.gen"
import type { MindMapPublic } from "../../../client/types.gen"
import { mindmapTheme } from "../../../theme/mindmap"
import { colors } from "../../../theme/tokens"
import { toaster } from "../../../components/ui/toaster"
import { useColorModeValue } from "@/components/ui/color-mode"
import {
  DialogRoot,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogContent,
  DialogBackdrop,
} from "../../../components/ui/dialog"
import useLanguage from "@/hooks/useLanguage"
import { countMindmapNodes } from "@/hooks/useMindmapNodeCount"

// Updated toast function using the Chakra UI toaster
const showToast = (message: string, type: "success" | "error" | "info" | "warning") => {
  toaster.create({
    title: message,
    type: type,
    duration: 3000,
  })
}

interface MindMapCardProps {
  mindMap: MindMapPublic
  onToggleShare: (id: number) => void
  onDeleteMindmap: (id: number) => void
  isShared?: boolean
}

const MindMapCard = ({
  mindMap,
  onToggleShare,
  onDeleteMindmap,
  isShared = false
}: MindMapCardProps) => {
  const { t, currentLanguage } = useLanguage();
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString(currentLanguage === 'en' ? 'en-US' : 'zh-TW', {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const [isOpen, setIsOpen] = useState(false)
  const cancelRef = useRef<HTMLButtonElement>(null)
  
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
      {/* 縮略圖 */}
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
          
          {/* Display public indicator if shared */}
          {Boolean(isShared) && (
            <Box
              position="absolute"
              top={2}
              right={2}
              bg="green.500"
              color="white"
              px={2}
              py={1}
              borderRadius="md"
              fontSize="xs"
              fontWeight="bold"
              display="flex"
              alignItems="center"
            >
              <Icon as={FaShareAlt} mr={1} />
              {t("mindmap.public", "Public")}
            </Box>
          )}
        </Box>
      </RouterLink>

      {/* 內容 */}
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
          <Flex>
            <Box 
              title={isShared ? t("mindmap.unshare", "Remove from public library") : t("mindmap.share", "Share to public library")}
              onClick={() => onToggleShare(mindMap.id)}
              cursor="pointer"
              mr={2}
              p={2}
              borderRadius="md"
              _hover={{
                bg: useColorModeValue("gray.100", "gray.700")
              }}
            >
              <Icon 
                as={FaShareAlt} 
                color={isShared ? "green.500" : "gray.400"} 
                boxSize="18px"
              />
            </Box>
            <Box position="relative">
              <Button
                variant="ghost"
                onClick={() => setIsOpen(true)}
                aria-label="Delete mind map"
                color={textColor}
              >
                <Icon as={FaTrash} />
              </Button>
              
              {/* 確認刪除對話框 */}
              <DialogRoot
                size={{ base: "xs", md: "md" }}
                placement="center"
                role="alertdialog"
                open={isOpen}
                onOpenChange={({ open }) => setIsOpen(open)}
              >
                <DialogBackdrop />
                <DialogContent>
                  <DialogHeader>{t("mindmap.confirmDelete", "刪除思維導圖")}</DialogHeader>
                  <DialogBody>
                    {t("mindmap.confirmDeleteDesc", "確定要刪除「{{title}}」嗎？此操作無法撤銷。", {title: mindMap.video_title})}
                  </DialogBody>
                  <DialogFooter>
                    <Button ref={cancelRef} onClick={() => setIsOpen(false)}>
                      {t("common.cancel", "取消")}
                    </Button>
                    <Button 
                      colorScheme="red" 
                      onClick={() => {
                        onDeleteMindmap(mindMap.id);
                        setIsOpen(false);
                      }} 
                      ml={3}
                    >
                      {t("common.delete", "刪除")}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </DialogRoot>
            </Box>
          </Flex>
        </Flex>

        <Flex
          fontSize="sm"
          color={textColor}
          mb={3}
          align="center"
        >
          <Icon as={FaCalendarAlt} mr={1} />
          <Text>{t("mindmap.createdAt", "建立於")} {formatDate(mindMap.created_at)}</Text>
        </Flex>

        <Flex justify="space-between" fontSize="sm" color={textColor}>
          <Text>{nodeCount} {t("mindmap.nodes", "節點")}</Text>
          <Text>0 {t("mindmap.views", "次瀏覽")}</Text>
        </Flex>
      </Box>
    </Box>
  )
}

const MindMapLibrary = () => {
  const { t } = useLanguage();
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
  const iconColor = useColorModeValue(mindmapTheme.colors.primary, colors.primary[300])

  // 將獲取思維導圖邏輯抽取成獨立函數
  const fetchMindmaps = async (currentPage = page) => {
    try {
      setIsLoading(true)
      setError(null)
      const skip = (currentPage - 1) * itemsPerPage
      const response = await MindmapsService.readMindmaps({
        skip,
        limit: itemsPerPage,
      })
      setMindMaps(response.data)
      setTotalCount(response.count)
    } catch (err) {
      setError("Failed to load mindmaps")
      showToast("加載思維導圖失敗", "error")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMindmaps()
  }, [page])

  const handleToggleShare = async (id: number) => {
    try {
      // Call the API to toggle the public status
      const currentMindMap = mindMaps.find(m => m.id === id);
      const isCurrentlyShared = currentMindMap?.is_public || false;
      
      try {
        // Try with the toggle-public endpoint
        await MindmapsService.togglePublicStatus({
          mindmapId: id
        });
      } catch (err) {
        // Fallback if the endpoint isn't available yet
        console.warn("Toggle public endpoint failed, fallback to update", err);
        await MindmapsService.updateMindmap({
          mindmapId: id,
          requestBody: {
            is_public: !isCurrentlyShared
          }
        });
      }
      
      // Show appropriate message based on current state
      if (isCurrentlyShared) {
        showToast(t("mindmap.unshareSuccess", "Mind map removed from public library"), "success");
      } else {
        showToast(t("mindmap.shareSuccess", "Mind map shared to public library"), "success");
      }
      
      // Refresh the list to see the updated state
      fetchMindmaps();
    } catch (err) {
      console.error("Failed to toggle share status:", err);
      showToast(t("mindmap.shareError", "Failed to update sharing status"), "error");
    }
  }

  // 實現刪除思維導圖的功能
  const handleDeleteMindmap = async (id: number) => {
    try {
      // 呼叫 API 刪除思維導圖
      await MindmapsService.deleteMindmap({
        mindmapId: id
      })
      
      // 顯示成功訊息
      showToast("思維導圖已成功刪除", "success")
      
      // 重新獲取當前頁數據，確保頁面保持填滿
      fetchMindmaps()
    } catch (err) {
      console.error("Failed to delete mindmap:", err)
      showToast("刪除思維導圖失敗", "error")
    }
  }

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

  // Replace the empty state text with i18n
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
          as={FaSitemap}
          boxSize={20}
          color={useColorModeValue(colors.primary[100], "gray.700")}
          mb={6}
        />
        <Heading size="lg" textAlign="center" mb={4}>
          {t("mindmap.noMindmaps", "沒有思維導圖")}
        </Heading>
        <Text textAlign="center" maxW="400px" mb={8} color={useColorModeValue("gray.600", "gray.400")}>
          {t("mindmap.noMindmapsDesc", "您尚未創建任何思維導圖。點擊「創建思維導圖」開始創建。")}
        </Text>
        <RouterLink to="/mindmap/create">
          <Button 
            colorScheme="purple"
            size="lg"
          >
            <Flex align="center">
              <Icon as={FaPlus} mr={2} />
              {t("mindmap.createFirst", "創建您的第一個思維導圖")}
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
        <Heading size="md" mb={2}>{t("mindmap.noMatchingMindmaps", "沒有符合的思維導圖")}</Heading>
        <Text>{t("mindmap.tryDifferentSearch", "嘗試不同的搜索詞或調整您的搜索條件。")}</Text>
        <Button
          mt={6}
          onClick={() => {
            setSearchQuery("");
            fetchMindmaps(1);
          }}
        >
          <Flex align="center">
            <Icon as={FaSearch} mr={2} />
            {t("mindmap.retry", "重試")}
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
              {t("mindmap.libraryTitle", "我的思維導圖庫")}
            </Heading>
            
            <RouterLink to="/mindmap/create">
              <Button
                colorScheme="purple"
                size="lg"
              >
                <Flex align="center">
                  <Icon as={FaPlus} mr={2} />
                  {t("mindmap.create", "創建思維導圖")}
                </Flex>
              </Button>
            </RouterLink>
          </Flex>
          
          <Flex justifyContent="space-between" mb={8} wrap={{ base: "wrap", md: "nowrap" }} gap={4}>
            <Flex flex={{ base: "100%", md: 1 }} position="relative" maxW={{ base: "100%", md: "300px" }}>
              <Box position="absolute" left={3} top="50%" transform="translateY(-50%)" zIndex={1}>
                <Icon as={FaSearch} color={textColor} />
              </Box>
              <Input
                placeholder={t("mindmap.searchPlaceholder", "搜索思維導圖...")}
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
                  {t("mindmap.totalCount", "共 {{count}} 個思維導圖", { count: filteredMindMaps.length })}
                </Text>
                <Text>
                  {t("mindmap.totalNodes", "共 {{count}} 個節點", { count: totalNodes })}
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
              <Heading size="md" mb={2} color={headingColor}>載入失敗</Heading>
              <Text color={textColor}>{error}</Text>
              <Button mt={4} onClick={() => fetchMindmaps()}>重試</Button>
            </Flex>
          ) : mindMaps.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={cardBg}
              borderRadius={mindmapTheme.borderRadius}
              boxShadow={useColorModeValue(mindmapTheme.shadow, "dark-lg")}
            >
              <Icon as={FaSitemap} color={iconColor} fontSize="5xl" mb={4} opacity={0.7} />
              <Heading size="md" mb={2} color={headingColor}>沒有思維導圖</Heading>
              <Text textAlign="center" mb={4} color={textColor}>
                您還沒有創建任何思維導圖。點擊"新增思維導圖"開始創建。
              </Text>
              <RouterLink to="/mindmap/create">
                <Button
                  colorScheme="purple"
                  size="lg"
                >
                  <Flex align="center">
                    <Icon as={FaPlus} mr={2} />
                    {t("mindmap.createFirst", "創建您的第一個思維導圖")}
                  </Flex>
                </Button>
              </RouterLink>
            </Flex>
          ) : filteredMindMaps.length === 0 ? (
            <Flex
              direction="column"
              align="center"
              justify="center"
              p={8}
              bg={cardBg}
              borderRadius={mindmapTheme.borderRadius}
              boxShadow={useColorModeValue(mindmapTheme.shadow, "dark-lg")}
            >
              <Icon as={FaSitemap} color={iconColor} fontSize="5xl" mb={4} opacity={0.7} />
              <Heading size="md" mb={2} color={headingColor}>沒有符合的思維導圖</Heading>
              <Text textAlign="center" mb={4} color={textColor}>
                請嘗試不同的搜索詞或調整搜索條件。
              </Text>
              <Button
                colorScheme="blue"
                onClick={() => setPage(1)}
              >
                重試
              </Button>
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
                <MindMapCard
                  key={mindMap.id}
                  mindMap={mindMap}
                  onToggleShare={handleToggleShare}
                  onDeleteMindmap={handleDeleteMindmap}
                  isShared={mindMap.is_public}
                />
              ))}
            </Grid>
          )}
          
          {totalPages > 1 && (
            <Flex justify="center" mt={8} gap={2}>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? "solid" : "outline"}
                  colorScheme="blue"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              ))}
            </Flex>
          )}
        </Box>
      </Container>
    </Box>
  )
}

export default MindMapLibrary 