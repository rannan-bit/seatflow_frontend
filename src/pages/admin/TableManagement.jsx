import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Plus, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import TableGrid from "../../components/TableGrid.jsx";
import {
  getAllTablesAPI,
  addTableAPI,
  updateTableAPI,
  deleteTableAPI,
  changeTableStatusAPI
} from "../../services/allAPI.js";

const STATUS_CYCLE = {
  Available: "Occupied",
  Occupied: "Reserved",
  Reserved: "Available"
};

function getErrorMessage(response, fallback) {
  const data = response?.response?.data ?? response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  return data?.message || fallback;
}

export default function TableManagement() {
  const [tables, setTables] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // Add-table form. The table number is optional; the backend assigns the next one.
  const [tableNumber, setTableNumber] = useState("");
  const [capacity, setCapacity] = useState("");
  const [status, setStatus] = useState("Available");
  const [adding, setAdding] = useState(false);

  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadTables() {
      const response = await getAllTablesAPI();

      if (!active) {
        return;
      }

      if (response?.status === 200 && Array.isArray(response.data)) {
        setTables(response.data);
        setError("");
      } else {
        setError(getErrorMessage(response, "We couldn't load the tables. Please try again."));
      }

      setUnauthorized(response?.response?.status === 401);
      setLoading(false);
      setRefreshing(false);
    }

    loadTables();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setActionError("");
    setRefreshKey((key) => key + 1);
  }

  async function addTable(event) {
    event.preventDefault();

    if (adding) {
      return;
    }

    const numericCapacity = Number(capacity);

    if (Number.isNaN(numericCapacity) || numericCapacity < 1) {
      setActionError("Enter a seating capacity of at least 1.");
      return;
    }

    const trimmedNumber = tableNumber.trim();
    let numericNumber;

    if (trimmedNumber) {
      numericNumber = Number(trimmedNumber);
      if (!Number.isInteger(numericNumber) || numericNumber < 1) {
        setActionError("Table number must be a whole number of at least 1, or leave it empty to auto-assign.");
        return;
      }
    }

    setAdding(true);
    setActionError("");
    setSuccessMessage("");

    const response = await addTableAPI({
      tableNumber: trimmedNumber ? numericNumber : undefined,
      capacity: numericCapacity,
      status
    });

    if (response?.status === 201 && response.data?.table) {
      setSuccessMessage(response.data.message || "Table added successfully");
      setTableNumber("");
      setCapacity("");
      setStatus("Available");
      refresh();
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to add the table. Please try again."));
    }

    setAdding(false);
  }

  async function toggleTable(id) {
    const table = tables.find((item) => item._id === id);

    if (!table || busyId) {
      return;
    }

    const nextStatus = STATUS_CYCLE[table.status] || "Available";

    setBusyId(id);
    setActionError("");
    setSuccessMessage("");

    const response = await changeTableStatusAPI(id, nextStatus);

    if (response?.status === 200 && response.data?.table) {
      const updated = response.data.table;
      setTables((items) => items.map((item) => (item._id === id ? { ...item, ...updated } : item)));
      setSuccessMessage(`Table ${table.tableNumber} is now ${updated.status}.`);
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to change the table status. Please try again."));
    }

    setBusyId(null);
  }

  // Called by TableGrid. Returning false keeps the inline edit form open.
  async function updateTable(id, updates) {
    setBusyId(id);
    setActionError("");
    setSuccessMessage("");

    const response = await updateTableAPI(id, updates);

    if (response?.status === 200 && response.data?.table) {
      const updated = response.data.table;
      setTables((items) => items.map((item) => (item._id === id ? { ...item, ...updated } : item)));
      setSuccessMessage(response.data.message || "Table updated successfully");
      setBusyId(null);
      return true;
    }

    setUnauthorized(response?.response?.status === 401);
    setActionError(getErrorMessage(response, "Failed to update the table. Please try again."));
    setBusyId(null);
    return false;
  }

  async function deleteTable(id) {
    const table = tables.find((item) => item._id === id);

    if (!table || busyId) {
      return;
    }

    if (!window.confirm(`Remove table ${table.tableNumber}? This cannot be undone.`)) {
      return;
    }

    setBusyId(id);
    setActionError("");
    setSuccessMessage("");

    const response = await deleteTableAPI(id);

    if (response?.status === 200) {
      setTables((items) => items.filter((item) => item._id !== id));
      setSuccessMessage(response.data?.message || "Table deleted successfully");
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to delete the table. Please try again."));
    }

    setBusyId(null);
  }

  const availableCount = tables.filter((table) => table.status === "Available").length;
  const occupiedCount = tables.filter((table) => table.status === "Occupied").length;
  const reservedCount = tables.filter((table) => table.status === "Reserved").length;

  return (
    <AdminLayout role="Admin" title="Table management">
      <h1>Table management</h1>
      <p className="muted-text">
        {loading
          ? "Loading the tables…"
          : `${tables.length} ${tables.length === 1 ? "table" : "tables"} · ${availableCount} available · ${occupiedCount} occupied · ${reservedCount} reserved.`}
      </p>

      {unauthorized && (
        <div className="info-box">
          <strong>Please sign in as an admin to manage tables.</strong>
          <p><Link className="text-link" to="/admin-login">Go to admin login →</Link></p>
        </div>
      )}

      <form className="panel form-row" onSubmit={addTable}>
        <input
          type="number"
          min="1"
          placeholder="Table number (optional)"
          value={tableNumber}
          onChange={(event) => setTableNumber(event.target.value)}
        />
        <input
          type="number"
          min="1"
          placeholder="Seating capacity (e.g. 4)"
          value={capacity}
          onChange={(event) => setCapacity(event.target.value)}
          required
        />
        <select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="Available">Status: Available</option>
          <option value="Occupied">Status: Occupied</option>
          <option value="Reserved">Status: Reserved</option>
        </select>
        <button type="submit" className="button" disabled={adding}>
          <Plus size={14} /> {adding ? "Adding…" : "Add table"}
        </button>
      </form>

      {actionError && <p className="form-error">{actionError}</p>}
      {successMessage && <p className="form-success">{successMessage}</p>}
      {error && !actionError && <p className="form-error">{error}</p>}

      <section className="panel section-gap">
        <div className="queue-toolbar menu-toolbar">
          <span className="muted-text" style={{ margin: 0 }}>
            Click a status pill or “Toggle status” to move a table through Available → Occupied → Reserved.
          </span>
          <button
            className="button button-outline"
            onClick={() => { setSuccessMessage(""); refresh(); }}
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading the tables…</p>
        ) : tables.length === 0 ? (
          <p className="empty-state">No tables yet. Add your first table above.</p>
        ) : (
          <TableGrid
            tables={tables}
            onToggle={toggleTable}
            onUpdate={updateTable}
            onDelete={deleteTable}
            busyId={busyId}
            admin
          />
        )}
      </section>
    </AdminLayout>
  );
}
