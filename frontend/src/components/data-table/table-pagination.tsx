import { Button } from '@/components/ui/button'

export interface TablePaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  disabled?: boolean
}

export function TablePagination({
  page,
  pageCount,
  onPageChange,
  disabled = false,
}: TablePaginationProps) {
  return (
    <nav
      aria-label="Paginação da tabela"
      className="flex items-center justify-between gap-4"
    >
      <p aria-live="polite" className="text-sm text-muted-foreground">
        {pageCount > 0 ? `Página ${page} de ${pageCount}` : 'Nenhuma página'}
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page <= 1 || pageCount <= 0}
          onClick={() => onPageChange(page - 1)}
        >
          Anterior
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={disabled || page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Próxima
        </Button>
      </div>
    </nav>
  )
}
