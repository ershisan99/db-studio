import { SettingsDialog } from "@/components/settings-dialog";
import {
  Button,
  ModeToggle,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  buttonVariants,
} from "@/components/ui";
import { cn } from "@/lib/utils";
import { useDatabasesListQuery, useTablesListQuery } from "@/services/db";
import { useUiStore } from "@/state";
import {
  Link,
  Outlet,
  createRootRoute,
  useNavigate,
  useParams,
} from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import {
  Database,
  PanelLeft,
  PanelLeftClose,
  Rows3,
  Table2,
} from "lucide-react";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const showSidebar = useUiStore.use.showSidebar();
  const toggleSidebar = useUiStore.use.toggleSidebar();

  const { data } = useDatabasesListQuery();
  const params = useParams({ strict: false });
  const dbName = params.dbName ?? "";
  const navigate = useNavigate({ from: Route.fullPath });

  const handleSelectedDb = (dbName: string) => {
    void navigate({ to: "/db/$dbName/tables", params: { dbName } });
  };

  const { data: tables } = useTablesListQuery({ dbName });

  return (
    <>
      <div
        className={cn(
          "h-screen grid grid-rows-layout grid-cols-layout",
          !showSidebar && "sidebar-closed",
        )}
      >
        <header className="p-2 justify-between flex gap-2 border-b items-center col-span-full">
          <div className={"flex items-center gap-2"}>
            <Button variant="outline" size="icon" onClick={toggleSidebar}>
              {showSidebar ? (
                <PanelLeftClose className={"size-[1.2rem]"} />
              ) : (
                <PanelLeft className={"size-[1.2rem]"} />
              )}
            </Button>
            <Link to="/" className="[&.active]:font-bold">
              Home
            </Link>
          </div>
          <div className={"flex items-center gap-2"}>
            <ModeToggle />
            <SettingsDialog />
          </div>
        </header>

        <aside className={"p-3"}>
          {showSidebar && (
            <>
              <Select value={dbName} onValueChange={handleSelectedDb}>
                <SelectTrigger className="w-full">
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
                    className={cn(
                      "flex items-center gap-2 rounded py-1.5 pl-1.5",
                      "hover:bg-muted",
                      "[&.active]:bg-muted [&.active]:font-semibold",
                    )}
                  >
                    <Database className={"size-4"} /> {dbName}
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
                          "w-full flex gap-2 items-center",
                          "hover:underline",
                          "[&.active]:font-semibold",
                        )}
                        to={"/db/$dbName/tables/$tableName"}
                        params={{ tableName: table.table_name, dbName: dbName }}
                      >
                        <Table2 className={"size-4 shrink-0"} />
                        {table.table_name}
                      </Link>
                      <Link
                        className={cn(
                          "hover:underline shrink-0",
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
          )}
        </aside>
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
}
