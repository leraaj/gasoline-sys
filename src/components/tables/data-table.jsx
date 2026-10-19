import { useState } from "react";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  SearchIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "../ui/input-group";

export function DataTable({
  columns,
  filters,
  data = [],
  loading,
  editingRowId,
  addButton,
  addRowBtn,
  noColumnFilter,
  noSearchFilter,
}) {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);

  const [columnVisibility, setColumnVisibility] = useState({
    startDate: false,
    endDate: false,
  });

  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,

    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },

    enableRowSelection: true,

    getRowId: (row) => String(row.id ?? row._id),

    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,

    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 100,
      },
    },

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="mt-5 w-full space-y-4 sticky top-0 ">
      {/* TOP CONTROLS */}
      <div className="flex flex-row justify-end gap-2">
        <div className="flex flex-row gap-2">{addButton?.()}</div>
      </div>

      {/* FILTERS AND COLUMN VISIBILITY */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex w-full flex-row justify-between gap-2">
          <div className="flex flex-row gap-2 w-[50%]">
            {!noSearchFilter && (
              <InputGroup>
                <InputGroupInput
                  placeholder="Search..."
                  value={globalFilter ?? ""}
                  onChange={(event) => setGlobalFilter(event.target.value)}
                />

                <InputGroupAddon>
                  <SearchIcon />
                </InputGroupAddon>
              </InputGroup>
            )}
            {/* <InputGroup>{addButton?.()}</InputGroup> */}
          </div>

          <div className="flex gap-2">
            {filters && filters?.()}
            {!noColumnFilter && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Columns
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                  {table
                    .getAllColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        className="capitalize px-2"
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) =>
                          column.toggleVisibility(!!value)
                        }>
                        {typeof column.columnDef.header === "string"
                          ? column.columnDef.header
                          : column.id}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const headerContent = header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      );

                  return (
                    <TableHead
                      key={header.id}
                      className={
                        `sticky top-0 ` + header.column.id === "actions"
                          ? "text-center"
                          : ""
                      }>
                      {headerContent}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className={
                    String(row.original.id ?? row.original._id) ===
                    String(editingRowId)
                      ? "bg-blue-50 hover:bg-blue-50"
                      : ""
                  }
                  data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={
                        cell.column.id === "actions"
                          ? "w-px whitespace-nowrap text-center "
                          : ""
                      }>
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
                <TableCell
                  colSpan={table.getVisibleLeafColumns().length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
            {addRowBtn && (
              <TableRow>
                <TableCell
                  className="text-end"
                  colSpan={table.getVisibleLeafColumns().length}>
                  {addRowBtn?.()}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* FOOTER */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {table.getRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} rows
        </div>

        <div className="flex items-center gap-6">
          <div className="text-sm text-muted-foreground">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}>
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
