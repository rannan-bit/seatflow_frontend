import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck } from "lucide-react";
import Brand from "../components/Brand.jsx";

export default function Login({ role }) {
  const [email, setEmail] = useState(role === "Admin" ? "admin@olive-room.com" : "");
  const [password, setPassword] = useState("seatflow123");
  const navigate = useNavigate();

  function signIn(event) {
    event.preventDefault();
    navigate(role === "Admin" ? "/admin" : "/staff");
  }

  return (
    <main className="login-page">
      <form className="login-card" onSubmit={signIn}>
        <Brand />
        <span className="login-icon"><ShieldCheck size={24} /></span>
        <h1>{role} login</h1><p>Sign in to manage The Olive Room.</p>
        <label>Email address</label><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <label>Password</label><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
        <button className="button full-width">Sign in <ArrowRight size={16} /></button>
        <small>Demo UI · This form does not authenticate users yet.</small>
      </form>
    </main>
  );
}