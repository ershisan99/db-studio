import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Tooltip,
} from "@/components/ui";
import type { Table } from "@tanstack/react-table";
import { RotateCcw } from "lucide-react";

export const ResetStateDropdown = <T,>({ table }: { table: Table<T> }) => {
  return (
    <DropdownMenu>
      <Tooltip content={"Reset state"}>
        <DropdownMenuTrigger asChild>
          <Button variant={"outline"} size={"icon"}>
            <RotateCcw className={"size-[1.2rem]"} />
          </Button>
        </DropdownMenuTrigger>
      </Tooltip>
      <DropdownMenuContent align={"end"}>
        <DropdownMenuItem onSelect={() => table.resetColumnOrder()}>
          Reset Column Order
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => table.resetColumnSizing()}>
          Reset Column Sizing
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => table.resetColumnVisibility()}>
          Reset Column Visibility
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
