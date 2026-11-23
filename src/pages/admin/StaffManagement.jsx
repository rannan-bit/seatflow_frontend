import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, Eye, EyeOff, Pencil, RefreshCw, Check, X, UserPlus } from "lucide-react";
import AdminLayout from "../../components/AdminLayout.jsx";
import {
  addStaffAPI,
  getAllStaffAPI,
  updateStaffAPI,
  deleteStaffAPI
} from "../../services/allAPI.js";

function getErrorMessage(response, fallback) {
  const data = response?.response?.data ?? response?.data;
  if (typeof data === "string" && data.trim()) return data;
  return data?.message || fallback;
}

function formatJoined(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString([], { day: "2-digit", month: "short", year: "numeric" });
}

export default function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [unauthorized, setUnauthorized] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    let active = true;

    async function loadStaff() {
      const response = await getAllStaffAPI();
      if (!active) return;
      if (response?.status === 200 && Array.isArray(response.data)) {
        setStaff(response.data);
        setError("");
      } else {
        setError(getErrorMessage(response, "We couldn't load the staff accounts. Please try again."));
      }
      setUnauthorized(response?.response?.status === 401);
      setLoading(false);
      setRefreshing(false);
    }

    loadStaff();
    return () => { active = false; };
  }, [refreshKey]);

  function refresh() {
    setRefreshing(true);
    setActionError("");
    setRefreshKey((k) => k + 1);
  }

  async function addStaff(event) {
    event.preventDefault();
    if (submitting) return;
    if (!name.trim() || !email.includes("@") || !password.trim()) {
      setActionError("Enter a name, a valid email address and a password.");
      return;
    }
    setSubmitting(true);
    setActionError("");
    setSuccessMessage("");
    const response = await addStaffAPI({ name: name.trim(), email: email.trim(), password });
    if (response?.status === 201) {
      setName(""); setEmail(""); setPassword(""); setShowPassword(false);
      setSuccessMessage(response.data?.message || "Staff account created successfully.");
      refresh();
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to add the staff account. Please try again."));
    }
    setSubmitting(false);
  }

  function startEditing(member) {
    setEditingId(member._id);
    setEditName(member.name || "");
    setEditEmail(member.email || "");
    setEditPassword("");
    setShowEditPassword(false);
    setActionError("");
    setSuccessMessage("");
  }

  function cancelEditing() {
    setEditingId(null);
    setEditName(""); setEditEmail(""); setEditPassword("");
    setShowEditPassword(false);
  }

  async function saveEdit(member) {
    if (!editName.trim() || !editEmail.includes("@")) {
      setActionError("Enter a name and a valid email address.");
      return;
    }
    setSavingId(member._id);
    setActionError("");
    setSuccessMessage("");
    const updates = { name: editName.trim(), email: editEmail.trim() };
    if (editPassword.trim()) updates.password = editPassword;
    const response = await updateStaffAPI(member._id, updates);
    if (response?.status === 200) {
      cancelEditing();
      setSuccessMessage(response.data?.message || "Staff account updated successfully.");
      refresh();
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to update the staff account. Please try again."));
    }
    setSavingId(null);
  }

  async function removeStaff(member) {
    if (deletingId) return;
    if (!window.confirm(`Delete ${member.name}'s staff account? They will no longer be able to sign in.`)) return;
    setDeletingId(member._id);
    setActionError("");
    setSuccessMessage("");
    const response = await deleteStaffAPI(member._id);
    if (response?.status === 200) {
      if (editingId === member._id) cancelEditing();
      setSuccessMessage(response.data?.message || "Staff account deleted successfully.");
      refresh();
    } else {
      setUnauthorized(response?.response?.status === 401);
      setActionError(getErrorMessage(response, "Failed to delete the staff account. Please try again."));
    }
    setDeletingId(null);
  }

  return (
    <AdminLayout role="Admin" title="Staff management">
      <h1>Staff management</h1>
      <p className="muted-text">
        {loading
          ? "Loading staff accounts…"
          : `${staff.length} staff ${staff.length === 1 ? "account" : "accounts"} for The Olive Room.`}
      </p>

      {unauthorized && (
        <div className="info-box">
          <strong>Please sign in as an admin to manage staff accounts.</strong>
          <p><Link className="text-link" to="/admin-login">Go to admin login →</Link></p>
        </div>
      )}

      {/* Add staff form */}
      <section className="panel" style={{ marginBottom: 0 }}>
        <h2 style={{ marginBottom: 14 }}>Add team member</h2>
        <form className="form-row" onSubmit={addStaff}>
          <input
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ flex: "1 1 160px" }}
          />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ flex: "1 1 200px" }}
          />
          <div className="password-input-wrapper" style={{ flex: "1 1 180px" }}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%" }}
            />
            <button
              type="button"
              className="password-toggle-button"
              onClick={() => setShowPassword((p) => !p)}
              title={showPassword ? "Hide password" : "Show password"}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <button type="submit" className="button" disabled={submitting}>
            <UserPlus size={15} /> {submitting ? "Adding…" : "Add staff"}
          </button>
        </form>
        {actionError && <p className="form-error" style={{ marginTop: 10 }}>{actionError}</p>}
        {successMessage && <p className="form-success" style={{ marginTop: 10 }}>{successMessage}</p>}
        {error && !actionError && <p className="form-error" style={{ marginTop: 10 }}>{error}</p>}
      </section>

      <section className="panel section-gap">
        <div className="queue-toolbar staff-toolbar">
          <h2 style={{ margin: 0 }}>Staff accounts</h2>
          <button
            className="button button-outline"
            onClick={() => { setSuccessMessage(""); refresh(); }}
            disabled={refreshing || loading}
          >
            <RefreshCw size={14} /> {refreshing ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {loading ? (
          <p className="empty-state">Loading staff accounts…</p>
        ) : staff.length === 0 ? (
          <p className="empty-state">No staff accounts yet. Add your first team member above.</p>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>TEAM MEMBER</th>
                  <th>EMAIL / CREDENTIALS</th>
                  <th>ROLE</th>
                  <th>JOINED</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((member) => {
                  const editing = editingId === member._id;
                  const saving = savingId === member._id;
                  const deleting = deletingId === member._id;
                  const isAdmin = member.role === "admin";

                  return (
                    <tr key={member._id}>
                      <td>
                        {editing ? (
                          <input
                            className="staff-edit-input"
                            aria-label={`Name for ${member.name}`}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                          />
                        ) : (
                          <strong>{member.name}</strong>
                        )}
                      </td>
                      <td>
                        {editing ? (
                          <div className="staff-edit-fields">
                            <input
                              className="staff-edit-input"
                              type="email"
                              aria-label={`Email for ${member.name}`}
                              value={editEmail}
                              onChange={(e) => setEditEmail(e.target.value)}
                            />
                            <div className="password-input-wrapper">
                              <input
                                className="staff-edit-input"
                                type={showEditPassword ? "text" : "password"}
                                placeholder="New password (optional)"
                                aria-label={`New password for ${member.name}`}
                                value={editPassword}
                                onChange={(e) => setEditPassword(e.target.value)}
                              />
                              <button
                                type="button"
                                className="password-toggle-button"
                                onClick={() => setShowEditPassword((p) => !p)}
                                title={showEditPassword ? "Hide password" : "Show password"}
                              >
                                {showEditPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>
                        ) : (
                          member.email
                        )}
                      </td>
                      <td>
                        <span
                          className={isAdmin ? "role-badge role-badge-admin" : "role-badge role-badge-staff"}
                        >
                          {isAdmin ? "Admin" : "Staff"}
                        </span>
                      </td>
                      <td>{formatJoined(member.createdAt)}</td>
                      <td>
                        <div className="staff-row-actions">
                          {editing ? (
                            <>
                              <button
                                className="button"
                                onClick={() => saveEdit(member)}
                                disabled={saving}
                              >
                                <Check size={13} /> {saving ? "Saving…" : "Save"}
                              </button>
                              <button
                                className="button button-outline"
                                onClick={cancelEditing}
                                disabled={saving}
                              >
                                <X size={13} /> Cancel
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                className="button button-outline"
                                onClick={() => startEditing(member)}
                                disabled={saving || deleting}
                              >
                                <Pencil size={13} /> Edit
                              </button>
                              <button
                                className="remove-button"
                                onClick={() => removeStaff(member)}
                                disabled={deleting}
                              >
                                <Trash2 size={14} /> {deleting ? "Removing…" : "Remove"}
                              </button>
                            </>
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
