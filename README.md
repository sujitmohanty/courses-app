# Comprehensive Guide: Building the Student Course Management System

This document provides a complete, chronological guide to building the Student Course Management System from scratch using Express.js, EJS, and SQLite. It covers project setup, authentication, course management, search functionality, and production-readiness features.

---

## Part 1: Project Setup & Scaffolding

We begin by setting up the foundational structure for our project.

### 1. Create the Project Directory

First, open your terminal and create a new directory for your project, then navigate into it.

```bash
mkdir student-course-management
cd student-course-management
```

### 2. Initialize the Node.js Project

Initialize a new Node.js project to create a `package.json` file, which will manage our project's dependencies and scripts.

```bash
npm init -y
```

### 3. Create the Folder Structure

A well-organized folder structure is key to a maintainable application.

```bash
mkdir config public views controllers models routes middleware
```

- `config/`: For configuration files, like our database setup.
- `public/`: For static assets like CSS and client-side JavaScript.
- `views/`: For our EJS templates that will be rendered into HTML.
- `controllers/`: Contains the logic for handling requests and responses.
- `models/`: For our data models that interact with the SQLite database.
- `routes/`: Defines the application's URL endpoints.
- `middleware/`: For custom middleware functions (e.g., authentication, validation).

### 4. Install Dependencies

Install the necessary npm packages for our application.

```bash
npm install express ejs sqlite3 express-session connect-sqlite3 bcrypt dotenv
```

- `express`: The web framework for Node.js.
- `ejs`: The templating engine.
- `sqlite3`: The driver for our SQLite database.
- `express-session`: For managing user sessions.
- `connect-sqlite3`: A session store for `express-session` that uses SQLite.
- `bcrypt`: A library for hashing user passwords.
- `dotenv`: To manage environment variables from a `.env` file.

Install `nodemon` as a development dependency to automatically restart the server on file changes.

```bash
npm install --save-dev nodemon
```

### 5. Create the Main Application File

Create the entry point for our application, `app.js`, in the root directory.

```bash
touch app.js
```

### 6. Update `package.json`

Add `start` and `dev` scripts to your `package.json` file.

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
},
```

---

## Part 2: Express Server and Database Setup

Now we'll configure the server and initialize our database.

### 1. Create the Database Configuration

Create `config/database.js`. This script connects to our SQLite database and creates the necessary tables if they don't exist.

```javascript
// config/database.js
const sqlite3 = require("sqlite3").verbose();

const DBSOURCE = "db.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Connected to the SQLite database.");
    db.serialize(() => {
      db.run(`CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT UNIQUE,
                password TEXT,
                role TEXT NOT NULL CHECK(role IN ('student', 'instructor', 'admin')),
                CONSTRAINT email_unique UNIQUE (email)
            )`);
      db.run(`CREATE TABLE IF NOT EXISTS courses (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                instructor_id INTEGER,
                FOREIGN KEY (instructor_id) REFERENCES users(id)
            )`);
    });
  }
});

module.exports = db;
```

### 2. Set Up the Express Server in `app.js`

Populate `app.js` with the initial server configuration.

```javascript
// app.js
const express = require("express");
const path = require("path");
const session = require("express-session");
const SQLiteStore = require("connect-sqlite3")(session);
require("dotenv").config();

const db = require("./config/database");

const app = express();
const PORT = process.env.PORT || 3000;

