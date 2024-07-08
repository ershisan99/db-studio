import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui";
import { useLoginMutation } from "@/services/db";
import { useSessionStore } from "@/state/db-session-store";
import { createFileRoute } from "@tanstack/react-router";
import { type FormEventHandler, useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth/login")({
  component: LoginForm,
});

function LoginForm() {
  const [connectionMethod, setConnectionMethod] =
    useState<string>("connectionString");
  const { mutateAsync } = useLoginMutation();
  const addSession = useSessionStore.use.addSession();

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const connectionString = formData.get("connectionString");

    if (connectionMethod === "connectionString") {
      if (connectionString != null && typeof connectionString === "string") {
        try {
          await mutateAsync({ connectionString });
          addSession({ connectionString });
        } catch (error) {
          console.log(error);
          toast.error("Invalid connection string");
          return;
        }
      } else {
        toast.error("Please fill all fields");
      }
      return;
    }

    const username = formData.get("username");
    const password = formData.get("password");
    const host = formData.get("host");
    const type = formData.get("type");
    const port = formData.get("port");
    const database = formData.get("database");
    const ssl = formData.get("ssl");

    if (
      database == null ||
      host == null ||
      password == null ||
      port == null ||
      ssl == null ||
      type == null ||
      username == null
    ) {
      toast.error("Please fill all fields");
      return;
    }
    if (
      typeof database !== "string" ||
      typeof host !== "string" ||
      typeof password !== "string" ||
      typeof port !== "string" ||
      typeof ssl !== "string" ||
      typeof type !== "string" ||
      typeof username !== "string"
    ) {
      return;
    }
    try {
      await mutateAsync({
        username,
        password,
        host,
        type,
        port,
        database,
        ssl,
      });
      addSession({ username, password, host, type, port, database, ssl });
    } catch (error) {
      console.log(error);
      toast.error("Invalid connection string");
      return;
    }
  };

  return (
    <div className={"flex w-layout h-layout items-center justify-center p-4"}>
      <Card className="w-full max-w-sm max-h-full overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Enter your database credentials below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            className="grid gap-4"
            id={"login-form"}
            onSubmit={handleSubmit}
          >
            <ToggleGroup
              type="single"
              className="w-full border gap-0.5 rounded-md"
              value={connectionMethod}
              onValueChange={setConnectionMethod}
            >
              <ToggleGroupItem
                value="fields"
                className={"w-full rounded-r-none"}
              >
                Fields
              </ToggleGroupItem>
              <ToggleGroupItem
                value="connectionString"
                className={"w-full rounded-l-none"}
              >
                Connection string
              </ToggleGroupItem>
            </ToggleGroup>
            {connectionMethod === "fields" ? (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="dbType">Database type</Label>
                  <Select defaultValue={"postgres"} name={"type"}>
                    <SelectTrigger className="w-full" id={"dbType"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgres">Postgres</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="host">Host</Label>
                  <Input
                    id="host"
                    name="host"
                    type="text"
                    required
                    placeholder={"127.0.0.1"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="port">Port</Label>
                  <Input
                    id="port"
                    name="port"
                    type="text"
                    required
                    defaultValue={"5432"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">User</Label>
                  <Input id="username" name="username" type="text" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    name="password"
                    id="password"
                    type="password"
                    required
                    placeholder={"********"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="database">Database</Label>
                  <Input
                    name="database"
                    id="database"
                    type="text"
                    defaultValue={"postgres"}
                    placeholder={"postgres"}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="ssl">SSL mode</Label>
                  <Select defaultValue={"false"} name={"ssl"}>
                    <SelectTrigger className="w-full" id={"ssl"}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">false</SelectItem>
                      <SelectItem value="true">true</SelectItem>
                      <SelectItem value="require">require</SelectItem>
                      <SelectItem value="allow">allow</SelectItem>
                      <SelectItem value="prefer">prefer</SelectItem>
                      <SelectItem value="verify-full">verify-full</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="connectionString">Connection string</Label>
                <Input
                  name="connectionString"
                  id="connectionString"
                  type="text"
                  required
                  placeholder={
                    "postgres://postgres:postgres@localhost:5432/postgres"
                  }
                />
              </div>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <Button className="w-full" form={"login-form"}>
            Sign in
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
