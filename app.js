const express = require("express");
const path = require("path");
const session = require("express-session");
const morgan = require("morgan");
const SQLiteStore = require("connect-sqlite3")(session);
require("dotenv").config();

// Import Models
const User = require("./models/user");

// Import routes
const authRoutes = require("./routes/authRoutes");
const courseRoutes = require("./routes/courseRoutes");

// Import middleware
const { isAuthenticated } = require("./middlewares/authMiddleware");

const app = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Morgan middleware for logging
// 'dev' format provides concise, color-coded output for development
app.use(morgan("dev"));

app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./config" }),
    secret: process.env.SESSION_SECRET || "ABC12323435",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 },
  })
);

// Middleware to make user info available in all views
app.use((req, res, next) => {
  if (!req.session.userId) {
    res.locals.user = null;
    return next();
  }
  User.findById(req.session.userId, (err, user) => {
    if (err) {
      console.error("Session user lookup error:", err);
      res.locals.user = null;
    } else {
      // Avoiding to expose hashed password
      const { password, ...safeUser } = user;
      res.locals.user = safeUser;
    }
    next();
  });
});

// Use routes
app.use("/auth", authRoutes);
app.use("/courses", courseRoutes);

// Home page route
app.get("/", (req, res) => {
  res.render("home", { title: "Home" });
});

// Main dashboard route
app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { title: "Dashboard" });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Graceful shutdown logic
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);

  // Stop accepting new connections
  server.close(() => {
    console.log("HTTP server closed.");

    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error("Error closing the database:", err.message);
      } else {
        console.log("Database connection closed.");
      }
      // Exit the process
      process.exit(0);
    });
  });
};

// Listen for termination signals
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT")); // Catches Ctrl+C
