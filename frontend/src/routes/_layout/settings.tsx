import { Container, Heading, Tabs, Flex } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import useLanguage from "@/hooks/useLanguage"

import Appearance from "@/components/UserSettings/Appearance"
import ChangePassword from "@/components/UserSettings/ChangePassword"
import DeleteAccount from "@/components/UserSettings/DeleteAccount"
import UserInformation from "@/components/UserSettings/UserInformation"
import useAuth from "@/hooks/useAuth"

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
    <Container maxW="full">
      <Flex alignItems="center" justifyContent="space-between" py={12}>
        <Heading size="lg" textAlign={{ base: "center", md: "left" }}>
          {t('dashboard.settings')}
        </Heading>
      </Flex>

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
