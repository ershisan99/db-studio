export type WithSort<T> = T & { sortField?: string; sortDesc?: boolean };
export type WithPagination<T> = T & { perPage: number; page: number };
export type WithSortPagination<T> = WithPagination<WithSort<T>>;

export type Credentials =
  | {
      username: string;
      password: string;
      host: string;
      type: string;
      port: string;
      database: string;
      ssl: string;
    }
  | {
      connectionString: string;
    };

export interface Driver {
  getAllDatabases(credentials: Credentials): Promise<string[]>;
  getAllTables(
    credentials: Credentials,
    args: WithSort<{ dbName: string }>,
  ): Promise<any[]>;
  getTableData(
    credentials: Credentials,
    args: WithSortPagination<{
      tableName: string;
      dbName: string;
      whereQuery?: string;
    }>,
  ): Promise<{
    count: number;
    data: Record<string, any>[];
  }>;
  getTableColumns(
    credentials: Credentials,
    args: { dbName: string; tableName: string },
  ): Promise<any[]>;
  getTableIndexes(
    credentials: Credentials,
    args: { dbName: string; tableName: string },
  ): Promise<any[]>;
  getTableForeignKeys(
    credentials: Credentials,
    args: { dbName: string; tableName: string },
  ): Promise<any[]>;
  executeQuery(
    credentials: Credentials,
    query: string,
  ): Promise<{
    count: number;
    data: Record<string, any>[];
  }>;
}
