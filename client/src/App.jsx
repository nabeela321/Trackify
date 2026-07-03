import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Landing from "./Landing";
import JobApp from "./JobApp";
import AuthModal from "./AuthModal";
import './index.css';

// Utility for Push VAPID key
const urlBase64ToUint8Array = (base64String) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [theme, setTheme] = useState("light");
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  // PWA Install Prompt
  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    });
  }, []);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => setDeferredPrompt(null));
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // check token & register push
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      setIsLoggedIn(true);
      registerPush(token);
    }
  }, []);

  const registerPush = async (token) => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        const publicVapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!publicVapidKey) return;
        
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });
        
        await fetch('http://localhost:5000/subscribe', {
          method: 'POST',
          body: JSON.stringify(subscription),
          headers: {
            'content-type': 'application/json',
            'Authorization': token
          }
        });
      } catch (err) {
        console.error("Push registration failed", err);
      }
    }
  };

  if (isLoggedIn) {
    return (
      <>
        <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', backdropFilter: 'blur(10px)' } }} />
        <JobApp 
          setIsLoggedIn={setIsLoggedIn} 
          theme={theme} 
          setTheme={setTheme} 
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallClick}
        />
      </>
    );
  }

  return (
    <div style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column" }}>
      <Toaster position="top-right" toastOptions={{ style: { background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' } }} />
      
      <div className="animate-fade-in" style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Landing 
          onOpenAuth={() => setIsAuthModalOpen(true)} 
          deferredPrompt={deferredPrompt}
          onInstall={handleInstallClick}
        />
      </div>

      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          setIsLoggedIn={(val) => {
            setIsLoggedIn(val);
            if (val) registerPush(localStorage.getItem("token"));
          }} 
        />
      )}
    </div>
  );
}

export default App;