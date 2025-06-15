import { Typography } from "antd"
import { createFileRoute } from "@tanstack/react-router"
import useLanguage from "@/hooks/useLanguage"
import styled from "styled-components"
import { Tabs } from "@/components/ui/tabs"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

const Container = styled.div`
  max-width: 100%;
  padding: 0 1rem;
`

const HeaderFlex = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 48px 0;
  
  @media (max-width: 768px) {
    text-align: center;
  }
`

const StyledHeading = styled(Typography.Title)`
  font-size: 1.125rem !important;
  margin-bottom: 0 !important;
  
  @media (max-width: 768px) {
    text-align: center;
  }
  
  @media (min-width: 769px) {
    text-align: left;
  }
`

const tabsConfig = [
  { value: "my-profile", titleKey: "settings.myProfile", component: UserInformation },
  { value: "password", titleKey: "settings.changePasswordText", component: ChangePassword },
  { value: "appearance", titleKey: "settings.appearanceText", component: Appearance },
  { value: "danger-zone", titleKey: "settings.dangerZone", component: DeleteAccount },
]

export const Route = createFileRoute("/_layout/settings")({
  component: UserSettings,
})

function UserSettings() {
  const { user: currentUser } = useAuth()
  const { t } = useLanguage()
  
  const finalTabs = currentUser?.is_superuser
    ? tabsConfig.slice(0, 3)
    : tabsConfig

  if (!currentUser) {
    return null
  }

  return (
    <Container>
      <HeaderFlex>
        <StyledHeading level={2}>
          {t('dashboard.settings')}
        </StyledHeading>
      </HeaderFlex>

      <Tabs.Root defaultValue="my-profile" variant="subtle">
        <Tabs.List>
          {finalTabs.map((tab) => (
            <Tabs.Trigger key={tab.value} value={tab.value}>
              {t(tab.titleKey)}
            </Tabs.Trigger>
          ))}
        </Tabs.List>
        {finalTabs.map((tab) => (
          <Tabs.Content key={tab.value} value={tab.value}>
            <tab.component />
          </Tabs.Content>
        ))}
      </Tabs.Root>
    </Container>
  )
}
