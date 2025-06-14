import { createFileRoute } from "@tanstack/react-router"
import { Landing } from "../components/landing/Landing"

export const Route = createFileRoute("/landing")({
  component: LandingPage,
})

function LandingPage() {
  return <Landing />
}
