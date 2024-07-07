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
  TableColumns,
  TableForeignKeys,
  TableIndexes,
} from "@/services/db/db.types";

class DbService {
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
}

export const dbService = new DbService();
