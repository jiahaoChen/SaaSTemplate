import styled from 'styled-components'
import { Outlet, createFileRoute, redirect } from "@tanstack/react-router"

import { isLoggedIn } from "@/hooks/useAuth"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"
import DashboardNavbar from "@/components/dashboard/DashboardNavbar"

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
`

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 16px;
  overflow-y: auto;
`

export const Route = createFileRoute("/_layout")({
  component: Layout,
  beforeLoad: async () => {
    if (!isLoggedIn()) {
      throw redirect({
        to: "/login",
      })
    }
  },
})

function Layout() {
  console.log("admin layout render!!")
  return (
    <LayoutContainer>
      <DashboardNavbar />
      <ContentWrapper>
        <DashboardSidebar />
        <MainContent>
          <Outlet />
        </MainContent>
      </ContentWrapper>
    </LayoutContainer>
  )
}

export default Layout 