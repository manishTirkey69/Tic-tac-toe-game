const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const app = express();
const port = 3000;
const ipAddr = "0.0.0.0";

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize SQLite database
const db = new sqlite3.Database("database.sqlite", (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    initializeDatabase();
  }
});

// Initialize database schema
function initializeDatabase() {
  db.run(`CREATE TABLE IF NOT EXISTS players (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        symbol TEXT NOT NULL,
        score INTEGER NOT NULL
    )`);
}

// API to get player scores
app.get("/scores", (req, res) => {
  db.all(`SELECT name, symbol, score FROM players`, [], (err, rows) => {
    if (err) {
      res.status(400).json({ error: err.message });
      return;
    }
    res.json({
      message: "success",
      data: rows,
    });
  });
});

// API to add/update player scores
app.post("/scores", (req, res) => {
  const { name, symbol, score } = req.body;
  db.run(
    `INSERT INTO players (name, symbol, score) VALUES (?, ?, ?)`,
    [name, symbol, score],
    function (err) {
      if (err) {
        res.status(400).json({ error: err.message });
        return;
      }
      res.json({
        message: "success",
        data: { id: this.lastID, name, symbol, score },
      });
    }
  );
});

// Start the server
app.listen(port, ipAddr, () => {
  console.log(`Server running on port: http://${ipAddr}:${port}`);
});
