import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/feedback')({
  component: () => <div>Hello /_layout/feedback!</div>
})