import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Brand from "../components/Brand.jsx";
import { loginAPI } from "../services/allAPI.js";

export default function Login({ role }) {
  const [email, setEmail] = useState(role === "Admin" ? "admin@olive-room.com" : "");
  const [password, setPassword] = useState("seatflow123");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function signIn(event) {
    event.preventDefault();

    if (submitting) {
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      const response = await loginAPI({ email: email.trim(), password });
      const data = response?.data;

      if (response?.status !== 200 || !data?.token) {
        const message = typeof response?.response?.data === "string"
          ? response.response.data
          : response?.response?.data?.message || data?.message;
        setError(message || "Sign in failed. Please check your email and password.");
        return;
      }

      // Only let the right roles into each workspace
      const allowedRoles = role === "Admin" ? ["admin"] : ["staff", "admin"];
      if (!allowedRoles.includes(data.user?.role)) {
        setError(`This account doesn't have access to the ${role} workspace.`);
        return;
      }

      // The axios request interceptor attaches this token automatically
      sessionStorage.setItem("token", data.token);
      sessionStorage.setItem("seatflowUser", JSON.stringify(data.user));

      navigate(role === "Admin" ? "/admin" : "/staff");
    }
    catch (err) {
      setError(err?.response?.data?.message || "Sign in failed. Please try again.");
    }
    finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={signIn}>
        <Brand />
        <span className="login-icon"><ShieldCheck size={24} /></span>
        <h1>{role} login</h1><p>Sign in to manage The Olive Room.</p>
        <label>Email address</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label>Password</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        {error && <p className="form-error">{error}</p>}
        <button className="button full-width" disabled={submitting}>
          {submitting ? "Signing in…" : <>Sign in <ArrowRight size={16} /></>}
        </button>
        <small>Use the {role.toLowerCase()} account created by your restaurant admin.</small>
      </form>
    </main>
  );
}
