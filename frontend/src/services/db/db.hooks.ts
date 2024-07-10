import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { HTTPError } from "ky";
import { toast } from "sonner";
import { DB_QUERY_KEYS } from "./db.query-keys";
import { dbService } from "./db.service";
import type {
  GetTableColumnsArgs,
  GetTableDataArgs,
  GetTableForeignKeysArgs,
  GetTableIndexesArgs,
  GetTablesListArgs,
} from "./db.types";

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: dbService.login,
    onSuccess: () => {
      void navigate({ to: "/" });
      void queryClient.invalidateQueries();
    },
  });
};

export const useDatabasesListQuery = () => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.DATABASES.ALL],
    queryFn: () => dbService.getDatabasesList(),
  });
};

export const useTablesListQuery = (args: GetTablesListArgs) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.ALL, args],
    queryFn: () => dbService.getTablesList(args),
    enabled: !!args.dbName,
  });
};

export const useTableDataQuery = (args: GetTableDataArgs) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.DATA, args],
    queryFn: () => dbService.getTableData(args),
    placeholderData: (previousData, previousQuery) => {
      if (
        typeof previousQuery?.queryKey[1] !== "string" &&
        (previousQuery?.queryKey[1].dbName !== args.dbName ||
          previousQuery?.queryKey[1].tableName !== args.tableName)
      ) {
        return undefined;
      }
      return previousData;
    },
    enabled: !!args.tableName && !!args.dbName,
  });
};

export const useTableColumnsQuery = (args: GetTableColumnsArgs) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.COLUMNS, args],
    queryFn: () => dbService.getTableColumns(args),
    placeholderData: (previousData, previousQuery) => {
      if (
        typeof previousQuery?.queryKey[1] !== "string" &&
        (previousQuery?.queryKey[1].dbName !== args.dbName ||
          previousQuery?.queryKey[1].tableName !== args.tableName)
      ) {
        return undefined;
      }
      return previousData;
    },
    enabled: !!args.tableName && !!args.dbName,
  });
};

export const useTableIndexesQuery = (args: GetTableIndexesArgs) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.INDEXES, args],
    queryFn: () => dbService.getTableIndexes(args),
    enabled: !!args.tableName && !!args.dbName,
  });
};

export const useTableForeignKeysQuery = (args: GetTableForeignKeysArgs) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.FOREIGN_KEYS, args],
    queryFn: () => dbService.getTableForeignKeys(args),
    enabled: !!args.tableName && !!args.dbName,
  });
};

export const useQueryRawSqlMutation = () => {
  return useMutation({
    onError: async (error) => {
      if (error instanceof HTTPError) {
        const errorJson = await error.response.json();
        console.log(errorJson);
        toast.error(errorJson.message);
        return;
      }
      toast.error(error.message);
    },
    mutationFn: dbService.queryRawSql,
  });
};
