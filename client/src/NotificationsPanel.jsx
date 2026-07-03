import { useState, useEffect } from "react";
import { X, CheckCircle2, Trash2, Bell, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";

function NotificationsPanel({ onClose, token }) {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifs = () => {
    fetch("http://localhost:5000/notifications", { headers: { Authorization: token } })
      .then(res => res.json())
      .then(data => {
        setNotifications(Array.isArray(data) ? data : []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotifs();
  }, [token]);

  const handleRead = async (id) => {
    try {
      await fetch(`http://localhost:5000/read-notification/${id}`, {
        method: "PATCH",
        headers: { Authorization: token }
      });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch {}
  };

  const handleClear = async () => {
    try {
      await fetch("http://localhost:5000/notifications", {
        method: "DELETE",
        headers: { Authorization: token }
      });
      setNotifications([]);
      toast.success("Notifications cleared");
      onClose();
    } catch {
      toast.error("Failed to clear notifications");
    }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(8px)",
      display: "flex", alignItems: "flex-start", justifyContent: "flex-end", zIndex: 1000
    }}>
      <div className="glass-panel animate-fade-in" style={{ 
        width: "100%", maxWidth: "400px", height: "100vh", 
        borderRight: "none", borderTop: "none", borderBottom: "none", borderRadius: 0,
        padding: "25px", display: "flex", flexDirection: "column" 
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
            <Bell size={20} color="var(--primary)" /> Notifications
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)" }}>
            <X size={20} />
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "12px" }}>
          {isLoading ? (
            <p style={{ textAlign: "center", color: "var(--text-secondary)", marginTop: "20px" }}>Loading...</p>
          ) : notifications.length === 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)" }}>
              <CheckCircle2 size={40} style={{ opacity: 0.5, marginBottom: "10px" }} />
              <p>You're all caught up!</p>
            </div>
          ) : (
            notifications.map(notif => (
              <div key={notif._id} style={{ 
                background: notif.read ? "var(--bg-card)" : "var(--bg-input)", 
                padding: "15px", borderRadius: "10px", 
                borderLeft: `4px solid ${notif.read ? 'transparent' : 'var(--primary)'}` 
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
                  <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>{notif.title}</h4>
                  {!notif.read && (
                    <button onClick={() => handleRead(notif._id)} style={{ background: "none", border: "none", fontSize: "12px", color: "var(--primary)", cursor: "pointer", fontWeight: 600 }}>
                      Mark Read
                    </button>
                  )}
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{notif.body}</p>
              </div>
            ))
          )}
        </div>

        {notifications.length > 0 && (
          <button onClick={handleClear} className="secondary-btn" style={{ width: "100%", justifyContent: "center", padding: "12px", marginTop: "20px", display: "flex", gap: "8px", color: "var(--danger)" }}>
            <Trash2 size={16} /> Clear All
          </button>
        )}
      </div>
    </div>
  );
}

export default NotificationsPanel;
