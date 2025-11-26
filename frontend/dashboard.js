const API_BASE = "http://localhost:3000";
const USERNAME = localStorage.getItem("username");

let currentLinks = [];
let editingIndex = null;

// Load links from backend
async function loadLinks() {
  try {
    const res = await fetch(`${API_BASE}/${USERNAME}`);
    const data = await res.json();

    currentLinks = data.links || [];
    renderLinks();
    updatePreview();
  } catch (err) {
    console.error(err);
  }
}

// Render all links with inline edit support
function renderLinks() {
  const container = document.getElementById("linksList");
  container.innerHTML = "";

  if (currentLinks.length === 0) {
    container.innerHTML = "<p style='color:#9ca3af'>No links yet.</p>";
    return;
  }

  currentLinks.forEach((link, index) => {
    const div = document.createElement("div");

    // add editing class when needed
    if (editingIndex === index) {
      div.className = "link-item editing";
    } else {
      div.className = "link-item";
    }

    // EDIT MODE
    if (editingIndex === index) {
      div.innerHTML = `
        <div style="width:100%; display:flex; flex-direction:column; gap:8px;">
          <input id="editTitle" 
            placeholder="Edit Title"
            value="${link.title}">
          
          <input id="editURL" 
            placeholder="Edit URL (https://...)"
            value="${link.url}">
        </div>

        <div class="link-actions" style="margin-top:6px;">
          <button onclick="saveEdit(${index})"
            style="
              padding:6px 14px;
              background:#6366f1;
              color:white;
              border:none;
              border-radius:999px;
              font-size:12px;
              font-weight:600;
              cursor:pointer;
            ">
            Save
          </button>

          <button onclick="cancelEdit()"
            style="
              padding:6px 14px;
              background:#1f2937;
              color:#e5e7eb;
              border:1px solid #374151;
              border-radius:999px;
              font-size:12px;
              font-weight:600;
              cursor:pointer;
            ">
            Cancel
          </button>
        </div>
      `;
    }

    // VIEW MODE
    else {
      div.innerHTML = `
        <div style="flex:1">
          <div class="link-title">${link.title}</div>
          <div class="link-url">${link.url}</div>
        </div>

        <div class="link-actions">
          <button onclick="editLink(${index})">Edit</button>
          <button onclick="deleteLink(${index})">Delete</button>
        </div>
      `;
    }

    container.appendChild(div);
  });
}

// Start editing a link
function editLink(index) {
  editingIndex = index;
  renderLinks();
}

// Cancel editing
function cancelEdit() {
  editingIndex = null;
  renderLinks();
}

// Save edited link
async function saveEdit(index) {
  const title = document.getElementById("editTitle").value.trim();
  const url = document.getElementById("editURL").value.trim();

  if (!title || !url) return alert("Enter title and URL");

  await fetch(`${API_BASE}/update-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, index, title, url })
  });

  editingIndex = null;
  await loadLinks();
}

// Add a brand new link
async function addLink() {
  const title = document.getElementById("newTitle").value.trim();
  const url = document.getElementById("newURL").value.trim();

  if (!title || !url) return alert("Enter a title and URL");

  await fetch(`${API_BASE}/add-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, title, url })
  });

  document.getElementById("newTitle").value = "";
  document.getElementById("newURL").value = "";

  await loadLinks();
}

// Delete link
async function deleteLink(index) {
  await fetch(`${API_BASE}/delete-link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: USERNAME, index })
  });

  await loadLinks();
}

// Update live preview
function updatePreview() {
  const frame = document.getElementById("previewFrame");
  frame.src = `public.html?user=${USERNAME}&t=${Date.now()}`;
}

// View public profile
function viewPublicPage() {
  window.open(`public.html?user=${USERNAME}`, "_blank");
}

// Logout
function logout() {
  localStorage.removeItem("username");
  window.location = "index.html";
}

loadLinks();
