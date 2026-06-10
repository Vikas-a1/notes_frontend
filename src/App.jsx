import { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL || "";

function isAppsScriptUrl(url) {
  return /script\.google\.com\/macros\/s\/[^/]+\/exec/.test(url);
}

function isGoogleSheetUrl(url) {
  return /docs\.google\.com\/spreadsheets\//.test(url);
}

/* ── Particles ── */
const PARTICLES = Array.from({ length: 55 }, (_, i) => ({
  id: i,
  top: `${Math.random() * 100}%`,
  left: `${Math.random() * 100}%`,
  dur: `${3 + Math.random() * 5}s`,
  delay: `${Math.random() * 6}s`,
}));

/* ── Demo notes shown floating in the hero (x/y relative to scene centre, z = depth) ── */
const DEMO_NOTES = [
  {
    id: 1, title: "Meeting Notes",
    content: "Discuss Q2 roadmap and align sprint goals with the team.",
    tag: "Work", accent: "purple",
    x: -30, y: -100, z: 90,
    rot: -8, dur: "13s", delay: "0s",
  },
  {
    id: 2, title: "Book Summary",
    content: "Atomic Habits: 1% better every day compounds into remarkable results.",
    tag: "Reading", accent: "cyan",
    x: 140, y: -50, z: -55,
    rot: 7, dur: "17s", delay: "-5s",
  },
  {
    id: 3, title: "Shopping List",
    content: "Apples · Oat milk · Coffee · Dark chocolate · Avocados",
    tag: "Personal", accent: "pink",
    x: -80, y: 90, z: 40,
    rot: -5, dur: "15s", delay: "-9s",
  },
  {
    id: 4, title: "Project Ideas",
    content: "Build a full-stack notes app with React, FastAPI and MongoDB.",
    tag: "Dev", accent: "blue",
    x: 160, y: -130, z: -115,
    rot: 11, dur: "19s", delay: "-3s",
  },
  {
    id: 5, title: "Reminders",
    content: "Call dentist Thursday. Renew passport before end of June.",
    tag: "Urgent", accent: "green",
    x: 80, y: 120, z: -20,
    rot: -12, dur: "21s", delay: "-13s",
  },
  {
    id: 6, title: "Travel Plans",
    content: "Tokyo → Kyoto → Osaka. Book Shinkansen 3 weeks early.",
    tag: "Travel", accent: "orange",
    x: -130, y: 45, z: -70,
    rot: 4, dur: "16s", delay: "-7s",
  },
];

/* ── Smooth lerp hook — RAF loop that interpolates toward a target ── */
function useLerpedTilt() {
  const smooth  = useRef({ x: 0, y: 0 });
  const target  = useRef({ x: 0, y: 0 });
  const raf     = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const tick = () => {
      smooth.current.x += (target.current.x - smooth.current.x) * 0.055;
      smooth.current.y += (target.current.y - smooth.current.y) * 0.055;
      setTilt({ x: smooth.current.x, y: smooth.current.y });
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const set = useCallback((x, y) => { target.current = { x, y }; }, []);
  const reset = useCallback(() => { target.current = { x: 0, y: 0 }; }, []);
  return [tilt, set, reset];
}

/* ═══════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════ */
export default function App() {
  const [notes, setNotes]     = useState([]);
  const [title, setTitle]     = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  /* cursor glow */
  const [cursor, setCursor] = useState({ x: -999, y: -999 });
  const onMouseMove = useCallback((e) => setCursor({ x: e.clientX, y: e.clientY }), []);
  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [onMouseMove]);

  /* scroll-in entrance for app section */
  useEffect(() => {
    const el = document.getElementById("app-section");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const fetchNotes = async () => {
    try {
      const res  = await fetch(`${API_URL}/notes`);
      const data = await res.json();
      setNotes(data.notes);
    } catch {
      setError("Failed to connect to the server.");
    }
  };

  useEffect(() => { fetchNotes(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;
    setLoading(true);
    setError("");
    try {
      await fetch(`${API_URL}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      });
      setTitle(""); setContent("");
      fetchNotes();
    } catch { setError("Failed to add note."); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API_URL}/notes/${id}`, { method: "DELETE" });
      fetchNotes();
    } catch { setError("Failed to delete note."); }
  };

  const scrollToApp = () =>
    document.getElementById("app-section")?.scrollIntoView({ behavior: "smooth" });

  const scrollToContact = () =>
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });

  return (
    <>
      {/* Cursor glow */}
      <div className="cursor-glow" style={{ left: cursor.x, top: cursor.y }} />

      {/* Background orbs */}
      <div className="bg">
        <div className="orb orb-1" /><div className="orb orb-2" />
        <div className="orb orb-3" /><div className="orb orb-4" />
      </div>

      {/* Grid overlay */}
      <div className="grid-overlay" />

      {/* Particles */}
      <div className="particles">
        {PARTICLES.map((p) => (
          <div key={p.id} className="particle"
            style={{ top: p.top, left: p.left, "--dur": p.dur, "--delay": p.delay }}
          />
        ))}
      </div>

      {/* ── HERO ── */}
      <Hero onScrollToApp={scrollToApp} onScrollToContact={scrollToContact} />

      {/* ── APP SECTION ── */}
      <div id="app-section" className="page">
        <div className="container">

          <header className="header">
            <div className="header-badge">
              <span className="badge-dot" />
              Your Workspace
            </div>
            <h2 className="app-title">Notes Studio</h2>
            <p className="app-subtitle">React · FastAPI · MongoDB</p>
          </header>

          <form className="form" onSubmit={handleAdd}>
            <div className="form-label">Title</div>
            <input
              className="form-input"
              type="text"
              placeholder="Give your note a title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="form-label">Content</div>
            <textarea
              className="form-input form-textarea"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
            />
            <button className="btn-add" type="submit" disabled={loading}>
              {loading ? (
                <span className="btn-loading"><span className="spinner" />Adding...</span>
              ) : "+ Add Note"}
            </button>
          </form>

          {error && (
            <div className="error-msg"><span>⚠</span>{error}</div>
          )}

          <div className="section-header">
            <span className="section-title">Your Notes</span>
            {notes.length > 0 && <span className="note-count">{notes.length}</span>}
          </div>

          <div className="grid">
            {notes.length === 0 && (
              <div className="empty">
                <span className="empty-icon">✦</span>
                <p className="empty-text">No notes yet</p>
                <p className="empty-sub">Create your first note above</p>
              </div>
            )}
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} onDelete={handleDelete} />
            ))}
          </div>

        </div>
      </div>

      {/* ── CONTACT SECTION ── */}
      <div id="contact-section" className="page contact-page">
        <div className="container">
          <ContactForm />
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════
   HERO SECTION
   ═══════════════════════════════════════════ */
function Hero({ onScrollToApp, onScrollToContact }) {
  const heroRef = useRef(null);
  const [tilt, setTilt, resetTilt] = useLerpedTilt();

  const onMouseMove = useCallback((e) => {
    const r = heroRef.current?.getBoundingClientRect();
    if (!r) return;
    setTilt(
      (e.clientY - r.top  - r.height / 2) / (r.height / 2),   // -1 .. 1
      (e.clientX - r.left - r.width  / 2) / (r.width  / 2),   // -1 .. 1
    );
  }, [setTilt]);

  return (
    <section
      className="hero"
      ref={heroRef}
      onMouseMove={onMouseMove}
      onMouseLeave={resetTilt}
    >
      {/* ── Left: text ── */}
      <div
        className="hero-content"
        style={{
          transform: `translate3d(${tilt.y * -10}px, ${tilt.x * -6}px, 0)`,
          transition: "transform 0.1s linear",
          willChange: "transform",
        }}
      >
        <div className="hero-badge">
          <span className="badge-dot" />
          Now live · React + FastAPI
        </div>

        <h1 className="hero-title">
          <span className="hero-line hero-line-1">Capture Every</span>
          <span className="hero-line hero-line-2 hero-highlight">Brilliant Idea.</span>
          <span className="hero-line hero-line-3">Before It Fades.</span>
        </h1>

        <p className="hero-desc">
          A beautiful, fast note-taking workspace powered by React,
          FastAPI, and MongoDB — your thoughts, always within reach.
        </p>

        <div className="hero-actions">
          <button className="hero-cta" onClick={onScrollToApp}>
            <span>Start Writing</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
          <button className="hero-ghost" onClick={onScrollToApp}>View Notes</button>
          <button className="hero-ghost" onClick={onScrollToContact}>Contact Us</button>
        </div>

        <div className="hero-stats">
          <div className="hero-stat">
            <span className="hero-stat-val">∞</span>
            <span className="hero-stat-label">Notes</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-val">⚡</span>
            <span className="hero-stat-label">Real-time</span>
          </div>
          <div className="hero-stat-divider" />
          <div className="hero-stat">
            <span className="hero-stat-val">🔒</span>
            <span className="hero-stat-label">Persistent</span>
          </div>
        </div>
      </div>

      {/* ── Right: 3D floating notes scene ── */}
      <div className="hero-3d-scene" aria-hidden="true">
        {/* entrance wrapper (CSS opacity fade-in only) */}
        <div className="hero-3d-entrance">
          {/* JS-controlled 3D tilt stage */}
          <div
            className="hero-3d-stage"
            style={{
              transform: `rotateX(${-tilt.x * 12}deg) rotateY(${tilt.y * 15}deg)`,
              transition: "transform 0.1s linear",
              willChange: "transform",
            }}
          >
            {/* Orbital rings */}
            <div className="orbit-ring orbit-ring-1" />
            <div className="orbit-ring orbit-ring-2" />
            <div className="orbit-ring orbit-ring-3" />

            {/* Centre depth glow */}
            <div className="hero-core-glow" />

            {/* Floating note cards at different Z depths */}
            {DEMO_NOTES.map((note) => {
              const depthOpacity = 0.45 + 0.55 * ((note.z + 120) / 210);
              return (
                <div
                  key={note.id}
                  className="fn-wrap"
                  style={{
                    "--tx": `${note.x}px`,
                    "--ty": `${note.y}px`,
                    "--tz": `${note.z}px`,
                    opacity: Math.max(0.42, Math.min(1, depthOpacity)),
                  }}
                >
                  <FloatingDemoNote note={note} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <button className="hero-scroll-btn" onClick={onScrollToApp} aria-label="Scroll down">
        <div className="hero-scroll-line" />
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2">
          <path d="M12 5v14M5 12l7 7 7-7"/>
        </svg>
      </button>
    </section>
  );
}

/* ── Floating demo note card inside the 3D hero scene ── */
function FloatingDemoNote({ note }) {
  return (
    <div
      className={`fn fn-${note.accent}`}
      style={{ "--rot": `${note.rot}deg`, "--dur": note.dur, "--delay": note.delay }}
    >
      <div className="fn-top">
        <span className="fn-tag">{note.tag}</span>
        <span className="fn-dots"><span /><span /><span /></span>
      </div>
      <h3 className="fn-title">{note.title}</h3>
      <p className="fn-body">{note.content}</p>
      <div className="fn-lines">
        <span className="fn-line-bar" style={{ width: "72%" }} />
        <span className="fn-line-bar" style={{ width: "48%" }} />
      </div>
    </div>
  );
}

/* ── Real note card in app section ── */
function NoteCard({ note, onDelete }) {
  return (
    <div className="card">
      <div className="card-accent" />
      <div className="card-header">
        <h3 className="card-title">{note.title}</h3>
        <button className="btn-delete" onClick={() => onDelete(note.id)} title="Delete">✕</button>
      </div>
      <p className="card-content">{note.content}</p>
      <div className="card-footer">
        <span className="card-id">{note.id.slice(-8)}</span>
      </div>
    </div>
  );
}

/* ── Contact form → Google Sheet ── */
function ContactForm() {
  const [name, setName]         = useState("");
  const [email, setEmail]       = useState("");
  const [phone, setPhone]       = useState("");
  const [subject, setSubject]   = useState("");
  const [message, setMessage]   = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  useEffect(() => {
    const el = document.getElementById("contact-section");
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { el.classList.add("visible"); obs.disconnect(); } },
      { threshold: 0.06 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Name, email, and message are required.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!GOOGLE_SCRIPT_URL) {
      setError("Contact form is not configured. Set VITE_GOOGLE_SCRIPT_URL in your environment.");
      return;
    }
    if (isGoogleSheetUrl(GOOGLE_SCRIPT_URL)) {
      setError(
        "Wrong URL configured: use the Apps Script Web App URL (script.google.com/.../exec), not the Google Sheet link."
      );
      return;
    }
    if (!isAppsScriptUrl(GOOGLE_SCRIPT_URL)) {
      setError("VITE_GOOGLE_SCRIPT_URL must be a deployed Apps Script web app URL ending in /exec.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      const params = new URLSearchParams({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        subject: subject.trim(),
        message: message.trim(),
      });

      const res = await fetch(`${GOOGLE_SCRIPT_URL}?${params.toString()}`);
      const text = await res.text();

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(
          "Apps Script returned HTML instead of JSON. Redeploy the script as a Web app with access set to Anyone."
        );
      }

      if (!data.success) throw new Error(data.error || "Submission failed");

      setSuccess(true);
      setName("");
      setEmail("");
      setPhone("");
      setSubject("");
      setMessage("");
    } catch (err) {
      setError(err.message || "Failed to submit contact form. Please try again.");
    }
    setLoading(false);
  };

  return (
    <>
      <header className="header">
        <div className="header-badge">
          <span className="badge-dot" />
          Get in Touch
        </div>
        <h2 className="app-title">Contact Us</h2>
        <p className="app-subtitle">We&apos;ll save your details and get back to you soon</p>
      </header>

      <form className="form contact-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-field">
            <div className="form-label">Full Name *</div>
            <input
              className="form-input"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-field">
            <div className="form-label">Email *</div>
            <input
              className="form-input"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-field">
            <div className="form-label">Phone</div>
            <input
              className="form-input"
              type="tel"
              placeholder="+1 234 567 8900"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="form-field">
            <div className="form-label">Subject</div>
            <input
              className="form-input"
              type="text"
              placeholder="How can we help?"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>
        </div>

        <div className="form-field">
          <div className="form-label">Message *</div>
          <textarea
            className="form-input form-textarea"
            placeholder="Tell us more about your inquiry..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            required
          />
        </div>

        <button className="btn-add" type="submit" disabled={loading}>
          {loading ? (
            <span className="btn-loading"><span className="spinner" />Sending...</span>
          ) : "Send Message"}
        </button>
      </form>

      {error && (
        <div className="error-msg"><span>⚠</span>{error}</div>
      )}

      {success && (
        <div className="success-msg">
          <span>✓</span>
          Thank you! Your contact details have been saved successfully.
        </div>
      )}
    </>
  );
}
