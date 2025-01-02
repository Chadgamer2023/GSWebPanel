const express = require("express");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const path = require("path");
// server status and players online as well as logs are all examples of how it wouild look like in the dashboard
let serverStatus = "online"; // server status in my option would look okay using the trafflic light system (green = online, yellow = updating?, red = offline)
let playersOnline = 15; // Mock data
let logs = ["Server started", "Player1 joined", "Player2 banned"]; // how logs would be?

// Basic login for testing purposes
const users = [
  { username: "owner", password: "1234", role: "owner" },
];

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); // For form submissions
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");

// Session middleware
app.use(
  session({
    secret: "growserver-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// Middleware to check if user is logged in
function isAuthenticated(req, res, next) {
  if (req.session.user) {
    return next();
  }
  res.redirect("/");
}

// Middleware to check role
function checkRole(req, res, next) {
  const { user } = req.session;
  if (user && (user.role === "owner" || user.role === "developer")) {
    return next();
  }
  res.status(403).send("Access denied: Insufficient permissions");
}

// Routes
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    req.session.user = user; // Save user info in session
    return res.redirect("/dashboard");
  }

  res.status(401).send("Invalid username or password");
});

app.get("/dashboard", isAuthenticated, checkRole, (req, res) => {
  res.render("dashboard", {
    serverStatus,
    playersOnline,
    logs,
  });
});

app.post("/update-status", isAuthenticated, checkRole, (req, res) => {
  const { status } = req.body;
  serverStatus = status;
  res.json({ success: true });
});

app.post("/execute-command", isAuthenticated, checkRole, (req, res) => {
  const { command } = req.body;
  logs.push(`Command executed: ${command}`);
  res.json({ success: true, message: "Command executed successfully!" });
});

// Logout route
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

const PORT = 3000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
