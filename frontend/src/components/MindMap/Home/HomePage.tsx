import { Box } from "@chakra-ui/react"
import React from "react"
import Hero from "./Hero"
import Features from "./Features"
import HowItWorks from "./HowItWorks"
import Testimonials from "./Testimonials"
import Pricing from "./Pricing"
import CTA from "./CTA"
import MindMapLayout from "../Layout/MindMapLayout"

const HomePage: React.FC = () => {
  return (
    <MindMapLayout>
      <Box>
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <CTA />
      </Box>
    </MindMapLayout>
  )
}

export default HomePage 