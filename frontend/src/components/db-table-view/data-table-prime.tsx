import { cn, isImageUrl, isUrl } from "@/lib/utils";
import { useTableColumnsQuery, useTableDataQuery } from "@/services/db";
import { useSettingsStore } from "@/state";
import { Rows3 } from "lucide-react";
import { Column } from "primereact/column";
import { DataTable, type SortOrder } from "primereact/datatable";
import {
  MultiSelect,
  type MultiSelectChangeEvent,
} from "primereact/multiselect";
import { useEffect, useState } from "react";

const headerTemplate = ({
  columnName,
  udt_name,
}: { udt_name: string; columnName: string }) => (
  <div className={"flex items-center gap-2"}>
    <span>{columnName}</span>
    <span className="text-xs text-gray-500">[{udt_name.toUpperCase()}]</span>
  </div>
);

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
  const [sorting, setSorting] = useState<
    | {
        sortField?: string;
        sortOrder?: SortOrder;
      }
    | undefined
  >(undefined);
  const { data: columns } = useTableColumnsQuery({ dbName, tableName });
  const [visibleColumns, setVisibleColumns] = useState(columns);

  useEffect(() => {
    setVisibleColumns(columns);
  }, [columns]);

  const onColumnToggle = (event: MultiSelectChangeEvent) => {
    const selectedColumns = event.value;
    console.log(selectedColumns);
    const orderedSelectedColumns = columns?.filter((col) =>
      selectedColumns.some((sCol: any) => sCol.column_name === col.column_name),
    );

    setVisibleColumns(orderedSelectedColumns);
  };

  const header = (
    <MultiSelect
      value={visibleColumns}
      options={columns}
      optionLabel="column_name"
      onChange={onColumnToggle}
      className="w-full sm:w-20rem"
      display="chip"
      filter
    />
  );

  const { data, isFetching } = useTableDataQuery({
    tableName,
    dbName,
    perPage: pageSize,
    page: Math.floor(offset / pageSize),
    sortDesc: sorting?.sortOrder === -1,
    sortField: sorting?.sortField,
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
          header={header}
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
          onSort={setSorting}
          sortField={sorting?.sortField}
          sortOrder={sorting?.sortOrder}
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
          removableSort
          stateStorage="local"
          stateKey={`dt-state-${dbName}-${tableName}`}
        >
          {visibleColumns?.map((col) => (
            <Column
              key={col.column_name}
              sortable
              field={col.column_name}
              header={headerTemplate({
                columnName: col.column_name,
                udt_name: col.udt_name,
              })}
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
