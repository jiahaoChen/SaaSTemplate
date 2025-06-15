import * as React from "react"
import styled from 'styled-components'

interface ElementContainerProps {
  placement?: "start" | "end"
  pointerEvents?: string
}

const GroupContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
`

const ElementContainer = styled.div<ElementContainerProps>`
  position: absolute;
  ${props => props.placement === "end" ? "right: 12px;" : "left: 12px;"}
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  pointer-events: ${props => props.pointerEvents || "auto"};
  z-index: 1;
  color: rgba(0, 0, 0, 0.45);

  .dark & {
    color: rgba(255, 255, 255, 0.45);
  }
`

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  startElementProps?: React.HTMLAttributes<HTMLDivElement> & { pointerEvents?: string }
  endElementProps?: React.HTMLAttributes<HTMLDivElement> & { pointerEvents?: string }
  startElement?: React.ReactNode
  endElement?: React.ReactNode
  children: React.ReactElement
  startOffset?: string
  endOffset?: string
}

export const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  function InputGroup(props, ref) {
    const {
      startElement,
      startElementProps,
      endElement,
      endElementProps,
      children,
      startOffset = "6px",
      endOffset = "6px",
      ...rest
    } = props

    const child = React.Children.only(children)

    const childWithPadding = React.cloneElement(child, {
      style: {
        ...(startElement && { paddingLeft: `calc(2rem + ${startOffset})` }),
        ...(endElement && { paddingRight: `calc(2rem + ${endOffset})` }),
        ...child.props.style,
      },
      ...child.props,
    })

    return (
      <GroupContainer ref={ref} {...rest}>
        {startElement && (
          <ElementContainer {...startElementProps}>
            {startElement}
          </ElementContainer>
        )}
        {childWithPadding}
        {endElement && (
          <ElementContainer placement="end" {...endElementProps}>
            {endElement}
          </ElementContainer>
        )}
      </GroupContainer>
    )
  },
)
