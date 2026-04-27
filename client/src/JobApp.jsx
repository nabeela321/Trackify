import { useState, useEffect } from "react";

function JobApp({ setIsLoggedIn }) {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const token = localStorage.getItem("token");

  const getJobs = async () => {
    const res = await fetch("https://trackify-a46w.onrender.com/jobs", {
      headers: { Authorization: token }
    });
    const data = await res.json();
    setJobs(Array.isArray(data) ? data : []);
  };

  useEffect(() => {
    getJobs();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await fetch("https://trackify-a46w.onrender.com/add-job", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ company, role, status })
    });

    setCompany("");
    setRole("");
    setStatus("");
    getJobs();
  };

  const deleteJob = async (id) => {
    await fetch(`https://trackify-a46w.onrender.com/delete-job/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });
    getJobs();
  };

  // 🎯 STATUS COLOR
  const getStatusColor = (status) => {
    if (status === "Applied") return "#38bdf8";
    if (status === "Interview") return "#facc15";
    if (status === "Rejected") return "#f87171";
    return "#94a3b8";
  };

  // 🤖 SMART SUGGESTION (FREE AI)
  const getTip = (job) => {
    if (job.status === "Rejected") {
      return `Improve ${job.role} skills & build projects`;
    }
    if (job.status === "Interview") {
      return `Practice interview questions for ${job.role}`;
    }
    return "Follow up after a few days";
  };

  // 🔍 FILTER LOGIC
  const filteredJobs = jobs
    .filter(j => filter === "All" || j.status === filter)
    .filter(j =>
      j.company.toLowerCase().includes(search.toLowerCase())
    );

  // 📊 STATS
  const total = jobs.length;
  const applied = jobs.filter(j => j.status === "Applied").length;
  const interview = jobs.filter(j => j.status === "Interview").length;
  const rejected = jobs.filter(j => j.status === "Rejected").length;

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>


        {/* HEADER */}
        <div style={styles.header}>
          <h1 style={styles.title}>💼 Trackify</h1>
          

          <button style={styles.logout} onClick={() => {
            localStorage.removeItem("token");
            setIsLoggedIn(false);
          }}>
            Logout
          </button>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <div style={styles.statCard}>Total: {total}</div>
          <div style={styles.statCard}>Applied: {applied}</div>
          <div style={styles.statCard}>Interview: {interview}</div>
          <div style={styles.statCard}>Rejected: {rejected}</div>
        </div>

        {/* SEARCH + FILTER */}
        <div style={styles.searchRow}>
          <input
            style={styles.input}
            placeholder="Search company..."
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            style={styles.input}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option>All</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Rejected</option>
          </select>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            placeholder="Company"
            onChange={(e) => setCompany(e.target.value)}
          />

          <input
            style={styles.input}
            placeholder="Role"
            onChange={(e) => setRole(e.target.value)}
          />

          <select
            style={styles.input}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option>Status</option>
            <option>Applied</option>
            <option>Interview</option>
            <option>Rejected</option>
          </select>

          <button style={styles.addBtn}>+ Add</button>
        </form>

        {/* JOB LIST */}
        <div style={styles.grid}>
          {filteredJobs.map(job => (
            <div key={job._id} style={styles.card}>

              <div style={styles.top}>
                <h3 style={styles.company}>{job.company}</h3>

                <span style={{
                  ...styles.badge,
                  background: getStatusColor(job.status)
                }}>
                  {job.status}
                </span>
              </div>

              <p style={styles.role}>{job.role}</p>

              {/* 🤖 AI TIP */}
              <p style={styles.tip}>
                🤖 {getTip(job)}
              </p>

              <button
                style={styles.deleteBtn}
                onClick={() => deleteJob(job._id)}
              >
                Delete
              </button>

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* 🎨 PREMIUM STYLES */
const styles = {
  wrapper: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px"
  },

  container: {
    width: "100%",
    maxWidth: "950px",
    padding: "25px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(20px)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    alignItems: "center",
    color: "white"
  },

  title: {
    fontSize: "26px",
    fontWeight: "600"
  },

  logout: {
    background: "#ef4444",
    color: "white",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px"
  },

  stats: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },

  statCard: {
    background: "rgba(255,255,255,0.2)",
    padding: "10px 15px",
    borderRadius: "10px",
    color: "white",
    fontSize: "14px"
  },

  searchRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "20px",
    flexWrap: "wrap"
  },

  form: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
    marginBottom: "25px"
  },

  input: {
    flex: "1",
    minWidth: "140px",
    padding: "10px",
    borderRadius: "8px",
    background: "rgba(255,255,255,0.2)",
    color: "white",
    border: "none"
  },

  addBtn: {
    background: "#3b82f6",
    color: "white",
    border: "none",
    padding: "10px 15px",
    borderRadius: "8px"
  },

  grid: {
    display: "grid",
    gap: "15px"
  },

  card: {
    padding: "15px",
    borderRadius: "14px",
    background: "rgba(255,255,255,0.1)",
    backdropFilter: "blur(10px)",
    color: "white"
  },

  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },

  company: {
    fontSize: "18px",
    fontWeight: "600"
  },

  role: {
    opacity: 0.8,
    marginTop: "5px"
  },

  badge: {
    padding: "5px 10px",
    borderRadius: "8px",
    fontSize: "12px",
    color: "black",
    fontWeight: "500"
  },

  tip: {
    fontSize: "12px",
    opacity: 0.8,
    marginTop: "6px"
  },

  deleteBtn: {
    marginTop: "10px",
    background: "#f87171",
    border: "none",
    padding: "6px",
    borderRadius: "6px",
    color: "white"
  },
  
};

export default JobApp;