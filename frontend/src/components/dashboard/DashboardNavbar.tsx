'use client'

import React from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { FaBars, FaCog, FaCrown, FaSignOutAlt, FaUser, FaMoon, FaSun } from "react-icons/fa";
import styled from 'styled-components';

import { Button } from "@/components/ui/button";
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
import { colors, shadows } from "@/theme/tokens";

// Styled components
const NavContainer = styled.nav<{ bg?: string; boxShadow?: string }>`
  background: ${props => props.bg || 'white'};
  box-shadow: ${props => props.boxShadow || shadows.sm};
  padding: 16px 0;
  position: sticky;
  top: 0;
  z-index: 1000;
`

const NavContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const FlexContainer = styled.div<{
  align?: string
  justify?: string
  gap?: number
  direction?: string
  fontWeight?: number
  fontSize?: string
  color?: string
  mr?: number
  display?: string | { base?: string; md?: string; lg?: string }
}>`
  display: flex;
  align-items: ${props => props.align || 'stretch'};
  justify-content: ${props => props.justify || 'flex-start'};
  gap: ${props => props.gap ? `${props.gap * 4}px` : '0'};
  flex-direction: ${props => props.direction || 'row'};
  font-weight: ${props => props.fontWeight || 'normal'};
  font-size: ${props => props.fontSize || 'inherit'};
  color: ${props => props.color || 'inherit'};
  margin-right: ${props => props.mr ? `${props.mr * 4}px` : '0'};
  
  ${props => {
    if (typeof props.display === 'object') {
      return `
        display: ${props.display.base || 'flex'};
        @media (min-width: 768px) {
          display: ${props.display.md || props.display.base || 'flex'};
        }
        @media (min-width: 1024px) {
          display: ${props.display.lg || props.display.md || props.display.base || 'flex'};
        }
      `;
    }
    return props.display ? `display: ${props.display};` : '';
  }}
`

const StyledBox = styled.div<{
  bg?: string
  color?: string
  w?: string
  h?: string
  borderRadius?: string
  display?: string | { base?: string; md?: string }
  alignItems?: string
  justifyContent?: string
  fontWeight?: string | number
  fontSize?: string
  mr?: number
  mb?: number
  mx?: string
  p?: number
  textAlign?: string
  position?: string
  top?: string
  right?: string
  zIndex?: number
}>`
  ${props => props.bg && `background: ${props.bg};`}
  ${props => props.color && `color: ${props.color};`}
  ${props => props.w && `width: ${props.w};`}
  ${props => props.h && `height: ${props.h};`}
  ${props => props.borderRadius && `border-radius: ${props.borderRadius};`}
  ${props => props.alignItems && `align-items: ${props.alignItems};`}
  ${props => props.justifyContent && `justify-content: ${props.justifyContent};`}
  ${props => props.fontWeight && `font-weight: ${props.fontWeight};`}
  ${props => props.fontSize && `font-size: ${props.fontSize};`}
  ${props => props.mr && `margin-right: ${props.mr * 4}px;`}
  ${props => props.mb && `margin-bottom: ${props.mb * 4}px;`}
  ${props => props.mx === 'auto' && `margin-left: auto; margin-right: auto;`}
  ${props => props.p && `padding: ${props.p * 4}px;`}
  ${props => props.textAlign && `text-align: ${props.textAlign};`}
  ${props => props.position && `position: ${props.position};`}
  ${props => props.top && `top: ${props.top};`}
  ${props => props.right && `right: ${props.right};`}
  ${props => props.zIndex && `z-index: ${props.zIndex};`}
  
  ${props => {
    if (typeof props.display === 'object') {
      return `
        display: ${props.display.base || 'block'};
        @media (min-width: 768px) {
          display: ${props.display.md || props.display.base || 'block'};
        }
      `;
    }
    return props.display ? `display: ${props.display};` : '';
  }}
`

const StyledText = styled.span<{
  fontWeight?: number | string
  fontSize?: string
  color?: string
}>`
  font-weight: ${props => props.fontWeight || 'normal'};
  font-size: ${props => props.fontSize || 'inherit'};
  color: ${props => props.color || 'inherit'};
`

