import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/extension-auth")({
  validateSearch: () => ({}),
  loader: async () => {
    // Set CORS headers
    const headers = {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    };
    
    // Get token from localStorage
    const token = localStorage.getItem("access_token");
    
    // Return token (or null if not found)
    return new Response(
      JSON.stringify({ 
        token: token || null,
        status: token ? "success" : "unauthorized" 
      }),
      { headers }
    );
  },
  component: () => {
    // This is a data endpoint, not a UI component
    return null;
  },
}); 