import { Box, Flex } from "@chakra-ui/react"
import React, { ReactNode } from "react"
// import MindMapNavbar from "./MindMapNavbar"
import MindMapFooter from "./MindMapFooter"

interface MindMapLayoutProps {
  children: ReactNode
  showFooter?: boolean
}

const MindMapLayout: React.FC<MindMapLayoutProps> = ({ 
  children, 
  showFooter = true 
}) => {
  return (
    <Flex direction="column" minHeight="100vh">
      {/* <MindMapNavbar /> */}
      <Box flex="1" as="main">
        {children}
      </Box>
      {showFooter && <MindMapFooter />}
    </Flex>
  )
}

export default MindMapLayout 