// Set view engine and views directory
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Serve static files and enable parsers
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Session middleware
app.use(
  session({
    store: new SQLiteStore({ db: "sessions.sqlite", dir: "./config" }),
    secret: process.env.SESSION_SECRET || "a-very-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 1 day
  })
);

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
```

### 3. Create Environment and Gitignore Files

Create a `.env` file for your session secret and a `.gitignore` file to exclude sensitive files and `node_modules` from version control.

**`.env` file:**

```
SESSION_SECRET=your-super-secret-and-long-string-for-sessions
```

**`.gitignore` file:**

```
node_modules
.env
db.sqlite
config/sessions.sqlite
```

---

## Part 3: User Authentication

Let's implement user registration, login, and logout functionality.

### 1. Create the User Model

Create `models/user.js` to handle user-related database operations, including password hashing with `bcrypt`.

```javascript
// models/user.js
const db = require("../config/database");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const User = {
  create: (name, email, password, role, callback) => {
    bcrypt.hash(password, saltRounds, (err, hash) => {
      if (err) return callback(err);
      const sql =
        "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";
      db.run(sql, [name, email, hash, role], function (err) {
        callback(err, { id: this.lastID });
      });
    });
  },
  findByEmail: (email, callback) => {
    db.get("SELECT * FROM users WHERE email = ?", [email], (err, row) =>
      callback(err, row)
    );
  },
  findById: (id, callback) => {
    db.get("SELECT * FROM users WHERE id = ?", [id], (err, row) =>
      callback(err, row)
    );
  },
  comparePassword: (password, hash, callback) => {
    bcrypt.compare(password, hash, (err, isMatch) => {
      if (err) return callback(err);
      callback(null, isMatch);
    });
  },
};

module.exports = User;
```

### 2. Create the Authentication Controller

Create `controllers/authController.js` to handle the logic for registration and login.

```javascript
// controllers/authController.js
const User = require("../models/user");

exports.getRegister = (req, res) =>
  res.render("register", { title: "Register" });

exports.postRegister = (req, res) => {
  const { name, email, password, role } = req.body;
  User.findByEmail(email, (err, user) => {
    if (user)
      return res.status(400).send("User with this email already exists.");
    User.create(name, email, password, role, (err, newUser) => {
      if (err) return res.status(500).send("Error registering user.");
      res.redirect("/auth/login");
    });
  });
};

exports.getLogin = (req, res) => res.render("login", { title: "Login" });

exports.postLogin = (req, res) => {
  const { email, password } = req.body;
  User.findByEmail(email, (err, user) => {
    if (err || !user) return res.status(401).send("Invalid credentials.");
    User.comparePassword(password, user.password, (err, isMatch) => {
      if (err || !isMatch) return res.status(401).send("Invalid credentials.");
      req.session.userId = user.id;
      req.session.role = user.role;
      res.redirect("/dashboard");
    });
  });
};

exports.getLogout = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send("Could not log out.");
    res.redirect("/");
  });
};
```

### 3. Create Authentication Routes

Create `routes/authRoutes.js` to define the authentication endpoints.

```javascript
// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.get("/register", authController.getRegister);
router.post("/register", authController.postRegister);
router.get("/login", authController.getLogin);
router.post("/login", authController.postLogin);
router.get("/logout", authController.getLogout);

module.exports = router;
```

### 4. Create Authentication Views

Create `views/register.ejs` and `views/login.ejs` with simple HTML forms.

### 5. Update `app.js`

Update `app.js` to use the new routes and add middleware to make user session info available to all views.

```javascript
// In app.js
const authRoutes = require("./routes/authRoutes");
const User = require("./models/user");

// Middleware to make user info available in all views
app.use((req, res, next) => {
  if (!req.session.userId) {
    res.locals.user = null;
    return next();
  }
  User.findById(req.session.userId, (err, user) => {
    if (err) {
      res.locals.user = null;
    } else {
      const { password, ...safeUser } = user;
      res.locals.user = safeUser;
    }
    next();
  });
});

app.use("/auth", authRoutes);

// Add placeholder dashboard route
app.get("/dashboard", (req, res) => {
  if (!req.session.userId) return res.redirect("/auth/login");
  res.render("dashboard", { title: "Dashboard" });
});
```

---

## Part 4: Course Management & Role-Based Dashboards

Now we'll implement core course management features.

### 1. Create Authorization Middleware

Create `middleware/authMiddleware.js` to restrict access based on user roles.

```javascript
// middleware/authMiddleware.js
exports.isAuthenticated = (req, res, next) => {
  if (req.session.userId) return next();
  res.redirect("/auth/login");
};

