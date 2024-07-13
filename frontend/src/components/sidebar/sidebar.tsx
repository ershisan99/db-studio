import { SessionSelector } from "@/components/sidebar/session-selector";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  buttonVariants,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { Route } from "@/routes/__root";
import { useDatabasesListQuery, useTablesListQuery } from "@/services/db";
import { useUiStore } from "@/state";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { Database, Rows3 } from "lucide-react";
import type { PropsWithChildren } from "react";

function SidebarContent() {
  const { data } = useDatabasesListQuery();

  const showSidebar = useUiStore.use.showSidebar();
  const params = useParams({ strict: false });
  const dbName = params.dbName ?? "";
  const { data: tables } = useTablesListQuery({ dbName });
  const navigate = useNavigate({ from: Route.fullPath });

  const handleSelectedDb = (dbName: string) => {
    void navigate({ to: "/db/$dbName/tables", params: { dbName } });
  };
  if (!showSidebar) return null;

  return (
    <>
      <SessionSelector />
      <Select value={dbName} onValueChange={handleSelectedDb}>
        <SelectTrigger className="w-full mt-4">
          <SelectValue placeholder="Select a Database" />
        </SelectTrigger>
        <SelectContent>
          {data?.map((db) => {
            return (
              <SelectItem value={db} key={db}>
                {db}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <nav className="flex flex-col gap-1 mt-4">
        {dbName && (
          <Link
            to={"/db/$dbName/tables"}
            params={{ dbName }}
            activeOptions={{ exact: true }}
            title={dbName}
            className={cn(
              "flex items-center gap-2 rounded py-1.5 pl-1.5",
              "hover:bg-muted",
              "[&.active]:bg-muted [&.active]:font-semibold",
            )}
          >
            <Database className={"size-4"} />
            <span className={"max-w-full inline-block truncate"}>{dbName}</span>
          </Link>
        )}
        {tables?.map((table) => {
          return (
            <div
              key={table.table_name}
              className={cn(
                "flex items-center gap-2 px-2.5 rounded py-1.5 justify-between w-full",
              )}
            >
              <Link
                className={cn(
                  "max-w-full inline-block truncate",
                  "hover:underline",
                  "[&.active]:font-medium",
                )}
                title={table.table_name}
                to={"/db/$dbName/tables/$tableName"}
                params={{ tableName: table.table_name, dbName: dbName }}
              >
                {table.table_name}
              </Link>
              <Link
                className={cn(
                  "shrink-0",
                  "hover:underline",
                  buttonVariants({ variant: "ghost", size: "iconSm" }),
                  "[&.active]:bg-muted",
                )}
                title={"Explore Data"}
                aria-label={"Explore Data"}
                to={"/db/$dbName/tables/$tableName/data"}
                params={{ tableName: table.table_name, dbName: dbName }}
                search={{ pageIndex: 0, pageSize: 10 }}
              >
                <Rows3 className={"size-4 shrink-0"} />
              </Link>
            </div>
          );
        })}
      </nav>
    </>
  );
}

function SidebarContainer({ children }: PropsWithChildren) {
  return <aside className={"p-3"}>{children}</aside>;
}

export function Sidebar() {
  return (
    <SidebarContainer>
      <SidebarContent />
    </SidebarContainer>
  );
}
