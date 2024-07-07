import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  return (
    <div className="p-2 h-layout w-layout grid place-items-center">
      <div>
        <h1 className={"text-xl text-center font-semibold"}>Welcome!</h1>
        <p>Select a database to continue.</p>
      </div>
    </div>
  );
}
