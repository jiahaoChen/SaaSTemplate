
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { FaPlay, FaUserPlus, FaCheckCircle } from "react-icons/fa";
import { ColorModeButton, useColorModeValue } from "../ui/color-mode";
import { LanguageSwitcher } from "../ui/language-switcher";
import useLanguage from "@/hooks/useLanguage";
import styled from 'styled-components';

const LandingContainer = styled.div`
  background: ${() => useColorModeValue("white", "#121212")};
  color: ${() => useColorModeValue("#333333", "#f5f7fa")};
  min-height: 100vh;
  transition: all 0.3s ease;
`;

const Navigation = styled.nav`
  background: ${() => useColorModeValue("white", "#1e1e1e")};
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
`;

const NavContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
`;

const LogoImage = styled.img`
  width: 40px;
  height: 40px;
  margin-right: 8px;
`;

const Title = styled.h1`
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
`;

const NavLinks = styled.div`
  display: none;
  gap: 32px;
  
  @media (min-width: 768px) {
    display: flex;
  }
`;

const NavLink = styled.span`
  font-weight: 500;
  cursor: pointer;
`;

const NavActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
`;

const HeroSection = styled.section`
  padding: 64px 16px 0;
`;

const HeroContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 32px;
  
  @media (min-width: 1024px) {
    flex-direction: row;
  }
`;

const HeroContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 24px;
  max-width: 600px;
`;

const HeroTitle = styled.h2`
  font-size: 3rem;
  line-height: 1.2;
  font-weight: bold;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  color: ${() => useColorModeValue("#718096", "#a0aec0")};
  margin: 0;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
`;

const FeatureList = styled.div`
  display: flex;
  align-items: center;
  color: ${() => useColorModeValue("#718096", "#a0aec0")};
  gap: 8px;
`;

const HeroImageContainer = styled.div``;

const HeroImage = styled.img`
  border-radius: 8px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  width: 500px;
  
  @media (min-width: 1024px) {
    max-width: 500px;
  }
`;

export function Landing() {
  const { t } = useLanguage();

  return (
    <LandingContainer>
      {/* Navigation Bar */}
      <Navigation>
        <NavContainer>
          <Logo>
            <LogoImage 
              src="/assets/images/logo1.png" 
              alt="MindTube Logo"
            />
            <Title>MindTube</Title>
          </Logo>

          <NavLinks>
            <NavLink>{t("landing.nav.features")}</NavLink>
            <NavLink>{t("landing.nav.pricing")}</NavLink>
            <NavLink>{t("landing.nav.testimonials")}</NavLink>
            <NavLink>{t("landing.nav.faq")}</NavLink>
          </NavLinks>

          <NavActions>
            <Link to="/login">
              <Button variant="outlined">
                {t("landing.nav.login")}
              </Button>
            </Link>
            <Link to="/signup">
              <Button type="primary">{t("landing.nav.signup")}</Button>
            </Link>
            <ColorModeButton />
            <LanguageSwitcher />
          </NavActions>
        </NavContainer>
      </Navigation>

      {/* Hero Section */}
      <HeroSection>
        <HeroContainer>
          <HeroContent>
            <HeroTitle>
              {t("landing.hero.title")}
            </HeroTitle>
            
            <HeroSubtitle>
              {t("landing.hero.subtitle")}
            </HeroSubtitle>
            
            <ButtonGroup>
                             <Link to="/signup">
                 <Button
                   size="large"
                   type="primary"
                   icon={<FaPlay />}
                 >
                   {t("landing.hero.startNow")}
                 </Button>
               </Link>
              
              <Link to="/signup">
                <Button
                  size="large"
                  variant="outlined"
                  icon={<FaUserPlus />}
                >
                  {t("landing.hero.freeSignup")}
                </Button>
              </Link>
            </ButtonGroup>
            
            <FeatureList>
              <FaCheckCircle style={{ color: "#52c41a" }} />
              <span>{t("landing.hero.noCard")}</span>
            </FeatureList>
          </HeroContent>
          
          <HeroImageContainer>
            <HeroImage
              src="/images/mindmap-hero.png"
              alt="MindTube Example"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = "https://placehold.co/600x400/7856ff/FFFFFF/png?text=MindTube";
              }}
            />
          </HeroImageContainer>
        </HeroContainer>
      </HeroSection>

      {/* TODO: Add other sections back after core migration is complete */}
      
    </LandingContainer>
  );
}