exports.isInstructor = (req, res, next) => {
  if (req.session.role === "instructor") return next();
  res.status(403).send("Access Denied: Instructors only.");
};
```

### 2. Create the Course Model

Create `models/course.js` to handle course data.

```javascript
// models/course.js
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
            SELECT c.id, c.title, c.description, u.name as instructorName
            FROM courses c JOIN users u ON c.instructor_id = u.id
        `;
    db.all(sql, [], (err, rows) => callback(err, rows));
  },
  findById: (id, callback) => {
    const sql = `
            SELECT c.id, c.title, c.description, c.instructor_id, u.name as instructorName
            FROM courses c JOIN users u ON c.instructor_id = u.id WHERE c.id = ?
        `;
    db.get(sql, [id], (err, row) => callback(err, row));
  },
};

module.exports = Course;
```

### 3. Create the Course Controller & Routes

Create `controllers/courseController.js` and `routes/courseRoutes.js` to manage course creation and viewing, protecting instructor-only routes with middleware.

### 4. Create Course Views and Update Dashboard

Create views for listing all courses (`views/courses/index.ejs`), creating a course (`views/courses/create.ejs`), and update `views/dashboard.ejs` to be role-aware, showing a "Create Course" link only to instructors.

---

## Part 5: Feature: Course Search and Homepage Overhaul

This section adds a vital search feature and redesigns the home page.

### 1. Update Course Model for Search

Add a `search` method to `models/course.js`.

```javascript
// In models/course.js, inside the Course object
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
```

### 2. Add Search to Course Controller

Add the `searchCourses` function to `controllers/courseController.js`.

```javascript
// In controllers/courseController.js
exports.searchCourses = (req, res) => {
  const { q } = req.query;
  if (!q) return res.redirect("/courses");
  Course.search(q, (err, courses) => {
    if (err) return res.status(500).send("Error searching for courses.");
    res.render("courses/search-results", {
      title: `Search Results for "${q}"`,
      courses: courses,
      searchTerm: q,
    });
  });
};
```

### 3. Add Search Route

Add a public search route to `routes/courseRoutes.js`.

```javascript
// In routes/courseRoutes.js
router.get("/search", courseController.searchCourses);
```

### 4. Create Search Results View

Create `views/courses/search-results.ejs` to display the found courses.

### 5. Overhaul Home Page

Replace the content of `views/home.ejs` with a new design that includes a navigation bar and the search form.

```html
<!-- views/home.ejs -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Student Course Management - <%= title %></title>
    <style>
      /* ... styles for new home page ... */
    </style>
  </head>
  <body>
    <header>
      <h2>CourseFlow</h2>
      <nav>
        <% if (user) { %>
        <a href="/dashboard">Dashboard</a>
        <a href="/auth/logout">Logout</a>
        <% } else { %>
        <a href="/auth/login">Login</a>
        <a href="/auth/register">Register</a>
        <% } %>
      </nav>
    </header>
    <div class="container">
      <section class="search-section">
        <h2>Search Courses</h2>
        <form action="/courses/search" method="GET" class="search-form">
          <input
            type="text"
            name="q"
            placeholder="Search by course title or instructor..."
            required
          />
          <button type="submit">Search</button>
        </form>
      </section>
    </div>
  </body>
</html>
```

---

## Part 6: Instructor Course Management (Edit/Delete)

This gives instructors full CRUD (Create, Read, Update, Delete) control over their courses.

### 1. Update Course Model for Edit/Delete

Add `update` and `delete` methods to `models/course.js`.

```javascript
// In models/course.js, inside the Course object
update: (id, title, description, callback) => {
    const sql = 'UPDATE courses SET title = ?, description = ? WHERE id = ?';
    db.run(sql, [title, description, id], (err) => callback(err));
},
delete: (id, callback) => {
    db.run('DELETE FROM courses WHERE id = ?', id, (err) => callback(err));
}
```

