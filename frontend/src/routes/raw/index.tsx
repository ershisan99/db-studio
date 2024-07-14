import {
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui";
import { useQueryRawSqlMutation } from "@/services/db";
import { useUiStore } from "@/state";
import Editor from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useState } from "react";

export const Route = createFileRoute("/raw/")({
  component: Component,
});

function Component() {
  const [query, setQuery] = useState<string | undefined>("SELECT * FROM");
  const { mutate, data } = useQueryRawSqlMutation();
  const appTheme = useUiStore.use.theme();
  const themeToUse = appTheme === "light" ? "light" : "vs-dark";

  const handleSubmit = () => {
    if (!query) return;

    mutate({ query });
  };

  return (
    <div className={"h-layout w-layout p-3"}>
      <div className={"flex flex-col gap-4 flex-1 h-full max-h-full pb-3"}>
        <Editor
          theme={themeToUse}
          value={query}
          onChange={setQuery}
          className={"h-full border"}
          height={"35%"}
          language="sql"
          options={{
            tabFocusMode: true,
            detectIndentation: false,
            minimap: { enabled: false },
            automaticLayout: true,
            scrollBeyondLastLine: false,
          }}
        />
        <div className={"flex gap-4 items-center justify-between"}>
          <Button disabled={!query} onClick={handleSubmit} className={"gap-2"}>
            Execute Query <ArrowRight className={"size-4"} />
          </Button>
        </div>
        {data?.map((row, i) => {
          return (
            // biome-ignore lint/suspicious/noArrayIndexKey:
            <div key={i}>
              <div>count: {row.count}</div>
              {row.data.length > 0 && <RenderTable data={row.data} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const RenderTable = ({ data }: { data: Array<Record<string, any>> }) => {
  const columns = Object.keys(data[0]);

  return (
    <Table className="w-max">
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead key={column}>{column}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((row, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
          <TableRow key={i}>
            {columns.map((column) => (
              <TableCell key={column}>{row[column]}</TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
