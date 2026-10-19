import API from "@/lib/axios.js";
import { useCallback, useEffect, useState } from "react";
import { prepareLiquidationEntries } from "@/lib/liquidationUtils.js";

// Get the parent liquidation history and its attributes.
const getLiquidationHistory = async (historyId) => {
  const response = await API.get(`/liquidation-history/${historyId}`);
  return response.data;
};

// Get liquidations belonging to a history record.
const getLiquidations = async (historyId) => {
  const response = await API.get(`/liquidations/history/${historyId}`);
  return response.data;
};

// Replace all liquidation entries for a history.
const saveMultipleLiquidations = async (historyId, entries) => {
  const response = await API.post("/liquidations/", {
    liquidationHistoryId: historyId,
    entries,
  });

  return response.data;
};

// Update an individual liquidation.
const updateLiquidation = async (id, liquidationData) => {
  const response = await API.put(`/liquidations/${id}`, liquidationData);
  return response.data;
};

// Delete an individual liquidation.
const deleteLiquidation = async (id) => {
  const response = await API.delete(`/liquidations/${id}`);
  return response.data;
};

export const useLiquidation = (liquidationHistoryId) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [liquidationHistory, setLiquidationHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch liquidation rows.
  const fetchData = useCallback(async () => {
    if (!liquidationHistoryId) {
      setData([]);
      setLoading(false);
      return [];
    }

    try {
      setLoading(true);
      setError(null);

      const response = await getLiquidations(liquidationHistoryId);

      // Support either an array or an object containing a data array.
      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const liquidations = rows.map((item) => ({
        ...item,
        id: item.id ?? item._id,
      }));

      setData(liquidations);
      return liquidations;
    } catch (error) {
      console.error("Failed to fetch liquidations:", error);
      setError(error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, [liquidationHistoryId]);

  // Automatically fetch rows on mount and when the history ID changes.
  useEffect(() => {
    fetchData().catch(() => {
      // The error is already logged and stored in state.
    });
  }, [fetchData]);

  // Save multiple liquidation rows.
  const saveMultiple = async (entries, startingGas = 0) => {
    if (!liquidationHistoryId) {
      throw new Error("A liquidation history ID is required.");
    }

    try {
      setSaving(true);
      setError(null);

      const payload = prepareLiquidationEntries(entries, startingGas);

      const response = await saveMultipleLiquidations(
        liquidationHistoryId,
        payload,
      );

      const rows = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      const savedEntries = rows.map((item, index) => ({
        ...item,
        id: entries[index]?.id ?? item.id ?? item._id,
      }));

      setData(savedEntries);

      return {
        success: true,
        data: savedEntries,
        count: response?.count ?? savedEntries.length,
        message: response?.message,
      };
    } catch (error) {
      console.error("Failed to save liquidations:", error);
      setError(error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  // Update an individual liquidation.
  const update = async (id, liquidationData) => {
    try {
      setError(null);

      const response = await updateLiquidation(id, liquidationData);
      const updated = response.data ?? response;

      setData((currentData) =>
        currentData.map((item) =>
          (item._id ?? item.id) === id
            ? { ...updated, id: item.id ?? updated._id ?? updated.id }
            : item,
        ),
      );

      return { success: true, data: updated };
    } catch (error) {
      console.error("Failed to update liquidation:", error);
      setError(error);
      throw error;
    }
  };

  // Delete an individual liquidation.
  const remove = async (id) => {
    try {
      setError(null);

      await deleteLiquidation(id);

      setData((currentData) =>
        currentData.filter((item) => (item._id ?? item.id) !== id),
      );

      return { success: true };
    } catch (error) {
      console.error("Failed to delete liquidation:", error);
      setError(error);
      throw error;
    }
  };

  // Fetch the parent liquidation history.
  const fetchLiquidationHistory = useCallback(async () => {
    if (!liquidationHistoryId) {
      setLiquidationHistory(null);
      setHistoryLoading(false);
      return null;
    }

    try {
      setHistoryLoading(true);

      const history = await getLiquidationHistory(liquidationHistoryId);

      setLiquidationHistory(history);
      return history;
    } catch (error) {
      console.error("Failed to fetch liquidation history:", error);
      throw error;
    } finally {
      setHistoryLoading(false);
    }
  }, [liquidationHistoryId]);

  // Automatically fetch history on mount and when the ID changes.
  useEffect(() => {
    fetchLiquidationHistory().catch(() => {
      // The error is already logged.
    });
  }, [fetchLiquidationHistory]);

  return {
    data,
    setData,
    loading,
    saving,
    error,
    saveMultiple,
    update,
    remove,
    refetch: fetchData,

    // Parent liquidation history.
    liquidationHistory,
    historyLoading,
    refetchHistory: fetchLiquidationHistory,
  };
};
