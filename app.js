const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
require("dotenv").config();

// Import routes
const authRoutes = require("./routes/authRoutes");

// Import database configuration
const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./config" }),
    secret: process.env.SESSION_SECRET || "ABC12345",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Middleware to make user info available in all views
app.use((req, res, next) => {
  res.locals.user = req.session.userId
    ? { id: req.session.userId, role: req.session.role }
    : null;
  next();
});

// Use routes
app.use("/auth", authRoutes);

// Home page route
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

// Placeholder dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) {
    return res.redirect("/auth/login");
  }
  res.send(
    `<h1>Welcome to your Dashboard!</h1><p>Your Role: ${req.session.role}</p><a href="/auth/logout">Logout</a>`
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
