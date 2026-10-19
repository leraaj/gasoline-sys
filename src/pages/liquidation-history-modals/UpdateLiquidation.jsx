import { useState } from "react";

import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { toast } from "sonner";

const UpdateLiquidation = ({ record, setRecord, handleUpdate, closeRef }) => {
  const [formData, setFormData] = useState({
    label: record?.label || "",
    startDate: record?.startDate?.slice(0, 10) || "",
    endDate: record?.endDate?.slice(0, 10) || "",
    startingGas: record?.startingGas ?? 0,
  });

  const isIncomplete =
    !formData.label || !formData.startDate || !formData.endDate;
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // VALIDATIONS
  const BackdropDismissal = () =>
    isIncomplete ? { disablePointerDismissal: true } : {};
  const shouldPreventClose = (open, details, isIncomplete) =>
    !open && details.reason === "escape-key" && isIncomplete;
  return (
    <Dialog
      //Controls the closing of the dialog when clicking outside of it
      {...BackdropDismissal()}
      onOpenChange={(open, details) => {
        console.log("Dialog change:", open, details.reason);
        if (shouldPreventClose(open, details, isIncomplete)) {
          details.cancel();
        }
      }}>
      <DialogTrigger
        render={
          <Button
            variant="default"
            size="xs"
            onClick={() => {
              setFormData({
                label: record?.label || "",
                startDate: record?.startDate?.slice(0, 10) || "",
                endDate: record?.endDate?.slice(0, 10) || "",
                startingGas: record?.startingGas ?? 0,
              });
            }}>
            Update
          </Button>
        }
      />

      <DialogContent showCloseButton={false}>
        <DialogHeader className="flex-row justify-between items-center">
          <DialogTitle>Update liquidation</DialogTitle>
          <DialogClose
            ref={closeRef}
            render={
              <Button size="icon" variant="ghost" disabled={isIncomplete}>
                <X className="cursor-pointer" />
              </Button>
            }
          />
        </DialogHeader>

        <FieldGroup>
          <Field>
            <Label htmlFor="label">Label</Label>

            <Input
              id="label"
              value={formData.label}
              onChange={(e) => {
                handleChange("label", e.target.value);
              }}
            />
          </Field>

          <Field>
            <Label htmlFor="start-date">Start Date</Label>

            <Input
              id="start-date"
              type="date"
              value={formData.startDate}
              onChange={(e) => {
                const startDate = e.target.value;

                setFormData((prev) => ({
                  ...prev,
                  startDate,
                  endDate: startDate,
                }));
              }}
            />
          </Field>

          <Field>
            <Label htmlFor="end-date">End Date</Label>

            <Input
              type="date"
              id="end-date"
              name="endDate"
              value={formData?.endDate}
              min={
                formData.startDate
                  ? new Date(new Date(formData.startDate).getTime() + 86400000)
                      .toISOString()
                      .split("T")[0]
                  : undefined
              }
              onChange={(e) => {
                handleChange("endDate", e.target.value);
              }}
            />
          </Field>
          <Field>
            <Label htmlFor="starting-gas">Starting Gas</Label>
            <Input
              id="starting-gas"
              name="startingGas"
              type="number"
              min="0"
              step="0.01"
              value={formData.startingGas}
              onChange={(event) =>
                handleChange("startingGas", event.target.value)
              }
            />
          </Field>
          {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
        </FieldGroup>

        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />

          <Button
            onClick={() => {
              if (!formData.label || !formData.startDate || !formData.endDate) {
                toast.error("Please fill in all required fields.");
                return;
              }

              toast.promise(
                new Promise(async (resolve, reject) => {
                  try {
                    await new Promise((resolve) => setTimeout(resolve, 1500));

                    const result = await handleUpdate({
                      ...record,
                      ...formData,
                    });

                    resolve(result);
                  } catch (error) {
                    reject(error);
                  }
                }),
                {
                  loading: "Updating liquidation...",
                  success: (result) => {
                    closeRef.current?.click();
                    return `${result.data.label} has been updated`;
                  },
                  error: "Failed to update liquidation",
                },
              );
            }}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default UpdateLiquidation;
