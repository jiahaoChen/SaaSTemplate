"use client"

import { message, notification } from "antd"
import { InfoCircleOutlined } from "@ant-design/icons"

// Configure message and notification globally
message.config({
  top: 10,
  duration: 3,
  maxCount: 3,
})

notification.config({
  placement: 'bottomRight',
  duration: 4.5,
})

interface ToastOptions {
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info' | 'loading'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

// Create a toaster object that mimics the Chakra UI API
export const toaster = {
  create: (options: ToastOptions) => {
    const { title, description, type = 'info', duration, action } = options
    
    // If we have both title and description, use notification
    if (title && description) {
      const config = {
        message: title,
        description: description,
        duration: duration || 4.5,
        btn: action ? (
          <button
            onClick={action.onClick}
            style={{
              border: 'none',
              background: 'none',
              color: '#1677ff',
              cursor: 'pointer',
              padding: 0,
              textDecoration: 'underline',
            }}
          >
            {action.label}
          </button>
        ) : undefined,
      }
      
      switch (type) {
        case 'success':
          notification.success(config)
          break
        case 'error':
          notification.error(config)
          break
        case 'warning':
          notification.warning(config)
          break
        case 'info':
          notification.info(config)
          break
        case 'loading':
          notification.info({
            ...config,
            icon: <InfoCircleOutlined spin />,
          })
          break
        default:
          notification.info(config)
      }
    } else {
      // For simple messages, use message
      const messageContent = title || description || ''
      
      switch (type) {
        case 'success':
          message.success(messageContent)
          break
        case 'error':
          message.error(messageContent)
          break
        case 'warning':
          message.warning(messageContent)
          break
        case 'info':
          message.info(messageContent)
          break
        case 'loading':
          message.loading(messageContent)
          break
        default:
          message.info(messageContent)
      }
    }
  },
  
  success: (options: Omit<ToastOptions, 'type'>) => {
    toaster.create({ ...options, type: 'success' })
  },
  
  error: (options: Omit<ToastOptions, 'type'>) => {
    toaster.create({ ...options, type: 'error' })
  },
  
  warning: (options: Omit<ToastOptions, 'type'>) => {
    toaster.create({ ...options, type: 'warning' })
  },
  
  info: (options: Omit<ToastOptions, 'type'>) => {
    toaster.create({ ...options, type: 'info' })
  },
  
  loading: (options: Omit<ToastOptions, 'type'>) => {
    toaster.create({ ...options, type: 'loading' })
  },
  
  dismiss: () => {
    message.destroy()
    notification.destroy()
  },
  
  dismissAll: () => {
    message.destroy()
    notification.destroy()
  }
}

// The Toaster component is not needed as Ant Design handles this internally
// But we export it for compatibility
export const Toaster = () => {
  return null
}
