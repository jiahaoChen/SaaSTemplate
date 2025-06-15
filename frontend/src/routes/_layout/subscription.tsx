import { createFileRoute } from '@tanstack/react-router'
import { Container, Heading } from '@/components/ui/styled'

export const Route = createFileRoute('/_layout/subscription')({
  component: () => {
    return (
      <Container maxW="full">
        <Heading level={2} textAlign={{ base: "center", md: "left" }} py={12}>
          Subscription
        </Heading>
      </Container>
    )
  }
})