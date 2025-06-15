import React, { useState, useEffect } from "react";
import styled from 'styled-components';
import { Typography } from "antd";
import { Link, useRouter } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { useColorModeValue } from "@/components/ui/color-mode";
import {
  FaHome,
  FaPlusCircle,
  FaCog,
  FaCrown,
  FaCommentAlt,
  FaBars,
} from "react-icons/fa";

const { Text } = Typography;

const SidebarContainer = styled.aside<{ $bg: string; $borderColor: string }>`
  background: ${props => props.$bg};
  border-right: 1px solid ${props => props.$borderColor};
  height: calc(100vh - 70px);
  position: sticky;
  top: 70px;
  overflow-y: auto;
  transition: all 0.3s ease;
  z-index: 900;
  width: 250px;
  
  @media (max-width: 768px) {
    position: fixed;
    left: 0;
    top: 0;
    height: 100vh;
    width: 250px;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
    transform: ${props => props.style?.transform};
    z-index: 1000;
  }
`;

const MobileMenuButton = styled.div<{ $bg: string }>`
  display: none;
  position: fixed;
  top: 20px;
  left: 20px;
  z-index: 1000;
  cursor: pointer;
  background: ${props => props.$bg};
  padding: 8px;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const SidebarContent = styled.div`
  padding: 20px 0;
`;

const SidebarHeader = styled.div`
  display: flex;
  padding: 0 24px;
  margin-bottom: 24px;
  align-items: center;
  justify-content: space-between;
`;

const SidebarTitle = styled(Text)<{ $color: string }>`
  font-size: 20px;
  font-weight: bold;
  color: ${props => props.$color};
`;

const MobileCloseIcon = styled.div`
  display: none;
  cursor: pointer;
  
  @media (max-width: 768px) {
    display: flex;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled(Text)<{ $color: string }>`
  font-size: 12px;
  font-weight: bold;
  color: ${props => props.$color};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 0 32px;
  margin-bottom: 8px;
`;

const SidebarLinkContainer = styled(Link)<{ 
  $isActive: boolean; 
  $activeBg: string; 
  $inactiveBg: string; 
  $hoverBg: string; 
  $textColor: string; 
  $primaryColor: string;
}>`
  display: flex;
  align-items: center;
  padding: 12px 24px;
  margin: 0 8px;
  color: ${props => props.$textColor};
  background: ${props => props.$isActive ? props.$activeBg : props.$inactiveBg};
  border-right: ${props => props.$isActive ? `3px solid ${props.$primaryColor}` : '0px'};
  font-weight: ${props => props.$isActive ? '500' : 'normal'};
  transition: all 0.3s;
  cursor: pointer;
  border-radius: 6px;
  text-decoration: none;
  
  &:hover {
    background: ${props => !props.$isActive ? props.$hoverBg : props.$activeBg};
    color: ${props => props.$textColor};
    text-decoration: none;
  }
`;

const IconWrapper = styled.div`
  margin-right: 12px;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Overlay = styled.div<{ $bg: string }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: ${props => props.$bg};
  z-index: 800;
  
  @media (min-width: 769px) {
    display: none;
  }
`;

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ 
  to, 
  icon: Icon, 
  label, 
  isActive = false,
  onClick
}) => {
  const activeBg = useColorModeValue('rgba(22, 119, 255, 0.1)', 'rgba(22, 119, 255, 0.2)');
  const hoverBg = useColorModeValue('rgba(22, 119, 255, 0.05)', 'rgba(22, 119, 255, 0.1)');
  const textColor = useColorModeValue(
    isActive ? '#1677ff' : '#595959',
    isActive ? '#69b7ff' : '#d9d9d9'
  );
  const primaryColor = '#1677ff';

  return (
    <SidebarLinkContainer
      to={to}
      onClick={onClick}
      $isActive={isActive}
      $activeBg={activeBg}
      $inactiveBg="transparent"
      $hoverBg={hoverBg}
      $textColor={textColor}
      $primaryColor={primaryColor}
    >
      <IconWrapper>
        <Icon size={20} />
      </IconWrapper>
      <Text>{label}</Text>
    </SidebarLinkContainer>
  );
};

interface SidebarSectionProps {
  title: string;
  children: React.ReactNode;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ title, children }) => {
  const textColor = useColorModeValue('#8c8c8c', '#8c8c8c');
  
  return (
    <SectionContainer>
      <SectionTitle $color={textColor}>
        {title}
      </SectionTitle>
      {children}
    </SectionContainer>
  );
};

const DashboardSidebar: React.FC = () => {
  // Use the current route to determine which link is active
  const router = useRouter();
  const [activeLink, setActiveLink] = useState("/");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  
  // Colors based on theme
  const bg = useColorModeValue('#ffffff', '#001529');
  const borderColor = useColorModeValue('#d9d9d9', '#303030');
  const textColor = useColorModeValue('#000000', '#ffffff');
  const overlayBg = useColorModeValue('rgba(0, 0, 0, 0.6)', 'rgba(0, 0, 0, 0.8)');
  const menuButtonBg = useColorModeValue('#ffffff', '#262626');
  
  // Update active link whenever the route changes
  useEffect(() => {
    // Function to detect the active link from a path
    const detectActiveLink = (path: string) => {
      if (path.includes("/items")) {
        return "items";
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
      <MobileMenuButton 
        $bg={menuButtonBg}
        onClick={toggleMobileMenu}
      >
        <FaBars size={24} />
      </MobileMenuButton>

      {/* Sidebar for both desktop and mobile */}
      <SidebarContainer
        $bg={bg}
        $borderColor={borderColor}
        style={{
          transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(-100%)'
        }}
      >
        <SidebarContent>
          <SidebarHeader>
            <SidebarTitle $color={textColor}>SaaS Template</SidebarTitle>
            {isMobileMenuOpen && (
              <MobileCloseIcon onClick={toggleMobileMenu}>
                <FaBars size={20} />
              </MobileCloseIcon>
            )}
          </SidebarHeader>

          <SidebarSection title={t('dashboard.main')}>
            <SidebarLink
              to="/"
              icon={FaHome}
              label={t('dashboard.dashboard')}
              isActive={activeLink === "/"}
              onClick={handleMobileMenuClick}
            />
            <SidebarLink
              to="/items"
              icon={FaPlusCircle}
              label={t('dashboard.items')}
              isActive={activeLink === "items"}
              onClick={handleMobileMenuClick}
            />
          </SidebarSection>
          <SidebarSection title={t('dashboard.account')}>
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
            <SidebarLink
              to="/feedback"
              icon={FaCommentAlt}
              label={t('dashboard.feedback')}
              isActive={activeLink === "feedback"}
              onClick={handleMobileMenuClick}
            />
          </SidebarSection>
        </SidebarContent>
      </SidebarContainer>

      {/* Overlay when mobile menu is open */}
      {isMobileMenuOpen && (
        <Overlay 
          $bg={overlayBg}
          onClick={toggleMobileMenu}
        />
      )}
    </>
  );
};

export default DashboardSidebar; 