import { useCallback, useEffect, useMemo, useState } from "react";

import ContentContainer from "../components/Container/ContentContainer";
import { DataTable } from "@/components/tables/sampleTable/data-table";

import { calculateLiquidations } from "@/lib/liquidationUtils";
import {
  loadLiquidationData,
  saveLiquidationData,
} from "@/lib/liquidationStorage";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
const getToday = () => {
  return new Date().toLocaleDateString("en-CA");
};

const createLiquidationRow = (sequence) => ({
  id: crypto.randomUUID(),
  sequence,
  date: getToday(),
  addedGas: 0,
  price: 0,
  tripGas: 0,
});

const MainPage = () => {
  const initialData = loadLiquidationData();
  const [startingGas, setStartingGas] = useState(initialData.startingGas);
  const [liquidations, setLiquidations] = useState(initialData.liquidations);

  // Date filter
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Row editing
  const [editingRowId, setEditingRowId] = useState(null);

  /*
   * Save user-entered data.
   */
  useEffect(() => {
    saveLiquidationData(startingGas, liquidations);
  }, [startingGas, liquidations]);

  const updateRow = useCallback((id, changes) => {
    setLiquidations((currentRows) =>
      currentRows.map((row) =>
        row.id === id
          ? {
              ...row,
              ...changes,
            }
          : row,
      ),
    );
  }, []);
  const startEditing = useCallback((row) => {
    setEditingRowId(row.id);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingRowId(null);
  }, []);

  const saveEditing = useCallback(() => {
    setEditingRowId(null);
  }, []);
  const addRow = useCallback(() => {
    setLiquidations((currentRows) => [
      ...currentRows,
      createLiquidationRow(currentRows.length + 1),
    ]);
  }, []);

  const deleteRow = useCallback((id) => {
    setLiquidations((currentRows) =>
      currentRows.filter((row) => row.id !== id),
    );
  }, []);

  /*
   * IMPORTANT:
   *
   * Calculate ALL rows first.
   *
   * Date filtering happens AFTER calculation.
   */
  const calculatedLiquidations = useMemo(() => {
    return calculateLiquidations(liquidations, startingGas);
  }, [liquidations, startingGas]);

  /*
   * Apply the visual date filter AFTER
   * all calculations have been completed.
   */
  const filteredLiquidations = useMemo(() => {
    return calculatedLiquidations.filter((row) => {
      const rowDate = row.date;

      if (!rowDate) {
        return false;
      }

      if (dateFrom && rowDate < dateFrom) {
        return false;
      }

      if (dateTo && rowDate > dateTo) {
        return false;
      }

      return true;
    });
  }, [calculatedLiquidations, dateFrom, dateTo]);

  const clearDateFilter = useCallback(() => {
    setDateFrom("");
    setDateTo("");
  }, []);

  const columns = useMemo(() => liquidationHistoryColumns(), []);
  const dateFilter = () => {
    return (
      <>
        {/* Starting Gas */}
        <div className="flex items-center gap-2">
          {/* Date From */}
          <div className="flex items-center gap-2">
            <Input
              id="date-from"
              type="date"
              value={dateFrom}
              onChange={(event) => {
                setDateFrom(event.target.value);
              }}
              className="w-[150px]"
            />
          </div>
          {/* Date To */}
          <div className="flex items-center gap-2">
            <Input
              id="date-to"
              type="date"
              value={dateTo}
              onChange={(event) => {
                setDateTo(event.target.value);
              }}
              className="w-[150px]"
            />
          </div>
          {/* Clear Filter */}
          <Button variant="outline" onClick={clearDateFilter}>
            Clear
          </Button>
        </div>
      </>
    );
  };
  return (
    <ContentContainer justify={"start"}>
      <div className="w-full space-y-4">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-lg font-semibold">Gasoline Liquidation</p>
        </div>
        {/* Table */}
        <DataTable
          columns={columns}
          data={filteredLiquidations}
          filters={dateFilter}
          editingRowId={editingRowId}
          addButton={() => {
            return (
              <>
                <label
                  htmlFor="starting-gas"
                  className="text-sm font-medium whitespace-nowrap flex items-center">
                  Starting Gas
                </label>
                <Input
                  id="starting-gas"
                  type="number"
                  step="0.01"
                  value={startingGas}
                  onChange={(event) => {
                    setStartingGas(event.target.value);
                  }}
                  className="w-[120px]"
                />
                <Button onClick={addRow}>Add Row</Button>
              </>
            );
          }}
        />
      </div>
    </ContentContainer>
  );
};

export default MainPage;
