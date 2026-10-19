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

export const liquidationPrintviewColumns = () => [
  // DATE — assigned when the row is created

  {
    accessorKey: "date",
    header: () => {
      return (
        <div className="flex items-center gap-1">
          <span className="w-full col">Date</span>
        </div>
      );
    },

    cell: ({ row }) => {
      const liquidation = row.original;

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
      const liquidation = row.original?.previous;

      return <span>{formatNumber(liquidation)}</span>;
    },
  },

  // ADDED — editable only on the active row or while editing
  {
    accessorKey: "added",
    header: "Added",
    cell: ({ row }) => {
      const liquidation = row.original;
      return <span>{formatNumber(liquidation.added)}</span>;
    },
  },

  // PRICE — editable only on the active row or while editing
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => {
      const liquidation = row.original;

      return formatCurrency(liquidation.price);
    },
  },

  // TOTAL — calculated by liquidationUtils.js
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const value = row.original?.total;

      return <span>{formatNumber(value)}</span>;
    },
  },

  // TRIP — editable only on the active row or while editing
  {
    accessorKey: "trip",
    header: "Trip",
    cell: ({ row }) => {
      const liquidation = row.original;

      return (
        <span className={isNegative(liquidation.trip) ? "text-red-500" : ""}>
          {formatNumber(liquidation.trip)}
        </span>
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
        <span>
          {formatNumber(value)} {` ${value > 1 ? ">" : value <= 0 ? "<" : ""}`}
        </span>
      );
    },
  },
];
