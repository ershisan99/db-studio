import { describe, expect, it } from "bun:test";
import { edenFetch } from "@elysiajs/eden";
import cookie from "cookie";
import jwt from "jsonwebtoken";
import type { AppType } from "../index";

const fetch = edenFetch<AppType>("http://localhost:3000");

const testDBName = "users";

const pgCookie = cookie.serialize(
  "auth",
  jwt.sign(
    {
      type: "postgres",
      username: "postgres",
      password: "mysecretpassword",
      host: "localhost",
      port: "5432",
      database: "postgres",
      ssl: "prefer",
    },
    "Fischl von Luftschloss Narfidort",
    { noTimestamp: true },
  ),
);

const mysqlCookie = cookie.serialize(
  "auth",
  jwt.sign(
    {
      type: "mysql",
      username: "root",
      password: "mysecretpassword",
      host: "localhost",
      port: "3306",
      database: "mysql",
      ssl: "prefer",
    },
    "Fischl von Luftschloss Narfidort",
    { noTimestamp: true },
  ),
);

describe("/auth/login", () => {
  it("should log in correctly with PostgreSQL", async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: {
        type: "postgres",
        username: "postgres",
        password: "mysecretpassword",
        host: "localhost",
        port: "5432",
        database: "postgres",
        ssl: "prefer",
      },
    });

    expect(res.status).toEqual(200);
    expect(res.data?.databases).toEqual([
      "pg_toast",
      "pg_catalog",
      "public",
      "information_schema",
    ]);
  });

  it("should log in correctly with MySQL", async () => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      body: {
        type: "mysql",
        username: "root",
        password: "mysecretpassword",
        host: "localhost",
        port: "3306",
        database: "mysql",
        ssl: "prefer",
      },
    });
    expect(res.status).toEqual(200);
    expect(res.data?.databases).toEqual([
      "information_schema",
      "mysql",
      "performance_schema",
      "sys",
      "test_db",
    ]);
  });
});

describe("/databases", () => {
  it("should return correct data from PostgreSQL", async () => {
    const res = await fetch("/api/databases", {
      method: "GET",
      headers: {
        cookie: pgCookie,
      },
    });
    expect(res.status).toEqual(200);
    expect(res.data).toEqual([
      "pg_toast",
      "pg_catalog",
      "public",
      "information_schema",
    ]);
  });

  it("should return correct data from MySQL", async () => {
    const res = await fetch("/api/databases", {
      method: "GET",
      headers: {
        cookie: mysqlCookie,
      },
    });
    expect(res.status).toEqual(200);
    expect(res.data).toEqual([
      "information_schema",
      "mysql",
      "performance_schema",
      "sys",
      "test_db",
    ]);
  });
});

describe("/databases/:dbName/tables", () => {
  it("should return correct data from PostgreSQL", async () => {
    const res = await fetch("/api/databases/:dbName/tables", {
      params: {
        dbName: "public",
      },
      method: "GET",
      headers: {
        cookie: pgCookie,
      },
    });
    expect(res.status).toEqual(200);
    for (const table of res.data) {
      expect(table).toContainAllKeys([
        "comments",
        "index_size",
        "indexes",
        "owner",
        "primary_key",
        "row_count",
        "schema_name",
        "table_name",
        "table_size",
        "total_size",
      ]);
      expect(table.comments).toBeString();
      expect(table.index_size).toBeNumber();
      expect(table.indexes).toBeString();
      expect(
        typeof table.owner === "string" || table.owner === null,
      ).toBeTrue();
      expect(table.primary_key).toBeString();
      expect(table.row_count).toBeNumber();
      expect(table.schema_name).toBeString();
      expect(table.table_name).toBeString();
      expect(table.table_size).toBeNumber();
      expect(table.total_size).toBeNumber();
    }
  });

  it("should return correct data from MySQL", async () => {
    const res = await fetch("/api/databases/:dbName/tables", {
      params: {
        dbName: "test_db",
      },
      method: "GET",
      headers: {
        cookie: mysqlCookie,
      },
    });
    expect(res.status).toEqual(200);
    for (const table of res.data) {
      expect(table).toContainAllKeys([
        "comments",
        "index_size",
        "indexes",
        "owner",
        "primary_key",
        "row_count",
        "schema_name",
        "table_name",
        "table_size",
        "total_size",
      ]);
      expect(table.comments).toBeString();
      expect(table.index_size).toBeNumber();
      expect(table.indexes).toBeString();
      expect(
        typeof table.owner === "string" || table.owner === null,
      ).toBeTrue();
      expect(table.primary_key).toBeString();
      expect(table.row_count).toBeNumber();
      expect(table.schema_name).toBeString();
      expect(table.table_name).toBeString();
      expect(table.table_size).toBeNumber();
      expect(table.total_size).toBeNumber();
    }
  });
});

