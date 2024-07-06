import {
  DataTablePagination,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTableColumnsQuery, useTableDataQuery } from "@/services/db";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Rows3 } from "lucide-react";
import { useMemo } from "react";
import { z } from "zod";

function isUrl(value: string) {
  return z.string().url().safeParse(value).success;
}

const imageUrlRegex = new RegExp(
  /(http)?s?:?(\/\/[^"']*\.(?:png|jpg|jpeg|gif|svg|webp|bmp))/i,
);

function isImageUrl(value: string) {
  return value.match(imageUrlRegex);
}

export const DataTable = ({
  tableName,
  dbName,
  pageIndex,
  pageSize,
  onPageSizeChange,
  onPageIndexChange,
}: {
  tableName: string;
  pageIndex: number;
  dbName: string;
  pageSize: number;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) => {
  const { data: details } = useTableColumnsQuery({ name: tableName });
  const { data } = useTableDataQuery({
    tableName,
    dbName,
    perPage: pageSize,
    page: pageIndex,
  });

  const paginationUpdater: OnChangeFn<PaginationState> = (args) => {
    if (typeof args === "function") {
      const newArgs = args({
        pageIndex,
        pageSize,
      });
      if (newArgs.pageSize !== pageSize) {
        onPageSizeChange(newArgs.pageSize);
      } else if (newArgs.pageIndex !== pageIndex) {
        onPageIndexChange(newArgs.pageIndex);
      }
    } else {
      onPageSizeChange(args.pageSize);
      onPageIndexChange(args.pageIndex);
    }
  };

  const columns = useMemo(() => {
    if (!details) return [] as ColumnDef<any>[];

    return details.map(({ column_name, udt_name, data_type }) => ({
      accessorKey: column_name,
      title: column_name,
      size: 300,
      header: () => {
        return (
          <div
            className={cn(
              "whitespace-nowrap",
              data_type === "integer" && "text-right",
            )}
          >
            {`${column_name} [${udt_name.toUpperCase()}]`}
          </div>
        );
      },
      sortable: true,
      cell: ({ row }) => {
        const value = row.getValue(column_name) as any;
        let finalValue = value;
        if (udt_name === "timestamp") {
          finalValue = new Date(value as string).toLocaleString();
        }
        if (typeof value === "string" && isUrl(value)) {
          const isImage = isImageUrl(value);
          return (
            <a
              href={value}
              target={"_blank"}
              className={cn("hover:underline")}
              rel="noreferrer"
            >
              <div className={"flex items-center break-all gap-4"}>
                {value}
                {isImage && (
                  <img
                    src={value}
                    alt={"preview"}
                    className="size-20 object-cover"
                  />
                )}
              </div>
            </a>
          );
        }
        return (
          <div
            className={cn("break-all", data_type === "integer" && "text-right")}
          >
            {finalValue}
          </div>
        );
      },
    })) as ColumnDef<any>[];
  }, [details]);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    rowCount: data?.count ?? 0,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
    },
    onPaginationChange: paginationUpdater,
    manualPagination: true,
  });

  return (
    <div className={"flex flex-col gap-4 flex-1 max-h-full pb-3"}>
      <div className={"flex gap-4 items-center justify-between"}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rows3 /> {tableName}
        </h1>
        <p>
          Rows: <strong>{data?.count}</strong>
        </p>
      </div>

      <div className="rounded-md border min-h-0 h-full overflow-auto w-full min-w-0">
        <Table
          className={"table-fixed min-w-full"}
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
                  return (
                    <TableHead
                      className={"relative"}
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
                      <div
                        {...{
                          onDoubleClick: () => header.column.resetSize(),
                          onMouseDown: header.getResizeHandler(),
                          onTouchStart: header.getResizeHandler(),
                          className: `resizer ${header.column.getIsResizing() ? "isResizing" : ""}`,
                        }}
                      />
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
      <DataTablePagination table={table} />
    </div>
  );
};
