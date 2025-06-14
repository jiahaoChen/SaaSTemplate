import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  VStack,
  Icon,
} from "@chakra-ui/react"
import React from "react"
import { FaCheckCircle } from "react-icons/fa"
import { Link as RouterLink } from "@tanstack/react-router"
import { mindmapTheme } from "../../../theme/mindmap"

interface PricingPlanProps {
  title: string
  price: string
  description: string
  features: Array<{ text: string; included: boolean }>
  isPopular?: boolean
}

const PricingPlan: React.FC<PricingPlanProps> = ({
  title,
  price,
  description,
  features,
  isPopular = false,
}) => {
  return (
    <Box
      borderWidth={1}
      borderRadius="md"
      p={6}
      boxShadow={isPopular ? "lg" : "md"}
      bg={isPopular ? "yellow.100" : "white"}
    >
      <Heading as="h3" size="lg" mb={4}>
        {title}
      </Heading>
      <Text fontSize="2xl" mb={4}>
        {price}
      </Text>
      <Text mb={4}>{description}</Text>
      <VStack align="stretch">
        {features.map((feature, index) => (
          <Flex key={index} align="center">
            {feature.included ? (
              <Icon as={FaCheckCircle} color="green.500" mr={2} />
            ) : (
              <Box width="24px" height="24px" mr={2} />
            )}
            <Text
              color={
                feature.included
                  ? mindmapTheme.colors.dark
                  : mindmapTheme.colors.gray
              }
              textDecoration={feature.included ? "none" : "line-through"}
            >
              {feature.text}
            </Text>
          </Flex>
        ))}
      </VStack>
      <RouterLink to="/signup">
        <Button
          colorScheme={isPopular ? "purple" : "gray"}
          variant={isPopular ? "solid" : "outline"}
          size="lg"
          w="full"
          mt={4}
        >
          {price === "免費" ? "立即開始" : "選擇方案"}
        </Button>
      </RouterLink>
    </Box>
  )
}

const Pricing: React.FC = () => {
  const plans = [
    {
      title: "基本計劃",
      price: "$9/月",
      description: "適合個人使用的基本功能",
      features: [
        { text: "功能1", included: true },
        { text: "功能2", included: false },
        { text: "功能3", included: true },
      ],
    },
    // Add more plans as needed
  ]

  return (
    <Container maxW="1200px" py={16}>
      <Flex direction="column" align="center">
        <Heading as="h2" size="xl" mb={6}>
          定價計劃
        </Heading>
        <Flex direction={{ base: "column", md: "row" }} gap={6}>
          {plans.map((plan, index) => (
            <PricingPlan key={index} {...plan} />
          ))}
        </Flex>
      </Flex>
    </Container>
  )
}

export default Pricing 