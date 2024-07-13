import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  FormInput,
  FormSelect,
  Label,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui";
import { type LoginArgs, useLoginMutation } from "@/services/db";
import { useSessionStore } from "@/state/db-session-store";
import { zodResolver } from "@hookform/resolvers/zod";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { type Control, useForm } from "react-hook-form";
import { z } from "zod";

export const Route = createFileRoute("/auth/login")({
  component: LoginForm,
});

const loginWithConnectionStringSchema = z.object({
  type: z.enum(["mysql", "postgres"]),
  connectionString: z.string().trim().min(1, "Connection string is required"),
});

type LoginWithConnectionStringFields = z.infer<
  typeof loginWithConnectionStringSchema
>;

function ConnectionStringForm({
  onSubmit,
}: {
  onSubmit: (values: LoginWithConnectionStringFields) => void;
}) {
  const { control, handleSubmit } = useForm<LoginWithConnectionStringFields>({
    resolver: zodResolver(loginWithConnectionStringSchema),
    defaultValues: {
      type: "postgres",
      connectionString: "",
    },
  });

  return (
    <form
      className="grid gap-2"
      onSubmit={handleSubmit(onSubmit)}
      id={"login-form"}
    >
      <DatabaseTypeSelector control={control} />
      <FormInput
        label={"Connection string"}
        name={"connectionString"}
        control={control}
        placeholder={"postgres://postgres:postgres@localhost:5432/postgres"}
      />
    </form>
  );
}

const loginWithConnectionFieldsSchema = z.object({
  type: z.enum(["mysql", "postgres"]),
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
  host: z.string().min(1, "Host is required"),
  port: z.string().min(1, "Port is required"),
  database: z.string().min(1, "Database is required"),
  ssl: z.enum(["false", "true", "require", "allow", "prefer", "verify-full"]),
});
type LoginWithConnectionFields = z.infer<
  typeof loginWithConnectionFieldsSchema
>;

function ConnectionFieldsForm({
  onSubmit,
}: {
  onSubmit: (values: LoginWithConnectionFields) => void;
}) {
  const { control, handleSubmit } = useForm<LoginWithConnectionFields>({
    resolver: zodResolver(loginWithConnectionFieldsSchema),
    defaultValues: {
      type: "postgres",
      host: "",
      port: "",
      username: "",
      password: "",
      ssl: "prefer",
      database: "",
    },
  });

  return (
    <form
      className="grid gap-3"
      onSubmit={handleSubmit(onSubmit)}
      id={"login-form"}
    >
      <DatabaseTypeSelector control={control} />
      <FormInput
        name={"host"}
        control={control}
        label={"Host"}
        placeholder={"127.0.0.1"}
      />
      <FormInput name={"port"} control={control} label={"Port"} />
      <FormInput name={"username"} control={control} label={"User"} />
      <FormInput name={"password"} control={control} label={"Password"} />
      <FormInput name={"database"} control={control} label={"Database"} />
      <div className="grid gap-2">
        <Label htmlFor="ssl">SSL mode</Label>
        <FormSelect control={control} name={"ssl"}>
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
        </FormSelect>
      </div>
    </form>
  );
}

function LoginForm() {
  const [connectionMethod, setConnectionMethod] =
    useState<string>("connectionString");
  const { mutateAsync } = useLoginMutation();
  const addSession = useSessionStore.use.addSession();

  const onSubmit = async (args: LoginArgs) => {
    await mutateAsync(args);
    addSession(args);
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
          <div className="grid gap-4">
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
              <ConnectionFieldsForm onSubmit={onSubmit} />
            ) : (
              <ConnectionStringForm onSubmit={onSubmit} />
            )}
          </div>
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

function DatabaseTypeSelector({
  control,
}: {
  control: Control<any>;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor="dbType">Database type</Label>
      <FormSelect control={control} name={"type"}>
        <SelectTrigger className="w-full" id={"dbType"}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="postgres">Postgres</SelectItem>
          <SelectItem value="mysql">MySQL</SelectItem>
        </SelectContent>
      </FormSelect>
    </div>
  );
}
