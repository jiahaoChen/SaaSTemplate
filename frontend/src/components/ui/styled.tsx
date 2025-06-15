import styled from "styled-components"
import { Typography } from "antd"
import { theme } from "@/theme/tokens"

// Basic layout components
export const Box = styled.div.withConfig({
  shouldForwardProp: (prop) => !['p', 'py', 'px', 'm', 'my', 'mx', 'bg', 'borderRadius', 'boxShadow', 'borderColor', 'borderWidth', 'minH', 'maxW', 'w', 'width', 'height', 'display', 'alignItems', 'justifyContent', 'flexDirection', 'gap', 'gridTemplateColumns', 'textAlign', 'color', 'fontSize', 'fontWeight', 'overflow', 'position', 'top', 'right', 'bottom', 'left', 'zIndex', 'cursor', 'opacity', 'transform', 'transition', '_hover', '_focus', '_active', '_placeholder'].includes(prop)
})<{
  p?: number | string
  py?: number | string
  px?: number | string
  m?: number | string
  my?: number | string
  mx?: number | string
  bg?: string
  borderRadius?: string | number
  boxShadow?: string
  borderColor?: string
  borderWidth?: string | number
  minH?: string
  maxW?: string
  w?: string
  width?: string
  height?: string
  display?: string
  alignItems?: string
  justifyContent?: string
  flexDirection?: string
  gap?: number | string
  gridTemplateColumns?: any
  textAlign?: string | { base?: string; md?: string }
  color?: string
  fontSize?: string
  fontWeight?: string | number
  overflow?: string
  position?: string
  top?: string
  right?: string
  bottom?: string
  left?: string
  zIndex?: number
  cursor?: string
  opacity?: number
  transform?: string
  transition?: string
  _hover?: any
  _focus?: any
  _active?: any
  _placeholder?: any
}>`
  ${({ p }) => p && `padding: ${typeof p === 'number' ? (theme.spacing as any)[p] || `${p}px` : p};`}
  ${({ py }) => py && `padding-top: ${typeof py === 'number' ? (theme.spacing as any)[py] || `${py}px` : py}; padding-bottom: ${typeof py === 'number' ? (theme.spacing as any)[py] || `${py}px` : py};`}
  ${({ px }) => px && `padding-left: ${typeof px === 'number' ? (theme.spacing as any)[px] || `${px}px` : px}; padding-right: ${typeof px === 'number' ? (theme.spacing as any)[px] || `${px}px` : px};`}
  ${({ m }) => m && `margin: ${typeof m === 'number' ? (theme.spacing as any)[m] || `${m}px` : m};`}
  ${({ my }) => my && `margin-top: ${typeof my === 'number' ? (theme.spacing as any)[my] || `${my}px` : my}; margin-bottom: ${typeof my === 'number' ? (theme.spacing as any)[my] || `${my}px` : my};`}
  ${({ mx }) => mx && `margin-left: ${typeof mx === 'number' ? (theme.spacing as any)[mx] || `${mx}px` : mx}; margin-right: ${typeof mx === 'number' ? (theme.spacing as any)[mx] || `${mx}px` : mx};`}
  ${({ bg }) => bg && `background: ${bg};`}
  ${({ borderRadius }) => borderRadius && `border-radius: ${typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius};`}
  ${({ boxShadow }) => boxShadow && `box-shadow: ${theme.shadows[boxShadow as keyof typeof theme.shadows] || boxShadow};`}
  ${({ borderColor }) => borderColor && `border-color: ${borderColor};`}
  ${({ borderWidth }) => borderWidth && `border-width: ${typeof borderWidth === 'number' ? `${borderWidth}px` : borderWidth}; border-style: solid;`}
  ${({ minH }) => minH && `min-height: ${minH};`}
  ${({ maxW }) => maxW && `max-width: ${maxW};`}
  ${({ w, width }) => (w || width) && `width: ${w || width};`}
  ${({ height }) => height && `height: ${height};`}
  ${({ display }) => display && `display: ${display};`}
  ${({ alignItems }) => alignItems && `align-items: ${alignItems};`}
  ${({ justifyContent }) => justifyContent && `justify-content: ${justifyContent};`}
  ${({ flexDirection }) => flexDirection && `flex-direction: ${flexDirection};`}
  ${({ gap }) => gap && `gap: ${typeof gap === 'number' ? theme.spacing[gap as keyof typeof theme.spacing] || `${gap}px` : gap};`}
  ${({ gridTemplateColumns }) => gridTemplateColumns && `display: grid; grid-template-columns: ${gridTemplateColumns};`}
  ${({ textAlign }) => textAlign && `text-align: ${textAlign};`}
  ${({ color }) => color && `color: ${color};`}
  ${({ fontSize }) => fontSize && `font-size: ${fontSize};`}
  ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight};`}
  ${({ overflow }) => overflow && `overflow: ${overflow};`}
  ${({ position }) => position && `position: ${position};`}
  ${({ top }) => top && `top: ${top};`}
  ${({ right }) => right && `right: ${right};`}
  ${({ bottom }) => bottom && `bottom: ${bottom};`}
  ${({ left }) => left && `left: ${left};`}
  ${({ zIndex }) => zIndex && `z-index: ${zIndex};`}
  ${({ cursor }) => cursor && `cursor: ${cursor};`}
  ${({ opacity }) => opacity && `opacity: ${opacity};`}
  ${({ transform }) => transform && `transform: ${transform};`}
  ${({ transition }) => transition && `transition: ${transition};`}
  
  // Responsive support for common properties
  @media (max-width: 768px) {
    ${({ textAlign }) => textAlign && typeof textAlign === 'object' && textAlign.base && `text-align: ${textAlign.base};`}
  }
  @media (min-width: 769px) {
    ${({ textAlign }) => textAlign && typeof textAlign === 'object' && textAlign.md && `text-align: ${textAlign.md};`}
  }
