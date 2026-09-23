const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/auth');

router.get('/', (req, res) => {
  db.all(`SELECT * FROM gallery ORDER BY id DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.post('/', verifyToken, (req, res) => {
  const { title, category, sub_label, url } = req.body;
  db.run(
    `INSERT INTO gallery (title, category, sub_label, url) VALUES (?, ?, ?, ?)`,
    [title, category, sub_label, url],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({ id: this.lastID, message: 'Photo added' });
    }
  );
});

router.delete('/:id', verifyToken, (req, res) => {
  db.run(`DELETE FROM gallery WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Photo removed' });
  });
});

module.exports = router;
