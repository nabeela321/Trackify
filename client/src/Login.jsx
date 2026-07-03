import { useState } from "react";
import { Mail, Lock, LogIn, Briefcase, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

function Login({ setIsLoggedIn, setPage }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        toast.success("Welcome back!");
        setIsLoggedIn(true);
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch {
      toast.error("Server not running ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ height: "100vh" }}>
      <div className="glass-panel" style={{ width: "90%", maxWidth: "400px", padding: "40px 30px", textAlign: "center" }}>
        
        {/* Premium Logo Placeholder */}
        <div className="flex-center" style={{ marginBottom: "20px" }}>
          <div style={{ 
            background: "linear-gradient(135deg, var(--primary), #818cf8)", 
            width: "56px", 
            height: "56px", 
            borderRadius: "16px", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            boxShadow: "0 8px 20px var(--primary-glow)" 
          }}>
            <Briefcase color="white" size={28} strokeWidth={2.5} />
          </div>
        </div>

        <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "5px", letterSpacing: "-0.5px" }}>PAATHA</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "35px" }}>Stay on Track. Get Hired.</p>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          <div className="premium-input-group">
            <Mail size={18} color="var(--text-secondary)" />
            <input 
              className="premium-input" 
              placeholder="Email address" 
              type="email"
              required
              onChange={(e) => setEmail(e.target.value)} 
            />
          </div>

          <div className="premium-input-group">
            <Lock size={18} color="var(--text-secondary)" />
            <input 
              className="premium-input" 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              required
              onChange={(e) => setPassword(e.target.value)} 
            />
            <div 
              onClick={() => setShowPassword(!showPassword)} 
              style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              {showPassword ? <EyeOff size={18} color="var(--text-secondary)" /> : <Eye size={18} color="var(--text-secondary)" />}
            </div>
          </div>

          <button className="premium-btn" disabled={isLoading} style={{ marginTop: "10px", padding: "12px", width: "100%", justifyContent: "center" }}>
            {isLoading ? "Signing in..." : (
              <>
                <LogIn size={18} />
                Sign In
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "30px", fontSize: "14px", color: "var(--text-secondary)" }}>
          New here?{" "}
          <span 
            onClick={() => setPage("signup")}
            style={{ color: "var(--primary)", cursor: "pointer", fontWeight: "600", transition: "0.2s" }}
            onMouseOver={(e) => e.target.style.color = "var(--primary-hover)"}
            onMouseOut={(e) => e.target.style.color = "var(--primary)"}
          >
            Create an account
          </span>
        </div>

      </div>
    </div>
  );
}

export default Login;