const API_BASE = "http://localhost:3000";
const USERNAME = localStorage.getItem("username");

async function loadLinks() {
  try {
    const res = await fetch(`${API_BASE}/${USERNAME}`);
    const data = await res.json();

    if (data.error) {
      alert("User not found");
      return;
    }

    renderLinks(data.links || []);
    updatePreview();
  } catch (err) {
    console.error(err);
  }
}

function renderLinks(links) {
  const container = document.getElementById("linksList");
  container.innerHTML = "";

  if (links.length === 0) {
    container.innerHTML = "<p style='color:#9ca3af'>No links yet.</p>";
    return;
  }

  links.forEach((link, index) => {
    const div = document.createElement("div");
    div.className = "link-item";

    div.innerHTML = `
      <span class="link-title">${link.title}</span>
      <div class="link-actions">
        <button onclick="editLink(${index})">Edit</button>
        <button onclick="deleteLink(${index})">Delete</button>
      </div>
    `;
    container.appendChild(div);
  });
}

async function addLink() {
  const title = document.getElementById("newTitle").value.trim();
  const url = document.getElementById("newURL").value.trim();

  if (!title || !url) return alert("Enter a title and URL");

  try {
    await fetch(`${API_BASE}/add-link`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: USERNAME, title, url })
    });

    document.getElementById("newTitle").value = "";
    document.getElementById("newURL").value = "";

    await loadLinks();
  } catch (err) {
    console.error(err);
  }
}

async function deleteLink(index) {
  await fetch(`${API_BASE}/delete-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, index })
  });

  await loadLinks();
}

function editLink(index) {
  const newTitle = prompt("New title:");
  const newURL = prompt("New URL:");

  if (!newTitle || !newURL) return;

  fetch(`${API_BASE}/update-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, index, title: newTitle, url: newURL })
  })
    .then(() => loadLinks())
    .catch(console.error);
}

function updatePreview() {
  const frame = document.getElementById("previewFrame");
  frame.src = `public.html?user=${USERNAME}&t=${Date.now()}`;
}

function viewPublicPage() {
  window.open(`public.html?user=${USERNAME}`, "_blank");
}

function logout() {
  localStorage.removeItem("username");
  window.location = "index.html";
}

// INITIAL LOAD
loadLinks();
