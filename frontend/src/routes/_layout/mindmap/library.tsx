import { createFileRoute } from "@tanstack/react-router"
import MindMapLibrary from "../../../components/MindMap/Library/MindMapLibrary"

function MindMapLibraryPage() {
  return <MindMapLibrary />
}

export const Route = createFileRoute("/_layout/mindmap/library")({
  component: MindMapLibraryPage,
}) 