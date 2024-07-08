import { cn, isImageUrl, isUrl } from "@/lib/utils";
import { useSettingsStore } from "@/state";
import type { Row } from "@tanstack/react-table";
import { memo } from "react";

type Props<T> = {
  row: Row<T>;
  column_name: string;
  isDate?: boolean;
  isNumber?: boolean;
};

function RawSqlDataTableCell<T>({
  isNumber,
  row,
  column_name,
  isDate,
}: Props<T>) {
  const formatDates = useSettingsStore.use.formatDates();
  const showImagesPreview = useSettingsStore.use.showImagesPreview();
  const value = row.getValue(column_name) as any;
  let finalValue = value;
  if (formatDates && isDate) {
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
            <img src={value} alt={"preview"} className="size-20 object-cover" />
          )}
        </div>
      </a>
    );
  }
  return (
    <div className={cn("break-all", isNumber && "text-right")}>
      {finalValue}
    </div>
  );
}

const SqlDataTableCell = memo(RawSqlDataTableCell);

SqlDataTableCell.displayName = "SqlDataTableCell";

export { SqlDataTableCell };
