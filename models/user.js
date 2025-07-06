const db = require("../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = {
  // Create a new user
  create: (name, email, password, role, callback) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) {
        return callback(err);
      }
      const sql =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      db.run(sql, [name, email, hash, role], function (err) {
        callback(err, { id: this.lastID });
      });
    });
  },

  // Find a user by their email
  findByEmail: (email, callback) => {
    const sql = "SELECT * FROM users WHERE email = ?";
    db.get(sql, [email], (err, row) => {
      callback(err, row);
    });
  },

  // Find a user by their ID
  findById: (id, callback) => {
    const sql = "SELECT * FROM users WHERE id = ?";
    db.get(sql, [id], (err, row) => {
      callback(err, row);
    });
  },

  // Compare password for login
  comparePassword: (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) {
        return callback(err);
      }
      callback(null, isMatch);
    });
  },
};

module.exports = User;
