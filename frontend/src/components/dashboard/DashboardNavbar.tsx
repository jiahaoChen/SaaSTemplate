'use client'

import React from "react";
import {
  Box,
  Container,
  Flex,
  Button,
  Text,
  Icon,
} from "@chakra-ui/react";
import { FaBars, FaCog, FaCrown, FaSignOutAlt, FaUser, FaMoon, FaSun } from "react-icons/fa";
import { colors, shadows } from "../../theme/tokens";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { UserPublic } from "../../client";
import useAuth from "@/hooks/useAuth";
import { useColorMode, useColorModeValue } from "@/components/ui/color-mode";
import { 
  MenuRoot, 
  MenuTrigger, 
  MenuContent,
  MenuItem,
  MenuSeparator
} from "@/components/ui/menu";
import { LanguageSwitcher } from "@/components/ui/language-switcher";
import { useTranslation } from "react-i18next";
import useAnalytics from "@/hooks/useAnalytics";

type DashboardNavbarProps = {
  onMenuToggle?: () => void;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onMenuToggle }) => {
  // const [notificationCount] = React.useState(3);
  const queryClient = useQueryClient();
  const currentUser = queryClient.getQueryData<UserPublic>(["currentUser"]);
  const { logout } = useAuth();
  const { colorMode, toggleColorMode } = useColorMode();
  const { t } = useTranslation();
  const { trackThemeChange, trackLogout } = useAnalytics();
  
  // Get first letter of user's name for avatar
  const userInitial = currentUser?.full_name 
    ? currentUser.full_name.charAt(0).toUpperCase() 
    : currentUser?.email?.charAt(0).toUpperCase() || "U";
  
  const handleLogout = async () => {
    try {
      // Track logout event
      trackLogout();
      
      // Call the logout function from useAuth hook
      logout();
      
      // Clear React Query cache when logging out
      queryClient.clear();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <Box
      as="nav"
      bg={useColorModeValue("white", "gray.900")}
      boxShadow={shadows.sm}
      py={4}
      position="sticky"
      top={0}
      zIndex={1000}
    >
      <Container maxW="container.xl">
        <Flex justify="space-between" align="center">
          <Flex align="center">
            <Button
              aria-label="Toggle Menu"
              variant="ghost"
              display={{ base: "flex", lg: "none" }}
              onClick={onMenuToggle}
              mr={4}
              color="gray.500"
              _hover={{ color: colors.primary[500] }}
              p={2}
            >
              <Icon as={FaBars} />
            </Button>
            <Link to="/">
              <Flex align="center" fontWeight={700} fontSize="xl" color={useColorModeValue("gray.800", "white")}>
                <Box mr={2} fontSize="2xl">
                  <img 
                    src="/assets/images/logo1.png" 
                    alt="SaaS Template Logo"
                    width="32"
                    height="32"
                    style={{ display: 'inline-block' }}
                  />
                </Box>
                <Text>SaaS Template</Text>
              </Flex>
            </Link>
          </Flex>

          <Flex align="center">
            {/* <Box position="relative" mr={6} cursor="pointer">
              <Icon as={FaBell} boxSize={5} color="gray.500" />
              {notificationCount > 0 && (
                <Box
                  position="absolute"
                  top="-8px"
                  right="-8px"
                  bg={colors.secondary[400]}
                  color="white"
                  borderRadius="full"
                  w="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  fontSize="xs"
                  fontWeight="bold"
                >
                  {notificationCount}
                </Box>
              )}
            </Box> */}

            <LanguageSwitcher />

            <Button
              onClick={() => {
                const oldTheme = colorMode;
                const newTheme = colorMode === 'light' ? 'dark' : 'light';
                trackThemeChange(oldTheme, newTheme);
                toggleColorMode();
              }}
              mx={4}
              variant="ghost"
              size="sm"
              color="gray.500"
            >
              <Icon as={colorMode === 'light' ? FaMoon : FaSun} />
            </Button>

            <MenuRoot>
              <MenuTrigger>
                <Button
                  variant="ghost"
                  p={2}
                  display="flex"
                  alignItems="center"
                  borderRadius="md"
                >
                  <Flex align="center" gap={3}>
                    <Box 
                      bg={colors.primary[500]} 
                      color="white"
                      w="36px"
                      h="36px"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                    >
                      {userInitial}
                    </Box>
                    <Box display={{ base: "none", md: "block" }} textAlign="left">
                      <Text fontWeight={500} fontSize="sm">
                        {currentUser?.full_name || currentUser?.email || "使用者"}
                      </Text>
                      <Text fontSize="xs" color="gray.500">
                        {t('dashboard.professionalEdition')}
                      </Text>
                    </Box>
                  </Flex>
                </Button>
              </MenuTrigger>
              <MenuContent>
                <Box p={4} textAlign="center">
                  <Box 
                    bg={colors.primary[500]} 
                    color="white"
                    w="80px"
                    h="80px"
                    borderRadius="full"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                    fontWeight="bold"
                    fontSize="2xl"
                    mx="auto"
                    mb={2}
                  >
                    {userInitial}
                  </Box>
                  <Text fontWeight={500}>
                    {currentUser?.full_name || currentUser?.email || "使用者"}
                  </Text>
                </Box>
                <MenuSeparator />
                <Link to="/profile">
                  <MenuItem value="profile">
                    <Flex align="center">
                      <Icon as={FaUser} mr={3} />
                      <Text>{t('dashboard.profile')}</Text>
                    </Flex>
                  </MenuItem>
                </Link>
                <Link to="/settings">
                  <MenuItem value="settings">
                    <Flex align="center">
                      <Icon as={FaCog} mr={3} />
                      <Text>{t('dashboard.settings')}</Text>
                    </Flex>
                  </MenuItem>
                </Link>
                <MenuItem value="subscription">
                  <Flex align="center">
                    <Icon as={FaCrown} mr={3} />
                    <Text>{t('dashboard.subscription')}</Text>
                  </Flex>
                </MenuItem>
                <MenuSeparator />
                {/* <MenuItem value="help">
                  <Flex align="center">
                    <Icon as={FaQuestionCircle} mr={3} />
                    <Text>幫助中心</Text>
                  </Flex>
                </MenuItem> */}
                <MenuItem 
                  value="logout"
                  color={colors.danger}
                  onClick={handleLogout}
                >
                  <Flex align="center">
                    <Icon as={FaSignOutAlt} mr={3} />
                    <Text>{t('auth.logout')}</Text>
                  </Flex>
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default DashboardNavbar; 