`

export const Flex = styled(Box).withConfig({
  shouldForwardProp: (prop) => !['direction', 'align', 'justify', 'wrap'].includes(prop)
}).attrs({ display: 'flex' })<{
  direction?: string | { base?: string; md?: string }
  align?: string
  justify?: string
  wrap?: string
}>`
  ${({ direction }) => direction && typeof direction === 'string' && `flex-direction: ${direction};`}
  ${({ align }) => align && `align-items: ${align};`}
  ${({ justify }) => justify && `justify-content: ${justify};`}
  ${({ wrap }) => wrap && `flex-wrap: ${wrap};`}
  
  // Responsive direction
  @media (max-width: 768px) {
    ${({ direction }) => direction && typeof direction === 'object' && direction.base && `flex-direction: ${direction.base};`}
  }
  @media (min-width: 769px) {
    ${({ direction }) => direction && typeof direction === 'object' && direction.md && `flex-direction: ${direction.md};`}
  }
`

export const Container = styled(Box).withConfig({
  shouldForwardProp: (prop) => !['maxW', 'centerContent'].includes(prop)
})<{
  maxW?: string | { base?: string; md?: string; lg?: string }
  centerContent?: boolean
}>`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  
  ${({ maxW }) => maxW && typeof maxW === 'string' && `max-width: ${maxW === 'full' ? '100%' : maxW};`}
  ${({ centerContent }) => centerContent && `display: flex; align-items: center; justify-content: center;`}
  
  // Responsive max-width
  @media (max-width: 768px) {
    ${({ maxW }) => maxW && typeof maxW === 'object' && maxW.base && `max-width: ${maxW.base === 'full' ? '100%' : maxW.base};`}
  }
  @media (min-width: 769px) {
    ${({ maxW }) => maxW && typeof maxW === 'object' && maxW.md && `max-width: ${maxW.md === 'full' ? '100%' : maxW.md};`}
  }
  @media (min-width: 1024px) {
    ${({ maxW }) => maxW && typeof maxW === 'object' && maxW.lg && `max-width: ${maxW.lg === 'full' ? '100%' : maxW.lg};`}
  }
