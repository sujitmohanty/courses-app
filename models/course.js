const db = require("../config/database");

const Course = {
  create: (title, description, instructorId, callback) => {
    const sql =
      "INSERT INTO courses (title, description, instructor_id) VALUES (?, ?, ?)";
    db.run(sql, [title, description, instructorId], function (err) {
      callback(err, { id: this.lastID });
    });
  },

  findAll: (callback) => {
    const sql = `
            SELECT courses.id, courses.title, courses.description, users.name as instructorName
            FROM courses
            JOIN users ON courses.instructor_id = users.id
        `;
    db.all(sql, [], (err, rows) => callback(err, rows));
  },

  findById: (id, callback) => {
    const sql = `
            SELECT 
                courses.id, 
                courses.title, 
                courses.description, 
                courses.instructor_id,
                users.name as instructorName
            FROM courses
            JOIN users ON courses.instructor_id = users.id
            WHERE courses.id = ?
        `;
    db.get(sql, [id], (err, row) => {
      callback(err, row);
    });
  },

  findByInstructorId: (instructorId, callback) => {
    const sql = "SELECT * FROM courses WHERE instructor_id = ?";
    db.all(sql, [instructorId], (err, rows) => {
      callback(err, rows);
    });
  },

  update: (id, title, description, callback) => {
    const sql = "UPDATE courses SET title = ?, description = ? WHERE id = ?";
    db.run(sql, [title, description, id], function (err) {
      callback(err);
    });
  },

  // THIS IS THE CORRECTED DELETE FUNCTION
  delete: (id, callback) => {
    // This function now only deletes from the courses table.
    const sql = "DELETE FROM courses WHERE id = ?";
    db.run(sql, id, function (err) {
      callback(err);
    });
  },

  search: (searchTerm, callback) => {
    const sql = `
            SELECT courses.id, courses.title, courses.description, users.name as instructorName
            FROM courses
            JOIN users ON courses.instructor_id = users.id
            WHERE courses.title LIKE ? OR users.name LIKE ?
        `;
    const searchQuery = `%${searchTerm}%`;
    db.all(sql, [searchQuery, searchQuery], (err, rows) => callback(err, rows));
  },
};

module.exports = Course;
