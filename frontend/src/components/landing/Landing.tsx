import React from "react";
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Image,
  Text,
  VStack,
  HStack,
  Icon,
  Grid,
  Stack,
  IconButton,
} from "@chakra-ui/react";
import { Link } from "@tanstack/react-router";
import { FaPlay, FaUserPlus, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { ColorModeButton, useColorModeValue } from "../ui/color-mode";
import { LanguageSwitcher } from "../ui/language-switcher";
import useLanguage from "@/hooks/useLanguage";

export function Landing() {
  const { t } = useLanguage();
  
  // Color mode values
  const bgColor = useColorModeValue("white", "#121212");
  const textColor = useColorModeValue("#333333", "#f5f7fa");
  const secondaryTextColor = useColorModeValue("#718096", "#a0aec0");
  const cardBg = useColorModeValue("white", "#1e1e1e");
  const brandsSectionBg = useColorModeValue("#f5f7fa", "#1a202c");
  const primaryColor = useColorModeValue("#7856ff", "#8a70ff");
  const borderColor = useColorModeValue("#e2e8f0", "#2d3748");

  // Define features with translation keys
  const features = [
    {
      titleKey: "landing.features.autoSubtitles",
      descKey: "landing.features.autoSubtitlesDesc",
      icon: FaPlay,
    },
    {
      titleKey: "landing.features.aiSummary",
      descKey: "landing.features.aiSummaryDesc",
      icon: FaPlay,
    },
    {
      titleKey: "landing.features.interactiveMindmap",
      descKey: "landing.features.interactiveMindmapDesc",
      icon: FaPlay,
    },
    {
      titleKey: "landing.features.exportFormats",
      descKey: "landing.features.exportFormatsDesc",
      icon: FaPlay,
    },
    {
      titleKey: "landing.features.historyManagement",
      descKey: "landing.features.historyManagementDesc",
      icon: FaPlay,
    },
    {
      titleKey: "landing.features.customParams",
      descKey: "landing.features.customParamsDesc",
      icon: FaPlay,
    },
  ];

  // Define steps with translation keys
  const steps = [
    {
      titleKey: "landing.howItWorks.step1",
      descKey: "landing.howItWorks.step1Desc",
    },
    {
      titleKey: "landing.howItWorks.step2",
      descKey: "landing.howItWorks.step2Desc",
    },
    {
      titleKey: "landing.howItWorks.step3",
      descKey: "landing.howItWorks.step3Desc",
    },
  ];

  return (
    <Box bg={bgColor} color={textColor} minH="100vh" transition="all 0.3s ease">
      {/* Navigation Bar */}
      <Box as="nav" bg={cardBg} boxShadow="0 2px 10px rgba(0,0,0,0.05)" position="sticky" top={0} zIndex={1000}>
        <Container maxW="1200px" py={4}>
          <Flex justify="space-between" align="center">
            <Flex align="center">
              <Image 
                src="/assets/images/logo1.png" 
                alt="MindTube Logo"
                boxSize="40px"
                mr={2}
              />
              <Heading as="h1" size="lg" fontWeight="bold">
                MindTube
              </Heading>
            </Flex>

            <HStack gap={8} display={{ base: "none", md: "flex" }}>
              <Text fontWeight="medium" cursor="pointer">{t("landing.nav.features")}</Text>
              <Text fontWeight="medium" cursor="pointer">{t("landing.nav.pricing")}</Text>
              <Text fontWeight="medium" cursor="pointer">{t("landing.nav.testimonials")}</Text>
              <Text fontWeight="medium" cursor="pointer">{t("landing.nav.faq")}</Text>
            </HStack>

            <HStack gap={4}>
              <Link to="/login" activeOptions={{ exact: true }}>
                <Button variant="outline" colorScheme="purple">
                  {t("landing.nav.login")}
                </Button>
              </Link>
              <Link to="/signup" activeOptions={{ exact: true }}>
                <Button colorScheme="purple">{t("landing.nav.signup")}</Button>
              </Link>
              <ColorModeButton />
              <LanguageSwitcher />
            </HStack>

            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label="Open menu"
              fontSize="20px"
              variant="ghost"
            >
              <Icon as={FaArrowRight} />
            </IconButton>
          </Flex>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box as="section" pt={16} pb={0}>
        <Container maxW="1200px">
          <Flex
            direction={{ base: "column", lg: "row" }}
            align="center"
            justify="space-between"
            gap={8}
          >
            <VStack align="flex-start" gap={6} maxW={{ lg: "600px" }}>
              <Heading
                as="h2"
                fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
                lineHeight="1.2"
                fontWeight="bold"
              >
                {t("landing.hero.title")}
              </Heading>
              
              <Text fontSize={{ base: "lg", md: "xl" }} color={secondaryTextColor}>
                {t("landing.hero.subtitle")}
              </Text>
              
              <HStack gap={4} flexWrap="wrap">
                <Link to="/mindmap/create" activeOptions={{ exact: true }}>
                  <Button
                    size="lg"
                    colorScheme="purple"
                  >
                    <Flex align="center" gap={2}>
                      <Icon as={FaPlay} />
                      <span>{t("landing.hero.startNow")}</span>
                    </Flex>
                  </Button>
                </Link>
                
                <Link to="/signup" activeOptions={{ exact: true }}>
                  <Button
                    size="lg"
                    variant="outline"
                    colorScheme="purple"
                  >
                    <Flex align="center" gap={2}>
                      <Icon as={FaUserPlus} />
                      <span>{t("landing.hero.freeSignup")}</span>
                    </Flex>
                  </Button>
                </Link>
              </HStack>
              
              <HStack color={secondaryTextColor}>
                <Icon as={FaCheckCircle} color="green.500" />
                <Text>{t("landing.hero.noCard")}</Text>
              </HStack>
            </VStack>
            
            <Box>
              <Image
                src="/images/mindmap-hero.png"
                alt="MindTube Example"
                borderRadius="lg"
                boxShadow="lg"
                maxW={{ base: "100%", lg: "500px" }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "https://placehold.co/600x400/7856ff/FFFFFF/png?text=MindTube";
                }}
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Brands Section */}
      <Box as="section" bg={brandsSectionBg} py={8} mt={16}>
        <Container maxW="1200px">
          <Text textAlign="center" mb={6} color={secondaryTextColor}>
            {t("landing.brands.trustedBy")}
          </Text>
          
          <Flex justify="space-between" align="center" flexWrap="wrap" gap={8}>
            {[1, 2, 3, 4, 5].map((i) => (
              <Image
                key={i}
                src={`https://placehold.co/120x40/${borderColor.replace('#', '')}/${secondaryTextColor.replace('#', '')}/png?text=Brand+${i}`}
                alt={`Brand ${i}`}
              />
            ))}
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box as="section" py={20}>
        <Container maxW="1200px">
          <VStack gap={6} mb={16}>
            <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
              {t("landing.features.title")}
            </Heading>
            
            <Text 
              fontSize={{ base: "md", md: "lg" }} 
              color={secondaryTextColor} 
              textAlign="center"
              maxW="800px"
            >
              {t("landing.features.subtitle")}
            </Text>
          </VStack>
          
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }}
            gap={8}
          >
            {features.map((feature, idx) => (
              <Box
                key={idx}
                bg={cardBg}
                p={8}
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor={borderColor}
              >
                <Flex
                  w={12}
                  h={12}
                  borderRadius="full"
                  bg={`rgba(120, 86, 255, 0.1)`}
                  justify="center"
                  align="center"
                  mb={4}
                >
                  <Icon as={feature.icon} fontSize="xl" color={primaryColor} />
                </Flex>
                
                <Heading as="h3" fontSize="xl" mb={4}>
                  {t(feature.titleKey)}
                </Heading>
                
                <Text color={secondaryTextColor}>
                  {t(feature.descKey)}
                </Text>
              </Box>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Box as="section" bg={brandsSectionBg} py={20}>
        <Container maxW="1200px">
          <VStack gap={6} mb={16}>
            <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
              {t("landing.howItWorks.title")}
            </Heading>
            
            <Text 
              fontSize={{ base: "md", md: "lg" }} 
              color={secondaryTextColor} 
              textAlign="center"
              maxW="800px"
            >
              {t("landing.howItWorks.subtitle")}
            </Text>
          </VStack>
          
          <Stack
            direction={{ base: "column", md: "row" }}
            gap={{ base: 8, md: 4 }}
            justify="space-between"
            align="center"
          >
            {steps.map((step, idx) => (
              <React.Fragment key={idx}>
                <VStack gap={4} flex="1" textAlign="center">
                  <Flex
                    w={16}
                    h={16}
                    borderRadius="full"
                    bg={primaryColor}
                    color="white"
                    justify="center"
                    align="center"
                    fontSize="2xl"
                    fontWeight="bold"
                  >
                    {idx + 1}
                  </Flex>
                  
                  <Heading as="h3" fontSize="xl">
                    {t(step.titleKey)}
                  </Heading>
                  
                  <Text color={secondaryTextColor}>
                    {t(step.descKey)}
                  </Text>
                </VStack>
                
                {idx < steps.length - 1 && (
                  <Icon
                    as={FaArrowRight}
                    fontSize="2xl"
                    color={secondaryTextColor}
                    display={{ base: "none", md: "block" }}
                  />
                )}
              </React.Fragment>
            ))}
          </Stack>
        </Container>
      </Box>

      {/* Demo Examples Section */}
      <Box as="section" py={20}>
        <Container maxW="1200px">
          <VStack gap={6} mb={16}>
            <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }} textAlign="center">
              {t("landing.demos.title") || "See MindTube in Action"}
            </Heading>
            
            <Text 
              fontSize={{ base: "md", md: "lg" }} 
              color={secondaryTextColor} 
              textAlign="center"
              maxW="800px"
            >
              {t("landing.demos.subtitle") || "Check out these real-world examples of AI-generated mindmaps from YouTube videos"}
            </Text>
          </VStack>
          
          <Grid 
            templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }}
            gap={8}
          >
            <Box>
              <VStack align="flex-start" gap={4}>
                <Image
                  src="/images/demo1.png"
                  alt="AI at DeepMind Example"
                  borderRadius="lg"
                  boxShadow="lg"
                  width="100%"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400/7856ff/FFFFFF/png?text=MindTube+Demo";
                  }}
                />
                <Heading as="h3" fontSize="xl">
                  {t("landing.demos.example1Title") || "AI at DeepMind, Google's Intelligence Lab"}
                </Heading>
                <Text color={secondaryTextColor}>
                  {t("landing.demos.example1Desc") || "This mindmap breaks down the key concepts from a 60 Minutes feature on DeepMind, showing AI advancements and future applications."}
                </Text>
              </VStack>
            </Box>
            
            <Box>
              <VStack align="flex-start" gap={4}>
                <Image
                  src="/images/demo2.png"
                  alt="NVIDIA GTC 2025 Example"
                  borderRadius="lg"
                  boxShadow="lg"
                  width="100%"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = "https://placehold.co/600x400/7856ff/FFFFFF/png?text=MindTube+Demo";
                  }}
                />
                <Heading as="h3" fontSize="xl">
                  {t("landing.demos.example2Title") || "NVIDIA GTC 2025 - Jensen Huang on AI's Future"}
                </Heading>
                <Text color={secondaryTextColor}>
                  {t("landing.demos.example2Desc") || "This mindmap visualizes key points from Jensen Huang's GTC 2025 keynote on AI infrastructure and NVIDIA's vision for computing."}
                </Text>
              </VStack>
            </Box>
          </Grid>
          
          <Box textAlign="center" mt={12}>
            <Link to="/mindmap/create" activeOptions={{ exact: true }}>
              <Button size="lg" colorScheme="purple">
                {t("landing.demos.createYourOwn") || "Create Your Own Mindmap"}
              </Button>
            </Link>
          </Box>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box as="section" py={20}>
        <Container maxW="800px">
          <VStack
            gap={8}
            p={8}
            borderRadius="lg"
            bg={cardBg}
            boxShadow="xl"
            border="1px solid"
            borderColor={borderColor}
            textAlign="center"
          >
            <Heading as="h2" fontSize={{ base: "2xl", md: "3xl" }}>
              {t("landing.cta.title")}
            </Heading>
            
            <Text fontSize={{ base: "md", md: "lg" }} color={secondaryTextColor}>
              {t("landing.cta.subtitle")}
            </Text>
            
            <Link to="/signup" activeOptions={{ exact: true }}>
              <Button size="lg" colorScheme="purple" px={8}>
                {t("landing.cta.signup")}
              </Button>
            </Link>
            
            <Text fontSize="sm" color={secondaryTextColor}>
              {t("landing.cta.freeUsage")}
            </Text>
          </VStack>
        </Container>
      </Box>
    </Box>
  );
}