### 2. Update Course Controller and Routes

Add controller functions (`getEditCourse`, `postUpdateCourse`, `postDeleteCourse`) and corresponding routes (`/:id/edit`, `/:id/update`, `/:id/delete`) for handling course updates and deletions. These routes must be protected by the `isAuthenticated` and `isInstructor` middleware.

### 3. Create and Update Instructor Views

Create an `edit.ejs` view with a form to update course details. Update the `my-courses.ejs` view to include "Edit" and "Delete" buttons for each course, with a JavaScript confirmation dialog for the delete action.

---

## Part 7: Production Readiness Features

This section adds essential features for a secure and reliable production application.

### 1. Install New Dependencies

```bash
npm install morgan express-validator
```

### 2. Implement Request Logging

Add `morgan` as middleware in `app.js` to log all HTTP requests.

```javascript
// In app.js
const morgan = require("morgan");
app.use(morgan("dev"));
```

### 3. Implement Input Validation (server-side)

Create `middleware/validationMiddleware.js` using `express-validator` to build validation chains for user registration and course creation. Apply this middleware to the relevant POST routes to sanitize and validate user input, preventing common vulnerabilities.

```javascript
// middleware/validationMiddleware.js
const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  /* ... */
};

const validateRegistration = [, /* ...rules... */ handleValidationErrors];
const validateCourseCreation = [, /* ...rules... */ handleValidationErrors];

module.exports = { validateRegistration, validateCourseCreation };
```

### 4. Implement Input Validation (client-side)

Registration Page Example

```html
<input
  type="text"
  name="name"
  placeholder="Full Name"
  required
  minlength="2"
  maxlength="100"
/>
<input type="email" name="email" placeholder="Email" required />
<input
  type="password"
  name="password"
  placeholder="Password"
  required
  minlength="6"
/>
<select name="role" required>
  <option value="" disabled selected>Select a role</option>
  <option value="student">Student</option>
  <option value="instructor">Instructor</option>
</select>
```

Create Course Page Example

```html
<input
  type="text"
  name="title"
  placeholder="Course Title"
  required
  minlength="3"
  maxlength="100"
/>
<textarea
  name="description"
  rows="5"
  placeholder="Course Description"
  required
  minlength="10"
  maxlength="1000"
></textarea>
```

### 5. Create a Health Check Endpoint

Add a `/auth/health` endpoint that checks database connectivity and returns a status, which is essential for automated monitoring services.

### 6. Implement Graceful Shutdown

Update `app.js` to listen for `SIGTERM` and `SIGINT` signals. This ensures the server stops accepting new requests and closes the database connection cleanly before the process exits, preventing data corruption.

```javascript
// In app.js, at the end of the file
const server = app.listen(PORT, () => {
  /* ... */
});

const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log("HTTP server closed.");
    db.close((err) => {
      if (err) console.error("Error closing the database:", err.message);
      else console.log("Database connection closed.");
      process.exit(0);
    });
  });
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
```

---

## Part 8: Deploying to Render.com

The final step is to deploy it to a live production environment so it can be used from anywhere. We will use Render for this, as it offers a free tier for web services and makes deployment straightforward.

### 1. Prepare Your Application for Production

Before deploying, we need to make a few adjustments to ensure the application runs smoothly on Render's platform.

#### A. Modify the Database and Session Paths

Render's web services have an ephemeral filesystem, meaning any files you create (like our `db.sqlite`) will be lost on every deploy or restart. To fix this, Render provides "Disks," which are persistent storage volumes that we can attach to our service.

We need to tell our app to store the database and session files on this disk. Render mounts disks at a specific path, typically `/var/data`.

Update your `config/database.js` file:

```javascript
// config/database.js
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Use a persistent disk path in production, otherwise use local file
const dbPath =
  process.env.NODE_ENV === "production"
    ? path.join("/var/data", "db.sqlite")
    : "db.sqlite";

const DBSOURCE = dbPath;

const db = new sqlite3.Database(DBSOURCE, (err) => {
  // ... rest of the file remains the same
});
// ...
```

