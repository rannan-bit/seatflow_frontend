import AdminLayout from "../../components/AdminLayout.jsx";
import StatsCards from "../../components/StatsCards.jsx";
import QueueTable from "../../components/QueueTable.jsx";
import { initialQueue } from "../../data/initialData.js";
import { Link } from "react-router-dom";

export default function StaffDashboard() {
  return (
    <AdminLayout role="Staff" title="Dashboard">
      <h1>Good afternoon 👋</h1>
      <p className="muted-text">Here’s what’s happening at The Olive Room today.</p>
      <StatsCards />
      <section className="panel"><h2>Waiting queue</h2><QueueTable queue={initialQueue} /><Link className="text-link" to="/staff/tables">Manage queue →</Link></section>
    </AdminLayout>
  );
}