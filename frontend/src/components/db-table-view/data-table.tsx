import {
  Button,
  DataTablePagination,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { cn, isImageUrl, isUrl } from "@/lib/utils";
import { useTableColumnsQuery, useTableDataQuery } from "@/services/db";
import { useSettingsStore } from "@/state";
import {
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUp, Rows3 } from "lucide-react";
import { useMemo, useState } from "react";

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
  const formatDates = useSettingsStore.use.formatDates();
  const showImagesPreview = useSettingsStore.use.showImagesPreview();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: details } = useTableColumnsQuery({ dbName, tableName });
  const { data } = useTableDataQuery({
    tableName,
    dbName,
    perPage: pageSize,
    page: pageIndex,
    sortDesc: sorting[0]?.desc,
    sortField: sorting[0]?.id,
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
      enableSorting: true,
      cell: ({ row }) => {
        const value = row.getValue(column_name) as any;
        let finalValue = value;
        if (formatDates && udt_name === "timestamp") {
          finalValue = new Date(value as string).toLocaleString();
        }
        if (showImagesPreview && typeof value === "string" && isUrl(value)) {
          const isImage = isImageUrl(value);
          return (
            <a
              href={value}
              target={"_blank"}
              className={cn("hover:underline")}
              rel="noreferrer"
            >
              <div
                className={"flex items-center justify-between break-all gap-4"}
              >
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
  }, [details, formatDates, showImagesPreview]);

  const table = useReactTable({
    data: data?.data ?? [],
    columns,
    columnResizeMode: "onChange",
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    rowCount: data?.count ?? 0,
    manualSorting: true,
    onSortingChange: setSorting,
    state: {
      sorting,
      columnVisibility,
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    onSelect={(e) => e.preventDefault()}
                    checked={column.getIsVisible()}
                    onCheckedChange={column.toggleVisibility}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
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
                  const sorted = header.column.getIsSorted();

                  return (
                    <TableHead
                      className={"p-0 relative"}
                      key={header.id}
                      style={{
                        width: header.getSize(),
                      }}
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
