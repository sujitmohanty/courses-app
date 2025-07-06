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
};

module.exports = Course;
