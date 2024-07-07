import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { cn, prettyBytes } from "@/lib/utils";
import { type TableInfo, useTablesListQuery } from "@/services/db";
import { Link, createFileRoute } from "@tanstack/react-router";
import {
  type SortingState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUp, Database } from "lucide-react";
import { useMemo, useState } from "react";

export const Route = createFileRoute("/db/$dbName/tables/")({
  component: Component,
});

const columnHelper = createColumnHelper<TableInfo>();

const createColumns = (dbName: string) => {
  return [
    columnHelper.accessor("table_name", {
      header: "Name",

      cell: (props) => {
        const tableName = props.getValue();
        return (
          <div className={"flex w-full"}>
            <Link
              className={"hover:underline w-full"}
              to={"/db/$dbName/tables/$tableName"}
              params={{ dbName, tableName }}
            >
              {tableName}
            </Link>
          </div>
        );
      },
    }),

    columnHelper.accessor("table_size", {
      header: "Table Size",
      cell: (props) => prettyBytes(props.getValue()),
      meta: {
        className: "text-end",
      },
    }),

    columnHelper.accessor("index_size", {
      header: "Index Size",
      cell: (props) => prettyBytes(props.getValue()),
      meta: {
        className: "text-end",
      },
    }),

    columnHelper.accessor("total_size", {
      header: "Total Size",
      cell: (props) => prettyBytes(props.getValue()),
      meta: {
        className: "text-end",
      },
    }),

    columnHelper.accessor("row_count", {
      header: "Rows",
      meta: {
        className: "text-end",
      },
    }),

    columnHelper.accessor("primary_key", {
      header: "Primary key",
    }),

    columnHelper.accessor("indexes", {
      header: "Indexes",
      cell: (props) => {
        const indexes = props.getValue();
        if (!indexes) return null;
        return (
          <div>
            {indexes?.split(",").map((index) => (
              <div key={index}>{index}</div>
            ))}
          </div>
        );
      },
    }),

    columnHelper.accessor("comments", {
      header: "Comment",
    }),

    columnHelper.accessor("schema_name", {
      header: "Schema",
    }),
  ];
};

function Component() {
  const { dbName } = Route.useParams();
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data } = useTablesListQuery({
    dbName,
    sortDesc: sorting[0]?.desc,
    sortField: sorting[0]?.id,
  });

  const details = useMemo(() => {
    if (!data) {
      return [];
    }
    return data;
  }, [data]);

  const columns = useMemo(() => createColumns(dbName), [dbName]);

  const table = useReactTable({
    data: details,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualSorting: true,
    state: {
      sorting,
    },
    onSortingChange: setSorting,
  });

  return (
    <div className={"p-3 h-layout w-layout"}>
      <div className={"flex flex-col gap-4 flex-1 max-h-full pb-3"}>
        <div className={"flex gap-4 items-center justify-between"}>
          <h1 className={"text-2xl font-bold flex items-center gap-2"}>
            <Database /> {dbName}
          </h1>
          <p>
            Tables: <strong>{details?.length ?? 0}</strong>
          </p>
        </div>
        <div
          className={
            "overflow-auto rounded-md border min-h-0 h-full min-w-0 w-full"
          }
        >
          <Table
            className={"min-w-full"}
            {...{
              style: {
                width: table.getCenterTotalSize(),
              },
            }}
          >
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    if (header.column.getCanSort()) {
                      return (
                        <TableHead
                          key={header.id}
                          className={cn(
                            "p-0",
                            header.column.columnDef.meta?.className,
                          )}
                        >
                          <Button
                            variant="ghost"
                            onClick={header.column.getToggleSortingHandler()}
                            title={
                              header.column.getNextSortingOrder() === "asc"
                                ? "Sort ascending"
                                : header.column.getNextSortingOrder() === "desc"
                                  ? "Sort descending"
                                  : "Clear sort"
                            }
                          >
                            {header.isPlaceholder
                              ? null
                              : flexRender(
                                  header.column.columnDef.header,
                                  header.getContext(),
                                )}
                            <ArrowUp
                              className={cn(
                                "ml-2 size-4 opacity-0 transition-transform",
                                sorted && "opacity-100",
                                (sorted as string) === "desc" && "rotate-180",
                              )}
                            />
                          </Button>
                        </TableHead>
                      );
                    }
                    return (
                      <TableHead
                        className={cn(
                          "text-nowrap",
                          header.column.columnDef.meta?.className,
                        )}
                        key={header.id}
                        style={{
                          width: header.getSize(),
                        }}
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        className={cn(
                          "text-nowrap",
                          cell.column?.columnDef?.meta?.className,
                        )}
                        key={cell.id}
                        style={{
                          width: cell.column.getSize(),
                        }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
