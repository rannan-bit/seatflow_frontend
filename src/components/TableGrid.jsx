import { Armchair } from "lucide-react";

export default function TableGrid({ tables, onToggle, onSeatNext, admin = false }) {
  return (
    <div className="table-grid">
      {tables.map((table) => (
        <article className="table-card" key={table.id}>
          <div className="table-card-top">
            <Armchair size={20} />
            <span className={`status-pill ${table.status === "Available" ? "available" : table.status === "Occupied" ? "occupied" : "waiting"}`}>
              {table.status}
            </span>
          </div>
          <h3>Table {String(table.id).padStart(2, "0")}</h3>
          <p>Seats up to {table.capacity} guests</p>
          <button className="button button-outline full-width" onClick={() => admin ? onToggle(table.id) : table.status === "Available" ? onSeatNext(table.id) : onToggle(table.id)}>
            {admin ? "Toggle status" : table.status === "Available" ? "Seat next party" : "Mark available"}
          </button>
        </article>
      ))}
    </div>
  );
}