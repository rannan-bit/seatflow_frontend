import { useState } from "react";
import { Armchair, Pencil, Check, X, Trash2 } from "lucide-react";

function tableKey(table) { return table._id ?? table.id; }
function tableNumber(table) { return table.tableNumber ?? table.id; }

const STATUS_COLORS = {
  Available: { pill: "available", accent: "#15694e", bg: "#e4f4ec" },
  Occupied:  { pill: "occupied",  accent: "#a63434", bg: "#fdf0f0" },
  Reserved:  { pill: "reserved",  accent: "#1a5fa8", bg: "#eaf2fb" }
};

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
      if (result === false) return;
    }
    setEditingId(null);
  }

  function handleCancel() { setEditingId(null); }

  const getStatusClass = (status) => {
    switch (status) {
      case "Available": return "available";
      case "Occupied":  return "occupied";
      case "Reserved":  return "reserved";
      default:          return "waiting";
    }
  };

  return (
    <div className="table-grid">
      {tables.map((table) => {
        const key = tableKey(table);
        const displayNumber = String(tableNumber(table)).padStart(2, "0");
        const isBusy = busyId === key;
        const isEditing = admin && editingId === key;
        const statusColors = STATUS_COLORS[table.status] || STATUS_COLORS.Available;

        if (isEditing) {
          return (
            <article
              className="table-card"
              key={key}
              style={{ borderColor: "var(--color-primary)", boxShadow: "0 0 0 2px rgb(21 105 78 / 15%)" }}
            >
              <div className="table-card-top">
                <Armchair size={18} />
                <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--color-primary)", letterSpacing: "0.5px" }}>
                  EDITING
                </span>
              </div>
              <h3 style={{ margin: "8px 0 12px", fontSize: "14px" }}>Table {displayNumber}</h3>

              <label style={{ display: "block", fontSize: "11px", color: "var(--color-muted)", marginBottom: "4px", fontWeight: 600 }}>
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
                  padding: "8px 10px",
                  border: "1px solid var(--color-line)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  marginBottom: "10px",
                  boxSizing: "border-box",
                  outline: "none"
                }}
              />

              <label style={{ display: "block", fontSize: "11px", color: "var(--color-muted)", marginBottom: "4px", fontWeight: 600 }}>
                Status
              </label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value)}
                style={{
                  width: "100%",
                  minWidth: 0,
                  padding: "8px 10px",
                  border: "1px solid var(--color-line)",
                  borderRadius: "var(--radius-sm)",
                  fontSize: "13px",
                  marginBottom: "12px",
                  boxSizing: "border-box",
                  outline: "none",
                  background: "white"
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
                  style={{ flex: 1, minHeight: "34px", padding: "6px 8px", fontSize: "12px" }}
                  onClick={() => handleSave(key)}
                  disabled={saving}
                >
                  <Check size={13} /> {saving ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  className="button button-outline"
                  style={{ flex: 1, minHeight: "34px", padding: "6px 8px", fontSize: "12px" }}
                  onClick={handleCancel}
                  disabled={saving}
                >
                  <X size={13} /> Cancel
                </button>
              </div>

              {onDelete && (
                <button
                  type="button"
                  className="remove-button full-width"
                  style={{ marginTop: "8px", justifyContent: "center" }}
                  onClick={() => onDelete(key)}
                  disabled={isBusy || saving || table.status === "Occupied"}
                  title={table.status === "Occupied" ? "Occupied tables cannot be removed" : undefined}
                >
                  <Trash2 size={13} /> Remove table
                </button>
              )}
            </article>
          );
        }

        return (
          <article
            className="table-card"
            key={key}
            style={{ borderLeft: `3px solid ${statusColors.accent}` }}
          >
            <div className="table-card-top">
              <Armchair size={18} style={{ color: statusColors.accent }} />
              <button
                type="button"
                className={`status-pill ${getStatusClass(table.status)}`}
                onClick={() => admin && onToggle && !isBusy && onToggle(key)}
                style={{ border: "none", cursor: admin && !isBusy ? "pointer" : "default" }}
                title={admin ? "Click to toggle: Available → Occupied → Reserved" : undefined}
                disabled={isBusy}
              >
                {isBusy ? "Saving…" : table.status}
              </button>
            </div>
            <h3 style={{ margin: "10px 0 3px" }}>Table {displayNumber}</h3>
            <p>Seats up to {table.capacity} guests</p>

            {admin ? (
              <div style={{ display: "flex", gap: "6px" }}>
                <button
                  type="button"
                  className="button button-outline"
                  style={{ flex: 1, minHeight: "34px", padding: "6px 6px", fontSize: "11.5px" }}
                  onClick={() => onToggle(key)}
                  disabled={isBusy}
                  title="Cycle status: Available → Occupied → Reserved"
                >
                  {isBusy ? "Saving…" : "Toggle"}
                </button>
                <button
                  type="button"
                  className="button"
                  style={{ flex: 1, minHeight: "34px", padding: "6px 6px", fontSize: "11.5px" }}
                  onClick={() => startEditing(table)}
                  disabled={isBusy}
                >
                  <Pencil size={12} /> Edit
                </button>
              </div>
            ) : (
              <button
                className="button button-outline full-width"
                style={{ minHeight: "34px", fontSize: "12px" }}
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