`

export const Stack = styled(Flex).withConfig({
  shouldForwardProp: (prop) => !['spacing'].includes(prop)
}).attrs({ direction: 'column' })<{
  spacing?: number | string
}>`
  ${({ spacing }) => spacing && `gap: ${typeof spacing === 'number' ? theme.spacing[spacing as keyof typeof theme.spacing] || `${spacing}px` : spacing};`}
`

export const VStack = styled(Stack)``

// Text components using Ant Design Typography as base
export const Text = styled(Typography.Text).withConfig({
  shouldForwardProp: (prop) => !['fontSize', 'fontWeight', 'color', 'mb', 'mt', 'py', 'truncate', 'maxW'].includes(prop)
})<{
  fontSize?: string | { base?: string; md?: string }
  fontWeight?: string | number
  color?: string
  mb?: number | string
  mt?: number | string
  py?: number | string
  truncate?: boolean
  maxW?: string
}>`
  ${({ fontSize }) => fontSize && typeof fontSize === 'string' && `font-size: ${fontSize};`}
  ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight};`}
  ${({ color }) => color && `color: ${color} !important;`}
  ${({ mb }) => mb && `margin-bottom: ${typeof mb === 'number' ? theme.spacing[mb as keyof typeof theme.spacing] || `${mb}px` : mb};`}
  ${({ mt }) => mt && `margin-top: ${typeof mt === 'number' ? theme.spacing[mt as keyof typeof theme.spacing] || `${mt}px` : mt};`}
  ${({ py }) => py && `padding-top: ${typeof py === 'number' ? theme.spacing[py as keyof typeof theme.spacing] || `${py}px` : py}; padding-bottom: ${typeof py === 'number' ? theme.spacing[py as keyof typeof theme.spacing] || `${py}px` : py};`}
  ${({ truncate }) => truncate && `overflow: hidden; text-overflow: ellipsis; white-space: nowrap;`}
  ${({ maxW }) => maxW && `max-width: ${maxW === 'full' ? '100%' : maxW};`}
  
  // Responsive font size
  @media (max-width: 768px) {
    ${({ fontSize }) => fontSize && typeof fontSize === 'object' && fontSize.base && `font-size: ${fontSize.base};`}
  }
  @media (min-width: 769px) {
    ${({ fontSize }) => fontSize && typeof fontSize === 'object' && fontSize.md && `font-size: ${fontSize.md};`}
  }
`

