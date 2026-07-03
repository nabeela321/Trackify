import { useState, useEffect } from "react";
import { X, Save, User as UserIcon } from "lucide-react";
import toast from "react-hot-toast";

function ProfileModal({ onClose, token, jobs }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/user", { headers: { Authorization: token } })
      .then(res => res.json())
      .then(data => {
        setName(data.name || "");
        setEmail(data.email || "");
        setAvatarUrl(data.avatarUrl || "");
        setIsLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load profile");
        setIsLoading(false);
      });
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: token },
        body: JSON.stringify({ name, avatarUrl })
      });
      if (res.ok) {
        toast.success("Profile updated");
        onClose();
      }
    } catch {
      toast.error("Error saving profile");
    }
  };

  const stats = {
    total: jobs.length,
    interviews: jobs.filter(j => j.status === "Interview").length,
    offers: jobs.filter(j => j.status === "Offer").length,
    rejections: jobs.filter(j => j.status === "Rejected").length,
    assessments: jobs.filter(j => j.isAssessment).length
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="glass-panel animate-slide-up" style={{ width: "100%", maxWidth: "500px", padding: "30px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>Profile</h2>

        {isLoading ? (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>Loading...</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
              <div style={{ width: "80px", height: "80px", borderRadius: "50%", background: "var(--bg-input)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                {avatarUrl ? <img src={avatarUrl} alt="Avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <UserIcon size={30} color="var(--text-secondary)" />}
              </div>
              <div style={{ flex: 1 }}>
                <div className="premium-input-group" style={{ marginBottom: "10px" }}>
                  <input className="premium-input" placeholder="Display Name" value={name} onChange={e => setName(e.target.value)} />
                </div>
                <div className="premium-input-group">
                  <input className="premium-input" placeholder="Avatar Image URL (optional)" value={avatarUrl} onChange={e => setAvatarUrl(e.target.value)} />
                </div>
              </div>
            </div>

            <p style={{ color: "var(--text-secondary)", fontSize: "14px" }}>Email: {email}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "10px" }}>
              <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Total Applications</p>
                <h3 style={{ fontSize: "24px" }}>{stats.total}</h3>
              </div>
              <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Interviews</p>
                <h3 style={{ fontSize: "24px" }}>{stats.interviews}</h3>
              </div>
              <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Assessments</p>
                <h3 style={{ fontSize: "24px" }}>{stats.assessments}</h3>
              </div>
              <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "10px" }}>
                <p style={{ color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>Offers</p>
                <h3 style={{ fontSize: "24px", color: "var(--primary)" }}>{stats.offers}</h3>
              </div>
            </div>

            <button onClick={handleSave} className="premium-btn" style={{ justifyContent: "center", padding: "12px", marginTop: "10px" }}>
              <Save size={18} /> Save Profile
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default ProfileModal;
