"use client"

import { Button } from "antd"
import { ThemeProvider, useTheme } from "next-themes"
import type { ThemeProviderProps } from "next-themes"
import * as React from "react"
import { LuMoon, LuSun } from "react-icons/lu"

export interface ColorModeProviderProps extends ThemeProviderProps {}

export function ColorModeProvider(props: ColorModeProviderProps) {
  return (
    <ThemeProvider attribute="class" disableTransitionOnChange {...props} />
  )
}

export type ColorMode = "light" | "dark"

export interface UseColorModeReturn {
  colorMode: ColorMode
  setColorMode: (colorMode: ColorMode) => void
  toggleColorMode: () => void
}

export function useColorMode(): UseColorModeReturn {
  const { resolvedTheme, setTheme } = useTheme()
  const toggleColorMode = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark")
  }
  return {
    colorMode: resolvedTheme as ColorMode,
    setColorMode: setTheme,
    toggleColorMode,
  }
}

export function useColorModeValue<T>(light: T, dark: T) {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? dark : light
}

export function ColorModeIcon() {
  const { colorMode } = useColorMode()
  return colorMode === "dark" ? <LuMoon /> : <LuSun />
}

interface ColorModeButtonProps {
  size?: 'small' | 'middle' | 'large'
  className?: string
}

export const ColorModeButton = React.forwardRef<
  HTMLButtonElement,
  ColorModeButtonProps
>(function ColorModeButton(props, ref) {
  const { toggleColorMode } = useColorMode()
  return (
    <Button
      ref={ref}
      onClick={toggleColorMode}
      icon={<ColorModeIcon />}
      type="text"
      size={props.size || 'middle'}
      className={props.className}
      aria-label="Toggle color mode"
    />
  )
})

// Simple wrapper components for theme context
export const LightMode = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function LightMode(props, ref) {
    return (
      <span
        ref={ref}
        {...props}
        className={`light-mode ${props.className || ''}`}
      />
    )
  },
)

export const DarkMode = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
  function DarkMode(props, ref) {
    return (
      <span
        ref={ref}
        {...props}
        className={`dark-mode ${props.className || ''}`}
      />
    )
  },
)
