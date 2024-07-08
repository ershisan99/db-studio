import { Button, SqlDataTable, SqlDataTableCell } from "@/components/ui";
import { useQueryRawSqlMutation } from "@/services/db";
import { useUiStore } from "@/state";
import Editor from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnDef,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/raw/")({
  component: Component,
});

function Component() {
  const [query, setQuery] = useState<string | undefined>("SELECT * FROM");
  const { mutate, data } = useQueryRawSqlMutation();
  const appTheme = useUiStore.use.theme();
  const themeToUse = appTheme === "light" ? "light" : "vs-dark";

  const handleSubmit = () => {
    if (!query) return;

    mutate({ query });
  };
  const columns = useMemo<ColumnDef<any>[]>(() => {
    if (!data) return [] as ColumnDef<any>[];

    return Object.keys(data[0]).map((key) => ({
      header: key,
      accessorKey: key,
      cell: ({ row }) => <SqlDataTableCell row={row} column_name={key} />,
    })) as ColumnDef<any>[];
  }, [data]);

  const table = useReactTable({
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className={"h-layout w-layout p-3"}>
      <div className={"flex flex-col gap-4 flex-1 h-full max-h-full pb-3"}>
        <Editor
          theme={themeToUse}
          value={query}
          onChange={setQuery}
          className={"h-full border"}
          height={"35%"}
          language="sql"
          options={{
            tabFocusMode: true,
            detectIndentation: false,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
        <div className={"flex gap-4 items-center justify-between"}>
          {data && <p>Result: {data.length} rows</p>}
          <Button disabled={!query} onClick={handleSubmit} className={"gap-2"}>
            Execute Query <ArrowRight className={"size-4"} />
          </Button>
        </div>
        {data && (
          <div className="rounded-md border min-h-0 h-full overflow-auto w-full min-w-0">
            <SqlDataTable table={table} columnsLength={columns.length} />
          </div>
        )}
      </div>
    </div>
  );
}
