import { useState, useEffect } from "react";
import { API } from "./api";

function JobApp({ setIsLoggedIn }) {
  const [jobs, setJobs] = useState([]);
  const [company, setCompany] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");

  const token = localStorage.getItem("token");

  const getJobs = async () => {
    const res = await fetch(`${API}/jobs`, {
      headers: { Authorization: token }
    });

    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => {
    getJobs();
  }, []);

  const addJob = async (e) => {
    e.preventDefault();

    await fetch(`${API}/add-job`, {
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
    await fetch(`${API}/delete-job/${id}`, {
      method: "DELETE",
      headers: { Authorization: token }
    });

    getJobs();
  };

  return (
    <div>
      <button onClick={() => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
      }}>
        Logout
      </button>

      <form onSubmit={addJob}>
        <input placeholder="Company" onChange={(e) => setCompany(e.target.value)} />
        <input placeholder="Role" onChange={(e) => setRole(e.target.value)} />

        <select onChange={(e) => setStatus(e.target.value)}>
          <option>Applied</option>
          <option>Interview</option>
          <option>Rejected</option>
        </select>

        <button>Add</button>
      </form>

      {jobs.map(job => (
        <div key={job._id}>
          <h3>{job.company}</h3>
          <p>{job.role}</p>
          <p>{job.status}</p>

          <button onClick={() => deleteJob(job._id)}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

export default JobApp;