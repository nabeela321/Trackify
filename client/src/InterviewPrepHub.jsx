import { useState, useEffect } from "react";
import { Building, BookOpen, Code, Users, MonitorPlay, Link2, CheckCircle2, Bookmark, Award, Clock } from "lucide-react";
import toast from "react-hot-toast";

function InterviewPrepHub({ token, theme }) {
  const [activeTab, setActiveTab] = useState("topics");
  const [hubData, setHubData] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);

  // Mock Interview State
  const [mockActive, setMockActive] = useState(false);
  const [mockQuestions, setMockQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [showMockAnswer, setShowMockAnswer] = useState(false);
  const [mockScore, setMockScore] = useState(0);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dataRes, progRes] = await Promise.all([
          fetch(`${API_URL}/api/interview-hub/data`, { headers: { Authorization: token } }),
          fetch(`${API_URL}/api/interview-hub/progress`, { headers: { Authorization: token } })
        ]);
        if (dataRes.ok) setHubData(await dataRes.json());
        if (progRes.ok) setProgress(await progRes.json());
      } catch (e) {
        toast.error("Failed to load Interview Hub data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [token, API_URL]);

  const saveProgress = async (updates) => {
    try {
      const newProgress = { ...progress, ...updates };
      setProgress(newProgress);
      await fetch(`${API_URL}/api/interview-hub/progress`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify(updates)
      });
    } catch {
      toast.error("Failed to save progress.");
    }
  };

  const toggleTopic = (topicId) => {
    let completed = progress?.completedTopics || [];
    if (completed.includes(topicId)) completed = completed.filter(t => t !== topicId);
    else completed = [...completed, topicId];
    saveProgress({ completedTopics: completed });
  };

  const toggleCoding = (codingId) => {
    let solved = progress?.solvedCoding || [];
    if (solved.includes(codingId)) solved = solved.filter(c => c !== codingId);
    else solved = [...solved, codingId];
    saveProgress({ solvedCoding: solved });
  };

  const toggleBookmark = (qStr) => {
    let marks = progress?.bookmarkedQuestions || [];
    if (marks.includes(qStr)) marks = marks.filter(m => m !== qStr);
    else marks = [...marks, qStr];
    saveProgress({ bookmarkedQuestions: marks });
  };

  const startMockInterview = () => {
    if (!hubData) return;
    // Collect all technical/topic questions
    let allQ = [];
    hubData.topics.forEach(t => {
      t.questions.forEach(q => allQ.push({ ...q, topic: t.title }));
    });
    // Shuffle and pick 5
    allQ = allQ.sort(() => 0.5 - Math.random()).slice(0, 5);
    setMockQuestions(allQ);
    setMockActive(true);
    setCurrentQIndex(0);
    setShowMockAnswer(false);
    setMockScore(0);
  };

  const endMockInterview = (finalScore) => {
    setMockActive(false);
    saveProgress({ mockInterview: { date: new Date(), score: finalScore, total: mockQuestions.length } });
    toast.success(`Mock Interview Completed! Score: ${finalScore}/${mockQuestions.length}`);
  };

  const handleMockNext = (correct) => {
    const newScore = correct ? mockScore + 1 : mockScore;
    if (currentQIndex + 1 >= mockQuestions.length) {
      endMockInterview(newScore);
    } else {
      setMockScore(newScore);
      setCurrentQIndex(currentQIndex + 1);
      setShowMockAnswer(false);
    }
  };

  if (loading) return <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%", flex: 1, padding: "50px" }}>Loading Interview Hub...</div>;
  if (!hubData) return <div style={{ padding: "50px" }}>Failed to load data.</div>;

  const tabs = [
    { id: "topics", label: "Topics", icon: <BookOpen size={18} /> },
    { id: "company", label: "Companies", icon: <Building size={18} /> },
    { id: "coding", label: "Coding", icon: <Code size={18} /> },
    { id: "hr", label: "HR Practice", icon: <Users size={18} /> },
    { id: "mock", label: "Mock Interview", icon: <MonitorPlay size={18} /> },
    { id: "resources", label: "Resources", icon: <Link2 size={18} /> }
  ];

  // Calculate Progress Stats
  const totalTopics = hubData.topics.length;
  const compTopics = progress?.completedTopics?.length || 0;
  const topicPerc = Math.round((compTopics / totalTopics) * 100);

  const totalCoding = hubData.coding.length;
  const compCoding = progress?.solvedCoding?.length || 0;
  const codingPerc = Math.round((compCoding / totalCoding) * 100);

  return (
    <div className="animate-fade-in" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Header & Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "20px" }}>
        <div className="glass-panel" style={{ padding: "20px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "5px" }}>Interview Hub</h2>
          <p style={{ color: "var(--text-secondary)" }}>Master your next interview</p>
        </div>
        
        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
          <Award size={40} color="var(--warning)" />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontWeight: 600 }}>Topics Progress</span>
              <span>{topicPerc}%</span>
            </div>
            <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${topicPerc}%`, background: "var(--primary)", transition: "width 0.3s" }}></div>
            </div>
          </div>
        </div>

        <div className="glass-panel" style={{ padding: "20px", display: "flex", alignItems: "center", gap: "20px" }}>
          <Code size={40} color="var(--primary)" />
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
              <span style={{ fontWeight: 600 }}>Coding Progress</span>
              <span>{codingPerc}%</span>
            </div>
            <div style={{ height: "8px", background: "var(--bg-input)", borderRadius: "4px", overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${codingPerc}%`, background: "var(--success)", transition: "width 0.3s" }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-panel" style={{ display: "flex", overflowX: "auto", padding: "5px", gap: "5px" }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: "flex", alignItems: "center", gap: "8px", padding: "10px 20px", borderRadius: "10px",
              background: activeTab === t.id ? "var(--primary)" : "transparent",
              color: activeTab === t.id ? "white" : "var(--text-secondary)",
              fontWeight: 600, border: "none", cursor: "pointer", whiteSpace: "nowrap"
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ padding: "30px", minHeight: "500px" }}>
        
        {/* TOPICS VIEW */}
        {activeTab === "topics" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {hubData.topics.map(t => {
              const isCompleted = progress?.completedTopics?.includes(t.id);
              return (
                <div key={t.id} style={{ background: "var(--bg-input)", borderRadius: "12px", overflow: "hidden", border: `1px solid ${isCompleted ? 'var(--success)' : 'var(--border-color)'}` }}>
                  <div style={{ padding: "15px 20px", background: isCompleted ? "var(--primary-glow)" : "rgba(0,0,0,0.02)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600 }}>{t.title}</h3>
                    <button onClick={() => toggleTopic(t.id)} style={{ background: "none", border: "none", color: isCompleted ? "var(--success)" : "var(--text-secondary)", cursor: "pointer" }}>
                      <CheckCircle2 size={22} />
                    </button>
                  </div>
                  <div style={{ padding: "20px" }}>
                    <p style={{ fontSize: "12px", color: "var(--primary)", fontWeight: 600, marginBottom: "15px" }}>💡 {t.tips}</p>
                    <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                      {t.questions.map((q, i) => {
                        const isMarked = progress?.bookmarkedQuestions?.includes(q.q);
                        return (
                          <div key={i}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "5px" }}>
                              <p style={{ fontSize: "14px", fontWeight: 600 }}>{q.q}</p>
                              <button onClick={() => toggleBookmark(q.q)} style={{ background: "none", border: "none", color: isMarked ? "var(--warning)" : "var(--text-secondary)", cursor: "pointer", flexShrink: 0 }}>
                                <Bookmark size={16} fill={isMarked ? "var(--warning)" : "none"} />
                              </button>
                            </div>
                            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{q.a}</p>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* COMPANY VIEW */}
        {activeTab === "company" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))", gap: "25px" }}>
            {hubData.companies.map(c => (
              <div key={c.id} style={{ background: "var(--bg-input)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "15px", marginBottom: "20px" }}>
                  <div style={{ width: "50px", height: "50px", background: "white", borderRadius: "10px", padding: "5px", display: "flex", alignItems: "center", justifyItems: "center" }}>
                    <img src={c.logo} alt={c.name} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
                  </div>
                  <h3 style={{ fontSize: "20px", fontWeight: 700 }}>{c.name}</h3>
                </div>
                
                {Object.entries(c.categories).map(([cat, questions]) => (
                  <div key={cat} style={{ marginBottom: "15px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: 600, color: "var(--primary)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.5px" }}>{cat} Questions</h4>
                    <ul style={{ paddingLeft: "20px", fontSize: "13px", color: "var(--text-secondary)", margin: 0 }}>
                      {questions.map((q, i) => <li key={i} style={{ marginBottom: "4px" }}>{q}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* CODING VIEW */}
        {activeTab === "coding" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {hubData.coding.map(c => {
              const isSolved = progress?.solvedCoding?.includes(c.id);
              return (
                <div key={c.id} style={{ background: "var(--bg-input)", borderRadius: "12px", padding: "20px", border: `1px solid ${isSolved ? 'var(--success)' : 'var(--border-color)'}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px" }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px" }}>
                        <h3 style={{ fontSize: "18px", fontWeight: 700 }}>{c.title}</h3>
                        <span style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "12px", fontWeight: 600, background: c.difficulty === "Easy" ? "rgba(16, 185, 129, 0.2)" : "rgba(245, 158, 11, 0.2)", color: c.difficulty === "Easy" ? "var(--success)" : "var(--warning)" }}>{c.difficulty}</span>
                      </div>
                      <p style={{ fontSize: "14px", color: "var(--text-primary)" }}>{c.description}</p>
                    </div>
                    <button onClick={() => toggleCoding(c.id)} className={isSolved ? "secondary-btn" : "premium-btn"} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "8px 12px" }}>
                      <CheckCircle2 size={16} /> {isSolved ? "Solved" : "Mark Solved"}
                    </button>
                  </div>
                  
                  <div style={{ background: "rgba(0,0,0,0.05)", padding: "12px", borderRadius: "8px", fontFamily: "monospace", fontSize: "13px", marginBottom: "10px" }}>
                    <p style={{ color: "var(--text-secondary)" }}><strong>Input:</strong> {c.input}</p>
                    <p style={{ color: "var(--text-secondary)" }}><strong>Output:</strong> {c.output}</p>
                  </div>
                  
                  <details style={{ fontSize: "13px" }}>
                    <summary style={{ cursor: "pointer", fontWeight: 600, color: "var(--primary)" }}>View Explanation & Approach</summary>
                    <div style={{ padding: "10px 0", color: "var(--text-secondary)" }}>
                      <p style={{ marginBottom: "5px" }}><strong>Explanation:</strong> {c.explanation}</p>
                      <p><strong>Solution Strategy:</strong> {c.solution}</p>
                    </div>
                  </details>
                </div>
              );
            })}
          </div>
        )}

        {/* HR VIEW */}
        {activeTab === "hr" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px" }}>
            {hubData.hr.sections.map((sec, i) => (
              <div key={i} style={{ background: "var(--bg-input)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border-color)" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "15px", color: "var(--primary)" }}>{sec.title}</h3>
                <ul style={{ paddingLeft: "20px", fontSize: "14px", color: "var(--text-secondary)", margin: 0 }}>
                  {sec.questions.map((q, j) => <li key={j} style={{ marginBottom: "8px" }}>{q}</li>)}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* MOCK INTERVIEW VIEW */}
        {activeTab === "mock" && (
          <div>
            {!mockActive ? (
              <div style={{ textAlign: "center", padding: "40px" }}>
                <MonitorPlay size={64} color="var(--primary)" style={{ margin: "0 auto 20px" }} />
                <h2 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "10px" }}>Simulate a Real Interview</h2>
                <p style={{ color: "var(--text-secondary)", maxWidth: "500px", margin: "0 auto 30px" }}>
                  Generate 5 random technical and conceptual questions from various topics. Test your knowledge under pressure and track your performance.
                </p>
                <button onClick={startMockInterview} className="premium-btn" style={{ fontSize: "16px", padding: "12px 30px" }}>Start Mock Interview</button>
                
                {/* Mock History */}
                {progress?.mockInterviews && progress.mockInterviews.length > 0 && (
                  <div style={{ marginTop: "50px", textAlign: "left" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "15px" }}>Previous Sessions</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {progress.mockInterviews.slice().reverse().map((m, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                          <span style={{ fontSize: "14px", color: "var(--text-secondary)" }}><Clock size={14} style={{ verticalAlign: "middle", marginRight: "5px" }} /> {new Date(m.date).toLocaleString()}</span>
                          <span style={{ fontSize: "16px", fontWeight: 700, color: (m.score / m.total) > 0.6 ? "var(--success)" : "var(--warning)" }}>Score: {m.score}/{m.total}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ maxWidth: "700px", margin: "0 auto" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "14px", fontWeight: 600 }}>
                  <span style={{ color: "var(--text-secondary)" }}>Question {currentQIndex + 1} of {mockQuestions.length}</span>
                  <span style={{ color: "var(--primary)" }}>Topic: {mockQuestions[currentQIndex].topic}</span>
                </div>
                
                <h2 style={{ fontSize: "28px", fontWeight: 700, marginBottom: "30px", lineHeight: "1.4" }}>
                  {mockQuestions[currentQIndex].q}
                </h2>

                {!showMockAnswer ? (
                  <button onClick={() => setShowMockAnswer(true)} className="secondary-btn" style={{ width: "100%", padding: "15px", fontSize: "16px" }}>Reveal Answer</button>
                ) : (
                  <div className="animate-slide-up" style={{ background: "var(--bg-input)", padding: "20px", borderRadius: "12px", border: "1px solid var(--border-color)", marginBottom: "30px" }}>
                    <p style={{ fontSize: "16px", color: "var(--text-primary)", lineHeight: "1.6" }}>{mockQuestions[currentQIndex].a}</p>
                  </div>
                )}

                {showMockAnswer && (
                  <div className="animate-fade-in" style={{ display: "flex", gap: "15px", marginTop: "20px" }}>
                    <button onClick={() => handleMockNext(false)} style={{ flex: 1, padding: "15px", borderRadius: "10px", background: "rgba(198, 106, 74, 0.1)", color: "var(--danger)", border: "1px solid var(--danger)", fontWeight: 600, cursor: "pointer" }}>
                      Did not know
                    </button>
                    <button onClick={() => handleMockNext(true)} style={{ flex: 1, padding: "15px", borderRadius: "10px", background: "rgba(16, 185, 129, 0.1)", color: "var(--success)", border: "1px solid var(--success)", fontWeight: 600, cursor: "pointer" }}>
                      Knew it
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* RESOURCES VIEW */}
        {activeTab === "resources" && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {hubData.resources.map((r, i) => (
              <div key={i} style={{ background: "var(--bg-input)", borderRadius: "12px", padding: "20px", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: 600, marginBottom: "5px" }}>{r.title}</h3>
                  <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>{r.desc}</p>
                </div>
                <span style={{ fontSize: "12px", fontWeight: 600, background: "var(--primary-glow)", color: "var(--primary)", padding: "5px 10px", borderRadius: "15px" }}>
                  {r.type}
                </span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}

export default InterviewPrepHub;
