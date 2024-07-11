import mysql from "mysql2/promise";
import type {
  Credentials,
  Driver,
  WithSort,
  WithSortPagination,
} from "./driver.interface";

export class MySQLDriver implements Driver {
  parseCredentials({
    username,
    password,
    host,
    port,
    database,
  }: {
    username: string;
    password: string;
    host: string;
    port: string;
    database: string;
    ssl: string;
  }) {
    return {
      user: username,
      password,
      host,
      port: Number.parseInt(port, 10),
      database,
      ssl: {
        rejectUnauthorized: false,
      },
    };
  }

  private async queryRunner(credentials: Credentials) {
    let connection: mysql.Connection;
    try {
      if ("connectionString" in credentials) {
        connection = await mysql.createConnection(credentials.connectionString);
      } else {
        const creds = this.parseCredentials(credentials);
        console.log(creds);
        connection = await mysql.createConnection(creds);
      }
    } catch (error) {
      console.error(error);
      throw new Error(`Invalid connection string, ${JSON.stringify(error)}`);
    }

    return connection;
  }

  async getAllDatabases(credentials: Credentials) {
    console.log("Get all databases");
    const connection = await this.queryRunner(credentials);

    const databases: Array<string> = [];
    const [databases_raw] = await connection.query("SHOW DATABASES;"); // Get all databases

    for (const db of Array.from(databases_raw)) {
      databases.push(db.Database);
    }
    connection.destroy();
    return databases;
  }

