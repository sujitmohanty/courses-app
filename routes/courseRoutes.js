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

// GET /courses/my-courses - Display courses for the logged-in instructor
router.get(
  "/my-courses",
  isAuthenticated,
  isInstructor,
  courseController.getInstructorCourses
);

// GET /courses/:id/details - Display course details and enrolled students
router.get(
  "/:id/details",
  isAuthenticated,
  isInstructor,
  courseController.getCourseDetails
);

// GET /courses/:id/edit - Display form to edit a course
router.get(
  "/:id/edit",
  isAuthenticated,
  isInstructor,
  courseController.getEditCourse
);

// POST /courses/:id/update - Handle updating a course
router.post(
  "/:id/update",
  isAuthenticated,
  isInstructor,
  courseController.postUpdateCourse
);

// POST /courses/:id/delete - Handle deleting a course
router.post(
  "/:id/delete",
  isAuthenticated,
  isInstructor,
  courseController.postDeleteCourse
);

module.exports = router;
