import { getValuable } from "@/lib/utils";
import { dbInstance } from "@/services/db/db.instance";
import type {
  DatabasesResponse,
  GetTableColumnsArgs,
  GetTableDataArgs,
  GetTableDataResponse,
  GetTableForeignKeysArgs,
  GetTableIndexesArgs,
  GetTablesListArgs,
  GetTablesListResponse,
  LoginArgs,
  LoginResponse,
  QueryRawSqlArgs,
  QueryRawSqlResponse,
  TableColumns,
  TableForeignKeys,
  TableIndexes,
} from "@/services/db/db.types";

class DbService {
  login(data: LoginArgs) {
    return dbInstance
      .post("api/auth/login", { json: data })
      .json<LoginResponse>();
  }

  getDatabasesList() {
    return dbInstance.get("api/databases").json<DatabasesResponse>();
  }

  getTablesList({ dbName, sortDesc, sortField }: GetTablesListArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables`, {
        searchParams: getValuable({ sortField, sortDesc }),
      })
      .json<GetTablesListResponse>();
  }

  getTableData({
    dbName,
    tableName,
    page,
    perPage,
    sortField,
    sortDesc,
  }: GetTableDataArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables/${tableName}/data`, {
        searchParams: getValuable({ perPage, page, sortField, sortDesc }),
      })
      .json<GetTableDataResponse>();
  }

  getTableColumns({ dbName, tableName }: GetTableColumnsArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables/${tableName}/columns`)
      .json<TableColumns>();
  }

  getTableIndexes({ dbName, tableName }: GetTableIndexesArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables/${tableName}/indexes`)
      .json<TableIndexes>();
  }

  getTableForeignKeys({ dbName, tableName }: GetTableForeignKeysArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables/${tableName}/foreign-keys`)
      .json<TableForeignKeys>();
  }

  queryRawSql({ query }: QueryRawSqlArgs) {
    return dbInstance
      .post("api/raw", {
        json: { query },
      })
      .json<QueryRawSqlResponse>();
  }
}

export const dbService = new DbService();
