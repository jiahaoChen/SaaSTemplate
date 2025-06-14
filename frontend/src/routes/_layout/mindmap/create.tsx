import { createFileRoute } from "@tanstack/react-router"
import CreateMindMap from "../../../components/MindMap/Create/CreateMindMap"

export const Route = createFileRoute("/_layout/mindmap/create")({
  component: CreateMindMapPage,
})

function CreateMindMapPage() {
  return <CreateMindMap />
} 