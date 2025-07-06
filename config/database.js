const sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    // Use serialize to ensure table creation happens in order
    db.serialize(() => {
      // Create Users table
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'admin')),
                CONSTRAINT email_unique UNIQUE (email)
            )`,
        (err) => {
          if (err) {
            // Table already created
            console.log("Users table already exists.");
          } else {
            console.log("Users table created.");
          }
        }
      );

      // Create Courses table
      db.run(
        `CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                instructor_id INTEGER,
                FOREIGN KEY (instructor_id) REFERENCES users(id)
            )`,
        (err) => {
          if (err) {
            console.log("Courses table already exists.");
          } else {
            console.log("Courses table created.");
          }
        }
      );
    });
  }
});

module.exports = db;
