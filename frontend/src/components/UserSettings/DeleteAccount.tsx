import { Container, Heading, Text } from "@chakra-ui/react"
import useLanguage from "@/hooks/useLanguage"

import DeleteConfirmation from "./DeleteConfirmation"

const DeleteAccount = () => {
  const { t } = useLanguage()
  
  return (
    <Container maxW="full">
      <Heading size="sm" py={4}>
        {t("settings.deleteAccountText")}
      </Heading>
      <Text>
        {t("settings.deleteAccountWarning")}
      </Text>
      <DeleteConfirmation />
    </Container>
  )
}
export default DeleteAccount
