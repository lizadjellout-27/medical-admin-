// App.jsx — Clinic Admin Dashboard
// Fully responsive: mobile (< 640px), tablet (640–1024px), desktop (> 1024px)
// Dark / Light mode toggle included

import { useState } from "react";

// ── Global CSS ────────────────────────────────────────────────────────────────

const GLOBAL_CSS = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-primary:         #ffffff;
    --bg-secondary:       #4b4545;
    --bg-tertiary:        #f5f5f3;
    --text-primary:       #111111;
    --text-secondary:     #888888;
    --border:             #e5e5e5;
    --accent:             #3b82f6;
    --accent-light:       #E1F5EE;
    --delete-bg:          #FCEBEB;
    --delete-border:      #F7C1C1;
    --delete-color:       #A32D2D;
    --input-bg:           #ffffff;
    --tag-archived-bg:    #f0f0f0;
    --tag-archived-color: #888888;
    --modal-overlay:      rgba(0,0,0,0.35);
    --table-alt:          #fafafa;
    --sidebar-w:          220px;
    --bottom-nav-h:       62px;
  }

  [data-theme="dark"] {
    --bg-primary:         #1a1a1a;
    --bg-secondary:       #222222;
    --bg-tertiary:        #141414;
    --text-primary:       #f0f0f0;
    --text-secondary:     #888888;
    --border:             #2e2e2e;
    --accent:             #3b82f6;
    --accent-light:       #0f2e22;
    --delete-bg:          #2a1515;
    --delete-border:      #5a2020;
    --delete-color:       #f87171;
    --input-bg:           #222222;
    --tag-archived-bg:    #2a2a2a;
    --tag-archived-color: #888888;
    --modal-overlay:      rgba(0,0,0,0.7);
    --table-alt:          #1f1f1f;
  }

  body {
    font-family: system-ui, -apple-system, sans-serif;
    background: var(--bg-tertiary);
    color: var(--text-primary);
    -webkit-font-smoothing: antialiased;
    overflow: hidden;
    height: 100vh;
  }

  * { transition: background-color 0.22s ease, border-color 0.22s ease, color 0.22s ease; }

  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  /* ── Layout ── */
  .app-root    { display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .app-body    { display: flex; flex: 1; overflow: hidden; position: relative; }

  /* ── Sidebar overlay (mobile/tablet) ── */
  .sidebar-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.4); z-index: 40;
  }
  .sidebar-overlay.show { display: block; }

  /* ── Sidebar ── */
  .sidebar {
    position: fixed; top: 0; left: 0; bottom: 0;
    width: var(--sidebar-w);
    background: var(--bg-primary);
    border-right: 0.5px solid var(--border);
    display: flex; flex-direction: column;
    padding: 20px 0; z-index: 50; overflow-y: auto;
    transform: translateX(0);
    transition: transform 0.26s cubic-bezier(.4,0,.2,1),
                background-color 0.22s, border-color 0.22s;
  }

  /* Desktop: sidebar always visible, main offset */
  .main-content {
    flex: 1; overflow-y: auto;
    padding: 28px;
    margin-left: var(--sidebar-w);
  }

  /* ── Top bar (hidden on desktop) ── */
  .top-bar {
    display: none;
    height: 52px; padding: 0 16px;
    background: var(--bg-primary);
    border-bottom: 0.5px solid var(--border);
    align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 30;
    flex-shrink: 0;
  }

  /* ── Bottom nav (hidden on desktop) ── */
  .bottom-nav {
    display: none;
    height: var(--bottom-nav-h);
    background: var(--bg-primary);
    border-top: 0.5px solid var(--border);
    flex-shrink: 0; z-index: 30;
  }

  .bnav-btn {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    gap: 3px; border: none; background: transparent;
    cursor: pointer; font-size: 10px;
    color: var(--text-secondary);
    padding-bottom: env(safe-area-inset-bottom, 0);
  }
  .bnav-btn.active { color: var(--accent); }

  /* ── Tablet / Mobile breakpoint ── */
  @media (max-width: 1024px) {
    .sidebar {
      transform: translateX(-110%);
      box-shadow: none;
    }
    .sidebar.open {
      transform: translateX(0);
      box-shadow: 6px 0 32px rgba(0,0,0,0.18);
    }
    .main-content {
      margin-left: 0;
      padding: 16px;
      padding-bottom: calc(var(--bottom-nav-h) + 12px);
    }
    .top-bar    { display: flex; }
    .bottom-nav { display: flex; }
  }

  @media (max-width: 480px) {
    .main-content { padding: 12px; padding-bottom: calc(var(--bottom-nav-h) + 8px); }
  }

  /* ── Stats grid ── */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }
  @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2, 1fr); } }
  @media (max-width: 480px)  { .stats-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; } }

  /* ── Panels grid ── */
  .panels-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  @media (max-width: 860px) { .panels-grid { grid-template-columns: 1fr; } }

  /* ── Records header ── */
  .records-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; }
  @media (max-width: 480px) {
    .records-header { flex-direction: column; }
    .records-header .add-btn { align-self: flex-start; }
  }

  /* ── Table horizontal scroll ── */
  .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
  table { width: 100%; border-collapse: collapse; min-width: 500px; }

  /* ── Toggle pill ── */
  .toggle-pill {
    width: 36px; height: 20px; border-radius: 999px;
    position: relative; border: none; cursor: pointer; flex-shrink: 0;
  }
  .toggle-pill::after {
    content: ''; position: absolute; top: 3px; left: 3px;
    width: 14px; height: 14px; background: #fff; border-radius: 50%;
    box-shadow: 0 1px 3px rgba(0,0,0,.25);
    transition: transform 0.22s;
  }
  .toggle-pill.on::after { transform: translateX(16px); }

  /* ── Modal ── */
  .modal-overlay {
    position: fixed; inset: 0;
    background: var(--modal-overlay);
    display: flex; align-items: center; justify-content: center;
    z-index: 200; padding: 16px;
  }
  .modal-box {
    background: var(--bg-primary);
    border: 0.5px solid var(--border);
    border-radius: 14px; padding: 24px;
    width: 420px; max-width: 100%;
    max-height: 90vh; overflow-y: auto;
  }

  /* ── Logout modal ── */
  .logout-modal-box {
    background: var(--bg-primary);
    border: 0.5px solid var(--border);
    border-radius: 14px; padding: 28px 24px;
    width: 360px; max-width: 100%;
    text-align: center;
  }

  /* ── Misc ── */
  .page-title { font-size: 22px; font-weight: 500; color: var(--text-primary); }
  @media (max-width: 480px) { .page-title { font-size: 18px; } }

  button { font-family: inherit; }
  input, select { font-family: inherit; }
  input[type="date"] { color-scheme: light dark; }
