import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Link,
  Text,
  Icon,
} from "@chakra-ui/react"

import { Link as RouterLink } from "@tanstack/react-router"
import {
  FaEnvelope,
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTwitter,
  FaYoutube,
} from "react-icons/fa"
import { mindmapTheme } from "../../../theme/mindmap"

const MindMapFooter = () => {
  return (
    <Box as="footer" bg="#222" color="white" py={10}>
      <Container maxW="1200px">
        <Grid templateColumns={{ base: "1fr", md: "repeat(4, 1fr)" }} gap={8}>
          <GridItem>
            <Heading as="h3" size="md" mb={4}>
              關於我們
            </Heading>
            <Text color="#aaa" mb={4}>
              YouTube MindMap 是一個創新的工具，幫助用戶將YouTube影片轉換為思維導圖，提升學習效率和知識管理。
            </Text>
            <Flex gap={3}>
              <Link href="#" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                <Icon as={FaFacebook} boxSize={5} />
              </Link>
              <Link href="#" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                <Icon as={FaTwitter} boxSize={5} />
              </Link>
              <Link href="#" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                <Icon as={FaInstagram} boxSize={5} />
              </Link>
              <Link href="#" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                <Icon as={FaLinkedin} boxSize={5} />
              </Link>
              <Link href="#" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                <Icon as={FaYoutube} boxSize={5} />
              </Link>
            </Flex>
          </GridItem>

          <GridItem>
            <Heading as="h3" size="md" mb={4}>
              快速連結
            </Heading>
            <Flex direction="column" gap={2}>
              <RouterLink to="/mindmap/create">
                <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>首頁</Text>
              </RouterLink>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">功能</Text>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">價格</Text>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">關於我們</Text>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">聯絡我們</Text>
            </Flex>
          </GridItem>

          <GridItem>
            <Heading as="h3" size="md" mb={4}>
              支援
            </Heading>
            <Flex direction="column" gap={2}>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">常見問題</Text>
              <RouterLink to="/help">
                <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>幫助中心</Text>
              </RouterLink>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">教學</Text>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">服務條款</Text>
              <Text color="#aaa" _hover={{ color: mindmapTheme.colors.primary }} cursor="pointer">隱私政策</Text>
            </Flex>
          </GridItem>

          <GridItem>
            <Heading as="h3" size="md" mb={4}>
              聯絡我們
            </Heading>
            <Flex direction="column" gap={3}>
              <Flex alignItems="center">
                <Icon as={FaEnvelope} color={mindmapTheme.colors.primary} mr={3} />
                <Link href="mailto:info@youtube-mindmap.com" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                  info@youtube-mindmap.com
                </Link>
              </Flex>
              <Flex alignItems="center">
                <Icon as={FaPhoneAlt} color={mindmapTheme.colors.primary} mr={3} />
                <Link href="tel:+886212345678" color="#aaa" _hover={{ color: mindmapTheme.colors.primary }}>
                  +886 2 1234 5678
                </Link>
              </Flex>
              <Flex alignItems="center">
                <Icon as={FaMapMarkerAlt} color={mindmapTheme.colors.primary} mr={3} />
                <Text color="#aaa">台北市信義區信義路五段7號</Text>
              </Flex>
            </Flex>
          </GridItem>
        </Grid>

        <Box 
          height="1px" 
          bg="#555" 
          my={8} 
          width="100%" 
        />

        <Flex justify="space-between" flexWrap="wrap" gap={5}>
          <Text color="#aaa" fontSize="sm">
            © {new Date().getFullYear()} YouTube MindMap. 保留所有權利。
          </Text>
          <Flex gap={5}>
            <Link href="#" color="#aaa" fontSize="sm" _hover={{ color: mindmapTheme.colors.primary }}>
              隱私政策
            </Link>
            <Link href="#" color="#aaa" fontSize="sm" _hover={{ color: mindmapTheme.colors.primary }}>
              服務條款
            </Link>
            <Link href="#" color="#aaa" fontSize="sm" _hover={{ color: mindmapTheme.colors.primary }}>
              法律聲明
            </Link>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default MindMapFooter 