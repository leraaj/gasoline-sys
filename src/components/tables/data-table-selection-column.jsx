import { Checkbox } from "@/components/ui/checkbox";

export const selectionColumn = {
  id: "select",

  header: ({ table }) => (
    <Checkbox
      checked={
        table.getIsAllPageRowsSelected()
          ? true
          : table.getIsSomePageRowsSelected()
            ? "indeterminate"
            : false
      }
      onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      aria-label="Select all rows on this page"
    />
  ),

  cell: ({ row }) => (
    <Checkbox
      checked={row.getIsSelected()}
      onCheckedChange={(value) => row.toggleSelected(!!value)}
      aria-label="Select row"
    />
  ),

  enableSorting: false,
  enableHiding: false,
  size: 40,
};
