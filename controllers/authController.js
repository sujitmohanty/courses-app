// controllers/authController.js
const User = require("../models/user");
const db = require("../config/database");

// Display registration page
exports.getRegister = (req, res) => {
  res.render("register", { title: "Register" });
};

// Handle registration
exports.postRegister = (req, res) => {
  const { name, email, password, role } = req.body;
  // Basic validation
  if (!name || !email || !password || !role) {
    return res.status(400).send("Please fill all fields.");
  }

  User.findByEmail(email, (err, user) => {
    if (err) {
      return res.status(500).send("Error checking for user.");
    }
    if (user) {
      return res.status(400).send("User with this email already exists.");
    }

    User.create(name, email, password, role, (err, newUser) => {
      if (err) {
        return res.status(500).send("Error registering user.");
      }
      // Redirect to login page after successful registration
      res.redirect("/auth/login");
    });
  });
};

// Display login page
exports.getLogin = (req, res) => {
  res.render("login", { title: "Login" });
};

// Handle login
exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Please provide email and password.");
  }

  User.findByEmail(email, (err, user) => {
    if (err || !user) {
      return res.status(401).send("Invalid credentials.");
    }

    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err || !isMatch) {
        return res.status(401).send("Invalid credentials.");
      }

      // Set up session
      req.session.userId = user.id;
      req.session.role = user.role;
      res.redirect("/dashboard"); // Redirect to dashboard
    });
  });
};

// Handle logout
exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send("Could not log out.");
    }
    res.redirect("/");
  });
};

// Handle health check
exports.getHealth = (req, res) => {
  // Check database connectivity
  db.get("SELECT 1", (err) => {
    if (err) {
      console.error("Health check failed:", err);
      return res
        .status(503)
        .json({ status: "error", message: "Service Unavailable" });
    }
    res.status(200).json({ status: "ok", message: "Service is healthy" });
  });
};
