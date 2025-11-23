const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Load users from JSON
let users = JSON.parse(fs.readFileSync("./users.json", "utf-8"));

function saveUsers() {
  fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
}

// LOGIN (single user)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users[username];
  if (!user || user.password !== password) {
    return res.status(401).json({ success: false, message: "Invalid credentials" });
  }

  // Single-user: no token, frontend just tracks 'loggedIn'
  res.json({ success: true, message: "Logged in" });
});

// GET links for a profile
app.get("/:username", (req, res) => {
  const user = users[req.params.username];
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json(user);
});

// ADD a new link
app.post("/add-link", (req, res) => {
  const { username, title, url } = req.body;

  if (!username || !title || !url) {
    return res.status(400).json({ error: "Missing fields" });
  }

  if (!users[username]) {
    users[username] = { password: "", links: [] };
  }

  users[username].links.push({ title, url });
  saveUsers();

  res.json({ message: "Link added" });
});

// DELETE a link by index
app.post("/delete-link", (req, res) => {
  const { username, index } = req.body;

  const user = users[username];
  if (!user) return res.status(404).json({ error: "User not found" });

  if (typeof index !== "number" || index < 0 || index >= user.links.length) {
    return res.status(400).json({ error: "Invalid link index" });
  }

  user.links.splice(index, 1);
  saveUsers();

  res.json({ message: "Link deleted" });
});

// UPDATE a link (edit title/url)
app.post("/update-link", (req, res) => {
  const { username, index, title, url } = req.body;

  const user = users[username];
  if (!user) return res.status(404).json({ error: "User not found" });

  if (typeof index !== "number" || index < 0 || index >= user.links.length) {
    return res.status(400).json({ error: "Invalid link index" });
  }

  if (!title || !url) {
    return res.status(400).json({ error: "Missing title or url" });
  }

  user.links[index] = { title, url };
  saveUsers();

  res.json({ message: "Link updated" });
});

// REORDER links – overwrite with new ordered list
app.post("/reorder-links", (req, res) => {
  const { username, links } = req.body;

  const user = users[username];
  if (!user) return res.status(404).json({ error: "User not found" });

  if (!Array.isArray(links)) {
    return res.status(400).json({ error: "Links must be an array" });
  }

  user.links = links;
  saveUsers();

  res.json({ message: "Links reordered" });
});

app.listen(3000, () => console.log("Server running on port 3000"));