"use client"


import * as React from "react"
import styled from 'styled-components'

const StyledLinkButton = styled.a<{ $variant?: string; $size?: string }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  border-radius: 6px;
  font-weight: 400;
  transition: all 0.2s;
  cursor: pointer;
  
  /* Size variants */
  ${props => {
    switch (props.$size) {
      case 'small':
        return `
          height: 24px;
          padding: 0 7px;
          font-size: 12px;
        `;
      case 'large':
        return `
          height: 40px;
          padding: 0 15px;
          font-size: 16px;
        `;
      default:
        return `
          height: 32px;
          padding: 0 11px;
          font-size: 14px;
        `;
    }
  }}
  
  /* Variant styles */
  ${props => {
    switch (props.$variant) {
      case 'outline':
        return `
          border: 1px solid #d9d9d9;
          background: transparent;
          color: rgba(0, 0, 0, 0.88);
          
          &:hover {
            border-color: #4096ff;
            color: #4096ff;
          }
        `;
      case 'ghost':
        return `
          border: none;
          background: transparent;
          color: rgba(0, 0, 0, 0.88);
          
          &:hover {
            background: rgba(0, 0, 0, 0.06);
          }
        `;
      case 'solid':
        return `
          border: 1px solid #1677ff;
          background: #1677ff;
          color: #fff;
          
          &:hover {
            background: #4096ff;
            border-color: #4096ff;
          }
        `;
      default:
        return `
          border: 1px solid #d9d9d9;
          background: #fff;
          color: rgba(0, 0, 0, 0.88);
          
          &:hover {
            border-color: #4096ff;
            color: #4096ff;
          }
        `;
    }
  }}
`

export interface LinkButtonProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: 'outline' | 'ghost' | 'solid' | 'default'
  size?: 'small' | 'middle' | 'large'
  children: React.ReactNode
}

export const LinkButton = React.forwardRef<HTMLAnchorElement, LinkButtonProps>(
  function LinkButton(props, ref) {
    const { variant = 'default', size = 'middle', children, ...rest } = props
    
    return (
      <StyledLinkButton
        ref={ref}
        $variant={variant}
        $size={size}
        {...rest}
      >
        {children}
      </StyledLinkButton>
    )
  }
)
