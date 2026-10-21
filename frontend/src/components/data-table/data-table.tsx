import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, TableOptions } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

export interface DataTableProps<TData, TValue = unknown> {
  data: TData[]
  columns: ColumnDef<TData, TValue>[]
  toolbar?: ReactNode
  footer?: ReactNode
  caption?: ReactNode
  isLoading?: boolean
  loadingMessage?: string
  emptyMessage?: string
  getRowId?: TableOptions<TData>['getRowId']
  className?: string
  contained?: boolean
}

export function DataTable<TData, TValue = unknown>({
  data,
  columns,
  toolbar,
  footer,
  caption,
  isLoading = false,
  loadingMessage = 'Carregando...',
  emptyMessage = 'Nenhum resultado encontrado.',
  getRowId,
  className,
  contained = false,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getRowId,
    getCoreRowModel: getCoreRowModel(),
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
  })
  const rows = table.getRowModel().rows
  const columnCount = Math.max(table.getVisibleLeafColumns().length, 1)

  return (
    <div
      data-slot="data-table"
      className={cn(
        'flex w-full min-w-0 flex-col',
        contained ? 'gap-0 overflow-hidden rounded-xl border' : 'gap-4',
        className,
      )}
    >
      {toolbar != null && (
        <div
          data-slot="data-table-toolbar"
          className={cn(contained && 'border-b p-4')}
        >
          {toolbar}
        </div>
      )}
      <div className={cn('overflow-hidden', !contained && 'rounded-xl border')}>
        <Table aria-busy={isLoading}>
          {caption != null && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} colSpan={header.colSpan}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  <span role="status">{loadingMessage}</span>
                </TableCell>
              </TableRow>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columnCount} className="h-24 text-center">
                  <span role="status">{emptyMessage}</span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {footer != null && (
        <div
          data-slot="data-table-footer"
          className={cn(contained && 'border-t p-4')}
        >
          {footer}
        </div>
      )}
    </div>
  )
}
