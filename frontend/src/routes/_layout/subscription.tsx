import { createFileRoute } from '@tanstack/react-router'
import { Container, Heading } from '@chakra-ui/react'

export const Route = createFileRoute('/_layout/subscription')({
  component: () => {
    return (
      <Container maxW="full">
        <Heading size="lg" textAlign={{ base: "center", md: "left" }} py={12}>
          Subscription
        </Heading>
      </Container>
    )
  }
})