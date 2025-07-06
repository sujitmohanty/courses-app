// Checks if user is authenticated
exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect("/auth/login");
  }
};

// Checks if user is an instructor
exports.isInstructor = (req, res, next) => {
  if (req.session.role === "instructor") {
    next();
  } else {
    res.status(403).send("Access Denied: Instructors only.");
  }
};

// Checks if user is a student
exports.isStudent = (req, res, next) => {
  if (req.session.role === "student") {
    next();
  } else {
    res.status(403).send("Access Denied: Students only.");
  }
};
