import AdminLayout from "../../components/AdminLayout.jsx";
import TableGrid from "../../components/TableGrid.jsx";
import QueueTable from "../../components/QueueTable.jsx";

export default function TableQueue({ tables, setTables, queue, setQueue }) {
  function toggleTable(id) {
    setTables((items) => items.map((table) => table.id === id ? { ...table, status: table.status === "Available" ? "Occupied" : "Available" } : table));
  }

  function seatNextParty(tableId) {
    const table = tables.find((item) => item.id === tableId);
    const guest = queue.find((item) => item.status === "Waiting" && item.guests <= table.capacity);
    if (!guest) {
      window.alert("No waiting party fits this table.");
      return;
    }
    setTables((items) => items.map((item) => item.id === tableId ? { ...item, status: "Occupied" } : item));
    setQueue((items) => items.map((item) => item.id === guest.id ? { ...item, status: `Seated at T${tableId}` } : item));
  }

  return (
    <AdminLayout role="Staff" title="Table & Queue Management">
      <h1>Tables & queue</h1>
      <p className="muted-text">Seat guests in arrival order when a suitable table is available.</p>
      <section className="panel"><h2>Restaurant tables</h2><TableGrid tables={tables} onToggle={toggleTable} onSeatNext={seatNextParty} /></section>
      <section className="panel section-gap"><h2>Customer queue</h2><QueueTable queue={queue} /></section>
    </AdminLayout>
  );
}