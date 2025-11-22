const USERNAME = "ben";
const API_BASE = "https://simple-linktree-backend.onrender.com";

let linksData = [];
let editingIndex = null;

// Load links from backend
async function loadLinks() {
  try {
    const res = await fetch(`${API_BASE}/${USERNAME}`);
    const data = await res.json();

    linksData = data.links || [];
    renderLinks();
  } catch (err) {
    console.error(err);
    alert("Failed to load links.");
  }
}

// Render links into the dashboard list
function renderLinks() {
  const container = document.getElementById("linksList");
  container.innerHTML = "";

  if (!linksData.length) {
    container.innerHTML =
      "<p style='color:#9ca3af;font-size:14px;'>No links yet.</p>";
    return;
  }

  linksData.forEach((link, index) => {
    const row = document.createElement("div");
    row.className = "link-row";
    row.draggable = true;
    row.dataset.index = index;

    // Drag events
    row.addEventListener("dragstart", handleDragStart);
    row.addEventListener("dragover", handleDragOver);
    row.addEventListener("drop", handleDrop);
    row.addEventListener("dragend", handleDragEnd);

    const left = document.createElement("div");
    left.className = "link-left";

    const dragHandle = document.createElement("span");
    dragHandle.className = "drag-handle";
    dragHandle.textContent = "⋮⋮";

    const main = document.createElement("div");
    main.className = "link-main";

    const titleEl = document.createElement("div");
    titleEl.className = "link-title";
    titleEl.textContent = link.title;

    const urlEl = document.createElement("div");
    urlEl.className = "link-url";
    urlEl.textContent = link.url;

    main.appendChild(titleEl);
    main.appendChild(urlEl);

    left.appendChild(dragHandle);
    left.appendChild(main);

    const actions = document.createElement("div");
    actions.className = "link-actions";

    const editBtn = document.createElement("button");
    editBtn.className = "small-btn";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => startEdit(index);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "small-btn delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.onclick = () => deleteLink(index);

    actions.appendChild(editBtn);
    actions.appendChild(deleteBtn);

    row.appendChild(left);
    row.appendChild(actions);

    container.appendChild(row);
  });
}

// Handle add / save button click
async function handleSubmit() {
  if (editingIndex === null) {
    await addLink();
  } else {
    await updateLink();
  }
}

// Add new link
async function addLink() {
  const titleInput = document.getElementById("title");
  const urlInput = document.getElementById("url");

  const title = titleInput.value.trim();
  const url = urlInput.value.trim();

  if (!title || !url) {
    alert("Please fill out both fields.");
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/add-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: USERNAME,
        title,
        url
      })
    });

    await response.json();

    titleInput.value = "";
    urlInput.value = "";

    showSuccess("Link added!");
    await loadLinks();
  } catch (err) {
    console.error(err);
    alert("Failed to add link.");
  }
}

// Start editing a link
function startEdit(index) {
  const link = linksData[index];
  editingIndex = index;

  document.getElementById("title").value = link.title;
  document.getElementById("url").value = link.url;

  const btn = document.getElementById("submitButton");
  btn.textContent = "Save Changes";
}

// Save edited link
async function updateLink() {
  const titleInput = document.getElementById("title");
  const urlInput = document.getElementById("url");

  const title = titleInput.value.trim();
  const url = urlInput.value.trim();

  if (!title || !url) {
    alert("Please fill out both fields.");
    return;
  }

  try {
    await fetch(`${API_BASE}/update-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: USERNAME,
        index: editingIndex,
        title,
        url
      })
    });

    titleInput.value = "";
    urlInput.value = "";

    editingIndex = null;
    document.getElementById("submitButton").textContent = "Add Link";

    showSuccess("Link updated!");
    await loadLinks();
  } catch (err) {
    console.error(err);
    alert("Failed to update link.");
  }
}

// Delete link
async function deleteLink(index) {
  try {
    const response = await fetch(`${API_BASE}/delete-link`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: USERNAME,
        index: index
      })
    });

    const data = await response.json();
    showSuccess("Link deleted!");

    await loadLinks();

  } catch (err) {
    console.error(err);
    alert("Failed to delete link.");
  }
}


// Drag & drop logic
let dragSourceIndex = null;

function handleDragStart(e) {
  dragSourceIndex = Number(e.currentTarget.dataset.index);
  e.currentTarget.classList.add("dragging");
  e.dataTransfer.effectAllowed = "move";
}

function handleDragOver(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
}

async function handleDrop(e) {
  e.preventDefault();
  const targetIndex = Number(e.currentTarget.dataset.index);

  if (
    dragSourceIndex === null ||
    isNaN(dragSourceIndex) ||
    isNaN(targetIndex) ||
    dragSourceIndex === targetIndex
  ) {
    return;
  }

  const moved = linksData.splice(dragSourceIndex, 1)[0];
  linksData.splice(targetIndex, 0, moved);
  dragSourceIndex = null;

  // Save order to backend
  try {
    await fetch(`${API_BASE}/reorder-links`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: USERNAME,
        links: linksData
      })
    });

    renderLinks();
  } catch (err) {
    console.error(err);
    alert("Failed to reorder links.");
  }
}

function handleDragEnd(e) {
  e.currentTarget.classList.remove("dragging");
  dragSourceIndex = null;
}

// Show success message
function showSuccess(message) {
  const successEl = document.getElementById("success");
  successEl.textContent = message;
  successEl.style.display = "block";

  setTimeout(() => {
    successEl.style.display = "none";
  }, 2000);
}

// initial load
loadLinks();
