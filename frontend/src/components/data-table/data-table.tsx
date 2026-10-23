import {
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import type { ColumnDef, TableOptions } from '@tanstack/react-table'
import type { ReactNode } from 'react'
import { Skeleton } from '@/components/ui/skeleton'
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
  emptyContent?: ReactNode
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
  emptyContent,
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
            {isLoading ? (
              <TableRow>
                <TableHead colSpan={columnCount}>
                  <span role="status">{loadingMessage}</span>
                </TableHead>
              </TableRow>
            ) : (
              table.getHeaderGroups().map((headerGroup) => (
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
              ))
            )}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }, (_, index) => (
                <TableRow key={index} aria-hidden="true">
                  {table.getVisibleLeafColumns().map((column) => (
                    <TableCell key={column.id} className="h-12">
                      <Skeleton className="h-4 w-24 max-w-full motion-reduce:animate-none" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
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
                  {emptyContent ?? <span role="status">{emptyMessage}</span>}
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