describe("databases/:dbName/tables/:tableName/data", () => {
  it("should return correct data from PostgreSQL", async () => {
    const res = await fetch("/api/databases/:dbName/tables/:tableName/data", {
      params: {
        dbName: "public",
        tableName: testDBName,
      },
      method: "GET",
      headers: {
        cookie: pgCookie,
      },
    });
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data?.data.length).toBeGreaterThan(0);
    expect(res.data?.count).toEqual(res.data?.data.length);

    for (const row of res.data.data) {
      expect(row).toBeObject();
    }
  });

  it("should return correct data from MySQL", async () => {
    const res = await fetch("/api/databases/:dbName/tables/:tableName/data", {
      params: {
        dbName: "test_db",
        tableName: testDBName,
      },
      method: "GET",
      headers: {
        cookie: mysqlCookie,
      },
    });
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data?.data.length).toBeGreaterThan(0);
    expect(res.data?.count).toEqual(res.data?.data.length);

    for (const row of res.data.data) {
      expect(row).toBeObject();
    }
  });
});

describe("databases/:dbName/tables/:tableName/indexes", () => {
  it("should return correct data from PostgreSQL", async () => {
    const res = await fetch(
      "/api/databases/:dbName/tables/:tableName/indexes",
      {
        params: {
          dbName: "public",
          tableName: testDBName,
        },
        method: "GET",
        headers: {
          cookie: pgCookie,
        },
      },
    );
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data).toBeArray();

    expect(res.data[0].relname).toBeString();
    expect(res.data[0].key).toBeString();
    expect(res.data[0].type).toBeString();
    expect(res.data[0].columns).toBeArray();
    expect(res.data[0].columns[0]).toBeString();
  });

  it("should return correct data from MySQL", async () => {
    const res = await fetch(
      "/api/databases/:dbName/tables/:tableName/indexes",
      {
        params: {
          dbName: "test_db",
          tableName: testDBName,
        },
        method: "GET",
        headers: {
          cookie: mysqlCookie,
        },
      },
    );
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data).toBeArray();

    expect(res.data[0].relname).toBeString();
    expect(res.data[0].key).toBeString();
    expect(res.data[0].type).toBeString();
    expect(res.data[0].columns).toBeArray();
    expect(res.data[0].columns[0]).toBeString();
  });
});

describe("databases/:dbName/tables/:tableName/columns", () => {
  it("should return correct data from PostgreSQL", async () => {
    const res = await fetch(
      "/api/databases/:dbName/tables/:tableName/columns",
      {
        params: {
          dbName: "public",
          tableName: testDBName,
        },
        method: "GET",
        headers: {
          cookie: pgCookie,
        },
      },
    );
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data).toBeArray();

    for (const row of res.data) {
      expect(row).toContainAllKeys([
        "column_name",
        "data_type",
        "udt_name",
        "column_comment",
      ]);
      expect(row.column_name).toBeString();
      expect(row.data_type).toBeString();
      expect(row.udt_name).toBeString();
      expect(
        row.column_comment === null || typeof row.column_comment === "string",
      ).toBeTrue();
    }
  });

  it("should return correct data from MySQL", async () => {
    const res = await fetch(
      "/api/databases/:dbName/tables/:tableName/columns",
      {
        params: {
          dbName: "test_db",
          tableName: testDBName,
        },
        method: "GET",
        headers: {
          cookie: mysqlCookie,
        },
      },
    );

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data).toBeArray();

    for (const row of res.data) {
      expect(row).toContainAllKeys([
        "column_name",
        "data_type",
        "udt_name",
        "column_comment",
      ]);
      expect(row.column_name).toBeString();
      expect(row.data_type).toBeString();
      expect(row.udt_name).toBeString();
      expect(
        row.column_comment === null || typeof row.column_comment === "string",
      ).toBeTrue();
    }
  });
});

