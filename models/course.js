const db = require("../config/database");

const Course = {
  // Create a new course
  create: (title, description, instructorId, callback) => {
    const sql =
      "INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)";
    db.run(sql, [title, description, instructorId], function (err) {
      callback(err, { id: this.lastID });
    });
  },

  // Find all courses and join with user table to get instructor name
  findAll: (callback) => {
    const sql = `
            SELECT courses.id, courses.title, courses.description, users.name as instructorName
            FROM courses
            JOIN users ON courses.instructor_id = users.id
        `;
    db.all(sql, [], (err, rows) => {
      callback(err, rows);
    });
  },

  // Find a single course by its ID
  findById: (id, callback) => {
    const sql = `
            SELECT courses.id, courses.title, courses.description, users.name as instructorName
            FROM courses
            JOIN users ON courses.instructor_id = users.id
            WHERE courses.id = ?
        `;
    db.get(sql, [id], (err, row) => {
      callback(err, row);
    });
  },

  // Find all courses by a specific instructor
  findByInstructorId: (instructorId, callback) => {
    const sql = "SELECT * FROM courses WHERE instructor_id = ?";
    db.all(sql, [instructorId], (err, rows) => {
      callback(err, rows);
    });
  },

  // Update a course's details
  update: (id, title, description, callback) => {
    const sql = "UPDATE courses SET title = ?, description = ? WHERE id = ?";
    db.run(sql, [title, description, id], function (err) {
      callback(err);
    });
  },

  // Delete a course
  delete: (id, callback) => {
    const deleteCourseSql = "DELETE FROM courses WHERE id = ?";
    db.run(deleteCourseSql, id, function (err) {
      callback(err); // Pass final error status back
    });
  },

  // Search for courses by title or instructor name
  search: (searchTerm, callback) => {
    const sql = `
            SELECT courses.id, courses.title, courses.description, users.name as instructorName
            FROM courses
            JOIN users ON courses.instructor_id = users.id
            WHERE courses.title LIKE ? OR users.name LIKE ?
        `;
    // The '%' are wildcards, so the search term can appear anywhere in the title or name
    const searchQuery = `%${searchTerm}%`;
    db.all(sql, [searchQuery, searchQuery], (err, rows) => {
      callback(err, rows);
    });
  },
};

module.exports = Course;
