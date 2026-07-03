import { useEffect, useState } from "react";

function GoogleCallback() {
  const [status, setStatus] = useState("Connecting to Gmail...");

  useEffect(() => {
    const connectGmail = async () => {
      // 1. Extract the 'code' from the URL query string sent by Google
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");

      if (!code) {
        setStatus("No authorization code found in URL.");
        return;
      }

      try {
        // 2. Send the code to our backend to exchange for tokens
        const token = localStorage.getItem("token");
        
        // Note: Using localhost for testing this new feature. 
        // In the future, this should be an environment variable.
        const res = await fetch("http://localhost:5000/auth/google/callback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": token
          },
          body: JSON.stringify({ code })
        });

        const data = await res.json();
        
        if (res.ok) {
          setStatus("Gmail connected successfully! Redirecting...");
          setTimeout(() => {
            // 3. Redirect back to the main app dashboard
            window.location.href = "/";
          }, 2000);
        } else {
          setStatus(data.message || "Failed to connect Gmail.");
        }
      } catch (error) {
        setStatus("Server error. Could not connect to Gmail.");
      }
    };

    connectGmail();
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2>{status}</h2>
      </div>
    </div>
  );
}

const styles = {
  container: {
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
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
  }
};

export default GoogleCallback;
