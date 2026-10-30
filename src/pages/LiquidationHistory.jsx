import { useLiquidationHistory } from "@/hooks/useGetLiquidationHistory.js";
import ContentContainer from "@/components/Container/ContentContainer";
import { DataTable } from "@/components/tables/data-table";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import CreateLiquidation from "./liquidation-history-modals/CreateLiquidation";
import UpdateLiquidation from "./liquidation-history-modals/UpdateLiquidation";
import { useNavigate } from "react-router-dom";
import { selectionColumn } from "@/components/tables/data-table-selection-column";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldGroup } from "@/components/ui/field";

const LiquidationHistory = () => {
  const navigate = useNavigate();

  const closeRef = useRef(null);

  const { data, loading, error, create, update, remove } =
    useLiquidationHistory();

  const [record, setRecord] = useState({
    label: "",
    startDate: "",
    endDate: "",
    totalAdded: "",
    totalPrice: "",
  });

  const columns = useMemo(
    () => [
      selectionColumn,
      {
        accessorKey: "label",
        header: "Label",
        cell: ({ row }) => {
          const label = row.original?.label;
          return label || "-";
        },
      },

      {
        header: "From",
        cell: ({ row }) => {
          const startDate = row.original?.startDate;
          const endDate = row.original?.endDate;

          if (!startDate) return "-";

          return new Date(
            `${String(row.original?.startDate).slice(0, 10)}T00:00:00`,
          )
            .toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
            .replaceAll("/", "-");
        },
      },
      {
        header: "To",
        cell: ({ row }) => {
          const endDate = row.original?.endDate;

          if (!endDate) return "-";

          return new Date(
            `${String(row.original?.endDate).slice(0, 10)}T00:00:00`,
          )
            .toLocaleDateString("en-US", {
              month: "2-digit",
              day: "2-digit",
              year: "numeric",
            })
            .replaceAll("/", "-");
        },
      },
      {
        accessorKey: "totalAdded",
        header: "Total Added",
        cell: ({ row }) => {
          const totalAdded = row.original?.totalAdded;
          return `${totalAdded?.toFixed(2)}` || "-";
        },
      },
      {
        accessorKey: "totalTrips",
        header: "Total Trips",
        cell: ({ row }) => {
          const totalTrips = row.original?.totalTrips;
          return `${totalTrips?.toFixed(2)}` || "-";
        },
      },
      {
        accessorKey: "totalPrice",
        header: "Total Price",
        cell: ({ row }) => {
          const totalPrice = row.original?.totalPrice;
          return `₱ ${Number(totalPrice).toLocaleString("en-US")}`;
        },
      },
      {
        accessorKey: "actions",
        header: "Actions",
        cell: ({ row }) => {
          const rowRecord = row.original;
          return (
            <div className="flex gap-1">
              <Button
                variant="default"
                size="xs"
                onClick={() =>
                  navigate(`/liquidation-record/${rowRecord?._id}`)
                }>
                View
              </Button>
              <UpdateLiquidation
                record={rowRecord}
                setRecord={setRecord}
                handleUpdate={handleUpdate}
                closeRef={closeRef}
              />
              <Dialog>
                <form>
                  <DialogTrigger
                    render={
                      <Button variant="destructive" size="xs">
                        Delete
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                      <DialogTitle>Edit profile</DialogTitle>
                      {/* <DialogDescription>
                        Make changes to your profile here. Click save when
                        you&apos;re done.
                      </DialogDescription> */}
                    </DialogHeader>
                    <Field>
                      Are you sure you want to delete {rowRecord.label}
                    </Field>
                    <DialogFooter>
                      <DialogClose
                        render={<Button variant="outline">Cancel</Button>}
                      />
                      <Button onClick={() => handleDelete(rowRecord)}>
                        Delete
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </form>
              </Dialog>
            </div>
          );
        },
      },
    ],
    [],
  );

  const handleCreate = async (record) => {
    return await create({
      label: record.label,
      startDate: record.startDate,
      endDate: record.endDate,
      startingGas: record.startingGas,
    });
  };

  const handleUpdate = async (record) => {
    return await update(record?._id, {
      label: record?.label,
      startDate: record?.startDate,
      endDate: record?.endDate,
      startingGas: record.startingGas,
    });
  };

  const handleDelete = async (record) => {
    try {
      await remove(record._id);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <ContentContainer justify={"start"}>
      <span className="text-2xl font-medium uppercase">
        Liquidation History
      </span>
      <DataTable
        columns={columns}
        data={data}
        loading={loading}
        error={error}
        addButton={() => (
          <CreateLiquidation
            record={record}
            setRecord={setRecord}
            closeRef={closeRef}
            handleCreate={handleCreate}
          />
        )}
      />
      {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
    </ContentContainer>
  );
};

export default LiquidationHistory;
