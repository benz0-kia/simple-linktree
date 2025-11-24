const API_BASE = "http://localhost:3000";

async function loadPublicPage() {
  const params = new URLSearchParams(window.location.search);
  const username = params.get("user");

  const titleEl = document.getElementById("usernameTitle");
  const container = document.getElementById("linksContainer");
  const errorEl = document.getElementById("error");

  if (!username) {
    titleEl.textContent = "User Not Found";
    errorEl.textContent = "No user specified.";
    return;
  }

  titleEl.textContent = username + "'s Links";

  try {
    const res = await fetch(`${API_BASE}/${username}`);
    const data = await res.json();

    if (data.error) {
      titleEl.textContent = "User Not Found";
      errorEl.textContent = "This profile doesn't exist.";
      return;
    }

    if (!data.links || data.links.length === 0) {
      container.innerHTML = "<p style='color:#9ca3af;'>No links yet.</p>";
      return;
    }

    container.innerHTML = "";

    data.links.forEach((lnk) => {
      const a = document.createElement("a");
      a.href = lnk.url;
      a.textContent = lnk.title;
      a.className = "link-button";
      a.target = "_blank";
      container.appendChild(a);
    });

  } catch (err) {
    console.error(err);
    errorEl.textContent = "Server error.";
  }
}

loadPublicPage();