export const Heading = styled(Typography.Title).withConfig({
  shouldForwardProp: (prop) => !['size', 'fontSize', 'fontWeight', 'color', 'mb', 'py', 'textAlign'].includes(prop)
})<{
  size?: string
  fontSize?: string | { base?: string; md?: string }
  fontWeight?: string | number
  color?: string
  mb?: number | string
  py?: number | string
  textAlign?: string | { base?: string; md?: string }
}>`
  ${({ fontSize }) => fontSize && typeof fontSize === 'string' && `font-size: ${fontSize} !important;`}
  ${({ fontWeight }) => fontWeight && `font-weight: ${fontWeight} !important;`}
  ${({ color }) => color && `color: ${color} !important;`}
  ${({ mb }) => mb && `margin-bottom: ${typeof mb === 'number' ? theme.spacing[mb as keyof typeof theme.spacing] || `${mb}px` : mb} !important;`}
  ${({ py }) => py && `padding-top: ${typeof py === 'number' ? theme.spacing[py as keyof typeof theme.spacing] || `${py}px` : py} !important; padding-bottom: ${typeof py === 'number' ? theme.spacing[py as keyof typeof theme.spacing] || `${py}px` : py} !important;`}
  ${({ textAlign }) => textAlign && typeof textAlign === 'string' && `text-align: ${textAlign};`}
  
  // Size mappings
  ${({ size }) => {
    switch (size) {
      case 'xs': return 'font-size: 0.75rem !important;'
      case 'sm': return 'font-size: 0.875rem !important;'
      case 'md': return 'font-size: 1rem !important;'
      case 'lg': return 'font-size: 1.125rem !important;'
      case 'xl': return 'font-size: 1.25rem !important;'
      case '2xl': return 'font-size: 1.5rem !important;'
      default: return ''
    }
  }}
  
  // Responsive font size
  @media (max-width: 768px) {
    ${({ fontSize }) => fontSize && typeof fontSize === 'object' && fontSize.base && `font-size: ${fontSize.base} !important;`}
    ${({ textAlign }) => textAlign && typeof textAlign === 'object' && textAlign.base && `text-align: ${textAlign.base};`}
  }
  @media (min-width: 769px) {
    ${({ fontSize }) => fontSize && typeof fontSize === 'object' && fontSize.md && `font-size: ${fontSize.md} !important;`}
    ${({ textAlign }) => textAlign && typeof textAlign === 'object' && textAlign.md && `text-align: ${textAlign.md};`}
  }
`

// Icon wrapper
export const Icon = styled.span<{
  as?: any
  color?: string
  fontSize?: string
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  ${({ color }) => color && `color: ${color};`}
  ${({ fontSize }) => fontSize && `font-size: ${fontSize};`}
`

// Input component using Ant Design
export const Input = styled.input<{
  size?: string
  borderRadius?: string
  borderColor?: string
  color?: string
  _placeholder?: any
}>`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s;
  
  &:focus {
    border-color: #1677ff;
    box-shadow: 0 0 0 2px rgba(22, 119, 255, 0.1);
    outline: none;
  }
  
  ${({ borderRadius }) => borderRadius && `border-radius: ${borderRadius};`}
  ${({ borderColor }) => borderColor && `border-color: ${borderColor};`}
  ${({ color }) => color && `color: ${color};`}
  
  &::placeholder {
    opacity: 0.6;
  }
`

// Grid component
export const Grid = styled(Box).withConfig({
  shouldForwardProp: (prop) => !['templateColumns', 'templateRows', 'gap', 'rowGap', 'columnGap'].includes(prop)
})<{
  templateColumns?: string | { base?: string; md?: string }
  templateRows?: string
  gap?: number | string
  rowGap?: number | string
  columnGap?: number | string
}>`
  display: grid;
  ${({ templateColumns }) => templateColumns && typeof templateColumns === 'string' && `grid-template-columns: ${templateColumns};`}
  ${({ templateRows }) => templateRows && `grid-template-rows: ${templateRows};`}
  ${({ gap }) => gap && `gap: ${typeof gap === 'number' ? theme.spacing[gap as keyof typeof theme.spacing] || `${gap}px` : gap};`}
  ${({ rowGap }) => rowGap && `row-gap: ${typeof rowGap === 'number' ? theme.spacing[rowGap as keyof typeof theme.spacing] || `${rowGap}px` : rowGap};`}
  ${({ columnGap }) => columnGap && `column-gap: ${typeof columnGap === 'number' ? theme.spacing[columnGap as keyof typeof theme.spacing] || `${columnGap}px` : columnGap};`}
  
  // Responsive template columns
  @media (max-width: 768px) {
    ${({ templateColumns }) => templateColumns && typeof templateColumns === 'object' && templateColumns.base && `grid-template-columns: ${templateColumns.base};`}
  }
  @media (min-width: 769px) {
    ${({ templateColumns }) => templateColumns && typeof templateColumns === 'object' && templateColumns.md && `grid-template-columns: ${templateColumns.md};`}
  }
` 