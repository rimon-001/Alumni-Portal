const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/auth');

router.get('/', (req, res) => {
  db.all(`SELECT * FROM events ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', verifyToken, (req, res) => {
  const { title, category, event_date, location, description, image } = req.body;
  db.run(
    `INSERT INTO events (title, category, event_date, location, description, image) VALUES (?, ?, ?, ?, ?, ?)`,
    [title, category, event_date, location, description, image],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Event created' });
    }
  );
});

router.delete('/:id', verifyToken, (req, res) => {
  db.run(`DELETE FROM events WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;
