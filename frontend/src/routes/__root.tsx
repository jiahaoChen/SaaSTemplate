import { Outlet, createRootRoute, redirect } from "@tanstack/react-router"
import React, { Suspense, useEffect } from "react"

import NotFound from "../components/Common/NotFound"
import { trackPageView } from "../utils/analytics"

const loadDevtools = () =>
  Promise.all([
    import("@tanstack/router-devtools"),
    import("@tanstack/react-query-devtools"),
  ]).then(([routerDevtools, reactQueryDevtools]) => {
    return {
      default: () => (
        <>
          <routerDevtools.TanStackRouterDevtools />
          <reactQueryDevtools.ReactQueryDevtools />
        </>
      ),
    }
  })

const TanStackDevtools =
  process.env.NODE_ENV === "production" ? () => null : React.lazy(loadDevtools)

const RootComponent = () => {
  useEffect(() => {
    // Track initial page view
    trackPageView();
  }, []);

  return (
    <>
      <Outlet />
      <Suspense>
        <TanStackDevtools />
      </Suspense>
    </>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: () => <NotFound />,
  beforeLoad: async ({ location }) => {
    const token = localStorage.getItem("access_token")
    
    // If at root and not logged in, redirect to landing page
    if (location.pathname === "/" && !token) {
      throw redirect({
        to: "/landing",
      })
    }
  }
})
