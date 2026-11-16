import { useState } from "react";
import { Armchair, Pencil, Check, X, Trash2 } from "lucide-react";

// Tables saved in MongoDB use `_id` / `tableNumber`; the demo staff page still
// uses the older `id` shape. These helpers keep both working.
function tableKey(table) {
  return table._id ?? table.id;
}

function tableNumber(table) {
  return table.tableNumber ?? table.id;
}

export default function TableGrid({
  tables,
  onToggle,
  onSeatNext,
  onUpdate,
  onDelete,
  admin = false,
  busyId = null
}) {
  const [editingId, setEditingId] = useState(null);
  const [editCapacity, setEditCapacity] = useState("");
  const [editStatus, setEditStatus] = useState("Available");
  const [saving, setSaving] = useState(false);

  function startEditing(table) {
    setEditingId(tableKey(table));
    setEditCapacity(table.capacity);
    setEditStatus(table.status);
  }

  async function handleSave(id) {
    const parsedCapacity = Number(editCapacity);
    if (!parsedCapacity || parsedCapacity <= 0) {
      alert("Please enter a valid seating capacity (minimum 1).");
      return;
    }
    if (onUpdate) {
      setSaving(true);
      const result = await onUpdate(id, { capacity: parsedCapacity, status: editStatus });
      setSaving(false);
      // The parent returns false when the API call fails, so keep the form open.
      if (result === false) {
        return;
      }
    }
    setEditingId(null);
  }

  function handleCancel() {
    setEditingId(null);
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "Available":
        return "available";
      case "Occupied":
        return "occupied";
      case "Reserved":
        return "reserved";
      default:
        return "waiting";
    }
  };

  return (
    <div className="table-grid">
      {tables.map((table) => {
        const key = tableKey(table);
        const displayNumber = String(tableNumber(table)).padStart(2, "0");
        const isBusy = busyId === key;
        const isEditing = admin && editingId === key;

        if (isEditing) {
          return (
            <article
              className="table-card"
              key={key}
              style={{ borderColor: "#2864ed", boxShadow: "0 0 0 1px #2864ed" }}
            >
              <div className="table-card-top">
                <Armchair size={20} />
                <span style={{ fontSize: "9px", fontWeight: "700", color: "#2864ed" }}>Editing</span>
              </div>
              <h3 style={{ margin: "10px 0 8px" }}>Table {displayNumber}</h3>

              <label style={{ display: "block", fontSize: "9px", color: "#8490a4", marginBottom: "3px" }}>
                Capacity (guests)
              </label>
              <input
                type="number"
                min="1"
                value={editCapacity}
                onChange={(e) => setEditCapacity(e.target.value)}
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "7px 8px",
                  border: "1px solid #e1e7f0",
                  borderRadius: "6px",
                  fontSize: "11px",
                  marginBottom: "8px",
                  boxSizing: "border-box"
                }}
              />

              <label style={{ display: "block", fontSize: "9px", color: "#8490a4", marginBottom: "3px" }}>
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "7px 8px",
                  border: "1px solid #e1e7f0",
                  borderRadius: "6px",
                  fontSize: "11px",
                  marginBottom: "10px",
                  boxSizing: "border-box"
                }}
              >
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Reserved">Reserved</option>
              </select>

              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="button"
                  style={{ flex: 1, padding: "7px 4px", fontSize: "10px" }}
                  onClick={() => handleSave(key)}
                  disabled={saving}
                >
                  <Check size={12} /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  style={{ flex: 1, padding: "7px 4px", fontSize: "10px" }}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={12} /> Cancel
                </button>
              </div>

              {onDelete && (
                <button
                  type="button"
                  className="remove-button full-width"
                  style={{ marginTop: "6px", justifyContent: "center" }}
                  onClick={() => onDelete(key)}
                  disabled={isBusy || saving || table.status === "Occupied"}
                  title={table.status === "Occupied" ? "Occupied tables cannot be removed" : undefined}
                >
                  <Trash2 size={12} /> Remove table
                </button>
              )}
            </article>
          );
        }

        return (
          <article className="table-card" key={key}>
            <div className="table-card-top">
              <Armchair size={20} />
              <button
                type="button"
                className={`status-pill ${getStatusClass(table.status)}`}
                onClick={() => admin && onToggle && !isBusy && onToggle(key)}
                style={{ border: "none", cursor: admin && !isBusy ? "pointer" : "default" }}
                title={admin ? "Click to toggle: Available → Occupied → Reserved" : undefined}
                disabled={isBusy}
              >
                ● {isBusy ? "Saving…" : table.status}
              </button>
            </div>
            <h3>Table {displayNumber}</h3>
            <p>Seats up to {table.capacity} guests</p>

            {admin ? (
              <div style={{ display: "flex", gap: "6px", marginTop: "8px" }}>
                <button
                  type="button"
                  className="button button-outline"
                  style={{ flex: 1, padding: "8px 4px", fontSize: "9px" }}
                  onClick={() => onToggle(key)}
                  disabled={isBusy}
                  title="Cycle status: Available → Occupied → Reserved"
                >
                  {isBusy ? "Saving…" : "Toggle status"}
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ flex: 1, padding: "8px 4px", fontSize: "9px" }}
                  onClick={() => startEditing(table)}
                  disabled={isBusy}
                  title="Edit capacity and status"
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
            ) : (
              <button
                className="button button-outline full-width"
                onClick={() =>
                  table.status === "Available" ? onSeatNext(key) : onToggle(key)
                }
              >
                {table.status === "Available" ? "Seat next party" : "Mark available"}
              </button>
            )}
          </article>
        );
      })}
    </div>
  );
}
