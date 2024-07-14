import postgres, { type Options } from "postgres";
import type {
  Credentials,
  Driver,
  WithSort,
  WithSortPagination,
} from "./driver.interface";

export class PostgresDriver implements Driver {
  private parseSsl(ssl: string) {
    switch (ssl) {
      case "false":
        return false;
      case "true":
        return true;
      default:
        return ssl as Options<any>["ssl"];
    }
  }

  parseCredentials({
    username,
    password,
    host,
    type,
    port,
    database,
    ssl,
  }: {
    username: string;
    password: string;
    host: string;
    type: string;
    port: string;
    database: string;
    ssl: string;
  }) {
    return {
      username,
      password,
      host,
      type,
      port: Number.parseInt(port, 10),
      database,
      ssl: this.parseSsl(ssl),
    };
  }

  private async queryRunner(credentials: Credentials) {
    let sql: postgres.Sql<any>;
    if ("connectionString" in credentials) {
      sql = postgres(credentials.connectionString);
    } else {
      sql = postgres("", this.parseCredentials(credentials));
    }

    return sql;
  }
  private getActions(matchString: string) {
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
  async getAllDatabases(credentials: Credentials) {
    const sql = await this.queryRunner(credentials);

    const result = await sql`
    SELECT nspname
    FROM pg_catalog.pg_namespace;`;

    void sql.end();

    return result.map(({ nspname }) => nspname);
  }

  async getAllTables(
    credentials: Credentials,
    { sortDesc, sortField, dbName }: WithSort<{ dbName: string }>,
  ) {
    const sql = await this.queryRunner(credentials);

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

    void sql.end();
    return tables.map((table) => ({
      ...table,
      total_size: Number.parseInt(table.total_size, 10),
      table_size: Number.parseInt(table.table_size, 10),
      index_size: Number.parseInt(table.index_size, 10),
      row_count: Number.parseInt(table.row_count, 10),
    }));
  }

  async getTableData(
    credentials: Credentials,
    {
      tableName,
      dbName,
      perPage,
      page,
      sortDesc,
      sortField,
      whereQuery,
    }: WithSortPagination<{
      tableName: string;
      dbName: string;
      whereQuery?: string;
    }>,
  ) {
    const sql = await this.queryRunner(credentials);

    const offset = (perPage * page).toString();

    const rowsQuery = `
    SELECT COUNT(*)
    FROM "${dbName}"."${tableName}"
    ${whereQuery ? `WHERE ${whereQuery}` : ""}`;

    const tablesQuery = `
    SELECT *
    FROM "${dbName}"."${tableName}"
    ${whereQuery ? `WHERE ${whereQuery}` : ""}
    ${sortField ? `ORDER BY "${sortField}" ${sortDesc ? "DESC" : "ASC"}` : ""}
    LIMIT ${perPage} OFFSET ${offset}
    `;
    const rows = sql.unsafe(rowsQuery);
    const tables = sql.unsafe(tablesQuery);
    const [[count], data] = await Promise.all([rows, tables]);

    void sql.end();

    return {
      count: Number.parseInt(count.count, 10),
      data,
    };
  }

  async getTableColumns(
    credentials: Credentials,
    { tableName, dbName }: { dbName: string; tableName: string },
  ) {
    const sql = await this.queryRunner(credentials);

    const result = await sql`
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
      AND cols.table_schema = ${dbName}
      
      ORDER BY
          cols.ordinal_position;
    `;

    void sql.end();

    return result;
  }

  async getTableIndexes(
    credentials: Credentials,
    { dbName, tableName }: { dbName: string; tableName: string },
  ) {
    const sql = await this.queryRunner(credentials);

    const [tableOidResult] = await sql`
      SELECT oid 
      FROM pg_class
      WHERE relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = ${dbName})
      AND relname = ${tableName}
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

    void sql.end();

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

  async getTableForeignKeys(
    credentials: Credentials,
    { dbName, tableName }: { dbName: string; tableName: string },
  ) {
    const sql = await this.queryRunner(credentials);

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
          WHERE pc.relname = ${tableName}
          AND pn.nspname = ${dbName}
        )
        AND contype = 'f'::char
      ORDER BY conkey, conname
    `;

    void sql.end();

    return result.map((row) => {
      const match = row.definition.match(
        /FOREIGN KEY\s*\((.+)\)\s*REFERENCES (.+)\((.+)\)(.*)$/iy,
      );
      if (match) {
        const sourceColumns = match[1]
          .split(",")
          .map((col) => col.replaceAll('"', "").trim());
        const targetTableMatch = match[2].match(
          /^(("([^"]|"")+"|[^"]+)\.)?"?("([^"]|"")+"|[^"]+)$/,
        );
        const targetTable = targetTableMatch
          ? targetTableMatch[0].trim()
          : null;
        const targetColumns = match[3]
          .split(",")
          .map((col) => col.replaceAll('"', "").trim());
        const { onDelete, onUpdate } = this.getActions(match[4]);
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

  async executeQuery(credentials: Credentials, query: string) {
    const sql = await this.queryRunner(credentials);

    const result = await sql.unsafe(query);
    if ("count" in result && result.count !== undefined) {
      return [
        {
          count: result.count,
          data: result,
        },
      ];
    }
    return result.map((row) => ({
      count: row.count,
      data: row,
    }));
  }
}

export const postgresDriver = new PostgresDriver();
