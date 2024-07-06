import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import postgres from "postgres";
const DB_URL = Bun.env.DB_URL;

if (!DB_URL) {
  console.error("DB_URL not found in environment variables");
  process.exit(1);
}

const sql = postgres(DB_URL);

const [{ version }] = await sql`SELECT version()`;
console.log("pg version: ", version);

const app = new Elysia({ prefix: "/api" })
  .get("/", () => "Hello Elysia")
  .get("/databases", async () => {
    const databases = await getDatabases();
    return new Response(JSON.stringify(databases, null, 2)).json();
  })
  .get("/databases/:dbName/tables", async ({ query, params }) => {
    const { sortField, sortDesc } = query;
    const { dbName } = params;

    const tables = await getTables(dbName, sortField, sortDesc === "true");

    return new Response(JSON.stringify(tables, null, 2)).json();
  })
  .get("databases/:dbName/tables/:name/data", async ({ params, query }) => {
    const { name, dbName } = params;
    const { perPage = "50", page = "0" } = query;

    const offset = (
      Number.parseInt(perPage, 10) * Number.parseInt(page, 10)
    ).toString();

    const rows = sql`
            SELECT COUNT(*)
            FROM ${sql(dbName)}.${sql(name)}`;

    const tables = sql`
            SELECT *
            FROM ${sql(dbName)}.${sql(name)}
            LIMIT ${perPage} OFFSET ${offset}`;

    const [[count], data] = await Promise.all([rows, tables]);

    return {
      count: count.count,
      data,
    };
  })
  .get("db/tables/:name/columns", async ({ params, query }) => {
    const { name } = params;

    const columns = await getColumns(name);
    return new Response(JSON.stringify(columns, null, 2)).json();
  })
  .get("db/tables/:name/indexes", async ({ params, query }) => {
    const { name } = params;

    const indexes = await getIndexes(name);
    return new Response(JSON.stringify(indexes, null, 2)).json();
  })
  .get("db/tables/:name/foreign-keys", async ({ params, query }) => {
    const { name } = params;

    const foreignKeys = await getForeignKeys(name);
    return new Response(JSON.stringify(foreignKeys, null, 2)).json();
  })
  .use(cors())
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

async function getIndexes(table: string) {
  const returnObj = {};

  const [tableOidResult] = await sql`
      SELECT oid 
      FROM pg_class 
      WHERE relname = ${table}
    `;

  const tableOid = tableOidResult.oid;

  const columnsResult = await sql`
      SELECT attnum, attname 
      FROM pg_attribute 
      WHERE attrelid = ${tableOid}
      AND attnum > 0
    `;

  const columns = {};
  columnsResult.forEach((row) => {
    columns[row.attnum] = row.attname;
  });

  const indexResult = await sql`
      SELECT 
        relname, 
        indisunique::int, 
        indisprimary::int, 
        indkey, 
        (indpred IS NOT NULL)::int as indispartial 
      FROM pg_index i
      JOIN pg_class ci ON ci.oid = i.indexrelid 
      WHERE i.indrelid = ${tableOid}
    `;

  return indexResult.map((row) => {
    return {
      relname: row.relname,
      key: row.relname,
      type: row.indispartial
        ? "INDEX"
        : row.indisprimary
          ? "PRIMARY"
          : row.indisunique
            ? "UNIQUE"
            : "INDEX",
      columns: row.indkey.split(" ").map((indkey) => columns[indkey]),
    };
  });
}

async function getColumns(tableName: string) {
  return await sql`
      SELECT
          cols.column_name,
          cols.data_type,
          cols.udt_name,
          pgd.description AS column_comment
      FROM
          information_schema.columns AS cols
              LEFT JOIN
          pg_catalog.pg_statio_all_tables AS st ON st.relname = cols.table_name
              LEFT JOIN
          pg_catalog.pg_description AS pgd ON pgd.objoid = st.relid AND pgd.objsubid = cols.ordinal_position
      WHERE
          cols.table_name = ${tableName}
      ORDER BY
          cols.ordinal_position;
    `;
}

