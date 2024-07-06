import { RowData } from '@tanstack/react-table'

declare module '@tanstack/table-core' {
  // @ts-expect-error - this is a global module augmentation
  interface ColumnMeta<TData extends RowData> {
    className?: string
  }
}
