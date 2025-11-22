const express = require("express");
const fs = require("fs");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

let users = JSON.parse(fs.readFileSync("./users.json"));

// GET links for a profile
app.get("/:username", (req, res) => {
  const user = users[req.params.username];
  if (!user) return res.json({ error: "User not found" });
  res.json(user);
});

// ADD a new link
app.post("/add-link", (req, res) => {
  const { username, title, url } = req.body;

  users[username].links.push({ title, url });

  fs.writeFileSync("./users.json", JSON.stringify(users, null, 2));
  res.json({ message: "Link added" });
});

app.listen(3000, () => console.log("Server running on port 3000"));
