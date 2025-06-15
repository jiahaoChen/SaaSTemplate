"use client"

import { Menu as AntdMenu, Divider } from "antd"
import * as React from "react"
import { LuCheck, LuChevronRight } from "react-icons/lu"
import styled from 'styled-components'

const MenuContainer = styled.div`
  .ant-dropdown-menu {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-radius: 6px;
  }
`;

const MenuItemWithIcon = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

interface MenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  portalled?: boolean
  portalRef?: React.RefObject<HTMLElement>
  children?: React.ReactNode
}

export const MenuContent = React.forwardRef<HTMLDivElement, MenuContentProps>(
  function MenuContent(props, ref) {
    const { portalled = true, portalRef, children, ...rest } = props
    
    // For Ant Design, we'll wrap the content in a container
    return (
      <MenuContainer ref={ref} {...rest}>
        {children}
      </MenuContainer>
    )
  },
)

export const MenuArrow = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function MenuArrow(_props, _ref) {
  // Ant Design handles arrows automatically
  return null;
})

export const MenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }
>(function MenuCheckboxItem(props, ref) {
  const { children, checked, ...rest } = props;
  
  return (
    <div ref={ref} {...rest}>
      <MenuItemWithIcon>
        {checked && <LuCheck size={14} />}
        {children}
      </MenuItemWithIcon>
    </div>
  )
})

export const MenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { checked?: boolean }
>(function MenuRadioItem(props, ref) {
  const { children, checked, ...rest } = props
  
  return (
    <div ref={ref} {...rest}>
      <MenuItemWithIcon>
        {checked && <LuCheck size={14} />}
        {children}
      </MenuItemWithIcon>
    </div>
  )
})

export const MenuItemGroup = React.forwardRef<
  any,
  React.HTMLAttributes<HTMLDivElement> & { title?: React.ReactNode }
>(function MenuItemGroup(props, _ref) {
  const { title, children, ...rest } = props
  
  return (
    <AntdMenu.ItemGroup key={title as string} title={title} {...rest}>
      {children}
    </AntdMenu.ItemGroup>
  )
})

export interface MenuTriggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  startIcon?: React.ReactNode
}

export const MenuTriggerItem = React.forwardRef<
  HTMLDivElement,
  MenuTriggerItemProps
>(function MenuTriggerItem(props, ref) {
  const { startIcon, children, ...rest } = props
  
  return (
    <div ref={ref} {...rest}>
      <MenuItemWithIcon>
        {startIcon}
        {children}
        <LuChevronRight size={14} />
      </MenuItemWithIcon>
    </div>
  )
})

// Simple component exports that can be used with Ant Design
export const MenuRadioItemGroup = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const MenuContextTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const MenuRoot = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);

export const MenuSeparator = () => <Divider style={{ margin: '4px 0' }} />;

export const MenuItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  function MenuItem(props, ref) {
    return <div ref={ref} {...props} />;
  }
);

export const MenuItemText = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);

export const MenuItemCommand = ({ children, ...props }: React.HTMLAttributes<HTMLSpanElement>) => (
  <span {...props}>{children}</span>
);

export const MenuTrigger = ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div {...props}>{children}</div>
);
