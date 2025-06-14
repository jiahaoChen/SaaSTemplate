"use client"

import { ChakraProvider } from "@chakra-ui/react"
import { type PropsWithChildren } from "react"
import { system } from "../../theme"
import { ColorModeProvider } from "./color-mode"
import { LanguageProvider } from "../../contexts/LanguageContext"

export function CustomProvider(props: PropsWithChildren) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider defaultTheme="light">
        <LanguageProvider>
          {props.children}
        </LanguageProvider>
      </ColorModeProvider>
    </ChakraProvider>
  )
}
