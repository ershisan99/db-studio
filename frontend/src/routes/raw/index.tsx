import Editor from "@monaco-editor/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/raw/")({
  component: Component,
});

function Component() {
  return (
    <Editor
      height="90vh"
      defaultLanguage="sql"
      defaultValue="SELECT * FROM table"
    />
  );
}
