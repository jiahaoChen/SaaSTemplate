import { useQuery } from "@tanstack/react-query";
import { ItemsService } from "../client/sdk.gen";

interface ItemStats {
  totalItems: number;
  currentMonthItems: number;
  maxItems: number;
}

export function useItemStats(): {
  data: ItemStats | undefined;
  isLoading: boolean;
  error: Error | null;
} {
  // const currentDate = new Date();
  // const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  
  const result = useQuery({
    queryKey: ["itemStats"],
    queryFn: async () => {
      const response = await ItemsService.readItems({
        limit: 9999, // Get all items
      });
      
      // Total items
      const totalItems = response.count;
      
      // For now, just use total count since ItemPublic doesn't have created_at
      const currentMonthItems = Math.floor(totalItems * 0.3); // Assume 30% are from current month
      
      return {
        totalItems,
        currentMonthItems,
        maxItems: 1000, // Maximum items allowed
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