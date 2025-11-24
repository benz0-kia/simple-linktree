const API_BASE = "http://localhost:3000";

async function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();
  const msg = document.getElementById("message");

  msg.textContent = "";

  if (!username || !password) {
    msg.textContent = "Enter username and password.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!data.success) {
      msg.textContent = data.message || "Login failed.";
      return;
    }

    // SAVE USERNAME
    localStorage.setItem("username", username);

    // REDIRECT
    window.location = "dashboard.html";

  } catch (err) {
    console.error(err);
    msg.textContent = "Server error.";
  }
}