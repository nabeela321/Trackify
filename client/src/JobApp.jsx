import { useState, useEffect } from "react";

const BASE_URL = "https://trackify-mm00.onrender.com";

function JobApp({ onLogout }) {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [editId, setEditId] = useState(null);

  const token = localStorage.getItem("token");

  // 🔹 Fetch jobs
  const getJobs = async () => {
    try {
      const res = await fetch(`${BASE_URL}/jobs`, {
        headers: { Authorization: token }
      });

      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    getJobs();
  }, []);

  // 🔹 Add / Update job
  const handleSubmit = async (e) => {
    e.preventDefault();

    const url = editId
      ? `${BASE_URL}/update-job/${editId}`
      : `${BASE_URL}/add-job`;

    const method = editId ? "PUT" : "POST";

    await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: token
      },
      body: JSON.stringify({ company, role, status, reason })
    });

    setCompany("");
    setRole("");
    setStatus("");
    setReason("");
    setEditId(null);

    getJobs();
  };

  // 🔹 Delete job
  const deleteJob = async (id) => {
    await fetch(`${BASE_URL}/delete-job/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });

    getJobs();
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.logo}>Trackify</h1>
        <button style={styles.logout} onClick={onLogout}>
          Logout
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          style={styles.input}
        />

        <input
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          style={styles.input}
        />

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          style={styles.input}
        >
          <option value="">Status</option>
          <option>Applied</option>
          <option>Interview</option>
          <option>Rejected</option>
        </select>

        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          style={styles.input}
        >
          <option value="">Reason</option>
          <option value="lack of skills">Lack of Skills</option>
          <option value="communication">Communication</option>
          <option value="technical">Technical</option>
        </select>

        <button style={styles.button}>
          {editId ? "Update Job" : "Add Job"}
        </button>
      </form>

      {/* Job List */}
      <div style={styles.list}>
        {jobs.length === 0 ? (
          <p>No jobs found</p>
        ) : (
          jobs.map((job) => (
            <div key={job._id} style={styles.card}>
              <h3>{job.company}</h3>
              <p>{job.role}</p>
              <p>Status: {job.status}</p>
              <p>Reason: {job.reason}</p>
              <p style={{ color: "green" }}>{job.suggestion}</p>

              <button
                style={styles.edit}
                onClick={() => {
                  setCompany(job.company);
                  setRole(job.role);
                  setStatus(job.status);
                  setReason(job.reason);
                  setEditId(job._id);
                }}
              >
                Edit
              </button>

              <button
                style={styles.delete}
                onClick={() => deleteJob(job._id)}
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// 🔹 Styles (simple clean UI)
const styles = {
  container: {
    padding: "20px",
    background: "#f5f5f5",
    minHeight: "100vh"
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  logo: {
    fontSize: "24px",
    fontWeight: "bold"
  },
  logout: {
    background: "red",
    color: "white",
    border: "none",
    padding: "8px",
    borderRadius: "5px"
  },
  form: {
    marginTop: "20px",
    display: "flex",
    gap: "10px",
    flexWrap: "wrap"
  },
  input: {
    padding: "8px"
  },
  button: {
    padding: "8px",
    background: "blue",
    color: "white",
    border: "none"
  },
  list: {
    marginTop: "20px"
  },
  card: {
    background: "white",
    padding: "10px",
    margin: "10px 0",
    borderRadius: "8px"
  },
  edit: {
    background: "orange",
    marginRight: "5px",
    border: "none",
    padding: "5px"
  },
  delete: {
    background: "red",
    color: "white",
    border: "none",
    padding: "5px"
  }
};

export default JobApp;