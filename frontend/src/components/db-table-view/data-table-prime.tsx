import { cn, isImageUrl, isUrl } from "@/lib/utils";
import { useTableColumnsQuery, useTableDataQuery } from "@/services/db";
import { useSettingsStore } from "@/state";
import type { SortingState, VisibilityState } from "@tanstack/react-table";
import { Rows3 } from "lucide-react";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { useState } from "react";

const columnTemplate =
  ({
    columnName,
    formatDates,
    showImagesPreview,
    udt_name,
    data_type,
  }: {
    columnName: string;
    formatDates: boolean;
    showImagesPreview: boolean;
    udt_name: string;
    data_type: string;
  }) =>
  (item: Record<string, any>) => {
    const value = item[columnName] as any;

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
          <div className={"flex items-center justify-between break-all gap-4"}>
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
  };

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
  const { data, isFetching } = useTableDataQuery({
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
          loading={isFetching}
        >
          {columns?.map((col) => (
            <Column
              key={col.column_name}
              field={col.column_name}
              header={col.column_name}
              body={columnTemplate({
                columnName: col.column_name,
                formatDates,
                showImagesPreview,
                udt_name: col.udt_name,
                data_type: col.data_type,
              })}
            />
          ))}
        </DataTable>
      </div>
    </div>
  );
};
