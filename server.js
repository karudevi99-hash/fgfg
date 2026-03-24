const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// static files (important)
app.use(express.static(__dirname));

// index route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// apk route
app.get("/goplay.apk", (req, res) => {
  res.download(path.join(__dirname, "goplay.apk"));
});

app.listen(PORT, () => {
  console.log("Server running...");
});
