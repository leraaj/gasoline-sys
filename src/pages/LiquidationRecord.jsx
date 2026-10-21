import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
import API from "@/lib/axios.js";
import ContentContainer from "../components/Container/ContentContainer";
import { DataTable } from "@/components/tables/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Undo2, Plus } from "lucide-react";

import { useLiquidation } from "@/hooks/useGetLiquidation.js";
import { selectionColumn } from "@/components/tables/data-table-selection-column";
import {
  calculateLiquidations,
  createLiquidationRow,
} from "@/lib/liquidationUtils.js";
import { liquidationRecordColumns } from "@/components/tables/liquidation-record/liquidation-record-columns";

const LiquidationRecord = () => {
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const savedStartingGasRef = useRef(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    data,
    setData,
    loading,
    saving,
    error,
    saveMultiple,
    liquidationHistory,
    historyLoading,
  } = useLiquidation(id);
  const [printData, setPrintData] = useState({
    data: "",
    liquidationHistory: "",
  });

  const handleNavigate = () => {
    navigate("/", {
      state: {
        printData: printData,
      },
    });
  };
  const [startingGas, setStartingGas] = useState(null);
  const [activeRowId, setActiveRowId] = useState(null);
  const [editingRowId, setEditingRowId] = useState(null);
  const [editingSnapshot, setEditingSnapshot] = useState(null);

  // Keep the latest values accessible without changing callback identities.
  const dataRef = useRef(data);
  const startingGasRef = useRef(startingGas);
  const activeRowIdRef = useRef(activeRowId);
  const editingRowIdRef = useRef(editingRowId);
  const editingSnapshotRef = useRef(editingSnapshot);
  const saveMultipleRef = useRef(saveMultiple);

  dataRef.current = data;
  startingGasRef.current = startingGas;
  activeRowIdRef.current = activeRowId;
  editingRowIdRef.current = editingRowId;
  editingSnapshotRef.current = editingSnapshot;
  saveMultipleRef.current = saveMultiple;

  // Declare this BEFORE saveEditing, deleteRow, and addRow.
  const saveStartingGas = useCallback(
    async (value = startingGasRef.current) => {
      if (!id) {
        throw new Error("A liquidation history ID is required.");
      }

      if (value === "" || value == null) {
        throw new Error("Starting gas is required.");
      }

      const numericValue = Number(value);

      if (!Number.isFinite(numericValue) || numericValue < 0) {
        throw new Error("Starting gas must be a valid non-negative number.");
      }

      if (savedStartingGasRef.current === numericValue) {
        return;
      }

      await API.put(`/liquidation-history/${id}`, {
        startingGas: numericValue,
      });

      savedStartingGasRef.current = numericValue;
    },
    [id],
  );
  // Stable callback: changing a field will not recreate this function.
  const updateRow = useCallback(
    (rowId, changes) => {
      setData((currentData) => {
        const updatedRows = currentData.map((row) =>
          (row.id ?? row._id) === rowId ? { ...row, ...changes } : row,
        );

        return calculateLiquidations(updatedRows, startingGasRef.current);
      });
    },
    [setData],
  );

  // Stable callback: read the latest records when editing starts.
  const startEditing = useCallback((row) => {
    if (editingRowIdRef.current !== null) return;

    const currentData = dataRef.current;

    setEditingSnapshot(currentData.map((item) => ({ ...item })));

    setEditingRowId(row.id ?? row._id);
  }, []);

  // Restore the snapshot if editing is canceled.
  const cancelEditing = useCallback(() => {
    const snapshot = editingSnapshotRef.current;

    if (snapshot) {
      setData(calculateLiquidations(snapshot, startingGasRef.current));
    }

    setEditingRowId(null);
    setEditingSnapshot(null);
  }, [setData]);

  // Save the latest data without depending on the changing data array.
  const saveEditing = useCallback(async () => {
    try {
      const currentStartingGas = startingGasRef.current;

      // Save the starting gas to the history document first.
      await saveStartingGas(currentStartingGas);

      const calculatedRows = calculateLiquidations(
        dataRef.current,
        currentStartingGas,
      );

      setData(calculatedRows);

      // Then save the liquidation rows.
      await saveMultipleRef.current(calculatedRows, currentStartingGas);

      setEditingRowId(null);
      setEditingSnapshot(null);
    } catch (error) {
      console.error("Failed to save edited liquidation:", error);
    }
  }, [setData, saveStartingGas]);

  // Delete and recalculate without recreating this callback on each keystroke.
  const deleteRow = useCallback(
    async (rowId) => {
      const currentData = dataRef.current;
      const currentStartingGas = startingGasRef.current;

      const remainingRows = calculateLiquidations(
        currentData.filter((row) => (row.id ?? row._id) !== rowId),
        currentStartingGas,
      );

      setData(remainingRows);

      if (activeRowIdRef.current === rowId) {
        setActiveRowId(null);
      }

      if (editingRowIdRef.current === rowId) {
        setEditingRowId(null);
        setEditingSnapshot(null);
      }

      try {
        // Save the starting gas first.
        await saveStartingGas(currentStartingGas);

        // Then persist the remaining rows.
        await saveMultipleRef.current(remainingRows, currentStartingGas);
      } catch (error) {
        console.error("Failed to delete liquidation:", error);
      }
    },
    [setData, saveStartingGas],
  );

  const addRow = useCallback(async () => {
    if (loading || saving || !historyLoaded || editingRowId !== null) {
      return;
    }

    const currentRows = dataRef.current;
    const currentStartingGas = startingGasRef.current;

    try {
      // Persist the starting balance first.
      await saveStartingGas(currentStartingGas);

      let savedRows = currentRows;

      // Save the current active row before adding another.
      if (activeRowIdRef.current !== null) {
        const result = await saveMultipleRef.current(
          calculateLiquidations(currentRows, currentStartingGas),
          currentStartingGas,
        );

        savedRows = result?.data ?? currentRows;
        setActiveRowId(null);
      }

      const previousRow = savedRows[savedRows.length - 1];

      const newRow = createLiquidationRow();

      if (previousRow?.date) {
        newRow.date = String(previousRow.date).slice(0, 10);
        newRow.added = String(previousRow.added).slice(0, 10);
        newRow.price = String(previousRow.price).slice(0, 10);
      }
      const nextRows = calculateLiquidations(
        [...savedRows, newRow],
        currentStartingGas,
      );

      setData(nextRows);
      setActiveRowId(newRow.id);
    } catch (error) {
      console.error("Failed to add liquidation row:", error);
    }
  }, [loading, saving, historyLoaded, editingRowId, setData, saveStartingGas]);

  const handleStartingGasChange = (value) => {
    setStartingGas(value);

    if (value === "") {
      return;
    }

    setData((currentData) => calculateLiquidations(currentData, value));
  };

  // Column definitions now remain stable while typing.
  const columns = useMemo(
    () =>
      liquidationRecordColumns({
        updateRow,
        deleteRow,
        activeRowId: editingRowId === null ? activeRowId : null,
        editingRowId,
        startEditing,
        cancelEditing,
        saveEditing,
      }),
    [
      updateRow,
      deleteRow,
      activeRowId,
      editingRowId,
      startEditing,
      cancelEditing,
      saveEditing,
    ],
  );
  useEffect(() => {
    setPrintData({ data: data, liquidationHistory: liquidationHistory });
  }, [data, liquidationHistory]);

  useEffect(() => {
    let cancelled = false;

    const fetchHistory = async () => {
      try {
        const response = await API.get(`/liquidation-history/${id}`);
        const history = response.data;

        if (cancelled) return;

        const value = history.startingGas;

        if (value === null || value === undefined || value === "") {
          setStartingGas(null);
          savedStartingGasRef.current = null;
        } else {
          setStartingGas(String(value));
          savedStartingGasRef.current = Number(value);
        }
      } catch (error) {
        console.error("Failed to load liquidation history:", error);

        if (!cancelled) {
          setStartingGas(null);
        }
      } finally {
        if (!cancelled) {
          setHistoryLoaded(true);
        }
      }
    };

    if (!id) {
      setHistoryLoaded(true);
      return;
    }

    setHistoryLoaded(false);
    setStartingGas(null);
    fetchHistory();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    if (startingGas === null || startingGas === "") {
      return;
    }

    setData((currentData) => {
      const calculated = calculateLiquidations(currentData, startingGas);

      const unchanged =
        currentData.length === calculated.length &&
        currentData.every((row, index) => {
          const next = calculated[index];

          return (
            (row.id ?? row._id) === (next.id ?? next._id) &&
            Number(row.previous ?? 0) === Number(next.previous ?? 0) &&
            Number(row.total ?? 0) === Number(next.total ?? 0) &&
            Number(row.remaining ?? 0) === Number(next.remaining ?? 0)
          );
        });

      return unchanged ? currentData : calculated;
    });
  }, [startingGas, setData]);
  const handleInitializeStartingGas = async () => {
    if (startingGas === null || startingGas === "") {
      return;
    }

    try {
      await saveStartingGas(startingGas);

      // Starting gas is now initialized.
      savedStartingGasRef.current = Number(startingGas);
    } catch (error) {
      console.error("Failed to initialize starting gas:", error);
    }
  };
  const date = `${new Date(
    `${String(liquidationHistory?.startDate).slice(0, 10)}T00:00:00`,
  ).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })} - ${new Date(
    `${String(liquidationHistory?.endDate).slice(0, 10)}T00:00:00`,
  ).toLocaleDateString("en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  })}`;

  return (
    <>
      <div
        className={`flex items-center justify-start gap-4 sticky top-0 bg-white z-50 p-[1rem]`}>
        <Button
          variant="link"
          className="icon cursor-pointer"
          onClick={() => navigate(-1)}>
          <Undo2 data-icon="inline-start" />
          Back
        </Button>

        <span className="text-2xl font-medium uppercase   ">
          {!historyLoading ? liquidationHistory?.label : `Liquidation Record`} -{" "}
          ({date})
        </span>
      </div>
      <ContentContainer justify="start">
        <DataTable
          data={data}
          columns={columns}
          loading={startingGas === null || loading}
          error={error}
          addRowBtn={() => (
            <Button
              onClick={addRow}
              disabled={
                loading || saving || !historyLoaded || editingRowId !== null
              }
              title={
                activeRowId !== null
                  ? "Complete current row and add another"
                  : "Add liquidation row"
              }>
              <Plus />
              {saving ? "Saving..." : "Add Row"}
            </Button>
          )}
          filters={() => <Button onClick={handleNavigate}>Print View</Button>}
          addButton={() => (
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <label htmlFor="starting-gas" className="text-sm font-medium">
                  Starting Gas
                </label>

                <Input
                  id="starting-gas"
                  type="number"
                  min="0"
                  step="0.01"
                  value={startingGas ?? ""}
                  onChange={(event) =>
                    handleStartingGasChange(event.target.value)
                  }
                  onBlur={() => {
                    if (startingGas !== null && startingGas !== "") {
                      saveStartingGas(startingGas).catch((error) => {
                        console.error("Failed to save starting gas:", error);
                      });
                    }
                  }}
                  className="h-9 w-36"
                  disabled={saving || !historyLoaded}
                />
              </div>
            </div>
          )}
        />
      </ContentContainer>
    </>
  );
};

export default LiquidationRecord;
