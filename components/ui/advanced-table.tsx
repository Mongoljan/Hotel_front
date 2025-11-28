'use client';

import * as React from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  type VisibilityState,
} from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  ChevronDown, 
  Download, 
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Settings2,
  FileSpreadsheet
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

// Export column configuration type
export interface ExportColumn<TData> {
  header: string;
  getValue: (data: TData) => unknown;
}

interface AdvancedTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  title?: string | React.ReactNode;
  description?: string;
  onRowClick?: (row: TData) => void;
  actions?: React.ReactNode;
  enableExport?: boolean;
  enableColumnFilter?: boolean;
  enableGlobalSearch?: boolean;
  /** Custom export columns configuration. If not provided, uses default column-based export */
  exportColumns?: ExportColumn<TData>[];
  /** Filter function to determine which rows to export */
  exportRowFilter?: (data: TData) => boolean;
}

export function AdvancedTable<TData, TValue>({
  columns,
  data,
  searchKey = '',
  searchPlaceholder = 'Search...',
  title,
  description,
  onRowClick,
  actions,
  enableExport = true,
  enableColumnFilter = true,
  enableGlobalSearch = true,
  exportColumns,
  exportRowFilter,
}: AdvancedTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState('');

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
  });

  /**
   * Professional CSV Export with proper encoding and data handling
   * Uses exportColumns prop if provided, otherwise generates from visible table columns
   */
  const exportToCSV = () => {
    const rows = table.getRowModel().rows;
    
    // Helper function to escape CSV values
    const escapeCSV = (value: unknown): string => {
      if (value === null || value === undefined) return '';
      
      // Handle arrays - join with semicolon for readability
      if (Array.isArray(value)) {
        const joined = value
          .filter(v => v !== null && v !== undefined && v !== '')
          .join('; ');
        if (!joined) return '';
        return `"${joined.replace(/"/g, '""')}"`;
      }
      
      // Handle booleans
      if (typeof value === 'boolean') {
        return value ? 'Тийм' : 'Үгүй';
      }
      
      // Handle numbers
      if (typeof value === 'number') {
        return String(value);
      }
      
      // Handle objects - skip them (likely React components)
      if (typeof value === 'object') {
        return '';
      }
      
      // Handle strings - escape quotes and wrap if contains special chars
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Filter rows using custom filter or default filter
    const dataRows = rows.filter(row => {
      if (exportRowFilter) {
        return exportRowFilter(row.original);
      }
      // Default: exclude common non-data rows
      const original = row.original as Record<string, unknown>;
      return !original.isGroup && !original.isPreviewRow;
    });

    if (dataRows.length === 0) {
      toast.error('Экспортлох өгөгдөл байхгүй');
      return;
    }

    // Build CSV content
    const csvRows: string[] = [];

    if (exportColumns && exportColumns.length > 0) {
      // Use custom export columns
      csvRows.push(exportColumns.map(col => escapeCSV(col.header)).join(','));
      
      dataRows.forEach(row => {
        const rowData = exportColumns.map(col => {
          const value = col.getValue(row.original);
          return escapeCSV(value);
        });
        csvRows.push(rowData.join(','));
      });
    } else {
      // Fallback: generate from visible table columns
      const exportableColumns = table.getAllColumns().filter(column => {
        const id = column.id;
        return column.getIsVisible() && !['actions', 'select', 'expand'].includes(id);
      });

      // Build headers
      const headers = exportableColumns.map(column => {
        const header = column.columnDef.header;
        if (typeof header === 'string') return header;
        return column.id;
      });
      csvRows.push(headers.map(h => escapeCSV(h)).join(','));

      // Add data rows
      dataRows.forEach(row => {
        const original = row.original as Record<string, unknown>;
        const rowData = exportableColumns.map(column => {
          let value = row.getValue(column.id);
          if (value === undefined || value === null) {
            const accessorKey = (column.columnDef as { accessorKey?: string }).accessorKey;
            if (accessorKey) {
              value = original[accessorKey];
            }
          }
          return escapeCSV(value);
        });
        csvRows.push(rowData.join(','));
      });
    }

    const csvContent = csvRows.join('\n');
    
    // Add BOM for proper UTF-8 encoding (important for Mongolian characters)
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + csvContent], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const baseTitle = typeof title === 'string' ? title : 'export';
    const safeTitle = baseTitle.replace(/[^a-zA-Z0-9\u0400-\u04FF\s-]/g, '').trim() || 'data';
    const filename = `${safeTitle}_${timestamp}.csv`;
    
    // Create download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the URL object
    URL.revokeObjectURL(url);
    
    // Show success notification
    toast.success(`${dataRows.length} мөр экспортлогдлоо`, {
      description: filename,
    });
  };

  return (
    <Card>
      {(title || description) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              {title && (
                <CardTitle>
                  {typeof title === 'string' ? title : <div className="w-full">{title}</div>}
                </CardTitle>
              )}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <div className="flex items-center space-x-2">
              {actions}
            </div>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex items-center justify-between space-x-2">
          <div className="flex items-center space-x-2">
            {/* Global Search */}
            {enableGlobalSearch && (
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={searchPlaceholder}
                  value={globalFilter ?? ''}
                  onChange={(event) => setGlobalFilter(String(event.target.value))}
                  className="pl-8 w-[300px]"
                />
              </div>
            )}
            
            {/* Column Filter */}
            {searchKey && (
              <Input
                placeholder={`Filter by ${searchKey}...`}
                value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="max-w-sm"
              />
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Column Visibility */}
            {enableColumnFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings2 className="mr-2 h-4 w-4" />
                    Columns
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[200px]">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => {
                      return (
                        <DropdownMenuCheckboxItem
                          key={column.id}
                          className="capitalize"
                          checked={column.getIsVisible()}
                          onCheckedChange={(value) =>
                            column.toggleVisibility(!!value)
                          }
                        >
                          {column.columnDef.header as string}
                        </DropdownMenuCheckboxItem>
                      );
                    })}
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Export */}
            {enableExport && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV}
                className="gap-2"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span className="hidden sm:inline">Экспорт</span>
                <span className="sm:hidden">CSV</span>
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="whitespace-nowrap">
                        {header.isPlaceholder ? null : (
                          <div className="flex items-center space-x-2">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => header.column.toggleSorting()}
                              >
                                {header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDown className="h-3 w-3" />
                                ) : header.column.getIsSorted() === 'asc' ? (
                                  <ArrowUp className="h-3 w-3" />
                                ) : (
                                  <ArrowUpDown className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => {
                  // Check if this is a preview row (special handling)
                  const isPreviewRow = (row.original as any)?.isPreviewRow;

                  if (isPreviewRow) {
                    // Render preview row spanning all columns
                    const firstCell = row.getVisibleCells()[0];
                    return (
                      <TableRow key={row.id}>
                        <TableCell colSpan={row.getVisibleCells().length}>
                          {firstCell && flexRender(firstCell.column.columnDef.cell, firstCell.getContext())}
                        </TableCell>
                      </TableRow>
                    );
                  }

                  // Normal row rendering
                  return (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && 'selected'}
                      onClick={() => onRowClick?.(row.original)}
                      className={onRowClick ? 'cursor-pointer hover:bg-muted/50' : ''}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    Өгөгдөл олдсонгүй
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between space-x-2 py-4">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">
              Хуудас {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
            </p>
            <Select
              value={`${table.getState().pagination.pageSize}`}
              onValueChange={(value) => {
                table.setPageSize(Number(value));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={table.getState().pagination.pageSize} />
              </SelectTrigger>
              <SelectContent side="top">
                {[5, 10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Өмнөх
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Дараах
            </Button>
          </div>
        </div>

        {/* Row count info */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Нийт {table.getFilteredRowModel().rows.length} мөр
          </div>
          <div>
            {Object.keys(rowSelection).length} мөр сонгосон
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { ColumnDef };