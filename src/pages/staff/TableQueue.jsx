import { useEffect, useState, useCallback } from "react";

import AdminLayout from "../../components/AdminLayout.jsx";
import TableGrid from "../../components/TableGrid.jsx";
import QueueTable from "../../components/QueueTable.jsx";

import {
  getAllQueuesAPI,
  getAllTablesAPI,
  assignTableAPI,
} from "../../services/allAPI.js";

export default function TableQueue() {
  const [tables, setTables] = useState([]);
  const [queue, setQueue] = useState([]);

  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState("");

  // Fetch tables and queue from backend
  const loadData = useCallback(async () => {
    try {
      setError("");

      const [tableResponse, queueResponse] = await Promise.all([
        getAllTablesAPI(),
        getAllQueuesAPI(),
      ]);

      const tableData = tableResponse.data;
      const queueData = queueResponse.data;

      setTables(
        tableData.map((table) => ({
          ...table,
          id: table._id,
        }))
      );

      setQueue(
        queueData.map((item) => ({
          ...item,
          id: item._id,
        }))
      );

    } catch (error) {
      console.error("Error loading table and queue:", error);

      setError(
        error.response?.data?.message ||
        "Failed to load tables and queue."
      );

    } finally {
      setLoading(false);
    }
  }, []);

  // Load data when component mounts
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Assign next suitable waiting customer
  const seatNextParty = async (tableId) => {
    try {
      setAssigning(true);

      const response = await assignTableAPI({
        tableId,
      });

      if (response.data.success) {
        window.alert(
          response.data.message || "Table assigned successfully!"
        );

        // Refresh tables and queue after assignment
        await loadData();
      }

    } catch (error) {
      console.error("Table assignment error:", error);

      window.alert(
        error.response?.data?.message ||
        "Unable to assign table. Please try again."
      );

    } finally {
      setAssigning(false);
    }
  };

  return (
    <AdminLayout
      role="Staff"
      title="Table & Queue Management"
    >
      <h1>Tables & Queue</h1>

      <p className="muted-text">
        Seat guests in arrival order when a suitable table is available.
      </p>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadData}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <p>Loading tables and queue...</p>
        </div>
      ) : (
        <>
          {/* Restaurant Tables */}
          <section className="panel">
            <h2>Restaurant Tables</h2>

            <TableGrid
              tables={tables}
              onSeatNext={seatNextParty}
              assigning={assigning}
            />
          </section>

          {/* Customer Queue */}
          <section className="panel section-gap">
            <h2>Customer Queue</h2>

            <QueueTable
              queue={queue}
            />
          </section>
        </>
      )}
    </AdminLayout>
  );
}