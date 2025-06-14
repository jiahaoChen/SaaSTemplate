import { createFileRoute, useParams } from "@tanstack/react-router"
import MindmapDetail from "../../../../components/MindMap/Detail/MindMapDetail"

function MindMapDetailPage() {
  // 從 URL 中提取 id 參數
  const { id } = useParams({ from: '/_layout/mindmap/detail/$id' });
  // 將 id 傳遞給 MindmapDetail 組件
  return <MindmapDetail id={id} />;
}

export const Route = createFileRoute('/_layout/mindmap/detail/$id')({
  component: MindMapDetailPage,
})