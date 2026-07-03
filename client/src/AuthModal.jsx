import { useState } from "react";
import { Eye, EyeOff, X, LogIn } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import toast from "react-hot-toast";

function AuthModal({ onClose, setIsLoggedIn }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLoginMode && password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const endpoint = isLoginMode ? "login" : "signup";
    const body = isLoginMode ? { email, password } : { name, email, password };

    try {
      const res = await fetch(`http://localhost:5000/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (data.token) {
        localStorage.setItem("token", data.token);
        setIsLoggedIn(true);
        toast.success("Welcome to PAATHA!");
        onClose();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("An error occurred. Please try again.");
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const res = await fetch("http://localhost:5000/google-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code }),
        });
        const data = await res.json();
        
        if (data.token) {
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
          toast.success("Welcome to PAATHA!");
          onClose();
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error("Google sign-in failed.");
      }
    },
    onError: () => toast.error("Google sign-in was cancelled or failed."),
  });

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000
    }}>
      <div className="glass-panel animate-slide-up" style={{ 
        width: "100%", maxWidth: "400px", padding: "30px", 
        position: "relative",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <button 
          onClick={onClose}
          style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: "center", marginBottom: "25px" }}>
          <h2 style={{ fontSize: "24px", fontWeight: "700", color: "var(--text-primary)", marginBottom: "8px" }}>
            {isLoginMode ? "Welcome Back" : "Create an Account"}
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            {isLoginMode ? "Sign in to manage your applications." : "Join PAATHA and land your dream job."}
          </p>
        </div>

        <button 
          className="secondary-btn" 
          onClick={() => handleGoogleLogin()}
          style={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", marginBottom: "20px" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          {isLoginMode ? "Sign in with Google" : "Sign up with Google"}
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "20px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
          <span style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: "600" }}>Or continue with email</span>
          <div style={{ flex: 1, height: "1px", background: "var(--border-color)" }}></div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          {!isLoginMode && (
            <div className="premium-input-group">
              <input className="premium-input" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          )}
          
          <div className="premium-input-group">
            <input className="premium-input" type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          
          <div className="premium-input-group">
            <input className="premium-input" type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 5px" }}>
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {!isLoginMode && (
            <div className="premium-input-group">
              <input className="premium-input" type={showConfirmPassword ? "text" : "password"} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", display: "flex", alignItems: "center", padding: "0 5px" }}>
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          )}
          
          <button className="premium-btn" style={{ width: "100%", justifyContent: "center", padding: "14px", marginTop: "10px", fontSize: "16px" }}>
            {isLoginMode ? <LogIn size={18} /> : null}
            {isLoginMode ? "Log In" : "Create Account"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: "20px", fontSize: "14px", color: "var(--text-secondary)" }}>
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button 
            type="button" 
            onClick={() => setIsLoginMode(!isLoginMode)}
            style={{ background: "none", border: "none", color: "var(--primary)", fontWeight: "600", cursor: "pointer", marginLeft: "5px" }}
          >
            {isLoginMode ? "Sign up" : "Log in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default AuthModal;
