import { Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { SkeletonText } from "../ui/skeleton"

interface PendingItem {
  key: string
  id: string
  title: string
  description: string
  actions: string
}

const columns: ColumnsType<PendingItem> = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
    width: 100,
    render: () => <SkeletonText noOfLines={1} />
  },
  {
    title: 'Title',
    dataIndex: 'title',
    key: 'title',
    width: 150,
    render: () => <SkeletonText noOfLines={1} />
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: 200,
    render: () => <SkeletonText noOfLines={1} />
  },
  {
    title: 'Actions',
    dataIndex: 'actions',
    key: 'actions',
    width: 120,
    render: () => <SkeletonText noOfLines={1} />
  }
]

const skeletonData: PendingItem[] = Array.from({ length: 5 }, (_, index) => ({
  key: `skeleton-${index}`,
  id: `skeleton-${index}`,
  title: `skeleton-${index}`,
  description: `skeleton-${index}`,
  actions: `skeleton-${index}`
}))

const PendingItems = () => (
  <Table
    columns={columns}
    dataSource={skeletonData}
    pagination={false}
    size="small"
    loading={false}
    showHeader={true}
  />
)

export default PendingItems