  async getAllTables(
    credentials: Credentials,
    {
      sortDesc,
      sortField = "schema_name",
      dbName,
    }: WithSort<{ dbName: string }>,
  ) {
    const connection = await this.queryRunner(credentials);

    let tablesQuery = `
      SELECT
        TABLE_NAME as table_name,
        TABLE_SCHEMA as schema_name,
        TABLE_ROWS as row_count,
        (DATA_LENGTH + INDEX_LENGTH) as total_size,
        DATA_LENGTH as table_size,
        INDEX_LENGTH as index_size,
        TABLE_COMMENT as comments
      FROM
        information_schema.tables
      WHERE
        table_schema = ?
    `;
    if (sortField) {
      tablesQuery += ` ORDER BY ${sortField} ${sortDesc ? "DESC" : "ASC"}`;
    }

    const [tables] = await connection.execute(tablesQuery, [dbName]);

    const primaryKeysQuery = `
    SELECT 
      TABLE_NAME,
      COLUMN_NAME
    FROM 
      information_schema.KEY_COLUMN_USAGE
    WHERE 
      TABLE_SCHEMA = ? AND 
      CONSTRAINT_NAME = 'PRIMARY';
  `;

    const [primaryKeys] = await connection.execute(primaryKeysQuery, [dbName]);

    const indexesQuery = `
    SELECT 
      TABLE_NAME
    FROM 
      information_schema.STATISTICS
    WHERE 
      TABLE_SCHEMA = ?;
  `;

    const [indexes] = await connection.execute(indexesQuery, [dbName]);

    const formattedTables = tables.map((table) => {
      const primaryKey = primaryKeys
        .filter((pk) => pk.TABLE_NAME === table.table_name)
        .map((pk) => pk.COLUMN_NAME)
        .join(", ");

      const tableIndexes = indexes
        .filter((idx) => idx.TABLE_NAME === table.table_name)
        .map((idx) => idx.TABLE_NAME)
        .join(", ");

      return {
        comments: table.comments,
        index_size: table.index_size,
        indexes: tableIndexes,
        owner: null, // No information on table owner in `information_schema`
        primary_key: primaryKey,
        row_count: table.row_count,
        table_name: table.table_name,
        table_size: table.table_size,
        total_size: table.total_size,
        schema_name: table.schema_name,
      };
    });

    connection.destroy();
    return formattedTables;
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
    }: WithSortPagination<{ tableName: string; dbName: string }>,
  ) {
    const connection = await this.queryRunner(credentials);

    const offset = perPage * page;

    // Get the count of rows
    const [rows] = await connection.execute(
      `SELECT COUNT(*) as count FROM ${dbName}.${tableName}`,
    );
    if ("fieldCount" in rows) {
      return;
    }

    const count = rows[0].count;
    // Construct the query for table data with optional sorting
    let query = `SELECT * FROM ${dbName}.${tableName}`;
    const params = [];

    if (sortField) {
      query += ` ORDER BY ${sortField} ${sortDesc ? "DESC" : "ASC"}`;
    }
    console.log(perPage, offset, page);
    query += ` LIMIT ${perPage} OFFSET ${offset}`;
    params.push(perPage.toString());
    params.push(offset.toString());
    // Execute the query with parameters
    const [data] = await connection.execute(query);
    await connection.end();

    return {
      count: count,
      data,
    };
  }

  async getTableColumns(
    credentials: Credentials,
    { tableName, dbName }: { dbName: string; tableName: string },
  ) {
    const connection = await this.queryRunner(credentials);

    const [rows] = await connection.execute(
      `
      SELECT
        COLUMN_NAME as column_name,
        DATA_TYPE as data_type,
        COLUMN_TYPE as udt_name,
        COLUMN_COMMENT as column_comment
      FROM
        information_schema.COLUMNS
      WHERE
        TABLE_SCHEMA = ?
        AND TABLE_NAME = ?
    `,
      [dbName, tableName],
    );

    await connection.end();

    return (rows as any[]).map((row) => ({
      column_name: row.column_name,
      data_type: row.data_type,
      udt_name: row.udt_name,
      column_comment: row.column_comment,
    }));
  }

  async getTableIndexes(
    credentials: Credentials,
    { dbName, tableName }: { dbName: string; tableName: string },
  ) {
    const connection = await this.queryRunner(credentials);

    try {
      const [rows] = await connection.execute(
        `
      SELECT
        index_name AS relname,
        index_name AS \`key\`,
        CASE
          WHEN non_unique = 0 AND index_name = 'PRIMARY' THEN 'PRIMARY'
          WHEN non_unique = 0 THEN 'UNIQUE'
          ELSE 'INDEX'
        END AS type,
        GROUP_CONCAT(column_name ORDER BY seq_in_index) AS columns
      FROM
        information_schema.statistics
      WHERE
        table_schema = ?
        AND table_name = ?
      GROUP BY
        index_name, non_unique
    `,
        [dbName, tableName],
      );

      await connection.end();

      return (rows as any[]).map((row) => ({
        relname: row.relname,
        key: row.key,
        type: row.type,
        columns: row.columns.split(","),
      }));
    } catch (error) {
      console.error("Error fetching indexes:", error);
      await connection.end();
      throw error;
    }
  }

  async getTableForeignKeys(
    credentials: Credentials,
    { dbName, tableName }: { dbName: string; tableName: string },
  ) {
    const connection = await this.queryRunner(credentials);

    try {
      const [rows] = await connection.execute(
        `
      SELECT
        rc.CONSTRAINT_NAME as conname,
        rc.UPDATE_RULE as on_update,
        rc.DELETE_RULE as on_delete,
        kcu.COLUMN_NAME as source,
        kcu.REFERENCED_TABLE_NAME as \`table\`,
        kcu.REFERENCED_COLUMN_NAME as target
      FROM
        information_schema.REFERENTIAL_CONSTRAINTS rc
      JOIN
        information_schema.KEY_COLUMN_USAGE kcu
      ON
        rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE
        kcu.TABLE_SCHEMA = ?
        AND kcu.TABLE_NAME = ?
    `,
        [dbName, tableName],
      );

      await connection.end();

      const foreignKeys: { [key: string]: ForeignKeyInfo } = {};
      (rows as any[]).forEach((row) => {
        if (!foreignKeys[row.conname]) {
          foreignKeys[row.conname] = {
            conname: row.conname,
            deferrable: false,
            definition: `FOREIGN KEY (${row.source}) REFERENCES ${row.table}(${row.target})`,
            source: [],
            ns: row.table,
            table: row.table,
            target: [],
            on_delete: row.on_delete,
            on_update: row.on_update,
          };
        }
        foreignKeys[row.conname].source.push(row.source);
        foreignKeys[row.conname].target.push(row.target);
      });

      return Object.values(foreignKeys);
    } catch (error) {
      console.error("Error fetching foreign keys:", error);
      await connection.end();
      throw error;
    }
  }

  async executeQuery(credentials: Credentials, query: string) {
    const connection = await this.queryRunner(credentials);

    const [rows, fields] = await connection.execute(query);

    await connection.end();

    return {
      count: rows?.length,
      data: rows,
    };
  }
}

export const mySQLDriver = new MySQLDriver();
