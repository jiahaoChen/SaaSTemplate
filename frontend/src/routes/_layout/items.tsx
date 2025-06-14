import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/items')({
  component: () => <div>items!</div>
})