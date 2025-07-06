const Course = require("../models/course");

// Display list of all courses
exports.getAllCourses = (req, res) => {
  Course.findAll((err, courses) => {
    if (err) {
      return res.status(500).send("Error fetching courses.");
    }
    res.render("courses/index", { title: "All Courses", courses: courses });
  });
};

// Display form to create a new course
exports.getCreateCourse = (req, res) => {
  res.render("courses/create", { title: "Create Course" });
};

// Handle creation of a new course
exports.postCreateCourse = (req, res) => {
  const { title, description } = req.body;
  const instructorId = req.session.userId; // The logged-in instructor

  if (!title || !description) {
    return res.status(400).send("Please provide a title and description.");
  }

  Course.create(title, description, instructorId, (err, course) => {
    if (err) {
      return res.status(500).send("Error creating course.");
    }
    res.redirect("/courses");
  });
};
