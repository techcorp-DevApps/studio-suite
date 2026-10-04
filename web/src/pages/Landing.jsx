import { useRef, useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

import "@/styles/landing.css";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const initial = { name: "", email: "", phone: "", preferred_date: "", session_type: "wedding", package_preference: "undecided", location: "", message: "" };

export default function Landing() {
  const [form, setForm] = useState(initial);
  const [status, setStatus] = useState({ kind: "idle", message: "" });
  const key = useRef(crypto.randomUUID());
  const update = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault();
    setStatus({ kind: "pending", message: "Sending your request…" });
    try {
      const response = await fetch(`${API}/api/enquiries`, { method: "POST", headers: { "Content-Type": "application/json", "Idempotency-Key": key.current }, body: JSON.stringify(form) });
      const data = await response.json();
      if (!response.ok) throw new Error(response.status === 422 ? "Please review each field and try again." : data.detail || "The studio service is unavailable.");
      setStatus({ kind: "success", message: data.enquiry.status_message });
    } catch (error) {
      setStatus({ kind: "error", message: error.message || "The studio service is unavailable. Your request was not recorded; please retry." });
    }
  };
  return <>
    <header className="site-header"><a className="brand" href="#top">Illuminate Studios</a><nav aria-label="Primary"><a href="#portfolio">Portfolio</a><a href="#experience">Experience</a><a href="#packages">Packages</a><a href="#enquire">Enquire</a></nav><Link className="button secondary" to="/login">Portal</Link></header>
    <main id="top">
      <section className="hero"><div><p className="eyebrow">Melbourne photography studio</p><h1>Stories held<br/><em>in honest light.</em></h1><p className="lede">Considered photography for weddings, portraits, editorials and brands, centred on natural expression and thoughtful direction.</p><div className="actions"><a className="button" href="#enquire">Begin an enquiry <ArrowRight aria-hidden="true"/></a><a className="text-link" href="#portfolio">View selected work</a></div></div><div className="hero-art" aria-hidden="true"><span>Light</span><span>Place</span><span>Presence</span></div></section>
      <section id="portfolio" className="section dark"><p className="eyebrow">Selected work</p><h2>Unscripted, observed, enduring.</h2><div className="frames" aria-label="Portfolio availability"><article><span>Weddings</span><p>Selected client work will be published only with appropriate permission.</p></article><article><span>Portraits</span><p>Private work remains private; approved portfolio material is being prepared.</p></article><article><span>Editorial & brand</span><p>Request a relevant private review when you begin an enquiry.</p></article></div></section>
      <section id="experience" className="section split"><div><p className="eyebrow">The experience</p><h2>A calm, clear process.</h2></div><ol className="steps"><li><b>01 · Tell us what matters</b><span>Share the people, place and preferred date. A preference is not an availability hold.</span></li><li><b>02 · Studio review</b><span>The studio reviews the details and responds with the appropriate next step.</span></li><li><b>03 · Photograph with ease</b><span>Considered preparation and gentle direction leave room for moments to unfold naturally.</span></li><li><b>04 · Receive your selection</b><span>Your selected photographs are presented with care and discretion.</span></li></ol></section>
      <section id="packages" className="section"><p className="eyebrow">Ways to work together</p><h2>Start with the shape of your story.</h2><div className="cards">{[["Essential","Focused coverage for a smaller gathering or portrait session."],["Signature","Extended coverage for a fuller wedding or editorial story."],["Bespoke","A tailored scope for brands, multi-part celebrations or particular requirements."]].map(([title, copy])=><article key={title}><h3>{title}</h3><p>{copy}</p><a href="#enquire">Enquire about {title}</a></article>)}</div><p className="note">Scope and availability are confirmed by the studio after review. No date is held by submitting this form.</p></section>
      <section className="section quote" aria-labelledby="client-words"><p className="eyebrow">Client words</p><h2 id="client-words">Testimonials will appear here only with client approval.</h2><p>We do not publish placeholder endorsements or unverified claims.</p></section>
      <section id="enquire" className="section enquiry"><div><p className="eyebrow">Begin an enquiry</p><h2>Share what you are planning.</h2><p>This sends a tentative request for studio review. It does not reserve, hold or confirm a date.</p></div><form onSubmit={submit} aria-describedby="form-note form-status"><div className="field-grid"><Field label="Name" name="name" value={form.name} onChange={update}/><Field label="Email" name="email" type="email" value={form.email} onChange={update}/><Field label="Phone" name="phone" type="tel" value={form.phone} onChange={update}/><Field label="Preferred date" name="preferred_date" type="date" value={form.preferred_date} onChange={update}/><Select label="Session type" name="session_type" value={form.session_type} onChange={update} options={["wedding","portrait","editorial","brand","other"]}/><Select label="Package preference" name="package_preference" value={form.package_preference} onChange={update} options={["undecided","essential","signature","bespoke"]}/></div><Field label="Location" name="location" value={form.location} onChange={update}/><label>Tell us about your plans<textarea required minLength="10" maxLength="2000" name="message" value={form.message} onChange={update}/></label><p id="form-note" className="note">Required fields are checked by the studio service before your request is stored.</p><button className="button" disabled={status.kind === "pending"}>{status.kind === "pending" ? "Sending…" : "Send tentative request"}</button><p id="form-status" className={`status ${status.kind}`} role="status">{status.kind === "success" && <CheckCircle2 aria-hidden="true"/>}{status.message}</p></form></section>
    </main><footer><a className="brand" href="#top">Illuminate Studios</a><p>Melbourne, Australia · Enquiries are reviewed by the studio.</p><Link to="/login">Studio & client sign in</Link></footer>
  </>;
}

function Field({ label, ...props }) { return <label>{label}<input required {...props}/></label>; }
function Select({ label, options, ...props }) { return <label>{label}<select {...props}>{options.map(option=><option key={option} value={option}>{option[0].toUpperCase()+option.slice(1)}</option>)}</select></label>; }
