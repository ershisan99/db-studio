import {
  TableScrollContainer,
  TableView,
} from "@/components/db-table-view/table";
import { DataTablePagination } from "@/components/ui";
import { useTableDataQuery } from "@/services/db";
import {
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Rows3 } from "lucide-react";
import { useCallback, useState } from "react";
import { useColumns } from "./columns";
import { ColumnsDropdown } from "./columns-dropdown";
import {
  WhereClauseForm,
  type WhereClauseFormValues,
} from "./where-clause-form";

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
  const columns = useColumns({ dbName, tableName });
  const [whereQuery, setWhereQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const { data, refetch } = useTableDataQuery({
    whereQuery,
    tableName,
    dbName,
    perPage: pageSize,
    page: pageIndex,
    sortDesc: sorting[0]?.desc,
    sortField: sorting[0]?.id,
  });

  const handleWhereClauseFormSubmit = useCallback(
    ({ whereClause }: WhereClauseFormValues) => {
      if (whereClause === whereQuery) {
        void refetch();
        return;
      }
      setWhereQuery(whereClause);
    },
    [whereQuery, refetch],
  );

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
          <WhereClauseForm onSubmit={handleWhereClauseFormSubmit} />
        </h1>
        <ColumnsDropdown table={table} />
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
