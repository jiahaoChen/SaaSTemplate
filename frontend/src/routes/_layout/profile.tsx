import { Box, Container, Heading, Flex, Text, Icon, Button } from "@chakra-ui/react"
import { createFileRoute } from "@tanstack/react-router"
import { MdEdit } from "react-icons/md"
import { useColorModeValue } from "@/components/ui/color-mode"
import useLanguage from "@/hooks/useLanguage"
import useAuth from "@/hooks/useAuth"

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
    <Container maxW="full">
      <Flex alignItems="center" justifyContent="space-between" py={8}>
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} color={headingColor}>
          {t('dashboard.profile')}
        </Heading>
      </Flex>

      <Flex direction={{ base: "column", md: "row" }} gap={8}>
        <Box flex="1" p={6} boxShadow="md" borderRadius="md" bg={bgBox} borderColor={borderColor} borderWidth="1px">
          <Flex direction="column" alignItems="center" gap={6}>
            <Box 
              borderRadius="full" 
              bg={avatarBg}
              p={4} 
              width="120px" 
              height="120px" 
              display="flex" 
              alignItems="center" 
              justifyContent="center"
            >
              <Text fontSize="4xl" fontWeight="bold" color={avatarColor}>
                {currentUser.full_name ? currentUser.full_name.charAt(0).toUpperCase() : currentUser.email.charAt(0).toUpperCase()}
              </Text>
            </Box>
            <Box textAlign="center">
              <Heading size="md" color={headingColor}>{currentUser.full_name || t('mindmap.default')}</Heading>
              <Text color={textColor}>{currentUser.email}</Text>
              <Text fontSize="sm" mt={2} color={textColor}>
                {t('profile.accountCreated')} {new Date().getFullYear()}
              </Text>
            </Box>
            <Button 
              size="sm" 
              colorScheme="blue" 
              variant="outline"
              onClick={() => console.log("Edit profile clicked")}
            >
              <Flex align="center" gap={2}>
                <Icon as={MdEdit} />
                <Text>{t('profile.editProfile')}</Text>
              </Flex>
            </Button>
          </Flex>
        </Box>

        <Flex flex="2" direction="column" gap={6}>
          <Box p={6} boxShadow="md" borderRadius="md" bg={bgBox} borderColor={borderColor} borderWidth="1px">
            <Heading size="md" mb={4} color={headingColor}>{t('profile.personalInfo')}</Heading>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <Box>
                <Text fontWeight="bold" color={textColor}>{t('auth.email')}</Text>
                <Text color={headingColor}>{currentUser.email}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={textColor}>{t('auth.name')}</Text>
                <Text color={headingColor}>{currentUser.full_name || t('mindmap.default')}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={textColor}>{t('profile.accountType')}</Text>
                <Text color={headingColor}>{currentUser.is_superuser ? t('profile.administrator') : t('profile.standardUser')}</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={textColor}>{t('profile.accountStatus')}</Text>
                <Text color={headingColor}>{currentUser.is_active ? t('profile.active') : t('profile.inactive')}</Text>
              </Box>
            </Box>
          </Box>

          <Box p={6} boxShadow="md" borderRadius="md" bg={bgBox} borderColor={borderColor} borderWidth="1px">
            <Heading size="md" mb={4} color={headingColor}>{t('profile.activitySummary')}</Heading>
            <Box display="grid" gridTemplateColumns={{ base: "1fr", sm: "1fr 1fr" }} gap={4}>
              <Box>
                <Text fontWeight="bold" color={textColor}>{t('profile.mindMapsCreated')}</Text>
                <Text fontSize="2xl" color={headingColor}>0</Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color={textColor}>{t('profile.videosAnalyzed')}</Text>
                <Text fontSize="2xl" color={headingColor}>0</Text>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Flex>
    </Container>
  )
}

export default UserProfile 