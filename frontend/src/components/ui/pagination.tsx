"use client"

import { Pagination as AntdPagination, Button, Typography } from "antd"
import type { PaginationProps as AntdPaginationProps } from "antd"
import * as React from "react"
import {
  HiChevronLeft,
  HiChevronRight,
  HiMiniEllipsisHorizontal,
} from "react-icons/hi2"

const { Text } = Typography

type PaginationVariant = "outline" | "solid" | "subtle"

interface PaginationContextValue {
  page: number
  totalPages: number
  pageRange: { start: number; end: number }
  count: number
  nextPage: number | null
  previousPage: number | null
}

const PaginationContext = React.createContext<PaginationContextValue | null>(null)

const usePaginationContext = () => {
  const context = React.useContext(PaginationContext)
  if (!context) {
    throw new Error('usePaginationContext must be used within PaginationRoot')
  }
  return context
}

export interface PaginationRootProps extends Omit<AntdPaginationProps, 'onChange' | 'size'> {
  size?: 'small' | 'default'
  variant?: PaginationVariant
  getHref?: (page: number) => string
  page?: number
  count?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  children?: React.ReactNode
}

export const PaginationRoot = React.forwardRef<
  HTMLDivElement,
  PaginationRootProps
>(function PaginationRoot(props, ref) {
  const { 
    size = "default", 
    variant = "outline", 
    getHref, 
    page = 1,
    count = 0,
    pageSize = 10,
    onPageChange,
    children,
    ...rest 
  } = props
  
  const totalPages = Math.ceil(count / pageSize)
  const nextPage = page < totalPages ? page + 1 : null
  const previousPage = page > 1 ? page - 1 : null
  const pageRange = {
    start: (page - 1) * pageSize,
    end: Math.min(page * pageSize, count)
  }
  
  const contextValue: PaginationContextValue = {
    page,
    totalPages,
    pageRange,
    count,
    nextPage,
    previousPage
  }

  if (children) {
    return (
      <PaginationContext.Provider value={contextValue}>
        <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {children}
        </div>
      </PaginationContext.Provider>
    )
  }

  return (
    <div ref={ref}>
      <AntdPagination
        current={page}
        total={count}
        pageSize={pageSize}
        size={size}
        onChange={onPageChange}
        showSizeChanger={false}
        {...rest}
      />
    </div>
  )
})

export const PaginationEllipsis = () => (
  <Button
    type="text"
    size="small"
    icon={<HiMiniEllipsisHorizontal />}
    disabled
  />
)

export const PaginationItem = ({ value }: { value: number; type?: string }) => {
  const { page } = usePaginationContext()
  const current = page === value

  return (
    <Button
      type={current ? "primary" : "default"}
      size="small"
    >
      {value}
    </Button>
  )
}

export const PaginationPrevTrigger = () => {
  const { previousPage } = usePaginationContext()

  return (
    <Button
      type="default"
      size="small"
      disabled={!previousPage}
      icon={<HiChevronLeft />}
    />
  )
}

export const PaginationNextTrigger = () => {
  const { nextPage } = usePaginationContext()

  return (
    <Button
      type="default"
      size="small"
      disabled={!nextPage}
      icon={<HiChevronRight />}
    />
  )
}

export const PaginationItems = () => {
  const { page, totalPages } = usePaginationContext()
  
  // Simple pagination items - show current page and a few around it
  const pages = []
  const startPage = Math.max(1, page - 2)
  const endPage = Math.min(totalPages, page + 2)
  
  for (let i = startPage; i <= endPage; i++) {
    pages.push({ type: 'page', value: i })
  }
  
  return (
    <>
      {pages.map((pageItem, index) => (
        <PaginationItem
          key={index}
          type="page"
          value={pageItem.value}
        />
      ))}
    </>
  )
}

interface PageTextProps {
  format?: "short" | "compact" | "long"
}

export const PaginationPageText = ({ format = "compact" }: PageTextProps) => {
  const { page, totalPages, pageRange, count } = usePaginationContext()
  
  const content = React.useMemo(() => {
    if (format === "short") return `${page} / ${totalPages}`
    if (format === "compact") return `${page} of ${totalPages}`
    return `${pageRange.start + 1} - ${Math.min(pageRange.end, count)} of ${count}`
  }, [format, page, totalPages, pageRange, count])

  return <Text>{content}</Text>
}
