import { BodyCell } from "@/components/db-table-view/body-cell";
import { UrlWithPreview } from "@/components/db-table-view/url-with-preview";
import { cn, isUrl } from "@/lib/utils";
import { type TableColumns, useTableColumnsQuery } from "@/services/db";
import { useSettingsStore } from "@/state";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";

const buildColumns = <T,>({
  columns,
  formatDates,
}: {
  columns?: TableColumns;
  formatDates: boolean;
}): ColumnDef<T>[] => {
  if (!columns) return [] as ColumnDef<T>[];

  return columns.map(({ column_name, udt_name, data_type }) => ({
    accessorKey: column_name,
    title: column_name,
    size: 300,
    id: column_name,
    enableSorting: true,
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
    cell: ({ row, table, column }) => {
      const initialValue = row.getValue(column_name) as any;
      const [value, setValue] = useState(initialValue);

      const [isEditing, setIsEditing] = useState(false);
      function handleDoubleClick() {
        setIsEditing(true);
      }
      function handleSave() {
        if (value === initialValue) return;
        (table.options.meta as any)?.setEditedRows((old) => ({
          ...old,
          [row.index]: true,
        }));
        (table.options.meta as any)?.updateData(row.index, column.id, value);
        setIsEditing(false);
      }
      if (isEditing) {
        return (
          <input
            // biome-ignore lint/a11y/noAutofocus: <explanation>
            autoFocus={true}
            className={"w-full focus:ring"}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleSave}
          />
        );
      }
      let finalValue = value;
      if (
        formatDates &&
        ["timestamp", "datetime"].includes(udt_name.toLowerCase())
      ) {
        finalValue = new Date(value as string).toLocaleString();
      }
      if (typeof value === "string" && isUrl(value)) {
        return <UrlWithPreview url={value} />;
      }
      if (typeof finalValue === "boolean") {
        finalValue = finalValue ? "true" : "false";
      }
      return (
        <BodyCell
          value={finalValue}
          dataType={data_type}
          onDoubleClick={handleDoubleClick}
        />
      );
    },
  })) as ColumnDef<T>[];
};

export const useColumns = ({
  dbName,
  tableName,
}: { dbName: string; tableName: string }) => {
  const { data: details } = useTableColumnsQuery({ dbName, tableName });
  const formatDates = useSettingsStore.use.formatDates();

  return useMemo(() => {
    return buildColumns({
      columns: details,
      formatDates,
    });
  }, [details, formatDates]);
};
