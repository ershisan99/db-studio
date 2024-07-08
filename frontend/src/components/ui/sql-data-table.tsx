import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { flexRender } from "@tanstack/react-table";
import type { Table as TableType } from "@tanstack/react-table";
import { ArrowUp } from "lucide-react";
import { type ComponentPropsWithoutRef, memo } from "react";

type Props<TData> = {
  table: TableType<TData>;
  columnsLength: number;
} & ComponentPropsWithoutRef<typeof Table>;

function RawSqlDataTable<TData>({
  table,
  columnsLength,
  style,
  ...rest
}: Props<TData>) {
  return (
    <Table
      style={{
        width: table.getCenterTotalSize(),
        ...style,
      }}
      {...rest}
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
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))
        ) : (
          <TableRow>
            <TableCell colSpan={columnsLength} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

const SqlDataTable = memo(RawSqlDataTable);

SqlDataTable.displayName = "SqlDataTable";

export { SqlDataTable };
