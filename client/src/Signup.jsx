import { useState } from "react";

function Signup({ setIsLoginPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      alert(data.message);
      setIsLoginPage(true);
    } catch {
      alert("Server not running ❌");
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h2>Create Account 🚀</h2>

        <form onSubmit={handleSignup} style={styles.form}>
          <input style={styles.input} placeholder="Name" onChange={(e) => setName(e.target.value)} />
          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.button}>Signup</button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  bg: {
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "linear-gradient(135deg, #1e293b, #0f172a)"
  },
  card: {
    backdropFilter: "blur(15px)",
    background: "rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "15px",
    color: "white",
    width: "300px",
    textAlign: "center"
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: { padding: "10px", borderRadius: "8px", border: "none" },
  button: {
    padding: "10px",
    borderRadius: "8px",
    background: "#10b981",
    color: "white",
    border: "none"
  }
};

export default Signup;