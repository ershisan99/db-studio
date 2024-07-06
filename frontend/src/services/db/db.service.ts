import { getValuable } from "@/lib/utils";
import { dbInstance } from "@/services/db/db.instance";
import type {
  DatabasesResponse,
  GetTableDataArgs,
  GetTableDataResponse,
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

  getTableData({ dbName, tableName, page, perPage }: GetTableDataArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables/${tableName}/data`, {
        searchParams: getValuable({ perPage, page }),
      })
      .json<GetTableDataResponse>();
  }

  getTableColumns(name: string) {
    return dbInstance.get(`api/db/tables/${name}/columns`).json<TableColumns>();
  }

  getTableIndexes(name: string) {
    return dbInstance.get(`api/db/tables/${name}/indexes`).json<TableIndexes>();
  }

  getTableForeignKeys(name: string) {
    return dbInstance
      .get(`api/db/tables/${name}/foreign-keys`)
      .json<TableForeignKeys>();
  }
}

export const dbService = new DbService();
