import { Tabs as AntdTabs } from "antd"
import type { TabsProps } from "antd"
import * as React from "react"

interface TabsRootProps extends Omit<TabsProps, 'items'> {
  children: React.ReactNode
  defaultValue?: string
  variant?: string
}

interface TabsListProps {
  children: React.ReactNode
}

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
}

interface TabsContentProps {
  value: string
  children: React.ReactNode
}

const TabsRoot = React.forwardRef<HTMLDivElement, TabsRootProps>(
  function TabsRoot({ children, defaultValue, variant, ...props }, _ref) {
    const [activeKey, setActiveKey] = React.useState(defaultValue)
    
    // Simple approach - just render as-is, let parent handle the structure differently
    const childrenArray = React.Children.toArray(children)
    console.log('variant:', variant) // Prevent unused variable warning
    
    // Find tabs list and content sections
    let triggers: React.ReactElement[] = []
    let contents: React.ReactElement[] = []
    
    childrenArray.forEach((child) => {
      if (React.isValidElement(child)) {
        if (child.type && (child.type as any).displayName === 'TabsList') {
          const triggerChildren = React.Children.toArray(child.props.children)
          triggers = triggerChildren.filter(React.isValidElement) as React.ReactElement[]
        } else if (child.type && (child.type as any).displayName === 'TabsContent') {
          contents.push(child)
        }
      }
    })
    
    const items = triggers.map((trigger) => {
      const value = (trigger.props as any).value || ''
      const label = (trigger.props as any).children
      const content = contents.find((c) => (c.props as any).value === value)
      
      return {
        key: value,
        label: label,
        children: content ? (content.props as any).children : null
      }
    })
    
    return (
      <AntdTabs
        activeKey={activeKey}
        defaultActiveKey={defaultValue}
        onChange={setActiveKey}
        items={items}
        {...props}
      />
    )
  },
)

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  function TabsList({ children }, _ref) {
    return <>{children}</>
  },
)

const TabsTrigger = React.forwardRef<HTMLDivElement, TabsTriggerProps>(
  function TabsTrigger({ value: _value, children }, _ref) {
    return <>{children}</>
  },
)

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  function TabsContent({ value: _value, children }, _ref) {
    return <>{children}</>
  },
)

TabsRoot.displayName = "TabsRoot"
TabsList.displayName = "TabsList"
TabsTrigger.displayName = "TabsTrigger" 
TabsContent.displayName = "TabsContent"

export const Tabs = {
  Root: TabsRoot,
  List: TabsList,
  Trigger: TabsTrigger,
  Content: TabsContent,
} 