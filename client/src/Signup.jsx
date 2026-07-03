import { useState } from "react";
import { User, Mail, Lock, Eye, EyeOff, UserPlus, Briefcase, LockKeyhole } from "lucide-react";
import toast from "react-hot-toast";

function Signup({ setPage }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password })
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message || "Account created! You can now log in.");
        setPage("login");
      } else {
        toast.error(data.message || "Signup failed");
      }
    } catch {
      toast.error("Server not running ❌");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-center animate-fade-in" style={{ height: "100vh", padding: "20px" }}>
      <div className="glass-panel" style={{ width: "100%", maxWidth: "420px", padding: "40px 30px", textAlign: "center" }}>
        
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

        <h1 style={{ fontSize: "26px", fontWeight: "700", marginBottom: "5px", letterSpacing: "-0.5px" }}>Create Account</h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "15px", marginBottom: "30px" }}>Join PAATHA and land your next role.</p>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          
          <div className="premium-input-group">
            <User size={18} color="var(--text-secondary)" />
            <input 
              className="premium-input" 
              placeholder="Full Name" 
              type="text"
              required
              onChange={(e) => setName(e.target.value)} 
            />
          </div>

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

          <div className="premium-input-group">
            <LockKeyhole size={18} color="var(--text-secondary)" />
            <input 
              className="premium-input" 
              type={showConfirmPassword ? "text" : "password"} 
              placeholder="Confirm Password" 
              required
              onChange={(e) => setConfirmPassword(e.target.value)} 
            />
            <div 
              onClick={() => setShowConfirmPassword(!showConfirmPassword)} 
              style={{ cursor: "pointer", display: "flex", alignItems: "center" }}
            >
              {showConfirmPassword ? <EyeOff size={18} color="var(--text-secondary)" /> : <Eye size={18} color="var(--text-secondary)" />}
            </div>
          </div>

          <button className="premium-btn" disabled={isLoading} style={{ marginTop: "12px", padding: "12px", width: "100%", justifyContent: "center" }}>
            {isLoading ? "Creating account..." : (
              <>
                <UserPlus size={18} />
                Sign Up
              </>
            )}
          </button>
        </form>

        <div style={{ marginTop: "25px", fontSize: "14px", color: "var(--text-secondary)", display: "flex", flexDirection: "column", gap: "8px" }}>
          <span>Already have an account?</span>
          <button 
            onClick={() => setPage("login")}
            className="secondary-btn"
            style={{ width: "100%", justifyContent: "center", padding: "10px", marginTop: "5px" }}
          >
            Login
          </button>
        </div>

      </div>
    </div>
  );
}

export default Signup;