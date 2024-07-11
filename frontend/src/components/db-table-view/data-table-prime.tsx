import {
  Button,
  DataTablePagination,
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  ScrollArea,
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
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { usePassThrough } from "primereact/passthrough";
import { useMemo, useState } from "react";
export const DataTablePrime = ({
  tableName,
  dbName,
  offset,
  pageSize,
  onPageSizeChange,
  onPageIndexChange,
}: {
  tableName: string;
  offset: number;
  dbName: string;
  pageSize: number;
  onPageIndexChange: (pageIndex: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}) => {
  const formatDates = useSettingsStore.use.formatDates();
  const showImagesPreview = useSettingsStore.use.showImagesPreview();
  const paginationOptions = useSettingsStore.use.paginationOptions();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data: columns } = useTableColumnsQuery({ dbName, tableName });
  const { data } = useTableDataQuery({
    tableName,
    dbName,
    perPage: pageSize,
    page: Math.floor(offset / pageSize),
    sortDesc: sorting[0]?.desc,
    sortField: sorting[0]?.id,
  });

  return (
    <div className={"flex flex-col gap-4 flex-1 max-h-full h-full pb-3"}>
      <div className={"flex gap-4 items-center justify-between"}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rows3 /> {tableName}
        </h1>
        <p>
          Rows: <strong>{data?.count}</strong>
        </p>
      </div>
      <div className="min-h-0 h-full w-full min-w-0">
        <DataTable
          rows={pageSize}
          lazy
          first={offset}
          onPage={(e) => {
            if (e.rows !== pageSize) {
              onPageSizeChange(e.rows);
            } else if (e.first !== offset) {
              onPageIndexChange(e.first);
            }
          }}
          paginator
          totalRecords={data?.count}
          rowsPerPageOptions={paginationOptions}
          stripedRows
          columnResizeMode="expand"
          resizableColumns
          showGridlines
          size="small"
          value={data?.data}
          tableStyle={{ minWidth: "100%" }}
          scrollable
          scrollHeight="flex"
        >
          {columns?.map((col) => (
            <Column
              key={col.column_name}
              field={col.column_name}
              header={col.column_name}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
};
