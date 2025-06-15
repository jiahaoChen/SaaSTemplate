import { Typography } from "antd"
import { createFileRoute } from "@tanstack/react-router"
import { MdEdit } from "react-icons/md"
import { useColorModeValue } from "@/components/ui/color-mode"
import useLanguage from "@/hooks/useLanguage"
import useAuth from "@/hooks/useAuth"
import styled from "styled-components"
import { Button } from "@/components/ui/button"

const Container = styled.div`
  max-width: 100%;
  padding: 0 1rem;
`

const HeaderFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 32px 0;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`

const StyledHeading = styled(Typography.Title)<{ color?: string }>`
  font-size: 1.125rem !important;
  margin-bottom: 0 !important;
  color: ${props => props.color} !important;
  
  @media (max-width: 768px) {
    text-align: center;
  }
  
  @media (min-width: 769px) {
    text-align: left;
  }
`

const FlexContainer = styled.div<{
  direction?: { base?: string; md?: string } | string
  gap?: number
}>`
  display: flex;
  gap: ${props => props.gap ? `${props.gap * 8}px` : '0'};
  
  @media (max-width: 768px) {
    flex-direction: ${props => 
      typeof props.direction === 'object' && props.direction.base ? props.direction.base : 
      typeof props.direction === 'string' ? props.direction : 'row'};
  }
  
  @media (min-width: 769px) {
    flex-direction: ${props => 
      typeof props.direction === 'object' && props.direction.md ? props.direction.md : 
      typeof props.direction === 'string' ? props.direction : 'row'};
  }
`

const ProfileCard = styled.div<{ 
  bg?: string
  borderColor?: string
}>`
  flex: 1;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  background: ${props => props.bg || 'white'};
  border: 1px solid ${props => props.borderColor || '#e0e0e0'};
`

const AvatarContainer = styled.div<{
  bg?: string
}>`
  border-radius: 50%;
  background: ${props => props.bg || '#e0f2f1'};
  padding: 16px;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
`

const AvatarText = styled(Typography.Text)<{ color?: string }>`
  font-size: 2rem !important;
  font-weight: bold !important;
  color: ${props => props.color} !important;
`

const CenteredDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  text-align: center;
`

const InfoCard = styled.div<{ 
  bg?: string
  borderColor?: string
}>`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 24px;
`

const InfoSection = styled.div<{ 
  bg?: string
  borderColor?: string
}>`
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-radius: 6px;
  background: ${props => props.bg || 'white'};
  border: 1px solid ${props => props.borderColor || '#e0e0e0'};
`

const GridContainer = styled.div`
  display: grid;
  gap: 16px;
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 641px) {
    grid-template-columns: 1fr 1fr;
  }
`

const InfoItem = styled.div``

const StyledText = styled(Typography.Text)<{ 
  fontWeight?: string | number
  color?: string
  fontSize?: string
}>`
  font-weight: ${props => props.fontWeight || 'normal'} !important;
  color: ${props => props.color} !important;
  font-size: ${props => props.fontSize || 'inherit'} !important;
  display: block;
  margin-bottom: 4px;
`

const IconWrapper = styled.span`
  display: inline-flex;
  align-items: center;
  margin-right: 8px;
`

export const Route = createFileRoute("/_layout/profile")({
  component: UserProfile,
})

function UserProfile() {
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  
  // Dark mode color values
  const headingColor = useColorModeValue("gray.800", "white")
  const textColor = useColorModeValue("gray.500", "gray.400")
  const bgBox = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const avatarBg = useColorModeValue("blue.100", "blue.900")
  const avatarColor = useColorModeValue("blue.500", "blue.300")

  if (!currentUser) {
    return null
  }

  return (
    <Container>
      <HeaderFlex>
        <StyledHeading level={2} color={headingColor}>
          {t('dashboard.profile')}
        </StyledHeading>
      </HeaderFlex>

      <FlexContainer direction={{ base: "column", md: "row" }} gap={8}>
        <ProfileCard bg={bgBox} borderColor={borderColor}>
          <CenteredDiv>
            <AvatarContainer bg={avatarBg}>
              <AvatarText color={avatarColor}>
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </AvatarText>
            </AvatarContainer>
            <div>
              <StyledHeading level={4} color={headingColor}>{currentUser.full_name || t('mindmap.default')}</StyledHeading>
              <StyledText color={textColor}>{currentUser.email}</StyledText>
              <StyledText fontSize="14px" color={textColor}>
                {t('profile.accountCreated')} {new Date().getFullYear()}
              </StyledText>
            </div>
            <Button 
              size="small" 
              style={{ borderColor: '#1677ff', color: '#1677ff' }}
              onClick={() => console.log("Edit profile clicked")}
            >
              <IconWrapper>
                <MdEdit />
              </IconWrapper>
              {t('profile.editProfile')}
            </Button>
          </CenteredDiv>
        </ProfileCard>

        <InfoCard>
          <InfoSection bg={bgBox} borderColor={borderColor}>
            <StyledHeading level={4} color={headingColor}>{t('profile.personalInfo')}</StyledHeading>
            <GridContainer>
              <InfoItem>
                <StyledText fontWeight="bold" color={textColor}>{t('auth.email')}</StyledText>
                <StyledText color={headingColor}>{currentUser.email}</StyledText>
              </InfoItem>
              <InfoItem>
                <StyledText fontWeight="bold" color={textColor}>{t('auth.name')}</StyledText>
                <StyledText color={headingColor}>{currentUser.full_name || t('mindmap.default')}</StyledText>
              </InfoItem>
              <InfoItem>
                <StyledText fontWeight="bold" color={textColor}>{t('profile.accountType')}</StyledText>
                <StyledText color={headingColor}>{currentUser.is_superuser ? t('profile.administrator') : t('profile.standardUser')}</StyledText>
              </InfoItem>
              <InfoItem>
                <StyledText fontWeight="bold" color={textColor}>{t('profile.accountStatus')}</StyledText>
                <StyledText color={headingColor}>{currentUser.is_active ? t('profile.active') : t('profile.inactive')}</StyledText>
              </InfoItem>
            </GridContainer>
          </InfoSection>

          <InfoSection bg={bgBox} borderColor={borderColor}>
            <StyledHeading level={4} color={headingColor}>{t('profile.activitySummary')}</StyledHeading>
            <GridContainer>
              <InfoItem>
                <StyledText fontWeight="bold" color={textColor}>{t('profile.mindMapsCreated')}</StyledText>
                <StyledText fontSize="32px" color={headingColor}>0</StyledText>
              </InfoItem>
              <InfoItem>
                <StyledText fontWeight="bold" color={textColor}>{t('profile.videosAnalyzed')}</StyledText>
                <StyledText fontSize="32px" color={headingColor}>0</StyledText>
              </InfoItem>
            </GridContainer>
          </InfoSection>
        </InfoCard>
      </FlexContainer>
    </Container>
  )
}

export default UserProfile 