import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";

const API = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
const auth = () => ({ Authorization: `Bearer ${sessionStorage.getItem("studio-suite-token")}` });

export function Login() {
  const navigate = useNavigate(); const [error, setError] = useState(""); const [pending, setPending] = useState(false);
  const submit = async (event) => { event.preventDefault(); setPending(true); setError(""); const body = Object.fromEntries(new FormData(event.currentTarget)); try { const response = await fetch(`${API}/api/auth/login`, { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body) }); const data=await response.json(); if(!response.ok) throw new Error(data.detail); sessionStorage.setItem("studio-suite-token", data.access_token); sessionStorage.setItem("studio-suite-role", data.role); navigate(`/${data.role}`); } catch (err) { setError(err.message || "Sign in is unavailable."); } finally { setPending(false); } };
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}><Link to="/">← Home</Link><p className="eyebrow">Secure portal</p><h1>Sign in</h1><label>Email<input name="email" type="email" autoComplete="username" required/></label><label>Password<input name="password" type="password" autoComplete="current-password" minLength="10" required/></label><button className="button" disabled={pending}>{pending?"Signing in…":"Sign in"}</button>{error&&<p className="status error" role="alert">{error}</p>}<p className="note">Accounts are created by the studio. Recovery delivery is not currently configured.</p></form></main>;
}

export function Portal({ role }) {
  const [state,setState]=useState({loading:true,error:"",items:[]}); const navigate=useNavigate();
  useEffect(()=>{ if(sessionStorage.getItem("studio-suite-role")!==role){setState({loading:false,error:"forbidden",items:[]});return;} fetch(`${API}/api/${role}/${role==="studio"?"enquiries":"bookings"}`,{headers:auth()}).then(async response=>{if(response.status===401){sessionStorage.clear();navigate("/login");return;} if(!response.ok)throw new Error("The portal could not be loaded."); const data=await response.json();setState({loading:false,error:"",items:data.items});}).catch(error=>setState({loading:false,error:error.message,items:[]}));},[navigate,role]);
  if(state.error==="forbidden") return <Navigate to="/login" replace/>;
  const logout=async()=>{await fetch(`${API}/api/auth/logout`,{method:"POST",headers:auth()});sessionStorage.clear();navigate("/login");};
  return <main className="portal"><header><div><p className="eyebrow">Illuminate Studios</p><h1>{role==="studio"?"Enquiry review":"Your bookings"}</h1></div><button className="button secondary" onClick={logout}>Sign out</button></header>{state.loading?<p role="status">Loading…</p>:state.error?<p role="alert" className="status error">{state.error}</p>:state.items.length===0?<section className="empty"><h2>Nothing to show yet</h2><p>{role==="studio"?"New tentative enquiries will appear here.":"A booking appears only after studio confirmation and account linkage."}</p></section>:<div className="portal-list">{state.items.map(item=><article key={item.id}><span className={`pill ${item.state}`}>{item.state.replaceAll("_"," ")}</span><h2>{item.name || item.enquiry?.session_type || "Booking"}</h2><p>{item.status_message}</p>{item.preferred_date&&<p><b>Preferred date:</b> {item.preferred_date}</p>}{item.enquiry&&<p><b>Date:</b> {item.enquiry.preferred_date} · <b>Location:</b> {item.enquiry.location}</p>}<p className="note">Galleries, documents and payments are not available in this phase.</p></article>)}</div>}</main>;
}