describe("databases/:dbName/tables/:tableName/foreign-keys", () => {
  it("should return correct data from PostgreSQL", async () => {
    const res = await fetch(
      "/api/databases/:dbName/tables/:tableName/foreign-keys",
      {
        params: {
          dbName: "public",
          tableName: "orders",
        },
        method: "GET",
        headers: {
          cookie: pgCookie,
        },
      },
    );
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data).toBeArray();

    for (const row of res.data) {
      expect(row).toContainAllKeys([
        "conname",
        "deferrable",
        "definition",
        "source",
        "ns",
        "on_delete",
        "on_update",
        "table",
        "target",
      ]);
      expect(row.conname).toBeString();
      expect(row.deferrable).toBeBoolean();
      expect(row.definition).toBeString();
      expect(row.source).toBeArray();
      expect(row.ns).toBeString();
      expect(row.on_delete).toBeString();
      expect(row.on_update).toBeString();
      expect(row.table).toBeString();
      expect(row.target).toBeArray();
    }
  });
  it("should return correct data from MySQL", async () => {
    const res = await fetch(
      "/api/databases/:dbName/tables/:tableName/foreign-keys",
      {
        params: {
          dbName: "test_db",
          tableName: "orders",
        },
        method: "GET",
        headers: {
          cookie: mysqlCookie,
        },
      },
    );

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data).toBeArray();

    for (const row of res.data) {
      expect(row).toContainAllKeys([
        "conname",
        "deferrable",
        "definition",
        "source",
        "ns",
        "on_delete",
        "on_update",
        "table",
        "target",
      ]);
      expect(row.conname).toBeString();
      expect(row.deferrable).toBeBoolean();
      expect(row.definition).toBeString();
      expect(row.source).toBeArray();
      expect(row.ns).toBeString();
      expect(row.on_delete).toBeString();
      expect(row.on_update).toBeString();
      expect(row.table).toBeString();
      expect(row.target).toBeArray();
    }
  });
});

describe("raw", () => {
  it("should return correct data from PostgreSQL", async () => {
    const query = "SELECT * FROM information_schema.tables;";
    const res = await fetch("/api/raw", {
      method: "POST",
      headers: {
        cookie: pgCookie,
      },
      body: {
        query,
      },
    });
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data.count).toBeNumber();
    expect(res.data.count).toBeGreaterThan(0);

    expect(res.data.data).toBeArray();
    expect(res.data.data.length).toBeGreaterThan(0);
    expect(res.data.data[0]).toBeObject();
  });
  it("should return correct data from MySQL", async () => {
    const query = "SELECT * FROM information_schema.tables;";
    const res = await fetch("/api/raw", {
      method: "POST",
      headers: {
        cookie: mysqlCookie,
      },
      body: {
        query,
      },
    });
    expect(res.status).toEqual(200);

    expect(res.data).not.toEqual("Unauthorized");
    if (res.data === "Unauthorized") return;

    expect(res.data).toBeDefined();
    if (!res.data) return;

    expect(res.data.count).toBeNumber();
    expect(res.data.count).toBeGreaterThan(0);

    expect(res.data.data).toBeArray();
    expect(res.data.data.length).toBeGreaterThan(0);
    expect(res.data.data[0]).toBeObject();
  });
});