const StyledIcon = styled.div<{
  mr?: number
  boxSize?: number
  color?: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-right: ${props => props.mr ? `${props.mr * 4}px` : '0'};
  width: ${props => props.boxSize ? `${props.boxSize * 4}px` : 'auto'};
  height: ${props => props.boxSize ? `${props.boxSize * 4}px` : 'auto'};
  color: ${props => props.color || 'inherit'};
`

const MenuButton = styled(Button)<{
  display?: { base?: string; lg?: string }
  mr?: number
  color?: string
  p?: number
}>`
  margin-right: ${props => props.mr ? `${props.mr * 4}px` : '0'};
  padding: ${props => props.p ? `${props.p * 4}px` : '8px'};
  color: ${props => props.color || 'inherit'};
  
  ${props => {
    if (props.display && typeof props.display === 'object') {
      return `
        display: ${props.display.base || 'flex'};
        @media (min-width: 1024px) {
          display: ${props.display.lg || 'flex'};
        }
      `;
    }
    return '';
  }}
  
  &:hover {
    color: ${colors.primary[500]};
  }
`

const ThemeButton = styled(Button)<{
  mx?: number
  color?: string
}>`
  margin-left: ${props => props.mx ? `${props.mx * 4}px` : '0'};
  margin-right: ${props => props.mx ? `${props.mx * 4}px` : '0'};
  color: ${props => props.color || 'inherit'};
`

const UserMenuButton = styled(Button)<{
  p?: number
  borderRadius?: string
}>`
  padding: ${props => props.p ? `${props.p * 4}px` : '8px'};
  border-radius: ${props => props.borderRadius || '6px'};
  display: flex;
  align-items: center;
`

type DashboardNavbarProps = {
  onMenuToggle?: () => void;
};

const DashboardNavbar: React.FC<DashboardNavbarProps> = ({ onMenuToggle }) => {
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
      trackLogout();
      logout();
      queryClient.clear();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  return (
    <NavContainer
      bg={useColorModeValue("white", colors.gray[900])}
      boxShadow={shadows.sm}
    >
      <NavContent>
        <FlexContainer justify="space-between" align="center">
          <FlexContainer align="center">
            <MenuButton
              aria-label="Toggle Menu"
              variant="text"
              display={{ base: "flex", lg: "none" }}
              onClick={onMenuToggle}
              mr={4}
              color={colors.gray[500]}
              p={2}
            >
              <FaBars />
            </MenuButton>
            <Link to="/">
              <FlexContainer 
                align="center" 
                fontWeight={700} 
                fontSize="xl" 
                color={useColorModeValue(colors.gray[800], "white")}
              >
                <StyledBox mr={2} fontSize="2xl">
                  <img 
                    src="/assets/images/logo1.png" 
                    alt="SaaS Template Logo"
                    width="32"
                    height="32"
                    style={{ display: 'inline-block' }}
                  />
                </StyledBox>
                <StyledText>SaaS Template</StyledText>
              </FlexContainer>
            </Link>
          </FlexContainer>

          <FlexContainer align="center">
            <LanguageSwitcher />

            <ThemeButton
              onClick={() => {
                const oldTheme = colorMode;
                const newTheme = colorMode === 'light' ? 'dark' : 'light';
                trackThemeChange(oldTheme, newTheme);
                toggleColorMode();
              }}
              mx={4}
              variant="text"
              size="small"
              color={colors.gray[500]}
            >
              {colorMode === 'light' ? <FaMoon /> : <FaSun />}
            </ThemeButton>

            <MenuRoot>
              <MenuTrigger>
                <UserMenuButton
                  variant="text"
                  p={2}
                  borderRadius="md"
                >
                  <FlexContainer align="center" gap={3}>
                    <StyledBox 
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
                    </StyledBox>
                    <StyledBox display={{ base: "none", md: "block" }} textAlign="left">
                      <StyledText fontWeight={500} fontSize="sm">
                        {currentUser?.full_name || currentUser?.email || "使用者"}
                      </StyledText>
                      <StyledText fontSize="xs" color={colors.gray[500]}>
                        {t('dashboard.professionalEdition')}
                      </StyledText>
                    </StyledBox>
                  </FlexContainer>
                </UserMenuButton>
              </MenuTrigger>
              <MenuContent>
                <StyledBox p={4} textAlign="center">
                  <StyledBox 
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
                  </StyledBox>
                  <StyledText fontWeight={500}>
                    {currentUser?.full_name || currentUser?.email || "使用者"}
                  </StyledText>
                </StyledBox>
                <MenuSeparator />
                <Link to="/profile">
                  <MenuItem>
                    <FlexContainer align="center">
                      <StyledIcon mr={3}>
                        <FaUser />
                      </StyledIcon>
                      <StyledText>{t('dashboard.profile')}</StyledText>
                    </FlexContainer>
                  </MenuItem>
                </Link>
                <Link to="/settings">
                  <MenuItem>
                    <FlexContainer align="center">
                      <StyledIcon mr={3}>
                        <FaCog />
                      </StyledIcon>
                      <StyledText>{t('dashboard.settings')}</StyledText>
                    </FlexContainer>
                  </MenuItem>
                </Link>
                <MenuItem>
                  <FlexContainer align="center">
                    <StyledIcon mr={3}>
                      <FaCrown />
                    </StyledIcon>
                    <StyledText>{t('dashboard.subscription')}</StyledText>
                  </FlexContainer>
                </MenuItem>
                <MenuSeparator />
                <MenuItem 
                  style={{ color: colors.error[500] }}
                  onClick={handleLogout}
                >
                  <FlexContainer align="center">
                    <StyledIcon mr={3}>
                      <FaSignOutAlt />
                    </StyledIcon>
                    <StyledText>{t('auth.logout')}</StyledText>
                  </FlexContainer>
                </MenuItem>
              </MenuContent>
            </MenuRoot>
          </FlexContainer>
        </FlexContainer>
      </NavContent>
    </NavContainer>
  );
};

export default DashboardNavbar; 