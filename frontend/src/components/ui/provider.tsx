"use client"

import { ConfigProvider, App } from "antd"
import { type PropsWithChildren } from "react"
import { lightTheme, darkTheme } from "../../theme/antd-theme"
import { ColorModeProvider, useColorMode } from "./color-mode"
import { LanguageProvider } from "../../contexts/LanguageContext"
import enUS from 'antd/locale/en_US'
import zhCN from 'antd/locale/zh_CN'
import { useLanguageContext } from "../../contexts/LanguageContext"

function AntdConfigProvider({ children }: PropsWithChildren) {
  const { colorMode } = useColorMode()
  const { language } = useLanguageContext()
  const isDark = colorMode === 'dark'
  
  // Get locale based on current language
  const locale = language === 'zh' ? zhCN : enUS
  
  return (
    <ConfigProvider 
      theme={isDark ? darkTheme : lightTheme}
      locale={locale}
    >
      <App>
        {children}
      </App>
    </ConfigProvider>
  )
}

export function CustomProvider(props: PropsWithChildren) {
  return (
    <ColorModeProvider defaultTheme="light">
      <LanguageProvider>
        <AntdConfigProvider>
          {props.children}
        </AntdConfigProvider>
      </LanguageProvider>
    </ColorModeProvider>
  )
}
