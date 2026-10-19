import { Button } from "@/components/ui/button";
import { Eye, Pencil, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { selectionColumn } from "@/components/tables/data-table-selection-column";
import { ArrowUpDown } from "lucide-react"

export const liquidationColumns = [
  selectionColumn,
  {
    accessorKey: "label",
    header: "Label",
    cell: ({ row }) => {
      const type = row.getValue("label");

      return type || "-";
    },
  },

  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type");

      return type || "-";
    },
  },
  {
    id: "dates",
    header: "Date From-To",
    cell: ({ row }) => {
      const startdate = row.original.startDate;
      const enddate = row.original.endDate;

      return startdate && enddate
        ? new Date(startdate).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }) +
            " - " +
            new Date(enddate).toLocaleDateString("en-PH", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
        : "-";
    },
  },

  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("startDate");

      return date
        ? new Date(date).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "-";
    },
  },

  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("endDate");

      return date
        ? new Date(date).toLocaleDateString("en-PH", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "-";
    },
  },
  {
    accessorKey: "totalAdded",
    header: "Total Added",
    cell: ({ row }) => {
      const type = row.getValue("totalAdded");
      return type;
    },
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
    cell: ({ row }) => {
      const type = row.getValue("totalPrice");

      return type || "-";
    },
  },
  // ACTIONS
  {
    id: "actions",
    header: "Actions",
    enableHiding: false,

    cell: ({ row, table }) => {
      const gasoline = row.original;
      const rows = table.getCoreRowModel().rows;

      const navigate = useNavigate();

      return (
        <div className="flex items-start gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              alert(JSON.stringify(gasoline, null, 2));
              console.log("not");
            }}>
            <Eye />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/liquidation-record/${rows?.id}`)}>
            <Pencil />
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => {
              alert(JSON.stringify(gasoline, null, 2));
              console.log("not");
            }}>
            <Trash />
          </Button>
        </div>
      );
    },
  },
];
