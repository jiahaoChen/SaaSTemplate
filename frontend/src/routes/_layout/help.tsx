import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_layout/help')({
  component: () => <div>Hello /_layout/help!</div>
})