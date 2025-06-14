import {
  Box,
  Button,
  Container,
  Flex,
  Icon,
  Text,
  Center,
} from "@chakra-ui/react"
import { useState } from "react"
import { Link as RouterLink } from "@tanstack/react-router"
import { FaChevronDown, FaSitemap } from "react-icons/fa"
import { mindmapTheme } from "../../../theme/mindmap"
import { MenuContent, MenuRoot, MenuTrigger, MenuItem } from "../../ui/menu"
import { useColorMode, useColorModeValue } from "../../ui/color-mode"
import { LuMoon, LuSun } from "react-icons/lu"

// Custom Avatar component
interface AvatarProps {
  src: string;
  size?: "sm" | "md" | "lg" | "xl";
  mb?: number | string;
}

const Avatar = ({ src, size = "md", mb }: AvatarProps) => {
  const sizeMap = {
    sm: "36px",
    md: "48px",
    lg: "56px",
    xl: "96px"
  };
  
  return (
    <Box
      width={sizeMap[size]}
      height={sizeMap[size]}
      borderRadius="full"
      backgroundImage={`url(${src})`}
      backgroundSize="cover"
      backgroundPosition="center"
      mb={mb}
    />
  );
};

// Divider component
const MenuDivider = () => (
  <Box 
    height="1px" 
    width="100%" 
    my={2} 
    bg={useColorModeValue("gray.200", "gray.700")} 
  />
);

const MindMapNavbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const { colorMode, toggleColorMode } = useColorMode()

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  return (
    <Box
      as="nav"
      bg={useColorModeValue("white", "gray.800")}
      boxShadow="0 2px 10px rgba(0,0,0,0.05)"
      py={4}
      zIndex={1000}
    >
      <Container maxW="1200px">
        <Flex justify="space-between" align="center">
          <RouterLink to="/mindmap/create">
            <Flex align="center" fontWeight="700" fontSize="1.5rem" color={useColorModeValue(mindmapTheme.colors.dark, "white")}>
              <Icon as={FaSitemap} color={mindmapTheme.colors.primary} mr={2} fontSize="1.8rem" />
              <Text>YouTube MindMap</Text>
            </Flex>
          </RouterLink>

          <Flex gap={6}>
            <RouterLink to="/mindmap/create">
              <Text color={useColorModeValue(mindmapTheme.colors.dark, "white")} fontWeight="500">首頁</Text>
            </RouterLink>
            <Text color={useColorModeValue(mindmapTheme.colors.dark, "white")} fontWeight="500" cursor="pointer">功能</Text>
            <Text color={useColorModeValue(mindmapTheme.colors.dark, "white")} fontWeight="500" cursor="pointer">價格</Text>
            <Text color={useColorModeValue(mindmapTheme.colors.dark, "white")} fontWeight="500" cursor="pointer">關於我們</Text>
            <Box position="relative">
              <Button 
                variant="ghost"
                onClick={toggleDropdown}
                color={useColorModeValue(mindmapTheme.colors.dark, "white")}
              >
                更多 <Icon as={FaChevronDown} ml={2} />
              </Button>
              {isDropdownOpen && (
                <Box 
                  position="absolute" 
                  top="100%" 
                  right={0}
                  mt={2}
                  bg={useColorModeValue("white", "gray.700")}
                  boxShadow="md"
                  borderRadius="md"
                  p={2}
                  width="200px"
                  zIndex={1001}
                >
                  <Box p={2} _hover={{ bg: useColorModeValue("gray.100", "gray.600") }} cursor="pointer">常見問題</Box>
                  <Box p={2} _hover={{ bg: useColorModeValue("gray.100", "gray.600") }} cursor="pointer">聯絡我們</Box>
                  <Box p={2} _hover={{ bg: useColorModeValue("gray.100", "gray.600") }} cursor="pointer">部落格</Box>
                </Box>
              )}
            </Box>
          </Flex>

          <Flex gap={4} align="center">
            <Button onClick={toggleColorMode} size="md" variant="ghost">
              {colorMode === 'light' ? <LuMoon /> : <LuSun />}
            </Button>
            
            <RouterLink to="/login">
              <Button
                variant="ghost"
                color={mindmapTheme.colors.primary}
                borderColor={mindmapTheme.colors.primary}
                borderWidth="1px"
                _hover={{ bg: mindmapTheme.colors.primaryLight }}
              >
                登入
              </Button>
            </RouterLink>
            
            <RouterLink to="/signup">
              <Button
                bg={mindmapTheme.colors.primary}
                color="white"
                _hover={{ bg: mindmapTheme.colors.primaryDark }}
              >
                註冊
              </Button>
            </RouterLink>
            
            <MenuRoot>
              <MenuTrigger asChild>
                <Button variant="ghost" padding={0} minW={0}>
                  <Avatar
                    size="sm"
                    src="https://avatars.dicebear.com/api/male/username.svg"
                  />
                </Button>
              </MenuTrigger>
              <MenuContent>
                <Center p={4} flexDirection="column">
                  <Avatar
                    size="xl"
                    src="https://avatars.dicebear.com/api/male/username.svg"
                    mb={2}
                  />
                  <Text>Username</Text>
                </Center>
                <Box p={2}>
                  <MenuItem value="mindmaps">Your MindMaps</MenuItem>
                  <MenuItem value="settings">Account Settings</MenuItem>
                  <MenuDivider />
                  <MenuItem value="logout">Logout</MenuItem>
                </Box>
              </MenuContent>
            </MenuRoot>
          </Flex>
        </Flex>
      </Container>
    </Box>
  )
}

export default MindMapNavbar