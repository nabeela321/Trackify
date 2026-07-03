import { useState, useEffect } from "react";
import { X, Save, Clock, CheckSquare, Bookmark, FileText, Globe, Building, Search, Briefcase } from "lucide-react";
import toast from "react-hot-toast";

function InterviewHub({ job, onClose, token, onJobUpdated }) {
  const [notes, setNotes] = useState(job.notes || "");
  const [checklist, setChecklist] = useState(job.checklist || []);
  const [newItem, setNewItem] = useState("");
  const [resumeUsed, setResumeUsed] = useState(job.resumeUsed || "");
  const [jobDescription, setJobDescription] = useState(job.jobDescription || "");
  const [questions, setQuestions] = useState(null);
  const [timeLeft, setTimeLeft] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    // Fetch Questions
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`${API_URL}/api/questions/${encodeURIComponent(job.role)}`, {
          headers: { Authorization: token }
        });
        if (res.ok) setQuestions(await res.json());
      } catch (e) { console.error(e); }
    };
    fetchQuestions();

    // Timer Logic
    if (job.interviewDate) {
      const target = new Date(job.interviewDate).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const distance = target - now;
        if (distance < 0) {
          setTimeLeft("Interview Date Passed");
          clearInterval(interval);
          return;
        }
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        setTimeLeft(`${days}d ${hours}h ${minutes}m left`);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [job.role, job.interviewDate, token, API_URL]);

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/job/${job._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ notes, checklist, resumeUsed, jobDescription })
      });
      if (res.ok) {
        const updatedJob = await res.json();
        onJobUpdated(updatedJob);
        toast.success("Workspace saved");
      }
    } catch {
      toast.error("Failed to save workspace");
    }
  };

  const handleAddChecklist = (e) => {
    if (e.key === 'Enter' && newItem.trim()) {
      setChecklist([...checklist, newItem.trim()]);
      setNewItem("");
    }
  };

  const removeChecklist = (index) => {
    setChecklist(checklist.filter((_, i) => i !== index));
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)", backdropFilter: "blur(10px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      padding: "20px"
    }}>
      <div className="glass-panel animate-slide-up" style={{ width: "100%", maxWidth: "1000px", height: "90vh", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden" }}>
        
        {/* Header */}
        <div style={{ padding: "25px 30px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            {job.logo ? <img src={job.logo} alt="logo" style={{ width: 40, height: 40, borderRadius: "8px", objectFit: "contain", background: "white" }} /> : <Building size={40} color="var(--primary)" />}
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "700" }}>{job.company} Workspace</h2>
              <p style={{ color: "var(--text-secondary)" }}>{job.role} • {job.interviewDate || "No interview date set"} {timeLeft && <span style={{ color: "var(--primary)", fontWeight: 600 }}>({timeLeft})</span>}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="premium-btn" onClick={handleSave} style={{ padding: "8px 16px" }}>
              <Save size={16} style={{ marginRight: "6px" }} /> Save Work
            </button>
            <button onClick={onClose} style={{ background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "10px", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-secondary)" }}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Links Bar */}
        <div style={{ padding: "10px 30px", borderBottom: "1px solid var(--border-color)", display: "flex", gap: "15px", background: "var(--bg-input)" }}>
          {job.website && <a href={job.website} target="_blank" rel="noreferrer" style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}><Globe size={14} /> Website</a>}
          {job.linkedin && <a href={job.linkedin} target="_blank" rel="noreferrer" style={{ color: "#0A66C2", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}><Search size={14} /> LinkedIn</a>}
          {job.glassdoor && <a href={job.glassdoor} target="_blank" rel="noreferrer" style={{ color: "#0CAA41", display: "flex", alignItems: "center", gap: "5px", fontSize: "13px" }}><Building size={14} /> Glassdoor</a>}
        </div>

        {/* Content Body */}
        <div className="interview-hub-grid" style={{ flex: 1, padding: "30px", overflowY: "auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
          
          {/* Left Col - Notes & Resume */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
              <Briefcase size={18} color="var(--primary)" /> Job Description & Resume Used
            </h3>
            <textarea 
              value={jobDescription}
              onChange={e => setJobDescription(e.target.value)}
              placeholder="Paste Job Description here..."
              style={{ flex: 1, minHeight: "150px", padding: "15px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", resize: "none", fontSize: "13px", fontFamily: "inherit" }}
            />
            <input 
              value={resumeUsed}
              onChange={e => setResumeUsed(e.target.value)}
              className="premium-input"
              placeholder="Which version of your resume did you use? (e.g. Frontend_V2.pdf)"
            />

            <h3 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginTop: "10px" }}>
              <FileText size={18} color="var(--primary)" /> Preparation Notes
            </h3>
            <textarea 
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Jot down important company facts, questions to ask, or your pitch..."
              style={{ flex: 1, minHeight: "200px", padding: "15px", borderRadius: "10px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", resize: "none", fontSize: "14px", fontFamily: "inherit" }}
            />
          </div>

          {/* Right Col - Checklist & Questions */}
          <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
            
            {/* Checklist */}
            <div>
              <h3 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                <CheckSquare size={18} color="var(--primary)" /> Pre-Interview Checklist
              </h3>
              
              <div className="premium-input-group" style={{ marginBottom: "15px" }}>
                <input 
                  className="premium-input" 
                  placeholder="Add item & press Enter" 
                  value={newItem}
                  onChange={e => setNewItem(e.target.value)}
                  onKeyDown={handleAddChecklist}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "150px", overflowY: "auto" }}>
                {checklist.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px", background: "var(--bg-input)", borderRadius: "10px", border: "1px solid var(--border-color)" }}>
                    <span style={{ fontSize: "14px" }}>{item}</span>
                    <button onClick={() => removeChecklist(i)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}><X size={16} /></button>
                  </div>
                ))}
                {checklist.length === 0 && <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>No items added yet.</p>}
              </div>
            </div>

            {/* Smart Suggestions from Local DB */}
            {questions && (
              <div>
                <h3 style={{ fontSize: "16px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                  <Bookmark size={18} color="var(--primary)" /> Interview Questions Database
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto", paddingRight: "10px" }}>
                  
                  <div style={{ background: "var(--primary-glow)", padding: "15px", borderRadius: "10px", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
                    <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: 600, marginBottom: "5px" }}>💡 Preparation Tip</p>
                    <p style={{ fontSize: "13px", color: "var(--text-primary)" }}>{questions.tips}</p>
                  </div>

                  <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Technical Questions</p>
                    <ul style={{ fontSize: "13px", paddingLeft: "20px", color: "var(--text-secondary)" }}>
                      {questions.technicalQuestions.map((q, i) => <li key={i} style={{ marginBottom: "5px" }}>{q}</li>)}
                    </ul>
                  </div>

                  <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                    <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>HR & Behavioral Questions</p>
                    <ul style={{ fontSize: "13px", paddingLeft: "20px", color: "var(--text-secondary)" }}>
                      {questions.hrQuestions.map((q, i) => <li key={i} style={{ marginBottom: "5px" }}>{q}</li>)}
                    </ul>
                  </div>

                  {questions.resources && questions.resources.length > 0 && (
                    <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                      <p style={{ fontSize: "14px", fontWeight: 600, marginBottom: "10px" }}>Useful Resources</p>
                      <ul style={{ fontSize: "13px", paddingLeft: "20px" }}>
                        {questions.resources.map((r, i) => <li key={i} style={{ marginBottom: "5px" }}><a href={r.url} target="_blank" rel="noreferrer" style={{ color: "var(--primary)" }}>{r.title}</a></li>)}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default InterviewHub;
