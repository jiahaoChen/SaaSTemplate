import { Typography } from "antd"
import { useTheme } from "next-themes"
import useLanguage from "@/hooks/useLanguage"
import useAnalytics from "@/hooks/useAnalytics"
import styled from "styled-components"

import { Radio, RadioGroup } from "@/components/ui/radio"

const Container = styled.div`
  max-width: 100%;
  padding: 0 1rem;
`

const StyledHeading = styled(Typography.Title)`
  font-size: 0.875rem !important;
  padding: 16px 0 !important;
  margin-bottom: 0 !important;
`

const StackContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const Appearance = () => {
  const { theme, setTheme } = useTheme()
  const { t } = useLanguage()
  const { trackThemeChange } = useAnalytics()

  return (
    <>
      <Container>
        <StyledHeading level={4}>
          {t("settings.appearanceText")}
        </StyledHeading>

        <RadioGroup
          onChange={(e: any) => {
            const oldTheme = theme || 'system';
            const newTheme = e.target.value;
            trackThemeChange(oldTheme, newTheme);
            setTheme(newTheme);
          }}
          value={theme}
        >
          <StackContainer>
            <Radio value="system">{t("settings.appearance.system")}</Radio>
            <Radio value="light">{t("settings.lightMode")}</Radio>
            <Radio value="dark">{t("settings.darkMode")}</Radio>
          </StackContainer>
        </RadioGroup>
      </Container>
    </>
  )
}
export default Appearance
