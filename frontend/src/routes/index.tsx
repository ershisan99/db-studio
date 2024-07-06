import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  const { dbSchema } = Route.useSearch()
  if (!dbSchema) {
    return (
      <div className="p-2">
        <h3>Welcome Home!</h3>
      </div>
    )
  }
  return <TableView dbSchema={dbSchema} />
}

function TableView({ dbSchema }: { dbSchema: string }) {
  return (
    <div className="p-2">
      <h3>Table View</h3>
      {dbSchema}
    </div>
  )
}
