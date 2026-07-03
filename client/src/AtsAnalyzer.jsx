import { useState, useEffect } from "react";
import { FileSearch, Upload, ArrowLeft, CheckCircle2, AlertTriangle, Briefcase, FileText, Activity } from "lucide-react";
import toast from "react-hot-toast";

function AtsAnalyzer({ token, theme }) {
  const [view, setView] = useState("dashboard"); // "dashboard" | "scan" | "result"
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  // Scan State
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [currentResult, setCurrentResult] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    if (view === "dashboard") {
      fetchHistory();
    }
  }, [view]);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ats/history`, {
        headers: { Authorization: token }
      });
      if (res.ok) setHistory(await res.json());
    } catch {
      toast.error("Failed to load ATS history.");
    } finally {
      setLoading(false);
    }
  };

  const handleScan = async () => {
    if (!resumeFile) return toast.error("Please upload a resume (PDF).");
    if (!jobDescription.trim()) return toast.error("Please provide a Job Description.");

    setIsScanning(true);
    const formData = new FormData();
    formData.append("resume", resumeFile);
    formData.append("jobTitle", jobTitle);
    formData.append("company", company);
    formData.append("jobDescription", jobDescription);

    try {
      const res = await fetch(`${API_URL}/api/ats/scan`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentResult(data);
        setView("result");
        // Reset form
        setJobTitle("");
        setCompany("");
        setJobDescription("");
        setResumeFile(null);
      } else {
        toast.error(data.message || "Failed to scan resume.");
      }
    } catch {
      toast.error("Error connecting to server.");
    } finally {
      setIsScanning(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "var(--success)";
    if (score >= 60) return "var(--warning)";
    return "var(--danger)";
  };

  // ----- RENDER DASHBOARD -----
  if (view === "dashboard") {
    const avgScore = history.length > 0 
      ? Math.round(history.reduce((sum, h) => sum + h.atsScore, 0) / history.length) 
      : 0;

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>ATS Analyzer</h2>
            <p style={{ color: "var(--text-secondary)" }}>Beat the bots. Compare your resume against any job description.</p>
          </div>
          <button onClick={() => setView("scan")} className="premium-btn" style={{ fontSize: "16px", padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <FileSearch size={18} fill="white" /> New ATS Scan
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid var(--primary)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Total Resumes Scanned</p>
            <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{history.length}</h3>
          </div>
          <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid var(--warning)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Average ATS Score</p>
            <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{avgScore}%</h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "25px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Scan History</h3>
          {loading ? (
            <p style={{ color: "var(--text-secondary)" }}>Loading history...</p>
          ) : history.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>You haven't scanned any resumes yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {history.map(h => (
                <div key={h._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "var(--bg-input)", borderRadius: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 600 }}>{h.jobTitle} {h.company ? `at ${h.company}` : ''}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{new Date(h.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px", color: getScoreColor(h.atsScore), fontWeight: 700 }}>
                      <Activity size={18} /> {h.atsScore}% Match
                    </div>
                    <button onClick={() => { setCurrentResult(h); setView("result"); }} className="secondary-btn" style={{ fontSize: "13px", padding: "6px 12px" }}>
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- RENDER SCAN FORM -----
  if (view === "scan") {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", marginBottom: "20px" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FileSearch size={24} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "700" }}>New ATS Scan</h2>
              <p style={{ color: "var(--text-secondary)" }}>See how well your resume matches the job description.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Job Title (Optional)</label>
              <input className="premium-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Software Engineer" disabled={isScanning}/>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Company (Optional)</label>
              <input className="premium-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" disabled={isScanning}/>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "25px" }}>
            <label style={{ fontSize: "14px", fontWeight: 600 }}>Job Description*</label>
            <textarea 
              className="premium-input" 
              value={jobDescription} 
              onChange={e => setJobDescription(e.target.value)} 
              placeholder="Paste the full job description here..." 
              style={{ minHeight: "150px", resize: "vertical" }}
              disabled={isScanning}
            />
          </div>

          <div style={{ background: "var(--bg-input)", padding: "25px", borderRadius: "12px", border: "2px dashed var(--border-color)", marginBottom: "30px", textAlign: "center" }}>
            <FileText size={32} color="var(--text-secondary)" style={{ margin: "0 auto 10px" }} />
            <h4 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "5px" }}>Upload Resume</h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "15px" }}>Must be a PDF file.</p>
            <input type="file" accept="application/pdf" onChange={e => setResumeFile(e.target.files[0])} disabled={isScanning} style={{ maxWidth: "250px", margin: "0 auto", display: "block" }} />
          </div>

          <button onClick={handleScan} className="premium-btn" style={{ width: "100%", padding: "15px", fontSize: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }} disabled={isScanning}>
            {isScanning ? (
              <span className="animate-pulse">Analyzing Resume with AI...</span>
            ) : (
              <>Scan Resume</>
            )}
          </button>
        </div>
      </div>
    );
  }

  // ----- RENDER RESULTS -----
  if (view === "result" && currentResult) {
    const res = currentResult;
    const scoreColor = getScoreColor(res.atsScore);

    return (
      <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "50px" }}>
        <button onClick={() => {setView("dashboard"); setCurrentResult(null);}} style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", marginBottom: "20px" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>ATS Scan Results</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "15px", display: "flex", alignItems: "center", gap: "5px" }}>
            <Briefcase size={16} /> {res.jobTitle} {res.company ? `at ${res.company}` : ''}
          </p>
        </div>

        {/* Score Card */}
        <div className="glass-panel" style={{ display: "flex", justifyContent: "center", padding: "40px", marginBottom: "30px", background: "var(--bg-input)" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ 
              width: "150px", height: "150px", borderRadius: "50%", 
              border: `8px solid ${scoreColor}`, 
              display: "flex", alignItems: "center", justifyContent: "center", 
              margin: "0 auto 15px", background: "var(--bg-card)"
            }}>
              <span style={{ fontSize: "48px", fontWeight: 800, color: scoreColor }}>{res.atsScore}</span>
              <span style={{ fontSize: "24px", color: scoreColor, marginLeft: "2px" }}>%</span>
            </div>
            <h3 style={{ fontSize: "20px", fontWeight: 700 }}>Match Score</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", marginTop: "5px" }}>
              {res.atsScore >= 80 ? "Excellent match! You are highly likely to pass the ATS." : 
               res.atsScore >= 60 ? "Good match, but missing some key terms." : 
               "Low match. Needs significant optimization for this role."}
            </p>
          </div>
        </div>

        {/* Keywords */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
          <div className="glass-panel" style={{ padding: "25px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <CheckCircle2 size={20} /> Found Keywords
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {res.matchingKeywords?.length > 0 ? res.matchingKeywords.map((kw, i) => (
                <span key={i} style={{ padding: "6px 12px", background: "rgba(34, 197, 94, 0.1)", color: "var(--success)", border: "1px solid rgba(34, 197, 94, 0.2)", borderRadius: "20px", fontSize: "13px", fontWeight: 500 }}>
                  {kw}
                </span>
              )) : <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No significant matches found.</span>}
            </div>
          </div>
          
          <div className="glass-panel" style={{ padding: "25px" }}>
            <h3 style={{ fontSize: "17px", fontWeight: 600, color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "20px" }}>
              <AlertTriangle size={20} /> Missing Keywords
            </h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {res.missingKeywords?.length > 0 ? res.missingKeywords.map((kw, i) => (
                <span key={i} style={{ padding: "6px 12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "20px", fontSize: "13px", fontWeight: 500 }}>
                  {kw}
                </span>
              )) : <span style={{ color: "var(--text-secondary)", fontSize: "14px" }}>No major missing keywords!</span>}
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div className="glass-panel" style={{ padding: "30px", background: "var(--primary-glow)", border: "1px solid rgba(99, 102, 241, 0.2)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px", color: "var(--primary)" }}>
            <FileSearch size={20} /> AI Improvement Tips
          </h3>
          <p style={{ fontSize: "15px", lineHeight: "1.6", color: "var(--text-primary)" }}>
            {res.feedback}
          </p>
        </div>

      </div>
    );
  }

  return null;
}

export default AtsAnalyzer;
