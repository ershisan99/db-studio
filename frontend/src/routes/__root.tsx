import { SettingsDialog } from "@/components/settings-dialog";
import { Sidebar } from "@/components/sidebar/sidebar";
import { Button, ModeToggle } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/state";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { PanelLeft, PanelLeftClose } from "lucide-react";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const showSidebar = useUiStore.use.showSidebar();
  const toggleSidebar = useUiStore.use.toggleSidebar();

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
            <Link to="/raw" className="[&.active]:font-bold">
              Raw
            </Link>
          </div>
          <div className={"flex items-center gap-2"}>
            <ModeToggle />
            <SettingsDialog />
          </div>
        </header>
        <Sidebar />
        <Outlet />
      </div>
      <TanStackRouterDevtools />
    </>
  );
}
