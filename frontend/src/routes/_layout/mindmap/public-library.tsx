import { createFileRoute } from "@tanstack/react-router"
import PublicMindMapLibrary from "../../../components/MindMap/Library/PublicMindMapLibrary"

export const Route = createFileRoute("/_layout/mindmap/public-library")({
  component: PublicMindMapLibraryPage,
})

function PublicMindMapLibraryPage() {
  return <PublicMindMapLibrary />
} 