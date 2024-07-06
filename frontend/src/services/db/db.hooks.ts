import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { DB_QUERY_KEYS } from "./db.query-keys";
import { dbService } from "./db.service";
import type { GetTableDataArgs, GetTablesListArgs } from "./db.types";

export const useDatabasesListQuery = () => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.DATABASES.ALL],
    queryFn: () => dbService.getDatabasesList(),
    placeholderData: keepPreviousData,
  });
};

export const useTablesListQuery = (args: GetTablesListArgs) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.ALL, args],
    queryFn: () => dbService.getTablesList(args),
    enabled: !!args.dbName,
    placeholderData: keepPreviousData,
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

export const useTableColumnsQuery = (args: { name?: string }) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.COLUMNS, args],
    queryFn: () => dbService.getTableColumns(args.name ?? ""),
    placeholderData: keepPreviousData,
    enabled: !!args.name,
  });
};

export const useTableIndexesQuery = (args: { name?: string }) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.INDEXES, args],
    queryFn: () => dbService.getTableIndexes(args.name ?? ""),
    enabled: !!args.name,
  });
};

export const useTableForeignKeysQuery = (args: { name?: string }) => {
  return useQuery({
    queryKey: [DB_QUERY_KEYS.TABLES.FOREIGN_KEYS, args],
    queryFn: () => dbService.getTableForeignKeys(args.name ?? ""),
    enabled: !!args.name,
  });
};
