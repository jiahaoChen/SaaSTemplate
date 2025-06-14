import { useQuery } from "@tanstack/react-query";
import { MindmapsService } from "../client/sdk.gen";

interface MindmapStats {
  totalMindmaps: number;
  currentMonthMindmaps: number;
  maxMindmaps: number;
}

export function useMindmapStats(): {
  data: MindmapStats | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  const currentDate = new Date();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const result = useQuery({
    queryKey: ["mindmapStats"],
    queryFn: async () => {
      const response = await MindmapsService.readMindmaps({
        limit: 9999, // Get all mindmaps
      });
      
      // Total mindmaps
      const totalMindmaps = response.count;
      
      // Current month mindmaps
      const currentMonthMindmaps = response.data.filter(
        (mindmap) => new Date(mindmap.created_at) >= firstDayOfMonth
      ).length;
      
      return {
        totalMindmaps,
        currentMonthMindmaps,
        maxMindmaps: 1000, // Maximum mindmaps allowed (as per requirements)
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes caching
  });

  return {
    data: result.data,
    isLoading: result.isLoading,
    error: result.error as Error | null,
  };
} 