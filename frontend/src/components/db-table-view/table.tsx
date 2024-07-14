import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { type Table as ReactTable, flexRender } from "@tanstack/react-table";
import { ArrowUp } from "lucide-react";
import type { PropsWithChildren } from "react";

export function TableView<T>({
  table,
  columnLength = 1,
}: { table: ReactTable<T>; columnLength?: number }) {
  return (
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
          <TableRow key={headerGroup.id} className={"sticky top-0"}>
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
                    className={"select-text"}
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
            <TableCell colSpan={columnLength} className="h-24 text-center">
              No results.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}

export function TableScrollContainer({ children }: PropsWithChildren) {
  return (
    <div className={"flex flex-col flex-1 overflow-auto relative"}>
      {children}
    </div>
  );
}
