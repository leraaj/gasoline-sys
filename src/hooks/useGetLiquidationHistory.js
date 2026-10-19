import API from "@/lib/axios.js";
import { useEffect, useState } from "react";

const getLiquidationHistory = async () => {
  const response = await API.get("/liquidation-history/");
  return response.data;
};

const createLiquidation = async (liquidationData) => {
  const response = await API.post("/liquidation-history/", liquidationData);

  return response.data;
};

const updateLiquidation = async (id, liquidationData) => {
  const response = await API.put(`/liquidation-history/${id}`, liquidationData);

  return response.data;
};
const deleteLiquidation = async (id) => {
  await API.delete(`/liquidation-history/${id}`);
};
export const useLiquidationHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);

      const data = await getLiquidationHistory();

      setData(data);
    } catch (error) {
      console.error("Failed to fetch liquidation history:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  const create = async (liquidationData) => {
    try {
      setError(null);

      const newLiquidation = await createLiquidation(liquidationData);

      // Add the newly created record to local state
      setData((currentData) => [...currentData, newLiquidation]);
      return {
        success: true,
        data: newLiquidation,
      };
    } catch (error) {
      console.error("Failed to create liquidation:", error);
      setError(error);
      throw error;
    }
  };
  const update = async (id, liquidationData) => {
    try {
      setError(null);

      const updatedLiquidation = await updateLiquidation(id, liquidationData);

      setData((currentData) =>
        currentData.map((item) =>
          item._id === id ? updatedLiquidation : item,
        ),
      );

      return {
        success: true,
        data: updatedLiquidation,
      };
    } catch (error) {
      console.error("Failed to update liquidation:", error);
      setError(error);

      return {
        success: false,
        error,
      };
    }
  };
  const remove = async (id) => {
    try {
      setError(null);

      await deleteLiquidation(id);

      setData((currentData) => currentData.filter((item) => item._id !== id));
    } catch (error) {
      console.error("Failed to delete liquidation:", error);
      setError(error);
      throw error;
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    create,
    update,
    remove,
    refetch: fetchData,
  };
};
