import cors from "@elysiajs/cors";
import { jwt } from "@elysiajs/jwt";
import { Elysia, t } from "elysia";
import { postgresDriver } from "./drivers/postgres";

const credentialsSchema = t.Union([
  t.Object({
    username: t.String(),
    password: t.String(),
    host: t.String(),
    type: t.String(),
    port: t.String(),
    database: t.String(),
    ssl: t.String(),
  }),
  t.Object({
    connectionString: t.String(),
  }),
]);
const app = new Elysia({ prefix: "/api" })
  .use(
    jwt({
      name: "jwt",
      secret: "Fischl von Luftschloss Narfidort",
      schema: credentialsSchema,
    }),
  )
  .get("/", () => "Hello Elysia")
  .post(
    "/auth/login",
    async ({ body, jwt, cookie: { auth } }) => {
      const databases = await postgresDriver.getAllDatabases(body);

      auth.set({
        value: await jwt.sign(body),
        httpOnly: true,
      });

      return { success: true, databases };
    },
    { body: credentialsSchema },
  )
  .get("/databases", async ({ jwt, set, cookie: { auth } }) => {
    const credentials = await jwt.verify(auth.value);

    if (!credentials) {
      set.status = 401;
      return "Unauthorized";
    }

    const databases = await postgresDriver.getAllDatabases(credentials);
    return new Response(JSON.stringify(databases, null, 2)).json();
  })
  .get(
    "/databases/:dbName/tables",
    async ({ query, params, jwt, set, cookie: { auth } }) => {
      const { sortField, sortDesc } = query;
      const { dbName } = params;
      const credentials = await jwt.verify(auth.value);

      if (!credentials) {
        set.status = 401;
        return "Unauthorized";
      }

      const tables = await postgresDriver.getAllTables(credentials, {
        dbName,
        sortField,
        sortDesc: sortDesc === "true",
      });

      return new Response(JSON.stringify(tables, null, 2)).json();
    },
  )
  .get(
    "databases/:dbName/tables/:tableName/data",
    async ({ query, params, jwt, set, cookie: { auth } }) => {
      const { tableName, dbName } = params;
      const { perPage = "50", page = "0", sortField, sortDesc } = query;
      const credentials = await jwt.verify(auth.value);

      if (!credentials) {
        set.status = 401;
        return "Unauthorized";
      }

      return postgresDriver.getTableData(credentials, {
        tableName,
        dbName,
        perPage: Number.parseInt(perPage, 10),
        page: Number.parseInt(page, 10),
        sortField,
        sortDesc: sortDesc === "true",
      });
    },
  )
  .get(
    "databases/:dbName/tables/:tableName/columns",
    async ({ params, jwt, set, cookie: { auth } }) => {
      const { tableName, dbName } = params;
      const credentials = await jwt.verify(auth.value);

      if (!credentials) {
        set.status = 401;
        return "Unauthorized";
      }

      const columns = await postgresDriver.getTableColumns(credentials, {
        dbName,
        tableName,
      });
      return new Response(JSON.stringify(columns, null, 2)).json();
    },
  )
  .get(
    "databases/:dbName/tables/:tableName/indexes",
    async ({ params, jwt, set, cookie: { auth } }) => {
      const { tableName, dbName } = params;
      const credentials = await jwt.verify(auth.value);

      if (!credentials) {
        set.status = 401;
        return "Unauthorized";
      }

      const indexes = await postgresDriver.getTableIndexes(credentials, {
        dbName,
        tableName,
      });
      return new Response(JSON.stringify(indexes, null, 2)).json();
    },
  )
  .get(
    "databases/:dbName/tables/:tableName/foreign-keys",
    async ({ params, jwt, set, cookie: { auth } }) => {
      const { tableName, dbName } = params;
      const credentials = await jwt.verify(auth.value);

      if (!credentials) {
        set.status = 401;
        return "Unauthorized";
      }

      const foreignKeys = await postgresDriver.getTableForeignKeys(
        credentials,
        {
          dbName,
          tableName,
        },
      );

      return new Response(JSON.stringify(foreignKeys, null, 2)).json();
    },
  )
  .post(
    "raw",
    async ({ body, jwt, set, cookie: { auth } }) => {
      const credentials = await jwt.verify(auth.value);

      if (!credentials) {
        set.status = 401;
        return "Unauthorized";
      }

      const { query } = body;
      return await postgresDriver.executeQuery(credentials, query);
    },
    {
      body: t.Object({
        query: t.String(),
      }),
    },
  )
  .use(
    cors({
      origin: ["localhost:5173"],
      allowedHeaders: ["Content-Type", "Authorization"],
    }),
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
