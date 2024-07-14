import { useColumns } from "@/components/db-table-view/columns";
import { ColumnsDropdown } from "@/components/db-table-view/columns-dropdown";
import {
  TableScrollContainer,
  TableView,
} from "@/components/db-table-view/table";
import {
  WhereClauseForm,
  type WhereClauseFormValues,
} from "@/components/db-table-view/where-clause-form";
import { DataTablePagination } from "@/components/ui";
import { useFilters } from "@/hooks/use-filters";
import { DEFAULT_PAGE_INDEX, DEFAULT_PAGE_SIZE } from "@/lib/constants";
import { sortByToState, stateToSortBy } from "@/lib/tableSortMapper";
import { useTableDataQuery } from "@/services/db";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ColumnSizingState,
  type OnChangeFn,
  type PaginationState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Rows3 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { z } from "zod";

const tableSearchSchema = z.object({
  pageSize: z.number().catch(10),
  pageIndex: z.number().catch(0),
  sortField: z.string().optional(),
  sortDesc: z.boolean().optional(),
});

export const Route = createFileRoute("/db/$dbName/tables/$tableName/data")({
  component: Component,
  validateSearch: (search) => tableSearchSchema.parse(search),
});

function Component() {
  const { tableName, dbName } = Route.useParams();

  const { filters, setFilters } = useFilters(Route.fullPath);
  const [whereQuery, setWhereQuery] = useState("");
  const [columnSizing, setColumnSizing] = useLocalStorage<ColumnSizingState>(
    `columnSizing-${dbName}-${tableName}`,
    {},
  );
  const [columnVisibility, setColumnVisibility] =
    useLocalStorage<VisibilityState>(
      `columnVisibility-${dbName}-${tableName}`,
      {},
    );

  const paginationState = useMemo(
    () => ({
      pageIndex: filters.pageIndex ?? DEFAULT_PAGE_INDEX,
      pageSize: filters.pageSize ?? DEFAULT_PAGE_SIZE,
    }),
    [filters],
  );

  const sortingState = useMemo(() => sortByToState(filters), [filters]);
  const columns = useColumns({ dbName, tableName });
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id ?? ""),
  );
  useEffect(() => {
    if (columnOrder.length !== 0) return;
    setColumnOrder(columns.map((c) => c.id ?? ""));
  }, [columns, columnOrder.length]);
  const { data, refetch } = useTableDataQuery({
    whereQuery,
    tableName,
    dbName,
    perPage: filters.pageSize,
    page: filters.pageIndex,
    sortField: filters.sortField,
    sortDesc: filters.sortDesc,
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

  const handleSortingChange: OnChangeFn<SortingState> = useCallback(
    (updaterOrValue) => {
      const newSortingState =
        typeof updaterOrValue === "function"
          ? updaterOrValue(sortingState)
          : updaterOrValue;
      return setFilters(stateToSortBy(newSortingState));
    },
    [sortingState, setFilters],
  );

  const handlePaginationChange: OnChangeFn<PaginationState> = useCallback(
    (pagination) => {
      setFilters(
        typeof pagination === "function"
          ? pagination(paginationState)
          : pagination,
      );
    },
    [paginationState, setFilters],
  );

  const table = useReactTable({
    columnResizeMode: "onChange",
    columns,
    data: data?.data ?? [],
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    manualSorting: true,
    onColumnOrderChange: setColumnOrder,
    onColumnSizingChange: setColumnSizing,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: handlePaginationChange,
    onSortingChange: handleSortingChange,
    rowCount: data?.count ?? 0,
    state: {
      columnOrder,
      sorting: sortingState,
      columnSizing: columnSizing,
      columnVisibility,
      pagination: paginationState,
    },
  });

  return (
    <div className="p-3 h-layout w-layout">
      <div className={"flex flex-col gap-4 flex-1 max-h-full pb-3"}>
        <div className={"flex gap-4 items-center justify-between"}>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Rows3 /> {tableName}
            <WhereClauseForm onSubmit={handleWhereClauseFormSubmit} />
          </h1>
          <ColumnsDropdown
            table={table}
            columnOrder={columnOrder}
            setColumnOrder={setColumnOrder}
          />
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
    </div>
  );
}
