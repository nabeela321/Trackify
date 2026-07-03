import { useState, useEffect, lazy, Suspense } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { 
  Briefcase, Mail, LogOut, Search, Plus, Trash2, 
  ExternalLink, AlertTriangle, Building, 
  CheckCircle2, Clock, XCircle, Inbox, MailOpen, Edit2,
  LayoutDashboard, Settings, User, Bell, Calendar, FileText, BrainCircuit, FileSearch
} from "lucide-react";
import toast from "react-hot-toast";

const ProfileModal = lazy(() => import("./ProfileModal"));
const SettingsModal = lazy(() => import("./SettingsModal"));
const NotificationsPanel = lazy(() => import("./NotificationsPanel"));
const InterviewHub = lazy(() => import("./InterviewHub"));
const InterviewPrepHub = lazy(() => import("./InterviewPrepHub"));
const AICoachHub = lazy(() => import("./AICoachHub"));
const AtsAnalyzer = lazy(() => import("./AtsAnalyzer"));

function JobApp({ setIsLoggedIn, theme, setTheme, deferredPrompt, onInstall }) {
  const [activeView, setActiveView] = useState("dashboard");
  const [jobs, setJobs] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [newReminder, setNewReminder] = useState("");
  const [reminderTab, setReminderTab] = useState("All");
  
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("Applied");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [isSyncing, setIsSyncing] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  // Modal States
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifsOpen, setIsNotifsOpen] = useState(false);
  const [activeJob, setActiveJob] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState(null);

  const token = localStorage.getItem("token");
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  const getJobsAndReminders = async () => {
    try {
      const [jobsRes, remindersRes] = await Promise.all([
        fetch(`${API_URL}/jobs`, { headers: { Authorization: token } }),
        fetch(`${API_URL}/reminders`, { headers: { Authorization: token } })
      ]);
      const jobsData = await jobsRes.json();
      const remindersData = await remindersRes.json();
      
      setJobs(Array.isArray(jobsData) ? jobsData : []);
      setReminders(Array.isArray(remindersData) ? remindersData : []);
      setIsLoading(false);
    } catch {
      toast.error("Failed to fetch data");
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getJobsAndReminders();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!company || !role) {
      toast.error("Company and Role are required");
      return;
    }

    try {
      await fetch(`${API_URL}/add-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token
        },
        body: JSON.stringify({ company, role, status })
      });

      setCompany("");
      setRole("");
      setStatus("Applied");
      toast.success("Job application added!");
      getJobs();
    } catch {
      toast.error("Failed to add job");
    }
  };

  const confirmDelete = async () => {
    if (!jobToDelete) return;
    const deletedId = jobToDelete;
    setDeletingJobId(deletedId);
    try {
      await fetch(`${API_URL}/delete-job/${deletedId}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
      setJobs(jobs.filter(j => j._id !== deletedId)); // UI Update after successful delete
      toast.success("Application deleted");
    } catch {
      toast.error("Failed to delete application");
    } finally {
      setDeletingJobId(null);
      setJobToDelete(null);
    }
  };

  const handleAddReminder = async (e) => {
    e.preventDefault();
    if (!newReminder) return;
    const optimisticReminder = {
      _id: Date.now().toString(),
      title: newReminder,
      reminderDate: new Date().toISOString(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    setReminders([optimisticReminder, ...reminders]);
    setNewReminder("");

    try {
      const res = await fetch(`${API_URL}/add-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ title: optimisticReminder.title, reminderDate: optimisticReminder.reminderDate })
      });
      if (!res.ok) throw new Error();
      getJobsAndReminders();
    } catch {
      toast.error("Unable to connect to the server.");
      getJobsAndReminders(); // Revert on failure
    }
  };

  const handleDeleteReminder = async (id) => {
    setReminders(reminders.filter(r => r._id !== id));
    try {
      const res = await fetch(`${API_URL}/reminder/${id}`, {
        method: "DELETE",
        headers: { Authorization: token }
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Unable to connect to the server.");
      getJobsAndReminders(); // Revert
    }
  };

  const handleCompleteReminder = async (id, currentStatus) => {
    setReminders(reminders.map(r => r._id === id ? { ...r, completed: !currentStatus } : r));
    try {
      const res = await fetch(`${API_URL}/reminder/${id}/complete`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ completed: !currentStatus })
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Unable to connect to the server.");
      getJobsAndReminders(); // Revert
    }
  };

  const handleEditReminder = async (id, currentTitle) => {
    const newTitle = prompt("Edit Reminder:", currentTitle);
    if (!newTitle || newTitle === currentTitle) return;
    
    setReminders(reminders.map(r => r._id === id ? { ...r, title: newTitle } : r));
    try {
      const res = await fetch(`${API_URL}/reminder/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ title: newTitle })
      });
      if (!res.ok) throw new Error();
    } catch {
      toast.error("Unable to connect to the server.");
      getJobsAndReminders(); // Revert
    }
  };

  // 🔗 CONNECT GMAIL
  const handleConnectGmail = useGoogleLogin({
    flow: "auth-code",
    scope: "https://www.googleapis.com/auth/gmail.readonly",
    onSuccess: async (codeResponse) => {
      try {
        const res = await fetch(`${API_URL}/auth/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          body: JSON.stringify({ code: codeResponse.code })
        });
        const data = await res.json();
        if (res.ok) toast.success(data.message);
        else toast.error(data.message);
      } catch {
        toast.error("Failed to connect Gmail via backend.");
      }
    },
    onError: (error) => toast.error("Gmail connection failed")
  });

  // 🔄 SYNC GMAIL
  const handleSyncGmail = async () => {
    setIsSyncing(true);
    const loadingToast = toast.loading("Syncing emails...");
    try {
      const res = await fetch(`${API_URL}/sync-gmail`, {
        method: "POST",
        headers: { Authorization: token }
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(data.message, { id: loadingToast });
        getJobsAndReminders(); 
      } else {
        toast.error(data.message, { id: loadingToast });
      }
    } catch {
      toast.error("Failed to sync Gmail.", { id: loadingToast });
    }
    setIsSyncing(false);
  };

  // 🎯 STATUS UI HELPERS
  const getStatusUI = (status) => {
    switch (status) {
      case "Applied": return { color: "var(--primary)", bg: "var(--primary-glow)", icon: <Clock size={14} /> };
      case "Interview": return { color: "var(--warning)", bg: "rgba(245, 158, 11, 0.2)", icon: <CheckCircle2 size={14} /> };
      case "Rejected": return { color: "var(--danger)", bg: "rgba(239, 68, 68, 0.2)", icon: <XCircle size={14} /> };
      case "Offer": return { color: "var(--success)", bg: "rgba(16, 185, 129, 0.2)", icon: <CheckCircle2 size={14} /> };
      default: return { color: "var(--text-secondary)", bg: "rgba(100, 100, 100, 0.2)", icon: <Building size={14} /> };
    }
  };

  const getTip = (job) => {
    if (job.status === "Rejected") return `Reflect & improve skills for ${job.role}`;
    if (job.status === "Interview") return `Prepare questions for ${job.company}`;
    if (job.status === "Offer") return `Evaluate offer and negotiate if needed`;
    return `Follow up with ${job.company} soon`;
  };

  const filteredJobs = jobs
    .filter(j => filter === "All" || j.status === filter)
    .filter(j => j.company.toLowerCase().includes(search.toLowerCase()) || j.role.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: jobs.length,
    applied: jobs.filter(j => j.status === "Applied").length,
    interview: jobs.filter(j => j.status === "Interview").length,
    rejected: jobs.filter(j => j.status === "Rejected").length,
  };

  const upcomingInterviews = jobs.filter(j => j.status === "Interview");

  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      
      {/* LEFT SIDEBAR */}
      <aside className="glass-panel" style={{ 
        width: "280px", 
        display: "flex", 
        flexDirection: "column", 
        padding: "25px",
        borderRadius: 0,
        borderTop: "none",
        borderBottom: "none",
        borderLeft: "none",
        zIndex: 10
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" }}>
          <div style={{ 
            background: "linear-gradient(135deg, var(--primary), #818cf8)", 
            width: "40px", height: "40px", borderRadius: "10px", 
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 10px var(--primary-glow)"
          }}>
            <Briefcase color="white" size={20} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: "700", letterSpacing: "-0.5px" }}>PAATHA</h1>
        </div>

        {/* Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
          <div className={`sidebar-link ${activeView === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveView('dashboard')} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", background: activeView === 'dashboard' ? "var(--primary-glow)" : "transparent", color: activeView === 'dashboard' ? "var(--primary)" : "var(--text-secondary)", fontWeight: activeView === 'dashboard' ? "600" : "500", cursor: "pointer", transition: "0.2s" }}>
            <LayoutDashboard size={20} /> Dashboard
          </div>
          <div className={`sidebar-link ${activeView === 'interviewHub' ? 'active' : ''}`} onClick={() => setActiveView('interviewHub')} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", background: activeView === 'interviewHub' ? "var(--primary-glow)" : "transparent", color: activeView === 'interviewHub' ? "var(--primary)" : "var(--text-secondary)", fontWeight: activeView === 'interviewHub' ? "600" : "500", cursor: "pointer", transition: "0.2s" }}>
            <Briefcase size={20} /> Interview Hub
          </div>
          <div className={`sidebar-link ${activeView === 'aiCoach' ? 'active' : ''}`} onClick={() => setActiveView('aiCoach')} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", background: activeView === 'aiCoach' ? "var(--primary-glow)" : "transparent", color: activeView === 'aiCoach' ? "var(--primary)" : "var(--text-secondary)", fontWeight: activeView === 'aiCoach' ? "600" : "500", cursor: "pointer", transition: "0.2s" }}>
            <BrainCircuit size={20} /> AI Coach
          </div>
          <div className={`sidebar-link ${activeView === 'atsAnalyzer' ? 'active' : ''}`} onClick={() => setActiveView('atsAnalyzer')} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", background: activeView === 'atsAnalyzer' ? "var(--primary-glow)" : "transparent", color: activeView === 'atsAnalyzer' ? "var(--primary)" : "var(--text-secondary)", fontWeight: activeView === 'atsAnalyzer' ? "600" : "500", cursor: "pointer", transition: "0.2s" }}>
            <FileSearch size={20} /> ATS Analyzer
          </div>
          <div className="sidebar-link" onClick={() => setIsNotifsOpen(true)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", color: "var(--text-secondary)", fontWeight: "500", cursor: "pointer", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <Bell size={20} /> Notifications
          </div>
          <div className="sidebar-link" onClick={() => setIsProfileOpen(true)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", color: "var(--text-secondary)", fontWeight: "500", cursor: "pointer", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <User size={20} /> Profile
          </div>
          <div className="sidebar-link" onClick={() => setIsSettingsOpen(true)} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", color: "var(--text-secondary)", fontWeight: "500", cursor: "pointer", transition: "0.2s" }} onMouseOver={(e) => e.currentTarget.style.color = "var(--text-primary)"} onMouseOut={(e) => e.currentTarget.style.color = "var(--text-secondary)"}>
            <Settings size={20} /> Settings
          </div>
          {deferredPrompt && (
            <div 
              className="sidebar-link" 
              style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 15px", borderRadius: "10px", background: "var(--warning)", color: "white", fontWeight: "600", cursor: "pointer", marginTop: "10px" }} 
              onClick={onInstall}
            >
              <LayoutDashboard size={20} /> Install App
            </div>
          )}
        </nav>

        {/* Bottom Actions */}
        <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingTop: "20px", borderTop: "1px solid var(--border-color)" }}>
          <button 
            className="secondary-btn"
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 15px" }}
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            <span style={{ fontWeight: 500 }}>Theme</span>
            <span style={{ fontSize: "16px" }}>{theme === 'dark' ? '☀️' : '🌙'}</span>
          </button>
          
          <button 
            className="danger-btn" 
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", padding: "12px 15px" }}
            onClick={() => {
              localStorage.removeItem("token");
              setIsLoggedIn(false);
              toast.success("Logged out");
            }}
          >
            <LogOut size={18} /> <span style={{ fontWeight: 600 }}>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      {activeView === "dashboard" && (
      <main className="animate-fade-in" style={{ flex: 1, overflowY: "auto", padding: "30px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          
          {/* HEADER / STATS */}
          <div style={{ marginBottom: "35px" }}>
            <h2 style={{ fontSize: "28px", fontWeight: "700", marginBottom: "20px", letterSpacing: "-0.5px" }}>Overview</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px" }}>
              
              <div className="glass-panel job-card" style={{ padding: "20px", borderLeft: "4px solid var(--primary)" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Total Applications</p>
                <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{stats.total}</h3>
              </div>
              
              <div className="glass-panel job-card" style={{ padding: "20px", borderLeft: "4px solid var(--primary-hover)" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Applied</p>
                <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{stats.applied}</h3>
              </div>

              <div className="glass-panel job-card" style={{ padding: "20px", borderLeft: "4px solid var(--warning)" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Interviews</p>
                <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{stats.interview}</h3>
              </div>

              <div className="glass-panel job-card" style={{ padding: "20px", borderLeft: "4px solid var(--danger)" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "14px", fontWeight: 500 }}>Rejected</p>
                <h3 style={{ fontSize: "36px", fontWeight: "700", marginTop: "5px" }}>{stats.rejected}</h3>
              </div>

            </div>
          </div>

          {/* INTEGRATION & ADD JOB ROW */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginBottom: "35px" }}>
            
            {/* Smart Integrations */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                  <Mail size={22} color="var(--primary)" />
                  <h3 style={{ fontSize: "18px", fontWeight: "600" }}>Smart Integrations</h3>
                </div>
                <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginBottom: "20px", lineHeight: "1.6" }}>
                  Securely connect Gmail to let PAATHA automatically track your job applications, interview invitations, and offers.
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button className="secondary-btn" onClick={handleConnectGmail} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <ExternalLink size={16} /> Connect Gmail
                </button>
                <button className="premium-btn" onClick={handleSyncGmail} disabled={isSyncing}>
                  {isSyncing ? "⏳ Syncing..." : "🔄 Sync Emails"}
                </button>
              </div>
            </div>

            {/* Add Job Form */}
            <div className="glass-panel" style={{ padding: "25px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px" }}>Add Application</h3>
              <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                
                <div className="premium-input-group" style={{ gridColumn: "1 / -1" }}>
                  <Building size={16} color="var(--text-secondary)" />
                  <input className="premium-input" placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
                </div>

                <div className="premium-input-group">
                  <Briefcase size={16} color="var(--text-secondary)" />
                  <input className="premium-input" placeholder="Role" value={role} onChange={(e) => setRole(e.target.value)} />
                </div>

                <div className="premium-input-group">
                  <select className="premium-input" value={status} onChange={(e) => setStatus(e.target.value)} style={{ paddingLeft: 0 }}>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <button className="premium-btn" style={{ gridColumn: "1 / -1", justifyContent: "center" }}>
                  <Plus size={18} /> Add Job
                </button>
              </form>
            </div>

          </div>

          {/* UPCOMING INTERVIEWS & REMINDERS WIDGETS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))", gap: "20px", marginBottom: "35px" }}>
            
            {/* Upcoming Interviews & Assessments */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "15px", display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={18} color="var(--primary)" /> Upcoming Interviews & Assessments
              </h3>
              
              {upcomingInterviews.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                  No upcoming interviews currently.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "250px", overflowY: "auto" }}>
                  {upcomingInterviews.map(job => (
                    <div key={job._id} style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{job.company}</p>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{job.role}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span style={{ fontSize: "12px", background: job.isAssessment ? "var(--warning)" : "var(--primary-glow)", color: job.isAssessment ? "white" : "var(--primary)", padding: "4px 8px", borderRadius: "12px", fontWeight: "600" }}>
                          {job.isAssessment ? "Assessment" : "Interview"}
                        </span>
                        {job.interviewDate && <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>{job.interviewDate}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Smart Reminders */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Bell size={18} color="var(--primary)" /> Smart Reminders
                </h3>
                <select className="premium-input" style={{ width: "auto", padding: "5px 10px", fontSize: "12px" }} value={reminderTab} onChange={(e) => setReminderTab(e.target.value)}>
                  <option value="All">All</option>
                  <option value="Today">Today</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, maxHeight: "250px", overflowY: "auto", marginBottom: "15px" }}>
                {reminders.filter(rem => {
                  if (reminderTab === "All") return true;
                  if (reminderTab === "Completed") return rem.completed;
                  if (rem.completed) return false;
                  const date = new Date(rem.reminderDate || rem.date || rem.createdAt);
                  const now = new Date();
                  const diff = date - now;
                  const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  if (reminderTab === "Overdue") return diff < 0 && !isToday;
                  if (reminderTab === "Today") return isToday;
                  if (reminderTab === "Upcoming") return diff > 0 && !isToday;
                  return true;
                })
                .sort((a, b) => new Date(a.reminderDate || a.date || a.createdAt) - new Date(b.reminderDate || b.date || b.createdAt))
                .map(rem => {
                  let timeText = "";
                  if (!rem.completed) {
                    const date = new Date(rem.reminderDate || rem.date || rem.createdAt);
                    const diffMs = date - new Date();
                    if (diffMs < 0) timeText = "Expired";
                    else {
                      const diffHours = diffMs / (1000 * 60 * 60);
                      const diffDays = diffMs / (1000 * 60 * 60 * 24);
                      if (diffDays < 1 && new Date().getDate() !== date.getDate()) timeText = "Tomorrow";
                      else if (diffHours < 24) timeText = `${Math.ceil(diffHours)} hours left`;
                      else timeText = `${Math.ceil(diffDays)} days left`;
                    }
                  }

                  return (
                    <div key={rem._id} style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", opacity: rem.completed ? 0.6 : 1, borderLeft: rem.completed ? "3px solid transparent" : timeText === "Expired" ? "3px solid var(--danger)" : "3px solid var(--primary)" }}>
                      <div>
                        <p style={{ fontSize: "14px", color: "var(--text-primary)", textDecoration: rem.completed ? "line-through" : "none", fontWeight: 500 }}>{rem.title || rem.text}</p>
                        {!rem.completed && <p style={{ fontSize: "11px", color: timeText === "Expired" ? "var(--danger)" : "var(--text-secondary)", marginTop: "2px", fontWeight: 600 }}>{timeText}</p>}
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => handleEditReminder(rem._id, rem.title || rem.text)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer" }}>
                          <Edit2 size={16} />
                        </button>
                        <button onClick={() => handleCompleteReminder(rem._id, rem.completed)} style={{ background: "none", border: "none", color: rem.completed ? "var(--primary)" : "var(--text-secondary)", cursor: "pointer" }}>
                          <CheckCircle2 size={16} />
                        </button>
                        <button onClick={() => handleDeleteReminder(rem._id)} style={{ background: "none", border: "none", color: "var(--danger)", cursor: "pointer" }}>
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                
                {reminders.length === 0 && (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                    No reminders yet.
                  </div>
                )}
              </div>

              <form onSubmit={handleAddReminder} style={{ display: "flex", gap: "10px" }}>
                <input 
                  className="premium-input" 
                  style={{ background: "var(--bg-input)", flex: 1, borderRadius: "10px" }} 
                  placeholder="Add a follow-up reminder..." 
                  value={newReminder}
                  onChange={(e) => setNewReminder(e.target.value)}
                />
                <button type="submit" className="premium-btn" style={{ padding: "10px 15px", borderRadius: "10px" }}>
                  <Plus size={16} />
                </button>
              </form>
            </div>

            {/* Upcoming Deadlines Widget */}
            <div className="glass-panel" style={{ padding: "25px", display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Calendar size={18} color="var(--primary)" /> Upcoming Deadlines
                </h3>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", flex: 1, maxHeight: "250px", overflowY: "auto" }}>
                {reminders.filter(r => r.deadlineType && !r.completed).length === 0 ? (
                  <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)", fontSize: "14px" }}>
                    No pending deadlines found.
                  </div>
                ) : (
                  reminders.filter(r => r.deadlineType && !r.completed)
                    .sort((a, b) => new Date(a.deadline || a.reminderDate) - new Date(b.deadline || b.reminderDate))
                    .map(rem => {
                      const date = new Date(rem.deadline || rem.reminderDate);
                      const now = new Date();
                      const diffMs = date - now;
                      
                      let timeText = "";
                      let timeColor = "var(--text-secondary)";
                      let borderColor = "transparent";

                      if (diffMs < 0) {
                        timeText = "Expired";
                        timeColor = "var(--danger)";
                        borderColor = "var(--danger)";
                      } else {
                        const diffHours = diffMs / (1000 * 60 * 60);
                        const diffDays = diffMs / (1000 * 60 * 60 * 24);
                        const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();

                        if (isToday) {
                          timeText = "Today";
                          timeColor = "var(--warning)";
                          borderColor = "var(--warning)";
                        } else if (diffDays < 1) {
                          timeText = "Tomorrow";
                          timeColor = "var(--warning)";
                          borderColor = "var(--warning)";
                        } else if (diffDays <= 7) {
                          timeText = `${Math.ceil(diffDays)} Days Left (This Week)`;
                          timeColor = "var(--primary)";
                          borderColor = "var(--primary)";
                        } else {
                          timeText = `${Math.ceil(diffDays)} Days Left`;
                          borderColor = "var(--border-color)";
                        }
                      }

                      return (
                        <div key={rem._id} style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "10px", display: "flex", justifyContent: "space-between", alignItems: "center", borderLeft: `3px solid ${borderColor}` }}>
                          <div>
                            <p style={{ fontWeight: 600, color: "var(--text-primary)", fontSize: "14px" }}>{rem.company || rem.title}</p>
                            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{rem.deadlineType}</p>
                            {rem.status && <p style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>Status: {rem.status}</p>}
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <p style={{ fontSize: "12px", color: timeColor, fontWeight: "600" }}>{timeText}</p>
                            <p style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                              {date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                              {date.getHours() !== 10 && date.getHours() !== 12 ? ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : ''}
                            </p>
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            </div>

          </div>

          {/* SEARCH & FILTERS */}
          <div style={{ display: "flex", gap: "15px", marginBottom: "25px", flexWrap: "wrap", alignItems: "center" }}>
            <h3 style={{ fontSize: "20px", fontWeight: "600", marginRight: "10px" }}>Pipeline</h3>
            
            <div className="premium-input-group" style={{ flex: 1, minWidth: "250px" }}>
              <Search size={18} color="var(--text-secondary)" />
              <input 
                className="premium-input" 
                placeholder="Search companies or roles..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="premium-input-group" style={{ minWidth: "150px" }}>
              <select className="premium-input" value={filter} onChange={(e) => setFilter(e.target.value)} style={{ paddingLeft: 0 }}>
                <option value="All">All Statuses</option>
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* JOB CARDS GRID */}
          {filteredJobs.length === 0 ? (
            <div className="flex-center glass-panel" style={{ padding: "80px 20px", flexDirection: "column", color: "var(--text-secondary)" }}>
              <Inbox size={48} strokeWidth={1.5} style={{ marginBottom: "15px", opacity: 0.5 }} />
              <p style={{ fontSize: "16px", fontWeight: "500" }}>No applications found.</p>
              <p style={{ fontSize: "14px", marginTop: "5px" }}>Sync your Gmail or add one manually above.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "20px", paddingBottom: "60px" }}>
              {filteredJobs.map(job => {
                const statusUI = getStatusUI(job.status);
                
                return (
                  <div key={job._id} className="glass-panel job-card" style={{ padding: "24px", display: "flex", flexDirection: "column" }}>
                    
                    {/* Card Header */}
                    <div className="flex-between" style={{ marginBottom: "12px" }}>
                      <h3 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
                        {job.company}
                      </h3>
                      <span className="badge" style={{ background: statusUI.bg, color: statusUI.color }}>
                        {statusUI.icon} <span style={{ marginLeft: "6px" }}>{job.status}</span>
                      </span>
                    </div>

                    {/* Role */}
                    <p style={{ fontSize: "16px", fontWeight: "500", color: "var(--text-primary)", marginBottom: "15px" }}>
                      {job.role}
                    </p>

                    {/* Metadata */}
                    <div style={{ background: "rgba(0,0,0,0.03)", padding: "12px", borderRadius: "10px", marginBottom: "15px", flex: 1 }}>
                      <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: "8px 12px", fontSize: "13px" }}>
                        
                        <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Source:</span>
                        <span style={{ color: "var(--text-primary)" }}>{job.source || "Manual"}</span>
                        
                        {job.date && (
                          <>
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Date:</span>
                            <span style={{ color: "var(--text-primary)" }}>{job.date.substring(0, 16)}</span>
                          </>
                        )}
                        
                        {job.subject && (
                          <>
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Subject:</span>
                            <span style={{ color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {job.subject}
                            </span>
                          </>
                        )}
                        
                        {job.sender && (
                          <>
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Sender:</span>
                            <span style={{ color: "var(--text-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {job.sender}
                            </span>
                          </>
                        )}

                        {job.isAssessment && (
                          <>
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Assessment:</span>
                            <span style={{ color: "var(--warning)", fontWeight: 600 }}>Detected</span>
                          </>
                        )}
                        
                        {job.interviewDate && (
                          <>
                            <span style={{ color: "var(--text-secondary)", fontWeight: 500 }}>Date Found:</span>
                            <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{job.interviewDate}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* AI Tip */}
                    <div style={{ background: "var(--primary-glow)", padding: "10px 12px", borderRadius: "10px", display: "flex", gap: "8px", alignItems: "flex-start", marginBottom: "20px" }}>
                      <span style={{ fontSize: "16px" }}>💡</span>
                      <p style={{ fontSize: "13px", color: "var(--primary)", fontWeight: "500", lineHeight: 1.4 }}>
                        {getTip(job)}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: "flex", gap: "10px", marginTop: "auto", flexWrap: "wrap" }}>
                      {job.status === "Interview" && (
                        <button 
                          className="premium-btn" 
                          style={{ flex: 1, padding: "8px", fontSize: "14px", justifyContent: "center", minWidth: "45%" }}
                          onClick={() => setActiveJob(job)}
                        >
                          <Briefcase size={16} /> Open Hub
                        </button>
                      )}
                      {job.messageId && (
                        <button 
                          className="secondary-btn" 
                          style={{ flex: 1, padding: "8px", fontSize: "14px", justifyContent: "center", minWidth: "45%" }}
                          onClick={() => window.open(`https://mail.google.com/mail/u/0/#all/${job.messageId}`, '_blank')}
                        >
                          <MailOpen size={16} /> Open Email
                        </button>
                      )}
                      <button 
                        className="danger-btn" 
                        style={{ flex: "0 0 auto", padding: "8px 14px", display: "flex", justifyContent: "center" }}
                        onClick={() => setJobToDelete(job._id)}
                        title="Delete Application"
                        disabled={deletingJobId === job._id}
                      >
                        {deletingJobId === job._id ? "Deleting..." : <Trash2 size={16} />}
                      </button>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
      )}

      {activeView === "interviewHub" && (
      <main className="animate-fade-in" style={{ flex: 1, overflowY: "auto", padding: "30px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <InterviewPrepHub token={token} theme={theme} />
        </div>
      </main>
      )}

      {activeView === "aiCoach" && (
      <main className="animate-fade-in" style={{ flex: 1, overflowY: "auto", padding: "30px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <AICoachHub token={token} theme={theme} />
        </div>
      </main>
      )}

      {activeView === "atsAnalyzer" && (
      <main className="animate-fade-in" style={{ flex: 1, overflowY: "auto", padding: "30px 40px" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto", width: "100%" }}>
          <AtsAnalyzer token={token} theme={theme} />
        </div>
      </main>
      )}

      {/* Delete Confirmation Modal */}
      {jobToDelete && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
        }}>
          <div className="glass-panel animate-scale-in" style={{ padding: "30px", width: "90%", maxWidth: "400px", textAlign: "center" }}>
            <AlertTriangle size={48} color="var(--danger)" style={{ margin: "0 auto 15px" }} />
            <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px" }}>Delete Application?</h3>
            <p style={{ color: "var(--text-secondary)", marginBottom: "25px" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: "15px", justifyContent: "center" }}>
              <button className="secondary-btn" onClick={() => setJobToDelete(null)} style={{ flex: 1, justifyContent: "center" }} disabled={!!deletingJobId}>Cancel</button>
              <button className="danger-btn" onClick={confirmDelete} style={{ flex: 1, justifyContent: "center" }} disabled={!!deletingJobId}>
                {deletingJobId ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lazy Loaded Modals */}
      <Suspense fallback={null}>
        {isProfileOpen && <ProfileModal token={token} jobs={jobs} onClose={() => setIsProfileOpen(false)} />}
        {isSettingsOpen && <SettingsModal theme={theme} setTheme={setTheme} onClose={() => setIsSettingsOpen(false)} />}
        {isNotifsOpen && <NotificationsPanel token={token} onClose={() => setIsNotifsOpen(false)} />}
        {activeJob && <InterviewHub job={activeJob} token={token} onClose={() => setActiveJob(null)} onJobUpdated={(updated) => setJobs(jobs.map(j => j._id === updated._id ? updated : j))} />}
      </Suspense>

    </div>
  );
}

export default JobApp;