`;

// ── Data ─────────────────────────────────────────────────────────────────────

const STATS = [
  { label: "Total Doctors",        value: 3, icon: "doctors"  },
  { label: "Active Announcements", value: 3, icon: "announce" },
  { label: "Weekly Schedules",     value: 8, icon: "calendar" },
  { label: "Total Logs",           value: 8, icon: "logs"     },
];

const ACTIVITY = [
  { initials: "AD", bg: "#E1F5EE", color: "#085041", user: "admin_user", action: "Updated patient record for", target: "Omar Hassan",     time: "Apr 17, 8:31 PM" },
  { initials: "DR", bg: "#E6F1FB", color: "#0C447C", user: "dr_fatima",  action: "Visited the",                target: "patient Layla M.", time: "Apr 17, 8:31 PM" },
  { initials: "DR", bg: "#FAEEDA", color: "#633806", user: "dr_ahmed",   action: "Deleted expired prescription record", target: "",       time: "Apr 17, 8:31 PM" },
  { initials: "DR", bg: "#FBEAF0", color: "#8e68a8", user: "dr_rania",  action: "Did an operation",           target: "",                time: "Apr 17, 8:15 PM" },
];

const SCHEDULES = [
  { day: "Monday",    count: 2 },
  { day: "Tuesday",   count: 1 },
  { day: "Wednesday", count: 2 },
  { day: "Thursday",  count: 1 },
  { day: "Friday",    count: 2 },
  { day: "Saturday",  count: 0 },
];

const INITIAL_RECORDS = [
  { id: 1, patient: "Afaf Bahri",      doctor: "Dr. Aya Chaib",   date: "27 Mar 2026", status: "Active"   },
  { id: 2, patient: "Omar Hassan",     doctor: "Dr. Ahmed Malik", date: "15 Apr 2026", status: "Active"   },
  { id: 3, patient: "Layla Messaoudi", doctor: "Dr. Aya Chaib",   date: "10 Apr 2026", status: "Archived" },
  { id: 4, patient: "Karim Benali",    doctor: "Dr. Youssef Aït", date: "02 Apr 2026", status: "Active"   },
  { id: 5, patient: "Nadia Bouzid",    doctor: "Dr. Ahmed Malik", date: "20 Mar 2026", status: "Archived" },
];

const NAV_ITEMS = [
  { label: "Dashboard",       key: "dashboard" },
  { label: "Medical Records", key: "records"   },
];

// ── SVG Icons ─────────────────────────────────────────────────────────────────

const I = {
  Grid: ({ c = "currentColor", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="1" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.4"/>
      <rect x="9" y="1" width="6" height="6" rx="1" stroke={c} strokeWidth="1.4"/>
      <rect x="1" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.4"/>
      <rect x="9" y="9" width="6" height="6" rx="1" stroke={c} strokeWidth="1.4"/>
    </svg>
  ),
  File: ({ c = "currentColor", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="3" y="1" width="10" height="14" rx="1.5" stroke={c} strokeWidth="1.4"/>
      <line x1="5.5" y1="5" x2="10.5" y2="5" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5.5" y1="8" x2="10.5" y2="8" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
      <line x1="5.5" y1="11" x2="8.5" y2="11" stroke={c} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  ),
  Clock: ({ c = "#3b82f6" }) => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <circle cx="7.5" cy="7.5" r="6.5" stroke={c} strokeWidth="1.3"/>
      <polyline points="7.5,4.5 7.5,7.5 9.5,9.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Cal: ({ c = "#3b82f6" }) => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <rect x="1" y="2" width="13" height="11" rx="1.5" stroke={c} strokeWidth="1.3"/>
      <line x1="4.5" y1="1" x2="4.5" y2="4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="10.5" y1="1" x2="10.5" y2="4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="1" y1="6" x2="14" y2="6" stroke={c} strokeWidth="1.3"/>
    </svg>
  ),
  Search: ({ c = "#aaa" }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="6" cy="6" r="4.5" stroke={c} strokeWidth="1.3"/>
      <line x1="9.5" y1="9.5" x2="13" y2="13" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Eye: ({ c = "#fff" }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M1 7s2-4 6-4 6 4 6 4-2 4-6 4-6-4-6-4z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <circle cx="7" cy="7" r="1.5" stroke={c} strokeWidth="1.3"/>
    </svg>
  ),
  Edit: ({ c = "currentColor" }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M2 10.5l1.5-4 6-6 2.5 2.5-6 6-4 1.5z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="8" y1="3" x2="11" y2="6" stroke={c} strokeWidth="1.3"/>
    </svg>
  ),
  Trash: ({ c = "currentColor" }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="2" y1="4" x2="12" y2="4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <path d="M5 4V3h4v1" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <path d="M3 4l.8 8h6.4L11 4" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
      <line x1="5.5" y1="7" x2="5.5" y2="10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8.5" y1="7" x2="8.5" y2="10" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Plus: ({ c = "#fff" }) => (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <line x1="7" y1="2" x2="7" y2="12" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="2" y1="7" x2="12" y2="7" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  Logout: ({ c = "currentColor" }) => (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
      <path d="M5.5 13H2.5C2 13 1.5 12.5 1.5 12V3C1.5 2.5 2 2 2.5 2H5.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <polyline points="10,5 13.5,7.5 10,10" stroke={c} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="5.5" y1="7.5" x2="13.5" y2="7.5" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Sun: ({ c = "currentColor" }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <circle cx="8" cy="8" r="3" stroke={c} strokeWidth="1.3"/>
      <line x1="8" y1="1" x2="8" y2="2.5"   stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8" y1="13.5" x2="8" y2="15" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="1" y1="8"   x2="2.5" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="13.5" y1="8" x2="15" y2="8" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="3.4" y1="3.4" x2="4.4" y2="4.4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="11.6" y1="11.6" x2="12.6" y2="12.6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="11.6" y1="3.4" x2="12.6" y2="4.4" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="3.4" y1="12.6" x2="4.4" y2="11.6" stroke={c} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  Moon: ({ c = "currentColor" }) => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M13 10A6 6 0 016 3a6 6 0 100 10 6 6 0 007-3z" stroke={c} strokeWidth="1.3" strokeLinejoin="round"/>
    </svg>
  ),
  Menu: ({ c = "currentColor" }) => (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <line x1="3" y1="6"  x2="17" y2="6"  stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="10" x2="17" y2="10" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="3" y1="14" x2="17" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  X: ({ c = "currentColor" }) => (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <line x1="4" y1="4" x2="14" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
      <line x1="14" y1="4" x2="4" y2="14" stroke={c} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  // Warning icon for logout modal
  Warning: ({ size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="18" fill="#FCEBEB" stroke="#F7C1C1" strokeWidth="1.5"/>
      <path d="M20 12v10" stroke="#A32D2D" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="20" cy="27" r="1.5" fill="#A32D2D"/>
    </svg>
  ),
};

const StatIcons = {
  doctors: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="7" r="3.5" stroke="#3b82f6" strokeWidth="1.6"/>
      <path d="M3 19c0-3.3 3.6-6 8-6s8 2.7 8 6" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="17" y1="11" x2="21" y2="11" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="19" y1="9"  x2="19" y2="13" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
    </svg>
  ),
  announce: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M18 3L4 8v6l14 5V3z" stroke="#3b82f6" strokeWidth="1.6" strokeLinejoin="round"/>
    </svg>
  ),
  calendar: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="2" y="4" width="18" height="15" rx="2" stroke="#3b82f6" strokeWidth="1.6"/>
      <line x1="7"  y1="2" x2="7"  y2="6"  stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="15" y1="2" x2="15" y2="6"  stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round"/>
      <line x1="2"  y1="9" x2="20" y2="9"  stroke="#3b82f6" strokeWidth="1.6"/>
      <circle cx="7"  cy="13" r="1" fill="#3b82f6"/>
      <circle cx="11" cy="13" r="1" fill="#3b82f6"/>
      <circle cx="15" cy="13" r="1" fill="#3b82f6"/>
      <circle cx="7"  cy="17" r="1" fill="#3b82f6"/>
      <circle cx="11" cy="17" r="1" fill="#3b82f6"/>
    </svg>
  ),
  logs: (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <polyline points="2,15 6,10 10,13 14,7 18,10 21,7" stroke="#3b82f6" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <line x1="2" y1="19" x2="21" y2="19" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  ),
};

// ── Logout Confirmation Modal ─────────────────────────────────────────────────

function LogoutModal({ open, onCancel, onConfirm }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="logout-modal-box" onClick={e => e.stopPropagation()}>
        {/* Icon */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
          <I.Warning size={48} />
        </div>

        {/* Title */}
        <h2 style={{ fontSize: 17, fontWeight: 500, color: "var(--text-primary)", marginBottom: 8 }}>
          Log out of Clinic Admin?
        </h2>

        {/* Subtitle */}
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55, marginBottom: 24 }}>
          You will be signed out of your session. Any unsaved changes may be lost.
        </p>

        {/* Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <button
            onClick={onConfirm}
            style={{
              width: "100%", padding: "10px 16px", borderRadius: 8,
              border: "0.5px solid var(--delete-border)",
              background: "var(--delete-bg)", color: "var(--delete-color)",
              fontSize: 13, fontWeight: 500, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
            }}
          >
            <I.Logout c="var(--delete-color)" />
            Yes, log me out
          </button>

          <button
            onClick={onCancel}
            style={{
              width: "100%", padding: "10px 16px", borderRadius: 8,
              border: "0.5px solid var(--border)",
              background: "transparent", color: "var(--text-secondary)",
              fontSize: 13, cursor: "pointer",
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Reusable UI ───────────────────────────────────────────────────────────────

function Avatar({ initials, bg = "#E1F5EE", color = "#3b82f6", size = 32 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg, color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.34, fontWeight: 500, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function Panel({ title, subtitle, icon, children }) {
  return (
    <div style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
      <div style={{ padding: "14px 16px 10px", borderBottom: "0.5px solid var(--border)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>
          {icon} {title}
        </div>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 500, color: "var(--text-primary)" }}>{title}</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex" }}>
            <I.X />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function FormInput({ label, type = "text", placeholder, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={value} onChange={onChange}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 8,
          border: "0.5px solid var(--border)", fontSize: 13,
          color: "var(--text-primary)", background: "var(--input-bg)",
          outline: "none", boxSizing: "border-box",
        }}
      />
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────────────────────────

function Dashboard() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p style={{ fontSize: 16, color: "var(--text-secondary)", marginTop: 3 }}>
          Overview of clinic operations and daily activity.
        </p>
      </div>

      <div className="stats-grid">
        {STATS.map(s => (
          <div key={s.label} style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <p style={{ fontSize: 16, color: "var(--text-secondary)" }}>{s.label}</p>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: "var(--accent-light)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {StatIcons[s.icon]}
              </div>
            </div>
            <p style={{ fontSize: 28, fontWeight: 500, color: "var(--text-primary)" }}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="panels-grid">
        <Panel title="Recent Activity" subtitle="Latest staff actions across the clinic" icon={<I.Clock />}>
          {ACTIVITY.map((a, i) => (
            <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "11px 16px", borderBottom: "0.5px solid var(--border)" }}>
              <Avatar initials={a.initials} bg={a.bg} color={a.color} size={35} />
              <div>
                <p style={{ fontSize: 15, color: "var(--text-primary)", lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 500 }}>{a.user}</span> {a.action}{a.target ? ` ${a.target}` : ""}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-secondary)", marginTop: 2 }}>{a.time}</p>
              </div>
            </div>
          ))}
        </Panel>

        <Panel title="Schedules Summary" subtitle="Active doctor schedules by day" icon={<I.Cal />}>
          {SCHEDULES.map(s => (
            <div key={s.day} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: "0.5px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--text-primary)" }}>{s.day}</span>
              <span style={{
                fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500,
                background: s.count >= 2 ? "var(--accent-light)" : "var(--tag-archived-bg)",
                color:      s.count >= 2 ? "var(--accent)"       : "var(--tag-archived-color)",
              }}>
                {s.count} {s.count === 1 ? "Schedule" : "Schedules"}
              </span>
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}

// ── Medical Records Page ──────────────────────────────────────────────────────

function MedicalRecords() {
  const [records, setRecords] = useState(INITIAL_RECORDS);
  const [search, setSearch]   = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [viewRec, setViewRec] = useState(null);
  const [form, setForm]       = useState({ patient: "", doctor: "", date: "", status: "Active" });
  const [formErr, setFormErr] = useState("");

  const filtered = records.filter(r =>
    r.patient.toLowerCase().includes(search.toLowerCase()) ||
    r.doctor.toLowerCase().includes(search.toLowerCase())
  );

  const deleteRecord = id => setRecords(p => p.filter(r => r.id !== id));

  const addRecord = () => {
    if (!form.patient.trim() || !form.doctor.trim() || !form.date.trim()) {
      setFormErr("All fields are required."); return;
    }
    setRecords(p => [{
      id: Date.now(),
      patient: form.patient, doctor: form.doctor,
      date: new Date(form.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      status: form.status,
    }, ...p]);
    setForm({ patient: "", doctor: "", date: "", status: "Active" });
    setFormErr(""); setShowAdd(false);
  };

  const td = (extra = {}) => ({
    padding: "12px 14px", fontSize: 13,
    color: "var(--text-primary)",
    borderBottom: "0.5px solid var(--border)",
    verticalAlign: "middle",
    ...extra,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Header */}
      <div className="records-header">
        <div>
          <h1 className="page-title">Medical Records</h1>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 3 }}>
            Hospital patient records and assigned doctors.
          </p>
        </div>
        <button
          className="add-btn"
          onClick={() => { setShowAdd(true); setFormErr(""); }}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", borderRadius: 8, border: "none",
            background: "var(--accent)", color: "#fff",
            fontSize: 13, fontWeight: 500, cursor: "pointer",
            whiteSpace: "nowrap", marginTop: 4,
          }}
        >
          <I.Plus /> Add Record
        </button>
      </div>

      {/* Search */}
      <div style={{ position: "relative", maxWidth: 340 }}>
        <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
          <I.Search />
        </div>
        <input
          type="text" placeholder="Search by patient or doctor..."
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "8px 12px 8px 30px", borderRadius: 8,
            border: "0.5px solid var(--border)", fontSize: 13,
            background: "var(--input-bg)", color: "var(--text-primary)", outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div style={{ background: "var(--bg-primary)", border: "0.5px solid var(--border)", borderRadius: 12, overflow: "hidden" }}>
        <div className="table-scroll">
          <table>
            <thead>
              <tr style={{ background: "var(--accent)" }}>
                {["Patient Name", "Assigned Doctor", "Date Created", "Status", "Actions"].map((h, i) => (
                  <th key={h} style={{ padding: "13px 14px", textAlign: "left", fontSize: 13, fontWeight: 500, color: "#fff", whiteSpace: "nowrap", width: i === 4 ? 148 : "auto" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: "32px 16px", textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>No records found.</td></tr>
              ) : filtered.map((r, idx) => (
                <tr key={r.id} style={{ background: idx % 2 === 0 ? "var(--bg-primary)" : "var(--table-alt)" }}>
                  <td style={td({ fontWeight: 500, whiteSpace: "nowrap" })}>{r.patient}</td>
                  <td style={td({ whiteSpace: "nowrap" })}>{r.doctor}</td>
                  <td style={td({ whiteSpace: "nowrap" })}>{r.date}</td>
                  <td style={td()}>
                    <span style={{
                      fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 500,
                      background: r.status === "Active" ? "var(--accent-light)" : "var(--tag-archived-bg)",
                      color:      r.status === "Active" ? "var(--accent)"       : "var(--tag-archived-color)",
                      whiteSpace: "nowrap",
                    }}>
                      {r.status}
                    </span>
                  </td>
                  <td style={td()}>
                    <div style={{ display: "flex", gap: 5 }}>
                      <button onClick={() => setViewRec(r)} style={{ display: "flex", alignItems: "center", gap: 4, padding: "6px 10px", borderRadius: 6, border: "none", background: "var(--accent)", color: "#fff", fontSize: 12, cursor: "pointer", fontWeight: 500, whiteSpace: "nowrap" }}>
                        <I.Eye /> View
                      </button>
                      <button style={{ display: "flex", alignItems: "center", padding: "6px 8px", borderRadius: 6, border: "0.5px solid var(--border)", background: "var(--bg-primary)", color: "var(--text-secondary)", cursor: "pointer" }}>
                        <I.Edit />
                      </button>
                      <button onClick={() => deleteRecord(r.id)} style={{ display: "flex", alignItems: "center", padding: "6px 8px", borderRadius: 6, border: "0.5px solid var(--delete-border)", background: "var(--delete-bg)", color: "var(--delete-color)", cursor: "pointer" }}>
                        <I.Trash c="var(--delete-color)" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ padding: "10px 16px", borderTop: "0.5px solid var(--border)", fontSize: 12, color: "var(--text-secondary)" }}>
          {filtered.length} record{filtered.length !== 1 ? "s" : ""} found
        </div>
      </div>

      {/* View Modal */}
      <Modal open={!!viewRec} onClose={() => setViewRec(null)} title="Record Details">
        {viewRec && [["Patient", viewRec.patient], ["Doctor", viewRec.doctor], ["Created", viewRec.date], ["Status", viewRec.status]].map(([k, v]) => (
          <div key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "0.5px solid var(--border)" }}>
            <span style={{ fontSize: 13, color: "var(--text-secondary)" }}>{k}</span>
            <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-primary)" }}>{v}</span>
          </div>
        ))}
        <button onClick={() => setViewRec(null)} style={{ marginTop: 20, width: "100%", padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
          Close
        </button>
      </Modal>

      {/* Add Modal */}
      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add New Record">
        <FormInput label="Patient Name"    type="text" placeholder="e.g. Sara Amrani"     value={form.patient} onChange={e => setForm(p => ({ ...p, patient: e.target.value }))} />
        <FormInput label="Assigned Doctor" type="text" placeholder="e.g. Dr. Youssef Aït" value={form.doctor}  onChange={e => setForm(p => ({ ...p, doctor:  e.target.value }))} />
        <FormInput label="Date Created"    type="date" placeholder=""                      value={form.date}    onChange={e => setForm(p => ({ ...p, date:    e.target.value }))} />
        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 12, color: "var(--text-secondary)", display: "block", marginBottom: 5 }}>Status</label>
          <select value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            style={{ width: "100%", padding: "9px 12px", borderRadius: 8, border: "0.5px solid var(--border)", fontSize: 13, color: "var(--text-primary)", background: "var(--input-bg)", outline: "none" }}>
            <option value="Active">Active</option>
            <option value="Archived">Archived</option>
          </select>
        </div>
        {formErr && <p style={{ fontSize: 12, color: "var(--delete-color)", marginBottom: 12 }}>{formErr}</p>}
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAdd(false)} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "0.5px solid var(--border)", background: "transparent", fontSize: 13, color: "var(--text-secondary)", cursor: "pointer" }}>
            Cancel
          </button>
          <button onClick={addRecord} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "var(--accent)", color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer" }}>
            Add Record
          </button>
        </div>
      </Modal>
    </div>
  );
}

// ── Sidebar Component ─────────────────────────────────────────────────────────

function SidebarPanel({ active, setActive, dark, onToggleDark, onLogout, open, onClose }) {
  const [logHover, setLogHover] = useState(false);

  return (
    <>
      <div className={`sidebar-overlay${open ? " show" : ""}`} onClick={onClose} />
      <aside className={`sidebar${open ? " open" : ""}`}>

        {/* Logo + close */}
        <div style={{ padding: "0 16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
              <polyline points="1,13 6,7 11,17 15,5 20,13 25,9" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)" }}>Clinic Admin</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", display: "flex", padding: 2 }}>
            <I.X />
          </button>
        </div>

        {/* Nav items */}
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 }}>
          {NAV_ITEMS.map(item => {
            const on = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActive(item.key); onClose(); }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "9px 12px", borderRadius: 8, fontSize: 13.5,
                  border: "none", cursor: "pointer", textAlign: "left", width: "100%",
                  background: on ? "var(--accent)" : "transparent",
                  color: on ? "#fff" : "var(--text-secondary)",
                }}
                onMouseEnter={e => { if (!on) { e.currentTarget.style.background = "var(--bg-secondary)"; e.currentTarget.style.color = "var(--text-primary)"; }}}
                onMouseLeave={e => { if (!on) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--text-secondary)"; }}}
              >
                {item.key === "dashboard"
                  ? <I.Grid c={on ? "#fff" : "currentColor"} />
                  : <I.File c={on ? "#fff" : "currentColor"} />}
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div style={{ padding: "8px 12px 0", borderTop: "0.5px solid var(--border)", marginTop: 8 }}>
          {/* Theme toggle */}
          <div onClick={onToggleDark} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 12px", cursor: "pointer", borderRadius: 8 }}>
            {dark ? <I.Moon c="var(--text-secondary)" /> : <I.Sun c="var(--text-secondary)" />}
            <span style={{ fontSize: 13, color: "var(--text-secondary)", flex: 1 }}>
              {dark ? "Dark Mode" : "Light Mode"}
            </span>
            <div className={`toggle-pill${dark ? " on" : ""}`} style={{ background: dark ? "var(--accent)" : "#e5e5e5" }} />
          </div>

          {/* Logout — now triggers confirmation modal */}
          <button
            onMouseEnter={() => setLogHover(true)}
            onMouseLeave={() => setLogHover(false)}
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 9, cursor: "pointer",
              borderRadius: 8, fontSize: 13.5,
              color: logHover ? "var(--delete-color)" : "var(--text-secondary)",
              background: logHover ? "var(--delete-bg)" : "transparent",
              border: "none", width: "100%", textAlign: "left", padding: "10px 12px",
            }}
          >
            <I.Logout c={logHover ? "var(--delete-color)" : "currentColor"} />
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Top Bar (mobile / tablet) ─────────────────────────────────────────────────

function TopBar({ active, onMenu, dark, onToggleDark }) {
  const label = NAV_ITEMS.find(n => n.key === active)?.label ?? "Dashboard";
  return (
    <div className="top-bar">
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button onClick={onMenu} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 4 }}>
          <I.Menu c="var(--text-primary)" />
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <polyline points="1,13 6,7 11,17 15,5 20,13 25,9" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-primary)" }}>{label}</span>
        </div>
      </div>
      <button onClick={onToggleDark} style={{ background: "none", border: "none", cursor: "pointer", padding: 6, color: "var(--text-secondary)", display: "flex" }}>
        {dark ? <I.Moon c="var(--text-secondary)" /> : <I.Sun c="var(--text-secondary)" />}
      </button>
    </div>
  );
}

// ── Bottom Nav (mobile / tablet) ──────────────────────────────────────────────

function BottomNav({ active, setActive }) {
  return (
    <div className="bottom-nav">
      {NAV_ITEMS.map(item => {
        const on = active === item.key;
        return (
          <button key={item.key} className={`bnav-btn${on ? " active" : ""}`} onClick={() => setActive(item.key)}>
            {item.key === "dashboard"
              ? <I.Grid  c={on ? "var(--accent)" : "var(--text-secondary)"} size={20} />
              : <I.File  c={on ? "var(--accent)" : "var(--text-secondary)"} size={20} />}
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────

export default function App() {
  const [active,         setActive]         = useState("dashboard");
  const [dark,           setDark]           = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "");
  };

  // Called when user clicks "Log out" in sidebar → show confirmation modal
  const handleLogoutRequest = () => {
    setSidebarOpen(false); // close sidebar first (mobile UX)
    setShowLogoutModal(true);
  };

  // Called when user confirms logout in modal
  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    // TODO: replace with your actual logout logic (e.g. clear auth token, redirect)
    alert("You have been logged out.");
  };

  const renderPage = () => {
    switch (active) {
      case "dashboard": return <Dashboard />;
      case "records":   return <MedicalRecords />;
      default:          return <Dashboard />;
    }
  };

  return (
    <>
      <style>{GLOBAL_CSS}</style>

      <div className="app-root">
        {/* Top bar — visible only on mobile/tablet via CSS */}
        <TopBar active={active} onMenu={() => setSidebarOpen(true)} dark={dark} onToggleDark={toggleDark} />

        <div className="app-body">
          {/* Sidebar */}
          <SidebarPanel
            active={active} setActive={setActive}
            dark={dark} onToggleDark={toggleDark}
            onLogout={handleLogoutRequest}
            open={sidebarOpen} onClose={() => setSidebarOpen(false)}
          />

          {/* Page content */}
          <main className="main-content">
            {renderPage()}
          </main>
        </div>

        {/* Bottom nav — visible only on mobile/tablet via CSS */}
        <BottomNav active={active} setActive={setActive} />
      </div>

      {/* Logout confirmation modal — rendered outside app layout to avoid z-index issues */}
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
      />
    </>
  );
}

