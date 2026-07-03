import { Briefcase, ArrowRight, LayoutDashboard, Mail, Search, CheckCircle2, Clock, XCircle, Calendar, Sparkles, Inbox, RefreshCw, Layers } from "lucide-react";

function Landing({ onOpenAuth, deferredPrompt, onInstall }) {
  return (
    <div className="animate-fade-in" style={{ 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column",
      background: "linear-gradient(180deg, var(--bg-card) 0%, var(--bg-main) 100%)",
      overflow: "hidden",
      position: "relative"
    }}>
      
      {/* Background Ornaments */}
      <div style={{ position: "absolute", top: "-10%", left: "-10%", width: "40vw", height: "40vw", background: "var(--sage)", opacity: 0.1, filter: "blur(100px)", borderRadius: "50%", zIndex: 0 }}></div>
      <div style={{ position: "absolute", bottom: "-10%", right: "-5%", width: "50vw", height: "50vw", background: "var(--warning)", opacity: 0.05, filter: "blur(120px)", borderRadius: "50%", zIndex: 0 }}></div>

      {/* Landing Navbar */}
      <nav style={{ 
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(255, 253, 248, 0.85)", 
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex", justifyContent: "space-between", padding: "16px 5%", alignItems: "center" 
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 10 }}>
          <div style={{ 
            background: "linear-gradient(135deg, var(--primary), var(--sage))", 
            width: "40px", height: "40px", borderRadius: "10px", 
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 10px var(--primary-glow)"
          }}>
            <Briefcase color="white" size={20} strokeWidth={2.5} />
          </div>
          <h1 style={{ fontSize: "20px", fontWeight: "700", letterSpacing: "-0.5px", color: "var(--text-primary)" }}>PAATHA</h1>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px", zIndex: 10 }}>
          {deferredPrompt && (
            <button 
              className="premium-btn" 
              style={{ padding: "8px 14px", borderRadius: "18px", background: "var(--warning)", color: "white", boxShadow: "none" }}
              onClick={onInstall}
            >
              Install App
            </button>
          )}
          <button 
            className="secondary-btn" 
            style={{ border: "none", fontWeight: 600, color: "var(--text-secondary)" }}
            onClick={onOpenAuth}
          >
            Log In
          </button>
          <button 
            className="premium-btn" 
            style={{ padding: "10px 18px", borderRadius: "20px" }}
            onClick={onOpenAuth}
          >
            Start Tracking Free
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: "flex", alignItems: "center", padding: "60px 5%", position: "relative", zIndex: 1, minHeight: "85vh" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "40px", alignItems: "center", width: "100%", maxWidth: "1400px", margin: "0 auto" }}>
          
          {/* Hero Left Content */}
          <div className="animate-slide-up" style={{ paddingRight: "40px" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: "8px", padding: "6px 14px", background: "var(--primary-glow)", color: "var(--primary)", borderRadius: "20px", fontSize: "14px", fontWeight: "600", marginBottom: "24px" }}>
              <Sparkles size={16} /> Stay on Track. Get Hired.
            </div>
            
            <h1 style={{ fontSize: "clamp(48px, 5vw, 68px)", fontWeight: "800", lineHeight: "1.1", letterSpacing: "-1.5px", marginBottom: "24px", color: "var(--text-primary)" }}>
              Never Lose Track of Your Job Applications.
            </h1>
            
            <p style={{ fontSize: "19px", color: "var(--text-secondary)", marginBottom: "40px", lineHeight: "1.6", maxWidth: "550px" }}>
              PAATHA automatically organizes your applications, syncs effortlessly with your Gmail, and provides smart insights to help you land your dream role faster.
            </p>
            
            <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
              <button className="premium-btn" style={{ padding: "16px 32px", fontSize: "17px", borderRadius: "30px", boxShadow: "0 8px 25px var(--primary-glow)" }} onClick={onOpenAuth}>
                Start Tracking Free <ArrowRight size={20} />
              </button>
              <button className="secondary-btn" style={{ padding: "16px 32px", fontSize: "17px", borderRadius: "30px", background: "var(--bg-card)" }} onClick={onOpenAuth}>
                Log In
              </button>
            </div>
          </div>

          {/* Hero Right: Realistic Mockup */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s", position: "relative" }}>
            <div className="glass-panel" style={{ 
              width: "100%", 
              height: "550px", 
              borderRadius: "20px", 
              padding: "20px", 
              display: "flex", 
              flexDirection: "column",
              boxShadow: "0 30px 60px -12px rgba(35, 75, 58, 0.25)",
              border: "1px solid var(--border-color)",
              background: "var(--bg-card)",
              overflow: "hidden"
            }}>
              {/* Mockup Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", paddingBottom: "15px", borderBottom: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <LayoutDashboard size={20} color="var(--primary)" />
                  <span style={{ fontWeight: "700", fontSize: "16px", color: "var(--text-primary)" }}>Dashboard Preview</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "var(--primary)", background: "var(--primary-glow)", padding: "4px 10px", borderRadius: "12px", fontWeight: "600" }}>
                  <RefreshCw size={14} /> Synced 2m ago
                </div>
              </div>
              
              {/* Mockup Body */}
              <div style={{ display: "flex", gap: "20px", height: "100%" }}>
                {/* Sidebar Mock */}
                <div style={{ width: "160px", display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ padding: "10px", background: "var(--primary-glow)", color: "var(--primary)", borderRadius: "8px", fontSize: "13px", fontWeight: "600", display: "flex", alignItems: "center", gap: "8px" }}><LayoutDashboard size={16}/> Overview</div>
                  <div style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}><Layers size={16}/> Pipeline</div>
                  <div style={{ padding: "10px", color: "var(--text-secondary)", fontSize: "13px", fontWeight: "500", display: "flex", alignItems: "center", gap: "8px" }}><Calendar size={16}/> Interviews</div>
                </div>

                {/* Content Mock */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "15px" }}>
                  {/* Stats Row */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                    <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "12px", borderLeft: "3px solid var(--primary)" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Total Apps</p>
                      <h4 style={{ fontSize: "24px", color: "var(--text-primary)", marginTop: "4px" }}>42</h4>
                    </div>
                    <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "12px", borderLeft: "3px solid var(--warning)" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Interviews</p>
                      <h4 style={{ fontSize: "24px", color: "var(--text-primary)", marginTop: "4px" }}>5</h4>
                    </div>
                    <div style={{ background: "var(--bg-input)", padding: "15px", borderRadius: "12px", borderLeft: "3px solid var(--success)" }}>
                      <p style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: "600" }}>Offers</p>
                      <h4 style={{ fontSize: "24px", color: "var(--text-primary)", marginTop: "4px" }}>2</h4>
                    </div>
                  </div>

                  {/* Recent Activity List */}
                  <div style={{ flex: 1, background: "var(--bg-input)", borderRadius: "12px", padding: "15px", display: "flex", flexDirection: "column", gap: "12px" }}>
                     <h4 style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)", marginBottom: "5px" }}>Recent Activity</h4>
                     
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--bg-card)", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
                       <div>
                         <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Google</p>
                         <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Frontend Engineer</p>
                       </div>
                       <span style={{ fontSize: "12px", background: "rgba(245, 158, 11, 0.2)", color: "var(--warning)", padding: "4px 8px", borderRadius: "12px", fontWeight: "600" }}>Interview</span>
                     </div>

                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--bg-card)", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
                       <div>
                         <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Stripe</p>
                         <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Product Designer</p>
                       </div>
                       <span style={{ fontSize: "12px", background: "var(--primary-glow)", color: "var(--primary)", padding: "4px 8px", borderRadius: "12px", fontWeight: "600" }}>Applied</span>
                     </div>
                     
                     <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px", background: "var(--bg-card)", borderRadius: "8px", boxShadow: "0 2px 5px rgba(0,0,0,0.02)" }}>
                       <div>
                         <p style={{ fontSize: "14px", fontWeight: "600", color: "var(--text-primary)" }}>Spotify</p>
                         <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Backend Developer</p>
                       </div>
                       <span style={{ fontSize: "12px", background: "rgba(16, 185, 129, 0.2)", color: "var(--success)", padding: "4px 8px", borderRadius: "12px", fontWeight: "600" }}>Offer</span>
                     </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Floating element decoration */}
            <div className="glass-panel" style={{ position: "absolute", bottom: "-20px", left: "-30px", padding: "15px 20px", borderRadius: "16px", display: "flex", alignItems: "center", gap: "12px", boxShadow: "0 15px 30px rgba(0,0,0,0.1)", animation: "slideUp 1s ease-out 0.5s backwards" }}>
              <div style={{ background: "rgba(16, 185, 129, 0.2)", width: "36px", height: "36px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 color="var(--success)" size={20} />
              </div>
              <div>
                <p style={{ fontSize: "13px", fontWeight: "700", color: "var(--text-primary)" }}>New Interview Invite</p>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>via Gmail Sync</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Features Section */}
      <section style={{ padding: "80px 5%", background: "var(--bg-card)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: "60px" }}>
            <h2 style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "16px" }}>Everything you need to get hired.</h2>
            <p style={{ fontSize: "18px", color: "var(--text-secondary)" }}>Powerful tools designed for serious job seekers.</p>
          </div>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "30px" }}>
            <div className="glass-panel" style={{ padding: "30px", background: "var(--bg-main)", border: "none" }}>
              <Mail size={32} color="var(--primary)" style={{ marginBottom: "20px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px" }}>Gmail Sync</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>Automatically pull applications, updates, and offers straight from your inbox.</p>
            </div>
            <div className="glass-panel" style={{ padding: "30px", background: "var(--bg-main)", border: "none" }}>
              <Search size={32} color="var(--primary)" style={{ marginBottom: "20px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px" }}>AI Detection</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>Smart parsing extracts roles, company names, and dates without manual entry.</p>
            </div>
            <div className="glass-panel" style={{ padding: "30px", background: "var(--bg-main)", border: "none" }}>
              <Calendar size={32} color="var(--primary)" style={{ marginBottom: "20px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px" }}>Interview Tracking</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>Keep tabs on all upcoming interviews and technical assessments in one view.</p>
            </div>
            <div className="glass-panel" style={{ padding: "30px", background: "var(--bg-main)", border: "none" }}>
              <Clock size={32} color="var(--primary)" style={{ marginBottom: "20px" }} />
              <h3 style={{ fontSize: "20px", fontWeight: "700", marginBottom: "10px" }}>Smart Reminders</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.5" }}>Get gentle nudges to follow up with recruiters so you never miss an opportunity.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ padding: "80px 5%", background: "var(--bg-main)", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: "1000px", margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: "36px", fontWeight: "800", color: "var(--text-primary)", marginBottom: "50px" }}>How PAATHA Works</h2>
          
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px", textAlign: "left" }}>
            <div className="glass-panel" style={{ padding: "40px 30px", background: "var(--bg-card)", border: "1px solid var(--border-color)", position: "relative" }}>
              <div style={{ position: "absolute", top: "30px", right: "30px", fontSize: "60px", fontWeight: "900", color: "var(--bg-input)", lineHeight: 0.8 }}>1</div>
              <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "15px", position: "relative", zIndex: 1 }}>Connect Gmail</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", position: "relative", zIndex: 1 }}>Link your professional email account securely. PAATHA requests read-only access to find job-related emails.</p>
            </div>
            <div className="glass-panel" style={{ padding: "40px 30px", background: "var(--bg-card)", border: "1px solid var(--border-color)", position: "relative" }}>
               <div style={{ position: "absolute", top: "30px", right: "30px", fontSize: "60px", fontWeight: "900", color: "var(--bg-input)", lineHeight: 0.8 }}>2</div>
              <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "15px", position: "relative", zIndex: 1 }}>Auto-Organize</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", position: "relative", zIndex: 1 }}>We automatically identify job applications and organize them into your pipeline by company and role.</p>
            </div>
            <div className="glass-panel" style={{ padding: "40px 30px", background: "var(--bg-card)", border: "1px solid var(--border-color)", position: "relative" }}>
               <div style={{ position: "absolute", top: "30px", right: "30px", fontSize: "60px", fontWeight: "900", color: "var(--bg-input)", lineHeight: 0.8 }}>3</div>
              <h3 style={{ fontSize: "22px", fontWeight: "700", marginBottom: "15px", position: "relative", zIndex: 1 }}>Track & Succeed</h3>
              <p style={{ color: "var(--text-secondary)", lineHeight: "1.6", position: "relative", zIndex: 1 }}>Monitor interviews, deadlines, and offers effortlessly until you land your dream job.</p>
            </div>
          </div>
          
          <button className="premium-btn" style={{ padding: "16px 36px", fontSize: "18px", borderRadius: "30px", marginTop: "60px", display: "inline-flex" }} onClick={onOpenAuth}>
            Start Tracking Free
          </button>
        </div>
      </section>

    </div>
  );
}

export default Landing;
