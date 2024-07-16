import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

export function BodyCell({
  value,
  dataType,
  className,
  ...rest
}: { value: any; dataType: string } & Omit<
  ComponentPropsWithoutRef<"div">,
  "children"
>) {
  return (
    <div
      className={cn(
        "break-all",
        ["integer", "int", "tinyint", "double"].includes(dataType) &&
          "text-right",
        className,
      )}
      {...rest}
    >
      {value}
    </div>
  );
}
