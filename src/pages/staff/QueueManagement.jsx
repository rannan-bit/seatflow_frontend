import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, RefreshCw } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import {
  getAllQueuesAPI,
  getAllTablesAPI,
  assignTableAPI,
  updateQueueStatusAPI
} from "../../services/allAPI.js";

const STATUS_FILTERS = ["All", "Waiting", "Assigned", "Seated", "Completed", "Cancelled"];

const STATUS_CLASS = {
  Waiting: "waiting",
  Assigned: "reserved",
  Seated: "occupied",
  Completed: "available",
  Cancelled: "occupied"
};

function getErrorMessage(response, fallback) {
  const data = response?.response?.data ?? response?.data;
  if (typeof data === "string" && data.trim()) {
    return data;
  }
  return data?.message || fallback;
}

function formatJoined(date) {
  if (!date) {
    return "—";
  }
  return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function QueueManagement() {
  const [queue, setQueue] = useState([]);
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);

  const [busyId, setBusyId] = useState(null);
  const [tableChoices, setTableChoices] = useState({});
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let active = true;

    async function loadData() {
      const [queueResponse, tableResponse] = await Promise.all([
        getAllQueuesAPI(),
        getAllTablesAPI()
      ]);

      if (!active) {
        return;
      }

      const queueOk = queueResponse?.status === 200 && Array.isArray(queueResponse.data);
      const tablesOk = tableResponse?.status === 200 && Array.isArray(tableResponse.data);

      if (queueOk) {
        setQueue(queueResponse.data);
      }
      if (tablesOk) {
        setTables(tableResponse.data);
      }

      const status = [queueResponse, tableResponse].map((response) => response?.response?.status);
      setUnauthorized(status.includes(401));

      if (queueOk && tablesOk) {
        setError("");
      } else {
        setError(getErrorMessage(
          queueOk ? tableResponse : queueResponse,
          "We couldn't load the queue. Please try again."
        ));
      }

      setLoading(false);
      setRefreshing(false);
    }

    loadData();

    return () => {
      active = false;
    };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setActionError("");
    setRefreshKey((key) => key + 1);
  }

  // Tables that are free and big enough for one party, smallest fit first
  function suitableTables(entry) {
    return tables
      .filter((table) => table.status === "Available" && table.capacity >= entry.guests)
      .sort((a, b) => a.capacity - b.capacity || a.tableNumber - b.tableNumber);
  }

  function selectedTableId(entry) {
    const suitable = suitableTables(entry);
    const chosen = tableChoices[entry._id];
    if (chosen && suitable.some((table) => table._id === chosen)) {
      return chosen;
    }
    return suitable[0]?._id || "";
  }

  async function assignTable(entry) {
    const tableId = selectedTableId(entry);

    if (!tableId) {
      setActionError(`No available table can seat ${entry.guests} guests right now.`);
      return;
    }

    setBusyId(entry._id);
    setActionError("");

    const response = await assignTableAPI({ queueId: entry._id, tableId });

    if (response?.status >= 200 && response?.status < 300) {
      setTableChoices((choices) => {
        const next = { ...choices };
        delete next[entry._id];
        return next;
      });
      refresh();
    } else {
      setActionError(getErrorMessage(response, "Failed to assign the table. Please try again."));
    }

    setBusyId(null);
  }

  async function changeStatus(entry, status) {
    if (status === "Cancelled" && !window.confirm(`Cancel ${entry.customerName}'s queue entry?`)) {
      return;
    }

    setBusyId(entry._id);
    setActionError("");

    const response = await updateQueueStatusAPI(entry._id, status);

    if (response?.status >= 200 && response?.status < 300) {
      refresh();
    } else {
      setActionError(getErrorMessage(response, `Failed to update the queue entry to ${status}.`));
    }

    setBusyId(null);
  }

  const searchKey = search.trim().toLowerCase();
  const visibleQueue = queue.filter((entry) => {
    const matchesStatus = statusFilter === "All" || entry.status === statusFilter;
    const matchesSearch = !searchKey
      || String(entry.customerName || "").toLowerCase().includes(searchKey)
      || String(entry.token || "").toLowerCase().includes(searchKey);
    return matchesStatus && matchesSearch;
  });

  const waitingCount = queue.filter((entry) => entry.status === "Waiting").length;
  const assignedCount = queue.filter((entry) => entry.status === "Assigned").length;
  const seatedCount = queue.filter((entry) => entry.status === "Seated").length;
  const availableTableCount = tables.filter((table) => table.status === "Available").length;

  return (
    <AdminLayout role="Staff" title="Queue management">
      <h1>Queue management</h1>
      <p className="muted-text">
        {waitingCount} waiting · {assignedCount} assigned · {seatedCount} seated · {availableTableCount} tables free
      </p>

      {unauthorized && (
        <div className="info-box">
          <strong>Please sign in to manage the queue.</strong>
          <p><Link className="text-link" to="/staff-login">Go to staff login →</Link></p>
        </div>
      )}

      <section className="panel">
        <div className="queue-toolbar">
          <div className="search-box queue-search">
            <Search size={15} />
            <input
              placeholder="Search by customer name or token…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <button className="button button-outline" onClick={refresh} disabled={refreshing || loading}>
            <RefreshCw size={14} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        <div className="category-chips">
          {STATUS_FILTERS.map((item) => (
            <button
              key={item}
              className={statusFilter === item ? "selected" : ""}
              onClick={() => setStatusFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {actionError && <p className="form-error">{actionError}</p>}
        {error && !actionError && <p className="form-error">{error}</p>}

        {loading ? (
          <p className="empty-state">Loading the queue…</p>
        ) : visibleQueue.length === 0 ? (
          <p className="empty-state">
            {queue.length === 0
              ? "No customers have checked in yet."
              : "No queue entries match your search or filter."}
          </p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TOKEN / GUEST</th>
                  <th>PARTY</th>
                  <th>CHECKED IN</th>
                  <th>TABLE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {visibleQueue.map((entry) => {
                  const suitable = suitableTables(entry);
                  const busy = busyId === entry._id;
                  const assignedTable = entry.assignedTable;

                  return (
                    <tr key={entry._id}>
                      <td>
                        <strong>{entry.token}</strong>
                        <small>{entry.customerName} · {entry.phone}</small>
                      </td>
                      <td>{entry.guests} guests</td>
                      <td>{formatJoined(entry.joinedAt)}</td>
                      <td>{assignedTable ? `Table ${assignedTable.tableNumber}` : "—"}</td>
                      <td>
                        <span className={`status-pill ${STATUS_CLASS[entry.status] || "waiting"}`}>
                          ● {entry.status}
                        </span>
                      </td>
                      <td>
                        <div className="queue-actions">
                          {entry.status === "Waiting" && (
                            <>
                              <select
                                aria-label={`Table for ${entry.customerName}`}
                                value={selectedTableId(entry)}
                                onChange={(event) => setTableChoices((choices) => ({
                                  ...choices,
                                  [entry._id]: event.target.value
                                }))}
                                disabled={busy || suitable.length === 0}
                              >
                                {suitable.length === 0
                                  ? <option value="">No fitting table</option>
                                  : suitable.map((table) => (
                                    <option key={table._id} value={table._id}>
                                      Table {table.tableNumber} · {table.capacity} seats
                                    </option>
                                  ))}
                              </select>
                              <button
                                className="button"
                                onClick={() => assignTable(entry)}
                                disabled={busy || suitable.length === 0}
                              >
                                Assign
                              </button>
                            </>
                          )}

                          {entry.status === "Assigned" && (
                            <button
                              className="button"
                              onClick={() => changeStatus(entry, "Seated")}
                              disabled={busy}
                            >
                              Mark seated
                            </button>
                          )}

                          {entry.status === "Seated" && (
                            <button
                              className="button"
                              onClick={() => changeStatus(entry, "Completed")}
                              disabled={busy}
                            >
                              Complete visit
                            </button>
                          )}

                          {(entry.status === "Waiting" || entry.status === "Assigned" || entry.status === "Seated") && (
                            <button
                              className="button button-outline"
                              onClick={() => changeStatus(entry, "Cancelled")}
                              disabled={busy}
                            >
                              Cancel
                            </button>
                          )}

                          {(entry.status === "Completed" || entry.status === "Cancelled") && (
                            <span className="queue-no-action">No actions</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </AdminLayout>
  );
}
