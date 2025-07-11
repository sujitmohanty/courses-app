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

// Display a list of courses for the logged-in instructor
exports.getInstructorCourses = (req, res) => {
  const instructorId = req.session.userId;
  Course.findByInstructorId(instructorId, (err, courses) => {
    if (err) {
      console.error("Error fetching instructor courses:", err);
      return res.status(500).send("Error fetching your courses.");
    }
    res.render("courses/my-courses", {
      title: "My Courses",
      courses: courses,
    });
  });
};

// Display details of a single course
exports.getCourseDetails = (req, res) => {
  const courseId = req.params.id;
  Course.findById(courseId, (err, course) => {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }
    // Authorization check remains important
    if (course.instructor_id !== req.session.userId) {
      return res
        .status(403)
        .send("Access Denied: You are not the instructor for this course.");
    }
    // No longer need to fetch students, just render the page
    res.render("courses/details", {
      title: course.title,
      course: course,
    });
  });
};

// Display the form to edit a course
exports.getEditCourse = (req, res) => {
  const courseId = req.params.id;
  Course.findById(courseId, (err, course) => {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }
    // Authorization check
    if (course.instructor_id !== req.session.userId) {
      return res.status(403).send("Access Denied.");
    }
    res.render("courses/edit", { title: "Edit Course", course: course });
  });
};

// Handle updating a course
exports.postUpdateCourse = (req, res) => {
  const courseId = req.params.id;
  const { title, description } = req.body;

  // Authorization check before updating
  Course.findById(courseId, (err, course) => {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }
    if (course.instructor_id !== req.session.userId) {
      return res.status(403).send("Access Denied.");
    }

    Course.update(courseId, title, description, (err) => {
      if (err) {
        return res.status(500).send("Error updating course.");
      }
      res.redirect("/courses/my-courses");
    });
  });
};

// Handle deleting a course
exports.postDeleteCourse = (req, res) => {
  const courseId = req.params.id;

  // Authorization check before deleting
  Course.findById(courseId, (err, course) => {
    if (err || !course) {
      return res.status(404).send("Course not found.");
    }
    if (course.instructor_id !== req.session.userId) {
      return res.status(403).send("Access Denied.");
    }

    Course.delete(courseId, (err) => {
      if (err) {
        return res.status(500).send("Error deleting course.");
      }
      res.redirect("/courses/my-courses");
    });
  });
};

// Handle course search
exports.searchCourses = (req, res) => {
  const { q } = req.query; // Search term from the URL, e.g., /search?q=History

  if (!q) {
    // If search is empty, just show all courses
    return res.redirect("/courses");
  }

  Course.search(q, (err, courses) => {
    if (err) {
      console.error("Error during course search:", err);
      return res.status(500).send("Error searching for courses.");
    }

    // Render the results page with the found courses
    res.render("courses/search-results", {
      title: `Search Results for "${q}"`,
      courses: courses,
      searchTerm: q,
    });
  });
};
