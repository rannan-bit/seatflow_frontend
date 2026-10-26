import AdminLayout from "../../components/AdminLayout.jsx";
import TableGrid from "../../components/TableGrid.jsx";

export default function TableManagement({ tables, setTables }) {
  function toggleTable(id) {
    setTables((items) => items.map((table) => table.id === id ? { ...table, status: table.status === "Available" ? "Occupied" : "Available" } : table));
  }
  function addTable() {
    setTables((items) => [...items, { id: Math.max(0, ...items.map((table) => table.id)) + 1, capacity: 4, status: "Available" }]);
  }

  return (
    <AdminLayout role="Admin" title="Table management">
      <h1>Table management</h1><p className="muted-text">Manage seating capacity and table status.</p>
      <section className="panel"><TableGrid tables={tables} onToggle={toggleTable} admin /></section>
      <button className="button section-gap" onClick={addTable}>+ Add table</button>
    </AdminLayout>
  );
}