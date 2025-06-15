import { Typography } from "antd"
import useLanguage from "@/hooks/useLanguage"
import styled from "styled-components"

import DeleteConfirmation from "./DeleteConfirmation"

const Container = styled.div`
  max-width: 100%;
  padding: 0 1rem;
`

const StyledHeading = styled(Typography.Title)`
  font-size: 0.875rem !important;
  padding: 16px 0 !important;
  margin-bottom: 0 !important;
`

const StyledText = styled(Typography.Text)`
  display: block;
  margin-bottom: 16px;
`

const DeleteAccount = () => {
  const { t } = useLanguage()
  
  return (
    <Container>
      <StyledHeading level={4}>
        {t("settings.deleteAccountText")}
      </StyledHeading>
      <StyledText>
        {t("settings.deleteAccountWarning")}
      </StyledText>
      <DeleteConfirmation />
    </Container>
  )
}
export default DeleteAccount
