// YouTube MindMap主題變量
export const mindmapTheme = {
  colors: {
    primary: "#7856ff",
    primaryDark: "#6040e0",
    primaryLight: "#e6e0ff",
    secondary: "#ff6c87",
    success: "#48bb78",
    warning: "#f6ad55",
    danger: "#f56565",
    dark: "#333333",
    light: "#f5f7fa",
    gray: "#e2e8f0",
    grayDark: "#718096",
  },
  borderRadius: "10px",
  shadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  shadowLg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
  transition: "all 0.3s ease",
}

// 擴展Chakra UI主題
export const mindmapExtension = {
  colors: {
    mindmap: {
      primary: mindmapTheme.colors.primary,
      primaryDark: mindmapTheme.colors.primaryDark,
      primaryLight: mindmapTheme.colors.primaryLight,
      secondary: mindmapTheme.colors.secondary,
      success: mindmapTheme.colors.success,
      warning: mindmapTheme.colors.warning,
      danger: mindmapTheme.colors.danger,
      dark: mindmapTheme.colors.dark,
      light: mindmapTheme.colors.light,
      gray: mindmapTheme.colors.gray,
      grayDark: mindmapTheme.colors.grayDark,
    },
  },
  components: {
    Button: {
      variants: {
        mindmapPrimary: {
          bg: mindmapTheme.colors.primary,
          color: "white",
          _hover: {
            bg: mindmapTheme.colors.primaryDark,
          },
        },
        mindmapSecondary: {
          bg: mindmapTheme.colors.secondary,
          color: "white",
          _hover: {
            bg: "#e05a73",
          },
        },
        mindmapGhost: {
          bg: "transparent",
          color: mindmapTheme.colors.primary,
          border: `1px solid ${mindmapTheme.colors.primary}`,
          _hover: {
            bg: mindmapTheme.colors.primaryLight,
          },
        },
        mindmapDanger: {
          bg: mindmapTheme.colors.danger,
          color: "white",
          _hover: {
            bg: "#e74c3c",
          },
        },
      },
    },
  },
} 