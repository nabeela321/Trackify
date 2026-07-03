import { useState } from "react";
import { X, Save, Moon, Sun, Smartphone, RefreshCw, Bell } from "lucide-react";

function SettingsModal({ onClose, theme, setTheme }) {
  const [autoSync, setAutoSync] = useState(localStorage.getItem("autoSync") === "true");
  const [compactView, setCompactView] = useState(localStorage.getItem("compactView") === "true");
  const [pushNotifs, setPushNotifs] = useState(localStorage.getItem("pushNotifs") !== "false");

  const handleSave = () => {
    localStorage.setItem("autoSync", autoSync);
    localStorage.setItem("compactView", compactView);
    localStorage.setItem("pushNotifs", pushNotifs);
    onClose();
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div className="glass-panel animate-slide-up" style={{ width: "100%", maxWidth: "450px", padding: "30px", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: "15px", right: "15px", background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
          <X size={20} />
        </button>

        <h2 style={{ fontSize: "24px", fontWeight: "700", marginBottom: "25px" }}>Settings</h2>

        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              {theme === "dark" ? <Moon size={18} color="var(--primary)" /> : <Sun size={18} color="var(--primary)" />}
              <div>
                <p style={{ fontWeight: 600 }}>Appearance</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Toggle light and dark mode</p>
              </div>
            </div>
            <button className="secondary-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} style={{ padding: "6px 12px", fontSize: "12px" }}>
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Smartphone size={18} color="var(--primary)" />
              <div>
                <p style={{ fontWeight: 600 }}>Compact View</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Make the job grid smaller</p>
              </div>
            </div>
            <input type="checkbox" checked={compactView} onChange={e => setCompactView(e.target.checked)} style={{ transform: "scale(1.2)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid var(--border-color)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <RefreshCw size={18} color="var(--primary)" />
              <div>
                <p style={{ fontWeight: 600 }}>Auto Sync Gmail</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Sync on dashboard load</p>
              </div>
            </div>
            <input type="checkbox" checked={autoSync} onChange={e => setAutoSync(e.target.checked)} style={{ transform: "scale(1.2)" }} />
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Bell size={18} color="var(--primary)" />
              <div>
                <p style={{ fontWeight: 600 }}>Push Notifications</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Receive alerts when browser is closed</p>
              </div>
            </div>
            <input type="checkbox" checked={pushNotifs} onChange={e => setPushNotifs(e.target.checked)} style={{ transform: "scale(1.2)" }} />
          </div>

        </div>

        <button onClick={handleSave} className="premium-btn" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "30px" }}>
          <Save size={18} /> Save Settings
        </button>
      </div>
    </div>
  );
}

export default SettingsModal;
