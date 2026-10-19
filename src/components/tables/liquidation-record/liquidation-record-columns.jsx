import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { selectionColumn } from "@/components/tables/data-table-selection-column";
import { ChevronUp, ChevronDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") {
    return "0.00";
  }

  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(2) : "0.00";
};

const formatCurrency = (value) => {
  const number = Number(value ?? 0);

  return `₱ ${Number.isFinite(number) ? number.toFixed(2) : "0.00"}`;
};

const isNegative = (value) => Number(value ?? 0) < 0;

export const liquidationRecordColumns = ({
  updateRow,
  deleteRow,
  activeRowId,
  editingRowId,
  startEditing,
  cancelEditing,
  saveEditing,
}) => [
  selectionColumn,
  {
    id: "rowNumber",
    header: "#",
    enableHiding: false,
    cell: ({ row }) => row.index + 1,
  },

  // DATE — assigned when the row is created

  {
    accessorKey: "date",
    header: ({ column, table }) => {
      const availableDates = [
        ...new Set(
          table
            .getPreFilteredRowModel()
            .rows.map((row) => {
              const date = row.original.date;
              return date ? String(date).slice(0, 10) : null;
            })
            .filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b));

      const filterValue = column.getFilterValue();

      return (
        <div className="flex items-center gap-1">
          <span className="w-full col">Date</span>

          <Select
            className=" "
            value={filterValue ?? "all"}
            onValueChange={(value) =>
              column.setFilterValue(value === "all" ? undefined : value)
            }>
            <SelectTrigger
              className="h-7 w-8 border-0 px-1 shadow-none"
              aria-label="Filter by date">
              <SelectValue>
                <span className="sr-only">
                  {filterValue ? `Filtered by ${filterValue}` : "Filter dates"}
                </span>
              </SelectValue>
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>

              {availableDates.map((date) => (
                <SelectItem key={date} value={date}>
                  {new Date(`${date}T00:00:00`)
                    .toLocaleDateString("en-US", {
                      month: "2-digit",
                      day: "2-digit",
                      year: "numeric",
                    })
                    .replaceAll("/", "-")}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    },

    cell: ({ row }) => {
      const liquidation = row.original;
      const rowId = liquidation.id ?? liquidation._id;

      const isActive = activeRowId === rowId;
      const isEditing = editingRowId === rowId;

      if (isActive || isEditing) {
        const dateValue = liquidation.date
          ? String(liquidation.date).slice(0, 10)
          : "";

        return (
          <Input
            type="date"
            value={dateValue}
            onChange={(event) => updateRow(rowId, { date: event.target.value })}
            className="h-8  min-w-[100px] mx-[-0.7rem]  "
          />
        );
      }

      return liquidation.date
        ? new Date(
            `${String(liquidation.date).slice(0, 10)}T00:00:00`,
          ).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          })
        : // .replaceAll("/", "-")
          "-";
    },
  },

  // PREVIOUS — calculated by liquidationUtils.js
  {
    accessorKey: "previous",
    header: "Previous",
    cell: ({ row }) => {
      const value = row.original?.previous;

      return (
        <span className={isNegative(value) ? "text-red-500" : ""}>
          {formatNumber(value)}
        </span>
      );
    },
  },

  // ADDED — editable only on the active row or while editing
  {
    accessorKey: "added",
    header: "Added",
    cell: ({ row }) => {
      const liquidation = row.original;
      const rowId = liquidation.id ?? liquidation._id;

      const isActive = activeRowId === rowId;
      const isEditing = editingRowId === rowId;
      const isEditable = isActive || isEditing;

      if (!isEditable) {
        return (
          <span
            className={
              isNegative(liquidation.added) ? "text-red-500" : "text-green-600"
            }>
            {formatNumber(liquidation.added)} +
          </span>
        );
      }

      return (
        <Input
          type="number"
          min="0"
          step="0.01"
          value={liquidation.added ?? ""}
          onChange={(event) =>
            updateRow(rowId, {
              added: event.target.value,
            })
          }
          className="h-8  min-w-[100px] mx-[-0.7rem]"
        />
      );
    },
  },

  // PRICE — editable only on the active row or while editing
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const liquidation = row.original;
      const rowId = liquidation.id ?? liquidation._id;

      const isActive = activeRowId === rowId;
      const isEditing = editingRowId === rowId;
      const isEditable = isActive || isEditing;

      if (!isEditable) {
        return formatCurrency(liquidation.price);
      }

      return (
        <Input
          type="number"
          min="0"
          step="0.01"
          value={liquidation.price ?? ""}
          onChange={(event) =>
            updateRow(rowId, {
              price: event.target.value,
            })
          }
          className="h-8  min-w-[100px]  "
        />
      );
    },
  },

  // TOTAL — calculated by liquidationUtils.js
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const value = row.original?.total;

      return (
        <span className={isNegative(value) ? "text-red-500" : ""}>
          {formatNumber(value)}
        </span>
      );
    },
  },

  // TRIP — editable only on the active row or while editing
  {
    accessorKey: "trip",
    header: "Trip",
    cell: ({ row }) => {
      const liquidation = row.original;
      const rowId = liquidation.id ?? liquidation._id;

      const isActive = activeRowId === rowId;
      const isEditing = editingRowId === rowId;
      const isEditable = isActive || isEditing;

      if (!isEditable) {
        return (
          <span className={isNegative(liquidation.trip) ? "text-red-500" : ""}>
            {formatNumber(liquidation.trip)}
          </span>
        );
      }

      return (
        <Input
          type="number"
          min="0"
          step="0.01"
          value={liquidation.trip ?? ""}
          onChange={(event) =>
            updateRow(rowId, {
              trip: event.target.value,
            })
          }
          className="h-8  min-w-[100px] mx-[-0.7rem]"
        />
      );
    },
  },

  // REMAINING — calculated by liquidationUtils.js
  {
    accessorKey: "remaining",
    header: "Remaining",
    cell: ({ row }) => {
      const value = row.original?.remaining;

      return (
        <span
          className={
            isNegative(value)
              ? "text-red-500"
              : value > 1
                ? "text-green-500"
                : ""
          }>
          {formatNumber(value)} {` ${value > 1 ? ">" : value <= 0 ? "<" : ""}`}
        </span>
      );
    },
  },

  // ACTIONS
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,
    cell: ({ row }) => {
      const liquidation = row.original;
      const rowId = liquidation.id ?? liquidation._id;

      const isActive = activeRowId === rowId;
      const isEditing = editingRowId === rowId;

      if (isEditing) {
        return (
          <div className="flex items-center gap-2">
            <Button onClick={() => saveEditing(rowId)}>Save</Button>

            <Button variant="outline" onClick={() => cancelEditing()}>
              Cancel
            </Button>
            {/* <pre>id: {activeRowId}, </pre>
            <pre>selected: {editingRowId}</pre> */}
          </div>
        );
      }

      // The active row is already editable.
      // Completed rows can be explicitly edited.
      return (
        <div className="flex items-center gap-2">
          {!isActive && (
            <>
              <Button
                variant="outline"
                onClick={() => startEditing(liquidation)}
                disabled={!rowId == !editingRowId}>
                Edit
              </Button>
              {/* <pre>id: {activeRowId}, </pre>
              <pre>selected: {editingRowId}</pre> */}
            </>
          )}
          <Button
            variant="destructive"
            onClick={() => deleteRow(rowId)}
            disabled={!rowId == !editingRowId}>
            Delete
          </Button>
        </div>
      );
    },
  },
];
