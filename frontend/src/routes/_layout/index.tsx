import { createFileRoute } from "@tanstack/react-router"
import DashboardStats from "../../components/dashboard/DashboardStats"

export const Route = createFileRoute("/_layout/")({
  component: Dashboard,
})

function Dashboard() {

  return (
    <>
      <DashboardStats />
      {/* <Flex gap={8} direction={{ base: "column", lg: "row" }}>
        <Box flex={{ base: "1", lg: "1" }}>
          <QuickActions />
        </Box>
        
        <Box flex={{ base: "1", lg: "2" }}>
          <RecentMindmaps />
        </Box>
      </Flex> */}
      
      {/* <Flex gap={8} direction={{ base: "column", lg: "row" }}>
        <Box flex={{ base: "1", lg: "1" }}>
          <RecentActivity />
        </Box>
        
        <Box flex={{ base: "1", lg: "1" }}>
          <RecommendedContent />
        </Box>
      </Flex> */}
    </>
  )
} 