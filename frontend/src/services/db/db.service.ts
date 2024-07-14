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
import { HTTPError } from "ky";
import { toast } from "sonner";

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
    whereQuery,
  }: GetTableDataArgs) {
    return dbInstance
      .get(`api/databases/${dbName}/tables/${tableName}/data`, {
        searchParams: getValuable({
          perPage,
          page,
          sortField,
          sortDesc,
          whereQuery,
        }),
      })
      .json<GetTableDataResponse>()
      .catch(async (error) => {
        if (error instanceof HTTPError) {
          const errorJson = await error.response.json();
          console.log(errorJson);
          toast.error(errorJson.message);
        } else {
          toast.error(error.message);
        }
        return { count: 0, data: [] };
      });
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
