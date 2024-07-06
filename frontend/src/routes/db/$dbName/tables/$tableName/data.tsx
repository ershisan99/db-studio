import { DataTable } from "@/components/db-table-view/data-table";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";

const tableSearchSchema = z.object({
  pageSize: z.number().catch(10),
  pageIndex: z.number().catch(0),
});

export const Route = createFileRoute("/db/$dbName/tables/$tableName/data")({
  component: TableView,
  validateSearch: (search) => tableSearchSchema.parse(search),
});

function TableView() {
  const { tableName, dbName } = Route.useParams();
  const { pageSize, pageIndex } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });

  const updatePageSize = (value: number) => {
    return void navigate({
      search: (prev) => ({ ...prev, pageSize: value, pageIndex: 0 }),
    });
  };
  const updatePageIndex = (pageIndex: number) => {
    return void navigate({ search: (prev) => ({ ...prev, pageIndex }) });
  };

  return (
    <div className="p-3 h-layout w-layout">
      <DataTable
        dbName={dbName}
        tableName={tableName}
        pageSize={pageSize}
        pageIndex={pageIndex}
        onPageIndexChange={updatePageIndex}
        onPageSizeChange={updatePageSize}
      />
    </div>
  );
}
