import { Skeleton as AntdSkeleton } from "antd"
import type { SkeletonProps as AntdSkeletonProps } from "antd"
import * as React from "react"
import styled from 'styled-components'

const SkeletonStack = styled.div<{ gap?: string | number }>`
  display: flex;
  flex-direction: column;
  gap: ${props => typeof props.gap === 'number' ? `${props.gap}px` : props.gap || '8px'};
  width: 100%;
`

const CircleSkeletonWrapper = styled.div<{ size?: string | number }>`
  width: ${props => typeof props.size === 'number' ? `${props.size}px` : props.size || '40px'};
  height: ${props => typeof props.size === 'number' ? `${props.size}px` : props.size || '40px'};
  
  .ant-skeleton-avatar {
    width: 100% !important;
    height: 100% !important;
  }
`

export interface SkeletonCircleProps extends Omit<AntdSkeletonProps, 'avatar'> {
  size?: string | number
}

export const SkeletonCircle = React.forwardRef<
  HTMLDivElement,
  SkeletonCircleProps
>(function SkeletonCircle(props, ref) {
  const { size, ...rest } = props
  
  return (
    <CircleSkeletonWrapper ref={ref} size={size}>
      <AntdSkeleton.Avatar active shape="circle" {...rest} />
    </CircleSkeletonWrapper>
  )
})

export interface SkeletonTextProps extends AntdSkeletonProps {
  noOfLines?: number
  gap?: string | number
}

export const SkeletonText = React.forwardRef<HTMLDivElement, SkeletonTextProps>(
  function SkeletonText(props, ref) {
    const { noOfLines = 3, gap, ...rest } = props
    
    return (
      <SkeletonStack ref={ref} gap={gap}>
        {Array.from({ length: noOfLines }).map((_, index) => (
          <AntdSkeleton.Button
            key={index}
            active
            style={{
              height: '16px',
              width: index === noOfLines - 1 ? '80%' : '100%'
            }}
            {...rest}
          />
        ))}
      </SkeletonStack>
    )
  },
)

// Export the base Ant Design Skeleton as well
export const Skeleton = AntdSkeleton
