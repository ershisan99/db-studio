export type LoginArgs =
  | {
      username: string;
      password: string;
      host: string;
      type: string;
      port: string;
      ssl: string;
      database: string;
    }
  | {
      connectionString: string;
    };

export type LoginResponse = {
  success: boolean;
};

export type DatabasesResponse = Array<string>;

// Tables List
export type GetTablesListArgs = {
  dbName: string;
  sortField?: string;
  sortDesc?: boolean;
};
export type TableInfo = {
  comments: string;
  index_size: number;
  indexes: string;
  owner: string;
  primary_key: string;
  row_count: number;
  schema_name: string;
  table_name: string;
  table_size: number;
  total_size: number;
};
export type GetTablesListResponse = TableInfo[];

// Table Data
export type GetTableDataArgs = {
  tableName: string;
  dbName: string;
  perPage?: number;
  page?: number;
  sortField?: string;
  sortDesc?: boolean;
};

export type GetTableDataResponse = {
  count: number;
  data: Array<Record<string, any>>;
};

// Table Columns
export type GetTableColumnsArgs = {
  tableName: string;
  dbName: string;
};

export type TableColumn = {
  column_name: string;
  data_type: string;
  udt_name: string;
  column_comment?: any;
};
export type TableColumns = TableColumn[];

// Table Indexes
export type GetTableIndexesArgs = {
  tableName: string;
  dbName: string;
};

export type TableIndexEntry = {
  key: string;
  type: string;
  columns: string[];
  descs: any[];
  lengths: any[];
};
export type TableIndexes = TableIndexEntry[];

// Table Foreign Keys
export type GetTableForeignKeysArgs = {
  tableName: string;
  dbName: string;
};

export type QueryRawSqlArgs = {
  query: string;
};

export type QueryRawSqlResponse = Array<Record<string, any>>;

export type TableForeignKey = {
  conname: string;
  deferrable: boolean;
  definition: string;
  source: string[];
  ns: string;
  table: string;
  target: string[];
  on_delete: string;
  on_update: string;
};

export type TableForeignKeys = TableForeignKey[];
