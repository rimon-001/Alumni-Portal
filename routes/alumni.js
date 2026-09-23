const express = require('express');
const router = express.Router();
const db = require('../db/database');
const verifyToken = require('../middleware/auth');

router.get('/', (req, res) => {
  const { status } = req.query;
  const sql = status === 'all' 
    ? `SELECT * FROM alumni ORDER BY id DESC` 
    : `SELECT * FROM alumni WHERE status = 'Approved' ORDER BY id DESC`;

  db.all(sql, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

router.get('/:id', (req, res) => {
  db.get(`SELECT * FROM alumni WHERE id = ? OR reg_no = ?`, [req.params.id, req.params.id], (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!row) return res.status(404).json({ error: 'Alumnus record not found.' });
    res.json(row);
  });
});

router.post('/register', (req, res) => {
  const { name, reg_no, email, phone, batch, dept, address, avatar } = req.body;
  if (!name || !reg_no || !email || !batch || !dept) {
    return res.status(400).json({ error: 'Required fields missing.' });
  }

  const defaultAvatar = avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80';
  const stmt = `INSERT INTO alumni (name, reg_no, email, phone, batch, dept, address, avatar, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pending')`;

  db.run(stmt, [name, reg_no, email, phone, batch, dept, address, defaultAvatar], function(err) {
    if (err) {
      if (err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'This registration number is already registered.' });
      }
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Registration submitted successfully!' });
  });
});

router.patch('/:id/status', verifyToken, (req, res) => {
  const { status } = req.body;
  db.run(`UPDATE alumni SET status = ? WHERE id = ?`, [status, req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Status updated' });
  });
});

router.delete('/:id', verifyToken, (req, res) => {
  db.run(`DELETE FROM alumni WHERE id = ?`, [req.params.id], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Deleted' });
  });
});

module.exports = router;
