import { DataTable } from "@/components/ui/data-table";
import { cn } from "@/lib/utils";
import {
  type TableColumn,
  type TableForeignKey,
  type TableIndexEntry,
  useTableColumnsQuery,
  useTableForeignKeysQuery,
  useTableIndexesQuery,
} from "@/services/db";
import { Link, createFileRoute } from "@tanstack/react-router";
import { createColumnHelper } from "@tanstack/react-table";
import { ArrowRight, Table2 } from "lucide-react";

export const Route = createFileRoute("/db/$dbName/tables/$tableName/")({
  component: TableDetailsTable,
});
const columnHelper = createColumnHelper<TableColumn>();

const columns = [
  columnHelper.accessor("column_name", {
    header: "Column",
  }),
  columnHelper.accessor("data_type", {
    header: "Type",
  }),
  columnHelper.accessor("udt_name", {
    header: "UDT",
  }),
  columnHelper.accessor("column_comment", {
    header: "Comment",
  }),
];

const tableIndexesColumnHelper = createColumnHelper<TableIndexEntry>();

const tableIndexesColumns = [
  tableIndexesColumnHelper.accessor("type", {
    header: "Type",
  }),
  tableIndexesColumnHelper.accessor("columns", {
    header: "Columns",
    cell: (props) => props.getValue().join(", "),
  }),
  tableIndexesColumnHelper.accessor("key", {
    header: "Key",
  }),
];

const tableForeignKeysColumnHelper = createColumnHelper<TableForeignKey>();

const tableForeignKeysColumns = [
  tableForeignKeysColumnHelper.accessor("source", {
    header: "Source",
    cell: (props) => props.getValue().join(", "),
  }),
  tableForeignKeysColumnHelper.accessor("target", {
    header: "Target",
    cell: (props) => {
      const { table, target } = props.row.original;
      return (
        <Link
          from={Route.fullPath}
          to={"../$tableName"}
          params={{ tableName: table }}
          className={"hover:underline"}
        >
          {table} ({target.join(", ")})
        </Link>
      );
    },
  }),
  tableForeignKeysColumnHelper.accessor("on_delete", {
    header: "On Delete",
  }),
  tableForeignKeysColumnHelper.accessor("on_update", {
    header: "On Update",
  }),
];

function TableDetailsTable() {
  const { tableName, dbName } = Route.useParams();
  const { data: tableColumns } = useTableColumnsQuery({ tableName, dbName });
  const { data: tableIndexes } = useTableIndexesQuery({ tableName, dbName });
  const { data: tableForeignKeys } = useTableForeignKeysQuery({
    tableName,
    dbName,
  });

  return (
    <div className={"p-3 w-layout"}>
      <div className={"flex flex-col gap-4 flex-1 max-h-full pb-3"}>
        <div className={"flex gap-4 items-center justify-between"}>
          <h1 className={"text-2xl font-bold flex items-center gap-2"}>
            <Table2 /> {tableName}
          </h1>
          <Link
            from={Route.fullPath}
            to={"./data"}
            search={{
              pageIndex: 0,
              pageSize: 10,
            }}
            className={cn("flex gap-2 items-center", "hover:underline")}
          >
            Explore data <ArrowRight className={"size-4"} />
          </Link>
        </div>

        <div className={"flex gap-4 items-center justify-between"}>
          <h2 className={"text-xl font-bold flex items-center gap-2"}>
            Columns
          </h2>
        </div>
        <div
          className={
            "overflow-auto rounded-md border min-h-0 h-full min-w-0 w-full"
          }
        >
          <DataTable columns={columns} data={tableColumns ?? []} />
        </div>

        <div className={"flex gap-4 items-center justify-between"}>
          <h2 className={"text-xl font-bold flex items-center gap-2"}>
            Indexes
          </h2>
        </div>
        <div
          className={
            "overflow-auto rounded-md border min-h-0 h-full min-w-0 w-full"
          }
        >
          {tableIndexes?.length ? (
            <DataTable
              columns={tableIndexesColumns}
              data={tableIndexes ?? []}
            />
          ) : (
            <div className="text-center p-4">No indexes.</div>
          )}
        </div>
        <div className={"flex gap-4 items-center justify-between"}>
          <h2 className={"text-xl font-bold flex items-center gap-2"}>
            Foreign Keys
          </h2>
        </div>
        <div
          className={
            "overflow-auto rounded-md border min-h-0 h-full min-w-0 w-full"
          }
        >
          {tableForeignKeys?.length ? (
            <DataTable
              columns={tableForeignKeysColumns}
              data={tableForeignKeys ?? []}
            />
          ) : (
            <div className="text-center p-4">No foreign keys.</div>
          )}
        </div>
      </div>
    </div>
  );
}
