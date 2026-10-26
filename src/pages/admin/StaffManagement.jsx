import { useState } from "react";
import { Trash2 } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";

export default function StaffManagement() {
  const [staff, setStaff] = useState([
    { id: 1, name: "Nisha Patel", email: "nisha@olive-room.com" },
    { id: 2, name: "Rahul Menon", email: "rahul@olive-room.com" }
  ]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  function addStaff() {
    if (!name.trim() || !email.includes("@")) return;
    setStaff((items) => [...items, { id: Date.now(), name, email }]);
    setName(""); setEmail("");
  }

  return (
    <AdminLayout role="Admin" title="Staff management">
      <h1>Staff management</h1><p className="muted-text">Manage staff access for The Olive Room.</p>
      <section className="panel form-row">
        <input placeholder="Full name" value={name} onChange={(event) => setName(event.target.value)} />
        <input placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} />
        <button className="button" onClick={addStaff}>+ Add staff</button>
      </section>
      <section className="panel section-gap"><div className="table-scroll"><table>
        <thead><tr><th>TEAM MEMBER</th><th>EMAIL</th><th>ROLE</th><th>ACTION</th></tr></thead>
        <tbody>{staff.map((member) => <tr key={member.id}><td>{member.name}</td><td>{member.email}</td><td>Staff</td><td><button className="remove-button" onClick={() => setStaff((items) => items.filter((item) => item.id !== member.id))}><Trash2 size={14} /> Remove</button></td></tr>)}</tbody>
      </table></div></section>
    </AdminLayout>
  );
}