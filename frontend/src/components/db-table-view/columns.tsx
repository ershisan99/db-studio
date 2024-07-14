import { cn, isImageUrl, isUrl } from "@/lib/utils";
import { type TableColumns, useTableColumnsQuery } from "@/services/db";
import { useSettingsStore } from "@/state";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo } from "react";

const buildColumns = <T,>({
  columns,
  formatDates,
  showImagesPreview,
}: {
  columns?: TableColumns;

  formatDates: boolean;
  showImagesPreview: boolean;
}): ColumnDef<T>[] => {
  if (!columns) return [] as ColumnDef<T>[];

  return columns.map(({ column_name, udt_name, data_type }) => ({
    accessorKey: column_name,
    title: column_name,
    size: 300,
    id: column_name,
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
      if (typeof finalValue === "boolean") {
        finalValue = finalValue ? "true" : "false";
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
  })) as ColumnDef<T>[];
};

export const useColumns = ({
  dbName,
  tableName,
}: { dbName: string; tableName: string }) => {
  const { data: details } = useTableColumnsQuery({ dbName, tableName });
  const formatDates = useSettingsStore.use.formatDates();
  const showImagesPreview = useSettingsStore.use.showImagesPreview();

  return useMemo(() => {
    return buildColumns({
      columns: details,
      formatDates,
      showImagesPreview,
    });
  }, [details, formatDates, showImagesPreview]);
};
