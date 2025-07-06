const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

// GET /auth/register - Display registration form
router.get("/register", authController.getRegister);

// POST /auth/register - Handle registration submission
router.post("/register", authController.postRegister);

// GET /auth/login - Display login form
router.get("/login", authController.getLogin);

// POST /auth/login - Handle login submission
router.post("/login", authController.postLogin);

// GET /auth/logout - Handle logout
router.get("/logout", authController.getLogout);

module.exports = router;
