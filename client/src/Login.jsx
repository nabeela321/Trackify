import { useState } from "react";

function Login({ setIsLoggedIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("https://trackify-a46w.onrender.com/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
      } else {
        alert(data.message);
      }
    } catch {
      alert("Server not running ❌");
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <h2>Welcome Back 👋</h2>

        <form onSubmit={handleLogin} style={styles.form}>
          <input style={styles.input} placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
          <input style={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
          <button style={styles.button}>Login</button>
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
    background: "linear-gradient(135deg, #0f172a, #1e293b)"
  },
  card: {
    backdropFilter: "blur(15px)",
    background: "rgba(255,255,255,0.1)",
    padding: "30px",
    borderRadius: "15px",
    color: "white",
    width: "300px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  },
  form: { display: "flex", flexDirection: "column", gap: "10px" },
  input: {
    padding: "10px",
    borderRadius: "8px",
    border: "none"
  },
  button: {
    padding: "10px",
    borderRadius: "8px",
    background: "#3b82f6",
    color: "white",
    border: "none",
    cursor: "pointer",
    transition: "0.3s"
  }
};

export default Login;