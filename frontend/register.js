const API_BASE = "http://localhost:3000";

async function register() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.textContent = "";

  if (!username || !password) {
    msg.textContent = "Enter username and password.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!data.success) {
      msg.textContent = data.error || "Registration failed.";
      return;
    }

    // save login
    localStorage.setItem("username", username);

    // redirect to dashboard
    window.location = "dashboard.html";

  } catch (err) {
    console.error(err);
    msg.textContent = "Server error.";
  }
}
