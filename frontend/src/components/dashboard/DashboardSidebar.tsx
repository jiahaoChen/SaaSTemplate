import React, { useState, useEffect } from "react";
import { Box, Flex, Text, Icon } from "@chakra-ui/react";
import { Link, useRouter } from "@tanstack/react-router";
import { colors } from "../../theme/tokens";
import { useColorModeValue } from "../../components/ui/color-mode";
import { useTranslation } from "react-i18next";
import {
  FaHome,
  FaPlusCircle,
  FaSitemap,
  FaCog,
  FaCrown,
  FaCommentAlt,
  FaBars,
  FaGlobe,
} from "react-icons/fa";

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon, 
  label, 
  isActive = false,
  onClick
}) => {
  const activeBg = useColorModeValue(colors.primary[50], colors.primary[900]);
  const inactiveBg = useColorModeValue("transparent", "transparent");
  const hoverBg = useColorModeValue("blue.100", "blue.900");
  const textColor = useColorModeValue(
    isActive ? colors.primary[500] : "gray.700", 
    isActive ? colors.primary[300] : "gray.300"
  );

  return (
    <Link to={to} onClick={onClick}>
      <Flex
        align="center"
        py={3}
        px={6}
        color={textColor}
        bg={isActive ? activeBg : inactiveBg}
        borderRightWidth={isActive ? "3px" : "0px"}
        borderRightColor={colors.primary[500]}
        fontWeight={isActive ? "500" : "normal"}
        transition="all 0.3s"
        _hover={
          !isActive
            ? {
                bg: hoverBg,
              }
            : {}
        }
        cursor="pointer"
        borderRadius="md"
        mx={2}
      >
        <Icon as={icon} mr={3} boxSize={5} />
        <Text>{label}</Text>
      </Flex>
    </Link>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  const textColor = useColorModeValue("gray.500", "gray.500");
  
  return (
    <Box mb={6}>
      <Text 
        fontSize="xs" 
        fontWeight="bold" 
        color={textColor} 
        textTransform="uppercase" 
        letterSpacing="wide"
        px={8}
        mb={2}
      >
        {title}
      </Text>
      {children}
    </Box>
  );
};

const DashboardSidebar: React.FC = () => {
  // Use the current route to determine which link is active
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("/");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  // Background and border colors based on color mode
  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  // const headerBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("black", "white");
  const overlayBg = useColorModeValue("blackAlpha.600", "blackAlpha.800");
  const menuButtonBg = useColorModeValue("white", "gray.700");
  
  // Update active link whenever the route changes
  useEffect(() => {
    // Function to detect the active link from a path
    const detectActiveLink = (path: string) => {
      if (path.includes("/mindmap/create")) {
        return "create";
      } else if (path.includes("/mindmap/library")) {
        return "library";
      } else if (path.includes("/mindmap/public-library")) {
        return "public-library";
      } else if (path.includes("/favorites")) {
        return "favorites";
      } else if (path.includes("/shared")) {
        return "shared";
      } else if (path.includes("/profile")) {
        return "profile";
      } else if (path.includes("/settings")) {
        return "settings";
      } else if (path.includes("/subscription")) {
        return "subscription";
      } else if (path.includes("/help")) {
        return "help";
      } else if (path.includes("/feedback")) {
        return "feedback";
      } else if (path === "/") {
        return "/";
      }
      return "/"; // Default to home if no match
    };
    
    // Set initial active link
    const path = router.state.location.pathname;
    setActiveLink(detectActiveLink(path));
    
    // Subscribe to route changes
    const unsubscribe = router.subscribe("onResolved", () => {
      const newPath = router.state.location.pathname;
      setActiveLink(detectActiveLink(newPath));
    });
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [router]);

  // Mobile menu toggle
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Handle link clicks for mobile menu only
  const handleMobileMenuClick = () => {
    if (isMobileMenuOpen) {
      toggleMobileMenu(); // Close mobile menu when a link is clicked
    }
  };

  return (
    <>
      {/* Mobile menu button */}
      <Flex
        display={{ base: "flex", md: "none" }}
        position="fixed"
        top="20px"
        left="20px"
        zIndex={1000}
        onClick={toggleMobileMenu}
        cursor="pointer"
        bg={menuButtonBg}
        p={2}
        borderRadius="md"
        boxShadow="md"
      >
        <Icon as={FaBars} boxSize={6} />
      </Flex>

      {/* Sidebar for both desktop and mobile */}
      <Box
        as="aside"
        bg={bg}
        borderRight="1px solid"
        borderRightColor={borderColor}
        height="calc(100vh - 70px)"
        position="sticky"
        top="70px"
        w={{ base: isMobileMenuOpen ? "250px" : "0", md: "250px" }}
        overflow={isMobileMenuOpen ? "visible" : "hidden"}
        display={{ base: isMobileMenuOpen ? "block" : "none", md: "block" }}
        overflowY="auto"
        transition="all 0.3s ease"
        zIndex={900}
        boxShadow={{ base: isMobileMenuOpen ? "lg" : "none", md: "none" }}
      >
        <Box py={5}>
          <Flex px={6} mb={6} alignItems="center" justifyContent="space-between">
            <Text fontSize="xl" fontWeight="bold" color={textColor}>MindTube</Text>
            {isMobileMenuOpen && (
              <Flex 
                display={{ base: "flex", md: "none" }}
                onClick={toggleMobileMenu}
                cursor="pointer"
              >
                <Icon as={FaBars} boxSize={5} />
              </Flex>
            )}
          </Flex>

          <SidebarSection title={t('dashboard.account')}>
            <SidebarLink
              to="/"
              icon={FaHome}
              label={t('dashboard.dashboard')}
              isActive={activeLink === "/"}
              onClick={handleMobileMenuClick}
            />
            <SidebarLink
              to="/mindmap/create"
              icon={FaPlusCircle}
              label={t('dashboard.createMindmap')}
              isActive={activeLink === "create"}
              onClick={handleMobileMenuClick}
            />
            <SidebarLink
              to="/mindmap/library"
              icon={FaSitemap}
              label={t('dashboard.myMindmaps')}
              isActive={activeLink === "library"}
              onClick={handleMobileMenuClick}
            />
            <SidebarLink
              to="/mindmap/public-library"
              icon={FaGlobe}
              label={t('dashboard.publicLibrary')}
              isActive={activeLink === "public-library"}
              onClick={handleMobileMenuClick}
            />
            {/* <SidebarLink
              to="/favorites"
              icon={FaStar}
              label={t('dashboard.favorites')}
              isActive={activeLink === "favorites"}
              onClick={handleMobileMenuClick}
            />
            <SidebarLink
              to="/shared"
              icon={FaShareAlt}
              label={t('dashboard.shared')}
              isActive={activeLink === "shared"}
              onClick={handleMobileMenuClick}
            /> */}
          </SidebarSection>
          <SidebarSection title={t('dashboard.account')}>
            {/* <SidebarLink
              to="/profile"
              icon={FaUser}
              label={t('dashboard.profile')}
              isActive={activeLink === "profile"}
              onClick={handleMobileMenuClick}
            /> */}
            <SidebarLink
              to="/settings"
              icon={FaCog}
              label={t('dashboard.settings')}
              isActive={activeLink === "settings"}
              onClick={handleMobileMenuClick}
            />
            <SidebarLink
              to="/subscription"
              icon={FaCrown}
              label={t('dashboard.subscription')}
              isActive={activeLink === "subscription"}
              onClick={handleMobileMenuClick}
            />
          </SidebarSection>
          <SidebarSection title="Support">
            {/* <SidebarLink
              to="/help"
              icon={FaQuestionCircle}
              label="Help Center"
              isActive={activeLink === "help"}
              onClick={handleMobileMenuClick}
            /> */}
            <SidebarLink
              to="/feedback"
              icon={FaCommentAlt}
              label={t('dashboard.feedback')}
              isActive={activeLink === "feedback"}
              onClick={handleMobileMenuClick}
            />
          </SidebarSection>
        </Box>
      </Box>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <Box 
          position="fixed"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bg={overlayBg}
          zIndex={800}
          display={{ base: "block", md: "none" }}
          onClick={toggleMobileMenu}
        />
      )}

      {/* Main content area with padding for both mobile and desktop */}
     
    </>
  );
};

export default DashboardSidebar; 