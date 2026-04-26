import { useState, useEffect } from "react";
import Login from "./Login";
import Signup from "./Signup";
import JobApp from "./JobApp";

function App() {
  const [isLoginPage, setIsLoginPage] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // check token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setIsLoggedIn(true);
  }, []);

  if (isLoggedIn) {
    return <JobApp setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <div>
      {isLoginPage ? (
        <Login setIsLoggedIn={setIsLoggedIn} />
      ) : (
        <Signup setIsLoginPage={setIsLoginPage} />
      )}

      <div style={{ textAlign: "center", marginTop: "10px" }}>
        <button onClick={() => setIsLoginPage(!isLoginPage)}>
          Switch to {isLoginPage ? "Signup" : "Login"}
        </button>
      </div>
    </div>
  );
}

export default App;