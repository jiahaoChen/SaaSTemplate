import { Box, Button, Flex, Heading, HStack } from "@chakra-ui/react"
import React from "react"

interface PrototypeNavProps {
  currentPage: string
  onChangePage: (page: string) => void
}

const PrototypeNav: React.FC<PrototypeNavProps> = ({
  currentPage,
  onChangePage,
}) => {
  const pages = [
    { id: "prototype", label: "主頁面" },
    { id: "prototype_feature", label: "功能頁面" },
    { id: "new_mindmap", label: "創建思維導圖" },
    { id: "mindmap_library", label: "思維導圖庫" },
    { id: "mindmap_detail", label: "思維導圖詳情" },
  ]

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      bg="white"
      boxShadow="md"
      zIndex="1000"
      p={4}
    >
      <Flex justify="space-between" align="center" maxW="1200px" mx="auto">
        <Heading size="md">YouTube MindMap 原型</Heading>
        <HStack gap={4}>
          {pages.map((page) => (
            <Button
              key={page.id}
              colorScheme={currentPage === page.id ? "purple" : "gray"}
              variant={currentPage === page.id ? "solid" : "outline"}
              onClick={() => onChangePage(page.id)}
            >
              {page.label}
            </Button>
          ))}
        </HStack>
      </Flex>
    </Box>
  )
}

export default PrototypeNav 