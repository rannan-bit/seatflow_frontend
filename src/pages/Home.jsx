import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Brand from "../components/Brand.jsx";

export default function Home() {
  return (
    <main className="landing-page">
      <Brand />
      <p className="eyebrow">SMART RESTAURANT SEATING</p>
      <h1>Less waiting.<br /><em>More enjoying.</em></h1>
      <p className="landing-description">Join the queue, discover your favourites, and enjoy your meal at The Olive Room.</p>
      <div className="landing-actions">
        <Link className="button" to="/customer/check-in">Customer experience <ArrowRight size={16} /></Link>
        <Link className="button button-outline" to="/staff-login">Staff portal</Link>
        <Link className="button button-outline" to="/admin-login">Admin portal</Link>
      </div>
      <div className="sample-token">
        <span className="status-pill available">● LIVE QUEUE</span>
        <small>YOUR TOKEN</small>
        <strong>A-024</strong>
        <p>3 parties ahead · 15–20 min estimated wait</p>
      </div>
    </main>
  );
}