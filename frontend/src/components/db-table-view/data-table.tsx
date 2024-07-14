import {
  TableScrollContainer,
  TableView,
} from "@/components/db-table-view/table";
import {
  Button,
  DataTablePagination,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  FormInput,
  Tooltip,
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
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Info, Rows3, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

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
  const whereQueryForm = useForm<{ whereQuery: string }>();
  const formatDates = useSettingsStore.use.formatDates();
  const showImagesPreview = useSettingsStore.use.showImagesPreview();
  const [whereQuery, setWhereQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: details } = useTableColumnsQuery({ dbName, tableName });
  const { data, refetch } = useTableDataQuery({
    whereQuery,
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
              "whitespace-nowrap ",
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
        if (
          formatDates &&
          ["timestamp", "datetime"].includes(udt_name.toLowerCase())
        ) {
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
            className={cn(
              "break-all",
              ["integer", "int", "tinyint", "double"].includes(data_type) &&
                "text-right",
            )}
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
          <form
            className={"flex gap-2"}
            onSubmit={whereQueryForm.handleSubmit((data) => {
              if (data.whereQuery === whereQuery) {
                void refetch();
                return;
              }
              setWhereQuery(data.whereQuery);
            })}
          >
            <FormInput
              name={"whereQuery"}
              control={whereQueryForm.control}
              placeholder="WHERE clause"
            />
            <Button variant={"outline"} size={"icon"} type={"submit"}>
              <Search className={"size-[1.2rem] shrink-0"} />
            </Button>
            <Tooltip
              content={
                <div>
                  Your input will be prefixed with WHERE and appended to the raw
                  SQL query.
                  <div>You can use AND, OR, NOT, BETWEEN, LIKE, =, etc.</div>
                  <div>To remove the WHERE clause, submit an empty input.</div>
                </div>
              }
            >
              <Info className={"size-4 shrink-0 cursor-help"} />
            </Tooltip>
          </form>
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

      <div className="rounded-md border min-h-0 h-full w-full min-w-0 flex flex-col">
        <TableScrollContainer>
          <TableView table={table} columnLength={columns.length} />
        </TableScrollContainer>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
};
