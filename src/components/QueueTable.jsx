import React from "react";

const STATUS_CLASS = {
  Waiting: "waiting",
  Assigned: "reserved",
  Seated: "occupied",
  Completed: "available",
  Cancelled: "occupied"
};

function formatTime(date) {
  if (!date) return "—";
  try {
    const d = new Date(date);
    if (isNaN(d.getTime())) return String(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return String(date);
  }
}

export default function QueueTable({ queue = [], loading = false }) {
  if (loading) {
    return <p className="empty-state">Loading live queue…</p>;
  }

  if (!queue || queue.length === 0) {
    return <p className="empty-state">No customers in the queue right now.</p>;
  }

  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>TOKEN / GUEST</th>
            <th>PARTY</th>
            <th>CHECK-IN</th>
            <th>TABLE</th>
            <th>STATUS</th>
          </tr>
        </thead>
        <tbody>
          {queue.map((guest) => {
            const id = guest._id || guest.id;
            const token = guest.token || guest.id || "—";
            const name = guest.customerName || guest.name || "Guest";
            const guestsCount = guest.guests || 1;
            const time = formatTime(guest.joinedAt || guest.time || guest.createdAt);
            const status = guest.status || "Waiting";
            const table = guest.assignedTable
              ? typeof guest.assignedTable === "object"
                ? `Table ${guest.assignedTable.tableNumber}`
                : `Table ${guest.assignedTable}`
              : "—";

            return (
              <tr key={id}>
                <td>
                  <strong>{token}</strong>
                  <small>
                    {name}
                    {guest.phone ? ` · ${guest.phone}` : ""}
                  </small>
                </td>
                <td>{guestsCount} {guestsCount === 1 ? "guest" : "guests"}</td>
                <td>{time}</td>
                <td>{table}</td>
                <td>
                  <span className={`status-pill ${STATUS_CLASS[status] || "waiting"}`}>
                    ● {status}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
