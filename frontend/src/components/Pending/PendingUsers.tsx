import { Table } from "antd"
import type { ColumnsType } from "antd/es/table"
import { SkeletonText } from "../ui/skeleton"

interface PendingUser {
  key: string
  fullName: string
  email: string
  role: string
  status: string
  actions: string
}

const columns: ColumnsType<PendingUser> = [
  {
    title: 'Full name',
    dataIndex: 'fullName',
    key: 'fullName',
    width: 150,
    render: () => <SkeletonText noOfLines={1} />
  },
  {
    title: 'Email',
    dataIndex: 'email',
    key: 'email',
    width: 200,
    render: () => <SkeletonText noOfLines={1} />
  },
  {
    title: 'Role',
    dataIndex: 'role',
    key: 'role',
    width: 100,
    render: () => <SkeletonText noOfLines={1} />
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    width: 100,
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

const skeletonData: PendingUser[] = Array.from({ length: 5 }, (_, index) => ({
  key: `skeleton-${index}`,
  fullName: `skeleton-${index}`,
  email: `skeleton-${index}`,
  role: `skeleton-${index}`,
  status: `skeleton-${index}`,
  actions: `skeleton-${index}`
}))

const PendingUsers = () => (
  <Table
    columns={columns}
    dataSource={skeletonData}
    pagination={false}
    size="small"
    loading={false}
    showHeader={true}
  />
)

export default PendingUsers
