import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import { RouterProvider, createRouter } from "@tanstack/react-router"
import { StrictMode } from "react"
import ReactDOM from "react-dom/client"
import { routeTree } from "./routeTree.gen"

import { ApiError, OpenAPI } from "./client"
import { CustomProvider } from "./components/ui/provider"

// Import i18n configuration
import i18n from "./i18n"

// Import analytics
import { initializeAnalytics } from "./utils/analytics"

OpenAPI.BASE = import.meta.env.VITE_API_URL
OpenAPI.TOKEN = async () => {
  return localStorage.getItem("access_token") || ""
}

const handleApiError = (error: Error) => {
  if (error instanceof ApiError && [401, 403].includes(error.status)) {
    localStorage.removeItem("access_token")
    window.location.href = "/login"
  }
}
const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleApiError,
  }),
  mutationCache: new MutationCache({
    onError: handleApiError,
  }),
})

const router = createRouter({ routeTree })
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}

// Initialize i18n first then render the app
const initApp = async () => {
  try {
    // Get initial language from localStorage or navigator
    const storedLang = localStorage.getItem('i18nextLng');
    const validLangs = ['en', 'zh'];
    
    if (!storedLang || !validLangs.includes(storedLang)) {
      const browserLang = navigator.language.startsWith('zh') ? 'zh' : 'en';
      await i18n.changeLanguage(browserLang);
      document.documentElement.lang = browserLang;
    } else {
      document.documentElement.lang = storedLang;
      // Ensure the language is actually set
      if (i18n.language !== storedLang) {
        await i18n.changeLanguage(storedLang);
      }
    }
    
    // Initialize analytics
    await initializeAnalytics();
    
    // Now render the app
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <CustomProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </CustomProvider>
      </StrictMode>
    );
  } catch (error) {
    console.error("Error initializing app:", error);
    // Fallback rendering if i18n fails
    ReactDOM.createRoot(document.getElementById("root")!).render(
      <StrictMode>
        <CustomProvider>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </CustomProvider>
      </StrictMode>
    );
  }
};

initApp();