Update `app.js` file for the session store:

```javascript
// app.js
// ...
const sessionDbPath =
  process.env.NODE_ENV === "production" ? "/var/data" : "./config";

app.use(
  session({
    store: new SQLiteStore({
      db: "sessions.sqlite",
      dir: sessionDbPath, // Use the new path
    }),
    // ... rest of the session config remains the same
  })
);
// ...
```

#### B. Update `package.json`

Render uses the `npm start` command to run your application. Ensure your `scripts` section in `package.json` is correct. The one we created earlier is perfect.

```json
"scripts": {
  "start": "node app.js",
  "dev": "nodemon app.js"
},
```

Render also needs to know which version of Node.js to use. Add an `engines` block to your `package.json`:

```json
{
  "name": "student-course-management",
  "version": "1.0.0",
  // ...
  "main": "app.js",
  "scripts": { "...": "..." },
  "engines": {
    "node": ">=18.0.0"
  }
  // ...
}
```

### 2. Push Code to GitHub

Render deploys applications directly from a GitHub repository.

1.  **Create a GitHub Repository:** Go to GitHub and create a new, public or private repository. Do not initialize it with a README or .gitignore.

2.  **Initialize Git in Your Project:** If you haven't already, open your terminal in the project root and run:

    ```bash
    git init
    git add .
    git commit -m "Initial commit of student management system"
    ```

3.  **Link and Push to GitHub:** Follow the instructions on your new GitHub repository page to link the local project and push the code. It will look something like this:
    ```bash
    git remote add origin [https://github.com/your-username/your-repo-name.git](https://github.com/your-username/your-repo-name.git)
    git branch -M main
    git push -u origin main
    ```

### 3. Deploy on Render.com

1.  **Sign up/Log in:** Go to [Render.com](https://render.com/) and create an account or log in.
2.  **Create a New Web Service:** On your dashboard, click **New +** and select **Web Service**.
3.  **Connect Your Repository:** Connect your GitHub account to Render and select the repository you just created. Click **Connect**.
4.  **Configure the Service:**

    - **Name:** Give your service a unique name (e.g., `student-course-app`). This will be part of your URL.
    - **Region:** Choose a region closest to you.
    - **Branch:** Ensure it's set to `main`.
    - **Root Directory:** Leave this blank if your `package.json` is in the root.
    - **Runtime:** Select **Node**.
    - **Build Command:** `npm install` (this is usually the default).
    - **Start Command:** `node app.js` (this should be auto-filled from your `package.json`).
    - **Instance Type:** Select the **Free** plan.

5.  **Add a Persistent Disk:**

    - Scroll down and click **Advanced**.
    - Click **Add Disk**.
    - **Name:** Give it a name, like `data-storage`.
    - **Mount Path:** Set this to `/var/data`. This is the crucial step that links our code changes to Render's persistent storage.
    - **Size (GB):** 1 is more than enough.

6.  **Add Environment Variables:**

    - Still in the Advanced section, click **Add Environment Variable**.
    - **Key:** `NODE_ENV`, **Value:** `production`
    - Click **Add Environment Variable** again.
    - **Key:** `SESSION_SECRET`, **Value:** `paste_a_new_long_random_secret_string_here`
      - _Do not reuse the one from your `.env` file. Generate a new one for production._

7.  **Deploy!**
    - Scroll to the bottom and click **Create Web Service**.

Render will now pull the code from GitHub, run `npm install`, and start the application. The deployment progress can be seen in the logs. The first deployment might take a few minutes as it needs to set up the disk.

Once the logs say "Your service is live," the application is running! One can visit it using the URL provided at the top of your Render service page (e.g., `https://student-course-app.onrender.com`).

---

[📘 Documentation](https://www.notion.so/sujit-mohanty/Building-the-Student-Course-Management-System-229d6f072d9e8023bffedf3667e8f6c5)
