import { useState, useEffect, useRef } from "react";
import { Bot, Play, User, BrainCircuit, Upload, MessageSquare, BarChart, ChevronRight, CheckCircle2, AlertTriangle, ArrowLeft, BookOpen } from "lucide-react";
import toast from "react-hot-toast";

function AICoachHub({ token, theme }) {
  const [view, setView] = useState("dashboard"); // "dashboard" | "setup" | "interview" | "report"
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Setup State
  const [role, setRole] = useState("Software Engineer");
  const [company, setCompany] = useState("");
  const [tech, setTech] = useState("");
  const [type, setType] = useState("Technical");
  const [experience, setExperience] = useState("Junior");
  const [resumeText, setResumeText] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Active Session State
  const [currentSession, setCurrentSession] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  const chatEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (view === "interview") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentSession?.history, view]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-coach/sessions`, {
        headers: { Authorization: token }
      });
      if (res.ok) setSessions(await res.json());
    } catch {
      toast.error("Failed to load sessions.");
    } finally {
      setLoading(false);
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are supported");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("resume", file);

    try {
      const res = await fetch(`${API_URL}/api/ai-coach/parse-resume`, {
        method: "POST",
        headers: { Authorization: token },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setResumeText(data.text);
        toast.success("Resume parsed successfully!");
      } else {
        toast.error("Failed to parse resume.");
      }
    } catch {
      toast.error("Error uploading resume.");
    } finally {
      setIsUploading(false);
    }
  };

  const startInterview = async () => {
    if (!role) return toast.error("Role is required.");
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-coach/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ role, company, tech, type, experience, resumeText })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentSession(data);
        setView("interview");
      } else {
        toast.error("Failed to start session.");
      }
    } catch {
      toast.error("Error connecting to AI Coach.");
    } finally {
      setIsProcessing(false);
    }
  };

  const submitAnswer = async () => {
    if (!answerText.trim()) return toast.error("Please provide an answer.");
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-coach/answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ sessionId: currentSession._id, answer: answerText })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentSession(data);
        setAnswerText("");
      } else {
        toast.error("Failed to submit answer.");
      }
    } catch {
      toast.error("Error connecting to AI Coach.");
    } finally {
      setIsProcessing(false);
    }
  };

  const endInterview = async () => {
    if (!window.confirm("Are you sure you want to end this interview and generate the final report?")) return;
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/ai-coach/end`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ sessionId: currentSession._id })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentSession(data);
        setView("report");
        fetchSessions();
      } else {
        toast.error("Failed to generate report.");
      }
    } catch {
      toast.error("Error generating report.");
    } finally {
      setIsProcessing(false);
    }
  };

  const openReport = (session) => {
    setCurrentSession(session);
    setView("report");
  };

  // ----- RENDER DASHBOARD -----
  if (view === "dashboard") {
    const completed = sessions.filter(s => s.status === "completed");
    const avgScore = completed.length > 0 
      ? (completed.reduce((sum, s) => sum + (s.finalReport?.overallScore || 0), 0) / completed.length).toFixed(1) 
      : 0;

    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "5px" }}>AI Interview Coach</h2>
            <p style={{ color: "var(--text-secondary)" }}>Practice, evaluate, and improve your interviewing skills.</p>
          </div>
          <button onClick={() => setView("setup")} className="premium-btn" style={{ fontSize: "16px", padding: "12px 24px", display: "flex", alignItems: "center", gap: "8px" }}>
            <Play size={18} fill="white" /> Start New Interview
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
          <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid var(--primary)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Completed Interviews</p>
            <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{completed.length}</h3>
          </div>
          <div className="glass-panel" style={{ padding: "20px", borderLeft: "4px solid var(--warning)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Average Score</p>
            <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{avgScore}<span style={{ fontSize: "18px", color: "var(--text-secondary)" }}>/10</span></h3>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "25px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "20px" }}>Recent Sessions</h3>
          {loading ? (
            <p style={{ color: "var(--text-secondary)" }}>Loading history...</p>
          ) : sessions.length === 0 ? (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px 0" }}>You haven't completed any AI interviews yet.</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {sessions.map(s => (
                <div key={s._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", background: "var(--bg-input)", borderRadius: "10px" }}>
                  <div>
                    <h4 style={{ fontSize: "16px", fontWeight: 600 }}>{s.setup.role} {s.setup.company ? `at ${s.setup.company}` : ''}</h4>
                    <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{new Date(s.createdAt).toLocaleDateString()} • {s.setup.type}</p>
                  </div>
                  <div>
                    {s.status === "completed" ? (
                      <button onClick={() => openReport(s)} className="secondary-btn" style={{ fontSize: "13px", padding: "6px 12px" }}>View Report ({s.finalReport?.overallScore}/10)</button>
                    ) : (
                      <span style={{ fontSize: "12px", background: "var(--warning)", color: "white", padding: "4px 8px", borderRadius: "12px", fontWeight: 600 }}>In Progress</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ----- RENDER SETUP -----
  if (view === "setup") {
    return (
      <div className="animate-fade-in" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <button onClick={() => setView("dashboard")} style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", marginBottom: "20px" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <div className="glass-panel" style={{ padding: "30px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "30px" }}>
            <div style={{ width: "50px", height: "50px", borderRadius: "12px", background: "var(--primary-glow)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <BrainCircuit size={24} color="var(--primary)" />
            </div>
            <div>
              <h2 style={{ fontSize: "24px", fontWeight: "700" }}>Configure Interview</h2>
              <p style={{ color: "var(--text-secondary)" }}>Tailor the AI to your specific target role.</p>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Job Role*</label>
              <input className="premium-input" value={role} onChange={e => setRole(e.target.value)} placeholder="e.g. Frontend Developer" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Company (Optional)</label>
              <input className="premium-input" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. Google" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Technologies</label>
              <input className="premium-input" value={tech} onChange={e => setTech(e.target.value)} placeholder="e.g. React, Node, AWS" />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Experience Level</label>
              <select className="premium-input" value={experience} onChange={e => setExperience(e.target.value)}>
                <option value="Intern">Intern</option>
                <option value="Junior">Junior (0-2 years)</option>
                <option value="Mid-Level">Mid-Level (2-5 years)</option>
                <option value="Senior">Senior (5+ years)</option>
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "14px", fontWeight: 600 }}>Interview Type</label>
              <select className="premium-input" value={type} onChange={e => setType(e.target.value)}>
                <option value="Technical">Technical / Domain Knowledge</option>
                <option value="Behavioral">Behavioral (HR)</option>
                <option value="System Design">System Design</option>
                <option value="Mixed">Mixed</option>
              </select>
            </div>
          </div>

          <div style={{ background: "var(--bg-input)", padding: "20px", borderRadius: "12px", border: "1px dashed var(--border-color)", marginBottom: "30px" }}>
            <h4 style={{ fontSize: "15px", fontWeight: 600, marginBottom: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Upload size={16} /> Optional: Tailor to Your Resume
            </h4>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "15px" }}>Upload your resume (PDF) so the AI can ask project-specific questions based on your experience.</p>
            <input type="file" accept="application/pdf" onChange={handleResumeUpload} style={{ fontSize: "14px" }} disabled={isUploading} />
            {isUploading && <span style={{ fontSize: "13px", marginLeft: "10px", color: "var(--primary)" }}>Parsing resume...</span>}
            {resumeText && <p style={{ fontSize: "13px", color: "var(--success)", marginTop: "10px", display: "flex", alignItems: "center", gap: "5px" }}><CheckCircle2 size={14}/> Resume parsed successfully.</p>}
          </div>

          <button onClick={startInterview} className="premium-btn" style={{ width: "100%", padding: "15px", fontSize: "16px", display: "flex", justifyContent: "center", alignItems: "center", gap: "8px" }} disabled={isProcessing}>
            {isProcessing ? "Initializing AI..." : <><Play size={18} fill="white" /> Start Interview</>}
          </button>
        </div>
      </div>
    );
  }

  // ----- RENDER ACTIVE INTERVIEW -----
  if (view === "interview" && currentSession) {
    return (
      <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "20px", fontWeight: "700" }}>{currentSession.setup.role} Interview</h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>Type: {currentSession.setup.type} • AI Interviewer is active</p>
          </div>
          <button onClick={endInterview} className="danger-btn" disabled={isProcessing}>End Interview & Get Report</button>
        </div>

        <div className="glass-panel" style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* Chat History */}
          <div style={{ flex: 1, overflowY: "auto", padding: "25px", display: "flex", flexDirection: "column", gap: "20px" }}>
            {currentSession.history.map((msg, i) => {
              if (msg.role === "model") {
                return (
                  <div key={i} style={{ display: "flex", gap: "15px", maxWidth: "80%" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Bot size={20} color="white" />
                    </div>
                    <div style={{ background: "var(--bg-input)", padding: "15px 20px", borderRadius: "0 15px 15px 15px", fontSize: "15px", lineHeight: "1.5" }}>
                      {msg.text}
                    </div>
                  </div>
                )
              } else {
                return (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", alignSelf: "flex-end", maxWidth: "80%" }}>
                    <div style={{ display: "flex", gap: "15px", flexDirection: "row-reverse" }}>
                      <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--text-primary)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <User size={20} color="var(--bg-main)" />
                      </div>
                      <div style={{ background: "var(--primary-glow)", border: "1px solid rgba(35, 75, 58, 0.3)", padding: "15px 20px", borderRadius: "15px 0 15px 15px", fontSize: "15px", lineHeight: "1.5" }}>
                        {msg.text}
                      </div>
                    </div>
                    
                    {/* Feedback Bubble */}
                    {msg.feedback && (
                      <div className="animate-slide-up" style={{ width: "100%", background: "var(--bg-card)", border: `1px solid ${msg.score >= 7 ? 'var(--success)' : 'var(--warning)'}`, padding: "15px", borderRadius: "12px", fontSize: "13px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontWeight: 700 }}>
                          <span style={{ color: msg.score >= 7 ? 'var(--success)' : 'var(--warning)' }}>AI Evaluation</span>
                          <span>Score: {msg.score}/10</span>
                        </div>
                        <p style={{ marginBottom: "8px" }}><strong>Feedback:</strong> {msg.feedback}</p>
                        <p style={{ color: "var(--success)", marginBottom: "4px" }}><strong>+ Strengths:</strong> {msg.strengths}</p>
                        <p style={{ color: "var(--danger)", marginBottom: "8px" }}><strong>- Areas to Improve:</strong> {msg.weaknesses}</p>
                        <details>
                          <summary style={{ color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>See an ideal 10/10 answer</summary>
                          <p style={{ marginTop: "5px", padding: "10px", background: "var(--bg-input)", borderRadius: "8px", fontStyle: "italic" }}>{msg.betterAnswer}</p>
                        </details>
                      </div>
                    )}
                  </div>
                )
              }
            })}
            
            {isProcessing && (
              <div className="animate-fade-in" style={{ display: "flex", gap: "15px", maxWidth: "80%" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Bot size={20} color="white" />
                </div>
                <div style={{ background: "var(--bg-input)", padding: "15px 20px", borderRadius: "0 15px 15px 15px", fontSize: "14px", fontStyle: "italic", color: "var(--text-secondary)" }}>
                  AI is thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: "20px", borderTop: "1px solid var(--border-color)", background: "var(--bg-card)" }}>
            <div style={{ display: "flex", gap: "15px" }}>
              <textarea 
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                placeholder="Type your answer here... Treat it like a real conversation."
                style={{ flex: 1, padding: "15px", borderRadius: "12px", border: "1px solid var(--border-color)", background: "var(--bg-input)", color: "var(--text-primary)", resize: "none", height: "80px", fontFamily: "inherit", fontSize: "14px" }}
                disabled={isProcessing}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submitAnswer();
                  }
                }}
              />
              <button onClick={submitAnswer} className="premium-btn" style={{ padding: "0 25px", display: "flex", alignItems: "center", justifyContent: "center" }} disabled={isProcessing || !answerText.trim()}>
                <MessageSquare size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ----- RENDER REPORT -----
  if (view === "report" && currentSession?.finalReport) {
    const report = currentSession.finalReport;
    return (
      <div className="animate-fade-in" style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "50px" }}>
        <button onClick={() => {setView("dashboard"); setCurrentSession(null);}} style={{ background: "none", border: "none", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "5px", cursor: "pointer", marginBottom: "20px" }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <h2 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "10px" }}>Interview Final Report</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>{currentSession.setup.role} {currentSession.setup.company ? `at ${currentSession.setup.company}` : ''}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "20px", marginBottom: "30px" }}>
          <div className="glass-panel" style={{ padding: "30px", textAlign: "center", background: "var(--primary-glow)" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 600, textTransform: "uppercase" }}>Overall Score</p>
            <h3 style={{ fontSize: "48px", fontWeight: "700", color: "var(--primary)" }}>{report.overallScore}/10</h3>
          </div>
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Technical Depth</p>
            <h3 style={{ fontSize: "32px", fontWeight: "700", marginTop: "10px" }}>{report.technicalScore}/10</h3>
          </div>
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Communication</p>
            <h3 style={{ fontSize: "32px", fontWeight: "700", marginTop: "10px" }}>{report.communicationScore}/10</h3>
          </div>
          <div className="glass-panel" style={{ padding: "20px", textAlign: "center" }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "13px", fontWeight: 600 }}>Confidence & Structure</p>
            <h3 style={{ fontSize: "32px", fontWeight: "700", marginTop: "10px" }}>{report.confidenceScore}/10</h3>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px", marginBottom: "30px" }}>
          <div className="glass-panel" style={{ padding: "25px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--success)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
              <CheckCircle2 size={20} /> What You Did Well
            </h3>
            <ul style={{ paddingLeft: "20px", color: "var(--text-primary)", fontSize: "15px", lineHeight: "1.6" }}>
              {report.strongAreas.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
          
          <div className="glass-panel" style={{ padding: "25px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: 600, color: "var(--danger)", display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
              <AlertTriangle size={20} /> Areas to Improve
            </h3>
            <ul style={{ paddingLeft: "20px", color: "var(--text-primary)", fontSize: "15px", lineHeight: "1.6" }}>
              {report.weakAreas.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "30px", marginBottom: "30px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
            <BookOpen size={20} color="var(--primary)" /> Topics to Revise
          </h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {report.topicsToRevise.map((item, i) => (
              <span key={i} style={{ padding: "8px 15px", background: "var(--bg-input)", border: "1px solid var(--border-color)", borderRadius: "20px", fontSize: "14px", fontWeight: 500 }}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "30px", background: "var(--bg-input)" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
            <Bot size={20} color="var(--primary)" /> Final Verdict from AI Coach
          </h3>
          <p style={{ fontSize: "16px", lineHeight: "1.6", color: "var(--text-primary)" }}>
            {report.feedback}
          </p>
        </div>
      </div>
    );
  }

  return null;
}

export default AICoachHub;
