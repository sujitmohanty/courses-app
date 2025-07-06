const express = require("express");
const router = express.Router();
const courseController = require("../controllers/courseController");
const {
  isAuthenticated,
  isInstructor,
} = require("../middlewares/authMiddleware");

// GET /courses - Display all courses (for all authenticated users)
router.get("/", isAuthenticated, courseController.getAllCourses);

// GET /courses/create - Display form to create a course (instructors only)
router.get(
  "/create",
  isAuthenticated,
  isInstructor,
  courseController.getCreateCourse
);

// POST /courses/create - Handle course creation (instructors only)
router.post(
  "/create",
  isAuthenticated,
  isInstructor,
  courseController.postCreateCourse
);

module.exports = router;
