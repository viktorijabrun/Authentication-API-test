const express = require("express");
const bcrypt = require("bcrypt");
const { Pool } = require("pg");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const app = express();
const PORT = 3000;
const SECRET_KEY = "your_secret_key"; // Replace with a strong secret key

app.use(bodyParser.json());

// PostgreSQL pool configuration
const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "authentication-db",
  password: "postgres",
  port: 5432, // Default PostgreSQL port
});

// Create users table if it doesn't exist
(async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      surname VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
})();

// Middleware to verify JWT token
function authenticateToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "Forbidden" });
    req.user = user;
    next();
  });
}

// Register user
const moment = require("moment-timezone");

app.post("/register", async (req, res) => {
  const { email, surname, title, password } = req.body;
  if (!email || !surname || !title || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (email, surname, title, password) VALUES ($1, $2, $3, $4) RETURNING *`,
      [email, surname, title, hashedPassword]
    );

    const user = result.rows[0];

    // Convert timestamps to Europe/Vilnius timezone
    user.created_at = moment(user.created_at)
      .tz("Europe/Vilnius")
      .format("YYYY-MM-DD HH:mm:ss");
    user.updated_at = moment(user.updated_at)
      .tz("Europe/Vilnius")
      .format("YYYY-MM-DD HH:mm:ss");

    res.status(201).json({
      message: "User registered successfully",
      user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error registering user" });
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY, {
      expiresIn: "1h",
    });
    res.json({ message: "Login successful", token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error logging in" });
  }
});

// Update user email and title

app.put("/users/:id", authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { email, title } = req.body;

  if (!email && !title) {
    return res
      .status(400)
      .json({ message: "Email or title is required to update" });
  }

  try {
    const fields = [];
    const values = [];

    if (email) {
      fields.push("email = $" + (fields.length + 1));
      values.push(email);
    }

    if (title) {
      fields.push("title = $" + (fields.length + 1));
      values.push(title);
    }

    values.push(id);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(
        ", "
      )}, updated_at = CURRENT_TIMESTAMP WHERE id = $${
        fields.length + 1
      } RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = result.rows[0];

    // Convert timestamps to Europe/Vilnius timezone
    user.created_at = moment(user.created_at)
      .tz("Europe/Vilnius")
      .format("YYYY-MM-DD HH:mm:ss");
    user.updated_at = moment(user.updated_at)
      .tz("Europe/Vilnius")
      .format("YYYY-MM-DD HH:mm:ss");

    res.json({ message: "User updated successfully", user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating user" });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