async function getForeignKeys(table: string) {
  const result = await sql`
      SELECT 
        conname, 
        condeferrable::int AS deferrable, 
        pg_get_constraintdef(oid) AS definition
      FROM 
        pg_constraint
      WHERE 
        conrelid = (
          SELECT pc.oid 
          FROM pg_class AS pc 
          INNER JOIN pg_namespace AS pn ON (pn.oid = pc.relnamespace) 
          WHERE pc.relname = ${table}
        )
        AND contype = 'f'::char
      ORDER BY conkey, conname
    `;

  return result.map((row) => {
    const match = row.definition.match(
      /FOREIGN KEY\s*\((.+)\)\s*REFERENCES (.+)\((.+)\)(.*)$/iy,
    );
    console.log(match);
    console.log("match[0]", match[0]);
    console.log("match[1]", match[1]);
    console.log("match[2]", match[2]);
    if (match) {
      const sourceColumns = match[1]
        .split(",")
        .map((col) => col.replaceAll('"', "").trim());
      const targetTableMatch = match[2].match(
        /^(("([^"]|"")+"|[^"]+)\.)?"?("([^"]|"")+"|[^"]+)$/,
      );
      console.log("targetTableMatch", targetTableMatch);
      const targetTable = targetTableMatch ? targetTableMatch[0].trim() : null;
      const targetColumns = match[3]
        .split(",")
        .map((col) => col.replaceAll('"', "").trim());
      const { onDelete, onUpdate } = getActions(match[4]);
      return {
        conname: row.conname,
        deferrable: Boolean(row.deferrable),
        definition: row.definition,
        source: sourceColumns,
        ns: targetTableMatch
          ? targetTableMatch[0].replaceAll('"', "").trim()
          : null,
        table: targetTable.replaceAll('"', ""),
        target: targetColumns,
        on_delete: onDelete ?? "NO ACTION",
        on_update: onUpdate ?? "NO ACTION",
      };
    }
  });
}

function getActions(matchString: string) {
  const onActions = "RESTRICT|NO ACTION|CASCADE|SET NULL|SET DEFAULT";
  const onDeleteRegex = new RegExp(`ON DELETE (${onActions})`);
  const onUpdateRegex = new RegExp(`ON UPDATE (${onActions})`);

  const onDeleteMatch = matchString.match(onDeleteRegex);
  const onUpdateMatch = matchString.match(onUpdateRegex);

  const onDeleteAction = onDeleteMatch ? onDeleteMatch[1] : "NO ACTION";
  const onUpdateAction = onUpdateMatch ? onUpdateMatch[1] : "NO ACTION";

  return {
    onDelete: onDeleteAction,
    onUpdate: onUpdateAction,
  };
}

async function getTables(
  dbName: string,
  sortField?: string,
  sortDesc?: boolean,
) {
  const tables = await sql`
    WITH primary_keys AS (SELECT pg_class.relname     AS table_name,
                                 pg_namespace.nspname AS schema_name,
                                 pg_attribute.attname AS primary_key
                          FROM   pg_index
                               JOIN
                               pg_class ON pg_class.oid = pg_index.indrelid
                               JOIN
                               pg_attribute ON pg_attribute.attrelid = pg_class.oid AND
                                               pg_attribute.attnum = ANY (pg_index.indkey)
                               JOIN
                               pg_namespace ON pg_namespace.oid = pg_class.relnamespace
                          WHERE pg_index.indisprimary)
    SELECT t.schemaname                                                                         AS schema_name,
           t.tablename                                                                          AS table_name,
           pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)) AS total_size,
           pg_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename))       AS table_size,
           pg_total_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename)) -
           pg_relation_size(quote_ident(t.schemaname) || '.' || quote_ident(t.tablename))       AS index_size,
           COALESCE(
                   (SELECT obj_description((quote_ident(t.schemaname) || '.' || quote_ident(t.tablename))::regclass)),
                   ''
           )                                                                                    AS comments,
           (SELECT reltuples::bigint
            FROM pg_class c
                     JOIN pg_namespace n ON n.oid = c.relnamespace
            WHERE c.relname = t.tablename
              AND n.nspname = t.schemaname)                                                     AS row_count,
           (SELECT string_agg(indexname, ', ')
            FROM pg_indexes
            WHERE tablename = t.tablename
              AND schemaname = t.schemaname)                                                    AS indexes,
           t.tableowner                                                                         AS owner,
           COALESCE(
                   (SELECT string_agg(pk.primary_key, ', ')
                    FROM primary_keys pk
                    WHERE pk.schema_name = t.schemaname
                      AND pk.table_name = t.tablename),
                   ''
           )                                                                                    AS primary_key
    FROM pg_tables t
    WHERE t.schemaname = ${dbName}

    ORDER BY ${
      sortField
        ? sql`${sql(sortField)}
                             ${sortDesc ? sql`DESC` : sql`ASC`}`
        : sql`t.schemaname, t.tablename`
    }`;

  return tables.map((table) => ({
    ...table,
    total_size: Number.parseInt(table.total_size, 10),
    table_size: Number.parseInt(table.table_size, 10),
    index_size: Number.parseInt(table.index_size, 10),
    row_count: Number.parseInt(table.row_count, 10),
  }));
}

async function getDatabases() {
  const result = await sql`
    SELECT nspname
    FROM pg_catalog.pg_namespace;`;

  return result.map(({ nspname }) => nspname);
}
