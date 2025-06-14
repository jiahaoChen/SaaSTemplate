import { Container, Heading, Stack } from "@chakra-ui/react"
import { useTheme } from "next-themes"
import useLanguage from "@/hooks/useLanguage"
import useAnalytics from "@/hooks/useAnalytics"

import { Radio, RadioGroup } from "@/components/ui/radio"

const Appearance = () => {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const { trackThemeChange } = useAnalytics()

  return (
    <>
      <Container maxW="full">
        <Heading size="sm" py={4}>
          {t("settings.appearanceText")}
        </Heading>

        <RadioGroup
          onValueChange={(e) => {
            const oldTheme = theme || 'system';
            const newTheme = e.value;
            trackThemeChange(oldTheme, newTheme);
            setTheme(newTheme);
          }}
          value={theme}
          colorPalette="teal"
        >
          <Stack>
            <Radio value="system">{t("settings.appearance.system")}</Radio>
            <Radio value="light">{t("settings.lightMode")}</Radio>
            <Radio value="dark">{t("settings.darkMode")}</Radio>
          </Stack>
        </RadioGroup>
      </Container>
    </>
  )
}
export default Appearance
